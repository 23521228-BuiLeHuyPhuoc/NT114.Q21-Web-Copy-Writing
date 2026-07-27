# CopyPro AI Copywriter

## Tổng quan

CopyPro là website AI Copywriter hỗ trợ tạo và quản lý nội dung marketing theo loại bài viết, ngành nghề, giọng điệu, độ dài và từ khóa. Hệ thống gồm khu vực Customer và Admin, đồng thời hỗ trợ:

- Tạo nhiều phiên bản nội dung bằng các mô hình AI.
- Chấm điểm chất lượng và tự động giảm điểm dựa trên tỷ lệ đạo văn.
- Kiểm tra đạo văn bằng Exact match, N-gram, word overlap và embeddings.
- Quản lý content, project, template, thông báo, gói dịch vụ và thanh toán.
- Tạo dataset và fine-tuning mô hình qua OpenAI hoặc Vertex AI.

## Công nghệ sử dụng

| Thành phần | Công nghệ |
| --- | --- |
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js, RESTful API, Joi, JWT, HTTP-only Cookie |
| Database | MongoDB, Mongoose |
| AI | Gemini, Vertex AI, GPT-4 free, Groq, Llama |
| Đạo văn | Exact match, N-gram, Jaccard, cosine similarity, SerpApi, Common Crawl |
| Dịch vụ khác | Cloudinary, Nodemailer, VNPay, ZaloPay, VietQR |

## Production

Website: [https://nt-114-q21-web-copy-writing.vercel.app](https://nt-114-q21-web-copy-writing.vercel.app)

## Tài khoản demo

| Vai trò | Trang đăng nhập | Email | Mật khẩu |
| --- | --- | --- | --- |
| Customer | [Customer Login](https://nt-114-q21-web-copy-writing.vercel.app/login) | `customer@copypro.vn` | `customer123` |
| Super Admin | [Admin Login](https://nt-114-q21-web-copy-writing.vercel.app/admin/login) | `admin@copypro.vn` | `admin123` |
