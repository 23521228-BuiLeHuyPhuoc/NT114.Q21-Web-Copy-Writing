# Giải thích 3 luồng chính kèm file code phụ trách

Tài liệu này dùng để báo cáo đồ án. Nội dung được viết cho người chưa biết code vẫn hiểu được luồng, nhưng mỗi bước đều có thêm file/hàm code đang đảm nhiệm để dễ chỉ vào source.

Ba luồng chính:

1. Generate: tạo bài quảng cáo bằng AI.
2. Check đạo văn: kiểm tra bài viết có giống nguồn khác không.
3. Fine-tuning: dạy AI viết theo phong cách riêng.

## Khái niệm nền

| Khái niệm | Hiểu đơn giản | Trong project là gì |
| --- | --- | --- |
| Frontend | Phần người dùng nhìn thấy và thao tác | Các file trong `frontend/src/app`, ví dụ `Generator.tsx`, `PlagiarismCheck.tsx`, `FineTuningStudio.tsx` |
| Backend | Phần xử lý phía sau | Các file trong `backend/src`, ví dụ route, controller, service |
| API | Đường gửi yêu cầu từ frontend xuống backend | Ví dụ `POST /api/contents/generate` |
| Database | Kho lưu dữ liệu | MongoDB models như `Content`, `UsageLog`, `PlagiarismReport`, `FineTuneJob` |
| Prompt | Câu yêu cầu gửi cho AI | Frontend build prompt từ brief người dùng |
| Provider AI | Nơi cung cấp AI thật sự | Gemini, OpenAI, Groq, Vertex AI, Claude |
| Quota | Giới hạn sử dụng theo gói | Số lượt generate, token, model được phép dùng, quyền fine-tune |

Backend mount các API chính trong `backend/src/app.js`:

```js
app.use('/api/contents', contentRoutes);
app.use('/api/plagiarism', plagiarismRoutes);
app.use('/api/fine-tune', fineTuneRoutes);
```

## Cách đọc tài liệu này khi báo cáo

Đừng đọc theo kiểu thuộc lòng code. Hãy đọc mỗi chức năng theo 4 tầng:

1. Màn hình: người dùng bấm nút hoặc nhập dữ liệu ở đâu.
2. Gửi API: frontend dùng file nào để gửi yêu cầu xuống backend.
3. Xử lý backend: backend nhận request, kiểm tra, rồi xử lý logic chính ở đâu.
4. Lưu dữ liệu: kết quả cuối cùng được lưu vào model database nào.

Khi cô hỏi "chức năng này code ở đâu?", có thể trả lời theo mẫu:

```text
Giao diện nằm ở file ...
Frontend gửi API qua file ...
Backend nhận API ở route ...
Controller chỉ chuyển request vào service ...
Logic chính nằm trong service ...
Kết quả được lưu ở model ...
```

## Bản đồ code nhìn nhanh

| Luồng | Người dùng thao tác ở | Frontend gửi request bằng | Backend nhận ở | Logic chính xử lý ở | Gọi AI/nguồn ngoài ở | Lưu vào database model |
| --- | --- | --- | --- | --- | --- | --- |
| Generate | `frontend/src/app/generate/Generator.tsx` | `useContents.ts` -> `contentService.ts` | `backend/src/routes/user/contentRoutes.js` | `backend/src/services/contentService.js` | `backend/src/services/aiService.js` | `Content`, `UsageLog` |
| Check đạo văn | `frontend/src/app/plagiarism-check/PlagiarismCheck.tsx` | `usePlagiarism.ts` -> `plagiarismService.ts` | `backend/src/routes/user/plagiarismRoutes.js` | `backend/src/services/plagiarismService.js` | `commonCrawlService.js`, file upload service | `PlagiarismReport` |
| Fine-tuning | `frontend/src/app/fine-tune/FineTuningStudio.tsx` | `useFineTuning.ts` -> `fineTuningService.ts` | `backend/src/routes/user/fineTuneRoutes.js` | `backend/src/services/fineTuneService.js` | OpenAI/Vertex/script Python | `FineTuneDataset`, `FineTuneExample`, `FineTuneJob`, `FineTuneMetric`, `FineTunedModel` |

## Công thức chung của một request trong project

Hầu hết chức năng trong project đi theo đường này:

```text
File màn hình .tsx
-> hook React Query trong frontend/src/hooks/queries
-> service frontend trong frontend/src/services
-> route backend trong backend/src/routes
-> controller backend trong backend/src/controllers
-> service backend trong backend/src/services
-> model database trong backend/src/models
```

Hiểu đơn giản:

```text
Màn hình nhận thao tác
-> người đưa thư gửi yêu cầu
-> cửa backend nhận yêu cầu
-> người điều phối chuyển việc
-> phòng xử lý làm thật
-> kho dữ liệu lưu kết quả
```

---

# 1. Luồng Generate Content

## Generate là gì?

Generate là chức năng người dùng nhập yêu cầu, hệ thống gửi yêu cầu đó cho AI, AI viết bài quảng cáo, rồi hệ thống lưu bài viết lại.

Ví dụ người dùng nhập:

```text
Ngành: mỹ phẩm
Loại bài: quảng cáo Facebook
Tone: sang trọng
Sản phẩm: son dưỡng môi
Khách hàng: nữ 18-25 tuổi
```

Hệ thống sẽ biến thông tin này thành prompt rõ ràng hơn rồi gửi cho AI.

## Luồng Generate dễ hiểu

```text
Người dùng nhập brief
-> frontend gom brief thành prompt
-> backend kiểm tra đăng nhập, dữ liệu, gói, quota
-> backend chọn model/provider AI
-> AI tạo bài viết
-> backend lưu bài viết và usage
-> frontend hiển thị kết quả
```

Nói bằng ví dụ đời thường:

```text
Người dùng = khách hàng đưa yêu cầu viết bài
Frontend = quầy tiếp nhận yêu cầu
Backend = phòng xử lý, kiểm tra quyền và gửi việc đi
AI provider = người viết bài
Database = kho lưu bài viết
```

## Đoạn nói cô đọng cho Generate: gọi API và gọi AI như nào?

Đoạn này dùng để nói nhanh với cô trong khoảng 45 giây:

```text
Ở chức năng Generate, frontend không gọi trực tiếp Gemini hay OpenAI. Người dùng nhập brief trên màn hình `Generator.tsx`, sau đó hàm `buildPrompt()` ghép brief thành prompt hoàn chỉnh. Khi bấm Generate, `handleGenerate()` gọi hook `useGenerateContent()`, hook này gọi `contentService.generate()`. File service frontend gửi request `POST /contents/generate` xuống backend; nếu tính cả base `/api` thì API đầy đủ là `POST /api/contents/generate`.

Backend nhận request ở `contentRoutes.js`, validate dữ liệu, rồi controller `contentController.generateContent()` chuyển sang `contentService.generateContent()`. Service này kiểm tra option, project, template, gói sử dụng và quota. Sau khi hợp lệ, backend mới gọi AI qua `aiService.generateCopy()`. Kết quả AI trả về được lưu vào `Content`, còn token/quota được lưu vào `UsageLog`.
```

Đường đi API cần nhớ:

```text
Bấm Generate
-> `Generator.tsx` / `handleGenerate()`
-> `useContents.ts` / `useGenerateContent()`
-> `contentService.ts` / `contentService.generate()`
-> `POST /contents/generate` ở frontend, tương ứng `/api/contents/generate` trên backend
-> `contentRoutes.js` / `router.post('/generate', ...)`
-> `contentController.js` / `generateContent()`
-> `contentService.js` / `generateContent()`
-> `aiService.js` / `generateCopy()`
-> lưu `Content` và `UsageLog`
```

Nếu cô hỏi "vì sao frontend không gọi AI trực tiếp?", trả lời:

| Ý cần nói | Giải thích ngắn |
| --- | --- |
| Bảo mật API key | API key của Gemini/OpenAI/Vertex nằm ở backend, không để lộ trên trình duyệt. |
| Kiểm soát quyền | Backend kiểm tra user đăng nhập, gói sử dụng và model được phép dùng. |
| Kiểm soát quota | Backend tính token/lượt dùng trước và sau khi generate. |
| Lưu lịch sử | Backend lưu bài viết vào `Content` và lưu lượt dùng vào `UsageLog`. |

Payload frontend gửi xuống backend thường có các thông tin chính:

| Trường | Nghĩa đơn giản |
| --- | --- |
| `prompt` | Yêu cầu đã được ghép từ brief người dùng. |
| `type` | Loại nội dung muốn tạo, ví dụ social/email/ads. |
| `industry` | Ngành hàng. |
| `tone` | Giọng văn. |
| `language` | Ngôn ngữ đầu ra. |
| `model` | Model AI được chọn. |
| `modelMode`, `fineTunedModelId` | Cho biết dùng model thường hay model đã fine-tune. |
| `templateId`, `projectId` | Gắn bài viết với template/project nếu có. |

Pseudo-code dễ hiểu:

```text
function generate() {
  prompt = buildPrompt(brief)
  gửi prompt xuống backend
  backend kiểm tra quyền + quota
  backend chọn model AI
  output = gọi AI tạo bài viết
  lưu output vào Content
  lưu token/quota vào UsageLog
  trả output về màn hình
}
```

## Đoạn nói cô đọng cho thuật toán chấm chất lượng nội dung Generate

Đoạn này dùng để nói nhanh với cô trong khoảng 60 giây:

```text
Sau khi AI generate xong, hệ thống còn tính thêm điểm chất lượng cho nội dung. Điểm này không phải do Gemini/OpenAI tự chấm, mà do frontend tự tính bằng hàm `scoreGeneratedContent()` trong `frontend/src/lib/contentQuality.ts`.

Ở màn hình Generate, sau khi backend trả bài viết về, `Generator.tsx` tách các phiên bản kết quả rồi gọi `scoreGeneratedContent()` cho từng phiên bản để hiển thị điểm CL %. Khi xem lại content đã lưu, `contentService.ts` cũng gọi lại hàm này trong `normalizeContent()` để tính điểm hiển thị trên danh sách/dashboard.

Thuật toán chấm theo thang 0-100: cộng điểm nếu nội dung bám brief, đúng format theo loại bài, có CTA/lợi ích, dễ đọc, đúng độ dài và đủ cụ thể; sau đó trừ điểm nếu nội dung chỉ lặp lại prompt hoặc quá chung chung.
```

Công thức tổng quát trong code:

```text
qualityScore =
  relevance
+ format
+ actionability
+ readability
+ length
+ specificity
- promptEchoPenalty
- genericContentPenalty

Sau đó clamp về khoảng 0-100 và làm tròn.
```

Bảng điểm chính trong `scoreGeneratedContent()`:

| Nhóm điểm | Điểm tối đa | Hàm xử lý | Hiểu đơn giản |
| --- | --- | --- | --- |
| Bám brief/keyword | 20 | `scoreRelevance()` | Bài viết có nhắc đúng từ khóa, sản phẩm, khách hàng, ngữ cảnh người dùng nhập không. |
| Đúng format loại bài | 20 | `scoreFormat()` | Ví dụ social nên có hook/caption/hashtag/CTA, email nên có subject/preview/body/CTA. |
| Có hành động/lợi ích | 15 | `scoreActionability()` | Có CTA như mua ngay, đăng ký, liên hệ, nhận ưu đãi; có lợi ích như tiết kiệm, miễn phí, tăng/giảm. |
| Dễ đọc | 18 | `scoreReadability()` | Không quá ngắn, câu vừa phải, có xuống dòng/bullet, tiếng Việt có dấu, không bị lỗi ký tự. |
| Đúng độ dài | 15 | `scoreLength()` | So số từ với khoảng mong đợi theo loại bài và lựa chọn short/medium/long. |
| Cụ thể | 12 | `scoreSpecificity()` | Có số liệu, %, giá, miễn phí, bullet, từ khóa cụ thể, không lặp từ quá nhiều. |
| Trừ vì lặp prompt | Trừ tối đa 45 | `promptEchoPenalty()` | Nếu AI gần như copy lại prompt/yêu cầu thay vì viết nội dung thật thì bị trừ mạnh. |
| Trừ vì chung chung | Trừ tùy lỗi | `genericContentPenalty()` | Nếu bài có nhiều câu mơ hồ như "chất lượng cao", "giá cả hợp lý", "phù hợp mọi nhu cầu" thì bị trừ. |

Nếu cô hỏi "điểm chất lượng này dựa vào AI hay công thức?", trả lời:

```text
Điểm này là heuristic scoring, tức là công thức chấm điểm do project tự viết, không phải gọi AI lần hai để chấm. Hàm chính là `scoreGeneratedContent()` trong `frontend/src/lib/contentQuality.ts`. Nó kiểm tra nội dung bằng xử lý chuỗi: chuẩn hóa text, tách từ, so keyword, đếm số từ, nhận diện format, nhận diện CTA/lợi ích và trừ các lỗi thường gặp.
```

Pseudo-code dễ hiểu:

```text
function chamChatLuong(noiDung, brief) {
  nếu nội dung rỗng hoặc là lỗi hệ thống:
    trả 0

  điểm = 0
  điểm += bám từ khóa trong brief
  điểm += đúng cấu trúc loại bài
  điểm += có CTA và lợi ích
  điểm += dễ đọc, câu không quá dài, có format rõ
  điểm += đúng độ dài short/medium/long
  điểm += có chi tiết cụ thể như số liệu, %, ưu đãi

  điểm -= nếu nội dung chỉ nhắc lại prompt
  điểm -= nếu nội dung quá chung chung

  trả điểm từ 0 đến 100
}
```

Ví dụ để giải thích với cô:

```text
Nếu người dùng yêu cầu viết bài social cho son dưỡng môi, bài tốt sẽ được điểm cao khi có hook mở đầu, caption rõ, nhắc đúng sản phẩm/khách hàng, có lợi ích cụ thể, có CTA và độ dài vừa phải.
Nếu AI chỉ trả lại kiểu "hãy viết bài quảng cáo cho son dưỡng môi" hoặc viết toàn câu chung chung như "sản phẩm chất lượng cao, phù hợp mọi nhu cầu", hệ thống sẽ trừ điểm.
```

File/hàm liên quan:

| Việc | File/hàm |
| --- | --- |
| Hàm chấm điểm chính | `frontend/src/lib/contentQuality.ts` - `scoreGeneratedContent()` |
| Tính điểm ngay sau khi generate | `frontend/src/app/generate/Generator.tsx` - `handleGenerate()` |
| Tính lại điểm khi user sửa nội dung | `Generator.tsx` - `handleResultChange()` |
| Tính điểm khi load content đã lưu | `frontend/src/services/contentService.ts` - `normalizeContent()` |
| Hiển thị điểm CL trên kết quả | `frontend/src/app/components/generator/GeneratorResults.tsx` |

## Dùng mẫu copy/template khác gì Generate thường?

Đoạn này dùng để trả lời nếu cô hỏi "dùng mẫu copy khác gì với generate bình thường?":

```text
Dùng mẫu copy không phải là một luồng generate khác. Nó vẫn đi qua API generate bình thường: `POST /api/contents/generate`. Điểm khác là frontend gửi thêm `templateId`. Backend dùng `templateId` để lấy template trong database, rồi ghép `systemPrompt` của template vào prompt trước khi gọi AI.

Nói đơn giản: generate thường là đưa brief trực tiếp cho AI; generate với template là đưa brief cộng thêm một khung hướng dẫn/công thức viết có sẵn. Template giúp AI viết đúng cấu trúc, đúng loại bài và đúng phong cách hơn.
```

So sánh nhanh:

| Trường hợp | Frontend gửi gì? | Backend gửi prompt sang AI như nào? | Kết quả |
| --- | --- | --- | --- |
| Không dùng template | Gửi `prompt`, `type`, `tone`, `model`, ... và `templateId = null` | Gửi gần như prompt mà `Generator.tsx` đã build. | AI viết theo brief thủ công. |
| Có dùng template | Gửi các field generate như thường, nhưng thêm `templateId` | Backend lấy `template.systemPrompt`, rồi bọc cùng `User input`. | AI viết theo brief nhưng bị ràng buộc bởi mẫu/cấu trúc template. |

Prompt thường, hiểu đơn giản:

```text
Bạn là chuyên gia copywriting cho ngành mỹ phẩm.
Loại nội dung: social.
Tone: sang trọng.
Sản phẩm: son dưỡng môi.
Khách hàng: nữ 18-25 tuổi.
...
```

Prompt khi có template sẽ được backend bọc lại bằng `buildPromptWithTemplate()`:

```text
Template: <tên template>

System prompt:
<nội dung systemPrompt của template>

User input:
<prompt gốc được build từ brief người dùng>
```

Code phụ trách:

| Việc | File/hàm |
| --- | --- |
| Người dùng chọn template trên màn hình Generate | `frontend/src/app/generate/Generator.tsx` - `selectedTemplateId` |
| Frontend gửi thêm `templateId` khi generate | `Generator.tsx` - `handleGenerate()` |
| Service frontend gửi request generate | `frontend/src/services/contentService.ts` - `contentService.generate()` |
| Backend lấy template theo user | `backend/src/services/templateService.js` - `getTemplateForGenerate()` |
| Backend ghép template vào prompt | `backend/src/services/contentService.js` - `buildPromptWithTemplate()` |
| Backend tạo prompt cuối cùng gửi AI | `contentService.js` - `generateContent()` tạo `effectivePrompt` |
| Lưu bài viết có gắn template | `Content.create()` lưu `templateId` và `prompt: effectivePrompt` |
| Tăng số lần dùng template | `templateService.incrementTemplateUsage()` |

Điểm quan trọng khi báo cáo:

```text
Template không thay AI provider, không thay API generate, cũng không tự sinh nội dung riêng. Template chỉ thay cách đóng gói prompt trước khi gọi AI. Vì vậy nó giống như một khuôn hướng dẫn: cùng một brief nhưng nếu chọn template khác, prompt cuối cùng gửi sang AI sẽ khác, nên output có cấu trúc/phong cách khác.
```

Lưu ý nếu cô hỏi sâu về fine-tuned model:

```text
Trong code hiện tại, với generate thường/base model thì template được ghép bằng `buildPromptWithTemplate()`. Nhưng nếu dùng một số fine-tuned model, `resolveFineTunedModelForGenerate()` trả về `useRawPrompt`, lúc đó backend ưu tiên prompt raw/fine-tuned và không bọc thêm `systemPrompt` của template theo hàm `buildPromptWithTemplate()`. Nói ngắn gọn: template áp dụng rõ nhất cho generate thường; fine-tuned model có cơ chế prompt riêng.
```

Pseudo-code dễ hiểu:

```text
function generateCoTemplate(payload) {
  promptGoc = payload.prompt
  template = lấy_template(payload.templateId)

  nếu có template:
    promptGuiAI = "Template: " + template.name
               + "System prompt: " + template.systemPrompt
               + "User input: " + promptGoc
  nếu không có template:
    promptGuiAI = promptGoc

  output = gọi AI với promptGuiAI
  lưu Content gồm output, promptGuiAI, templateId
}
```
## Mở code Generate theo thứ tự khi báo cáo

| Thứ tự mở | File/hàm cần chỉ | Nói với cô bằng lời dễ hiểu |
| --- | --- | --- |
| 1 | `frontend/src/app/generate/Generator.tsx` | Đây là màn hình người dùng nhập brief và bấm Generate. |
| 2 | `Generator.tsx` - `buildPrompt()` | Hàm này gom thông tin người dùng nhập thành prompt gửi cho AI. |
| 3 | `Generator.tsx` - `handleGenerate()` | Hàm này chạy khi người dùng bấm nút Generate. |
| 4 | `frontend/src/hooks/queries/useContents.ts` - `useGenerateContent()` | Hook này quản lý request generate ở frontend. |
| 5 | `frontend/src/services/contentService.ts` - `contentService.generate()` | File này gửi API xuống backend. |
| 6 | `backend/src/routes/user/contentRoutes.js` | Route này là cửa nhận request generate của backend. |
| 7 | `backend/src/controllers/user/contentController.js` - `generateContent()` | Controller nhận request rồi gọi service xử lý. |
| 8 | `backend/src/services/contentService.js` - `generateContent()` | Đây là logic chính: kiểm tra option, quota, model, gọi AI và lưu kết quả. |
| 9 | `backend/src/services/aiService.js` - `generateCopy()` | File này gọi provider AI thật sự như Gemini/OpenAI/Groq/Vertex/Claude. |
| 10 | `backend/src/models/Content.js`, `backend/src/models/UsageLog.js` | `Content` lưu bài viết, `UsageLog` lưu lượt/token đã dùng. |

## Các bước Generate và code phụ trách

| Bước | Việc xảy ra | File/hàm phụ trách | Vai trò trong code |
| --- | --- | --- | --- |
| 1 | Người dùng nhập brief trên màn hình Generate | `frontend/src/app/generate/Generator.tsx` | Giao diện chọn ngành, loại bài, tone, sản phẩm, model, template, project. |
| 2 | Frontend tạo prompt từ brief | `Generator.tsx` - `buildPrompt()` | Ghép các lựa chọn thành câu yêu cầu chi tiết gửi cho AI. |
| 3 | Người dùng bấm nút Generate | `Generator.tsx` - `handleGenerate()` | Lấy dữ liệu form, gọi mutation generate. |
| 4 | React Query gọi service generate | `frontend/src/hooks/queries/useContents.ts` - `useGenerateContent()` | Quản lý request generate và cập nhật cache sau khi thành công. |
| 5 | Frontend gửi request xuống backend | `frontend/src/services/contentService.ts` - `contentService.generate()` | Gửi `POST /contents/generate`. |
| 6 | Backend nhận API generate | `backend/src/routes/user/contentRoutes.js` | Khai báo route `/generate`. |
| 7 | Backend kiểm tra user đăng nhập | `contentRoutes.js` - `protect('user')` | Chặn người chưa đăng nhập. |
| 8 | Backend kiểm tra body request | `backend/src/validations/contentValidation.js` - `generateContentSchema` | Kiểm tra prompt, type, tone, language, model, token. |
| 9 | Controller chuyển request vào service | `backend/src/controllers/user/contentController.js` - `generateContent()` | Lấy `req.user._id`, `req.body`, gọi service xử lý. |
| 10 | Kiểm tra ngành/type/tone còn active | `backend/src/services/contentService.js` - `ensureActiveGenerateOptions()` | Không cho generate bằng option đã bị admin tắt. |
| 11 | Kiểm tra project thuộc user | `contentService.js` gọi `projectService.ensureProjectBelongsToUser()` | Tránh user dùng project của người khác. |
| 12 | Lấy template nếu có | `contentService.js` gọi `templateService.getTemplateForGenerate()` | Ghép template vào prompt nếu user chọn template. |
| 13 | Kiểm tra gói có được dùng model không | `backend/src/services/billingService.js` - `ensureGenerateModelAllowed()` | Nếu model không nằm trong plan thì trả lỗi. |
| 14 | Kiểm tra còn quota không | `billingService.js` - `ensureGenerateQuotaAvailable()` | Kiểm tra lượt, token tháng, tuần, 5 giờ. |
| 15 | Nếu dùng fine-tuned model thì tìm model riêng | `contentService.js` - `resolveFineTunedModelForGenerate()` | Tìm `FineTunedModel`, job gốc, provider, endpoint/model id. |
| 16 | Backend gọi AI | `backend/src/services/aiService.js` - `generateCopy()` | Chọn Gemini/OpenAI/Groq/Vertex/Claude/FreeGPT4 hoặc fallback. |
| 17 | Lưu bài viết | `contentService.js` - `Content.create()`; `backend/src/models/Content.js` | Lưu prompt, outputText, type, tone, modelUsed, projectId, templateId. |
| 18 | Lưu lịch sử token/quota | `contentService.js` - `UsageLog.create()`; `backend/src/models/UsageLog.js` | Lưu token đã dùng, quotaUnits, model, trạng thái. |
| 19 | Frontend hiển thị kết quả | `Generator.tsx` - `splitGeneratedVariations()`, `setResults()` | Tách nhiều phiên bản và hiển thị trên UI. |
| 20 | Frontend cập nhật cache | `useContents.ts` - `onSuccess` của `useGenerateContent()` | Refresh contents, projects, templates, billing, notifications. |

## Dữ liệu được lưu trong Generate

| Dữ liệu | File model | Ý nghĩa |
| --- | --- | --- |
| Bài viết AI tạo ra | `backend/src/models/Content.js` | Lưu nội dung đã generate. |
| Lịch sử sử dụng | `backend/src/models/UsageLog.js` | Lưu token/quota/model đã dùng. |

## Câu báo cáo mẫu cho luồng Generate

```text
Ở luồng Generate, người dùng nhập brief tại `Generator.tsx`. Frontend dùng `buildPrompt()` để tạo prompt và gọi `contentService.generate()`. Backend nhận request ở `contentRoutes.js`, controller `contentController.generateContent()` chuyển sang `contentService.generateContent()`. Service kiểm tra option, project, template, plan và quota, sau đó gọi AI qua `aiService.generateCopy()`. Kết quả được lưu vào `Content`, còn token/quota được lưu vào `UsageLog`.
```

## Lỗi Generate dễ gặp

| Lỗi | Hiểu đơn giản | Nơi thường kiểm tra |
| --- | --- | --- |
| Chưa đăng nhập | User chưa có quyền generate | `protect('user')` |
| Thiếu dữ liệu | Request thiếu prompt/model/tone/type | `generateContentSchema` |
| Option đã tắt | Tone/ngành/type không còn active | `ensureActiveGenerateOptions()` |
| Model không thuộc gói | Plan không cho dùng model đó | `ensureGenerateModelAllowed()` |
| Hết quota | Hết lượt hoặc token | `ensureGenerateQuotaAvailable()` |
| Fine-tuned model chưa sẵn sàng | Model riêng chưa có endpoint/model id | `resolveFineTunedModelForGenerate()` |
| AI provider lỗi | Provider ngoài không phản hồi | `aiService.generateCopy()` |

---

# 2. Luồng Check đạo văn

## Check đạo văn là gì?

Check đạo văn là chức năng nhận một bài viết, đem so với nhiều nguồn khác, tìm đoạn giống nhau, tính điểm giống và lưu báo cáo.

Ví dụ bài cần check:

```text
Mua ngay hôm nay để nhận ưu đãi giảm giá 70%, freeship toàn quốc.
```

Hệ thống sẽ so với:

- content cũ trong tài khoản user
- nguồn mẫu có sẵn
- file người dùng upload
- nguồn web nếu bật web check

## Luồng Check đạo văn dễ hiểu

```text
Người dùng nhập text hoặc upload file
-> hệ thống lấy phần chữ
-> hệ thống chọn nguồn so sánh
-> hệ thống chuẩn hóa text
-> hệ thống tìm đoạn giống
-> hệ thống tính điểm
-> hệ thống lưu báo cáo
-> frontend hiển thị báo cáo
```

Nói bằng ví dụ đời thường:

```text
Người dùng đưa bài cho người soát trùng lặp.
Người soát bài mở bài ra, so với các nguồn khác, gạch chỗ giống, rồi ghi báo cáo.
```

## Đoạn nói cô đọng cho Check đạo văn: thuật toán hoạt động như nào?

Đoạn này dùng để nói nhanh với cô trong khoảng 60 giây:

```text
Luồng Check đạo văn không dùng AI để đoán cảm tính. Backend tự tính độ giống bằng thuật toán so sánh văn bản trong `plagiarismService.js`. Đầu tiên hệ thống lấy bài cần kiểm tra, bỏ qua các cụm quá phổ biến như CTA marketing nếu được bật, rồi gom các nguồn so sánh: bài cũ trong database, nguồn mẫu, file upload và nguồn web nếu bật web check.

Với mỗi nguồn, hàm `scoreTexts()` tính 3 loại điểm: giống nguyên văn, giống cụm từ và giống từ khóa/chủ đề. Sau đó hệ thống tìm các đoạn giống cụ thể bằng `findSegmentMatches()`, tìm các đoạn chỉ giống chủ đề bằng `findTopicSegmentMatches()`, tổng hợp điểm cao nhất thành `similarityScore`, tính `originalityScore = 100 - similarityScore`, phân loại rủi ro, rồi lưu báo cáo vào `PlagiarismReport`.
```

Thuật toán theo từng bước:

```text
1. Lấy text cần kiểm tra.
2. Bỏ qua các cụm phổ biến nếu bật ignore common phrases.
3. Gom nguồn so sánh từ database, nguồn mẫu, web, file upload.
4. Với từng nguồn:
   - chuẩn hóa văn bản
   - tính điểm giống nguyên văn
   - tính điểm giống cụm từ 3-gram hoặc 5-gram
   - tính điểm giống từ khóa/chủ đề
   - tìm đoạn match cụ thể
5. Sắp xếp nguồn theo điểm giống.
6. Lấy điểm đạo văn cao nhất làm similarityScore.
7. Tính originalityScore = 100 - similarityScore.
8. Lưu report vào database.
```

3 loại điểm quan trọng trong `scoreTexts()`:

| Điểm | Code | Hiểu đơn giản | Dùng để kết luận gì? |
| --- | --- | --- | --- |
| `exactMatchScore` | `scoreTexts()` | Một đoạn gần như nằm nguyên văn trong nguồn khác. | Nghi đạo văn mạnh. |
| `phraseOverlapScore` | `scoreTexts()` dùng n-gram 3 hoặc 5 từ | Nhiều cụm từ liên tiếp bị trùng. | Nghi đạo văn khá rõ. |
| `wordOverlapScore` | `scoreTexts()` dùng tập từ khóa/Jaccard | Hai bài có nhiều từ giống nhau. | Chủ yếu báo giống chủ đề, chưa chắc đạo văn. |

Điểm rất quan trọng khi cô hỏi sâu:

```text
Trong code, `similarityScore` cuối cùng ưu tiên `plagiarismScore`, mà `plagiarismScore` lấy từ exact match và phrase overlap. Nghĩa là hệ thống tránh kết luận đạo văn chỉ vì hai bài cùng chủ đề. Nếu chỉ giống nhiều từ khóa, hệ thống đưa vào `topicMatches` để cảnh báo giống chủ đề, chứ không xem là copy rõ ràng như exact/phrase match.
```

Pseudo-code dễ hiểu:

```text
function checkDaoVan(inputText) {
  text = bỏ_cụm_phổ_biến(inputText)
  sources = lấy_nguồn_database + nguồn_web + nguồn_file_upload

  for từng source in sources:
    exact = điểm_giống_nguyên_văn(text, source)
    phrase = điểm_trùng_cụm_từ(text, source)
    topic = điểm_trùng_từ_khóa(text, source)
    matches = tìm_đoạn_bị_trùng(text, source)

  similarityScore = điểm đạo văn cao nhất từ exact/phrase
  originalityScore = 100 - similarityScore
  lưu PlagiarismReport
}
```

Ví dụ để giải thích với cô:

```text
Nếu bài A và bài B cùng nói về son dưỡng môi, có nhiều từ như "môi", "dưỡng", "mềm mịn", thì hệ thống chỉ xem là giống chủ đề.
Nhưng nếu có cả cụm dài như "giúp đôi môi mềm mịn tự nhiên chỉ sau vài lần sử dụng" xuất hiện gần như y nguyên, thì phrase/exact score tăng và hệ thống đánh dấu là nghi đạo văn.
```

## Mở code Check đạo văn theo thứ tự khi báo cáo

| Thứ tự mở | File/hàm cần chỉ | Nói với cô bằng lời dễ hiểu |
| --- | --- | --- |
| 1 | `frontend/src/app/plagiarism-check/PlagiarismCheck.tsx` | Đây là màn hình người dùng nhập bài hoặc upload file để kiểm tra. |
| 2 | `PlagiarismCheck.tsx` - `handleCheck()` | Hàm này chạy khi người dùng bấm nút Kiểm tra đạo văn. |
| 3 | `frontend/src/services/plagiarismService.ts` - `extractText()` | Nếu upload file, frontend gọi API để lấy chữ trong file. |
| 4 | `frontend/src/services/plagiarismService.ts` - `check()` | File này gửi text/file/sources xuống backend để check. |
| 5 | `backend/src/routes/user/plagiarismRoutes.js` | Route này khai báo các API `/check`, `/check-files`, `/extract-text`. |
| 6 | `backend/src/middlewares/upload/plagiarismFilePayload.js` | Nếu request có file, middleware này đổi file thành text để backend xử lý tiếp. |
| 7 | `backend/src/controllers/user/plagiarismController.js` - `checkPlagiarism()` | Controller nhận request rồi gọi service kiểm tra đạo văn. |
| 8 | `backend/src/services/plagiarismService.js` - `checkPlagiarism()` | Đây là logic chính: gom nguồn, tính điểm giống, tìm đoạn match, tạo báo cáo. |
| 9 | `backend/src/services/commonCrawlService.js` - `fetchCommonCrawlCandidates()` | Nếu bật check web, file này tìm nguồn so sánh ngoài web. |
| 10 | `backend/src/models/PlagiarismReport.js` | Model này lưu báo cáo đạo văn sau khi kiểm tra xong. |

## Các bước Check đạo văn và code phụ trách

| Bước | Việc xảy ra | File/hàm phụ trách | Vai trò trong code |
| --- | --- | --- | --- |
| 1 | Người dùng nhập text hoặc upload file | `frontend/src/app/plagiarism-check/PlagiarismCheck.tsx` | Giao diện chính của chức năng kiểm tra đạo văn. |
| 2 | Frontend kiểm tra text đủ dài chưa | `PlagiarismCheck.tsx` - `handleCheck()` | Chặn text quá ngắn hoặc chưa chọn nguồn so sánh. |
| 3 | Frontend extract text từ file nếu cần | `frontend/src/services/plagiarismService.ts` - `extractText()` | Gửi file lên backend để lấy chữ ra. |
| 4 | Frontend chọn API `/check` hay `/check-files` | `plagiarismService.ts` - `check()` | Nếu có file thì gửi form-data, không có file thì gửi JSON. |
| 5 | Backend nhận route plagiarism | `backend/src/routes/user/plagiarismRoutes.js` | Khai báo `/check`, `/check-files`, `/extract-text`, `/history`. |
| 6 | Backend kiểm tra user đăng nhập | `plagiarismRoutes.js` - `protect('user')` | Chỉ user đã đăng nhập mới được check. |
| 7 | Backend validate request | `backend/src/validations/plagiarismValidation.js` - `checkPlagiarismSchema` | Kiểm tra text/contentId, threshold, sensitivity, sources. |
| 8 | Nếu có file, backend chuẩn hóa payload | `backend/src/middlewares/upload/plagiarismFilePayload.js` - `preparePlagiarismFilePayload()` | Đọc file check và reference files, biến thành text/source. |
| 9 | Backend đọc chữ từ file | `backend/src/services/plagiarismFileService.js` - `extractTextFromFile()` | Hỗ trợ TXT, MD, CSV, JSON, HTML, RTF, DOCX, PDF. |
| 10 | Controller gọi service chính | `backend/src/controllers/user/plagiarismController.js` - `checkPlagiarism()` | Chuyển user id và payload vào service. |
| 11 | Lấy text cần check | `backend/src/services/plagiarismService.js` - `getCheckText()` | Nếu có contentId thì lấy bài đã lưu, nếu không thì dùng text user nhập. |
| 12 | Bỏ qua cụm phổ biến | `plagiarismService.js` - `COMMON_PHRASES`, `stripIgnoredSegments()` | Bỏ qua các cụm như mua ngay, freeship, giảm giá để tránh báo nhầm. |
| 13 | Lấy nguồn so sánh từ database | `plagiarismService.js` - `buildDatabaseCandidates()` | Lấy các content cũ của user làm nguồn so sánh. |
| 14 | Lấy nguồn từ file upload | `plagiarismService.js` - `buildUploadedCandidates()` | Biến reference files thành nguồn so sánh. |
| 15 | Lấy nguồn web nếu bật | `backend/src/services/commonCrawlService.js` - `fetchCommonCrawlCandidates()` | Tìm nguồn từ SerpApi/Common Crawl/live fetch. |
| 16 | Tính độ giống | `plagiarismService.js` - `scoreTexts()` | Tính exact match, phrase overlap, word overlap. |
| 17 | Tìm đoạn nghi đạo văn | `plagiarismService.js` - `findSegmentMatches()` | Tìm các đoạn giống cụm từ/nguyên văn vượt ngưỡng. |
| 18 | Tìm đoạn giống chủ đề | `plagiarismService.js` - `findTopicSegmentMatches()` | Tìm đoạn có nhiều từ giống nhau nhưng chưa chắc copy. |
| 19 | Tổng hợp báo cáo | `plagiarismService.js` - `buildAnalysis()`, `buildSummary()` | Tạo similarityScore, originalityScore, riskLevel, summary. |
| 20 | Lưu báo cáo | `plagiarismService.js` - `PlagiarismReport.create()`; `backend/src/models/PlagiarismReport.js` | Lưu kết quả kiểm tra vào database. |
| 21 | Frontend hiển thị report | `PlagiarismCheck.tsx` - `setResult(report)`; `frontend/src/hooks/queries/usePlagiarism.ts` | Hiển thị điểm, đoạn giống, nguồn giống, lịch sử. |

## Hệ thống so sánh bài viết như thế nào?

Có 3 kiểu giống nhau:

| Kiểu giống | Hiểu đơn giản | Code xử lý |
| --- | --- | --- |
| Giống nguyên văn | Hai đoạn gần như y chang | `scoreTexts()` tính `exactMatchScore` |
| Giống cụm từ | Nhiều cụm 3-5 từ bị trùng | `scoreTexts()` tính `phraseOverlapScore` |
| Giống chủ đề | Nhiều từ khóa giống nhau nhưng chưa chắc copy | `scoreTexts()` tính `wordOverlapScore`; `findTopicSegmentMatches()` |

Ví dụ giống cụm từ:

```text
Bài cần check: Sản phẩm giúp làn da sáng mịn tự nhiên.
Nguồn khác: Kem dưỡng giúp làn da sáng mịn tự nhiên mỗi ngày.
```

Cụm `giúp làn da sáng mịn tự nhiên` bị giống nên điểm similarity tăng.

## Dữ liệu được lưu trong Check đạo văn

| Dữ liệu | File model | Ý nghĩa |
| --- | --- | --- |
| Báo cáo đạo văn | `backend/src/models/PlagiarismReport.js` | Lưu text đã check, điểm giống, risk level, matches, sources, analysis. |
| Content cũ để so sánh | `backend/src/models/Content.js` | Các bài đã lưu trước đó có thể được dùng làm nguồn so sánh. |

## Câu báo cáo mẫu cho luồng Check đạo văn

```text
Ở luồng Check đạo văn, người dùng nhập text hoặc upload file tại `PlagiarismCheck.tsx`. Frontend gọi `plagiarismService.check()`. Backend nhận request ở `plagiarismRoutes.js`; nếu có file thì `preparePlagiarismFilePayload()` sẽ lấy chữ từ file. Logic chính nằm trong `plagiarismService.checkPlagiarism()`: service lấy text cần check, gom các nguồn so sánh, dùng `scoreTexts()` để tính độ giống, tìm đoạn match, rồi lưu báo cáo vào `PlagiarismReport`.
```

## Lỗi Check đạo văn dễ gặp

| Lỗi | Hiểu đơn giản | Nơi thường kiểm tra |
| --- | --- | --- |
| Text quá ngắn | Không đủ dữ liệu để so | `handleCheck()`, `checkPlagiarismSchema` |
| File không đọc được | File rỗng/sai định dạng/PDF scan | `extractTextFromFile()` |
| Không chọn nguồn | Hệ thống không biết so với đâu | `handleCheck()` |
| Web không có kết quả | Không tìm được dữ liệu web phù hợp | `commonCrawlService.js` |
| Báo giống câu CTA phổ biến | Cần bật ignore common phrases | `COMMON_PHRASES`, `stripIgnoredSegments()` |
| Topic giống nhưng không đạo văn | Hai bài cùng chủ đề nhưng không copy rõ | `findTopicSegmentMatches()` |

---

# 3. Luồng Fine-tuning

## Fine-tuning là gì?

Fine-tuning là chức năng dạy AI viết theo phong cách riêng bằng nhiều ví dụ input/output.

Ví dụ:

```text
Input: Viết quảng cáo cho son dưỡng môi thiên nhiên.
Output: Đôi môi mềm mịn, căng mọng tự nhiên chỉ sau vài lần sử dụng...
```

Sau khi có nhiều ví dụ như vậy, hệ thống đem chúng đi train hoặc tạo brand voice, để sau này AI viết giống phong cách đó hơn.

## 3 khái niệm phải nhớ

| Khái niệm | Hiểu đơn giản | Model/file liên quan |
| --- | --- | --- |
| Dataset | Bộ ví dụ input/output để dạy AI | `backend/src/models/FineTuneDataset.js` |
| Job | Một lần đem dataset đi train | `backend/src/models/FineTuneJob.js` |
| FineTunedModel | Model đã train xong và được đăng ký để dùng trong Generate | `backend/src/models/FineTunedModel.js` |

Điểm quan trọng:

```text
Job completed chưa chắc đã dùng được trong Generate.
Phải promote/register thành FineTunedModel thì Generator mới dùng được.
```

## Luồng Fine-tuning dễ hiểu

```text
Người dùng nhập/import ví dụ mẫu
-> backend kiểm tra ví dụ hợp lệ
-> backend tạo dataset
-> backend tạo job train
-> backend gửi job sang provider
-> frontend theo dõi trạng thái job
-> job hoàn thành
-> backend promote thành FineTunedModel
-> Generator dùng FineTunedModel để tạo content
```

Nói bằng ví dụ đời thường:

```text
Dataset = giáo trình
Job = buổi đào tạo
FineTunedModel = nhân viên đã được đào tạo xong
Generate = giao việc mới cho nhân viên đó viết
```

## Đoạn nói cô đọng cho Fine-tuning: fine-tuning là gì và train như nào?

Đoạn này dùng để nói nhanh với cô trong khoảng 60 giây:

```text
Fine-tuning trong project là luồng cho người dùng đưa nhiều ví dụ input/output để dạy model viết theo phong cách mong muốn. Người dùng nhập hoặc import các ví dụ ở `FineTuningStudio.tsx`. Khi bấm Start Training, frontend gọi `fineTuningService.createJob()` gửi `POST /fine-tune/jobs` xuống backend.

Backend xử lý ở `fineTuneService.createFineTuneJob()`: chọn provider, kiểm tra provider đã cấu hình chưa, tạo dataset nếu user gửi examples trực tiếp, validate từng example, bắt buộc có ít nhất 10 example hợp lệ, kiểm tra quota theo gói, rồi tạo `FineTuneJob`. Sau đó backend submit job sang provider như OpenAI, Vertex Gemini, Vertex Llama/Qwen. Khi job hoàn thành, hệ thống promote job thành `FineTunedModel` để Generator có thể chọn và dùng lại khi generate nội dung.
```

Hiểu đơn giản theo 4 đối tượng:

| Đối tượng | Hiểu như đời thường | Trong code/database |
| --- | --- | --- |
| Example | Một bài mẫu gồm đề bài và câu trả lời mẫu. | `FineTuneExample` |
| Dataset | Bộ giáo trình gồm nhiều example. | `FineTuneDataset` |
| Job | Một lần đem giáo trình đi huấn luyện. | `FineTuneJob` |
| FineTunedModel | Model/giọng viết đã huấn luyện xong và đăng ký để dùng. | `FineTunedModel` |

Luồng train theo thứ tự:

```text
Nhập/import examples
-> validate examples
-> tạo Dataset
-> kiểm tra đủ tối thiểu 10 valid examples
-> kiểm tra provider và quota
-> tạo FineTuneJob trạng thái pending
-> submit job sang provider
-> provider train hoặc tạo brand voice
-> sync trạng thái job
-> job completed
-> promote thành FineTunedModel
-> Generate dùng FineTunedModel
```

Các kiểu fine-tuning trong project:

| Provider | Cách hoạt động | Nói ngắn gọn khi báo cáo |
| --- | --- | --- |
| OpenAI | Backend upload dữ liệu dạng JSONL và tạo fine-tuning job. | Train model thật trên OpenAI. |
| Vertex Gemini | Backend upload dataset lên Google Cloud Storage rồi tạo tuning job. | Train/tune model trên Vertex AI. |
| Vertex Llama/Qwen | Backend gọi service và script Python để submit open-model tuning. | Train open model qua Vertex. |
| Vertex Claude | Không train weight thật; tạo brand voice từ examples. | Claude học phong cách bằng brand voice/prompt, không phải fine-tune trọng số. |

Điểm cần nhấn mạnh khi cô hỏi "fine-tuning xong dùng ở đâu?":

```text
Job train xong chưa đủ để dùng ngay. Backend phải promote job thành bản ghi `FineTunedModel`. Khi user chọn model này trong Generate, frontend gửi `modelMode = fine-tuned` hoặc `fineTunedModelId`. Backend dùng `resolveFineTunedModelForGenerate()` trong `contentService.js` để tìm model đã train, lấy provider/model id/endpoint phù hợp, rồi mới gọi AI qua `aiService.generateCopy()`.
```

Pseudo-code dễ hiểu:

```text
function fineTune(examples) {
  kiểm_tra_provider()
  dataset = tạo_dataset(examples)
  validExamples = lọc_example_hợp_lệ(dataset)

  nếu validExamples < 10:
    báo lỗi không đủ dữ liệu train

  kiểm_tra_quota()
  job = tạo FineTuneJob(status = pending)
  submit job sang provider

  khi provider báo completed:
    model = tạo FineTunedModel từ job
    bật model để Generator dùng
}
```

Ví dụ để nói với cô:

```text
Nếu doanh nghiệp muốn AI viết theo giọng thương hiệu trẻ trung, họ đưa vào nhiều cặp input/output mẫu. Dataset giống như giáo trình, job giống như buổi huấn luyện, còn FineTunedModel là model đã học xong phong cách đó. Sau này khi Generate, hệ thống không chỉ dùng model gốc mà dùng model/brand voice đã được huấn luyện để viết đúng style hơn.
```

## Mở code Fine-tuning theo thứ tự khi báo cáo

| Thứ tự mở | File/hàm cần chỉ | Nói với cô bằng lời dễ hiểu |
| --- | --- | --- |
| 1 | `frontend/src/app/fine-tune/FineTuningStudio.tsx` | Đây là màn hình người dùng nhập/import ví dụ và bấm Start Training. |
| 2 | `FineTuningStudio.tsx` - `addExample()`, `importTrainingExamples()` | Hai hàm này thêm ví dụ thủ công hoặc import ví dụ từ file. |
| 3 | `FineTuningStudio.tsx` - `startTraining()` | Hàm này gom dữ liệu training và bắt đầu tạo job. |
| 4 | `frontend/src/hooks/queries/useFineTuning.ts` - `useCreateFineTuneJob()` | Hook này quản lý request tạo fine-tune job ở frontend. |
| 5 | `frontend/src/services/fineTuningService.ts` - `createJob()` | File này gửi API tạo job xuống backend. |
| 6 | `backend/src/routes/user/fineTuneRoutes.js` | Route này khai báo API dataset, job, promote model, active model. |
| 7 | `backend/src/controllers/user/fineTuneController.js` - `createFineTuneJob()` | Controller nhận request tạo job rồi gọi service. |
| 8 | `backend/src/services/fineTuneService.js` - `createFineTuneJob()` | Đây là logic chính: tạo dataset, validate ví dụ, kiểm tra quota, tạo job, submit provider. |
| 9 | `fineTuneService.js` - `submitOpenAIFineTuneJob()`, `submitVertexGeminiFineTuneJob()`, `submitVertexOpenModelFineTuneJob()` | Các hàm này gửi job train sang provider AI thật sự. |
| 10 | `fineTuneService.js` - `promoteFineTuneJob()`, `createFineTunedModelFromJob()` | Khi job xong, các hàm này đăng ký model để Generate dùng được. |
| 11 | `backend/src/models/FineTuneDataset.js`, `FineTuneExample.js`, `FineTuneJob.js`, `FineTunedModel.js` | Các model này lưu bộ dữ liệu, ví dụ, job train và model đã train xong. |

## Các bước Fine-tuning và code phụ trách

| Bước | Việc xảy ra | File/hàm phụ trách | Vai trò trong code |
| --- | --- | --- | --- |
| 1 | Người dùng mở trang Fine-tune | `frontend/src/app/fine-tune/FineTuningStudio.tsx` | Giao diện chính của Fine-tuning Studio. |
| 2 | Frontend tải provider/quota/job/model | `frontend/src/hooks/queries/useFineTuning.ts` - `useFineTuneProviders()`, `useFineTuneQuotas()`, `useFineTuneJobs()`, `useFineTuningModels()` | Hỏi backend provider nào sẵn sàng, còn quota không, có job/model nào không. |
| 3 | Người dùng thêm example thủ công | `FineTuningStudio.tsx` - `addExample()` | Thêm một cặp input/output mẫu vào danh sách. |
| 4 | Người dùng import CSV/Excel | `FineTuningStudio.tsx` - `importTrainingExamples()` | Import nhiều ví dụ từ file. |
| 5 | Người dùng bấm Start Training | `FineTuningStudio.tsx` - `startTraining()` | Gom tên model, ngành, provider, base model, examples. |
| 6 | Frontend gọi API tạo job | `frontend/src/services/fineTuningService.ts` - `createJob()`; hook `useCreateFineTuneJob()` | Gửi `POST /fine-tune/jobs`. |
| 7 | Backend nhận API fine-tune | `backend/src/routes/user/fineTuneRoutes.js` | Khai báo route datasets, jobs, models, providers, quotas. |
| 8 | Backend kiểm tra user đăng nhập | `fineTuneRoutes.js` - `protect('user')` | Chặn user chưa đăng nhập. |
| 9 | Backend validate payload tạo job | `backend/src/validations/fineTuneValidation.js` - `createFineTuneJobSchema` | Kiểm tra name, provider, baseModel, datasetId/examples, epochs. |
| 10 | Controller gọi service | `backend/src/controllers/user/fineTuneController.js` - `createFineTuneJob()` | Chuyển request vào service xử lý. |
| 11 | Service chọn provider/base model | `backend/src/services/fineTuneService.js` - `createFineTuneJob()`, `getDefaultTrainingProvider()` | Xác định train bằng OpenAI, Vertex Gemini, Llama, Qwen hay Claude. |
| 12 | Kiểm tra provider đã cấu hình chưa | `fineTuneService.js` - `isOpenAIFineTuneProviderReady()`, `isVertexFineTuneProviderReady()`; `vertexOpenModelFineTuneService.isReady()` | Nếu thiếu API key/GCP/bucket/script thì không cho train. |
| 13 | Tạo dataset từ examples inline | `fineTuneService.js` - `createDatasetFromInlineExamples()`, `createDataset()` | Nếu user gửi examples trực tiếp, backend tạo dataset mới. |
| 14 | Validate từng example | `fineTuneService.js` - `validateExamplePayload()` | Kiểm tra input/output đủ dài, không chứa password/secret/api key/token. |
| 15 | Cập nhật thống kê dataset | `fineTuneService.js` - `refreshDatasetStats()` | Đếm tổng examples, valid examples, qualityScore. |
| 16 | Bắt buộc đủ 10 valid examples | `fineTuneService.js` - hằng số `MIN_VALID_EXAMPLES` trong `createFineTuneJob()` | Không đủ 10 ví dụ hợp lệ thì không tạo job train. |
| 17 | Kiểm tra quota fine-tune | `fineTuneService.js` - `getFineTunePlanLimits()`, `buildRunningJobQuotaFilter()` | Kiểm tra plan có fine-tune không, số model/job có vượt giới hạn không. |
| 18 | Tạo job local | `fineTuneService.js` - `FineTuneJob.create()`; `backend/src/models/FineTuneJob.js` | Tạo bản ghi job trạng thái `pending`. |
| 19 | Submit job sang OpenAI | `fineTuneService.js` - `submitOpenAIFineTuneJob()` | Upload JSONL lên OpenAI và tạo fine-tuning job. |
| 20 | Submit job sang Vertex Gemini | `fineTuneService.js` - `submitVertexGeminiFineTuneJob()` | Upload dữ liệu lên GCS và tạo Vertex tuning job. |
| 21 | Submit job sang Llama/Qwen | `fineTuneService.js` - `submitVertexOpenModelFineTuneJob()`, `submitQwenFineTuneJob()`; `backend/src/services/vertexOpenModelFineTuneService.js` - `submitJob()` | Upload dữ liệu lên GCS, gọi script Python để submit open-model tuning. |
| 22 | Script Python submit Vertex open model | `training/vertex_open_model_tuning/submit_open_model_tuning.py` | Hỗ trợ tạo job tuning Llama/Qwen qua Vertex AI SDK. |
| 23 | Xử lý Claude brand voice | `fineTuneService.js` - `completeVertexClaudeBrandVoiceJob()` | Claude không train weight thật, chỉ tạo brand voice dựa trên examples. |
| 24 | Frontend theo dõi job | `useFineTuneJobs()`, `useTrainingLog()`, `useFineTuneMetrics()` | Frontend poll định kỳ để lấy status/logs/metrics. |
| 25 | Backend sync trạng thái provider | `fineTuneService.js` - `syncOpenAIFineTuneJob()`, `syncVertexGeminiFineTuneJob()`, `syncVertexOpenModelFineTuneJob()`, `syncQwenFineTuneJob()` | Hỏi provider xem job queued/running/completed/failed chưa. |
| 26 | Promote job thành model dùng được | `fineTuneService.js` - `promoteFineTuneJob()` | Kiểm tra job completed và provider đã trả model id/endpoint. |
| 27 | Tạo FineTunedModel | `fineTuneService.js` - `createFineTunedModelFromJob()`; `backend/src/models/FineTunedModel.js` | Đăng ký model đã train để Generator chọn được. |
| 28 | Bật model active | `fineTuneService.js` - `setFineTunedModelActive()` | Chỉ một model active cho mỗi ngành. |
| 29 | Dùng model fine-tuned trong Generate | `FineTuningStudio.tsx` - `applyModel()`; `backend/src/services/contentService.js` - `resolveFineTunedModelForGenerate()` | Frontend chuyển sang `/generate?model=fine-tuned:<id>`, backend resolve model riêng khi generate. |

## Provider fine-tuning trong project

| Provider | Có train thật không? | File/hàm xử lý | Ghi chú khi báo cáo |
| --- | --- | --- | --- |
| OpenAI | Có | `submitOpenAIFineTuneJob()` | Upload JSONL lên OpenAI, tạo fine-tuning job. |
| Vertex Gemini | Có | `submitVertexGeminiFineTuneJob()` | Upload dataset lên Google Cloud Storage, tạo Vertex tuning job. |
| Vertex Llama | Có | `submitVertexOpenModelFineTuneJob()`, `vertexOpenModelFineTuneService.submitJob()` | Dùng script Python, train xong cần endpoint để Generate. |
| Vertex Qwen | Có | `submitQwenFineTuneJob()`, `vertexOpenModelFineTuneService.submitJob()` | Giống Llama, cần endpoint sau khi train. |
| Vertex Claude | Không train weight thật | `completeVertexClaudeBrandVoiceJob()` | Tạo brand voice; khi Generate, backend nhét examples vào prompt để Claude bắt chước style. |

## Dữ liệu được lưu trong Fine-tuning

| Dữ liệu | File model | Ý nghĩa |
| --- | --- | --- |
| Dataset | `backend/src/models/FineTuneDataset.js` | Bộ ví dụ dùng để dạy AI. |
| Example | `backend/src/models/FineTuneExample.js` | Một cặp input/output mẫu. |
| Job | `backend/src/models/FineTuneJob.js` | Một lần đem dataset đi train. |
| Metric | `backend/src/models/FineTuneMetric.js` | Log/token/progress/metric của job. |
| Model đã đăng ký | `backend/src/models/FineTunedModel.js` | Model train xong, dùng được trong Generator. |

## Câu báo cáo mẫu cho luồng Fine-tuning

```text
Ở luồng Fine-tuning, người dùng nhập hoặc import các ví dụ input/output trong `FineTuningStudio.tsx`. Khi bấm Start Training, frontend gọi `fineTuningService.createJob()` tới `/api/fine-tune/jobs`. Backend nhận request ở `fineTuneRoutes.js`, controller `fineTuneController.createFineTuneJob()` chuyển sang `fineTuneService.createFineTuneJob()`. Service tạo dataset, validate examples, kiểm tra quota, tạo `FineTuneJob`, rồi submit sang provider như OpenAI, Vertex Gemini hoặc Vertex Llama/Qwen. Khi job completed, `promoteFineTuneJob()` tạo `FineTunedModel`; model này sau đó được dùng trong Generate qua `resolveFineTunedModelForGenerate()`.
```

## Lỗi Fine-tuning dễ gặp

| Lỗi | Hiểu đơn giản | Nơi thường kiểm tra |
| --- | --- | --- |
| Provider chưa active | Thiếu API key/GCP/bucket/script | `listProviders()`, các hàm `is...Ready()` |
| Không đủ 10 valid examples | Có thể nhập đủ 10 dòng nhưng vài dòng invalid | `validateExamplePayload()`, `MIN_VALID_EXAMPLES` |
| Gói không cho fine-tune | Plan không có quyền Fine-tuning Studio | `getFineTunePlanLimits()` |
| Quá nhiều job đang chạy | User đã có nhiều job pending/running | `buildRunningJobQuotaFilter()` |
| Job completed nhưng chưa dùng được | Chưa có model id hoặc endpoint | `promoteFineTuneJob()` |
| Llama/Qwen chưa generate được | Chưa deploy endpoint | `vertexOpenModelFineTuneService.ensureTunedModelDeployed()` |
| Claude train quá nhanh | Claude không train weight thật | `completeVertexClaudeBrandVoiceJob()` |

---

# So sánh 3 luồng bằng ví dụ đời thường

| Luồng | Ví dụ đời thường | Kết quả cuối |
| --- | --- | --- |
| Generate | Thuê người viết bài quảng cáo theo brief | Có bài viết mới trong `Content` |
| Check đạo văn | Đưa bài cho người soát trùng lặp | Có báo cáo trong `PlagiarismReport` |
| Fine-tuning | Đào tạo nhân viên viết theo style riêng | Có model riêng trong `FineTunedModel` |

# Tóm tắt siêu ngắn

```text
Generate:
Nhập yêu cầu -> AI viết -> lưu Content.

Check đạo văn:
Nhập bài -> so với nguồn khác -> lưu PlagiarismReport.

Fine-tuning:
Đưa bài mẫu -> train/tạo brand voice -> lưu FineTunedModel -> dùng lại trong Generate.
```

# Nếu chỉ nhớ một câu

Project này là một web giúp người dùng tạo bài quảng cáo bằng AI, kiểm tra bài đó có giống nguồn khác không, và dạy AI viết theo phong cách riêng bằng fine-tuning. Mỗi luồng đều có frontend để người dùng thao tác, backend service để xử lý nghiệp vụ, và database model để lưu kết quả.
