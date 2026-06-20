# Đồ án chuyên ngành NT114.Q21 - CopyPro AI Copywriter

Đây là đồ án chuyên ngành môn **NT114.Q21**.

- **Tên đề tài:** Xây dựng Website AI Copywriter tích hợp GPT-4/Llama, RESTful API xử lý trên backend và Fine-tuning để tinh chỉnh mô hình với ngành nghề cụ thể.
- **Sinh viên thực hiện:** Bùi Lê Huy Phước
- **MSSV:** 23521228

CopyPro AI Copywriter là website hỗ trợ tạo nội dung marketing bằng AI, quản lý nội dung/dự án/template, kiểm tra đạo văn, quản lý gói dịch vụ, thanh toán, thông báo, dashboard người dùng, dashboard admin và fine-tuning model theo brand voice hoặc ngành nghề cụ thể.

## Công nghệ chính

| Phần | Công nghệ |
| --- | --- |
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS, MUI, Radix UI, React Query, Zustand |
| Backend | Node.js, Express.js, Mongoose, Joi, JWT, Cookie Auth, Multer, Nodemailer |
| Database | MongoDB hoặc MongoDB Atlas |
| AI generation | Gemini, Vertex AI, OpenAI-compatible API, Groq, OpenRouter, Free-GPT4 local wrapper |
| Fine-tuning | Vertex AI Gemini, Vertex AI Llama/Qwen open-model tuning, OpenAI-compatible fine-tuning |
| Khác | Cloudinary upload, SerpApi/Common Crawl plagiarism web check, VNPay/ZaloPay/VietQR sandbox |

## Cấu trúc project

```txt
NT114.Q21-Web-Copy-Writing/
├── backend/                         # RESTful API Express.js
│   ├── src/
│   │   ├── app.js                    # Middleware và routes
│   │   ├── server.js                 # Entry chạy API server
│   │   ├── config/                   # Kết nối DB, cấu hình model
│   │   ├── controllers/              # Controller theo module
│   │   ├── middlewares/              # Auth, validation, upload, error handler
│   │   ├── models/                   # Mongoose models
│   │   ├── routes/                   # Routes user/admin
│   │   ├── services/                 # Business logic, AI, fine-tuning, billing
│   │   ├── utils/                    # Helper, seed data
│   │   └── validations/              # Joi schemas
│   ├── .env.example
│   ├── package.json
│   └── yarn.lock
├── frontend/                         # Next.js App Router frontend
│   ├── public/
│   ├── src/
│   │   ├── app/                      # Pages/routes
│   │   ├── hooks/                    # React Query hooks
│   │   ├── lib/                      # Axios, helpers, config UI
│   │   ├── services/                 # API service layer
│   │   ├── stores/                   # Zustand stores
│   │   ├── styles/                   # CSS global/theme
│   │   └── types/                    # TypeScript types
│   ├── package.json
│   └── yarn.lock
├── training/vertex_open_model_tuning/ # Helper Python cho Vertex Llama/Qwen fine-tuning
├── scripts/                          # Script setup GCP bucket/IAM
├── shared/
└── README.md
```

## Yêu cầu môi trường

Cài sẵn các công cụ sau:

- Git
- Node.js 20 LTS hoặc mới hơn
- Yarn Classic 1.x hoặc Corepack
- MongoDB local hoặc MongoDB Atlas
- Python 3.10+ nếu dùng Vertex AI Llama/Qwen open-model fine-tuning
- Google Cloud CLI nếu dùng Vertex AI hoặc Google Application Default Credentials

Kiểm tra nhanh:

```powershell
node -v
yarn -v
git --version
python --version
```

Nếu chưa có Yarn:

```powershell
corepack enable
corepack prepare yarn@1.22.22 --activate
```

## Clone project

Clone đầy đủ repo kèm submodule Free-GPT4-WEB-API:

```powershell
git clone --recurse-submodules <URL_REPOSITORY>
cd NT114.Q21-Web-Copy-Writing
```

Nếu đã clone trước đó nhưng thiếu submodule:

```powershell
git submodule update --init --recursive
```

Nếu không dùng provider Free-GPT4 local thì submodule này không bắt buộc cho các luồng chính.

## Cài đặt Backend

```powershell
cd backend
yarn install
Copy-Item .env.example .env
```

Mở `backend/.env` và chỉnh các biến cần thiết. Mẫu dưới đây đủ để chạy demo local, sau đó có thể bổ sung key provider theo nhu cầu:

```env
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/ai-copywriter
FRONTEND_URL=http://localhost:3000
PUBLIC_API_URL=http://localhost:4000
JWT_SECRET=change_me_in_real_env
JWT_EXPIRES_IN=7d
ADMIN_INVITE_CODE=ADMIN2026
OTP_EXPIRES_MINUTES=5

# AI generation
AI_PROVIDER=gemini
GEMINI_API_KEY=
GOOGLE_API_KEY=
GEMINI_MODEL=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
OPENAI_BASE_URL=https://api.openai.com/v1
GROQ_API_KEY=
GROQ_MODEL=
OPENROUTER_API_KEY=
OPENROUTER_MODEL=
OPENROUTER_SITE_URL=http://localhost:3000
OPENROUTER_APP_NAME=CopyPro AI

# Google Cloud / Vertex AI
GOOGLE_CLOUD_PROJECT=
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=
VERTEX_TUNING_BUCKET=
VERTEX_TUNING_BASE_MODELS=gemini-2.5-flash,gemini-2.5-flash-lite
VERTEX_OPEN_MODEL_TUNING_BASE_MODELS=meta/llama3-3@llama-3.3-70b-instruct,qwen/qwen3@qwen3-14b
VERTEX_LLAMA_TUNING_BASE_MODELS=meta/llama3-3@llama-3.3-70b-instruct
VERTEX_QWEN_TUNING_BASE_MODELS=qwen/qwen3@qwen3-14b
VERTEX_OPEN_MODEL_TUNING_ENDPOINT=
VERTEX_LLAMA_TUNING_ENDPOINT=
VERTEX_QWEN_TUNING_ENDPOINT=
VERTEX_OPEN_MODEL_TUNING_PYTHON=.venv/Scripts/python.exe
VERTEX_OPEN_MODEL_TUNING_MODE=PEFT_ADAPTER
VERTEX_QWEN_TUNING_MODE=FULL
VERTEX_OPEN_MODEL_TUNING_OUTPUT_GCS_URI=
VERTEX_OPEN_MODEL_TUNING_ADAPTER_SIZE=

# Plagiarism web check
SERPAPI_API_KEY=
SERPAPI_NUM_RESULTS=10
SERPAPI_MAX_RESULTS=12
COMMON_CRAWL_TOTAL_BUDGET_MS=45000
COMMON_CRAWL_MAX_FETCHES=12

# Upload / email
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_AVATAR_FOLDER=copypro/avatars/users
CLOUDINARY_PLAGIARISM_FOLDER=copypro/plagiarism/uploads
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM=

# Free-GPT4 local wrapper
FREEGPT4_BASE_URL=http://127.0.0.1:5500
FREEGPT4_MODEL=gpt-4
FREEGPT4_KEYWORD=text
FREEGPT4_TIMEOUT_MS=90000

# Payment sandbox
VNPAY_PAYMENT_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_TMN_CODE=
VNPAY_HASH_SECRET=
VNPAY_RETURN_URL=
VNPAY_IPN_URL=
ZALOPAY_ENDPOINT=https://sb-openapi.zalopay.vn/v2/create
ZALOPAY_QUERY_ENDPOINT=https://sb-openapi.zalopay.vn/v2/query
ZALOPAY_APP_ID=
ZALOPAY_KEY1=
ZALOPAY_KEY2=
ZALOPAY_RETURN_URL=
ZALOPAY_CALLBACK_URL=
VIETQR_BANK_ID=
VIETQR_BANK_NAME=
VIETQR_ACCOUNT_NO=
VIETQR_ACCOUNT_NAME=
VIETQR_TEMPLATE=compact2
VIETQR_ADD_INFO_PREFIX=COPYPRO
VIETQR_IMAGE_BASE_URL=https://img.vietqr.io/image
PAYMENT_GATEWAY_TIMEOUT_MS=15000
NGROK=
```

Ghi chú:

- Nếu chỉ chạy demo giao diện và CRUD, có thể để trống AI keys, Cloudinary, SMTP và payment keys.
- Nếu muốn sinh nội dung thật, điền ít nhất một provider như `GEMINI_API_KEY`, `OPENAI_API_KEY`, `GROQ_API_KEY` hoặc `OPENROUTER_API_KEY`.
- Nếu muốn kiểm tra đạo văn web, điền `SERPAPI_API_KEY`.
- Nếu muốn fine-tuning thật trên Vertex AI, xem phần Vertex AI bên dưới.

## Cài đặt Frontend

Mở terminal mới tại root project:

```powershell
cd frontend
yarn install
```

Tạo `frontend/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
NEXT_PUBLIC_TINYMCE_API_KEY=
```

`NEXT_PUBLIC_TINYMCE_API_KEY` chỉ cần khi dùng editor TinyMCE có key riêng.

## Chuẩn bị MongoDB

Chọn một trong hai cách.

### MongoDB local

Chạy MongoDB service trên máy, rồi dùng URI:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/ai-copywriter
```

### MongoDB Atlas

Tạo cluster Atlas, whitelist IP, tạo database user, rồi dùng URI dạng:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/ai-copywriter?retryWrites=true&w=majority
```

## Seed dữ liệu demo

Sau khi cấu hình `backend/.env` và MongoDB chạy được:

```powershell
cd backend
yarn seed
```

Tài khoản demo sau khi seed:

| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| User | `customer@copypro.vn` | `customer123` |
| Admin | `admin@copypro.vn` | `admin123` |

## Chạy project local

Mở 2 terminal.

Terminal 1 - Backend:

```powershell
cd backend
yarn dev
```

Backend chạy ở `http://localhost:4000`. Kiểm tra health check:

```powershell
curl http://localhost:4000/api/health
```

Terminal 2 - Frontend:

```powershell
cd frontend
yarn dev
```

Frontend chạy ở `http://localhost:3000`.

## Build production local

Backend:

```powershell
cd backend
yarn start
```

Frontend:

```powershell
cd frontend
yarn build
yarn start
```

## Các route chính

### Public/Auth

| Route | Chức năng |
| --- | --- |
| `/` | Trang chủ |
| `/pricing` | Bảng giá |
| `/about` | Giới thiệu |
| `/blog` | Blog |
| `/contact` | Liên hệ |
| `/login` | Đăng nhập user |
| `/register` | Đăng ký user |
| `/forgot-password` | Quên mật khẩu |
| `/reset-password` | Đặt lại mật khẩu |

### User

| Route | Chức năng |
| --- | --- |
| `/dashboard` | Dashboard người dùng |
| `/generate` | Sinh nội dung AI |
| `/contents` | Quản lý nội dung |
| `/projects` | Quản lý dự án |
| `/templates` | Thư viện template |
| `/fine-tune` | Fine-tuning Studio |
| `/plagiarism-check` | Kiểm tra đạo văn |
| `/profile` | Hồ sơ cá nhân |
| `/billing` | Gói dịch vụ và thanh toán |
| `/notifications` | Thông báo |

### Admin

| Route | Chức năng |
| --- | --- |
| `/admin/login` | Đăng nhập admin |
| `/admin` | Dashboard admin |
| `/admin/users` | Quản lý user |
| `/admin/contents` | Quản lý nội dung |
| `/admin/templates` | Quản lý template |
| `/admin/generate-options` | Quản lý ngành nghề, loại nội dung, tone |
| `/admin/plans` | Quản lý gói dịch vụ |
| `/admin/payments` | Quản lý thanh toán |
| `/admin/models` | Quản lý model AI |
| `/admin/settings` | Cài đặt hệ thống |
| `/admin/audit-logs` | Nhật ký hệ thống |
| `/admin/permissions` | Phân quyền admin |

## API Backend chính

| API | Chức năng |
| --- | --- |
| `/api/health` | Kiểm tra server |
| `/api/auth/user` | Auth user |
| `/api/auth/admin` | Auth admin |
| `/api/contents` | Nội dung AI |
| `/api/projects` | Dự án |
| `/api/templates` | Template |
| `/api/fine-tune` | Dataset, example, job fine-tuning |
| `/api/plagiarism` | Kiểm tra đạo văn |
| `/api/billing` | Plan, checkout, payment |
| `/api/notifications` | Thông báo |
| `/api/admin/*` | API quản trị |

## Fine-tuning trên Vertex AI

Project có 2 nhánh Vertex fine-tuning.

### Vertex Gemini fine-tuning

Nhánh này do backend gọi Vertex AI REST API trực tiếp. Backend lấy examples từ MongoDB, build JSONL, upload lên GCS, rồi tạo tuning job.

Biến cần có:

```env
GOOGLE_CLOUD_PROJECT=<your-gcp-project-id>
GOOGLE_CLOUD_LOCATION=us-central1
VERTEX_TUNING_BUCKET=<your-gcs-bucket-name>
VERTEX_TUNING_BASE_MODELS=gemini-2.5-flash,gemini-2.5-flash-lite
```

Đăng nhập Application Default Credentials khi chạy local:

```powershell
gcloud auth application-default login
gcloud config set project <your-gcp-project-id>
```

### Vertex Llama/Qwen open-model fine-tuning

Nhánh Llama/Qwen vẫn đi qua API backend, nhưng backend gọi thêm Python helper tại:

```txt
training/vertex_open_model_tuning/submit_open_model_tuning.py
```

Tạo virtual environment ở root project:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r training\vertex_open_model_tuning\requirements.txt
```

Cấu hình backend:

```env
GOOGLE_CLOUD_PROJECT=<your-gcp-project-id>
GOOGLE_CLOUD_LOCATION=us-central1
VERTEX_TUNING_BUCKET=<your-gcs-bucket-name>
VERTEX_OPEN_MODEL_TUNING_BASE_MODELS=meta/llama3-3@llama-3.3-70b-instruct,qwen/qwen3@qwen3-14b
VERTEX_LLAMA_TUNING_BASE_MODELS=meta/llama3-3@llama-3.3-70b-instruct
VERTEX_QWEN_TUNING_BASE_MODELS=qwen/qwen3@qwen3-14b
VERTEX_OPEN_MODEL_TUNING_PYTHON=.venv/Scripts/python.exe
VERTEX_OPEN_MODEL_TUNING_MODE=PEFT_ADAPTER
VERTEX_QWEN_TUNING_MODE=FULL
VERTEX_OPEN_MODEL_TUNING_OUTPUT_GCS_URI=
```

Nếu cần tạo bucket và cấp quyền cho Vertex open-model tuning service account:

```powershell
.\scripts\setup_vertex_tuning_bucket.ps1 -ProjectId <your-gcp-project-id> -Location us-central1 -Bucket <your-gcs-bucket-name>
```

Preflight Python helper:

```powershell
@'
{"preflight": true}
'@ | Set-Content -Encoding UTF8 $env:TEMP\vertex-llama-preflight.json
.\.venv\Scripts\python.exe training\vertex_open_model_tuning\submit_open_model_tuning.py --config $env:TEMP\vertex-llama-preflight.json
```

Sau khi cấu hình xong, vào `/fine-tune`, chọn provider Vertex AI Llama/Qwen, chọn base model, tạo dataset ít nhất 10 examples và start training.

Lưu ý: Vertex AI fine-tuning có thể phát sinh chi phí thật trên Google Cloud.

## Kiểm tra đạo văn

Nếu muốn dò nguồn web, cấu hình SerpApi:

```env
SERPAPI_API_KEY=<your-serpapi-key>
SERPAPI_NUM_RESULTS=10
SERPAPI_MAX_RESULTS=12
COMMON_CRAWL_TOTAL_BUDGET_MS=45000
COMMON_CRAWL_MAX_FETCHES=12
```

Nếu muốn upload file qua Cloudinary:

```env
CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>
CLOUDINARY_PLAGIARISM_FOLDER=copypro/plagiarism/uploads
```

## Thanh toán sandbox

Các cổng thanh toán trong project dùng cấu hình sandbox/demo. Điền key tương ứng nếu muốn test luồng checkout.

VNPay:

```env
VNPAY_PAYMENT_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_TMN_CODE=<sandbox-tmn-code>
VNPAY_HASH_SECRET=<sandbox-secret>
VNPAY_RETURN_URL=http://localhost:4000/api/billing/vnpay/return
VNPAY_IPN_URL=http://localhost:4000/api/billing/vnpay/ipn
```

ZaloPay:

```env
ZALOPAY_ENDPOINT=https://sb-openapi.zalopay.vn/v2/create
ZALOPAY_QUERY_ENDPOINT=https://sb-openapi.zalopay.vn/v2/query
ZALOPAY_APP_ID=<sandbox-app-id>
ZALOPAY_KEY1=<sandbox-key1>
ZALOPAY_KEY2=<sandbox-key2>
ZALOPAY_RETURN_URL=http://localhost:3000/billing
ZALOPAY_CALLBACK_URL=http://localhost:4000/api/billing/zalopay/callback
```

## Troubleshooting

### Frontend không gọi được backend

Kiểm tra `frontend/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
```

Kiểm tra backend:

```powershell
curl http://localhost:4000/api/health
```

### Lỗi CORS

Backend chỉ cho origin trong `FRONTEND_URL`. Khi chạy local đặt:

```env
FRONTEND_URL=http://localhost:3000
```

### Lỗi MongoDB connection

Kiểm tra MongoDB service hoặc URI Atlas. Backend dùng timeout kết nối ngắn nên URI sai sẽ fail nhanh khi start.

### Lỗi Google credential khi dùng Vertex AI

```powershell
gcloud auth application-default login
gcloud config set project <your-gcp-project-id>
```

Hoặc đặt `GOOGLE_APPLICATION_CREDENTIALS` trỏ tới service-account JSON hợp lệ.

### Lỗi Vertex Llama/Qwen báo thiếu submit script

Không xóa folder này:

```txt
training/vertex_open_model_tuning/
```

Backend mặc định cần file:

```txt
training/vertex_open_model_tuning/submit_open_model_tuning.py
```

### Lỗi thiếu Python SDK khi fine-tune Llama/Qwen

```powershell
.\.venv\Scripts\Activate.ps1
python -m pip install -r training\vertex_open_model_tuning\requirements.txt
```

## Quy trình chạy nhanh từ đầu tới cuối

```powershell
# 1. Clone
git clone --recurse-submodules <URL_REPOSITORY>
cd NT114.Q21-Web-Copy-Writing

# 2. Backend
cd backend
yarn install
Copy-Item .env.example .env
# Chỉnh backend/.env: MONGODB_URI, JWT_SECRET, AI keys nếu cần
yarn seed
yarn dev

# 3. Frontend, mở terminal mới tại root project
cd frontend
yarn install
# Tạo frontend/.env.local với NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
yarn dev

# 4. Mở web
# http://localhost:3000
```

Tài khoản demo sau khi seed:

```txt
User:  customer@copypro.vn / customer123
Admin: admin@copypro.vn    / admin123
```

## Ghi chú nộp đồ án

- Không commit `node_modules/`, `.next/`, `.venv/`, `.env` hoặc file credential thật.
- Nếu cần demo AI thật, chuẩn bị sẵn key provider trong `backend/.env` trước khi chạy.
- Nếu cần demo Vertex Llama/Qwen, chuẩn bị trước Google Cloud project, bucket, IAM và Python virtual environment.
- Nếu chỉ demo giao diện và nghiệp vụ CRUD, có thể dùng dữ liệu seed mà không cần key AI thật.
