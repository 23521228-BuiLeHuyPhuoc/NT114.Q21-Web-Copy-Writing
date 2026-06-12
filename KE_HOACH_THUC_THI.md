# KẾ HOẠCH THỰC THI CHI TIẾT DỰ ÁN AI COPYWRITER

Tài liệu này là bản kế hoạch triển khai trọn vẹn và **cực kỳ chi tiết**, chia nhỏ khối lượng công việc bám sát 10 Module chức năng và Tính năng Nâng cao (Ngôi sao ⭐) được định nghĩa trong `DOCS.md`. Thiết kế này dành cho việc lập trình thực tế nối tiếp nhau từ Frontend tới Database và Backend.

---

## GIAI ĐOẠN 1: THIẾT KẾ UI/UX TRÊN FIGMA
**Mục tiêu:** Định hình bộ khung hiển thị chuẩn mực và Responsive cho 3 luồng người dùng (Public, User, Admin).

### 1.1 Khởi tạo Design System & Foundation
- [ ] Chọn bảng màu thương hiệu (Primary, Secondary, Background, Text Colors, Border). Đặt biến CSS (Variables).
- [ ] Typography (Font hiển thị). Define Heading (H1-H6) & Body Text.
- [ ] Dựng bộ UI Kit cơ sở (Button các trạng thái, Input Forms, Select Dropdowns, Modal Dialog, Toasts, Switcher, Tooltips).

### 1.2 Thiết Kế Trang Công Khai (Public Pages: `/`)
- [ ] **Landing Page:** 
  - [ ] Hero Banner bắt mắt với câu Slogan sức mạnh AI.
  - [ ] Section Tính năng (Feature Cards: Sinh bài viết, Đa model, Đạo văn...).
  - [ ] Section Bảng Giá (Pricing Table: Free / Pro / Enterprise - 3 cột).
  - [ ] Testimonials & Footer chuyên nghiệp.
- [ ] **Trang Liên hệ (`/contact`):** Form điền email và nội dung thắc mắc.

### 1.3 Thiết Kế Luồng Xác Thực (Auth Pages: `/(auth)`)
- [ ] Màn hình **Đăng nhập (`/login`) & Đăng ký (`/register`)**: Nút Đăng nhập qua Google (OAuth) to rõ rệt, Form Email + Password.
- [ ] Các màn hình phụ: Quên mật khẩu (`/forgot-password`), Nhập mã khôi phục/Link Reset (`/reset-password`).

### 1.4 Thiết Kế Dashboard Người Dùng (User Pages: `/(user)`)
- [ ] **Layout Chính:** Sidebar Menu bên trái, Header Bar (Tìm kiếm, Trạng thái Gói cước, Chuông Thông Báo, Avatar Profile).
- [ ] **Trang `/dashboard`:** Hiển thị 3 chỉ số lớn (Nội dung đã tạo, Token đã tiêu hao, Trạng thái Stripe Plan). Biểu đồ sử dụng hàng tháng (Chart.js / Recharts).
- [ ] **Màn hình AI Sinh Nội Dung (`/generate`):**
  - [ ] Cột bên trái: Select Template, Nhập thông số (Tone, Ngôn ngữ, Temperature, Model: GPT-4/Llama). Khung điền Prompt gốc.
  - [ ] Cột bên phải: Nơi text AI cuộn hiển thị real-time (SSE). Cú pháp Markdown Preview. Các nút Copy, Save to Project, Xuất PDF/Word.
- [ ] **Trang Quản lý Nội Dung (`/contents` & `/contents/:id`):** Bảng danh sách bài viết sinh ra (Kèm chức năng tìm kiếm, Gắn Tag yêu thích, Lịch sử Version).
- [ ] **Trang Thư Viện Templates (`/templates`):** Lưới (Grid) chứa các thẻ prompt xài rỗng, Phân cấp theo Categories (Marketing, SEO, Social, Email).
- [ ] **Trang Quản lý Dự Án (`/projects`):** Folder hóa các Content liên quan về chung một chủ đề.
- [ ] **Trang Fine-Tuning (`/fine-tune`):** Nơi người dùng nạp dữ liệu ngành (Kéo thả file CSV/JSON), và Xem tracking biểu đồ trạng thái % train.
- [ ] **⭐ Màn hình Tính năng Ngôi sao (`/plagiarism-check`):**
  - [ ] Khung nhập văn bản lớn hoặc chọn bài viết cũ.
  - [ ] Layout Report: Vòng tròn % tổng trùng lặp đạo văn. Đoạn text gốc có **highlight đỏ/vàng** ở ngay các vị trí chữ trùng khớp. Danh sách web nguồn hoặc đoạn tương đồng trong Database.
- [ ] **Trang Thanh toán (`/billing`):** Nơi xem gói hiện tại, Nút Upgrade Package (Pop-up Stripe), Lịch sử biên lai.

### 1.5 Thiết Kế Luồng Admin (Admin Pages: `/(admin)`)
- [ ] **Admin Layout:** Sidebar màu sắc riêng biệt để phân biệt tránh nhầm với User.
- [ ] **Admin Dashboard (`/admin`):** Tổng quan toàn App (Lượng tài khoản tăng trưởng trong 7 ngày, tổng doanh thu Stripe thực tế).
- [ ] **Bảng Quản lý Data (`/admin/users`, `/admin/contents`, `/admin/templates`, `/admin/categories`, `/admin/plans`, `/admin/payments`, `/admin/models`):** Cung cấp bộ lưới CRUD đẩy đủ.
- [ ] **Nhật ký Audit & System (`/admin/settings`, `/admin/audit-logs`):** Danh sách hành động thay đổi nhạy cảm để tracking bugs.

---

## GIAI ĐOẠN 2: THIẾT KẾ CƠ SỞ DỮ LIỆU & HẠ TẦNG (MONGODB ATLAS)
**Mục tiêu:** Ánh xạ các thực thể của 10 Module thành Mongoose Schemas chuẩn mực. Khởi tạo môi trường bảo mật Cloud.

### 2.1 Cài đặt Hạ tầng (Infrastructure)
- [ ] Tạo cluster trên **MongoDB Atlas**, cấp whitelist IP `0.0.0.0/0`.
- [ ] Setup vùng chứa ảnh tĩnh trên **Cloudinary** (để upload Avatars / Files).
- [ ] Setup Cổng SMTP của **Nodemailer** (địa chỉ gửi email tự động).
- [ ] Đăng ký **Stripe Developer Account** lấy Webhook Secret & Publishable Key.
- [ ] Setup Docker & `docker-compose.yml` local phục vụ việc tự động dựng Mongo container cho dev chạy máy cá nhân.

### 2.2 Xây dựng 16 Document Collections (Mongoose Models)
- [ ] **`Users` Collection:** `_id`, `email`, `password` (bcrypt hash), `googleId`, `role` (enum: user/premium/admin), `avatar`, `isVerified`, `timestamps`.
- [ ] **`Contents` Collection:** `userId`, `projectId`, `templateId`, `promptInputs` (JSON Object), `modelUsed`, `outputText` (String lớn), `wordCount`, `tags` (Array), `versions` (Lịch sử sinh lại).
- [ ] **`Templates` Collection:** `name`, `description`, `categoryId`, `systemPrompt` (Chứa biến `{{var}}`), `isSystem` (Boolean), `authorId`.
- [ ] **`Categories` Collection:** `name`, `slug`, `parentId` (Để xử lý danh mục đa cấp phân nhánh).
- [ ] **`Projects` Collection:** `userId`, `name`, `description`, `isArchived`.
- [ ] **`Plans` Collection:** `name` (Free/Pro/Enterprise), `price`, `limits` (Max tokens, models allowed), `stripeProductId`.
- [ ] **`Subscriptions` Collection:** `userId`, `planId`, `stripeSubscriptionId`, `status` (active/canceled), `currentPeriodEnd`.
- [ ] **`Payments` Collection:** Lịch sử build hóa đơn từ Stripe Webhook.
- [ ] **`FineTuneJobs` Collection:** `userId`, `datasetUrl`, `status` (pending, training, completed, failed), `baseModel`, `fineTunedModelId`.
- [ ] **`Notifications` Collection:** `userId`, `title`, `message`, `type` (system, billing, ai), `isRead`.
- [ ] **`UsageLogs` Collection:** Tracking token tiêu thụ (`userId`, `tokenCount`, `model`, `date`).
- [ ] **`SystemSettings` Collection:** Config admin dạng `{ key: String, value: Mixed }`.
- [ ] **`AuditLogs` Collection:** Trace API calls của Admin/System.
- [ ] **⭐ `PlagiarismReports` Collection:** `userId`, `contentId`, `checkText` (đoạn text check), `similarityScore` (giá trị %), `matches` (Mảng chứa các đoạn matched, index bắt đầu, index kết thúc, nguồn tham chiếu).

---

## GIAI ĐOẠN 3: PHÁT TRIỂN BACKEND API VÀ CORE LOGIC (NODE.JS, EXPRESS)
**Mục tiêu:** Lập trình kiến trúc hướng Module (10 Module), bảo mật nghiêm ngặt và xử lý luồng AI bất đồng bộ.

### 3.1 Khởi tạo Project & Pipeline Kiến Trúc Cơ Sở
- [ ] Khởi tạo `app.js` gắn 5 Middleware lá chắn (Helmet, CORS, Morgan, Express.json, URL-encoded).
- [ ] Cấu hình cơ chế Bắt Lỗi (Error Handler) toàn cục để không lộ stack trace lỗi server-side ra ngoài.
- [ ] Xây thư mục Validation bằng `Joi`. Toàn bộ request vào API phải đúng Schema mới cho pass.
- [ ] Xây thư mục Middlewares nghiệp vụ:
  - `auth` (Kiểm tra xem req.headers.authorization có khớp JWT Token k).
  - `role` (Ràng buộc Admin/Premium).
  - `rateLimiter` (100 req/15p cơ bản, 10 req/15p cho API dính tới AI tránh bị DDOS hao tiền).
  - `upload` (Multer kết hợp `multer-storage-cloudinary`).

### 3.2 Lập trình 10 API Modules Vận Hành Chức năng `(backend/src/controllers & routes)`
- [ ] **Module 1 (Xác Thực - Auth):**
  - POST `/api/auth/register`, POST `/api/auth/login`. Set Cookies Refresh Token + Trả AccessJWT qua body.
  - Setup chiến lược (Strategy) `passport-google-oauth20` gán route chuyển hướng (Callback).
  - POST `/api/auth/forgot-password` (Sinh mã Token tạm -> Lưu vào DB -> Gọi Nodemailer gửi URL về Email user).
- [ ] **Module 2 (Sinh Nội Dung - Content AI):**
  - Lập trình **Streaming Response (SSE)** với `res.writeHead(200, { 'Content-Type': 'text/event-stream' })`.
  - Service gọi OpenAI SDK `createChatCompletion({ stream: true })` và lắng nghe event `data`, sau đó `res.write("data: " + chunk)` đẩy liên tiếp về Client. Chừa tuỳ chọn gọi Llama (Local API qua HTTP).
  - Kết thúc luồng gọi hàm lưu DB vào `Contents` và `UsageLogs`.
- [ ] **Module 3 (Fine-tuning AI):**
  - Upload logic file `.csv` chứa cặp `{prompt, completion}`.
  - Khớp file format theo chuẩn OpenAI JSONL -> Gọi API Openai `/fine_tunes` (Hoặc Llama LoRA param tuning) -> Lưu bản ghi `FineTuneJob` (Status: pending).
- [ ] **Module 4 & 5 (Template & Project):**
  - Viết Full RESTful CRUD Controller (GET, GET BY ID, POST, PUT, DELETE, PATCH ARCHIVE).
- [ ] **Module 6 (Thanh toán Billing):**
  - Tích hợp hàm `stripe.checkout.sessions.create` bắn Link trả tiền.
  - Cấu hình Route đặc biệt (Không parse JSON) `/api/billing/webhook` để bắt Stripe Webhook Event `checkout.session.completed` -> Cập nhật Role User thành Premium.
- [ ] **Module 7 (Thông Báo - Notifications):**
  - GET / POST / PATCH `isRead: true` theo cấu trúc danh sách kẹp Phân trang (Pagination).
- [ ] **Module 8 (Trang Mở Public):**
  - GET Public APIs cho Landing page lấy tổng quan thống kê nếu cần (hoặc form contact).

### 3.3 ⭐ Lập trình Module Ngôi sao - AI Plagiarism (Kiểm Tra Đạo Văn)
- [ ] **Thuật Toán Vectorizing:**
  - Viết service nhận vào chuỗi String văn bản lớn -> Dùng hàm `split()` băm nhỏ đoạn văn thành câu (Sentences) hoặc Chunk (Window size).
  - Nạp các đoạn đó vào OpenAI embedding API `text-embedding-3-small` để biến text thành ma trận Vector số thực.
- [ ] **Thuật Toán Cosine Similarity:**
  - Lập trình hàm Toán học nhân vô hướng 2 Vector chia cho tích độ dài Vector để chấm điểm giống nhau (0 đến 1).
  - Quét (Scan) Vector văn bản mới trúng với các Vector văn bản đã có nằm trong Database. Nếu kết quả `>0.85 (85%)` -> Phất cờ "Nghi vấn đạo văn trùng lặp".
- [ ] **Xây API Output `POST /api/plagiarism/check`:**
  - Nhận text -> Test -> Đóng gói mảng Data trả về Client cấu trúc: Mảng chứa index bù trừ `[{ start: 10, end: 50, matchScore: 92% }]`. Lưu vào DB `PlagiarismReports`.

### 3.4 Module Quản Trị Hệ Thống (Admin APIs)
- [ ] Viết Queries Mongoose siêu tốc dùng `.aggregate()` để tính tổng Doanh Thu nhóm theo Date, hay tổng User Signup đếm theo Tháng cho cái Dashboard Chart.
- [ ] Viết CRUD cho System Templates, Model Cấu Hình, quản lý Khóa/Mở Khóa Account.

---

## GIAI ĐOẠN 4: PHÁT TRIỂN FRONTEND TÍCH HỢP (NEXT.JS)
**Mục tiêu:** Cài đặt giao diện Responsive theo Figma, gắn kết các API logic để thành ứng dụng nguyên khối linh hoạt.

### 4.1 Khởi tạo Next.js Foundation State
- [ ] Hoàn tất Config Tailwind trong `tailwind.config.ts`.
- [ ] Config thư viện gọi HTTP (như Axios) tại `src/lib/api.ts` -> Bắt Interceptor Auth dính kèm chuỗi JWT vào request.
- [ ] Cấu hình `Zustand` Stores nạp phiên người dùng (Session data của User).
- [ ] Code vỏ bao (Root Layout `layout.tsx`) có Provide trạng thái xác thực và Toasts báo hiệu.

### 4.2 Thiết lập Routing App Router Bóc Tách
- [ ] Build khung (Layout) riêng biệt: 
  - `app/(auth)/layout.tsx` (Có background form mượt).
  - `app/(user)/layout.tsx` (Có bọc bảo vệ Hook HOC chặn nếu không có Token `useAuth Guard`, có Menu ngang/dọc).
  - `app/(admin)/layout.tsx` (Chặn Guard bắt buộc `role === 'admin'`).

### 4.3 Phát triển Khối Chức Năng Cốt Lõi Frontend
- [ ] **Cánh Cửa Xác Thực (Auth Screen):** Trói biến Form qua Thư viện quản lý Validate (`react-hook-form` + `yup/zod`), ấn POST đẩy Backend lưu Token Cookie + LocalStorage.
- [ ] **Màn Sinh Chữ AI Trực Tuyến (`/generate` Screen):**
  - [ ] Gọi API Load danh sách Templates gán vô thẻ `<select>`.
  - [ ] Gắn thư viện `fetch` hoặc `EventSource` nguyên thủy để đón gói tin (Chunk Packets) từ **SSE Streaming** API. Cứ mỗi lần Server trả ký tự, nối thêm vòng lặp vào biến State UI (Tạo hiệu ứng gõ lốc cốc).
  - [ ] Render nội dung đầu ra bằng Thư viện `react-markdown` để nó biến kí tự `**đậm**`, `## Heading`, code syntax thành thẻ HTML chuẩn xác.
- [ ] **Dashboard Người Dùng & Quản Lý:** Gọi API Get đắp Data hiển thị Bảng `<table>` hoặc Biểu đồ D3/Chart.js `<Canvas>`. Có chức năng Paginations phân trang 10 bài/trang.
- [ ] **Màn hình Checkout Billing:** Chèn Loading Spinner lúc gọi gọi Webhook kết nối Server Stripe. Sang cổng thanh toán Stripe. Trả về màn Success.

### 4.4 ⭐ Tích hợp UI Module Ngôi sao - Plagiarism Detection
- [ ] Dựng màn hình `/plagiarism-check`. Gắn Form nhập Text. 
- [ ] Khi API trả về mảng Report (`matches`), lập trình hàm bóc tách văn bản:
  - Cắt lấy chuỗi String ở vị trí Index báo trùng -> Bọc (Wrap) nó vào thẻ `<mark class="bg-red-300">` hoặc tooltip báo mức %. Cực kỳ mượt để user nhận ra chỗ nào đi copy ở trên văn bản.

---

## GIAI ĐOẠN 5: KIỂM THỬ XUYÊN SUỐT (TESTING & QA)
**Mục tiêu:** Săn Bug trước ngày đem đi nghiệm thu Đồ Án.

- [ ] **Test Luồng Đăng nhập (Auth Flow):** Dùng JWT hết hạn xem Web có phát hiện lỗi 401 tự đá văng ra /login hay tự refresh thành công.
- [ ] **Test Giới hạn (Rate Limit Security):** Mở hai Tab ấn Spam nút Sinh AI điên cuồng 20 lần xem Server có block 429 Too Many Requests không.
- [ ] **Test Ngôi Sao (Plagiarism Accuracy):** Chuẩn bị 1 bài văn A. Copy hệt bài đó đổi đúng 2 chữ để làm bài B. Test nút kiểm tra xem tỉ lệ xuất đúng >95% và chĩa đúng vùng chữ không.
- [ ] **Kiểm tra UI/UX:** Test Grid Bootstrap/Tailwind trên chế độ giả lập Mobile/Tablet để đảm bảo các Sidebar không phá vỡ Layout nội dung AI.
- [ ] Fix triệt để Console Errors báo vàng/đỏ của Thư viện React.

---

## GIAI ĐOẠN 6: ĐÓNG GÓI CHUẨN ĐỒ ÁN VÀ DEPLOY PRODUCTION
**Mục tiêu:** Dựng Môi trường Online Live demo để giảng viên có thể theo đường Link chấm điểm trực tiếp.

### 6.1 Môi Trường Git & Docker Nội Bộ
- [ ] Gắn file `.gitignore`, khóa `.env` tuyệt đối không up lên Github.
- [ ] Kiểm tra Script `docker-compose up` tự build Image Server thành công kết nối MongoDB chạy ở `localhost:27017` hoàn hảo.

### 6.2 Chuẩn Bị Hosting Đưa Lên Mạng
- [ ] **Database Remote (Mongo Atlas):** Backup data mồi, Config Network IPs cho cả Internet có thể trỏ tới Server.
- [ ] **Triển Khai Backend Node.js:** Sử dụng dịch vụ như Render.com, Railway.app hoặc Máy Ảo DigitalOcean (Setup PM2 chạy ngầm `app.js`). Trỏ domain Back-end (Vd: `api.aicopywriter.com`). Cài cắm Environmental Variables.
- [ ] **Triển Khai Frontend Next.js:** Connect repo vào **Vercel** trực tiếp. Inject Environment URLs (link API). Chờ Vercel Build gán vào Domain chính mang đi nộp đồ án.
- [ ] **Smoke Test Cuối Cùng:** Sử dụng tài khoản Guest nãy chạy thử End-to-End Test sinh 1 bài viết -> Thấy mượt là hoàn thành Đồ Án Xuất Sắc.
