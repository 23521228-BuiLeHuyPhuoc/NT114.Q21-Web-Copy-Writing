# KẾ HOẠCH 1 TUẦN MVP - AI COPYWRITER

**Thời gian:** 20/05/2026 - 26/05/2026  
**Cách tổ chức:** Module-first, bám theo 10 module trong `README.md`  
**Mục tiêu:** Hoàn thành bản MVP nghiệm thu có backend thật cho các luồng chính, frontend gọi API thật ở những màn hình demo, có dữ liệu demo, smoke test và kịch bản demo ổn định.

> Bản kế hoạch này thay cách làm "tạo toàn bộ models trước" bằng cách làm theo module. Module nào đang triển khai thì tạo đúng models, API, seed data và frontend mapping cần cho module đó. Các module lớn như Billing, Fine-tuning, Plagiarism vẫn có trong kế hoạch theo README, nhưng MVP chỉ làm mock/schema tối thiểu nếu chưa phục vụ trực tiếp demo.
>
> Cập nhật thiết kế Auth: không dùng chung một model `User` cho customer và admin. Backend sẽ tách `AccountUser`, `AccountAdmin` và dùng `ForgotPassword` để lưu OTP reset mật khẩu hết hạn sau 5 phút.

---

## 1. Nguyên tắc triển khai module-first

### 1.1. Ưu tiên theo mức độ nghiệm thu

| Mức | Ý nghĩa | Làm trong MVP |
|---|---|---|
| P0 | Bắt buộc để demo end-to-end | Nền backend, Auth, Generate/Content, Template, Project, Notification, Dashboard user, Admin cơ bản. |
| P1 | Nên có nếu P0 ổn | Audit log cơ bản, dashboard stats đẹp hơn, mark all notification, profile/update user, seed data đầy đủ hơn. |
| P2 | Để sau MVP nhưng vẫn ghi trong kế hoạch | Billing thật, Fine-tuning thật, Plagiarism embedding/web source, SSE streaming, Stripe webhook, Google OAuth, email production. |

### 1.2. Luật làm việc theo module

- Không tạo toàn bộ collection ngay từ đầu.
- Không mở module mới nếu module P0 trước đó chưa chạy được ở mức backend API + frontend gọi được hoặc có fallback rõ.
- Mỗi module phải có output cụ thể: endpoint chạy được, màn hình gọi được, seed data có thể demo, hoặc ghi rõ giữ mock.
- Nếu một việc bị kẹt quá 90 phút, ghi blocker và chọn fallback đơn giản hơn để giữ demo chạy.
- Code ưu tiên ổn định, dễ demo, dễ giải thích hơn là đầy đủ production nhưng dễ vỡ.

### 1.3. Định nghĩa "xong một module"

Một module được xem là xong trong MVP khi có đủ:

- Backend/API tối thiểu hoặc quyết định giữ mock rõ ràng.
- Model chỉ tạo nếu module cần lưu dữ liệu thật.
- Frontend service/page đã gọi API thật hoặc giữ mock có chủ đích.
- Seed/demo data đủ để trình bày.
- Smoke test ngắn cho luồng chính.
- Phần chưa làm được ghi vào "Sau MVP".

### 1.4. Luồng MVP cuối tuần

MVP đạt yêu cầu khi demo được 2 luồng:

- **User:** login -> dashboard -> generate content -> lưu content -> xem content list/detail -> tạo/xem project -> xem notification.
- **Admin:** login admin -> dashboard stats -> xem users -> xem contents -> kiểm tra dữ liệu user vừa tạo.

MVP chưa cần chứng minh:

- AI thật luôn hoạt động 100%, chỉ cần có generate fallback ổn định.
- Stripe/payment production.
- Fine-tuning production.
- Plagiarism bằng embedding/web search thật.
- SSE streaming real-time.

---

## 2. Tình trạng hiện tại

### 2.1. Frontend hiện tại

- Đã có Next.js/App Router.
- Đã có nhiều route public, customer, admin.
- Đã có service layer và React Query hooks.
- `frontend/src/lib/axios.ts` đã có base URL `NEXT_PUBLIC_API_BASE_URL` và interceptor gắn `auth_token`.
- Auth store vẫn dùng mock user trong `localStorage`.
- Nhiều service đang trả mock data: content, project, notification, payment, fine-tuning, plagiarism, audit log.
- Đã bổ sung UI quên mật khẩu riêng cho admin tại `/admin/forgot-password`, hiện dùng OTP demo `123456` và sau này sẽ nối `/api/auth/admin/*`.

### 2.2. Backend hiện tại

- Module 0 đã dựng nền Express: `src/app.js`, `src/server.js`, `src/config/database.js`, middleware CORS/Helmet/Morgan/JSON parser, `/api/health`, error handler, `asyncHandler`, `createError`, `validate`.
- `backend/package.json` đã có scripts `dev/start/seed` và dependencies nền cho Express/Mongoose.
- `backend/.env.example` đã có `PORT`, `NODE_ENV`, `MONGODB_URI`, `FRONTEND_URL`.
- Chưa có models nghiệp vụ, routes nghiệp vụ, controllers nghiệp vụ.
- Chưa có JWT auth, phân quyền, seed data.

### 2.3. Cách xử lý khoảng cách hiện tại

- Dựng backend nền trước để mọi module dùng chung.
- Làm Auth trước vì tất cả module user/admin phụ thuộc token.
- Làm Generate/Content trước vì đây là tính năng chính của đề tài.
- Làm Template, Project, Notification để hoàn chỉnh user flow.
- Làm Dashboard và Admin để có luồng nghiệm thu rõ.
- Các module còn lại vẫn xuất hiện trong kế hoạch theo README, nhưng không ép làm production trong 1 tuần.

---

## 3. Kiến trúc và convention chung

### 3.1. Backend folder structure tối thiểu

Tạo dần theo module, không bắt buộc tạo đủ file ngay ngày đầu:

```txt
backend/src/
├── app.js
├── server.js
├── config/
│   └── database.js
├── controllers/
├── middlewares/
├── models/
├── routes/
├── services/
├── utils/
└── validations/
```

Khi module nào cần thì thêm file tương ứng, ví dụ module Auth mới thêm `authController.js`, `authRoutes.js`, `AccountUser.js`, `AccountAdmin.js`, `ForgotPassword.js`, `authValidation.js`.

### 3.2. Backend dependencies

Đã cài cho Module 0:

- `express`
- `mongoose`
- `dotenv`
- `cors`
- `helmet`
- `morgan`
- `joi`

Dev:

- `nodemon`

Module 1 cần bổ sung khi triển khai Auth:

- `bcrypt`
- `jsonwebtoken`
- `express-rate-limit`

Chỉ thêm nếu thật sự dùng trong module sau:

- `openai` cho AI thật.
- `stripe` cho Billing sau MVP.
- `multer` cho Fine-tuning/upload sau MVP.
- `cookie-parser`, `nodemailer`, `passport`, `passport-google-oauth20` sau MVP.

Scripts tối thiểu:

```json
{
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "seed": "node src/utils/seed.js"
  }
}
```

### 3.3. Env tối thiểu

`backend/.env.example`:

```env
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/ai-copywriter
JWT_SECRET=change_me_in_real_env
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
OPENAI_API_KEY=
```

`frontend/.env.local.example`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
```

### 3.4. API convention

Base API:

```txt
/api
```

Response thành công:

```json
{
  "success": true,
  "message": "OK",
  "data": {}
}
```

Response danh sách:

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 0,
      "totalPages": 0
    }
  }
}
```

Response lỗi:

```json
{
  "success": false,
  "message": "Validation error",
  "errors": []
}
```

### 3.5. Auth convention

- Frontend gửi token qua header: `Authorization: Bearer <token>`.
- Token lưu ở `localStorage` key `auth_token`.
- User info lưu ở `localStorage` key `user` để tương thích UI hiện tại.
- Backend tách collection:
  - `AccountUser` cho customer.
  - `AccountAdmin` cho admin.
  - `ForgotPassword` cho OTP reset mật khẩu của cả customer/admin.
- Response auth vẫn trả shape chung cho frontend:
  - `role: "customer"` nếu đăng nhập từ `AccountUser`.
  - `role: "admin"` nếu đăng nhập từ `AccountAdmin`.
- Admin route kiểm tra `role === "admin"`.
- Auth API tách riêng:
  - `/api/auth/user/*`
  - `/api/auth/admin/*`

---

## 4. Thứ tự triển khai theo module

| Thứ tự | Module | Ưu tiên | Kết quả cần đạt |
|---|---|---|---|
| 0 | Nền backend + database + response format | P0 | Server chạy, MongoDB connect, `/api/health` OK. |
| 1 | Module 1 - Xác thực & Tài khoản | P0 | `AccountUser`, `AccountAdmin`, JWT, forgot password OTP 5 phút, user/admin demo. |
| 2 | Module 2 - Sinh Nội Dung AI | P0 | Generate có fallback, lưu Content, UsageLog. |
| 3 | Module 4 - Template | P0 | List template system, dùng template khi generate. |
| 4 | Module 5 - Quản Lý Dự Án | P0 | Tạo/list project, gắn content vào project. |
| 5 | Module 7 - Thông Báo | P0 | List/read/read-all notification, tạo notification khi generate. |
| 6 | Module 9 - Dashboard Người Dùng | P0/P1 | Stats thật từ content/usage/notification. |
| 7 | Module 10 - Quản Trị Admin | P0/P1 | Admin stats, users, contents, audit logs cơ bản. |
| 8 | Module 6 - Billing & Gói Dịch Vụ | P1/P2 | Seed plan/mock billing, chưa Stripe thật. |
| 9 | Module 3 - Fine-tuning Model AI | P2 | Giữ mock/schema tối thiểu, chưa train thật. |
| 10 | Module 8 - Trang Công Khai | P1 | Giữ UI public hiện có, contact có thể mock. |
| 11 | Advanced - Plagiarism Detection | P2 | Giữ mock/schema tối thiểu, chưa embedding/web search. |

---

## 5. Module 0 - Nền backend + database

**Trạng thái hiện tại:** Đã triển khai nền Express, health check, database connector, middleware chung, error handler và helper. Chưa tạo model nghiệp vụ, đúng phạm vi Module 0.

### Mục tiêu

Dựng nền Express để các module sau gắn route dần, chưa tạo toàn bộ model.

### Backend cần làm

- Chuẩn hóa `backend/package.json`.
- Tạo `src/server.js`, `src/app.js`.
- Tạo `src/config/database.js`.
- Gắn middleware chung: CORS, Helmet, Morgan, JSON parser.
- Tạo `/api/health`.
- Tạo not found handler và error handler format thống nhất.
- Tạo helper chung khi cần:
  - `asyncHandler`
  - `createError`
  - `validate`

### API tối thiểu

| Method | Endpoint | Auth | Mục đích |
|---|---|---|---|
| GET | `/api/health` | Không | Kiểm tra server sống. |

Expected:

```json
{
  "success": true,
  "message": "API is running",
  "data": {
    "service": "ai-copywriter-api"
  }
}
```

### Models cần tạo lúc này

- Chưa cần tạo model nghiệp vụ.
- Chỉ cấu hình database và helper để module sau thêm model.

### Acceptance

- `npm run dev` hoặc `yarn dev` start được backend.
- `GET /api/health` trả `success: true`.
- Sai route trả JSON 404.
- Lỗi server trả JSON thống nhất.
- MongoDB connect được nếu `MONGODB_URI` đúng.

---

## 6. Module 1 - Xác Thực & Tài Khoản

### Mục tiêu

Thay auth mock bằng auth thật đủ cho user/admin demo, nhưng không gom customer và admin vào cùng một model.

Thiết kế chốt:

- Customer dùng model `AccountUser`.
- Admin dùng model `AccountAdmin`.
- OTP quên mật khẩu dùng model `ForgotPassword`, phân biệt bằng `accountType: "user" | "admin"`.
- API auth tách riêng user/admin để nghiệp vụ rõ ràng.
- Frontend vẫn giữ shape `user` chung trong `localStorage` để UI hiện tại không vỡ.

### Backend cần làm

- Tạo model `AccountUser`.
- Tạo model `AccountAdmin`.
- Tạo model `ForgotPassword`.
- Tạo JWT helper.
- Tạo bcrypt hash/compare password.
- Tạo Joi validation cho register/login/forgot-password/verify-otp/reset-password.
- Tạo auth middleware:
  - `protect`
  - `requireRole('admin')`
- Tạo auth controller/routes tách theo user/admin.
- Tạo OTP helper:
  - sinh OTP 6 chữ số;
  - hash OTP trước khi lưu;
  - expires sau 5 phút;
  - đánh dấu `usedAt` sau khi reset thành công;
  - tăng `attempts` khi nhập sai.
- Seed user/admin demo.

### API tối thiểu

User auth:

| Method | Endpoint | Auth | Body | Mục đích |
|---|---|---|---|---|
| POST | `/api/auth/user/register` | Không | `name`, `email`, `password` | Đăng ký customer. |
| POST | `/api/auth/user/login` | Không | `email`, `password` | Đăng nhập customer. |
| GET | `/api/auth/user/me` | Có | Không | Lấy customer hiện tại. |
| POST | `/api/auth/user/logout` | Có | Không | Trả OK, frontend xóa token. |
| POST | `/api/auth/user/forgot-password` | Không | `email` | Tạo OTP reset mật khẩu customer. |
| POST | `/api/auth/user/verify-otp` | Không | `email`, `otp` | Xác nhận OTP customer. |
| POST | `/api/auth/user/reset-password` | Không | `email`, `otp`, `newPassword` | Đặt mật khẩu customer mới. |

Admin auth:

| Method | Endpoint | Auth | Body | Mục đích |
|---|---|---|---|---|
| POST | `/api/auth/admin/register` | Không | `name`, `email`, `password`, `adminRole?`, `inviteCode?` | Đăng ký admin chờ duyệt. |
| POST | `/api/auth/admin/login` | Không | `email`, `password` | Đăng nhập admin. |
| GET | `/api/auth/admin/me` | Có | Không | Lấy admin hiện tại. |
| POST | `/api/auth/admin/logout` | Có | Không | Trả OK, frontend xóa token. |
| POST | `/api/auth/admin/forgot-password` | Không | `email` | Tạo OTP reset mật khẩu admin. |
| POST | `/api/auth/admin/verify-otp` | Không | `email`, `otp` | Xác nhận OTP admin. |
| POST | `/api/auth/admin/reset-password` | Không | `email`, `otp`, `newPassword` | Đặt mật khẩu admin mới. |

Login response:

```json
{
  "success": true,
  "data": {
    "token": "jwt_token",
    "user": {
      "id": "...",
      "name": "Demo Customer",
      "email": "customer@copypro.vn",
      "role": "customer",
      "status": "active"
    }
  }
}
```

### Models cần tạo lúc này

`AccountUser`:

- `name`
- `email`
- `password`
- `status`: `active`, `locked`
- `avatar`
- `isVerified`
- `lastLoginAt`
- timestamps

`AccountAdmin`:

- `name`
- `email`
- `password`
- `adminRole`
- `status`: `active`, `pending`, `rejected`, `locked`
- `avatar`
- `lastLoginAt`
- timestamps

`ForgotPassword`:

- `email`
- `accountType`: `user`, `admin`
- `accountId`
- `otpHash`
- `expiresAt`
- `usedAt`
- `attempts`
- timestamps

Indexes cần có:

- `AccountUser.email` unique.
- `AccountAdmin.email` unique.
- `ForgotPassword.expiresAt` TTL index với `expireAfterSeconds: 0`.
- `ForgotPassword` index `{ email: 1, accountType: 1, createdAt: -1 }`.

Không tạo `Plan`, `Payment`, `Content` ở module này nếu chưa dùng.

### Frontend cần nối

Files chính:

- `frontend/src/stores/authStore.ts`
- `frontend/src/app/contexts/AuthContext.tsx`
- `frontend/src/app/route-guards.tsx`
- `frontend/src/lib/axios.ts`
- `frontend/src/app/pages/auth/LoginPage.tsx`
- `frontend/src/app/pages/auth/AdminLoginPage.tsx`
- `frontend/src/app/pages/auth/ForgotPasswordPage.tsx`
- `frontend/src/app/pages/auth/AdminForgotPasswordPage.tsx`

Việc cần làm:

- `/login` gọi `POST /api/auth/user/login`.
- `/admin/login` gọi `POST /api/auth/admin/login`.
- `/register` gọi `POST /api/auth/user/register`.
- `/admin/register` gọi `POST /api/auth/admin/register`.
- `/forgot-password` gọi nhóm API `/api/auth/user/*`.
- `/admin/forgot-password` gọi nhóm API `/api/auth/admin/*`.
- `hydrate()` gọi đúng endpoint `me` theo role/account type đã lưu.
- `logout()` xóa `auth_token` và `user`.
- Giữ shape user tương thích UI: `id`, `email`, `name`, `role`, `adminRole`, `status`.
- Role trong UI vẫn là:
  - `customer` cho `AccountUser`.
  - `admin` cho `AccountAdmin`.

### Seed/demo data

| Role | Email | Password | Ghi chú |
|---|---|---|---|
| AccountUser | `customer@copypro.vn` | `customer123` | Demo luồng user. |
| AccountAdmin | `admin@copypro.vn` | `admin123` | Demo luồng admin, `adminRole: super_admin`, `status: active`. |

### Acceptance

- User login đúng trả token + `role: "customer"`.
- Admin login đúng trả token + `role: "admin"`.
- Login sai trả `401`.
- Password trong DB không phải plain text.
- `GET /api/auth/user/me` chạy với Bearer token user.
- `GET /api/auth/admin/me` chạy với Bearer token admin.
- User thường gọi admin route bị `403`.
- Refresh frontend vẫn giữ session nếu token hợp lệ.
- User không vào được `/admin`.
- Admin vào được `/admin`.
- `/admin/login` có link `Quên mật khẩu?` đi đến `/admin/forgot-password`.
- Forgot password user tạo OTP hết hạn sau 5 phút.
- Forgot password admin tạo OTP hết hạn sau 5 phút.
- OTP sai tăng `attempts`.
- OTP hết hạn không reset được.
- OTP đã dùng không dùng lại được.

### Sau MVP

- Refresh token thật.
- Google OAuth.
- Forgot/reset password gửi email production.
- Email verification.
- Upload avatar Cloudinary.

---

## 7. Module 2 - Sinh Nội Dung AI

### Mục tiêu

Hoàn thành tính năng lõi của đề tài: user generate nội dung, backend lưu DB, frontend xem lại được.

### Backend cần làm

- Tạo model `Content`.
- Tạo model `UsageLog`.
- Tạo `aiService.generateCopy()`.
- Generate có fallback ổn định khi không có `OPENAI_API_KEY` hoặc API ngoài lỗi.
- Tạo content routes/controllers.
- Mỗi lần generate:
  - nhận prompt/options;
  - gọi AI service;
  - lưu `Content`;
  - ghi `UsageLog`;
  - trả content vừa tạo.

### API tối thiểu

| Method | Endpoint | Auth | Body/Query | Mục đích |
|---|---|---|---|---|
| GET | `/api/contents` | Có | `page`, `limit`, `search`, `projectId?` | Danh sách content của user. |
| GET | `/api/contents/:id` | Có | Không | Chi tiết content. |
| POST | `/api/contents` | Có | `title`, `prompt`, `outputText`, `type`, `tags?` | Tạo content thủ công nếu UI cần. |
| PATCH | `/api/contents/:id` | Có | `title?`, `tags?`, `isFavorite?`, `projectId?` | Cập nhật content. |
| DELETE | `/api/contents/:id` | Có | Không | Xóa mềm content. |
| POST | `/api/contents/generate` | Có | `prompt`, `type`, `tone`, `language`, `model`, `templateId?`, `projectId?` | Generate và lưu content. |

### Models cần tạo lúc này

`Content`:

- `userId`: ref `AccountUser`
- `projectId`
- `templateId`
- `title`
- `prompt`
- `outputText`
- `type`
- `tone`
- `language`
- `modelUsed`
- `tags`
- `isFavorite`
- `wordCount`
- `isDeleted`
- timestamps

`UsageLog`:

- `userId`: ref `AccountUser`
- `contentId`
- `model`
- `promptTokens`
- `completionTokens`
- `totalTokens`
- `action`: `generate`
- `status`
- timestamps

### Frontend cần nối

Files chính:

- `frontend/src/services/contentService.ts`
- `frontend/src/hooks/queries/useContents.ts`
- `frontend/src/app/pages/customer/Generator.tsx`
- `frontend/src/app/pages/customer/Contents.tsx`
- `frontend/src/app/pages/customer/ContentDetail.tsx` nếu có

Việc cần làm:

- `contentService.list()` gọi `GET /contents`.
- `contentService.get(id)` gọi `GET /contents/:id`.
- Thêm `contentService.generate(payload)` gọi `POST /contents/generate`.
- Normalize response để UI vẫn dùng được các field hiện tại như `id`, `title`, `type`, `model`, `quality`, `words`, `createdAt`, `status`, `project`.
- Trang `/generate` gọi API generate thay vì chỉ dùng mock output local.
- Sau generate, hiển thị kết quả và có thể điều hướng/xem lại trong `/contents`.

### Seed/demo data

- 3 contents của customer demo.
- 1 content có tag `seo`.
- 1 content có `projectId` sau khi module Project có dữ liệu.

### Acceptance

- User chỉ thấy content của chính mình.
- User không xem được content của user khác.
- Generate tạo content thật trong DB.
- Generate tạo usage log.
- `/contents` thấy content vừa generate.
- API không crash khi id sai hoặc content không tồn tại.

### MVP fallback

- Nếu OpenAI/Ollama chưa sẵn sàng, `aiService` trả nội dung mock có cấu trúc đẹp.
- Không để demo phụ thuộc API AI bên ngoài.

### Sau MVP

- OpenAI SDK thật.
- Ollama local.
- SSE streaming.
- Version history.
- Export PDF/Word.
- Quality score thật.

---

## 8. Module 4 - Template

### Mục tiêu

Có thư viện prompt template để user chọn khi generate, đúng module README nhưng làm ở mức đủ demo.

### Backend cần làm

- Tạo model `Template`.
- Tạo model `Category` nếu cần quản lý category rõ hơn; nếu bị trễ, dùng field `category` string trong `Template`.
- Tạo template routes/controllers.
- Seed template system.
- Khi generate có `templateId`, backend lấy `systemPrompt` và ghép với input/prompt của user.

### API tối thiểu

| Method | Endpoint | Auth | Body/Query | Mục đích |
|---|---|---|---|---|
| GET | `/api/templates` | Có | `category?`, `type?` | List system + personal templates. |
| GET | `/api/templates/:id` | Có | Không | Chi tiết template. |
| POST | `/api/templates` | Có | `name`, `description`, `category`, `type`, `systemPrompt`, `variables?` | Tạo template cá nhân nếu kịp. |

### Models cần tạo lúc này

`Template`:

- `name`
- `description`
- `category` dạng chuỗi
- `type`
- `systemPrompt`
- `variables`
- `isSystem`
- `authorId`: ref `AccountUser` nếu template cá nhân; null nếu system template.
- `status`
- `usageCount`
- timestamps

`Category` chỉ tạo nếu thật sự nối admin categories hoặc cần bám README hơn:

- `name`
- `slug`
- `description`
- `parentId`
- `isActive`
- timestamps

### Frontend cần nối

Files/màn hình chính:

- `frontend/src/app/pages/customer/Templates.tsx`
- `frontend/src/app/pages/customer/Generator.tsx`
- Service template mới nếu chưa có, ví dụ `templateService.ts`.

Việc cần làm:

- `/templates` gọi `GET /templates`.
- `/generate` có thể dùng template seed để điền prompt hoặc gửi `templateId`.
- Nếu UI template hiện đang dùng component/mocks tĩnh, chỉ cần nối list template ở mức demo hoặc giữ phần showcase và thêm dữ liệu API ở generator.

### Seed/demo data

Tối thiểu 5 templates system:

- Blog SEO tiếng Việt.
- Mô tả sản phẩm.
- Caption mạng xã hội.
- Email marketing.
- Headline quảng cáo.

### Acceptance

- User thấy template system.
- User thấy template cá nhân của mình nếu có tạo.
- User không thấy template cá nhân của user khác.
- Generate có thể nhận `templateId`.
- Seed templates đủ để demo.

### MVP fallback

- Nếu chưa kịp `Category`, dùng `category` string trong `Template`.
- Nếu chưa kịp tạo template cá nhân, chỉ cần list system template.

### Sau MVP

- Category phân cấp parent/child.
- Admin quản lý template system.
- Template marketplace.
- Biến `{{variable}}` có form động hoàn chỉnh.

---

## 9. Module 5 - Quản Lý Dự Án

### Mục tiêu

User tạo project và gắn content vào project để demo quản lý nội dung theo chiến dịch.

### Backend cần làm

- Tạo model `Project`.
- Tạo project routes/controllers.
- Cho phép list/create/detail/update.
- Content có thể gắn `projectId`.
- Project list có `contentCount` tính động hoặc denormalize đơn giản.

### API tối thiểu

| Method | Endpoint | Auth | Body/Query | Mục đích |
|---|---|---|---|---|
| GET | `/api/projects` | Có | `page`, `limit`, `search?` | Danh sách project của user. |
| POST | `/api/projects` | Có | `name`, `description?` | Tạo project. |
| GET | `/api/projects/:id` | Có | Không | Chi tiết project. |
| PATCH | `/api/projects/:id` | Có | `name?`, `description?`, `isArchived?` | Cập nhật project. |

### Models cần tạo lúc này

`Project`:

- `userId`: ref `AccountUser`
- `name`
- `description`
- `isArchived`
- `color`
- timestamps

### Frontend cần nối

Files chính:

- `frontend/src/services/projectService.ts`
- `frontend/src/hooks/queries/useProjects.ts`
- `frontend/src/app/pages/customer/Projects.tsx`
- `frontend/src/app/pages/customer/ProjectDetail.tsx`
- `frontend/src/app/pages/customer/Generator.tsx` nếu chọn project khi generate.

Việc cần làm:

- `projectService.list()` gọi `GET /projects`.
- Thêm `projectService.create(payload)` gọi `POST /projects`.
- Dialog tạo project trên `/projects` gọi API thật và refetch.
- Normalize field cho UI: `id`, `name`, `desc`, `contents`, `industry`, `createdAt`, `status`, `color`.

### Seed/demo data

- 1 project demo cho customer.
- 1 content demo gắn vào project.

### Acceptance

- User chỉ thấy project của mình.
- Tạo project trong UI lưu vào DB.
- Project mới xuất hiện sau khi tạo.
- Content vừa generate có thể gắn project nếu UI gửi `projectId`.

### Sau MVP

- Archive/restore nâng cao.
- Team/member trong project.
- Project analytics.

---

## 10. Module 7 - Thông Báo

### Mục tiêu

User xem thông báo và đánh dấu đã đọc; generate thành công có thể tạo notification.

### Backend cần làm

- Tạo model `Notification`.
- Tạo notification routes/controllers.
- Tạo helper tạo notification khi generate thành công.
- Hỗ trợ read/read-all.

### API tối thiểu

| Method | Endpoint | Auth | Body/Query | Mục đích |
|---|---|---|---|---|
| GET | `/api/notifications` | Có | `page`, `limit`, `unreadOnly?` | Danh sách notification. |
| PATCH | `/api/notifications/:id/read` | Có | Không | Đánh dấu đã đọc. |
| PATCH | `/api/notifications/read-all` | Có | Không | Đánh dấu tất cả đã đọc. |

### Models cần tạo lúc này

`Notification`:

- `userId`: ref `AccountUser`
- `title`
- `message`
- `type`: `system`, `billing`, `ai`, `account`
- `isRead`
- `readAt`
- `actionUrl`
- timestamps

### Frontend cần nối

Files chính:

- `frontend/src/services/notificationService.ts`
- `frontend/src/hooks/queries/useNotifications.ts`
- `frontend/src/app/pages/customer/Notifications.tsx`
- Header notification nếu có.

Việc cần làm:

- `notificationService.list()` gọi `GET /notifications`.
- `notificationService.listHeader()` có thể gọi cùng API với limit nhỏ.
- Thêm `markRead(id)` và `markAllRead()`.
- Normalize field cho UI: `id`, `type`, `title`, `desc`, `time`, `read`.

### Seed/demo data

- 1 notification chào mừng.
- 1 notification hệ thống.
- 1 notification generate thành công hoặc tạo qua luồng generate.

### Acceptance

- User chỉ thấy notification của mình.
- Click notification đánh dấu đã đọc.
- Mark all read hoạt động.
- Generate thành công tạo notification nếu kịp.

### MVP fallback

- Nếu chưa kịp tạo notification tự động, seed sẵn notification demo.

### Sau MVP

- Email notification qua Nodemailer.
- Notification realtime.
- Preference nhận thông báo.

---

## 11. Module 9 - Dashboard Người Dùng

### Mục tiêu

Dashboard hiển thị số liệu thật ở mức đủ demo, thay vì toàn bộ số liệu tĩnh.

### Backend cần làm

- Tạo endpoint aggregate dashboard.
- Tính từ `Content`, `UsageLog`, `Project`, `Notification`.
- Không tạo model mới nếu các model trên đã có.

### API tối thiểu

| Method | Endpoint | Auth | Mục đích |
|---|---|---|---|
| GET | `/api/dashboard/stats` | Có | Stats dashboard của user. |

Response gợi ý:

```json
{
  "success": true,
  "data": {
    "totalContents": 12,
    "monthlyContents": 5,
    "totalTokens": 23000,
    "remainingQuota": 488,
    "currentPlan": "Free",
    "recentContents": [],
    "weeklyUsage": [],
    "unreadNotifications": 2
  }
}
```

### Models cần tạo lúc này

- Không tạo thêm nếu đã có `Content`, `UsageLog`, `Notification`.
- `Plan`/`Subscription` chưa bắt buộc; có thể trả `currentPlan: "Free"` hardcode từ service trong MVP.

### Frontend cần nối

Files chính:

- `frontend/src/app/pages/customer/Dashboard.tsx`
- Tạo `dashboardService.ts` hoặc dùng service hiện có nếu phù hợp.

Việc cần làm:

- Dashboard gọi `/dashboard/stats`.
- Nếu API lỗi, giữ fallback mock để không chết demo.
- Recent contents lấy từ API hoặc dùng `recentContents` trong stats.

### Acceptance

- Dashboard hiển thị tên user thật.
- Tổng content phản ánh DB.
- Recent contents có content vừa generate hoặc content seed.
- Nếu chưa có usage đủ đẹp, vẫn hiển thị số liệu gần đúng.

### Sau MVP

- Biểu đồ usage theo ngày/tháng thật.
- Quota theo plan/subscription thật.
- Model availability thật.

---

## 12. Module 10 - Quản Trị Admin

### Mục tiêu

Admin có thể xem số liệu hệ thống, danh sách `AccountUser` và contents thật từ database.

### Backend cần làm

- Tạo admin routes/controllers.
- Bảo vệ bằng `protect` + `requireRole('admin')`.
- Tạo stats aggregate.
- Tạo list users từ collection `AccountUser`.
- Tạo list contents.
- Tạo audit log cơ bản nếu kịp.

### API tối thiểu

| Method | Endpoint | Auth | Role | Mục đích |
|---|---|---|---|---|
| GET | `/api/admin/stats` | Có | admin | Tổng `AccountUser`, contents, usage, recent contents. |
| GET | `/api/admin/users` | Có | admin | Danh sách `AccountUser`. |
| PATCH | `/api/admin/users/:id` | Có | admin | Update status customer nếu kịp. |
| GET | `/api/admin/contents` | Có | admin | Danh sách tất cả content. |
| GET | `/api/admin/audit-logs` | Có | admin | Danh sách audit log nếu kịp. |

### Models cần tạo lúc này

`AuditLog` nếu làm audit:

- `actorId`
- `actorType`: `user`, `admin`, `system`
- `actorEmail`
- `actorRole`
- `action`
- `targetType`
- `targetId`
- `level`
- `metadata`
- `ip`
- timestamps

Không tạo `SystemSetting`, `Payment`, `AIModel` chỉ vì admin UI có màn hình nếu chưa nối API thật.

### Frontend cần nối

Files/màn hình chính:

- `frontend/src/app/pages/admin/Dashboard.tsx`
- `frontend/src/app/pages/admin/Users.tsx`
- `frontend/src/app/pages/admin/Contents.tsx`
- `frontend/src/services/auditLogService.ts` nếu nối audit logs.

Việc cần làm:

- `/admin` gọi `/api/admin/stats`.
- `/admin/users` gọi `/api/admin/users` để quản lý `AccountUser`.
- `/admin/contents` gọi `/api/admin/contents`.
- `/admin/forgot-password` đã có UI mock OTP, sau Module 1 sẽ gọi `/api/auth/admin/*`.
- Admin pages khác như payments/models/settings giữ mock hoặc ghi "đang phát triển".
- Normalize data để không phải refactor toàn bộ UI.

### Seed/demo data

- `AccountUser` demo.
- `AccountAdmin` demo.
- Contents demo.
- Audit log demo nếu có.

### Acceptance

- User thường gọi admin API bị `403`.
- Admin gọi `/api/admin/users` thấy `AccountUser` trong DB.
- Admin gọi `/api/admin/contents` thấy content user vừa generate.
- Admin dashboard có số liệu không còn hardcode toàn bộ.

### MVP fallback

- Nếu thiếu thời gian, admin chỉ cần dashboard/users/contents.
- Bỏ update user và audit logs nếu P0 chưa ổn.

### Sau MVP

- Admin templates/categories/plans/payments/models/settings thật.
- Phân quyền admin chi tiết theo `adminRole`.
- Audit log đầy đủ mọi hành động nhạy cảm.
- Soft delete/restore trong admin.

---

## 13. Module 6 - Thanh Toán & Gói Dịch Vụ

### Mục tiêu

Bám README về Billing, nhưng MVP không làm Stripe production. Chỉ cần dữ liệu plan/mock billing đủ giải thích.

### Backend cần làm trong MVP

- Tạo model `Plan` nếu dashboard/billing cần gói Free/Pro/Enterprise thật.
- Có thể seed plans.
- Không bắt buộc tạo API billing nếu frontend billing giữ mock.

### API theo README

```txt
/api/billing/*
```

MVP có thể chưa triển khai hoặc chỉ có:

| Method | Endpoint | Auth | Mục đích |
|---|---|---|---|
| GET | `/api/billing/plans` | Không/Có | List plans nếu muốn bỏ mock pricing. |
| GET | `/api/billing/me` | Có | Gói hiện tại của user nếu kịp. |

### Models tạo khi cần

`Plan`:

- `name`
- `slug`
- `price`
- `currency`
- `limits`
- `features`
- `isActive`
- timestamps

`Subscription` và `Payment` để sau MVP hoặc chỉ tạo schema tối thiểu nếu cần báo cáo:

- `Subscription`: `userId` ref `AccountUser`, `planId`, `status`, `currentPeriodEnd`.
- `Payment`: `userId` ref `AccountUser`, `planId`, `amount`, `currency`, `status`, `provider`.

### Frontend MVP

- `/billing` tiếp tục dùng mock nếu P0 chưa xong.
- Public `/pricing` có thể giữ dữ liệu tĩnh.
- Không để billing chặn demo user/admin.

### Seed/demo data

- Free.
- Pro.
- Enterprise.

### Acceptance MVP

- Có thể giải thích rõ Billing là module README đã có UI/mock và có hướng schema.
- Không có Stripe thật nhưng không ảnh hưởng demo chính.

### Sau MVP

- Stripe checkout.
- Stripe webhook.
- Subscription thật.
- Payment history thật.
- Quota theo plan thật.

---

## 14. Module 3 - Fine-tuning Model AI

### Mục tiêu

Ghi rõ hướng triển khai theo README, nhưng MVP chưa train model thật.

### Backend MVP

- Không bắt buộc làm API thật.
- Nếu cần báo cáo backend đã chuẩn bị, tạo schema `FineTuneJob` tối thiểu sau khi P0 xong.

### API theo README

```txt
/api/fine-tune/*
```

MVP có thể giữ mock frontend. Nếu kịp, thêm:

| Method | Endpoint | Auth | Mục đích |
|---|---|---|---|
| GET | `/api/fine-tune/jobs` | Có | List job demo. |
| POST | `/api/fine-tune/jobs` | Có | Tạo job demo status `pending`. |

### Models tạo khi cần

`FineTuneJob`:

- `userId`: ref `AccountUser`
- `name`
- `industry`
- `baseModel`
- `datasetUrl`
- `status`
- `progress`
- `providerJobId`
- `fineTunedModelId`
- timestamps

### Frontend MVP

- `/fine-tune` giữ mock hiện tại.
- Không nối API nếu content/auth/project/admin chưa ổn.

### Acceptance MVP

- Có màn hình demo/giải thích fine-tuning.
- Có câu trả lời rõ: production fine-tuning để sau MVP vì cần dataset, provider, chi phí và thời gian train.

### Sau MVP

- Upload dataset bằng Multer.
- Lưu Cloudinary.
- Gọi OpenAI fine-tuning hoặc Ollama/local pipeline.
- Theo dõi trạng thái job thật.
- Dùng fine-tuned model trong generate.

---

## 15. Module 8 - Trang Công Khai

### Mục tiêu

Giữ các trang public đã có để demo sản phẩm đầy đủ, không để public page làm chậm module backend lõi.

### Phạm vi MVP

Các route đã có:

- `/`
- `/pricing`
- `/about`
- `/blog`
- `/blog/:slug`
- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/contact`

### Backend MVP

- Không bắt buộc có backend cho public pages.
- Contact form có thể giữ mock/toast.
- Blog có thể giữ mock/static.

### API theo README nếu làm sau

- `/api/contact`
- `/api/blog`
- `/api/blog/:slug`

### Models tạo khi cần

Chỉ tạo sau MVP nếu thay mock bằng CMS/backend:

- `ContactMessage`
- `BlogPost`

### Acceptance MVP

- Public pages không crash.
- Login/register dẫn vào auth thật.
- Pricing không gây hiểu nhầm là Stripe đã production.

### Sau MVP

- Contact gửi email bằng Nodemailer.
- Blog CMS nội bộ.
- Lead capture.

---

## 16. Advanced - AI Plagiarism Detection

### Mục tiêu

Giữ tính năng nâng cao theo README, nhưng MVP chưa làm embedding/web search thật.

### Backend MVP

- Không bắt buộc làm API thật.
- Nếu cần bám README, tạo schema `PlagiarismReport` tối thiểu sau khi P0 ổn.

### API theo README

```txt
/api/plagiarism/*
```

MVP có thể giữ mock frontend. Nếu kịp, thêm:

| Method | Endpoint | Auth | Mục đích |
|---|---|---|---|
| POST | `/api/plagiarism/check` | Có | Trả report demo theo text. |
| GET | `/api/plagiarism/history` | Có | Lịch sử check demo. |

### Models tạo khi cần

`PlagiarismReport`:

- `userId`: ref `AccountUser`
- `contentId`
- `checkText`
- `similarityScore`
- `matches`
- `sources`
- `status`
- timestamps

### Frontend MVP

- `/plagiarism-check` giữ mock hiện tại.
- Không để plagiarism ảnh hưởng build/demo chính.

### Acceptance MVP

- Có màn hình hoặc mock để trình bày ý tưởng.
- Có giải thích rõ production cần embedding, similarity search, nguồn web/database.

### Sau MVP

- Text segmentation.
- Embedding.
- Cosine similarity.
- Web/source matching.
- Highlight đoạn trùng.
- Threshold cảnh báo.

---

## 17. Dữ liệu demo bắt buộc

### 17.1. Tài khoản

| Model | Email | Password | Ghi chú |
|---|---|---|---|
| AccountUser | `customer@copypro.vn` | `customer123` | Dùng demo luồng user. |
| AccountAdmin | `admin@copypro.vn` | `admin123` | Dùng demo luồng admin, `adminRole: super_admin`. |

### 17.2. Templates

Seed tối thiểu:

- Blog SEO tiếng Việt.
- Mô tả sản phẩm.
- Caption mạng xã hội.
- Email marketing.
- Headline quảng cáo.

### 17.3. Projects

- 1 project demo: `Campaign Hè 2026`.
- Có ít nhất 1 content gắn vào project.

### 17.4. Contents

- 3 contents của customer demo.
- 1 content có tag `seo`.
- 1 content sinh ra trực tiếp trong lúc demo.

### 17.5. Notifications

- 1 notification chào mừng.
- 1 notification hệ thống.
- 1 notification generate thành công.

### 17.6. Plans nếu làm Billing mock/schema

- Free.
- Pro.
- Enterprise.

---

## 18. Smoke test bắt buộc theo module

### 18.1. Backend smoke test

Chạy theo thứ tự:

- [ ] `GET /api/health` trả OK.
- [ ] `POST /api/auth/user/login` với `customer@copypro.vn/customer123` trả token.
- [ ] `GET /api/auth/user/me` với token user trả customer.
- [ ] `POST /api/auth/user/forgot-password` tạo OTP customer 6 số, hạn 5 phút.
- [ ] `GET /api/admin/users` với token user trả `403`.
- [ ] `POST /api/auth/admin/login` với `admin@copypro.vn/admin123` trả token admin.
- [ ] `GET /api/auth/admin/me` với token admin trả admin.
- [ ] `GET /api/admin/users` với token admin trả list.
- [ ] `POST /api/auth/admin/forgot-password` tạo OTP admin 6 số, hạn 5 phút.
- [ ] `POST /api/auth/admin/verify-otp` xác nhận được OTP demo/dev.
- [ ] `POST /api/auth/admin/reset-password` đổi mật khẩu admin khi OTP hợp lệ.
- [ ] `GET /api/templates` với token user trả template seed.
- [ ] `POST /api/projects` với token user tạo project.
- [ ] `GET /api/projects` với token user thấy project mới.
- [ ] `POST /api/contents/generate` với token user tạo content.
- [ ] `GET /api/contents` với token user thấy content mới.
- [ ] `GET /api/admin/contents` với token admin thấy content user vừa tạo.
- [ ] `GET /api/notifications` với token user trả notification.
- [ ] `PATCH /api/notifications/read-all` với token user cập nhật unread count.
- [ ] `GET /api/dashboard/stats` với token user trả stats.

### 18.2. Frontend smoke test

- [ ] `yarn build` trong `frontend` pass.
- [ ] Mở app, login user thành công.
- [ ] Refresh trang, user vẫn đăng nhập.
- [ ] Vào `/dashboard` không bị redirect sai.
- [ ] Vào `/generate`, tạo content.
- [ ] Vào `/contents`, thấy content mới.
- [ ] Mở content detail nếu UI có.
- [ ] Vào `/projects`, tạo/xem project.
- [ ] Vào `/templates`, thấy templates.
- [ ] Vào `/notifications`, mark read/read all được.
- [ ] Logout user.
- [ ] Login admin.
- [ ] Từ `/admin/login`, bấm `Quên mật khẩu?` vào được `/admin/forgot-password`.
- [ ] `/admin/forgot-password` chạy được luồng email -> OTP demo `123456` -> đặt mật khẩu -> quay về admin login.
- [ ] Vào `/admin`, `/admin/users`, `/admin/contents`.
- [ ] User thường không vào được admin route.
- [ ] Logout admin.

---

## 19. Kịch bản demo cuối tuần

### 19.1. Demo user

1. Mở app và đăng nhập:
   - Email: `customer@copypro.vn`
   - Password: `customer123`
2. Vào `/dashboard`:
   - Giới thiệu tổng nội dung đã tạo.
   - Tổng token/usage gần đúng.
   - Nội dung gần đây.
3. Vào `/templates`:
   - Chỉ ra template system đã seed.
   - Giải thích template là prompt mẫu có biến, không phải model AI.
4. Vào `/generate`:
   - Chọn loại nội dung hoặc template Blog SEO.
   - Chọn tone/ngôn ngữ/model.
   - Nhập prompt về một sản phẩm/dịch vụ cụ thể.
   - Bấm generate.
5. Giải thích backend:
   - API nhận prompt.
   - AI service dùng real provider nếu có key, nếu không dùng fallback.
   - Backend lưu `Content`, ghi `UsageLog`, tạo `Notification`.
6. Vào `/contents`:
   - Chỉ ra content vừa tạo.
   - Mở detail nếu UI hỗ trợ.
7. Vào `/projects`:
   - Tạo project mới hoặc xem project seed.
   - Giải thích content có thể gắn project.
8. Vào `/notifications`:
   - Xem notification generate thành công.
   - Đánh dấu đã đọc.

### 19.2. Demo admin

1. Đăng xuất user.
2. Đăng nhập admin:
   - Email: `admin@copypro.vn`
   - Password: `admin123`
3. Vào `/admin`:
   - Giới thiệu tổng user/content/usage.
4. Vào `/admin/users`:
   - Xem danh sách user từ database.
5. Vào `/admin/contents`:
   - Xem content user vừa tạo.
6. Nếu có `/admin/audit-logs`:
   - Giới thiệu log đăng nhập/generate/admin action.

### 19.3. Câu trả lời khi giảng viên hỏi phần chưa làm

- **Fine-tuning:** đã có UI/mock và hướng schema, nhưng production cần dataset, provider, chi phí và thời gian train nên để sau MVP.
- **Stripe/Billing:** MVP seed/mock plan để demo gói dịch vụ; checkout/webhook production để sau vì cần tài khoản và cấu hình thật.
- **Plagiarism:** MVP giữ mock/schema; bản thật cần embedding, cosine similarity và nguồn so sánh.
- **AI thật:** service có fallback để demo ổn định; OpenAI/Ollama là cấu hình mở rộng.
- **SSE streaming:** chưa bắt buộc cho nghiệm thu MVP, sẽ thêm sau khi generate API ổn định.

---

## 20. Gợi ý phân bổ 1 tuần theo module

Lịch này chỉ là gợi ý để giữ tiến độ, không phải danh sách file phải tạo trước.

| Ngày | Module chính | Output bắt buộc |
|---|---|---|
| 20/05/2026 | Module 0 | Đã có backend start, MongoDB config, `/api/health`, error handler. |
| 21/05/2026 | Module 1 | `AccountUser`, `AccountAdmin`, JWT, forgot password OTP, frontend login/register/me/forgot-password nối API. |
| 22/05/2026 | Module 2 + Module 4 | Generate lưu Content/UsageLog, template seed/list. |
| 23/05/2026 | Module 5 + Module 7 | Project API/UI, notification API/UI. |
| 24/05/2026 | Module 9 + frontend user flow | Dashboard stats, user flow chạy liền mạch. |
| 25/05/2026 | Module 10 + build | Admin stats/users/contents, frontend build, smoke test. |
| 26/05/2026 | Đóng gói/demo | Seed cuối, README hướng dẫn chạy, script demo, known limitations. |

Nếu trễ, ưu tiên theo thứ tự:

1. Auth chạy.
2. Generate lưu content.
3. Content list/detail.
4. Project list/create.
5. Notification list/read.
6. Admin users/contents.
7. Dashboard stats.
8. Billing/Fine-tuning/Plagiarism giữ mock.

---

## 21. Rủi ro và phương án xử lý

| Rủi ro | Dấu hiệu | Cách xử lý |
|---|---|---|
| Backend lan quá rộng | Tạo nhiều models/API ngoài demo flow | Dừng P2, quay lại module P0 đang thiếu. |
| MongoDB lỗi kết nối | Server timeout hoặc không start | Dùng local URI `mongodb://127.0.0.1:27017/ai-copywriter`. |
| Frontend response mismatch | UI crash vì field khác mock | Normalize data trong service layer. |
| Auth guard loop redirect | Login xong vẫn bị đá | Dùng token + user localStorage rõ ràng, hydrate gọi `/api/auth/user/me` hoặc `/api/auth/admin/me` theo role đã lưu. |
| AI API ngoài lỗi | Generate timeout/rate limit | Luôn fallback trong `aiService`. |
| Admin UI đang phụ thuộc mock store | `/admin/users` vẫn đọc localStorage | Nối tối thiểu list API, các thao tác phức tạp giữ mock hoặc tắt. |
| Build frontend lỗi sát ngày | Type/import lỗi ở trang không demo | Sửa tối thiểu để build pass, không refactor lớn. |

---

## 22. Mẫu cập nhật tiến độ theo module

```md
## Cập nhật ngày DD/MM/2026

### Module đang làm
- Module ...

### Đã xong
- [ ] Backend/API:
- [ ] Frontend:
- [ ] Seed/demo data:
- [ ] Smoke test:

### Blockers
- ...

### Quyết định/cắt giảm
- ...

### Module tiếp theo
- [ ] ...
```

---

## 23. Checklist cuối cùng trước nghiệm thu

- [ ] Backend chạy bằng 1 lệnh.
- [ ] Frontend chạy bằng 1 lệnh.
- [ ] `.env.example` đủ biến.
- [ ] Không commit secret thật.
- [ ] Seed tạo được `AccountUser`/`AccountAdmin`/template/project/content/notification demo.
- [ ] User demo đăng nhập được.
- [ ] Admin demo đăng nhập được.
- [ ] User flow demo pass.
- [ ] Admin flow demo pass.
- [ ] `frontend` build pass.
- [ ] Backend smoke test pass.
- [ ] Có danh sách known limitations.
- [ ] Có kịch bản demo 5-10 phút.
- [ ] Các module README chưa làm thật đều có fallback/sau MVP rõ ràng.

---

## 24. Kết luận

Kế hoạch này bám đủ 10 module trong `README.md`, nhưng triển khai theo lát dọc phục vụ demo trước. Thay vì tạo toàn bộ 14-19 models ngay từ đầu, mỗi module chỉ tạo model khi cần lưu dữ liệu thật cho luồng đang làm.

Điểm quan trọng nhất trong 1 tuần:

- Làm chắc Auth.
- Làm chắc Generate/Content.
- Làm đủ Template, Project, Notification để user flow có ý nghĩa.
- Làm Admin dashboard/users/contents để nghiệm thu thấy dữ liệu thật.
- Giữ Billing, Fine-tuning, Plagiarism ở mức mock/schema tối thiểu và giải thích rõ hướng mở rộng.
