# DANH SÁCH TOÀN BỘ MODELS CẦN THIẾT - AI COPYWRITER

**Căn cứ kiểm tra:** `README.md`, `DOCS.md`, `KE_HOACH_THUC_THI.md`, `KE_HOACH_1_TUAN_MVP.md` và các mock/service hiện có trong `frontend/src`.  
**Kết luận nhanh:** Kế hoạch MVP hiện tại mới liệt kê 10 models. Để bám đủ README/DOCS, backend cần tối thiểu 14 models chính. Nếu muốn đồng bộ toàn bộ UI đang có, nên chuẩn bị thêm 5 models mở rộng.

---

## 1. Kết luận kiểm tra models

### 1.1. Models đã có trong kế hoạch MVP hiện tại

- `User`
- `Content`
- `Project`
- `Template`
- `Plan`
- `Payment`
- `Notification`
- `AuditLog`
- `UsageLog`
- `PlagiarismReport`

### 1.2. Models còn thiếu so với README/DOCS

Các model này có trong README/DOCS nhưng chưa nằm trong danh sách MVP hiện tại:

- `Category`
- `Subscription`
- `FineTuneJob`
- `SystemSetting`

### 1.3. Models nên bổ sung vì frontend đã có màn hình/mock liên quan

Các model này không bắt buộc trong bảng collection chính của README, nhưng frontend hiện đã có màn hình hoặc mock tương ứng:

- `ApiKey`
- `ApiRequestLog`
- `AIModel`
- `ContactMessage`
- `BlogPost`

### 1.4. Kết luận về độ đủ

- Nếu chỉ làm **MVP nghiệm thu 1 tuần**, 10 models hiện tại có thể đủ để demo luồng chính, nhưng nên thêm `Category`, `Subscription`, `FineTuneJob`, `SystemSetting` ở mức schema tối thiểu để không lệch README.
- Nếu làm **đồ án hoàn chỉnh**, cần 14 models chính + 5 models mở rộng, tổng cộng 19 models.

---

## 2. Phân loại ưu tiên

| Priority | Models | Mục đích |
|---|---|---|
| P0 - MVP bắt buộc | `User`, `Content`, `Project`, `Template`, `Category`, `Notification`, `UsageLog`, `AuditLog` | Đủ chạy auth, generate, quản lý nội dung, template, dashboard và admin cơ bản. |
| P1 - Nên có trong MVP | `Plan`, `Subscription`, `Payment`, `SystemSetting` | Đủ giải thích billing, gói dịch vụ, cấu hình hệ thống trong demo. |
| P2 - Feature nâng cao | `FineTuneJob`, `PlagiarismReport`, `AIModel` | Phục vụ fine-tuning, plagiarism và quản lý model AI. |
| P3 - Mở rộng theo UI | `ApiKey`, `ApiRequestLog`, `ContactMessage`, `BlogPost` | Đồng bộ các màn API key, contact, blog/public content. |

---

## 3. Sơ đồ quan hệ dữ liệu tổng quan

```txt
User
├── Contents
│   ├── Project
│   ├── Template
│   ├── UsageLogs
│   └── PlagiarismReports
├── Projects
├── Templates
├── Notifications
├── Subscription
│   ├── Plan
│   └── Payments
├── FineTuneJobs
├── ApiKeys
│   └── ApiRequestLogs
└── AuditLogs

Category
└── Templates

SystemSetting
└── Cấu hình toàn hệ thống

AIModel
├── FineTuneJobs
└── Contents.modelUsed
```

---

## 4. Models chính theo README/DOCS

## 4.1. User

**Collection:** `users`  
**Priority:** P0  
**Mục đích:** Lưu tài khoản customer/admin, thông tin đăng nhập, trạng thái, vai trò.

### Fields đề xuất

| Field | Type | Required | Ghi chú |
|---|---|---|---|
| `name` | String | Yes | Tên hiển thị. |
| `email` | String | Yes | Lowercase, unique. |
| `password` | String | Yes | Bcrypt hash, `select: false`. |
| `googleId` | String | No | Dùng cho Google OAuth sau MVP. |
| `role` | String enum | Yes | `customer`, `premium`, `admin`; MVP có thể dùng `customer/admin`. |
| `adminRole` | String | No | `super_admin`, `content_manager`, `finance_manager`, `ai_engineer`, `analyst`. |
| `status` | String enum | Yes | `active`, `pending`, `rejected`, `locked`. |
| `avatar` | String | No | URL Cloudinary. |
| `isVerified` | Boolean | Yes | MVP default `true`. |
| `lastLoginAt` | Date | No | Cập nhật khi login. |
| `refreshTokenHash` | String | No | Nếu làm refresh token thật. |
| `resetPasswordToken` | String | No | Cho forgot password. |
| `resetPasswordExpires` | Date | No | Hạn token reset. |
| `emailVerifyToken` | String | No | Xác minh email. |
| `createdAt`, `updatedAt` | Date | Auto | timestamps. |

### Indexes

- `email` unique.
- `role`.
- `status`.
- `createdAt`.

### Quan hệ

- `User` 1-n `Content`
- `User` 1-n `Project`
- `User` 1-n `Notification`
- `User` 1-1 hoặc 1-n `Subscription`
- `User` 1-n `FineTuneJob`
- `User` 1-n `ApiKey`

---

## 4.2. Content

**Collection:** `contents`  
**Priority:** P0  
**Mục đích:** Lưu nội dung AI sinh ra, prompt đầu vào, output, model, tag, version.

### Fields đề xuất

| Field | Type | Required | Ghi chú |
|---|---|---|---|
| `userId` | ObjectId ref `User` | Yes | Chủ sở hữu content. |
| `projectId` | ObjectId ref `Project` | No | Nhóm vào project. |
| `templateId` | ObjectId ref `Template` | No | Template dùng để generate. |
| `title` | String | Yes | Tiêu đề content. |
| `type` | String | Yes | `blog`, `ad`, `email`, `product`, `social`, `seo`, `script`, `headline`. |
| `prompt` | String | Yes | Prompt gốc hoặc prompt cuối. |
| `promptInputs` | Object | No | Input form theo template. |
| `outputText` | String | Yes | Nội dung AI trả về. |
| `modelUsed` | String | Yes | `gpt-4o`, `llama`, `mock-ai`, fine-tuned id. |
| `tone` | String | No | Chuyên nghiệp, thân thiện, hài hước... |
| `language` | String | No | Default `vi`. |
| `temperature` | Number | No | Cấu hình AI. |
| `wordCount` | Number | No | Tính từ output. |
| `tags` | [String] | No | Tag tìm kiếm. |
| `isFavorite` | Boolean | Yes | Default `false`. |
| `versions` | Array Object | No | Lịch sử generate lại. |
| `status` | String enum | Yes | `draft`, `published`, `archived`. |
| `isDeleted` | Boolean | Yes | Soft delete. |
| `createdAt`, `updatedAt` | Date | Auto | timestamps. |

### Version object đề xuất

```json
{
  "outputText": "Nội dung phiên bản cũ",
  "prompt": "Prompt cũ",
  "modelUsed": "gpt-4o",
  "createdAt": "2026-05-20T00:00:00.000Z"
}
```

### Indexes

- `{ userId: 1, createdAt: -1 }`
- `{ userId: 1, projectId: 1 }`
- `{ userId: 1, isDeleted: 1 }`
- Text index: `title`, `outputText`, `tags`.

---

## 4.3. Template

**Collection:** `templates`  
**Priority:** P0  
**Mục đích:** Lưu prompt template hệ thống hoặc template cá nhân.

### Fields đề xuất

| Field | Type | Required | Ghi chú |
|---|---|---|---|
| `name` | String | Yes | Tên template. |
| `description` | String | No | Mô tả ngắn. |
| `categoryId` | ObjectId ref `Category` | No | Danh mục. |
| `type` | String | Yes | `blog`, `product`, `email`, `social`, `seo`, `ads`. |
| `systemPrompt` | String | Yes | Prompt có biến `{{variable}}`. |
| `variables` | [String] | No | Danh sách biến cần nhập. |
| `isSystem` | Boolean | Yes | Template hệ thống hay cá nhân. |
| `authorId` | ObjectId ref `User` | No | Null nếu là system template. |
| `status` | String enum | Yes | `active`, `inactive`, `archived`. |
| `usageCount` | Number | No | Thống kê lượt dùng. |
| `createdAt`, `updatedAt` | Date | Auto | timestamps. |

### Indexes

- `categoryId`
- `{ isSystem: 1, status: 1 }`
- `{ authorId: 1, createdAt: -1 }`
- Text index: `name`, `description`.

---

## 4.4. Category

**Collection:** `categories`  
**Priority:** P0  
**Mục đích:** Phân cấp danh mục cho template/content.

### Fields đề xuất

| Field | Type | Required | Ghi chú |
|---|---|---|---|
| `name` | String | Yes | Tên danh mục. |
| `slug` | String | Yes | Unique. |
| `description` | String | No | Mô tả. |
| `parentId` | ObjectId ref `Category` | No | Danh mục cha. |
| `icon` | String | No | Tên icon nếu UI cần. |
| `color` | String | No | Mã màu UI. |
| `sortOrder` | Number | No | Thứ tự hiển thị. |
| `isActive` | Boolean | Yes | Default `true`. |
| `createdAt`, `updatedAt` | Date | Auto | timestamps. |

### Indexes

- `slug` unique.
- `parentId`.
- `{ isActive: 1, sortOrder: 1 }`.

---

## 4.5. Project

**Collection:** `projects`  
**Priority:** P0  
**Mục đích:** Nhóm nhiều content theo chiến dịch/chủ đề.

### Fields đề xuất

| Field | Type | Required | Ghi chú |
|---|---|---|---|
| `userId` | ObjectId ref `User` | Yes | Chủ project. |
| `name` | String | Yes | Tên project. |
| `description` | String | No | Mô tả. |
| `status` | String enum | Yes | `active`, `archived`. |
| `isArchived` | Boolean | Yes | Default `false`. |
| `color` | String | No | UI folder color. |
| `contentCount` | Number | No | Có thể denormalize hoặc tính động. |
| `createdAt`, `updatedAt` | Date | Auto | timestamps. |

### Indexes

- `{ userId: 1, createdAt: -1 }`
- `{ userId: 1, isArchived: 1 }`

---

## 4.6. Plan

**Collection:** `plans`  
**Priority:** P1  
**Mục đích:** Cấu hình gói Free/Pro/Business/Enterprise.

### Fields đề xuất

| Field | Type | Required | Ghi chú |
|---|---|---|---|
| `name` | String | Yes | Free, Pro, Business, Enterprise. |
| `slug` | String | Yes | Unique. |
| `description` | String | No | Mô tả gói. |
| `price` | Number | Yes | Giá tháng, VND hoặc cents. |
| `currency` | String | Yes | Default `VND`. |
| `billingCycle` | String enum | Yes | `monthly`, `yearly`, `custom`. |
| `limits` | Object | Yes | Token/content/project/API/fine-tune limits. |
| `features` | [String] | No | Danh sách tính năng. |
| `stripeProductId` | String | No | Dùng khi tích hợp Stripe. |
| `stripePriceId` | String | No | Dùng khi checkout. |
| `isActive` | Boolean | Yes | Default `true`. |
| `isPopular` | Boolean | No | UI badge. |
| `sortOrder` | Number | No | Thứ tự hiển thị. |
| `createdAt`, `updatedAt` | Date | Auto | timestamps. |

### Limits object đề xuất

```json
{
  "monthlyContents": 500,
  "monthlyTokens": 100000,
  "projects": 20,
  "apiCalls": 5000,
  "fineTuneJobs": 3,
  "modelsAllowed": ["gpt-4o", "llama"]
}
```

### Indexes

- `slug` unique.
- `{ isActive: 1, sortOrder: 1 }`.

---

## 4.7. Subscription

**Collection:** `subscriptions`  
**Priority:** P1  
**Mục đích:** Lưu gói hiện tại của user và trạng thái đăng ký.

### Fields đề xuất

| Field | Type | Required | Ghi chú |
|---|---|---|---|
| `userId` | ObjectId ref `User` | Yes | Người đăng ký. |
| `planId` | ObjectId ref `Plan` | Yes | Gói hiện tại. |
| `status` | String enum | Yes | `active`, `trialing`, `past_due`, `canceled`, `expired`. |
| `startedAt` | Date | Yes | Ngày bắt đầu. |
| `currentPeriodStart` | Date | No | Chu kỳ hiện tại. |
| `currentPeriodEnd` | Date | No | Hạn gói. |
| `cancelAtPeriodEnd` | Boolean | Yes | Default `false`. |
| `stripeCustomerId` | String | No | Stripe customer. |
| `stripeSubscriptionId` | String | No | Stripe subscription. |
| `metadata` | Object | No | Ghi chú mở rộng. |
| `createdAt`, `updatedAt` | Date | Auto | timestamps. |

### Indexes

- `{ userId: 1, status: 1 }`
- `stripeSubscriptionId`.

---

## 4.8. Payment

**Collection:** `payments`  
**Priority:** P1  
**Mục đích:** Lưu lịch sử thanh toán, hóa đơn, webhook result.

### Fields đề xuất

| Field | Type | Required | Ghi chú |
|---|---|---|---|
| `userId` | ObjectId ref `User` | Yes | Người thanh toán. |
| `planId` | ObjectId ref `Plan` | No | Gói mua. |
| `subscriptionId` | ObjectId ref `Subscription` | No | Subscription liên quan. |
| `amount` | Number | Yes | Số tiền. |
| `currency` | String | Yes | Default `VND`. |
| `status` | String enum | Yes | `pending`, `success`, `failed`, `refunded`. |
| `method` | String | No | Stripe, MoMo, VNPAY, bank. |
| `provider` | String | No | `stripe`, `momo`, `manual`. |
| `providerPaymentId` | String | No | ID từ cổng thanh toán. |
| `invoiceUrl` | String | No | URL hóa đơn. |
| `paidAt` | Date | No | Ngày thanh toán. |
| `metadata` | Object | No | Payload webhook rút gọn. |
| `createdAt`, `updatedAt` | Date | Auto | timestamps. |

### Indexes

- `{ userId: 1, createdAt: -1 }`
- `providerPaymentId`.
- `status`.

---

## 4.9. FineTuneJob

**Collection:** `fineTuneJobs`  
**Priority:** P2  
**Mục đích:** Theo dõi job fine-tuning model AI.

### Fields đề xuất

| Field | Type | Required | Ghi chú |
|---|---|---|---|
| `userId` | ObjectId ref `User` | Yes | Người tạo job. |
| `name` | String | Yes | Tên model fine-tune. |
| `industry` | String | No | Ngành: ecommerce, realestate, healthcare... |
| `baseModel` | String | Yes | GPT-4o, Llama... |
| `datasetUrl` | String | No | File CSV/JSONL trên Cloudinary. |
| `datasetStats` | Object | No | Số sample, dung lượng, quality score. |
| `status` | String enum | Yes | `queued`, `pending`, `training`, `completed`, `failed`, `canceled`. |
| `progress` | Number | No | 0-100. |
| `epochs` | Number | No | Số epoch. |
| `loss` | Number | No | Training loss. |
| `accuracy` | Number | No | Metric demo. |
| `providerJobId` | String | No | ID job OpenAI/Ollama. |
| `fineTunedModelId` | String | No | ID model sau khi train. |
| `errorMessage` | String | No | Lỗi nếu failed. |
| `startedAt` | Date | No | Bắt đầu train. |
| `finishedAt` | Date | No | Kết thúc train. |
| `createdAt`, `updatedAt` | Date | Auto | timestamps. |

### Indexes

- `{ userId: 1, createdAt: -1 }`
- `status`.
- `fineTunedModelId`.

---

## 4.10. Notification

**Collection:** `notifications`  
**Priority:** P0  
**Mục đích:** Lưu thông báo hệ thống, billing, AI, tài khoản.

### Fields đề xuất

| Field | Type | Required | Ghi chú |
|---|---|---|---|
| `userId` | ObjectId ref `User` | Yes | Người nhận. |
| `title` | String | Yes | Tiêu đề. |
| `message` | String | Yes | Nội dung. |
| `type` | String enum | Yes | `system`, `billing`, `ai`, `account`, `security`. |
| `isRead` | Boolean | Yes | Default `false`. |
| `readAt` | Date | No | Thời điểm đọc. |
| `actionUrl` | String | No | Link điều hướng trong app. |
| `metadata` | Object | No | Thông tin phụ. |
| `createdAt`, `updatedAt` | Date | Auto | timestamps. |

### Indexes

- `{ userId: 1, createdAt: -1 }`
- `{ userId: 1, isRead: 1 }`

---

## 4.11. UsageLog

**Collection:** `usageLogs`  
**Priority:** P0  
**Mục đích:** Ghi nhận usage AI/API để tính quota, dashboard, billing.

### Fields đề xuất

| Field | Type | Required | Ghi chú |
|---|---|---|---|
| `userId` | ObjectId ref `User` | Yes | Người dùng. |
| `contentId` | ObjectId ref `Content` | No | Content tạo ra. |
| `apiKeyId` | ObjectId ref `ApiKey` | No | Nếu gọi qua API key. |
| `action` | String | Yes | `generate`, `plagiarism_check`, `fine_tune`, `api_call`. |
| `model` | String | No | Model dùng. |
| `promptTokens` | Number | Yes | Default 0. |
| `completionTokens` | Number | Yes | Default 0. |
| `totalTokens` | Number | Yes | Tổng token. |
| `cost` | Number | No | Chi phí ước tính. |
| `latencyMs` | Number | No | Thời gian xử lý. |
| `status` | String enum | Yes | `success`, `failed`. |
| `metadata` | Object | No | Request metadata. |
| `createdAt`, `updatedAt` | Date | Auto | timestamps. |

### Indexes

- `{ userId: 1, createdAt: -1 }`
- `{ userId: 1, action: 1 }`
- `{ createdAt: -1 }`

---

## 4.12. AuditLog

**Collection:** `auditLogs`  
**Priority:** P0/P1  
**Mục đích:** Ghi hành động nhạy cảm của admin/user/system.

### Fields đề xuất

| Field | Type | Required | Ghi chú |
|---|---|---|---|
| `actorId` | ObjectId ref `User` | No | Người thực hiện. |
| `actorEmail` | String | No | Denormalize để xem nhanh. |
| `actorRole` | String | No | Role lúc thực hiện. |
| `action` | String | Yes | `auth.login`, `content.generate`, `payment.success`, `admin.settings.update`. |
| `targetType` | String | No | `User`, `Content`, `Plan`... |
| `targetId` | String | No | ID object bị tác động. |
| `level` | String enum | Yes | `info`, `warning`, `error`, `critical`. |
| `details` | String | No | Mô tả ngắn. |
| `metadata` | Object | No | Payload rút gọn. |
| `ip` | String | No | IP request. |
| `userAgent` | String | No | Trình duyệt/client. |
| `createdAt`, `updatedAt` | Date | Auto | timestamps. |

### Indexes

- `{ action: 1, createdAt: -1 }`
- `{ actorId: 1, createdAt: -1 }`
- `level`.

---

## 4.13. SystemSetting

**Collection:** `systemSettings`  
**Priority:** P1  
**Mục đích:** Lưu cấu hình hệ thống từ admin settings.

### Fields đề xuất

| Field | Type | Required | Ghi chú |
|---|---|---|---|
| `key` | String | Yes | Unique, ví dụ `site.name`, `ai.defaultModel`. |
| `value` | Mixed | Yes | Giá trị linh hoạt. |
| `type` | String enum | Yes | `string`, `number`, `boolean`, `json`, `secret`. |
| `group` | String | Yes | `general`, `ai`, `email`, `security`, `billing`. |
| `label` | String | No | Tên hiển thị. |
| `description` | String | No | Mô tả. |
| `isSecret` | Boolean | Yes | Che API key/password. |
| `updatedBy` | ObjectId ref `User` | No | Admin cập nhật. |
| `createdAt`, `updatedAt` | Date | Auto | timestamps. |

### Indexes

- `key` unique.
- `group`.

---

## 4.14. PlagiarismReport

**Collection:** `plagiarismReports`  
**Priority:** P2  
**Mục đích:** Lưu kết quả kiểm tra đạo văn.

### Fields đề xuất

| Field | Type | Required | Ghi chú |
|---|---|---|---|
| `userId` | ObjectId ref `User` | Yes | Người kiểm tra. |
| `contentId` | ObjectId ref `Content` | No | Content liên quan. |
| `checkText` | String | Yes | Text đem kiểm tra. |
| `similarityScore` | Number | Yes | 0-100. |
| `status` | String enum | Yes | `completed`, `failed`, `processing`. |
| `matches` | Array Object | No | Các đoạn trùng. |
| `sources` | Array Object | No | Nguồn web/database. |
| `modelUsed` | String | No | Embedding model. |
| `threshold` | Number | No | Ví dụ 85. |
| `createdAt`, `updatedAt` | Date | Auto | timestamps. |

### Match object đề xuất

```json
{
  "start": 10,
  "end": 50,
  "matchedText": "Đoạn bị trùng",
  "sourceText": "Đoạn nguồn",
  "sourceUrl": "https://example.com",
  "score": 92
}
```

### Indexes

- `{ userId: 1, createdAt: -1 }`
- `{ contentId: 1 }`
- `similarityScore`.

---

## 5. Models mở rộng nên có theo frontend hiện tại

## 5.1. AIModel

**Collection:** `aiModels`  
**Priority:** P2  
**Mục đích:** Phục vụ trang admin `/admin/models`, chọn model khi generate và fallback routing.

### Fields đề xuất

| Field | Type | Required | Ghi chú |
|---|---|---|---|
| `name` | String | Yes | Tên hiển thị: GPT-4o, Llama 3.1. |
| `slug` | String | Yes | Unique. |
| `provider` | String enum | Yes | `openai`, `ollama`, `local`, `custom`. |
| `type` | String enum | Yes | `cloud`, `local`, `fine_tuned`. |
| `baseModel` | String | No | Model nền. |
| `fineTuneJobId` | ObjectId ref `FineTuneJob` | No | Nếu là fine-tuned model. |
| `status` | String enum | Yes | `active`, `inactive`, `deleted`. |
| `contextWindow` | Number | No | Ví dụ 128000. |
| `costPer1kTokens` | Number | No | Chi phí ước tính. |
| `latencyMs` | Number | No | Độ trễ trung bình. |
| `accuracyScore` | Number | No | Metric demo. |
| `systemPrompt` | String | No | Prompt mặc định. |
| `config` | Object | No | temperature, maxTokens, endpoint... |
| `createdAt`, `updatedAt` | Date | Auto | timestamps. |

### Indexes

- `slug` unique.
- `{ provider: 1, status: 1 }`.

---

## 5.2. ApiKey

**Collection:** `apiKeys`  
**Priority:** P3  
**Mục đích:** Phục vụ màn customer API Keys và admin API Management.

### Fields đề xuất

| Field | Type | Required | Ghi chú |
|---|---|---|---|
| `userId` | ObjectId ref `User` | Yes | Chủ API key. |
| `name` | String | Yes | Production key, Test key... |
| `keyPrefix` | String | Yes | Ví dụ `cpk_live_abc`. |
| `keyHash` | String | Yes | Không lưu key plaintext. |
| `environment` | String enum | Yes | `test`, `live`. |
| `scopes` | [String] | Yes | `generate`, `templates`, `history`, `fine-tune`. |
| `status` | String enum | Yes | `active`, `revoked`, `suspended`. |
| `lastUsedAt` | Date | No | Lần dùng cuối. |
| `expiresAt` | Date | No | Hạn key. |
| `rateLimitPerMinute` | Number | No | Giới hạn riêng. |
| `createdAt`, `updatedAt` | Date | Auto | timestamps. |

### Indexes

- `keyPrefix`.
- `keyHash` unique.
- `{ userId: 1, status: 1 }`.

---

## 5.3. ApiRequestLog

**Collection:** `apiRequestLogs`  
**Priority:** P3  
**Mục đích:** Log request API key, monitor traffic/rate limit.

### Fields đề xuất

| Field | Type | Required | Ghi chú |
|---|---|---|---|
| `apiKeyId` | ObjectId ref `ApiKey` | No | Key được dùng. |
| `userId` | ObjectId ref `User` | No | Chủ key. |
| `method` | String | Yes | GET/POST/PATCH. |
| `endpoint` | String | Yes | `/api/v1/generate`. |
| `statusCode` | Number | Yes | HTTP status. |
| `model` | String | No | Model dùng. |
| `tokens` | Number | No | Token tiêu thụ. |
| `latencyMs` | Number | No | Độ trễ. |
| `ip` | String | No | Client IP. |
| `userAgent` | String | No | Client UA. |
| `errorMessage` | String | No | Nếu lỗi. |
| `createdAt`, `updatedAt` | Date | Auto | timestamps. |

### Indexes

- `{ userId: 1, createdAt: -1 }`
- `{ apiKeyId: 1, createdAt: -1 }`
- `{ endpoint: 1, createdAt: -1 }`
- `statusCode`.

---

## 5.4. ContactMessage

**Collection:** `contactMessages`  
**Priority:** P3  
**Mục đích:** Lưu form liên hệ từ trang public `/contact`.

### Fields đề xuất

| Field | Type | Required | Ghi chú |
|---|---|---|---|
| `name` | String | Yes | Người gửi. |
| `email` | String | Yes | Email liên hệ. |
| `subject` | String | No | Chủ đề. |
| `message` | String | Yes | Nội dung. |
| `category` | String | No | billing/support/sales... |
| `status` | String enum | Yes | `new`, `in_progress`, `resolved`, `spam`. |
| `assignedTo` | ObjectId ref `User` | No | Admin phụ trách. |
| `resolvedAt` | Date | No | Ngày xử lý. |
| `createdAt`, `updatedAt` | Date | Auto | timestamps. |

### Indexes

- `{ status: 1, createdAt: -1 }`
- `email`.

---

## 5.5. BlogPost

**Collection:** `blogPosts`  
**Priority:** P3  
**Mục đích:** Nếu muốn thay mock blog bằng CMS nội bộ.

### Fields đề xuất

| Field | Type | Required | Ghi chú |
|---|---|---|---|
| `title` | String | Yes | Tiêu đề. |
| `slug` | String | Yes | Unique. |
| `excerpt` | String | No | Mô tả ngắn. |
| `content` | String | Yes | Markdown/HTML. |
| `coverImage` | String | No | Ảnh bài viết. |
| `category` | String | No | AI, SEO, Marketing... |
| `tags` | [String] | No | Tags. |
| `authorId` | ObjectId ref `User` | No | Tác giả/admin. |
| `status` | String enum | Yes | `draft`, `published`, `archived`. |
| `publishedAt` | Date | No | Ngày xuất bản. |
| `createdAt`, `updatedAt` | Date | Auto | timestamps. |

### Indexes

- `slug` unique.
- `{ status: 1, publishedAt: -1 }`
- Text index: `title`, `excerpt`, `content`, `tags`.

---

## 6. Danh sách file model nên tạo trong backend

### 6.1. Bắt buộc để đủ README/DOCS

```txt
backend/src/models/User.js
backend/src/models/Content.js
backend/src/models/Template.js
backend/src/models/Category.js
backend/src/models/Project.js
backend/src/models/Plan.js
backend/src/models/Subscription.js
backend/src/models/Payment.js
backend/src/models/FineTuneJob.js
backend/src/models/Notification.js
backend/src/models/UsageLog.js
backend/src/models/SystemSetting.js
backend/src/models/AuditLog.js
backend/src/models/PlagiarismReport.js
```

### 6.2. Nên thêm để đồng bộ frontend mở rộng

```txt
backend/src/models/AIModel.js
backend/src/models/ApiKey.js
backend/src/models/ApiRequestLog.js
backend/src/models/ContactMessage.js
backend/src/models/BlogPost.js
```

---

## 7. Checklist triển khai models

### 7.1. Checklist schema

- [ ] Tất cả model có timestamps.
- [ ] Tất cả field liên kết dùng ObjectId ref đúng model.
- [ ] Field enum có default rõ ràng.
- [ ] Field password/API key/token không bao giờ trả plaintext.
- [ ] Các collection lớn có index theo `userId`, `createdAt`, `status`.
- [ ] Các slug/email/key có unique index.
- [ ] Có soft delete cho dữ liệu user-facing cần giữ lịch sử: `Content`, có thể thêm `Template`, `Project`.

### 7.2. Checklist seed data

- [ ] Tạo admin demo.
- [ ] Tạo customer demo.
- [ ] Tạo ít nhất 4 plans: Free, Pro, Business, Enterprise.
- [ ] Tạo categories template: Blog, SEO, Social, Email, Product.
- [ ] Tạo ít nhất 5 templates system.
- [ ] Tạo subscription active cho customer demo.
- [ ] Tạo 2-3 contents demo.
- [ ] Tạo 1 project demo.
- [ ] Tạo 2-3 notifications demo.
- [ ] Tạo system settings mặc định.

### 7.3. Checklist bảo mật

- [ ] `User.password` có `select: false`.
- [ ] `ApiKey.keyHash` chỉ lưu hash, chỉ hiện plaintext 1 lần khi tạo.
- [ ] `SystemSetting` có `isSecret` để che OpenAI key/SMTP password.
- [ ] `Payment.metadata` không lưu raw webhook quá lớn hoặc dữ liệu nhạy cảm không cần thiết.
- [ ] Audit log không lưu password/token.

---

## 8. Thứ tự triển khai khuyến nghị

### Giai đoạn 1 - MVP schema

1. `User`
2. `Category`
3. `Template`
4. `Project`
5. `Content`
6. `Notification`
7. `UsageLog`
8. `AuditLog`

### Giai đoạn 2 - Billing và cấu hình

9. `Plan`
10. `Subscription`
11. `Payment`
12. `SystemSetting`

### Giai đoạn 3 - AI nâng cao

13. `AIModel`
14. `FineTuneJob`
15. `PlagiarismReport`

### Giai đoạn 4 - API/public mở rộng

16. `ApiKey`
17. `ApiRequestLog`
18. `ContactMessage`
19. `BlogPost`

---

## 9. Tóm tắt cuối

Để **đủ theo README/DOCS**, cần 14 models:

1. `User`
2. `Content`
3. `Template`
4. `Category`
5. `Project`
6. `Plan`
7. `Subscription`
8. `Payment`
9. `FineTuneJob`
10. `Notification`
11. `UsageLog`
12. `SystemSetting`
13. `AuditLog`
14. `PlagiarismReport`

Để **đủ theo toàn bộ frontend hiện có**, nên có thêm 5 models:

15. `AIModel`
16. `ApiKey`
17. `ApiRequestLog`
18. `ContactMessage`
19. `BlogPost`

Kế hoạch MVP hiện tại chưa hoàn toàn đủ models vì thiếu `Category`, `Subscription`, `FineTuneJob`, `SystemSetting`. Nên bổ sung 4 model này vào kế hoạch backend để bám sát README và tránh thiếu khi báo cáo đồ án.
