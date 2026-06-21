<div align="center">

# CopyPro AI Copywriter

**Đồ án chuyên ngành NT114.Q21**

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=nextdotjs)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Vertex AI](https://img.shields.io/badge/Vertex_AI-Fine--tuning-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)

Website AI Copywriter tích hợp GPT-4/Llama, RESTful API backend và fine-tuning model theo ngành nghề cụ thể.

</div>

---

## Thông tin đồ án

| Mục | Nội dung |
| --- | --- |
| Mã môn | `NT114.Q21` |
| Tên đề tài | Xây dựng Website AI Copywriter tích hợp GPT-4/Llama, RESTful API xử lý trên backend và Fine-tuning để tinh chỉnh mô hình với ngành nghề cụ thể |
| Sinh viên | Bùi Lê Huy Phước |
| MSSV | `23521228` |

## Tính năng chính

- Sinh nội dung marketing bằng AI theo ngành nghề, tone, loại nội dung.
- Quản lý contents, projects, templates, notifications, billing.
- Dashboard người dùng và dashboard admin.
- Kiểm tra đạo văn nội dung AI.
- Fine-tuning qua Vertex AI Gemini và Vertex AI Llama/Qwen open-model tuning.
- Hỗ trợ nhiều provider: Gemini, Vertex AI, OpenAI-compatible API, Groq, OpenRouter, Free-GPT4 local wrapper.

## Công nghệ

| Phần | Stack |
| --- | --- |
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS, MUI, Radix UI, React Query, Zustand |
| Backend | Node.js, Express.js, Mongoose, Joi, JWT, Cookie Auth, Multer, Nodemailer |
| Database | MongoDB hoặc MongoDB Atlas |
| AI/Fine-tuning | Gemini, Vertex AI, Llama tuning helper |

## Cấu trúc ngắn gọn

```txt
NT114.Q21-Web-Copy-Writing/
├── backend/                         # Express REST API
├── frontend/                        # Next.js App Router
├── training/vertex_open_model_tuning # Python helper cho Vertex Llama/Qwen
├── scripts/                         # Script setup bucket/IAM Vertex
├── shared/
└── README.md
```

## Chuẩn bị môi trường

Cần có:

- Git
- Node.js 20+
- Yarn Classic 1.x hoặc Corepack
- MongoDB local hoặc MongoDB Atlas
- Python 3.10+ nếu dùng Vertex Llama/Qwen
- Google Cloud CLI nếu dùng Vertex AI

```powershell
node -v
yarn -v
git --version
python --version
```

## Clone project

```powershell
git clone --recurse-submodules <URL_REPOSITORY>
cd NT114.Q21-Web-Copy-Writing
```

Nếu clone thiếu submodule:

```powershell
git submodule update --init --recursive
```

## Cài Backend

```powershell
cd backend
yarn install
Copy-Item .env.example .env
```

Sửa nhanh `backend/.env` tối thiểu:

```env
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://admin:123@ac-r3mct8m-shard-00-00.o3r6tac.mongodb.net:27017,ac-r3mct8m-shard-00-01.o3r6tac.mongodb.net:27017,ac-r3mct8m-shard-00-02.o3r6tac.mongodb.net:27017/ai-copywriter?ssl=true&replicaSet=atlas-7hog99-shard-0&authSource=admin&retryWrites=true&w=majority

FRONTEND_URL=http://localhost:3000
PUBLIC_API_URL=http://localhost:4000
JWT_SECRET=change_me_in_real_env
JWT_EXPIRES_IN=7d
ADMIN_INVITE_CODE=ADMIN2026
AI_PROVIDER=gemini
GEMINI_API_KEY=
GOOGLE_CLOUD_PROJECT=
GOOGLE_CLOUD_LOCATION=us-central1
VERTEX_TUNING_BUCKET=
```

## Cài Frontend

```powershell
cd frontend
yarn install
```

Tạo `frontend/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
NEXT_PUBLIC_TINYMCE_API_KEY=
```

## Seed dữ liệu demo

MongoDB phải chạy trước khi seed.

```powershell
cd backend
yarn seed
```

Tài khoản demo:

| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| User | `customer@copypro.vn` | `customer123` |
| Admin | `admin@copypro.vn` | `admin123` |

## Chạy project

Mở 2 terminal.

**Terminal 1 - Backend**

```powershell
cd backend
yarn dev
```

API chạy tại `http://localhost:4000`.

```powershell
curl http://localhost:4000/api/health
```

**Terminal 2 - Frontend**

```powershell
cd frontend
yarn dev
```

Web chạy tại `http://localhost:3000`.

## Route chính

| Nhóm | Route |
| --- | --- |
| Public | `/`, `/pricing`, `/about`, `/blog`, `/contact` |
| Auth | `/login`, `/register`, `/forgot-password`, `/reset-password` |
| User | `/dashboard`, `/generate`, `/contents`, `/projects`, `/templates`, `/fine-tune`, `/plagiarism-check`, `/billing` |
| Admin | `/admin`, `/admin/users`, `/admin/contents`, `/admin/templates`, `/admin/plans`, `/admin/payments`, `/admin/models`, `/admin/settings` |

## API chính

| API | Chức năng |
| --- | --- |
| `/api/health` | Kiểm tra server |
| `/api/auth/user` | Auth user |
| `/api/auth/admin` | Auth admin |
| `/api/contents` | Nội dung AI |
| `/api/projects` | Dự án |
| `/api/templates` | Template |
| `/api/fine-tune` | Fine-tuning |
| `/api/plagiarism` | Kiểm tra đạo văn |
| `/api/billing` | Thanh toán |
| `/api/admin/*` | Quản trị |

<details>
<summary><strong>Cấu hình AI provider</strong></summary>

```env
# Gemini
AI_PROVIDER=gemini
GEMINI_API_KEY=<your-gemini-api-key>

# OpenAI-compatible
OPENAI_API_KEY=<your-openai-api-key>
OPENAI_MODEL=gpt-4o-mini
OPENAI_BASE_URL=https://api.openai.com/v1

# Groq
GROQ_API_KEY=<your-groq-api-key>

# OpenRouter
OPENROUTER_API_KEY=<your-openrouter-api-key>
OPENROUTER_SITE_URL=http://localhost:3000
OPENROUTER_APP_NAME=CopyPro AI
```

</details>

<details>
<summary><strong>Vertex AI fine-tuning</strong></summary>

### Vertex Gemini

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

### Vertex Llama/Qwen

Backend dùng Python helper:

```txt
training/vertex_open_model_tuning/submit_open_model_tuning.py
```

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r training\vertex_open_model_tuning\requirements.txt
```

```env
VERTEX_OPEN_MODEL_TUNING_BASE_MODELS=meta/llama3-3@llama-3.3-70b-instruct,qwen/qwen3@qwen3-14b
VERTEX_LLAMA_TUNING_BASE_MODELS=meta/llama3-3@llama-3.3-70b-instruct
VERTEX_QWEN_TUNING_BASE_MODELS=qwen/qwen3@qwen3-14b
VERTEX_OPEN_MODEL_TUNING_PYTHON=.venv/Scripts/python.exe
VERTEX_OPEN_MODEL_TUNING_MODE=PEFT_ADAPTER
VERTEX_QWEN_TUNING_MODE=FULL
```

Setup bucket/IAM nếu cần:

```powershell
.\scripts\setup_vertex_tuning_bucket.ps1 -ProjectId <your-gcp-project-id> -Location us-central1 -Bucket <your-gcs-bucket-name>
```

Lưu ý: Vertex AI fine-tuning có thể phát sinh chi phí thật.

</details>

<details>
<summary><strong>Thanh toán và kiểm tra đạo văn</strong></summary>

```env
# Plagiarism web check
SERPAPI_API_KEY=<your-serpapi-key>
SERPAPI_NUM_RESULTS=10
SERPAPI_MAX_RESULTS=12

# VNPay sandbox
VNPAY_PAYMENT_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_TMN_CODE=<sandbox-tmn-code>
VNPAY_HASH_SECRET=<sandbox-secret>

# ZaloPay sandbox
ZALOPAY_ENDPOINT=https://sb-openapi.zalopay.vn/v2/create
ZALOPAY_QUERY_ENDPOINT=https://sb-openapi.zalopay.vn/v2/query
ZALOPAY_APP_ID=<sandbox-app-id>
ZALOPAY_KEY1=<sandbox-key1>
ZALOPAY_KEY2=<sandbox-key2>
```

</details>

## Chạy nhanh từ đầu tới cuối

```powershell
git clone --recurse-submodules <URL_REPOSITORY>
cd NT114.Q21-Web-Copy-Writing

cd backend
yarn install
Copy-Item .env.example .env
yarn seed
yarn dev

# Mở terminal mới
cd frontend
yarn install
yarn dev
```

Mở `http://localhost:3000` và đăng nhập bằng tài khoản demo.

## Ghi chú nộp đồ án

- Không commit `node_modules/`, `.next/`, `.venv/`, `.env` hoặc credential thật.
- Nếu demo AI thật, chuẩn bị key provider trong `backend/.env`.
- Nếu demo Vertex Llama/Qwen, chuẩn bị trước Google Cloud project, bucket, IAM và Python venv.
- Nếu chỉ demo giao diện và CRUD, có thể dùng dữ liệu seed mà không cần key AI thật.
