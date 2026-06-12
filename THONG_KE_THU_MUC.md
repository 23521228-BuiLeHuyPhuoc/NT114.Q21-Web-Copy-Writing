# Thống Kê Toàn Bộ File Dự Án

File này thống kê đệ quy các file trong thư mục `NT114.Q21-Web-Copy-Writing`.

- Tổng file trên filesystem nếu tính cả metadata/dependency/cache: 90866
- Tổng file dự án được liệt kê bên dưới: 496
- Không liệt kê nội dung file bí mật như `.env`; chỉ ghi đường dẫn và mô tả.

## Thư Mục Kỹ Thuật Đã Loại Trừ

Các thư mục dưới đây bị loại khỏi bảng chi tiết vì là metadata Git, môi trường ảo, dependency hoặc output build/cache.

| Thư mục | Số file bị loại |
|---|---:|
| `.git` | 235 |
| `.venv` | 15051 |
| `backend/node_modules` | 2673 |
| `Free-GPT4-WEB-API/.git` | 34 |
| `frontend/.next` | 546 |
| `frontend/dist` | 335 |
| `frontend/node_modules` | 71496 |

## Danh Sách File

| STT | Đường dẫn | Kích thước | Mô tả ngắn |
|---:|---|---:|---|
| 1 | `.gitignore` | 572 B | Danh sách file/thư mục Git bỏ qua. |
| 2 | `backend/.env` | 3.1 KB | File cấu hình môi trường cục bộ; không đọc hoặc ghi nội dung bí mật vào thống kê. |
| 3 | `backend/.env.example` | 3.7 KB | File mẫu biến môi trường dùng để cấu hình dự án. |
| 4 | `backend/backend-4000.err.log` | 48 B | Log chạy backend/dev server. |
| 5 | `backend/backend-4000.log` | 274.3 KB | Log chạy backend/dev server. |
| 6 | `backend/dev-4001.log` | 71.5 KB | Log chạy backend/dev server. |
| 7 | `backend/dev-module5.err.log` | 0 B | Log chạy backend/dev server. |
| 8 | `backend/dev-module5.out.log` | 2.6 KB | Log chạy backend/dev server. |
| 9 | `backend/Dockerfile` | 0 B | File không có phần mở rộng trong dự án. |
| 10 | `backend/package.json` | 668 B | Manifest npm khai báo script và dependency. |
| 11 | `backend/server-4000.err.log` | 0 B | Log chạy backend/dev server. |
| 12 | `backend/server-4000.log` | 11.7 KB | Log chạy backend/dev server. |
| 13 | `backend/server-4001.log` | 552 B | Log chạy backend/dev server. |
| 14 | `backend/src/app.js` | 2.9 KB | Cấu hình ứng dụng Express và mount route. |
| 15 | `backend/src/config/database.js` | 473 B | Module JavaScript của ứng dụng hoặc script hỗ trợ. |
| 16 | `backend/src/controllers/admin/auditLogController.js` | 377 B | Controller backend xử lý request/response cho nhóm API tương ứng. |
| 17 | `backend/src/controllers/admin/authController.js` | 1.8 KB | Controller backend xử lý request/response cho nhóm API tương ứng. |
| 18 | `backend/src/controllers/admin/categoryController.js` | 1.9 KB | Controller backend xử lý request/response cho nhóm API tương ứng. |
| 19 | `backend/src/controllers/admin/contentController.js` | 1.9 KB | Controller backend xử lý request/response cho nhóm API tương ứng. |
| 20 | `backend/src/controllers/admin/paymentController.js` | 687 B | Controller backend xử lý request/response cho nhóm API tương ứng. |
| 21 | `backend/src/controllers/admin/planController.js` | 2.7 KB | Controller backend xử lý request/response cho nhóm API tương ứng. |
| 22 | `backend/src/controllers/admin/statsController.js` | 371 B | Controller backend xử lý request/response cho nhóm API tương ứng. |
| 23 | `backend/src/controllers/admin/userController.js` | 3.7 KB | Controller backend xử lý request/response cho nhóm API tương ứng. |
| 24 | `backend/src/controllers/user/authController.js` | 2.0 KB | Controller backend xử lý request/response cho nhóm API tương ứng. |
| 25 | `backend/src/controllers/user/billingController.js` | 1.7 KB | Controller backend xử lý request/response cho nhóm API tương ứng. |
| 26 | `backend/src/controllers/user/contentController.js` | 1.7 KB | Controller backend xử lý request/response cho nhóm API tương ứng. |
| 27 | `backend/src/controllers/user/fineTuneController.js` | 5.3 KB | Controller backend xử lý request/response cho nhóm API tương ứng. |
| 28 | `backend/src/controllers/user/notificationController.js` | 1.0 KB | Controller backend xử lý request/response cho nhóm API tương ứng. |
| 29 | `backend/src/controllers/user/plagiarismController.js` | 1.2 KB | Controller backend xử lý request/response cho nhóm API tương ứng. |
| 30 | `backend/src/controllers/user/projectController.js` | 1.1 KB | Controller backend xử lý request/response cho nhóm API tương ứng. |
| 31 | `backend/src/controllers/user/templateController.js` | 911 B | Controller backend xử lý request/response cho nhóm API tương ứng. |
| 32 | `backend/src/middlewares/auth/authMiddleware.js` | 1.9 KB | Middleware Express cho xác thực, phân quyền hoặc xử lý request. |
| 33 | `backend/src/middlewares/error/errorHandler.js` | 525 B | Middleware Express cho xác thực, phân quyền hoặc xử lý request. |
| 34 | `backend/src/middlewares/error/notFound.js` | 168 B | Middleware Express cho xác thực, phân quyền hoặc xử lý request. |
| 35 | `backend/src/middlewares/rateLimit/authRateLimiter.js` | 559 B | Middleware Express cho xác thực, phân quyền hoặc xử lý request. |
| 36 | `backend/src/middlewares/validation/validate.js` | 993 B | Middleware Express cho xác thực, phân quyền hoặc xử lý request. |
| 37 | `backend/src/models/AccountAdmin.js` | 1.6 KB | Model/schema Mongoose cho dữ liệu MongoDB. |
| 38 | `backend/src/models/AccountUser.js` | 1.3 KB | Model/schema Mongoose cho dữ liệu MongoDB. |
| 39 | `backend/src/models/AuditLog.js` | 1.4 KB | Model/schema Mongoose cho dữ liệu MongoDB. |
| 40 | `backend/src/models/Category.js` | 1.1 KB | Model/schema Mongoose cho dữ liệu MongoDB. |
| 41 | `backend/src/models/Content.js` | 2.0 KB | Model/schema Mongoose cho dữ liệu MongoDB. |
| 42 | `backend/src/models/FineTuneDataset.js` | 1.9 KB | Model/schema Mongoose cho dữ liệu MongoDB. |
| 43 | `backend/src/models/FineTunedModel.js` | 1.8 KB | Model/schema Mongoose cho dữ liệu MongoDB. |
| 44 | `backend/src/models/FineTuneExample.js` | 1.5 KB | Model/schema Mongoose cho dữ liệu MongoDB. |
| 45 | `backend/src/models/FineTuneJob.js` | 2.8 KB | Model/schema Mongoose cho dữ liệu MongoDB. |
| 46 | `backend/src/models/FineTuneMetric.js` | 1.0 KB | Model/schema Mongoose cho dữ liệu MongoDB. |
| 47 | `backend/src/models/ForgotPassword.js` | 995 B | Model/schema Mongoose cho dữ liệu MongoDB. |
| 48 | `backend/src/models/Notification.js` | 1.0 KB | Model/schema Mongoose cho dữ liệu MongoDB. |
| 49 | `backend/src/models/Payment.js` | 1.8 KB | Model/schema Mongoose cho dữ liệu MongoDB. |
| 50 | `backend/src/models/PlagiarismReport.js` | 10.0 KB | Model/schema Mongoose cho dữ liệu MongoDB. |
| 51 | `backend/src/models/Plan.js` | 1.8 KB | Model/schema Mongoose cho dữ liệu MongoDB. |
| 52 | `backend/src/models/Project.js` | 973 B | Model/schema Mongoose cho dữ liệu MongoDB. |
| 53 | `backend/src/models/Subscription.js` | 1.3 KB | Model/schema Mongoose cho dữ liệu MongoDB. |
| 54 | `backend/src/models/Template.js` | 1.9 KB | Model/schema Mongoose cho dữ liệu MongoDB. |
| 55 | `backend/src/models/UsageLog.js` | 1.1 KB | Model/schema Mongoose cho dữ liệu MongoDB. |
| 56 | `backend/src/routes/admin/auditLogRoutes.js` | 520 B | Khai báo route Express cho API backend. |
| 57 | `backend/src/routes/admin/authRoutes.js` | 1.0 KB | Khai báo route Express cho API backend. |
| 58 | `backend/src/routes/admin/categoryRoutes.js` | 1.1 KB | Khai báo route Express cho API backend. |
| 59 | `backend/src/routes/admin/contentRoutes.js` | 1.2 KB | Khai báo route Express cho API backend. |
| 60 | `backend/src/routes/admin/paymentRoutes.js` | 382 B | Khai báo route Express cho API backend. |
| 61 | `backend/src/routes/admin/planRoutes.js` | 1012 B | Khai báo route Express cho API backend. |
| 62 | `backend/src/routes/admin/statsRoutes.js` | 318 B | Khai báo route Express cho API backend. |
| 63 | `backend/src/routes/admin/userRoutes.js` | 1.1 KB | Khai báo route Express cho API backend. |
| 64 | `backend/src/routes/user/authRoutes.js` | 1.1 KB | Khai báo route Express cho API backend. |
| 65 | `backend/src/routes/user/billingRoutes.js` | 870 B | Khai báo route Express cho API backend. |
| 66 | `backend/src/routes/user/contentRoutes.js` | 1.0 KB | Khai báo route Express cho API backend. |
| 67 | `backend/src/routes/user/fineTuneRoutes.js` | 2.7 KB | Khai báo route Express cho API backend. |
| 68 | `backend/src/routes/user/notificationRoutes.js` | 747 B | Khai báo route Express cho API backend. |
| 69 | `backend/src/routes/user/plagiarismRoutes.js` | 1003 B | Khai báo route Express cho API backend. |
| 70 | `backend/src/routes/user/projectRoutes.js` | 860 B | Khai báo route Express cho API backend. |
| 71 | `backend/src/routes/user/templateRoutes.js` | 732 B | Khai báo route Express cho API backend. |
| 72 | `backend/src/server.js` | 1.3 KB | Entry point khởi động server backend. |
| 73 | `backend/src/services/adminContentService.js` | 5.5 KB | Service backend chứa logic nghiệp vụ và tích hợp bên ngoài. |
| 74 | `backend/src/services/adminDashboardService.js` | 3.4 KB | Service backend chứa logic nghiệp vụ và tích hợp bên ngoài. |
| 75 | `backend/src/services/adminUserService.js` | 5.1 KB | Service backend chứa logic nghiệp vụ và tích hợp bên ngoài. |
| 76 | `backend/src/services/aiService.js` | 50.7 KB | Service backend chứa logic nghiệp vụ và tích hợp bên ngoài. |
| 77 | `backend/src/services/auditLogService.js` | 3.5 KB | Service backend chứa logic nghiệp vụ và tích hợp bên ngoài. |
| 78 | `backend/src/services/authService.js` | 6.0 KB | Service backend chứa logic nghiệp vụ và tích hợp bên ngoài. |
| 79 | `backend/src/services/billingService.js` | 28.8 KB | Service backend chứa logic nghiệp vụ và tích hợp bên ngoài. |
| 80 | `backend/src/services/categoryService.js` | 4.9 KB | Service backend chứa logic nghiệp vụ và tích hợp bên ngoài. |
| 81 | `backend/src/services/commonCrawlService.js` | 29.0 KB | Service backend chứa logic nghiệp vụ và tích hợp bên ngoài. |
| 82 | `backend/src/services/contentService.js` | 9.6 KB | Service backend chứa logic nghiệp vụ và tích hợp bên ngoài. |
| 83 | `backend/src/services/fineTuneService.js` | 79.8 KB | Service backend chứa logic nghiệp vụ và tích hợp bên ngoài. |
| 84 | `backend/src/services/huggingFaceFineTuneService.js` | 17.0 KB | Service backend chứa logic nghiệp vụ và tích hợp bên ngoài. |
| 85 | `backend/src/services/mailService.js` | 2.3 KB | Service backend chứa logic nghiệp vụ và tích hợp bên ngoài. |
| 86 | `backend/src/services/notificationService.js` | 3.5 KB | Service backend chứa logic nghiệp vụ và tích hợp bên ngoài. |
| 87 | `backend/src/services/paymentGatewayService.js` | 8.4 KB | Service backend chứa logic nghiệp vụ và tích hợp bên ngoài. |
| 88 | `backend/src/services/plagiarismService.js` | 24.5 KB | Service backend chứa logic nghiệp vụ và tích hợp bên ngoài. |
| 89 | `backend/src/services/projectService.js` | 4.8 KB | Service backend chứa logic nghiệp vụ và tích hợp bên ngoài. |
| 90 | `backend/src/services/templateService.js` | 4.0 KB | Service backend chứa logic nghiệp vụ và tích hợp bên ngoài. |
| 91 | `backend/src/services/vertexOpenModelFineTuneService.js` | 15.9 KB | Service backend chứa logic nghiệp vụ và tích hợp bên ngoài. |
| 92 | `backend/src/utils/asyncHandler.js` | 151 B | Tiện ích/script backend dùng chung hoặc hỗ trợ vận hành. |
| 93 | `backend/src/utils/authCookie.js` | 1.2 KB | Tiện ích/script backend dùng chung hoặc hỗ trợ vận hành. |
| 94 | `backend/src/utils/createError.js` | 299 B | Tiện ích/script backend dùng chung hoặc hỗ trợ vận hành. |
| 95 | `backend/src/utils/jwt.js` | 592 B | Tiện ích/script backend dùng chung hoặc hỗ trợ vận hành. |
| 96 | `backend/src/utils/otp.js` | 488 B | Tiện ích/script backend dùng chung hoặc hỗ trợ vận hành. |
| 97 | `backend/src/utils/seed.js` | 75.3 KB | Tiện ích/script backend dùng chung hoặc hỗ trợ vận hành. |
| 98 | `backend/src/validations/adminContentValidation.js` | 910 B | Schema validation Joi cho payload hoặc query API. |
| 99 | `backend/src/validations/adminUserValidation.js` | 1.1 KB | Schema validation Joi cho payload hoặc query API. |
| 100 | `backend/src/validations/auditLogValidation.js` | 373 B | Schema validation Joi cho payload hoặc query API. |
| 101 | `backend/src/validations/authValidation.js` | 2.2 KB | Schema validation Joi cho payload hoặc query API. |
| 102 | `backend/src/validations/billingValidation.js` | 1.9 KB | Schema validation Joi cho payload hoặc query API. |
| 103 | `backend/src/validations/categoryValidation.js` | 1.1 KB | Schema validation Joi cho payload hoặc query API. |
| 104 | `backend/src/validations/contentValidation.js` | 2.7 KB | Schema validation Joi cho payload hoặc query API. |
| 105 | `backend/src/validations/fineTuneValidation.js` | 4.3 KB | Schema validation Joi cho payload hoặc query API. |
| 106 | `backend/src/validations/notificationValidation.js` | 439 B | Schema validation Joi cho payload hoặc query API. |
| 107 | `backend/src/validations/plagiarismValidation.js` | 1.4 KB | Schema validation Joi cho payload hoặc query API. |
| 108 | `backend/src/validations/projectValidation.js` | 1.1 KB | Schema validation Joi cho payload hoặc query API. |
| 109 | `backend/src/validations/templateValidation.js` | 1.3 KB | Schema validation Joi cho payload hoặc query API. |
| 110 | `backend/yarn.lock` | 51.3 KB | File .lock của dự án. |
| 111 | `DANH_SACH_MODELS_CAN_THIET.md` | 25.9 KB | Tài liệu Markdown mô tả kế hoạch, hướng dẫn hoặc ghi chú dự án. |
| 112 | `docker-compose.yml` | 0 B | Cấu hình Docker Compose cho service cục bộ. |
| 113 | `DOCS.md` | 12.3 KB | Tài liệu Markdown mô tả kế hoạch, hướng dẫn hoặc ghi chú dự án. |
| 114 | `fine_tune_dataset_ecommerce_vi.csv` | 2.7 KB | Dataset hoặc bảng dữ liệu dạng CSV. |
| 115 | `fine_tuning_excel_pack_brand_voice_UTF8_FIXED.zip` | 56.4 KB | Dataset hoặc tài liệu liên quan fine-tuning. |
| 116 | `fine_tuning_excel_pack_brand_voice_UTF8_FIXED/01_train_examples_brand_voice_UTF8_FIXED.xlsx` | 27.9 KB | Dataset hoặc tài liệu liên quan fine-tuning. |
| 117 | `fine_tuning_excel_pack_brand_voice_UTF8_FIXED/02_validation_holdout_brand_voice_UTF8_FIXED.xlsx` | 14.9 KB | Dataset hoặc tài liệu liên quan fine-tuning. |
| 118 | `fine_tuning_excel_pack_brand_voice_UTF8_FIXED/03_test_prompts_after_finetune_UTF8_FIXED.xlsx` | 12.4 KB | Dataset hoặc tài liệu liên quan fine-tuning. |
| 119 | `fine_tuning_excel_pack_brand_voice_UTF8_FIXED/04_eval_scorecard_UTF8_FIXED.xlsx` | 9.4 KB | Dataset hoặc tài liệu liên quan fine-tuning. |
| 120 | `fine_tuning_excel_pack_brand_voice_UTF8_FIXED/manifest.json` | 575 B | Dataset hoặc tài liệu liên quan fine-tuning. |
| 121 | `fine_tuning_excel_pack_brand_voice_UTF8_FIXED/README_FINE_TUNING.md` | 428 B | Dataset hoặc tài liệu liên quan fine-tuning. |
| 122 | `fine_tuning_excel_pack_brand_voice/01_train_examples_brand_voice_UTF8_FIXED.xlsx` | 27.9 KB | Dataset hoặc tài liệu liên quan fine-tuning. |
| 123 | `fine_tuning_excel_pack_brand_voice/01_train_examples_brand_voice.xlsx` | 292.9 KB | Dataset hoặc tài liệu liên quan fine-tuning. |
| 124 | `fine_tuning_excel_pack_brand_voice/02_validation_holdout_brand_voice_UTF8_FIXED.xlsx` | 14.9 KB | Dataset hoặc tài liệu liên quan fine-tuning. |
| 125 | `fine_tuning_excel_pack_brand_voice/02_validation_holdout_brand_voice.xlsx` | 12.9 KB | Dataset hoặc tài liệu liên quan fine-tuning. |
| 126 | `fine_tuning_excel_pack_brand_voice/03_test_prompts_after_finetune_UTF8_FIXED.xlsx` | 12.4 KB | Dataset hoặc tài liệu liên quan fine-tuning. |
| 127 | `fine_tuning_excel_pack_brand_voice/03_test_prompts_after_finetune.xlsx` | 11.2 KB | Dataset hoặc tài liệu liên quan fine-tuning. |
| 128 | `fine_tuning_excel_pack_brand_voice/04_eval_scorecard_UTF8_FIXED.xlsx` | 9.4 KB | Dataset hoặc tài liệu liên quan fine-tuning. |
| 129 | `fine_tuning_excel_pack_brand_voice/04_eval_scorecard.xlsx` | 8.7 KB | Dataset hoặc tài liệu liên quan fine-tuning. |
| 130 | `fine_tuning_excel_pack_brand_voice/copy_paste_test_prompts.md` | 39.4 KB | Dataset hoặc tài liệu liên quan fine-tuning. |
| 131 | `fine_tuning_excel_pack_brand_voice/manifest.json` | 575 B | Dataset hoặc tài liệu liên quan fine-tuning. |
| 132 | `fine_tuning_excel_pack_brand_voice/README_FINE_TUNING.md` | 428 B | Dataset hoặc tài liệu liên quan fine-tuning. |
| 133 | `fine_tuning_excel_pack_brand_voice/train_examples_for_app_import.csv` | 234.1 KB | Dataset hoặc tài liệu liên quan fine-tuning. |
| 134 | `fine_tuning_ready_gemini_brand_voice.zip` | 15.7 KB | Dataset hoặc tài liệu liên quan fine-tuning. |
| 135 | `fine_tuning_ready_gemini_brand_voice/01_train_app_import.csv` | 112.8 KB | Dataset hoặc tài liệu liên quan fine-tuning. |
| 136 | `fine_tuning_ready_gemini_brand_voice/02_train_vertex_gemini.jsonl` | 137.2 KB | Dataset hoặc tài liệu liên quan fine-tuning. |
| 137 | `fine_tuning_ready_gemini_brand_voice/03_holdout_prompts_before_after.md` | 28.0 KB | Dataset hoặc tài liệu liên quan fine-tuning. |
| 138 | `fine_tuning_ready_gemini_brand_voice/04_eval_scorecard.csv` | 1.3 KB | Dataset hoặc tài liệu liên quan fine-tuning. |
| 139 | `fine_tuning_ready_gemini_brand_voice/manifest.json` | 408 B | Dataset hoặc tài liệu liên quan fine-tuning. |
| 140 | `fine_tuning_ready_gemini_brand_voice/README_GEMINI_FINE_TUNING.md` | 1.5 KB | Dataset hoặc tài liệu liên quan fine-tuning. |
| 141 | `fine_tuning_ready_vi_huggingface.zip` | 40.6 KB | Dataset hoặc tài liệu liên quan fine-tuning. |
| 142 | `fine_tuning_ready_vi_huggingface/01_train_examples_for_app_import_utf8.csv` | 244.8 KB | Dataset hoặc tài liệu liên quan fine-tuning. |
| 143 | `fine_tuning_ready_vi_huggingface/02_train_huggingface_chat_utf8.jsonl` | 289.4 KB | Dataset hoặc tài liệu liên quan fine-tuning. |
| 144 | `fine_tuning_ready_vi_huggingface/03_validation_holdout_chat_utf8.jsonl` | 62.0 KB | Dataset hoặc tài liệu liên quan fine-tuning. |
| 145 | `fine_tuning_ready_vi_huggingface/04_validation_holdout_for_review_utf8.csv` | 52.7 KB | Dataset hoặc tài liệu liên quan fine-tuning. |
| 146 | `fine_tuning_ready_vi_huggingface/05_test_prompts_after_finetune_utf8.csv` | 42.1 KB | Dataset hoặc tài liệu liên quan fine-tuning. |
| 147 | `fine_tuning_ready_vi_huggingface/06_kaggle_colab_unsloth_free_llama.ipynb` | 4.6 KB | Dataset hoặc tài liệu liên quan fine-tuning. |
| 148 | `fine_tuning_ready_vi_huggingface/07_colab_llamafactory_free_llama.ipynb` | 7.7 KB | Dataset hoặc tài liệu liên quan fine-tuning. |
| 149 | `fine_tuning_ready_vi_huggingface/copy_paste_test_prompts.md` | 40.2 KB | Dataset hoặc tài liệu liên quan fine-tuning. |
| 150 | `fine_tuning_ready_vi_huggingface/manifest.json` | 770 B | Dataset hoặc tài liệu liên quan fine-tuning. |
| 151 | `fine_tuning_ready_vi_huggingface/README_FINE_TUNING_UTF8.md` | 1.1 KB | Dataset hoặc tài liệu liên quan fine-tuning. |
| 152 | `Free-GPT4-WEB-API/.dockerignore` | 584 B | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 153 | `Free-GPT4-WEB-API/.github/FUNDING.yml` | 66 B | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 154 | `Free-GPT4-WEB-API/.github/workflows/ci.yml` | 2.6 KB | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 155 | `Free-GPT4-WEB-API/.github/workflows/docker-image.yml` | 575 B | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 156 | `Free-GPT4-WEB-API/.github/workflows/python-app.yml` | 250 B | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 157 | `Free-GPT4-WEB-API/.github/workflows/submodule-sync.yml` | 925 B | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 158 | `Free-GPT4-WEB-API/.gitignore` | 1.1 KB | Danh sách file/thư mục Git bỏ qua. |
| 159 | `Free-GPT4-WEB-API/docker-compose.yml` | 266 B | Cấu hình Docker Compose cho service cục bộ. |
| 160 | `Free-GPT4-WEB-API/Dockerfile` | 1.6 KB | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 161 | `Free-GPT4-WEB-API/favicon(vectorsmarket15).png` | 59.9 KB | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 162 | `Free-GPT4-WEB-API/img/docker-logo.webp` | 9.4 KB | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 163 | `Free-GPT4-WEB-API/img/FreeGPT4_Banner(Nicoladipa).png` | 289.1 KB | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 164 | `Free-GPT4-WEB-API/img/GPTMode_Logo.png` | 351.2 KB | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 165 | `Free-GPT4-WEB-API/img/login.png` | 806.0 KB | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 166 | `Free-GPT4-WEB-API/img/profile.png` | 932.6 KB | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 167 | `Free-GPT4-WEB-API/img/settings.png` | 925.9 KB | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 168 | `Free-GPT4-WEB-API/LICENSE` | 35.0 KB | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 169 | `Free-GPT4-WEB-API/Pipfile` | 247 B | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 170 | `Free-GPT4-WEB-API/Pipfile.lock` | 106.3 KB | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 171 | `Free-GPT4-WEB-API/pytest.ini` | 397 B | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 172 | `Free-GPT4-WEB-API/README.md` | 9.4 KB | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 173 | `Free-GPT4-WEB-API/requirements.txt` | 168 B | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 174 | `Free-GPT4-WEB-API/siri/GPT Mode.shortcut` | 21.9 KB | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 175 | `Free-GPT4-WEB-API/src/__init__.py` | 2 B | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 176 | `Free-GPT4-WEB-API/src/__pycache__/ai_service.cpython-314.pyc` | 19.3 KB | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 177 | `Free-GPT4-WEB-API/src/__pycache__/auth.cpython-314.pyc` | 7.4 KB | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 178 | `Free-GPT4-WEB-API/src/__pycache__/config.cpython-314.pyc` | 7.6 KB | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 179 | `Free-GPT4-WEB-API/src/__pycache__/database.cpython-314.pyc` | 27.0 KB | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 180 | `Free-GPT4-WEB-API/src/ai_service.py` | 17.4 KB | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 181 | `Free-GPT4-WEB-API/src/auth.py` | 5.5 KB | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 182 | `Free-GPT4-WEB-API/src/config.py` | 3.6 KB | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 183 | `Free-GPT4-WEB-API/src/data/cookies.json` | 18 B | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 184 | `Free-GPT4-WEB-API/src/data/proxies.json` | 190 B | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 185 | `Free-GPT4-WEB-API/src/data/settings.db` | 36.0 KB | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 186 | `Free-GPT4-WEB-API/src/database.py` | 20.2 KB | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 187 | `Free-GPT4-WEB-API/src/DBManager.py` | 391 B | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 188 | `Free-GPT4-WEB-API/src/FreeGPT4_Server.py` | 27.1 KB | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 189 | `Free-GPT4-WEB-API/src/requirements.txt` | 530 B | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 190 | `Free-GPT4-WEB-API/src/static/css/style.css` | 1.1 KB | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 191 | `Free-GPT4-WEB-API/src/static/img/add(PixelPerfect).png` | 3.5 KB | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 192 | `Free-GPT4-WEB-API/src/static/img/check(iconmasadepan).png` | 2.2 KB | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 193 | `Free-GPT4-WEB-API/src/static/img/close(Bharat).png` | 1.7 KB | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 194 | `Free-GPT4-WEB-API/src/static/img/copy(Gregor_Cresnar).png` | 4.0 KB | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 195 | `Free-GPT4-WEB-API/src/static/img/delete(Anggara).png` | 7.9 KB | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 196 | `Free-GPT4-WEB-API/src/static/img/edit(PixelPerfect).png` | 2.4 KB | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 197 | `Free-GPT4-WEB-API/src/static/img/favicon(Nicoladipa).png` | 75.6 KB | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 198 | `Free-GPT4-WEB-API/src/static/img/password(Freepik).png` | 2.6 KB | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 199 | `Free-GPT4-WEB-API/src/static/img/update(Becris).png` | 3.2 KB | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 200 | `Free-GPT4-WEB-API/src/static/img/upload(IlhamFitrotulHayat).png` | 2.3 KB | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 201 | `Free-GPT4-WEB-API/src/static/img/user(Freepik).png` | 1.6 KB | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 202 | `Free-GPT4-WEB-API/src/static/js/script.js` | 13.5 KB | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 203 | `Free-GPT4-WEB-API/src/templates/login.html` | 3.6 KB | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 204 | `Free-GPT4-WEB-API/src/templates/settings.html` | 29.0 KB | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 205 | `Free-GPT4-WEB-API/src/utils/__init__.py` | 45 B | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 206 | `Free-GPT4-WEB-API/src/utils/__pycache__/__init__.cpython-314.pyc` | 218 B | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 207 | `Free-GPT4-WEB-API/src/utils/__pycache__/exceptions.cpython-314.pyc` | 1.8 KB | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 208 | `Free-GPT4-WEB-API/src/utils/__pycache__/helpers.cpython-314.pyc` | 8.5 KB | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 209 | `Free-GPT4-WEB-API/src/utils/__pycache__/http_utils.cpython-314.pyc` | 9.0 KB | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 210 | `Free-GPT4-WEB-API/src/utils/__pycache__/logging.cpython-314.pyc` | 2.5 KB | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 211 | `Free-GPT4-WEB-API/src/utils/__pycache__/provider_monitor.cpython-314.pyc` | 11.4 KB | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 212 | `Free-GPT4-WEB-API/src/utils/__pycache__/validation.cpython-314.pyc` | 7.5 KB | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 213 | `Free-GPT4-WEB-API/src/utils/exceptions.py` | 752 B | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 214 | `Free-GPT4-WEB-API/src/utils/helpers.py` | 5.1 KB | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 215 | `Free-GPT4-WEB-API/src/utils/http_utils.py` | 5.5 KB | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 216 | `Free-GPT4-WEB-API/src/utils/logging.py` | 1.7 KB | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 217 | `Free-GPT4-WEB-API/src/utils/provider_monitor.py` | 7.3 KB | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 218 | `Free-GPT4-WEB-API/src/utils/validation.py` | 4.8 KB | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 219 | `Free-GPT4-WEB-API/tests/__init__.py` | 0 B | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 220 | `Free-GPT4-WEB-API/tests/__pycache__/__init__.cpython-310.pyc` | 164 B | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 221 | `Free-GPT4-WEB-API/tests/__pycache__/__init__.cpython-312.pyc` | 168 B | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 222 | `Free-GPT4-WEB-API/tests/__pycache__/test_launch.cpython-310-pytest-7.4.0.pyc` | 13.5 KB | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 223 | `Free-GPT4-WEB-API/tests/__pycache__/test_launch.cpython-312-pytest-8.4.1.pyc` | 29.1 KB | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 224 | `Free-GPT4-WEB-API/tests/test_launch.py` | 6.3 KB | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 225 | `Free-GPT4-WEB-API/Thumbs.db` | 18.0 KB | File thuộc dự án phụ Free-GPT4-WEB-API. |
| 226 | `frontend/.env` | 78 B | File cấu hình môi trường cục bộ; không đọc hoặc ghi nội dung bí mật vào thống kê. |
| 227 | `frontend/.gitignore` | 40 B | Danh sách file/thư mục Git bỏ qua. |
| 228 | `frontend/.next-dev-3001.err.log` | 0 B | Log chạy frontend/dev server. |
| 229 | `frontend/.next-dev-3001.out.log` | 0 B | Log chạy frontend/dev server. |
| 230 | `frontend/ATTRIBUTIONS.md` | 289 B | Tài liệu Markdown mô tả kế hoạch, hướng dẫn hoặc ghi chú dự án. |
| 231 | `frontend/default_shadcn_theme.css` | 4.2 KB | Stylesheet CSS. |
| 232 | `frontend/dev-3000.err.log` | 7.1 KB | Log chạy frontend/dev server. |
| 233 | `frontend/dev-3000.log` | 2.3 KB | Log chạy frontend/dev server. |
| 234 | `frontend/dev-3001.log` | 978 B | Log chạy frontend/dev server. |
| 235 | `frontend/dev-3002.log` | 22.9 KB | Log chạy frontend/dev server. |
| 236 | `frontend/dev-module5.err.log` | 57.2 KB | Log chạy frontend/dev server. |
| 237 | `frontend/dev-module5.out.log` | 4.2 KB | Log chạy frontend/dev server. |
| 238 | `frontend/next-dev-3001-module8.err.log` | 6.8 KB | Log chạy frontend/dev server. |
| 239 | `frontend/next-dev-3001-module8.out.log` | 3.9 KB | Log chạy frontend/dev server. |
| 240 | `frontend/next-dev.err.log` | 1.3 KB | Log chạy frontend/dev server. |
| 241 | `frontend/next-dev.log` | 816 B | Log chạy frontend/dev server. |
| 242 | `frontend/next-env.d.ts` | 228 B | Module TypeScript của ứng dụng. |
| 243 | `frontend/next.config.mjs` | 1008 B | Cấu hình Next.js. |
| 244 | `frontend/package.json` | 2.5 KB | Manifest npm khai báo script và dependency. |
| 245 | `frontend/pnpm-workspace.yaml` | 17 B | File .yaml của dự án. |
| 246 | `frontend/postcss.config.mjs` | 70 B | Cấu hình PostCSS/Tailwind pipeline. |
| 247 | `frontend/public/images/logo-light.svg` | 5.1 KB | Asset tĩnh được public bởi frontend. |
| 248 | `frontend/public/images/logo.svg` | 5.0 KB | Asset tĩnh được public bởi frontend. |
| 249 | `frontend/public/images/README.md` | 167 B | Asset tĩnh được public bởi frontend. |
| 250 | `frontend/README.md` | 323 B | Tài liệu Markdown mô tả kế hoạch, hướng dẫn hoặc ghi chú dự án. |
| 251 | `frontend/src/app/_shared/route-guards.tsx` | 2.1 KB | Trang hoặc component React/Next.js trong App Router. |
| 252 | `frontend/src/app/_unrouted/admin/Analytics.tsx` | 3.9 KB | Trang hoặc component React/Next.js trong App Router. |
| 253 | `frontend/src/app/_unrouted/admin/ApiManagement.tsx` | 15.5 KB | Trang hoặc component React/Next.js trong App Router. |
| 254 | `frontend/src/app/_unrouted/admin/FineTuning.tsx` | 16.0 KB | Trang hoặc component React/Next.js trong App Router. |
| 255 | `frontend/src/app/_unrouted/customer/ApiKeys.tsx` | 13.5 KB | Trang hoặc component React/Next.js trong App Router. |
| 256 | `frontend/src/app/_unrouted/customer/History.tsx` | 10.9 KB | Trang hoặc component React/Next.js trong App Router. |
| 257 | `frontend/src/app/_unrouted/customer/Subscription.tsx` | 1.1 KB | Trang hoặc component React/Next.js trong App Router. |
| 258 | `frontend/src/app/about/AboutPage.tsx` | 17.9 KB | Trang hoặc component React/Next.js trong App Router. |
| 259 | `frontend/src/app/about/page.tsx` | 117 B | Trang hoặc component React/Next.js trong App Router. |
| 260 | `frontend/src/app/admin/audit-logs/AuditLogs.tsx` | 6.9 KB | Trang hoặc component React/Next.js trong App Router. |
| 261 | `frontend/src/app/admin/audit-logs/page.tsx` | 269 B | Trang hoặc component React/Next.js trong App Router. |
| 262 | `frontend/src/app/admin/categories/Categories.tsx` | 22.7 KB | Trang hoặc component React/Next.js trong App Router. |
| 263 | `frontend/src/app/admin/categories/page.tsx` | 273 B | Trang hoặc component React/Next.js trong App Router. |
| 264 | `frontend/src/app/admin/contents/Contents.tsx` | 18.8 KB | Trang hoặc component React/Next.js trong App Router. |
| 265 | `frontend/src/app/admin/contents/page.tsx` | 263 B | Trang hoặc component React/Next.js trong App Router. |
| 266 | `frontend/src/app/admin/Dashboard.tsx` | 6.7 KB | Trang hoặc component React/Next.js trong App Router. |
| 267 | `frontend/src/app/admin/forgot-password/AdminForgotPasswordPage.tsx` | 14.1 KB | Trang hoặc component React/Next.js trong App Router. |
| 268 | `frontend/src/app/admin/forgot-password/page.tsx` | 173 B | Trang hoặc component React/Next.js trong App Router. |
| 269 | `frontend/src/app/admin/login/AdminLoginPage.tsx` | 11.9 KB | Trang hoặc component React/Next.js trong App Router. |
| 270 | `frontend/src/app/admin/login/page.tsx` | 137 B | Trang hoặc component React/Next.js trong App Router. |
| 271 | `frontend/src/app/admin/models/ModelManagement.tsx` | 20.8 KB | Trang hoặc component React/Next.js trong App Router. |
| 272 | `frontend/src/app/admin/models/page.tsx` | 280 B | Trang hoặc component React/Next.js trong App Router. |
| 273 | `frontend/src/app/admin/page.tsx` | 249 B | Trang hoặc component React/Next.js trong App Router. |
| 274 | `frontend/src/app/admin/payments/page.tsx` | 263 B | Trang hoặc component React/Next.js trong App Router. |
| 275 | `frontend/src/app/admin/payments/Payments.tsx` | 6.5 KB | Trang hoặc component React/Next.js trong App Router. |
| 276 | `frontend/src/app/admin/permissions/page.tsx` | 278 B | Trang hoặc component React/Next.js trong App Router. |
| 277 | `frontend/src/app/admin/permissions/Permissions.tsx` | 20.8 KB | Trang hoặc component React/Next.js trong App Router. |
| 278 | `frontend/src/app/admin/plans/page.tsx` | 248 B | Trang hoặc component React/Next.js trong App Router. |
| 279 | `frontend/src/app/admin/plans/Plans.tsx` | 19.4 KB | Trang hoặc component React/Next.js trong App Router. |
| 280 | `frontend/src/app/admin/settings/page.tsx` | 263 B | Trang hoặc component React/Next.js trong App Router. |
| 281 | `frontend/src/app/admin/settings/Settings.tsx` | 19.7 KB | Trang hoặc component React/Next.js trong App Router. |
| 282 | `frontend/src/app/admin/templates/page.tsx` | 268 B | Trang hoặc component React/Next.js trong App Router. |
| 283 | `frontend/src/app/admin/templates/Templates.tsx` | 19.7 KB | Trang hoặc component React/Next.js trong App Router. |
| 284 | `frontend/src/app/admin/users/page.tsx` | 248 B | Trang hoặc component React/Next.js trong App Router. |
| 285 | `frontend/src/app/admin/users/Users.tsx` | 22.5 KB | Trang hoặc component React/Next.js trong App Router. |
| 286 | `frontend/src/app/billing/Billing.tsx` | 19.6 KB | Trang hoặc component React/Next.js trong App Router. |
| 287 | `frontend/src/app/billing/page.tsx` | 269 B | Trang hoặc component React/Next.js trong App Router. |
| 288 | `frontend/src/app/blog/[slug]/BlogDetailPage.tsx` | 7.3 KB | Trang hoặc component React/Next.js trong App Router. |
| 289 | `frontend/src/app/blog/[slug]/page.tsx` | 137 B | Trang hoặc component React/Next.js trong App Router. |
| 290 | `frontend/src/app/blog/BlogPage.tsx` | 11.9 KB | Trang hoặc component React/Next.js trong App Router. |
| 291 | `frontend/src/app/blog/page.tsx` | 113 B | Trang hoặc component React/Next.js trong App Router. |
| 292 | `frontend/src/app/components/admin/AdminAccessDenied.tsx` | 2.8 KB | Trang hoặc component React/Next.js trong App Router. |
| 293 | `frontend/src/app/components/admin/AdminFilterBar.tsx` | 2.5 KB | Trang hoặc component React/Next.js trong App Router. |
| 294 | `frontend/src/app/components/admin/AdminTable.tsx` | 713 B | Trang hoặc component React/Next.js trong App Router. |
| 295 | `frontend/src/app/components/admin/ConfirmDialog.tsx` | 2.9 KB | Trang hoặc component React/Next.js trong App Router. |
| 296 | `frontend/src/app/components/admin/StatTile.tsx` | 2.4 KB | Trang hoặc component React/Next.js trong App Router. |
| 297 | `frontend/src/app/components/admin/TrashBin.tsx` | 5.9 KB | Trang hoặc component React/Next.js trong App Router. |
| 298 | `frontend/src/app/components/BrandLogo.tsx` | 1.2 KB | Trang hoặc component React/Next.js trong App Router. |
| 299 | `frontend/src/app/components/charts/AreaChart.tsx` | 327 B | Trang hoặc component React/Next.js trong App Router. |
| 300 | `frontend/src/app/components/charts/BarChart.tsx` | 1.4 KB | Trang hoặc component React/Next.js trong App Router. |
| 301 | `frontend/src/app/components/charts/chartSetup.ts` | 509 B | Module TypeScript hỗ trợ route hoặc logic frontend. |
| 302 | `frontend/src/app/components/charts/index.ts` | 407 B | Module TypeScript hỗ trợ route hoặc logic frontend. |
| 303 | `frontend/src/app/components/charts/LineChart.tsx` | 1.9 KB | Trang hoặc component React/Next.js trong App Router. |
| 304 | `frontend/src/app/components/charts/PieChart.tsx` | 1.4 KB | Trang hoặc component React/Next.js trong App Router. |
| 305 | `frontend/src/app/components/common/DataPagination.tsx` | 4.4 KB | Trang hoặc component React/Next.js trong App Router. |
| 306 | `frontend/src/app/components/common/Markdown.tsx` | 884 B | Trang hoặc component React/Next.js trong App Router. |
| 307 | `frontend/src/app/components/CopyExamples.tsx` | 35.2 KB | Trang hoặc component React/Next.js trong App Router. |
| 308 | `frontend/src/app/components/CopywritingGenerator.tsx` | 16.1 KB | Trang hoặc component React/Next.js trong App Router. |
| 309 | `frontend/src/app/components/CustomerFooter.tsx` | 5.8 KB | Trang hoặc component React/Next.js trong App Router. |
| 310 | `frontend/src/app/components/CustomerHeader.tsx` | 13.7 KB | Trang hoặc component React/Next.js trong App Router. |
| 311 | `frontend/src/app/components/figma/ImageWithFallback.tsx` | 1.1 KB | Trang hoặc component React/Next.js trong App Router. |
| 312 | `frontend/src/app/components/generator/AdvancedSettings.tsx` | 4.1 KB | Trang hoặc component React/Next.js trong App Router. |
| 313 | `frontend/src/app/components/generator/CopyTypePicker.tsx` | 1.3 KB | Trang hoặc component React/Next.js trong App Router. |
| 314 | `frontend/src/app/components/generator/GeneratorResults.tsx` | 10.0 KB | Trang hoặc component React/Next.js trong App Router. |
| 315 | `frontend/src/app/components/generator/IndustryPicker.tsx` | 1.2 KB | Trang hoặc component React/Next.js trong App Router. |
| 316 | `frontend/src/app/components/generator/ModelPicker.tsx` | 1.8 KB | Trang hoặc component React/Next.js trong App Router. |
| 317 | `frontend/src/app/components/generator/ProductInfoForm.tsx` | 1.9 KB | Trang hoặc component React/Next.js trong App Router. |
| 318 | `frontend/src/app/components/generator/TonePicker.tsx` | 1.2 KB | Trang hoặc component React/Next.js trong App Router. |
| 319 | `frontend/src/app/components/IndustrySelector.tsx` | 2.3 KB | Trang hoặc component React/Next.js trong App Router. |
| 320 | `frontend/src/app/components/Layout.tsx` | 7.8 KB | Trang hoặc component React/Next.js trong App Router. |
| 321 | `frontend/src/app/components/public/AIDemoSection.tsx` | 22.4 KB | Trang hoặc component React/Next.js trong App Router. |
| 322 | `frontend/src/app/components/public/HeroGeneratorDemo.tsx` | 23.7 KB | Trang hoặc component React/Next.js trong App Router. |
| 323 | `frontend/src/app/components/public/PublicFooter.tsx` | 7.3 KB | Trang hoặc component React/Next.js trong App Router. |
| 324 | `frontend/src/app/components/public/PublicNavbar.tsx` | 8.1 KB | Trang hoặc component React/Next.js trong App Router. |
| 325 | `frontend/src/app/components/TipsSection.tsx` | 6.3 KB | Trang hoặc component React/Next.js trong App Router. |
| 326 | `frontend/src/app/components/ui/accordion.tsx` | 2.0 KB | Trang hoặc component React/Next.js trong App Router. |
| 327 | `frontend/src/app/components/ui/alert-dialog.tsx` | 3.8 KB | Trang hoặc component React/Next.js trong App Router. |
| 328 | `frontend/src/app/components/ui/alert.tsx` | 1.6 KB | Trang hoặc component React/Next.js trong App Router. |
| 329 | `frontend/src/app/components/ui/aspect-ratio.tsx` | 284 B | Trang hoặc component React/Next.js trong App Router. |
| 330 | `frontend/src/app/components/ui/avatar.tsx` | 1.4 KB | Trang hoặc component React/Next.js trong App Router. |
| 331 | `frontend/src/app/components/ui/badge.tsx` | 2.1 KB | Trang hoặc component React/Next.js trong App Router. |
| 332 | `frontend/src/app/components/ui/breadcrumb.tsx` | 2.3 KB | Trang hoặc component React/Next.js trong App Router. |
| 333 | `frontend/src/app/components/ui/button.tsx` | 2.2 KB | Trang hoặc component React/Next.js trong App Router. |
| 334 | `frontend/src/app/components/ui/calendar.tsx` | 2.8 KB | Trang hoặc component React/Next.js trong App Router. |
| 335 | `frontend/src/app/components/ui/card.tsx` | 2.0 KB | Trang hoặc component React/Next.js trong App Router. |
| 336 | `frontend/src/app/components/ui/carousel.tsx` | 5.5 KB | Trang hoặc component React/Next.js trong App Router. |
| 337 | `frontend/src/app/components/ui/checkbox.tsx` | 1.2 KB | Trang hoặc component React/Next.js trong App Router. |
| 338 | `frontend/src/app/components/ui/collapsible.tsx` | 806 B | Trang hoặc component React/Next.js trong App Router. |
| 339 | `frontend/src/app/components/ui/command.tsx` | 4.6 KB | Trang hoặc component React/Next.js trong App Router. |
| 340 | `frontend/src/app/components/ui/context-menu.tsx` | 8.1 KB | Trang hoặc component React/Next.js trong App Router. |
| 341 | `frontend/src/app/components/ui/dialog.tsx` | 4.5 KB | Trang hoặc component React/Next.js trong App Router. |
| 342 | `frontend/src/app/components/ui/drawer.tsx` | 4.0 KB | Trang hoặc component React/Next.js trong App Router. |
| 343 | `frontend/src/app/components/ui/dropdown-menu.tsx` | 8.1 KB | Trang hoặc component React/Next.js trong App Router. |
| 344 | `frontend/src/app/components/ui/form.tsx` | 3.7 KB | Trang hoặc component React/Next.js trong App Router. |
| 345 | `frontend/src/app/components/ui/hover-card.tsx` | 1.5 KB | Trang hoặc component React/Next.js trong App Router. |
| 346 | `frontend/src/app/components/ui/input-otp.tsx` | 2.2 KB | Trang hoặc component React/Next.js trong App Router. |
| 347 | `frontend/src/app/components/ui/input.tsx` | 1.1 KB | Trang hoặc component React/Next.js trong App Router. |
| 348 | `frontend/src/app/components/ui/label.tsx` | 710 B | Trang hoặc component React/Next.js trong App Router. |
| 349 | `frontend/src/app/components/ui/menubar.tsx` | 8.2 KB | Trang hoặc component React/Next.js trong App Router. |
| 350 | `frontend/src/app/components/ui/navigation-menu.tsx` | 6.5 KB | Trang hoặc component React/Next.js trong App Router. |
| 351 | `frontend/src/app/components/ui/pagination.tsx` | 2.6 KB | Trang hoặc component React/Next.js trong App Router. |
| 352 | `frontend/src/app/components/ui/popover.tsx` | 1.6 KB | Trang hoặc component React/Next.js trong App Router. |
| 353 | `frontend/src/app/components/ui/progress.tsx` | 743 B | Trang hoặc component React/Next.js trong App Router. |
| 354 | `frontend/src/app/components/ui/radio-group.tsx` | 1.4 KB | Trang hoặc component React/Next.js trong App Router. |
| 355 | `frontend/src/app/components/ui/resizable.tsx` | 2.0 KB | Trang hoặc component React/Next.js trong App Router. |
| 356 | `frontend/src/app/components/ui/scroll-area.tsx` | 1.6 KB | Trang hoặc component React/Next.js trong App Router. |
| 357 | `frontend/src/app/components/ui/select.tsx` | 6.4 KB | Trang hoặc component React/Next.js trong App Router. |
| 358 | `frontend/src/app/components/ui/separator.tsx` | 707 B | Trang hoặc component React/Next.js trong App Router. |
| 359 | `frontend/src/app/components/ui/sheet.tsx` | 4.7 KB | Trang hoặc component React/Next.js trong App Router. |
| 360 | `frontend/src/app/components/ui/sidebar.tsx` | 21.2 KB | Trang hoặc component React/Next.js trong App Router. |
| 361 | `frontend/src/app/components/ui/skeleton.tsx` | 275 B | Trang hoặc component React/Next.js trong App Router. |
| 362 | `frontend/src/app/components/ui/slider.tsx` | 2.0 KB | Trang hoặc component React/Next.js trong App Router. |
| 363 | `frontend/src/app/components/ui/switch.tsx` | 1.2 KB | Trang hoặc component React/Next.js trong App Router. |
| 364 | `frontend/src/app/components/ui/table.tsx` | 2.4 KB | Trang hoặc component React/Next.js trong App Router. |
| 365 | `frontend/src/app/components/ui/tabs.tsx` | 1.9 KB | Trang hoặc component React/Next.js trong App Router. |
| 366 | `frontend/src/app/components/ui/textarea.tsx` | 838 B | Trang hoặc component React/Next.js trong App Router. |
| 367 | `frontend/src/app/components/ui/toggle-group.tsx` | 1.9 KB | Trang hoặc component React/Next.js trong App Router. |
| 368 | `frontend/src/app/components/ui/toggle.tsx` | 1.5 KB | Trang hoặc component React/Next.js trong App Router. |
| 369 | `frontend/src/app/components/ui/tooltip.tsx` | 1.9 KB | Trang hoặc component React/Next.js trong App Router. |
| 370 | `frontend/src/app/components/ui/use-mobile.ts` | 585 B | Module TypeScript hỗ trợ route hoặc logic frontend. |
| 371 | `frontend/src/app/components/ui/utils.ts` | 169 B | Module TypeScript hỗ trợ route hoặc logic frontend. |
| 372 | `frontend/src/app/contact/ContactPage.tsx` | 14.0 KB | Trang hoặc component React/Next.js trong App Router. |
| 373 | `frontend/src/app/contact/page.tsx` | 125 B | Trang hoặc component React/Next.js trong App Router. |
| 374 | `frontend/src/app/contents/[id]/ContentDetail.tsx` | 8.9 KB | Trang hoặc component React/Next.js trong App Router. |
| 375 | `frontend/src/app/contents/[id]/page.tsx` | 293 B | Trang hoặc component React/Next.js trong App Router. |
| 376 | `frontend/src/app/contents/Contents.tsx` | 9.7 KB | Trang hoặc component React/Next.js trong App Router. |
| 377 | `frontend/src/app/contents/page.tsx` | 273 B | Trang hoặc component React/Next.js trong App Router. |
| 378 | `frontend/src/app/contexts/AuthContext.tsx` | 837 B | Trang hoặc component React/Next.js trong App Router. |
| 379 | `frontend/src/app/dashboard/Dashboard.tsx` | 9.6 KB | Trang hoặc component React/Next.js trong App Router. |
| 380 | `frontend/src/app/dashboard/page.tsx` | 277 B | Trang hoặc component React/Next.js trong App Router. |
| 381 | `frontend/src/app/fine-tune/FineTuningStudio.tsx` | 37.0 KB | Trang hoặc component React/Next.js trong App Router. |
| 382 | `frontend/src/app/fine-tune/page.tsx` | 297 B | Trang hoặc component React/Next.js trong App Router. |
| 383 | `frontend/src/app/forgot-password/ForgotPasswordPage.tsx` | 12.3 KB | Trang hoặc component React/Next.js trong App Router. |
| 384 | `frontend/src/app/forgot-password/page.tsx` | 153 B | Trang hoặc component React/Next.js trong App Router. |
| 385 | `frontend/src/app/generate/Generator.tsx` | 30.6 KB | Trang hoặc component React/Next.js trong App Router. |
| 386 | `frontend/src/app/generate/page.tsx` | 276 B | Trang hoặc component React/Next.js trong App Router. |
| 387 | `frontend/src/app/LandingPage.tsx` | 17.5 KB | Trang hoặc component React/Next.js trong App Router. |
| 388 | `frontend/src/app/layout.tsx` | 523 B | Trang hoặc component React/Next.js trong App Router. |
| 389 | `frontend/src/app/login/LoginPage.tsx` | 12.3 KB | Trang hoặc component React/Next.js trong App Router. |
| 390 | `frontend/src/app/login/page.tsx` | 117 B | Trang hoặc component React/Next.js trong App Router. |
| 391 | `frontend/src/app/notifications/Notifications.tsx` | 8.7 KB | Trang hoặc component React/Next.js trong App Router. |
| 392 | `frontend/src/app/notifications/page.tsx` | 293 B | Trang hoặc component React/Next.js trong App Router. |
| 393 | `frontend/src/app/page.tsx` | 122 B | Trang hoặc component React/Next.js trong App Router. |
| 394 | `frontend/src/app/plagiarism-check/page.tsx` | 301 B | Trang hoặc component React/Next.js trong App Router. |
| 395 | `frontend/src/app/plagiarism-check/PlagiarismCheck.tsx` | 28.2 KB | Trang hoặc component React/Next.js trong App Router. |
| 396 | `frontend/src/app/pricing/page.tsx` | 125 B | Trang hoặc component React/Next.js trong App Router. |
| 397 | `frontend/src/app/pricing/PricingPage.tsx` | 21.0 KB | Trang hoặc component React/Next.js trong App Router. |
| 398 | `frontend/src/app/profile/page.tsx` | 269 B | Trang hoặc component React/Next.js trong App Router. |
| 399 | `frontend/src/app/profile/Profile.tsx` | 13.4 KB | Trang hoặc component React/Next.js trong App Router. |
| 400 | `frontend/src/app/projects/[id]/page.tsx` | 293 B | Trang hoặc component React/Next.js trong App Router. |
| 401 | `frontend/src/app/projects/[id]/ProjectDetail.tsx` | 12.3 KB | Trang hoặc component React/Next.js trong App Router. |
| 402 | `frontend/src/app/projects/page.tsx` | 273 B | Trang hoặc component React/Next.js trong App Router. |
| 403 | `frontend/src/app/projects/Projects.tsx` | 7.3 KB | Trang hoặc component React/Next.js trong App Router. |
| 404 | `frontend/src/app/providers.tsx` | 530 B | Trang hoặc component React/Next.js trong App Router. |
| 405 | `frontend/src/app/register/page.tsx` | 129 B | Trang hoặc component React/Next.js trong App Router. |
| 406 | `frontend/src/app/register/RegisterPage.tsx` | 14.4 KB | Trang hoặc component React/Next.js trong App Router. |
| 407 | `frontend/src/app/reset-password/page.tsx` | 149 B | Trang hoặc component React/Next.js trong App Router. |
| 408 | `frontend/src/app/reset-password/ResetPasswordPage.tsx` | 5.7 KB | Trang hoặc component React/Next.js trong App Router. |
| 409 | `frontend/src/app/templates/page.tsx` | 277 B | Trang hoặc component React/Next.js trong App Router. |
| 410 | `frontend/src/app/templates/Templates.tsx` | 6.1 KB | Trang hoặc component React/Next.js trong App Router. |
| 411 | `frontend/src/hooks/queries/useApiKeys.ts` | 552 B | React hook hoặc React Query hook dùng trong frontend. |
| 412 | `frontend/src/hooks/queries/useAuditLogs.ts` | 371 B | React hook hoặc React Query hook dùng trong frontend. |
| 413 | `frontend/src/hooks/queries/useContents.ts` | 2.6 KB | React hook hoặc React Query hook dùng trong frontend. |
| 414 | `frontend/src/hooks/queries/useFineTuning.ts` | 6.1 KB | React hook hoặc React Query hook dùng trong frontend. |
| 415 | `frontend/src/hooks/queries/useHistory.ts` | 361 B | React hook hoặc React Query hook dùng trong frontend. |
| 416 | `frontend/src/hooks/queries/useNotifications.ts` | 1.3 KB | React hook hoặc React Query hook dùng trong frontend. |
| 417 | `frontend/src/hooks/queries/usePayments.ts` | 567 B | React hook hoặc React Query hook dùng trong frontend. |
| 418 | `frontend/src/hooks/queries/usePlagiarism.ts` | 1.3 KB | React hook hoặc React Query hook dùng trong frontend. |
| 419 | `frontend/src/hooks/queries/useProjects.ts` | 1.6 KB | React hook hoặc React Query hook dùng trong frontend. |
| 420 | `frontend/src/hooks/queries/useTemplates.ts` | 1.2 KB | React hook hoặc React Query hook dùng trong frontend. |
| 421 | `frontend/src/hooks/usePagination.ts` | 1.0 KB | React hook hoặc React Query hook dùng trong frontend. |
| 422 | `frontend/src/imports/image.png` | 22.1 KB | Ảnh PNG dùng làm asset. |
| 423 | `frontend/src/lib/auth.ts` | 942 B | Tiện ích/thư viện frontend dùng chung. |
| 424 | `frontend/src/lib/authValidation.ts` | 1.9 KB | Tiện ích/thư viện frontend dùng chung. |
| 425 | `frontend/src/lib/axios.ts` | 741 B | Tiện ích/thư viện frontend dùng chung. |
| 426 | `frontend/src/lib/next-router-compat.tsx` | 1.4 KB | Tiện ích/thư viện frontend dùng chung. |
| 427 | `frontend/src/lib/permissions.ts` | 8.0 KB | Tiện ích/thư viện frontend dùng chung. |
| 428 | `frontend/src/lib/projectColors.ts` | 976 B | Tiện ích/thư viện frontend dùng chung. |
| 429 | `frontend/src/lib/queryClient.ts` | 292 B | Tiện ích/thư viện frontend dùng chung. |
| 430 | `frontend/src/lib/richText.ts` | 6.0 KB | Tiện ích/thư viện frontend dùng chung. |
| 431 | `frontend/src/mocks/apiKeys.ts` | 4.6 KB | Dữ liệu mock phục vụ UI/demo frontend. |
| 432 | `frontend/src/mocks/auditLogs.ts` | 3.2 KB | Dữ liệu mock phục vụ UI/demo frontend. |
| 433 | `frontend/src/mocks/blog.ts` | 13.7 KB | Dữ liệu mock phục vụ UI/demo frontend. |
| 434 | `frontend/src/mocks/contents.ts` | 3.0 KB | Dữ liệu mock phục vụ UI/demo frontend. |
| 435 | `frontend/src/mocks/customerHeader.ts` | 2.0 KB | Dữ liệu mock phục vụ UI/demo frontend. |
| 436 | `frontend/src/mocks/fineTuning.ts` | 2.1 KB | Dữ liệu mock phục vụ UI/demo frontend. |
| 437 | `frontend/src/mocks/generator.ts` | 16.1 KB | Dữ liệu mock phục vụ UI/demo frontend. |
| 438 | `frontend/src/mocks/history.ts` | 4.8 KB | Dữ liệu mock phục vụ UI/demo frontend. |
| 439 | `frontend/src/mocks/notifications.ts` | 1.8 KB | Dữ liệu mock phục vụ UI/demo frontend. |
| 440 | `frontend/src/mocks/payments.ts` | 1.6 KB | Dữ liệu mock phục vụ UI/demo frontend. |
| 441 | `frontend/src/mocks/plagiarism.ts` | 373 B | Dữ liệu mock phục vụ UI/demo frontend. |
| 442 | `frontend/src/mocks/projects.ts` | 1.3 KB | Dữ liệu mock phục vụ UI/demo frontend. |
| 443 | `frontend/src/services/adminContentService.ts` | 4.1 KB | Client service gọi API hoặc chuẩn hóa dữ liệu frontend. |
| 444 | `frontend/src/services/adminDashboardService.ts` | 1.9 KB | Client service gọi API hoặc chuẩn hóa dữ liệu frontend. |
| 445 | `frontend/src/services/adminUserService.ts` | 2.1 KB | Client service gọi API hoặc chuẩn hóa dữ liệu frontend. |
| 446 | `frontend/src/services/apiKeyService.ts` | 303 B | Client service gọi API hoặc chuẩn hóa dữ liệu frontend. |
| 447 | `frontend/src/services/auditLogService.ts` | 1.8 KB | Client service gọi API hoặc chuẩn hóa dữ liệu frontend. |
| 448 | `frontend/src/services/categoryService.ts` | 3.3 KB | Client service gọi API hoặc chuẩn hóa dữ liệu frontend. |
| 449 | `frontend/src/services/contentService.ts` | 5.5 KB | Client service gọi API hoặc chuẩn hóa dữ liệu frontend. |
| 450 | `frontend/src/services/fineTuningService.ts` | 17.6 KB | Client service gọi API hoặc chuẩn hóa dữ liệu frontend. |
| 451 | `frontend/src/services/historyService.ts` | 223 B | Client service gọi API hoặc chuẩn hóa dữ liệu frontend. |
| 452 | `frontend/src/services/notificationService.ts` | 3.7 KB | Client service gọi API hoặc chuẩn hóa dữ liệu frontend. |
| 453 | `frontend/src/services/paymentService.ts` | 918 B | Client service gọi API hoặc chuẩn hóa dữ liệu frontend. |
| 454 | `frontend/src/services/plagiarismService.ts` | 12.3 KB | Client service gọi API hoặc chuẩn hóa dữ liệu frontend. |
| 455 | `frontend/src/services/projectService.ts` | 3.0 KB | Client service gọi API hoặc chuẩn hóa dữ liệu frontend. |
| 456 | `frontend/src/services/templateService.ts` | 2.9 KB | Client service gọi API hoặc chuẩn hóa dữ liệu frontend. |
| 457 | `frontend/src/stores/authStore.ts` | 3.8 KB | Module TypeScript của ứng dụng. |
| 458 | `frontend/src/styles/fonts.css` | 231 B | Stylesheet CSS. |
| 459 | `frontend/src/styles/globals.css` | 0 B | Stylesheet CSS. |
| 460 | `frontend/src/styles/index.css` | 1.4 KB | Stylesheet CSS. |
| 461 | `frontend/src/styles/tailwind.css` | 98 B | Stylesheet CSS. |
| 462 | `frontend/src/styles/theme.css` | 5.7 KB | Stylesheet CSS. |
| 463 | `frontend/src/types/auth.ts` | 642 B | Module TypeScript của ứng dụng. |
| 464 | `frontend/tsconfig.json` | 661 B | Cấu hình TypeScript. |
| 465 | `frontend/tsconfig.tsbuildinfo` | 210.3 KB | File .tsbuildinfo của dự án. |
| 466 | `frontend/USE_CASE_ADMIN.puml` | 3.1 KB | File .puml của dự án. |
| 467 | `frontend/USE_CASE_CUSTOMER.puml` | 2.8 KB | File .puml của dự án. |
| 468 | `frontend/USE_CASE_OVERVIEW.puml` | 3.1 KB | File .puml của dự án. |
| 469 | `frontend/USE_CASES.md` | 9.9 KB | Tài liệu Markdown mô tả kế hoạch, hướng dẫn hoặc ghi chú dự án. |
| 470 | `frontend/USE_CASES.puml` | 13.0 KB | File .puml của dự án. |
| 471 | `frontend/yarn.lock` | 124.8 KB | File .lock của dự án. |
| 472 | `KẾ HOẠCH ĐỒ ÁN NT114.docx` | 31.3 KB | Tài liệu Word phục vụ báo cáo/kế hoạch. |
| 473 | `KE_HOACH_1_TUAN_MVP.md` | 45.0 KB | Tài liệu Markdown mô tả kế hoạch, hướng dẫn hoặc ghi chú dự án. |
| 474 | `KE_HOACH_FINE_TUNING.md` | 20.8 KB | Tài liệu Markdown mô tả kế hoạch, hướng dẫn hoặc ghi chú dự án. |
| 475 | `KE_HOACH_THUC_THI.md` | 26.5 KB | Tài liệu Markdown mô tả kế hoạch, hướng dẫn hoặc ghi chú dự án. |
| 476 | `KẾ-HOẠCH-ĐỒ-ÁN-NT114.md` | 13.8 KB | Tài liệu Markdown mô tả kế hoạch, hướng dẫn hoặc ghi chú dự án. |
| 477 | `README.md` | 15.2 KB | Tài liệu Markdown mô tả kế hoạch, hướng dẫn hoặc ghi chú dự án. |
| 478 | `THONG_KE_THU_MUC.md` | 55.4 KB | File thống kê toàn bộ file dự án. |
| 479 | `training/create_free_notebook_pack_file.js` | 5.0 KB | Tài liệu hoặc script phục vụ huấn luyện/fine-tuning. |
| 480 | `training/create_llamafactory_notebook_pack_file.js` | 7.4 KB | Tài liệu hoặc script phục vụ huấn luyện/fine-tuning. |
| 481 | `training/generate_fine_tuning_ready_pack.js` | 25.2 KB | Tài liệu hoặc script phục vụ huấn luyện/fine-tuning. |
| 482 | `training/generate_gemini_brand_voice_pack.js` | 14.6 KB | Tài liệu hoặc script phục vụ huấn luyện/fine-tuning. |
| 483 | `training/llama/__pycache__/prepare_dataset.cpython-314.pyc` | 5.3 KB | Tài liệu hoặc script phục vụ huấn luyện/fine-tuning. |
| 484 | `training/llama/data/train.jsonl` | 289.4 KB | Tài liệu hoặc script phục vụ huấn luyện/fine-tuning. |
| 485 | `training/llama/data/val.jsonl` | 62.0 KB | Tài liệu hoặc script phục vụ huấn luyện/fine-tuning. |
| 486 | `training/llama/infer_lora.py` | 2.3 KB | Tài liệu hoặc script phục vụ huấn luyện/fine-tuning. |
| 487 | `training/llama/LOCAL_FINE_TUNING.md` | 1.7 KB | Tài liệu hoặc script phục vụ huấn luyện/fine-tuning. |
| 488 | `training/llama/prepare_dataset.py` | 3.1 KB | Tài liệu hoặc script phục vụ huấn luyện/fine-tuning. |
| 489 | `training/llama/README.md` | 3.3 KB | Tài liệu hoặc script phục vụ huấn luyện/fine-tuning. |
| 490 | `training/llama/requirements.txt` | 169 B | Tài liệu hoặc script phục vụ huấn luyện/fine-tuning. |
| 491 | `training/llama/run_local_qlora.sh` | 1.4 KB | Tài liệu hoặc script phục vụ huấn luyện/fine-tuning. |
| 492 | `training/llama/train_lora.py` | 5.3 KB | Tài liệu hoặc script phục vụ huấn luyện/fine-tuning. |
| 493 | `training/vertex_open_model_tuning/__pycache__/submit_open_model_tuning.cpython-314.pyc` | 8.6 KB | Tài liệu hoặc script phục vụ huấn luyện/fine-tuning. |
| 494 | `training/vertex_open_model_tuning/README_VERTEX_LLAMA_TUNING.md` | 1.8 KB | Tài liệu hoặc script phục vụ huấn luyện/fine-tuning. |
| 495 | `training/vertex_open_model_tuning/requirements.txt` | 33 B | Tài liệu hoặc script phục vụ huấn luyện/fine-tuning. |
| 496 | `training/vertex_open_model_tuning/submit_open_model_tuning.py` | 5.5 KB | Tài liệu hoặc script phục vụ huấn luyện/fine-tuning. |
