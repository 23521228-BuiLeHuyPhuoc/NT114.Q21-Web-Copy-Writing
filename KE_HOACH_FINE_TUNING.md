# KẾ HOẠCH TRIỂN KHAI TÍNH NĂNG FINE-TUNING MODEL AI

## 0. Cập nhật trạng thái triển khai ngày 11/06/2026

Kế hoạch này **chỉ được gọi là fine-tuning thật khi backend có provider job id từ provider bên ngoài**. Nếu chỉ tạo được `FineTuneJob` trong DB thì vẫn chưa đủ. Trạng thái hiện tại của repo là:

- Đã có schema và API nền tảng: `FineTuneDataset`, `FineTuneExample`, `FineTuneJob`, `FineTuneMetric`, `FineTunedModel`.
- Đã có import CSV, validate ví dụ, tạo dataset/job, list job, log/metric cơ bản và promote model local.
- Đã có adapter OpenAI-compatible ở mức code: build JSONL, upload `/files`, tạo `/fine_tuning/jobs`, sync status/events.
- Đã có adapter `vertex-gemini` cho Google Vertex AI Gemini fine-tuning: export JSONL theo format Gemini, upload Cloud Storage, gọi `tuningJobs.create`, sync/cancel job bằng Application Default Credentials.
- Project Google Cloud hiện dùng `copy-writing-499306`, region tuning `us-central1`, bucket `VERTEX_TUNING_BUCKET`; preflight `GET tuningJobs` đã trả `200`.
- Chưa có worker nền chạy định kỳ; sync hiện xảy ra theo request job/log/metric.
- Chưa có adapter fine-tuning thật cho Gemini Developer API key, Groq hoặc OpenRouter; các API này trong repo hiện chỉ dùng cho generate/inference.
- Endpoint OpenAI-compatible hiện tại `http://localhost:20128/v1` chỉ trả được `/models`; `/files` và `/fine_tuning/jobs` đang trả `404`, nên **không thể fine-tune thật với endpoint này**.

Kết luận kỹ thuật hiện tại:

- `provider=mock`: chỉ tạo job local/mô phỏng, không phải fine-tuning thật.
- `provider=gemini`, `groq`, `openrouter`: chỉ được xem là provider generate; không được tạo job fine-tuning thật cho đến khi có adapter riêng.
- `provider=openai`: chỉ fine-tune thật khi đồng thời có `OPENAI_FINE_TUNE_MODEL` hoặc `OPENAI_FINE_TUNE_BASE_MODELS` và `OPENAI_BASE_URL` hỗ trợ cả `/files` lẫn `/fine_tuning/jobs`.
- `provider=vertex-gemini`: fine-tune thật qua Google Vertex AI khi có `GOOGLE_CLOUD_PROJECT`, `GOOGLE_CLOUD_LOCATION`, `VERTEX_TUNING_BUCKET` và ADC hoạt động.

Điều kiện tối thiểu để bấm "Bắt đầu Fine-tuning" và gọi là fine-tuning thật:

```env
OPENAI_API_KEY=...
OPENAI_BASE_URL=https://api.openai.com/v1 hoặc endpoint compatible có /files và /fine_tuning/jobs
OPENAI_FINE_TUNE_MODEL=<model-id-provider-cho-phep-fine-tune>
# hoặc
OPENAI_FINE_TUNE_BASE_MODELS=<model-1>,<model-2>

# Hoặc dùng Google Vertex AI Gemini
GOOGLE_CLOUD_PROJECT=copy-writing-499306
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=
VERTEX_TUNING_BUCKET=<gcs-bucket-name>
VERTEX_TUNING_BASE_MODELS=gemini-2.5-flash,gemini-2.5-flash-lite
```

Với Vertex Llama/open-model tuning trong project `copy-writing-499306`, bucket khuyến nghị là `copy-writing-499306-vertex-tuning`. Chạy `scripts/setup_vertex_tuning_bucket.ps1` để tạo bucket và grant quyền cho service account Vertex MOSS fine-tuning `service-167488791850@gcp-sa-vertex-moss-ft.iam.gserviceaccount.com`.

Preflight bắt buộc trước khi tạo job thật:

1. `GET {OPENAI_BASE_URL}/files` phải trả `2xx`.
2. `GET {OPENAI_BASE_URL}/fine_tuning/jobs` phải trả `2xx`.
3. Base model người dùng chọn phải nằm trong `OPENAI_FINE_TUNE_MODEL` hoặc `OPENAI_FINE_TUNE_BASE_MODELS`.
4. Dataset phải có ít nhất 10 ví dụ hợp lệ.

Preflight Vertex bắt buộc trước khi tạo job thật:

1. ADC phải lấy được access token bằng `google-auth-library`.
2. `GET https://{GOOGLE_CLOUD_LOCATION}-aiplatform.googleapis.com/v1/projects/{GOOGLE_CLOUD_PROJECT}/locations/{GOOGLE_CLOUD_LOCATION}/tuningJobs?pageSize=1` phải trả `2xx`.
3. Bucket `VERTEX_TUNING_BUCKET` phải upload được JSONL.
4. Base model phải nằm trong `VERTEX_TUNING_BASE_MODELS`.
5. Dataset phải có ít nhất 10 ví dụ hợp lệ.

Nếu một trong các điều kiện trên fail, backend phải trả lỗi rõ và **không tạo job local giả dưới tên provider thật**.

## 0.1. Việc đã sửa để tránh hiểu nhầm

- UI hiện hiển thị provider API nhưng disable nút submit nếu provider đó chưa hỗ trợ fine-tuning thật.
- Backend không còn tự biến provider API như Gemini/Groq/OpenRouter/OpenAI generate-only thành job `local-ft-*`.
- OpenAI-compatible có preflight `/files` và `/fine_tuning/jobs` trước khi tạo dataset/job thật.
- Vertex Gemini có provider riêng `vertex-gemini`; không dùng `GEMINI_API_KEY` để tuning.
- Job local chỉ còn hợp lệ khi người dùng chọn rõ `Local Training Simulation`.

## 0.2. Việc còn thiếu để hoàn tất fine-tuning thật

- Worker nền để polling job provider theo lịch thay vì chỉ sync khi user mở trang.
- Tự động đăng ký `FineTunedModel` khi provider job hoàn tất.
- Nối model đã fine-tune vào AI Generator bằng `providerModelId` thật.

## 0.3. Hướng non-OpenAI khả thi

### Google / Gemini

- `GEMINI_API_KEY` hoặc `GOOGLE_API_KEY` chỉ đủ cho generate qua Gemini Developer API, không đủ để chạy tuning thật.
- Gemini Developer API hiện không còn model tuning khả dụng sau khi model tuning cũ bị tắt; tuning Gemini phải đi qua Google Cloud/Vertex AI hoặc Gemini Enterprise Agent Platform.
- Cần cấu hình tối thiểu: `GOOGLE_CLOUD_PROJECT`, `GOOGLE_CLOUD_LOCATION`, `GOOGLE_APPLICATION_CREDENTIALS` hoặc ADC/service account có quyền Vertex AI tuning.
- Nếu organization policy `iam.disableServiceAccountKeyCreation` chặn tạo key JSON, dùng Application Default Credentials (`gcloud auth application-default login`) cho local dev hoặc attached service account/Workload Identity khi deploy; không cần tắt policy để phát triển.
- Region phải là region provider tuning hỗ trợ; không được giả định mọi region đều dùng được.

Việc đã triển khai cho adapter Google trong repo:

1. Thêm provider `vertex-gemini` riêng, tách khỏi `gemini` generate provider.
2. Export dataset sang JSONL theo format tuning của Vertex.
3. Upload dataset vào GCS bằng `VERTEX_TUNING_BUCKET`.
4. Gọi tuning job API bằng OAuth/ADC, không dùng API key thường.
5. Sync job state theo request và lưu `providerJobId`, `fineTunedModelId` khi provider trả về.

### FreeGPT4 local

- `Free-GPT4-WEB-API` đã được tích hợp cho AI Generator qua `FREEGPT4_BASE_URL`, mặc định `http://127.0.0.1:5500`.
- Provider này chỉ có endpoint sinh text dạng `/?text=...`; không có `/files`, `/fine_tuning/jobs` hoặc pipeline training.
- Vì vậy `provider=freegpt4` trong fine-tune chỉ được hiển thị như provider generate-only và không được tạo job fine-tuning thật.

### Hugging Face / AutoTrain / PEFT

- Hugging Face fine-tuning khả thi cho model open-source bằng AutoTrain, PEFT/LoRA hoặc script training riêng.
- Token write chỉ cho phép tạo repo/push artifact; để chạy training cần thêm base model, output repo, dataset, hardware/compute và lệnh/job runner.
- Máy local hiện không có `nvidia-smi`, nên không nên chạy LLM fine-tuning local trừ khi dùng CPU toy model để test kỹ thuật.
- Nếu dùng Hugging Face cloud/AutoTrain/Spaces/Jobs cần chốt hardware vì có thể phát sinh chi phí.

Cấu hình tối thiểu:

```env
HF_TOKEN=...
HF_USERNAME=<username-or-org>
HF_FINE_TUNE_BASE_MODEL=<base-model-id>
HF_FINE_TUNE_OUTPUT_REPO=<username-or-org>/<repo-name>
HF_AUTOTRAIN_PROJECT_NAME=copypro-finetune
HF_AUTOTRAIN_HARDWARE=<hardware-profile-if-using-cloud>
```

Việc cần làm để triển khai adapter Hugging Face:

1. Thêm provider `huggingface-autotrain`.
2. Export dataset từ DB sang CSV/JSONL chuẩn AutoTrain.
3. Tạo/push dataset repo hoặc file dataset lên Hugging Face Hub.
4. Khởi tạo AutoTrain job hoặc tạo training Space/Job bằng token write.
5. Poll trạng thái job, lưu model repo sau khi training xong.
6. Nối generator gọi model đã deploy qua Inference Endpoint/Space/provider inference.

## 1. Mục tiêu

Xây dựng một tính năng fine-tuning thật sự dùng được, không dừng ở mock CRUD hay màn hình demo.
Người dùng phải có thể:

- Tạo bộ dữ liệu fine-tuning từ ví dụ thực tế.
- Khởi tạo job fine-tuning cho từng ngành, từng thương hiệu hoặc từng chiến dịch.
- Theo dõi tiến trình, log, metric và trạng thái job.
- Kích hoạt model đã fine-tune vào luồng sinh nội dung.
- Quay lui về model cũ nếu model mới không đạt chất lượng.
- Để admin giám sát, giới hạn chi phí, audit và can thiệp khi cần.

## 2. Hiện trạng cần chốt lại

Phần fine-tuning hiện chỉ nên được xem là nền móng ban đầu.
Những thứ còn thiếu để gọi là "đàng hoàng đầy đủ":

- Chưa có pipeline dữ liệu chuẩn hóa từ đầu vào đến JSONL.
- Chưa có hàng đợi xử lý job và worker nền.
- Chưa có adapter provider thật cho OpenAI hoặc lựa chọn thay thế.
- Chưa có model registry đúng nghĩa, versioning, promote/rollback.
- Chưa có đánh giá chất lượng trước và sau fine-tune.
- Chưa có cơ chế quota, cost estimate, cảnh báo thất bại.
- Chưa có giao diện quản lý dataset, job detail, compare output, rollback.

Kết luận: module 3 phải được viết lại theo hướng pipeline sản phẩm, không phải form nhập liệu có nút bấm.

## 3. Phạm vi tính năng

### 3.1. Phía người dùng

- Tạo fine-tuning project.
- Tạo dataset từ ví dụ input/output thủ công.
- Import dữ liệu từ CSV hoặc JSONL.
- Gắn dataset vào một job fine-tuning.
- Chọn base model, ngành nghề, mục tiêu, tone, độ dài dữ liệu.
- Xem tiến trình training và log từng bước.
- Xem metric chính: train loss, validation loss, accuracy, token usage, chi phí ước tính.
- Đặt model đã fine-tune làm model mặc định cho một nhóm nội dung.
- So sánh output trước và sau fine-tune.
- Hủy job, chạy lại job, lưu phiên bản mới.

### 3.2. Phía admin

- Xem toàn bộ job của hệ thống.
- Xem job đang chạy, thất bại, bị hủy, hoàn tất.
- Xem cảnh báo chi phí, job lỗi, dataset kém chất lượng.
- Khóa, hủy hoặc gỡ model khỏi danh sách active.
- Xem lịch sử audit của các thao tác nhạy cảm.
- Theo dõi quota fine-tuning theo user, plan hoặc tenant.

### 3.3. Không làm trong pha đầu

- Tự huấn luyện model từ đầu.
- Hạ tầng GPU riêng do mình tự vận hành.
- Hệ thống gán nhãn dữ liệu phức tạp nhiều vai trò.
- Tối ưu phân tán đa node quy mô lớn.
- Billing production ngay từ ngày đầu.

## 4. Nguyên tắc kỹ thuật

1. Dữ liệu là nguồn sự thật duy nhất. Không giữ trạng thái job quan trọng trong React state.
2. Job phải bất đồng bộ. Tạo job xong không đồng nghĩa đã train xong.
3. Dữ liệu dataset bất biến sau khi đã submit job, trừ khi tạo version mới.
4. Mỗi job phải có providerJobId, trạng thái, progress, lỗi cuối cùng và dấu thời gian.
5. Model chỉ được activate bằng thao tác rõ ràng, không auto bật âm thầm.
6. Có fallback an toàn khi provider lỗi, nhưng fallback không được che giấu lỗi thật.
7. Mọi thay đổi nhạy cảm phải đi qua audit log.
8. Luồng UI phải phản ánh đúng trạng thái backend, không tự đoán.

## 5. Mô hình dữ liệu đề xuất

### 5.1. `FineTuneDataset`

Mục đích: lưu bộ dữ liệu nguồn trước khi submit training.

Trường chính:

- `userId`
- `name`
- `industry`
- `description`
- `sourceType` (`manual`, `csv`, `jsonl`, `content-history`)
- `status` (`draft`, `validated`, `submitted`, `archived`)
- `exampleCount`
- `language`
- `tags`
- `createdAt`, `updatedAt`

### 5.2. `FineTuneExample`

Mục đích: lưu từng cặp input/output của dataset.

Trường chính:

- `datasetId`
- `inputText`
- `outputText`
- `industry`
- `tone`
- `qualityScore`
- `isValid`
- `validationErrors`
- `sourceContentId` nếu lấy từ nội dung đã tạo

### 5.3. `FineTuneJob`

Mục đích: theo dõi một lần submit fine-tuning.

Trường chính:

- `userId`
- `datasetId`
- `name`
- `industry`
- `baseModel`
- `provider`
- `providerJobId`
- `status` (`pending`, `queued`, `running`, `completed`, `failed`, `cancelled`)
- `progress`
- `samples`
- `epochs`
- `startedAt`
- `finishedAt`
- `errorMessage`
- `estimatedCost`
- `actualCost`
- `fineTunedModelId`

### 5.4. `FineTunedModel`

Mục đích: lưu version model sau khi job hoàn tất.

Trường chính:

- `jobId`
- `userId`
- `name`
- `alias`
- `providerModelId`
- `baseModel`
- `industry`
- `version`
- `isActive`
- `isDeprecated`
- `performance`
- `deployedAt`
- `deactivatedAt`

### 5.5. `FineTuneMetric`

Mục đích: lưu metric theo epoch hoặc theo milestone.

Trường chính:

- `jobId`
- `epoch`
- `trainLoss`
- `validationLoss`
- `accuracy`
- `tokenUsage`
- `timestamp`

### 5.6. `FineTuneAuditLog`

Mục đích: log các thao tác nhạy cảm.

Trường chính:

- `actorId`
- `actorRole`
- `action`
- `targetType`
- `targetId`
- `metadata`
- `ip`
- `createdAt`

## 6. API đề xuất

### 6.1. Dataset

| Method | Endpoint | Mục đích |
|---|---|---|
| GET | `/api/fine-tune/datasets` | Danh sách dataset |
| POST | `/api/fine-tune/datasets` | Tạo dataset mới |
| GET | `/api/fine-tune/datasets/:id` | Xem dataset chi tiết |
| PATCH | `/api/fine-tune/datasets/:id` | Cập nhật metadata |
| POST | `/api/fine-tune/datasets/:id/import` | Import CSV/JSONL |
| POST | `/api/fine-tune/datasets/:id/validate` | Kiểm tra chất lượng dữ liệu |
| POST | `/api/fine-tune/datasets/:id/archive` | Lưu trữ dataset |

### 6.2. Job

| Method | Endpoint | Mục đích |
|---|---|---|
| GET | `/api/fine-tune/jobs` | Danh sách job |
| POST | `/api/fine-tune/jobs` | Tạo job fine-tuning |
| GET | `/api/fine-tune/jobs/:id` | Xem job chi tiết |
| POST | `/api/fine-tune/jobs/:id/cancel` | Hủy job |
| POST | `/api/fine-tune/jobs/:id/retry` | Chạy lại job lỗi |
| GET | `/api/fine-tune/jobs/:id/logs` | Xem training log |
| GET | `/api/fine-tune/jobs/:id/metrics` | Xem metric |
| POST | `/api/fine-tune/jobs/:id/promote` | Đưa model vào active |

### 6.3. Model registry

| Method | Endpoint | Mục đích |
|---|---|---|
| GET | `/api/fine-tune/models` | Danh sách model đã fine-tune |
| GET | `/api/fine-tune/models/:id` | Chi tiết model |
| PATCH | `/api/fine-tune/models/:id/active` | Kích hoạt hoặc gỡ kích hoạt |
| POST | `/api/fine-tune/models/:id/rollback` | Quay lui về phiên bản trước |

### 6.4. Provider / admin

| Method | Endpoint | Mục đích |
|---|---|---|
| GET | `/api/fine-tune/providers` | Danh sách provider khả dụng |
| GET | `/api/fine-tune/quotas` | Quota và mức sử dụng |
| GET | `/api/admin/fine-tune/jobs` | Admin xem toàn bộ job |
| PATCH | `/api/admin/fine-tune/jobs/:id` | Admin can thiệp trạng thái |

## 7. Pipeline xử lý

### 7.1. Bước 1: Chuẩn hóa dữ liệu

- Nhập dữ liệu từ manual form, CSV, JSONL hoặc từ nội dung đã sinh trước đó.
- Làm sạch text, bỏ khoảng trắng thừa, chuẩn hóa line break.
- Kiểm tra độ dài input/output.
- Loại bản ghi trùng lặp.
- Gán nhãn ngành, tone, ngôn ngữ nếu có.
- Đánh dấu bản ghi lỗi để người dùng sửa trước khi submit.

### 7.2. Bước 2: Kiểm tra chất lượng

- Phát hiện input quá ngắn hoặc output quá chung chung.
- Phát hiện dữ liệu thiếu cặp input/output.
- Phát hiện PII hoặc thông tin nhạy cảm cần cảnh báo.
- Tính điểm chất lượng sơ bộ cho dataset.
- Chặn submit nếu dataset không đạt ngưỡng tối thiểu.

### 7.3. Bước 3: Submit job

- Chốt snapshot dataset.
- Tạo provider job với idempotency key.
- Lưu providerJobId vào DB.
- Chuyển job sang `queued` hoặc `pending`.
- Gửi notification cho user.

### 7.4. Bước 4: Theo dõi training

- Worker nền polling trạng thái provider.
- Nếu provider hỗ trợ webhook thì ưu tiên webhook, polling làm fallback.
- Ghi log theo mốc: queued, running, checkpoint, evaluation, completed, failed.
- Cập nhật progress, loss, accuracy, cost estimate.

### 7.5. Bước 5: Đánh giá và phát hành

- Tạo đánh giá so sánh trước/sau trên bộ prompt chuẩn.
- Chấm chất lượng đầu ra theo rubric.
- Nếu đạt ngưỡng thì tạo `FineTunedModel`.
- Cho phép người dùng activate model hoặc để admin duyệt trước.
- Nếu không đạt ngưỡng thì giữ ở trạng thái archived/failed và cho retry.

## 8. Frontend cần có

### 8.1. Trang chính `/fine-tune`

- Tóm tắt số dataset, job, model active, job đang chạy.
- Danh sách job hiện tại.
- Nút tạo job mới.
- Filter theo trạng thái, ngành, base model.

### 8.2. Màn dataset

- Thêm từng cặp input/output.
- Import CSV/JSONL.
- Xem lỗi validate theo dòng.
- Xóa, sửa, gắn tag, lưu nháp.

### 8.3. Màn job detail

- Progress bar.
- Log theo thời gian.
- Metric chart.
- Dung lượng dataset, số sample, base model, provider.
- Nút cancel, retry, promote.

### 8.4. Màn model registry

- Danh sách model đã fine-tune.
- Trạng thái active/inactive/deprecated.
- Nút rollback, clone, gỡ active.
- Hiển thị model dùng gần đây trong generator.

### 8.5. Màn compare

- So sánh output trước/sau theo cùng một prompt.
- Chỉ ra khác biệt về tone, CTA, độ dài, độ tự nhiên.

## 9. Luồng tích hợp với generator

- Generator phải biết chọn model theo `base model`, `industry` và `active fine-tuned model`.
- Nếu không có model fine-tuned phù hợp thì fallback về model mặc định.
- Có route ưu tiên theo template hoặc project.
- Mỗi lần sinh nội dung cần lưu lại model được dùng để truy vết.
- Nếu model fine-tuned lỗi hoặc bị deactivate, generator tự fallback sang model an toàn.

## 10. Bảo mật, chi phí và vận hành

- Giới hạn số job theo plan.
- Báo trước chi phí ước tính trước khi submit.
- Không cho submit dataset quá lớn ngoài quota.
- Audit log mọi thao tác nhạy cảm.
- Mã hóa hoặc làm mờ dữ liệu nhạy cảm nếu cần.
- Timeout, retry và backoff cho provider call.
- Có cảnh báo khi job đứng quá lâu hoặc fail liên tiếp.
- Có trang trạng thái provider nếu dịch vụ ngoài bị lỗi.

## 11. Kế hoạch triển khai theo pha

### Pha 1: Nền tảng dữ liệu

- Chốt schema dataset, job, model, metric.
- Làm API tạo/list dataset.
- Làm validate dữ liệu và import CSV/JSONL.
- Làm UI dataset builder.

### Pha 2: Job orchestration

- Làm API tạo job, xem job, cancel, retry.
- Thêm worker nền và trạng thái job chuẩn.
- Kết nối notification và audit log.

### Pha 3: Provider integration

- Viết adapter cho OpenAI fine-tuning.
- Thiết kế lớp provider để sau này thay được sang local/hybrid.
- Làm polling/webhook cập nhật trạng thái.

### Pha 4: Model registry và routing

- Lưu model version sau khi job xong.
- Cho active/rollback.
- Nối model fine-tuned vào generator.

### Pha 5: Quan sát và kiểm soát

- Metric chart.
- Cost dashboard.
- Admin oversight.
- Cảnh báo thất bại và báo cáo chất lượng.

### Pha 6: Hoàn thiện nghiệm thu

- Smoke test end-to-end.
- Kiểm tra build frontend.
- Kiểm tra API response shape.
- Viết tài liệu vận hành và demo.

## 12. Tiêu chí hoàn thành

Tính năng fine-tuning chỉ được xem là xong khi:

- Người dùng tạo dataset được từ dữ liệu thật.
- Người dùng submit job và theo dõi được trạng thái thật.
- Provider integration hoạt động với ít nhất một provider chính.
- Model hoàn tất có thể được dùng trong generator.
- Có rollback nếu model mới không đạt.
- Admin xem được toàn bộ job và can thiệp khi cần.
- Có audit log, notification và quota.
- Frontend build pass, backend API pass smoke test.

## 13. Rủi ro và cách xử lý

- **Dataset kém chất lượng**: thêm validate, sample preview, cảnh báo trước khi submit.
- **Provider lỗi hoặc chậm**: retry, polling, trạng thái lỗi rõ ràng.
- **Chi phí tăng nhanh**: quota theo plan, ước tính cost trước khi submit.
- **Model mới kém hơn model cũ**: compare, rollback, chỉ activate khi đạt ngưỡng.
- **Dữ liệu nhạy cảm**: cảnh báo, lọc PII, audit log.
- **UI lệch backend**: typed service layer và response shape thống nhất.

## 14. Thứ tự làm tiếp

1. Chốt schema dataset/job/model/metric.
2. Làm dataset builder thật.
3. Làm job queue và provider adapter.
4. Làm job detail, log, metric và notification.
5. Làm model registry, activate/rollback.
6. Nối generator dùng model fine-tuned.
7. Làm admin oversight và quota.
8. Test end-to-end và viết demo script.
