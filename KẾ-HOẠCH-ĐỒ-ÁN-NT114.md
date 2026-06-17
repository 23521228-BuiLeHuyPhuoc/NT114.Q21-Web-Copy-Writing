**KẾ HOẠCH ĐỒ ÁN NT114.**

**Tên đề tài**: **Xây dựng Website AI Copywriter tích hợp GPT-4/Llama,
RESTful API xử lý trên backend và Fine-tuning để tinh chỉnh mô hình với
ngành nghề cụ thể**

**Sinh viên thực hiện**: Bùi Lê Huy Phước. MSSV: 23521228

**1.Công nghệ sử dụng:**

  --------------------------------------------------------------------------------
  **Frontend**       **Backend**               **Database**       **Hướng tiếp cận
                                                                  AI**
  ------------------ ------------------------- ------------------ ----------------
  Next.js            Node.js                   Cloudinary         Tích hợp GPT-4

  TypeScript         Express.js                MongoDB            Tích hợp Llama

  Tailwind CSS       Mongoose                  MongoDB Atlas      API RESTful cho
                                                                  AI

  Axios              Bcrypt                    Docker + Docker    Fine-tuning
                                               Compose            

  React Hook Form    Joi.dev                                                    

  React Query        Regex                                     Streaming(SSE)                                        

  React Markdown     JWT                                          

  Chart/js           Multer                                       

  React Hot Toast    Nodemailer                                   

  Next-auth          OpenAI SDK                                   

  Zustand            Ollama                                       

                     LangChain.js                                 

                     Express-rate-limit                           

                     passport +                                   
                     passport-google-oauth20                      

                     helmet                                       

                     cors                                         

                     morgan                                       

                     yarn                                         

                     Stripe SDK                                   
  --------------------------------------------------------------------------------

**2.Cấu trúc thư mục:**

**2.1.Tổng quan:**

ai-copywriter/

├── frontend/ \# Frontend (Next.js)

├── backend/ \# Backend (Express.js)

├── docker-compose.yml

└── README.md

**2.2. Frontend**

frontend/

├── public/ \# Tài nguyên tĩnh (favicon, images, fonts)

├── src/

│ ├── app/ \# App Router -- chứa tất cả các trang (routes)

│ │ ├── (auth)/ \# Nhóm trang xác thực (login, register,
forgot-password)

│ │ ├── (public)/ \# Nhóm trang công khai (landing page, contact)

│ │ ├── (user)/ \# Nhóm trang người dùng (dashboard, generate, contents,
\...)

│ │ ├── (admin)/ \# Nhóm trang quản trị admin

│ │ ├── layout.tsx \# Layout gốc của ứng dụng

│ │ └── globals.css \# CSS toàn cục (Tailwind imports)

│ ├── components/ \# React components tái sử dụng

│ │ ├── ui/ \# Component UI cơ bản (Button, Input, Modal, Table, Card,
\...)

│ │ ├── layout/ \# Component layout (Header, Sidebar, Footer,
AdminSidebar)

│ │ ├── forms/ \# Component form (LoginForm, RegisterForm, GenerateForm,
\...)

│ │ └── charts/ \# Component biểu đồ thống kê

│ ├── hooks/ \# Custom React hooks (useAuth, useContent, useDebounce,
\...)

│ ├── lib/ \# Thư viện tiện ích

│ │ ├── api.ts \# Cấu hình Axios instance, interceptors

│ │ ├── auth.ts \# Hàm xử lý xác thực (getToken, refreshToken, \...)

│ │ └── utils.ts \# Hàm tiện ích dùng chung (formatDate, truncate, \...)

│ ├── services/ \# Lớp gọi API backend (authService, contentService,
adminService, \...)

│ ├── stores/ \# Zustand stores (authStore, uiStore, \...)

│ ├── types/ \# TypeScript type definitions (User, Content, Template,
\...)

│ └── constants/ \# Hằng số (content types, tones, languages, routes,
\...)

├── tailwind.config.ts \# Cấu hình Tailwind CSS

├── next.config.js \# Cấu hình Next.js

├── tsconfig.json \# Cấu hình TypeScript

├── package.json \# Dependencies & scripts

└── yarn.lock \# Lock file (yarn)

**2.3. Backend**

backend/

├── src/

│ ├── config/ \# Cấu hình ứng dụng (database, cloudinary, passport,
\...)

│ ├── models/ \# Mongoose schemas & models (User, Content, Template,
Document, \...)

│ ├── routes/ \# Định nghĩa API routes (authRoutes, contentRoutes,
\...)

│ ├── controllers/ \# Xử lý logic từng route (authController,
contentController, \...)

│ ├── services/ \# Business logic (aiService, ragService, nlpService,
plagiarismService, searchService, \...)

│ ├── middlewares/ \# Middleware (auth, role, validate, upload,
rateLimiter, cache, errorHandler)

│ ├── validations/ \# Joi validation schemas (authValidation,
contentValidation, \...)


│ ├── socket/ \# Socket.io handlers (collaboration, notifications,
presence)

│ ├── utils/ \# Hàm tiện ích (regex patterns, email sender, token
generator, \...)

│ └── app.js \# Entry point -- khởi tạo Express,
Socket.io, mount routes

├── uploads/ \# Thư mục tạm lưu file upload trước khi đẩy lên Cloudinary

├── .env.example \# Mẫu biến môi trường

├── package.json \# Dependencies & scripts

├── yarn.lock \# Lock file (yarn)

└── Dockerfile \# Docker build cho server

**2.4.Database (MongoDB)**

  -----------------------------------------------------------------------
  **Collection**     **Mô tả**
  ------------------ ----------------------------------------------------
  Users              Tài khoản, role, avatar, googleId

  Contents           Nội dung AI sinh ra, prompt, model, tags, versions

  Templates          Prompt template có biến, phân loại

  Categories         Danh mục phân cấp cho template

  Projects           Dự án nhóm nội dung

  Plans              Gói dịch vụ (Free/Pro/Enterprise)

  Subscriptions      Đăng ký gói của user

  Payments           Lịch sử thanh toán Stripe

  FineTuneJobs       Job fine-tuning model AI

  Notifications      Thông báo cho user

  UsageLogs          Log sử dụng AI (token, model)

  AuditLogs          Log hành động hệ thống

  SystemSettings     Cài đặt hệ thống (key/value)
  -----------------------------------------------------------------------

**3. Chi tiết công việc frontend:**

**3.1. Trang công khai:**

  -----------------------------------------------------------------------
  **Route**            **Trang**
  -------------------- --------------------------------------------------
  /                    Landing page (giới thiệu, tính năng, bảng giá)

  /login               Đăng nhập

  /register            Đăng ký

  /forgot-password     Quên mật khẩu

  /reset-password      Đặt lại mật khẩu

  /contact             Liên hệ
  -----------------------------------------------------------------------

**3.2.Trang người dùng:**

  -----------------------------------------------------------------------------
  **Route**           **Trang**
  ------------------- ---------------------------------------------------------
  /dashboard          Dashboard tổng quan

  /generate           Sinh nội dung AI (trang chính)

  /contents           Quản lý nội dung

  /contents/:id       Chi tiết nội dung

  /projects           Quản lý dự án

  /projects/:id       Chi tiết dự án

  /templates          Thư viện template

  /fine-tune          Quản lý fine-tuning


  /plagiarism-check   \[TÍNH NĂNG MỚI\] Kiểm tra đạo văn nội dung: paste hoặc
                      chọn nội dung đã tạo → hệ thống tính cosine similarity
                      với database nội dung + web sources → hiển thị tỉ lệ
                      trùng lặp (%), highlight đoạn trùng, nguồn gốc. Lịch sử
                      kiểm tra. Tích hợp nút kiểm tra ngay sau khi sinh nội
                      dung

  /profile            Hồ sơ cá nhân & cài đặt

  /billing            Gói dịch vụ & thanh toán

  /notifications      Thông báo
  -----------------------------------------------------------------------------

**3.3.Trang Admin:**

  -----------------------------------------------------------------------
  **Route**                     **Trang**
  ----------------------------- -----------------------------------------
  /admin                        Dashboard admin

  /admin/users                  Quản lý user

  /admin/contents               Quản lý nội dung

  /admin/templates              Quản lý template hệ thống

  /admin/generate-options/industries    Quản lý ngành nghề Generate
  /admin/generate-options/copy-types    Quản lý loại nội dung Generate
  /admin/generate-options/tones         Quản lý tone giọng văn Generate

  /admin/plans                  Quản lý gói dịch vụ

  /admin/payments               Quản lý thanh toán

  /admin/models                 Quản lý model AI

  /admin/settings               Cài đặt hệ thống

  /admin/audit-logs             Nhật ký hệ thống
  -----------------------------------------------------------------------

**4. Middleware/Bảo mật:**

1.JWT Authentication -- access token (15 phút) + refresh token (7 ngày)

2.Role-based Access -- phân quyền user / premium / admin

3.Joi Validation -- validate toàn bộ input (body, params, query)

4.Regex Patterns -- validate email, phone, URL, slug, password, tìm kiếm

5.Rate Limiting -- 100 req/15 phút (chung), 10 req/15 phút (AI generate)

6.Helmet + CORS -- bảo mật HTTP headers

7.Multer + Cloudinary -- upload file an toàn, lưu trữ cloud

**5. Hướng tiếp cận AI:**

  -----------------------------------------------------------------------
  **Kỹ thuật**        **Mô tả**
  ------------------- ---------------------------------------------------
  GPT-4 (OpenAI API)  Sinh nội dung chất lượng cao qua ChatCompletion

  Llama (Ollama       Model miễn phí chạy local
  local)              

  Fine-tuning         Tinh chỉnh model theo ngành nghề cụ thể

  Prompt Engineering  System prompt riêng cho từng loại nội dung + tone +
                      ngôn ngữ

  LangChain.js        Orchestrate model, prompt chaining, output parsing

  Streaming (SSE)     Server-Sent Events trả nội dung real-time
  -----------------------------------------------------------------------

**6. Module Chức năng (10 module)**

**Module 1 -- Xác Thực & Tài Khoản**

-   Đăng ký / đăng nhập (email + Google OAuth)

-   Quên & đặt lại mật khẩu, xác minh email

-   Quản lý hồ sơ cá nhân (avatar, đổi password)

-   **API:** /api/auth/\*, /api/users/\*

-   **DB:** Users, AuditLogs

**Module 2 -- Sinh Nội Dung AI**

-   Sinh nội dung: blog, quảng cáo, email, sản phẩm, social, SEO,
    script, headline

-   Chọn model (GPT-4 / Llama / fine-tuned), tone, ngôn ngữ, temperature

-   Streaming real-time (SSE) từ AI về client

-   CRUD nội dung, yêu thích, gắn tag, lịch sử phiên bản, xuất PDF/Word

-   **API:** /api/content/\*

-   **DB:** Contents, UsageLogs

**Module 3 -- Fine-tuning Model AI**

-   Upload dataset (CSV/JSON) → Multer → Cloudinary

-   Tạo job fine-tuning (OpenAI API hoặc Llama local)

-   Theo dõi trạng thái: pending → training → completed/failed

-   Sử dụng model đã fine-tune khi sinh nội dung

-   **API:** /api/fine-tune/\*

-   **DB:** FineTuneJobs

**Module 4 -- Template**

-   Template prompt có biến {{variable}}, tái sử dụng

-   Template hệ thống (admin) + template cá nhân (user)

-   Phân loại template bằng trường category dạng chuỗi

-   **API:** /api/templates/\*, /api/admin/templates/\*

-   **DB:** Templates

**Module 5 -- Quản Lý Dự Án**

-   Tạo dự án, gán nội dung vào dự án, lưu trữ (archive)

-   **API:** /api/projects/\*

-   **DB:** Projects

**Module 6 -- Thanh Toán & Gói Dịch Vụ**

-   3 gói: Free / Pro / Enterprise (giới hạn token, model, dự án)

-   Tích hợp Stripe: checkout, webhook, quản lý subscription

-   **API:** /api/billing/\*

-   **DB:** Plans, Subscriptions, Payments

**Module 7 -- Thông Báo**

-   Thông báo hệ thống, thanh toán, fine-tuning, tài khoản

-   Đánh dấu đã đọc / đọc tất cả

-   **API:** /api/notifications/\*

-   **DB:** Notifications

**Module 8 -- Trang Công Khai**

-   Landing page: giới thiệu, tính năng, bảng giá, testimonials

-   Trang liên hệ (gửi email qua Nodemailer)

**Module 9 -- Dashboard Người Dùng**

-   Thống kê: nội dung đã tạo, token đã dùng, gói hiện tại

-   Biểu đồ sử dụng (Chart.js), nội dung gần đây, thông báo

**Module 10 -- Quản Trị Admin**

-   Dashboard: tổng user, nội dung, doanh thu, biểu đồ tăng trưởng

-   Quản lý: user, nội dung, template, danh mục, gói dịch vụ, thanh
    toán, model AI

-   Cài đặt hệ thống, nhật ký audit log

-   **API:** /api/admin/\*

-   **DB:** SystemSettings, AuditLogs
