# KẾ HOẠCH ĐỒ ÁN NT114

**Tên đề tài:** Xây dựng Website AI Copywriter tích hợp GPT-4/Llama, RESTful API xử lý trên backend và Fine-tuning để tinh chỉnh mô hình với ngành nghề cụ thể

**Sinh viên thực hiện:** Bùi Lê Huy Phước. **MSSV:** 23521228

---

## 1. Công nghệ sử dụng

| Frontend | Backend | Database | Hướng tiếp cận AI |
|----------|---------|----------|-------------------|
| Next.js | Node.js | Cloudinary | Tích hợp GPT-4 |
| TypeScript | Express.js | MongoDB | Tích hợp Llama |
| Tailwind CSS | Mongoose | MongoDB Atlas | API RESTful cho AI |
| Axios | Bcrypt | Docker + Docker Compose | Fine-tuning |
| React Hook Form | Joi.dev | Redis | Streaming (SSE) |
| React Query | Regex | | |
| React Markdown | JWT | | |
| Chart.js | Multer | | AI Plagiarism Detection ⭐ |
| React Hot Toast | Nodemailer | | |
| Next-auth | OpenAI SDK | | |
| Zustand | Ollama | | |
| | Express-rate-limit | | |
| | passport + passport-google-oauth20 | | |
| | helmet | | |
| | cors | | |
| | morgan | | |
| | yarn | | |
| | Stripe SDK | | |
| | plagiarism-checker ⭐ | | |

---

## 2. Cấu trúc thư mục

### 2.1. Tổng quan

```
ai-copywriter/
├── frontend/                     # Frontend (Next.js)
├── backend/                     # Backend (Express.js)
├── docker-compose.yml
└── README.md
```

### 2.2. Frontend

```
frontend/
├── public/                     # Tài nguyên tĩnh (favicon, images, fonts)
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout
│   │   ├── providers.tsx       # React Query, AuthProvider, Toast provider
│   │   ├── route-guards.tsx    # Guard khách hàng/admin ở phía client
│   │   ├── page.tsx            # Route `/`
│   │   ├── about/, blog/, ...  # Các route công khai
│   │   ├── dashboard/, ...     # Các route khách hàng
│   │   ├── admin/              # Các route quản trị
│   │   ├── pages/              # Component màn hình, gom theo auth/public/customer/admin
│   │   ├── components/         # Component UI, common, public, admin, generator, charts
│   │   └── contexts/           # Context tương thích cho auth hiện tại
│   ├── hooks/queries/          # React Query hooks
│   ├── lib/                    # Axios, auth helper, permission, router compatibility
│   ├── services/               # Service layer dùng mock/API
│   ├── stores/                 # Zustand stores
│   ├── mocks/                  # Dữ liệu mock cho giao diện/demo
│   ├── styles/                 # CSS toàn cục, theme, font, Tailwind import
│   └── types/                  # TypeScript type definitions
├── next.config.mjs             # Cấu hình Next.js, redirect legacy, alias compatibility
├── postcss.config.mjs          # Cấu hình Tailwind CSS v4 cho Next.js
├── tsconfig.json               # Cấu hình TypeScript
├── package.json                # Dependencies & scripts
└── yarn.lock                   # Lock file (yarn)
```

### 2.3. Backend

```
backend/
├── src/
│   ├── config/                 # Cấu hình ứng dụng (database, cloudinary, passport, ...)
│   ├── models/                 # Mongoose schemas & models (User, Content, Template, ...)
│   ├── routes/                 # Định nghĩa API routes (authRoutes, contentRoutes, ...)
│   ├── controllers/            # Xử lý logic từng route (authController, contentController, ...)
│   ├── services/               # Business logic (aiService, plagiarismService, ...)
│   ├── middlewares/            # Middleware (auth, role, validate, upload, rateLimiter, errorHandler)
│   ├── validations/            # Joi validation schemas (authValidation, contentValidation, ...)
│   ├── utils/                  # Hàm tiện ích (regex patterns, email sender, token generator, ...)
│   └── app.js                  # Entry point – khởi tạo Express, , mount routes
├── uploads/                    # Thư mục tạm lưu file upload trước khi đẩy lên Cloudinary
├── .env.example                # Mẫu biến môi trường
├── package.json                # Dependencies & scripts
├── yarn.lock                   # Lock file (yarn)
└── Dockerfile                  # Docker build cho server
```

### 2.4. Database (MongoDB)

| Collection | Mô tả |
|------------|-------|
| Users | Tài khoản, role, avatar, googleId |
| Contents | Nội dung AI sinh ra, prompt, model, tags, versions |
| Templates | Prompt template có biến, phân loại |
| Categories | Danh mục phân cấp cho template |
| Projects | Dự án nhóm nội dung |
| Plans | Gói dịch vụ (Free/Pro/Enterprise) |
| Subscriptions | Đăng ký gói của user |
| Payments | Lịch sử thanh toán Stripe |
| FineTuneJobs | Job fine-tuning model AI |
| Notifications | Thông báo cho user |
| UsageLogs | Log sử dụng AI (token, model) |
| AuditLogs | Log hành động hệ thống |
| SystemSettings | Cài đặt hệ thống (key/value) |
| PlagiarismReports ⭐ | Báo cáo kiểm tra đạo văn (similarity %, matches, web sources) |

---

## 3. Chi tiết công việc frontend

### 3.1. Trang công khai

| Route | Trang |
|-------|-------|
| `/` | Landing page (giới thiệu, tính năng, bảng giá) |
| `/pricing` | Bảng giá |
| `/about` | Giới thiệu |
| `/blog` | Danh sách bài viết |
| `/blog/:slug` | Chi tiết bài viết |
| `/login` | Đăng nhập |
| `/register` | Đăng ký |
| `/forgot-password` | Quên mật khẩu |
| `/reset-password` | Đặt lại mật khẩu |
| `/contact` | Liên hệ |

### 3.2. Trang người dùng

| Route | Trang |
|-------|-------|
| `/dashboard` | Dashboard tổng quan |
| `/generate` | Sinh nội dung AI (trang chính) |
| `/contents` | Quản lý nội dung |
| `/contents/:id` | Chi tiết nội dung |
| `/projects` | Quản lý dự án |
| `/projects/:id` | Chi tiết dự án |
| `/templates` | Thư viện template |
| `/fine-tune` | Quản lý fine-tuning |
| `/plagiarism-check` ⭐ | Plagiarism Detection – kiểm tra đạo văn nội dung AI |
| `/profile` | Hồ sơ cá nhân & cài đặt |
| `/billing` | Gói dịch vụ & thanh toán |
| `/notifications` | Thông báo |

### 3.3. Trang Admin

| Route | Trang |
|-------|-------|
| `/admin` | Dashboard admin |
| `/admin/login` | Đăng nhập admin |
| `/admin/register` | Đăng ký admin bằng mã mời |
| `/admin/users` | Quản lý user |
| `/admin/contents` | Quản lý nội dung |
| `/admin/templates` | Quản lý template hệ thống |
| `/admin/categories` | Quản lý danh mục |
| `/admin/plans` | Quản lý gói dịch vụ |
| `/admin/payments` | Quản lý thanh toán |
| `/admin/models` | Quản lý model AI |
| `/admin/settings` | Cài đặt hệ thống |
| `/admin/audit-logs` | Nhật ký hệ thống |
| `/admin/permissions` | Quản lý vai trò và quyền admin |

---

## 4. Middleware/Bảo mật

1. **JWT Authentication** – access token (15 phút) + refresh token (7 ngày)
2. **Role-based Access** – phân quyền user / premium / admin
3. **Joi Validation** – validate toàn bộ input (body, params, query)
4. **Regex Patterns** – validate email, phone, URL, slug, password, tìm kiếm
5. **Rate Limiting** – 100 req/15 phút (chung), 10 req/15 phút (AI generate)
6. **Helmet + CORS** – bảo mật HTTP headers
7. **Multer + Cloudinary** – upload file an toàn, lưu trữ cloud

---

## 5. Hướng tiếp cận AI

| Kỹ thuật | Mô tả |
|----------|-------|
| GPT-4 (OpenAI API) | Sinh nội dung chất lượng cao qua ChatCompletion |
| Llama (Ollama local) | Model miễn phí chạy local |
| Fine-tuning | Tinh chỉnh model theo ngành nghề cụ thể |
| Prompt Engineering | System prompt riêng cho từng loại nội dung + tone + ngôn ngữ |
| LangChain.js | Orchestrate model, prompt chaining, output parsing |
| Streaming (SSE) | Server-Sent Events trả nội dung real-time |
| | Upload tài liệu → trích xuất text → tạo embeddings → lưu vào vector DB (Pinecone) → khi sinh nội dung, semantic search lấy context liên quan → đưa vào prompt AI → sinh nội dung chính xác dựa trên tài liệu tham khảo |
| | Phân tích nội dung: readability score (Flesch-Kincaid, Coleman-Liau), sentiment analysis, keyword density, SEO score → đề xuất cải thiện |
| AI Plagiarism Detection ⭐ | So sánh nội dung bằng cosine similarity trên embeddings → phát hiện đoạn trùng lặp → cảnh báo nếu vượt ngưỡng |

---

## 6. Module Chức năng (10 module)

### Module 1 – Xác Thực & Tài Khoản

+ Đăng ký / đăng nhập (email + Google OAuth)
+ Quên & đặt lại mật khẩu, xác minh email
+ Quản lý hồ sơ cá nhân (avatar, đổi password)
+ API: `/api/auth/*`, `/api/users/*`
+ DB: Users, AuditLogs

### Module 2 – Sinh Nội Dung AI

+ Sinh nội dung: blog, quảng cáo, email, sản phẩm, social, SEO, script, headline
+ Chọn model (GPT-4 / Llama / fine-tuned), tone, ngôn ngữ, temperature
+ Streaming real-time (SSE) từ AI về client
+ CRUD nội dung, yêu thích, gắn tag, lịch sử phiên bản, xuất PDF/Word
+ API: `/api/content/*`
+ DB: Contents, UsageLogs

### Module 3 – Fine-tuning Model AI

+ Upload dataset (CSV/JSON) → Multer → Cloudinary
+ Tạo job fine-tuning (OpenAI API hoặc Llama local)
+ Theo dõi trạng thái: pending → training → completed/failed
+ Sử dụng model đã fine-tune khi sinh nội dung
+ API: `/api/fine-tune/*`
+ DB: FineTuneJobs

### Module 4 – Template & Danh Mục

+ Template prompt có biến `{{variable}}`, tái sử dụng
+ Template hệ thống (admin) + template cá nhân (user)
+ Danh mục phân cấp (parent → child)
+ API: `/api/templates/*`, `/api/admin/categories`
+ DB: Templates, Categories

### Module 5 – Quản Lý Dự Án

+ Tạo dự án, gán nội dung vào dự án, lưu trữ (archive)
+ API: `/api/projects/*`
+ DB: Projects

### Module 6 – Thanh Toán & Gói Dịch Vụ

+ 3 gói: Free / Pro / Enterprise (giới hạn token, model, dự án)
+ Tích hợp Stripe: checkout, webhook, quản lý subscription
+ API: `/api/billing/*`
+ DB: Plans, Subscriptions, Payments

### Module 7 – Thông Báo

+ Thông báo hệ thống, thanh toán, fine-tuning, tài khoản
+ Gửi email thông báo qua Nodemailer
+ Đánh dấu đã đọc / đọc tất cả
+ API: `/api/notifications/*`
+ DB: Notifications

### Module 8 – Trang Công Khai

+ Landing page: giới thiệu, tính năng, bảng giá, testimonials
+ Trang liên hệ (gửi email qua Nodemailer)

### Module 9 – Dashboard Người Dùng

+ Thống kê: nội dung đã tạo, token đã dùng, gói hiện tại
+ Biểu đồ sử dụng (Chart.js), nội dung gần đây, thông báo

### Module 10 – Quản Trị Admin

+ Dashboard: tổng user, nội dung, doanh thu, biểu đồ tăng trưởng
+ Quản lý: user, nội dung, template, danh mục, gói dịch vụ, thanh toán, model AI
+ Cài đặt hệ thống, nhật ký audit log
+ API: `/api/admin/*`
+ DB: SystemSettings, AuditLogs

---

## 7. Tính Năng Nâng Cao (Advanced Features) ⭐

Các tính năng dưới đây là những thành phần **kỹ thuật khó**, thể hiện chiều sâu của đồ án:

### 7.1 AI Plagiarism Detection System

+ **Vấn đề:** AI có thể sinh nội dung trùng lặp → cần phát hiện và cảnh báo
+ **Kiến trúc:** Content → Segmentation → Embedding → Cosine Similarity Search (database + web scraping) → Threshold Detection (>85%) → Report (highlight đoạn trùng, nguồn gốc, % tổng)
+ **API:** `/api/plagiarism/*` (check, check-web, history)
+ **DB:** PlagiarismReports

---

## 8. Tổng quan tiến độ thực hiện ngày 13/05/2026

### 8.1. Công việc đã thực hiện

+ Đã chuyển frontend từ Vite sang **Next.js/App Router**; script chạy hiện tại là `next dev`, `next build`, `next start`.
+ Đã bổ sung cấu hình Next.js gồm `next.config.mjs`, `tsconfig.json`, `postcss.config.mjs`, root `layout.tsx`, `providers.tsx` và guard route cho khách hàng/admin.
+ Đã map các route chính sang App Router: public, auth, customer và admin; các route legacy như `/generator`, `/history`, `/subscription` được redirect về route mới.
+ Đã gom lại một phần cấu trúc frontend cho dễ quản lý: `pages/auth`, `pages/public`, `pages/customer`, `pages/admin`, `components/public`, `components/common`, `components/admin`.
+ Đã có giao diện public: trang chủ, bảng giá, giới thiệu, blog, chi tiết blog, liên hệ, đăng nhập, đăng ký, quên mật khẩu, đặt lại mật khẩu.
+ Đã có giao diện khách hàng: dashboard, sinh nội dung AI, quản lý nội dung, dự án, template, fine-tuning, kiểm tra đạo văn, hồ sơ, billing, thông báo.
+ Đã có giao diện admin: dashboard, quản lý user, nội dung, template, danh mục, gói dịch vụ, thanh toán, model AI, cài đặt, audit log, phân quyền.
+ Đã có auth mock bằng `localStorage`, mã mời admin, trạng thái admin chờ duyệt/từ chối/hoạt động, route guard theo customer/admin và phân quyền admin chi tiết.
+ Đã có service layer, hook React Query và mock data cho các module nội dung, dự án, fine-tuning, thanh toán, thông báo, audit log, API key, plagiarism.
+ Đã kiểm tra build frontend bằng `yarn build` và build Next.js đã chạy thành công.
+ Đã có tài liệu use case dạng Markdown và PlantUML cho tổng quan, khách hàng và admin.

### 8.2. Công việc cần thực hiện trong tương lai

+ Hoàn thiện backend Express: cấu hình app, middleware, error handler, route structure, validation, auth JWT và phân quyền thật.
+ Thiết kế MongoDB/Mongoose models cho các collection trong README: Users, Contents, Templates, Categories, Projects, Plans, Subscriptions, Payments, FineTuneJobs, Notifications, UsageLogs, AuditLogs, SystemSettings, PlagiarismReports.
+ Thay mock service frontend bằng API thật theo từng module, ưu tiên Auth, Content, Project, Template, Billing, Notification, Admin.
+ Chuyển auth/permission từ mock `localStorage` sang JWT/refresh token hoặc NextAuth/session thật.
+ Thay compatibility layer `react-router-dom` bằng `next/link`, `next/navigation` trực tiếp khi có thời gian refactor.
+ Tích hợp AI generation với OpenAI/Ollama, sau đó bổ sung SSE streaming, lưu nội dung, usage log và lựa chọn model.
+ Triển khai fine-tuning thật, kiểm tra đạo văn backend, thanh toán, webhook và audit log theo mức độ ưu tiên đồ án.
+ Bổ sung test/build smoke check định kỳ cho frontend và test API thủ công/Postman cho backend trước khi demo.
+ Chuẩn bị môi trường deploy, biến môi trường production, tài khoản demo và kịch bản demo nghiệm thu.
