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
