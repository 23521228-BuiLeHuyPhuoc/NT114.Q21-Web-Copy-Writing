<div align="center">

# CopyPro AI Copywriter

**Đồ án chuyên ngành NT114.Q21 - Website tạo nội dung marketing bằng AI**

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Vertex AI](https://img.shields.io/badge/Vertex_AI-Fine--tuning-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)

CopyPro hỗ trợ tạo, quản lý và đánh giá nội dung marketing, kiểm tra đạo văn, fine-tuning mô hình và quản trị hệ thống trên cùng một nền tảng.

</div>

---

## Thông tin đồ án

| Mục | Nội dung |
| --- | --- |
| Mã môn | `NT114.Q21` |
| Tên đề tài | Xây dựng Website AI Copywriter tích hợp GPT-4/Llama, RESTful API xử lý trên backend và fine-tuning mô hình theo ngành nghề cụ thể |
| Sinh viên | Bùi Lê Huy Phước |
| MSSV | `23521228` |

## Giới thiệu project

CopyPro là ứng dụng web full-stack dành cho người dùng cần tạo nội dung marketing và quản trị quy trình sản xuất nội dung. Người dùng có thể chọn loại bài viết, ngành nghề, giọng điệu, độ dài, từ khóa và mô hình AI để tạo nhiều phiên bản copy.

Sau khi tạo nội dung, hệ thống tự động:

1. Lưu nội dung và thông tin token vào MongoDB.
2. Kiểm tra đạo văn với các nội dung trong database và nguồn tham khảo.
3. Tính `% đạo văn`, `% độc đáo` và mức độ rủi ro.
4. Chấm điểm chất lượng dựa trên brief, format, CTA, độ dễ đọc, độ dài, tính cụ thể và `% đạo văn`.
5. Cho phép chỉnh sửa, lưu, tải xuống và quản lý nội dung theo project.

Hệ thống có hai khu vực riêng:

- **Customer workspace:** tạo nội dung, quản lý project/template, kiểm tra đạo văn, fine-tuning, billing và thông báo.
- **Admin console:** quản lý người dùng, nội dung, template, gói dịch vụ, thanh toán, mô hình AI, cấu hình hệ thống và audit log.

## Tính năng chính

- Tạo copy marketing bằng nhiều AI provider theo ngành nghề, tone, loại nội dung và độ dài.
- Chấm điểm chất lượng nội dung bằng heuristic scoring; điểm bị giảm khi tỷ lệ đạo văn từ 20% trở lên.
- Kiểm tra đạo văn bằng Exact match, N-gram, word overlap và cosine similarity trên embeddings.
- So sánh với nội dung trong database, nguồn tham khảo, file upload và nguồn web tùy cấu hình.
- Hỗ trợ đọc file `TXT`, `MD`, `CSV`, `JSON`, `HTML`, `RTF`, `DOCX` và `PDF` khi kiểm tra đạo văn.
- Quản lý content, project, template, notification, API key và lịch sử sử dụng.
- Quản lý gói dịch vụ và thanh toán qua VNPay, ZaloPay hoặc VietQR.
- Fine-tuning qua OpenAI, Vertex AI Gemini và Vertex AI open-model tuning cho Llama/Qwen.
- Xác thực User/Admin bằng JWT trong HTTP-only cookie, hỗ trợ OTP xác minh và đặt lại mật khẩu.
- Dashboard và khu vực quản trị riêng cho customer và administrator.

## Công nghệ sử dụng

| Thành phần | Công nghệ |
| --- | --- |
| Frontend | Next.js 14 App Router, React 18, TypeScript 5, Tailwind CSS 4 |
| UI | Material UI 7, Radix UI, Lucide Icons, Motion, Chart.js |
| State và data fetching | TanStack React Query 5, Zustand 5, Axios, React Hook Form |
| Rich-text và export | TinyMCE 8, React Markdown, SheetJS `xlsx` |
| Backend | Node.js, Express.js 4, RESTful API |
| Database | MongoDB/MongoDB Atlas, Mongoose 8 |
| Authentication | JWT, HTTP-only cookie, bcrypt, OTP email |
| Validation và security | Joi, Helmet, CORS, Express Rate Limit |
| Upload và document parsing | Multer, Cloudinary, Mammoth, PDF Parse |
| AI generation | Google Gemini, Vertex AI, OpenAI-compatible API, Groq, Free-GPT4 wrapper |
| Fine-tuning | OpenAI Fine-tuning, Vertex AI Gemini, Vertex AI Llama/Qwen helper bằng Python |
| Plagiarism | Exact match, N-gram, Jaccard/word overlap, embeddings, SerpApi, Common Crawl |
| Payment | VNPay sandbox, ZaloPay sandbox, VietQR |
| Email | Nodemailer/SMTP |

## Kiến trúc thư mục

```text
NT114.Q21-Web-Copy-Writing/
|-- backend/                          # Express REST API, MongoDB models, services và seed
|-- frontend/                         # Next.js App Router cho Customer và Admin
|-- training/vertex_open_model_tuning # Python helper cho Vertex AI Llama/Qwen
|-- scripts/                          # Script hỗ trợ Google Cloud bucket/IAM
|-- shared/                           # Tài nguyên dùng chung
|-- docs/                             # Tài liệu luồng xử lý của project
|-- Free-GPT4-WEB-API/                # Provider wrapper tùy chọn
`-- README.md
```

## Yêu cầu môi trường

- Git.
- Node.js 20 trở lên.
- Yarn Classic 1.x hoặc Corepack.
- MongoDB local hoặc MongoDB Atlas.
- Python 3.10 trở lên nếu dùng Vertex AI Llama/Qwen tuning.
- Google Cloud CLI nếu dùng Vertex AI.

Kiểm tra các công cụ:

```powershell
node -v
yarn -v
git --version
python --version
```

## Cài đặt project

### 1. Clone repository

```powershell
git clone --recurse-submodules <URL_REPOSITORY>
cd NT114.Q21-Web-Copy-Writing
```

Nếu clone thiếu submodule:

```powershell
git submodule update --init --recursive
```

### 2. Cài đặt Backend

```powershell
cd backend
yarn install
Copy-Item .env.example .env
```

Cấu hình tối thiểu trong `backend/.env`:

```env
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/ai-copywriter
FRONTEND_URL=http://localhost:3000
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
ADMIN_INVITE_CODE=ADMIN2026

# Chọn provider và thêm API key tương ứng nếu cần generate bằng AI thật
AI_PROVIDER=auto
GEMINI_API_KEY=
OPENAI_API_KEY=
GROQ_API_KEY=
```

Không commit file `.env` hoặc API key thật lên Git.

### 3. Cài đặt Frontend

```powershell
cd ..\frontend
yarn install
```

Tạo `frontend/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
```

TinyMCE được self-host trong frontend. Các lệnh `yarn install`, `yarn dev` và `yarn build` sẽ tự động copy asset cần thiết vào `frontend/public/tinymce`; không cần TinyMCE Cloud API key.

## Tài khoản mock để đăng nhập

Trước tiên, khởi động MongoDB và chạy seed:

```powershell
cd backend
yarn seed
```

Lệnh seed tạo hoặc cập nhật hai tài khoản demo sau:

| Vai trò | Trang đăng nhập | Email | Mật khẩu |
| --- | --- | --- | --- |
| Customer | `http://localhost:3000/login` | `customer@example.com` | `customer123` |
| Super Admin | `http://localhost:3000/admin/login` | `admin@example.com` | `admin123` |

Có thể đổi email demo trước khi chạy seed bằng hai biến môi trường:

```env
DEMO_CUSTOMER_EMAIL=customer@example.com
DEMO_ADMIN_EMAIL=admin@example.com
```

> Lưu ý: `yarn seed` sẽ đặt lại mật khẩu của hai tài khoản demo về giá trị trong bảng trên. Các tài khoản này chỉ dùng cho môi trường local/demo, không dùng trong production.

## Chạy project

Mở hai terminal tại thư mục gốc của project.

**Terminal 1 - Backend**

```powershell
cd backend
yarn dev
```

Backend chạy tại `http://localhost:4000`. Kiểm tra health endpoint:

```powershell
Invoke-RestMethod http://localhost:4000/api/health
```

**Terminal 2 - Frontend**

```powershell
cd frontend
yarn dev
```

Mở `http://localhost:3000` và đăng nhập bằng một trong hai tài khoản mock.

## Route chính

| Nhóm | Route |
| --- | --- |
| Public | `/`, `/pricing`, `/about`, `/blog`, `/contact` |
| Customer authentication | `/login`, `/register`, `/forgot-password`, `/reset-password` |
| Customer workspace | `/dashboard`, `/generate`, `/contents`, `/projects`, `/templates`, `/fine-tune`, `/plagiarism-check`, `/billing` |
| Admin authentication | `/admin/login`, `/admin/forgot-password` |
| Admin console | `/admin`, `/admin/users`, `/admin/contents`, `/admin/templates`, `/admin/plans`, `/admin/payments`, `/admin/models`, `/admin/settings` |

## API chính

| Endpoint | Chức năng |
| --- | --- |
| `GET /api/health` | Kiểm tra trạng thái backend |
| `/api/auth/user` | Đăng ký, đăng nhập và quản lý tài khoản customer |
| `/api/auth/admin` | Đăng nhập và quản lý tài khoản admin |
| `/api/contents` | Tạo và quản lý nội dung AI |
| `/api/projects` | Quản lý project |
| `/api/templates` | Quản lý template |
| `/api/fine-tune` | Dataset, job và fine-tuning model |
| `/api/plagiarism` | Kiểm tra đạo văn, upload file và lịch sử report |
| `/api/billing` | Gói dịch vụ, subscription và thanh toán |
| `/api/notifications` | Thông báo người dùng |
| `/api/admin/*` | API quản trị hệ thống |

## Cấu hình AI provider

Ví dụ một số provider phổ biến trong `backend/.env`:

```env
# Gemini
AI_PROVIDER=gemini
GEMINI_API_KEY=<your-gemini-api-key>
GEMINI_MODEL=<optional-model-name>

# OpenAI-compatible
AI_PROVIDER=openai
OPENAI_API_KEY=<your-openai-api-key>
OPENAI_MODEL=gpt-4o-mini
OPENAI_BASE_URL=https://api.openai.com/v1

# Groq
AI_PROVIDER=groq
GROQ_API_KEY=<your-groq-api-key>
GROQ_MODEL=<optional-model-name>
```

## Kiểm tra đạo văn

Hệ thống sử dụng scoring hybrid gồm Exact match, N-gram, word overlap và embedding similarity. Sau khi generate, backend tự động kiểm tra nội dung với database và reference source, lưu `plagiarismScore`, `originalityScore` và `riskLevel`.

Cấu hình mặc định:

```env
GENERATED_CONTENT_PLAGIARISM_THRESHOLD=35
GENERATED_CONTENT_PLAGIARISM_SENSITIVITY=balanced
GENERATED_CONTENT_PLAGIARISM_WEB_CHECK=false
```

Để bật tìm nguồn web, cấu hình thêm SerpApi và chuyển web check thành `true`:

```env
SERPAPI_API_KEY=<your-serpapi-key>
GENERATED_CONTENT_PLAGIARISM_WEB_CHECK=true
```

Điểm chất lượng trên frontend bị điều chỉnh theo `% đạo văn`:

- Dưới 20%: không trừ điểm.
- Từ 20% đến dưới 45%: trừ theo hệ số `0.35`.
- Từ 45% đến dưới 70%: trừ theo hệ số `0.55`.
- Từ 70% trở lên: trừ theo hệ số `0.75`.
- Điểm cuối cùng không vượt quá `% độc đáo = 100 - % đạo văn`.

## Vertex AI fine-tuning

Vertex Gemini cần Google Cloud project, location, bucket và Application Default Credentials:

```env
GOOGLE_CLOUD_PROJECT=<your-gcp-project-id>
GOOGLE_CLOUD_LOCATION=us-central1
VERTEX_TUNING_BUCKET=<your-gcs-bucket-name>
VERTEX_TUNING_BASE_MODELS=gemini-2.5-flash,gemini-2.5-flash-lite
```

```powershell
gcloud auth application-default login
gcloud config set project <your-gcp-project-id>
```

Vertex Llama/Qwen dùng Python helper trong `training/vertex_open_model_tuning`:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r training\vertex_open_model_tuning\requirements.txt
```

Fine-tuning trên Vertex AI có thể phát sinh chi phí thật trên Google Cloud project.

## Test và build

Chạy regression test cho plagiarism scoring:

```powershell
cd backend
yarn test:plagiarism
```

Build frontend:

```powershell
cd frontend
yarn build
```

## Ghi chú bảo mật

- Không commit `.env`, `.env.local`, credential, API key hoặc payment secret.
- Thay `JWT_SECRET`, `ADMIN_INVITE_CODE` và credential demo khi deploy production.
- Chỉ bật CORS cho các frontend origin được phép.
- Tài khoản mock và payment sandbox chỉ phục vụ phát triển/demo.
- Kiểm tra chi phí và quota trước khi chạy fine-tuning trên Vertex AI.
