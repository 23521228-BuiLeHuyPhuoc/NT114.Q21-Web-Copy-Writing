
# TÓM TẮT ĐỒ ÁN

Đồ án xây dựng một nền tảng web tên CopyPro, định hướng như một sản phẩm SaaS AI Copywriter dành cho cá nhân, marketer, doanh nghiệp nhỏ và đội ngũ nội dung cần tạo copy marketing nhanh, có cấu trúc và có khả năng quản lý lâu dài. Hệ thống cho phép người dùng nhập yêu cầu nội dung, chọn ngành nghề, loại nội dung, tone giọng, độ dài, ngôn ngữ, model AI và nhận về kết quả copywriting như headline quảng cáo, mô tả sản phẩm, bài social media, email marketing, CTA, nội dung landing page, nội dung SEO và review testimonial. Nội dung sinh ra được lưu vào cơ sở dữ liệu, có thể tìm kiếm, chỉnh sửa, đánh dấu yêu thích, đưa vào dự án, theo dõi số từ, gắn tag và đưa vào các quy trình kiểm tra chất lượng tiếp theo.

Project hiện tại có kiến trúc tách lớp khá rõ. Frontend nằm trong thư mục frontend và được xây bằng Next.js App Router, React, TypeScript, Tailwind CSS, Radix UI, shadcn-style UI components, React Query, Axios, Zustand và Chart.js. Backend nằm trong thư mục backend và được xây bằng Node.js, Express.js, Mongoose, MongoDB, JWT, bcrypt, Joi, Helmet, CORS, Multer, Nodemailer, pdf-parse, mammoth và các service tích hợp AI, thanh toán, email, upload file. Backend expose REST API theo nhóm /api/auth, /api/contents, /api/projects, /api/templates, /api/fine-tune, /api/plagiarism, /api/billing, /api/admin. Source code backend chia thành route, controller, service, validation, model và middleware.

Điểm nổi bật của đồ án không chỉ là màn hình generate nội dung, mà là việc xây dựng một hệ sinh thái nghiệp vụ tương đối đầy đủ quanh AI copywriting. Hệ thống có module fine-tuning studio cho phép người dùng tạo dataset gồm các cặp input output, validate chất lượng ví dụ, tạo job huấn luyện, theo dõi metric, log, trạng thái job, sau đó đăng ký fine-tuned model vào registry để chọn khi generate. Module kiểm tra đạo văn phân tích nội dung dựa trên nguồn nội bộ, nguồn tham chiếu, file upload và tùy chọn nguồn web hoặc Common Crawl. Thuật toán dùng chuẩn hóa văn bản, exact containment, n-gram overlap, word overlap, threshold theo sensitivity và sinh báo cáo có similarity score, originality score, risk level, matches, topic matches, sources và summary. Module billing quản lý gói Free, Pro, Business, quota sinh nội dung, quota API, quota fine-tuning, quota plagiarism, quyền truy cập model theo plan, checkout và xử lý thanh toán manual, VietQR, VNPAY, ZaloPay.

Về mặt quản trị, hệ thống có cổng admin riêng với dashboard, quản lý người dùng, nội dung, template, public site, danh mục generate options, gói dịch vụ, giao dịch thanh toán, thông báo, liên hệ, audit log, cài đặt hệ thống, model AI và phân quyền. Cơ chế role và permission được thể hiện ở cả frontend và backend: backend có AccountUser, AccountAdmin, JWT token, middleware protect, trạng thái locked hoặc active; frontend có route guard, admin role, customer role và mapping permission theo route. Điều này giúp đồ án vượt khỏi mức demo đơn lẻ và tiến gần hơn tới một hệ thống vận hành thực tế.

Tài liệu này trình bày nội dung báo cáo theo đúng khung yêu cầu: Chương 1 giới thiệu đề tài; Chương 2 trình bày cơ sở lý thuyết và công nghệ; Chương 3 phân tích thiết kế hệ thống; Chương 4 mô tả xây dựng và triển khai; Chương 5 tổng kết, đánh giá ưu điểm, hạn chế, hướng phát triển và nguồn tham khảo. Nội dung được viết dựa trên project hiện tại, bao gồm các file đã khảo sát như README, USE_CASES, package config, frontend app routes, services, auth, permissions, backend app, routes, controllers, services, models, validations và seed data.

# Chương 1. GIỚI THIỆU ĐỀ TÀI

## 1.1. Tên đề tài

Tên đề tài đề xuất: Xây dựng website AI Copywriter tích hợp mô hình ngôn ngữ lớn, RESTful API backend và fine-tuning phục vụ tạo nội dung marketing theo ngành nghề.

Tên sản phẩm trong project: CopyPro - AI Copywriter.

Tên repository project: NT114.Q21-Web-Copy-Writing.

Mô tả ngắn: CopyPro là hệ thống web hỗ trợ tạo nội dung marketing bằng AI, quản lý nội dung đã sinh, tổ chức theo dự án, sử dụng prompt template, kiểm tra đạo văn, tinh chỉnh phong cách bằng fine-tuning hoặc brand voice, quản lý quota theo gói dịch vụ và vận hành qua trang quản trị admin.

## 1.2. Lý do chọn đề tài

Trong hoạt động marketing số, nội dung là yếu tố xuất hiện ở hầu hết kênh bán hàng: website, landing page, sàn thương mại điện tử, Facebook, Instagram, TikTok, email, Google Search Ads, blog SEO và tài liệu bán hàng. Tuy nhiên, việc tạo nội dung hiệu quả thường đòi hỏi copywriter có kinh nghiệm, hiểu sản phẩm, hiểu hành vi khách hàng, biết cấu trúc thông điệp và biết điều chỉnh tone theo từng ngành. Với doanh nghiệp nhỏ, cửa hàng online, startup hoặc cá nhân bán hàng, việc duy trì đội ngũ nội dung chuyên nghiệp có thể tốn nhiều chi phí và thời gian.

Sự phát triển của các mô hình ngôn ngữ lớn tạo ra cơ hội xây dựng công cụ hỗ trợ copywriting tự động. Người dùng chỉ cần cung cấp brief, mô tả sản phẩm, ngành nghề, khách hàng mục tiêu và tone mong muốn, hệ thống có thể tạo ra nhiều phiên bản nội dung để tham khảo. Điều này giúp rút ngắn thời gian brainstorm, tăng tốc thử nghiệm A/B, hỗ trợ người không chuyên viết nội dung rõ ràng hơn và giúp marketer có điểm khởi đầu để chỉnh sửa.

Tuy nhiên, nếu chỉ gọi một API AI đơn giản thì sản phẩm chưa đủ thực tế. Một hệ thống AI Copywriter hoàn chỉnh cần thêm các thành phần như lưu lịch sử nội dung, quản lý dự án, template, phân quyền, kiểm soát quota, thanh toán, admin dashboard, kiểm tra đạo văn và tùy biến phong cách theo brand voice. Project hiện tại chọn hướng tiếp cận này: xây dựng một nền tảng web nhiều module, trong đó AI generation là trung tâm nhưng được bao quanh bởi các nghiệp vụ vận hành cần thiết của một ứng dụng SaaS.

Đề tài cũng phù hợp với môn học và năng lực kỹ thuật cần rèn luyện: xây dựng frontend hiện đại bằng Next.js, backend RESTful API bằng Express.js, thiết kế MongoDB schema bằng Mongoose, xử lý xác thực JWT, validate dữ liệu, tích hợp dịch vụ bên ngoài, tổ chức source code theo mô hình nhiều lớp, quản lý trạng thái frontend, phân quyền route, thiết kế dashboard và xử lý nghiệp vụ phức tạp như billing, fine-tuning, plagiarism checking.

## 1.3. Mục tiêu của đề tài

Mục tiêu tổng quát là xây dựng một hệ thống web AI Copywriter có thể hoạt động như một sản phẩm SaaS cơ bản: người dùng đăng ký tài khoản, tạo nội dung AI, lưu và quản lý kết quả, kiểm tra đạo văn, tinh chỉnh model theo bộ dữ liệu riêng, theo dõi hạn mức sử dụng và nâng cấp gói dịch vụ.

Các mục tiêu cụ thể gồm:

- Xây dựng giao diện public để giới thiệu sản phẩm, hiển thị trang chủ, bảng giá, blog, giới thiệu và form liên hệ.
- Xây dựng hệ thống xác thực người dùng và admin, bao gồm đăng ký, đăng nhập, đăng xuất, quên mật khẩu, OTP, xác minh email tùy cấu hình và cập nhật avatar.
- Xây dựng công cụ generate nội dung AI cho nhiều loại copy: headline, description, social, email, CTA, landing, SEO, review.
- Cho phép người dùng chọn ngành nghề, tone giọng, ngôn ngữ, model, độ dài, số phiên bản, project và template.
- Lưu nội dung sinh ra vào MongoDB, hỗ trợ CRUD, tìm kiếm, phân trang, soft delete, restore, permanent delete, favorite, tag và trạng thái hoàn thành trong dự án.
- Xây dựng module project để gom nhiều nội dung thuộc cùng một chiến dịch hoặc khách hàng.
- Xây dựng module template để tái sử dụng prompt có biến và phân loại theo category hoặc type.
- Xây dựng module generate options để admin quản lý ngành nghề, loại nội dung và tone giọng hiển thị trong trang generate.
- Xây dựng module plagiarism detection để kiểm tra trùng lặp từ nội dung nhập trực tiếp, content đã lưu hoặc file upload.
- Xây dựng module fine-tuning studio để tạo dataset, thêm example, validate dataset, tạo job, theo dõi metric, log và fine-tuned model registry.
- Xây dựng module billing để quản lý plan, subscription, payment, checkout, quota và quyền truy cập model theo gói.
- Xây dựng trang quản trị admin để quản lý người dùng, nội dung, template, danh mục generate, gói dịch vụ, thanh toán, thông báo, cài đặt, audit log và phân quyền.
- Thiết kế backend có cấu trúc rõ, dễ mở rộng, có validation, middleware bảo mật, error handler và service layer.

## 1.4. Phạm vi của đề tài

Phạm vi chức năng của đồ án bao gồm ba khu vực giao diện chính: public site, customer portal và admin portal. Public site phục vụ khách chưa đăng nhập, cung cấp thông tin sản phẩm, pricing, blog, about và contact. Customer portal phục vụ khách hàng đã đăng nhập, có dashboard, generate, contents, projects, templates, fine-tune, plagiarism check, profile, billing và notifications. Admin portal phục vụ đội ngũ vận hành, có dashboard và các màn hình quản lý dữ liệu hệ thống.

Phạm vi backend bao gồm REST API, xác thực, phân quyền, quản lý tài nguyên, gọi AI provider, lưu dữ liệu MongoDB, xử lý file upload, gửi email, tính quota, tạo thanh toán, xác minh callback cổng thanh toán và xử lý báo cáo đạo văn. Backend không xây dựng một mô hình AI từ đầu bằng deep learning framework, mà tích hợp các mô hình và endpoint có sẵn thông qua API hoặc provider. Fine-tuning trong hệ thống được thiết kế theo hướng quản lý dataset, job, model và submit tới các provider được cấu hình, ví dụ OpenAI hoặc Vertex AI, hoặc tạo brand voice model dựa trên ví dụ.

Phạm vi dữ liệu gồm các collection chính: AccountUser, AccountAdmin, Content, Project, Template, GenerateOption, Plan, Subscription, Payment, UsageLog, Notification, AuditLog, SystemSetting, PublicPage, ContactSubmission, ApiKey, FineTuneDataset, FineTuneExample, FineTuneJob, FineTuneMetric, FineTunedModel, PlagiarismReport, ForgotPassword và EmailVerification.

Phạm vi triển khai hiện tại tập trung vào môi trường local hoặc dev. Frontend chạy bằng next dev, backend chạy bằng nodemon src/server.js hoặc node src/server.js, dữ liệu dùng MongoDB qua biến môi trường MONGODB_URI. Một số chức năng phụ thuộc API key hoặc cấu hình bên ngoài như Gemini, Vertex, OpenAI, Groq, OpenRouter, FreeGPT4, VNPAY, ZaloPay, VietQR, email SMTP và Common Crawl hoặc web fetch. Khi thiếu cấu hình, một số luồng có thể trả lỗi cấu hình hoặc dùng fallback theo logic service.

## 1.5. Đối tượng sử dụng

Khách truy cập là người chưa đăng nhập. Họ có thể xem trang chủ, bảng giá, giới thiệu, blog, chi tiết blog, liên hệ, đăng ký tài khoản, đăng nhập, quên mật khẩu và đặt lại mật khẩu.

Khách hàng là người dùng đã đăng nhập với role customer. Họ sử dụng dashboard để xem tổng quan, generate để tạo nội dung AI, contents để quản lý nội dung đã tạo, projects để tổ chức chiến dịch, templates để dùng mẫu copywriting, fine-tune để quản lý dataset và model, plagiarism-check để kiểm tra đạo văn, billing để xem gói và thanh toán, profile để cập nhật hồ sơ và notifications để xem thông báo.

Admin là người quản trị hệ thống. Tùy role, admin có thể xem dashboard, quản lý user, content, template, public site, contact, generate option, plan, payment, notification, model AI, settings và audit log. Các role admin trong code gồm super_admin, content_manager, user_manager, finance_manager, ai_engineer và analyst.

Super Admin là admin có toàn quyền, đặc biệt trong việc cấu hình permission, role và các phần nhạy cảm của hệ thống. Trên frontend, super_admin được mặc định có toàn bộ permission.

Dịch vụ AI là tác nhân bên ngoài phục vụ generate, fine-tuning và brand voice. Hệ thống có thể gọi nhiều provider tùy model và biến môi trường: Gemini, Vertex Gemini, Vertex endpoint, Vertex MaaS, Vertex Claude, Groq, OpenRouter, OpenAI-compatible và FreeGPT4 local API.

Cổng thanh toán là tác nhân bên ngoài phục vụ checkout và xác nhận giao dịch. Project hiện tại có logic cho manual payment, VietQR, VNPAY và ZaloPay.

## 1.6. Phương pháp thực hiện

Đồ án được thực hiện theo hướng phân tích yêu cầu, thiết kế kiến trúc, chia module, xây dựng từng lớp và kiểm thử chức năng. Trước hết, hệ thống được phân tích theo vai trò sử dụng: guest, customer, admin, super admin, AI service và payment gateway. Từ đó xác định danh sách use case và route tương ứng. Frontend tổ chức theo Next.js App Router, mỗi route có page wrapper và component màn hình riêng, đồng thời sử dụng service layer và React Query hook để gọi backend.

Backend được thiết kế theo mô hình route-controller-service-model. Route chịu trách nhiệm khai báo endpoint và gắn middleware validate, auth hoặc upload. Controller nhận request, gọi service, trả response chuẩn. Service chứa nghiệp vụ chính như generate nội dung, kiểm tra quota, tạo payment, validate dataset hoặc tính similarity. Model định nghĩa schema MongoDB bằng Mongoose. Validation dùng Joi để kiểm soát input. Middleware xử lý xác thực, upload, error, not found, maintenance mode và rate limiting.

Phần AI được triển khai theo hướng service abstraction. aiService nhận payload thống nhất, xác định provider hoặc model phù hợp, tạo provider prompt, gọi API, chuẩn hóa output, tính token ước lượng hoặc lấy usage provider, và fallback khi không có provider khả dụng. contentService kết nối aiService với nghiệp vụ lưu Content, UsageLog, Template usage và Notification. Fine-tuning được tách riêng thành fineTuneService, có dataset, example, job, metric, model registry và nhiều provider.

Phần plagiarism được xây dựng theo thuật toán xử lý văn bản local: chuẩn hóa nội dung, loại bỏ ignored phrases hoặc common phrases, token hóa, tạo n-gram, tính exact match, phrase overlap, word overlap, topic similarity, chọn matches và sources vượt ngưỡng và lưu báo cáo. Cách này phù hợp với phạm vi đồ án vì có thể kiểm soát được logic, không phụ thuộc hoàn toàn vào dịch vụ thương mại.

## 1.7. Kết quả mong đợi

Kết quả mong đợi là một hệ thống web có thể chạy được ở môi trường local hoặc dev, thể hiện đầy đủ quy trình tạo nội dung AI và các nghiệp vụ phụ trợ. Người dùng có thể đăng nhập, tạo nội dung, lưu kết quả, xem lịch sử, quản lý dự án, dùng template, kiểm tra đạo văn, tạo dataset fine-tuning và xem billing. Admin có thể quản lý các dữ liệu quan trọng, cài đặt hệ thống, theo dõi giao dịch, quản lý danh mục và phân quyền.

Về mặt kỹ thuật, đồ án mong muốn chứng minh khả năng thiết kế hệ thống full-stack hoàn chỉnh: frontend hiện đại, backend RESTful, database schema rõ ràng, middleware bảo mật, validation dữ liệu, tích hợp AI provider, tích hợp thanh toán, tổ chức module, xử lý lỗi và tạo seed data demo. Về mặt sản phẩm, đồ án hướng tới trải nghiệm người dùng có tính thực tế: không chỉ có một form gọi AI, mà có workflow quản lý nội dung sau khi tạo, kiểm soát chất lượng và vận hành tài khoản theo plan.

# Chương 2. CƠ SỞ LÝ THUYẾT VÀ CÔNG NGHỆ SỬ DỤNG

## 2.1. Cơ sở lý thuyết

### 2.1.1. Ứng dụng web theo mô hình client-server

Project được xây dựng theo mô hình client-server. Client là frontend Next.js chạy trên trình duyệt, chịu trách nhiệm hiển thị giao diện, quản lý trạng thái, validate cơ bản, gọi API và điều hướng route. Server là backend Express.js, chịu trách nhiệm xác thực, phân quyền, validate dữ liệu, xử lý nghiệp vụ, gọi dịch vụ bên ngoài, lưu dữ liệu và trả kết quả JSON. Cách chia này giúp frontend và backend phát triển độc lập, dễ deploy riêng, dễ bảo trì và dễ mở rộng API cho mobile app hoặc public API sau này.

Trong project, frontend gọi API thông qua frontend/src/lib/axios.ts, base URL mặc định là http://localhost:4000/api hoặc lấy từ NEXT_PUBLIC_API_BASE_URL. Axios bật withCredentials để gửi cookie xác thực. Backend cấu hình CORS theo FRONTEND_URL, bật credentials true, dùng cookie-parser để đọc cookie, và có route health check /api/health.

### 2.1.2. RESTful API và mô hình route-controller-service

RESTful API là kiểu thiết kế API dùng HTTP method và URL resource để thao tác dữ liệu. Project hiện tại dùng các endpoint như GET /api/contents, POST /api/contents/generate, PATCH /api/contents/:id, DELETE /api/contents/:id, GET /api/fine-tune/datasets, POST /api/plagiarism/check, POST /api/billing/checkout. Cách đặt route theo resource giúp API dễ hiểu và dễ mapping với chức năng frontend.

Backend tách route, controller và service. Route định nghĩa đường dẫn và middleware. Controller chuyển request thành lời gọi service. Service xử lý nghiệp vụ thật sự. Ví dụ, khi người dùng gọi POST /api/contents/generate, route validate payload, controller gọi contentService.generateContent, service kiểm tra generate options, project, template, plan, quota, fine-tuned model, gọi aiService, tạo Content, UsageLog và notification. Kiến trúc này giúp controller mỏng, service dễ test hơn và code nghiệp vụ không bị dàn trải.

### 2.1.3. Xác thực JWT, cookie và phân quyền

Xác thực là quá trình xác định người dùng là ai. Project dùng JWT để ký token, lưu token trong cookie xác thực hoặc đọc từ Authorization Bearer header. Middleware protect(requiredAccountType) đọc token, verify JWT, load account từ MongoDB, kiểm tra trạng thái locked và gắn thông tin req.auth, req.user cho các route cần bảo vệ.

Phân quyền trong hệ thống có hai lớp. Backend phân biệt accountType là user hoặc admin, đảm bảo API admin không bị user thường truy cập. Frontend có route guard và permission mapping chi tiết cho admin hoặc customer. Admin role gồm super_admin, content_manager, user_manager, finance_manager, ai_engineer, analyst. Customer role gồm free_customer, pro_customer, business_customer. Điều này giúp hệ thống vừa có kiểm soát bảo mật phía server, vừa có trải nghiệm giao diện phù hợp phía client.

### 2.1.4. NoSQL MongoDB và Mongoose schema

MongoDB là cơ sở dữ liệu NoSQL lưu document dạng BSON hoặc JSON, phù hợp với dữ liệu linh hoạt như content AI, template, setting, report và metadata provider. Mongoose giúp định nghĩa schema, validation ở tầng model, index, hook và method. Project dùng nhiều schema có timestamps, index theo userId, status, createdAt, isDeleted để tối ưu truy vấn danh sách, phân trang và lọc.

Ví dụ Content có userId, projectId, templateId, title, prompt, outputText, type, tone, language, modelUsed, tags, wordCount, isFavorite, isProjectCompleted, isDeleted. Schema có pre-validate hook để tính wordCount từ outputText. AccountUser có pre-save hook hash password bằng bcrypt. ForgotPassword và EmailVerification có TTL index theo expiresAt để tự xóa OTP hết hạn.

### 2.1.5. SaaS, gói dịch vụ và quota

SaaS là mô hình phần mềm dạng dịch vụ, trong đó người dùng truy cập qua web và trả phí theo gói. Project hiện tại thể hiện mô hình SaaS qua các collection Plan, Subscription, Payment và UsageLog. Plan định nghĩa giá tháng/năm, currency, features, excludedFeatures, allowedModels và limits như copyMonthly, apiCallsMonthly, apiCallsFiveHours, apiCallsWeekly, fineTuneModels, plagiarismChecks, seats, historyDays. Subscription lưu gói hiện tại của user, trạng thái active, trialing, past_due hoặc canceled, billingCycle, provider và thời hạn. UsageLog lưu số token và quotaUnits cho mỗi lần generate.

Quota giúp giới hạn tài nguyên AI, tránh người dùng dùng vượt gói và giúp sản phẩm có mô hình kinh doanh. Trong billingService, hệ thống tính quota theo tháng, 5 giờ và 7 ngày; kiểm tra model có nằm trong allowedModels của plan không; tính quotaUnits theo token; tạo thông báo khi quota thấp. Đây là điểm quan trọng để biến tính năng AI thành sản phẩm có thể vận hành.

### 2.1.6. Prompt engineering trong AI copywriting

Prompt engineering là kỹ thuật thiết kế đầu vào cho mô hình AI để điều khiển kết quả. Trong project, payload generate gồm prompt, type, industry, tone, language, model, length, variations, maxOutputTokens, templateId và projectId. aiService chuyển payload thành provider prompt với hướng dẫn rõ ràng về loại nội dung, format bắt buộc, độ dài, tone, ngành, số phiên bản và ngôn ngữ.

Ví dụ với type email, hệ thống yêu cầu output có Subject, Preview text, lời chào, nội dung chính và CTA. Với type SEO, output có SEO title, meta description, slug, heading gợi ý và mở bài nếu độ dài long. Với type landing, output có hero headline, subheadline, pain point, lợi ích, proof, offer và CTA. Cách thiết kế prompt theo type giúp kết quả không bị trộn format và phù hợp hơn với mục đích sử dụng.

### 2.1.7. Fine-tuning và brand voice

Fine-tuning là quá trình tinh chỉnh một mô hình đã được huấn luyện sẵn bằng tập dữ liệu nhỏ hơn, thường gồm các cặp input output đại diện cho phong cách hoặc nhiệm vụ mong muốn. Trong project, người dùng có thể tạo FineTuneDataset, thêm FineTuneExample, validate chất lượng, tạo FineTuneJob, theo dõi progress, metric, log và đăng ký FineTunedModel.

Hệ thống không tự train model bằng GPU trong project, mà đóng vai trò điều phối fine-tuning với provider. Các provider trong validation gồm openai, vertex-gemini, vertex-llama, vertex-qwen và vertex-claude. Với một số provider như Vertex Claude brand voice, hệ thống có thể xây prompt brand voice từ các ví dụ hợp lệ trong dataset thay vì nhất thiết tạo endpoint fine-tuned truyền thống. Fine-tuned model sau khi hoàn tất được đưa vào registry để người dùng chọn khi generate bằng modelMode fine-tuned hoặc model id dạng fine-tuned:id.

### 2.1.8. Kiểm tra đạo văn bằng similarity

Kiểm tra đạo văn trong project dựa trên so khớp văn bản local. Quy trình gồm: lấy text cần kiểm tra, chuẩn hóa văn bản, bỏ ignored phrases hoặc common phrases nếu bật, token hóa, tạo n-gram, tính exact containment, phrase overlap, word overlap, chọn matches và sources vượt threshold. Hệ thống phân biệt plagiarismScore và topicSimilarityScore: plagiarismScore ưu tiên exact hoặc phrase overlap để phát hiện trùng lặp thật, còn topicSimilarityScore dựa nhiều hơn vào word overlap để nhận diện nội dung cùng chủ đề.

Một cách biểu diễn đơn giản: phraseOverlapScore bằng số n-gram chung chia cho số n-gram nhỏ hơn giữa input và source; wordOverlapScore kết hợp word containment và Jaccard của tập từ duy nhất; similarityScore lấy điểm cao nhất từ exact, phrase, word hoặc best segment score; originalityScore bằng 100 trừ similarityScore. Nguồn so sánh gồm nội dung đã lưu trong database của user, nguồn tham chiếu có sẵn, file upload và tùy chọn web hoặc Common Crawl.

### 2.1.9. Thanh toán điện tử và xác minh giao dịch

Project có billing service hỗ trợ nhiều phương thức thanh toán. Với manual, cash, bank, momo hoặc visa, hệ thống có thể tạo payment pending và chờ xác nhận. Với VietQR, hệ thống tạo dữ liệu QR gồm bankId, accountNo, accountName, amount, transferContent, qrImageUrl và expiresAt; admin có thể xác nhận giao dịch VietQR thủ công. Với VNPAY, hệ thống tạo URL có chữ ký HMAC SHA512, sau đó verify return hoặc IPN bằng secure hash. Với ZaloPay, hệ thống tạo order, callback URL, return URL, verify MAC bằng HMAC SHA256 và query trạng thái nếu cần.

Luồng thanh toán không chỉ ghi nhận tiền, mà còn kích hoạt subscription, cập nhật periodStart, periodEnd, providerTransactionId, payment status và đồng bộ customerRole theo plan. Vì vậy billing module vừa là nghiệp vụ tài chính vừa là một phần của kiểm soát quyền truy cập tính năng.

## 2.1.1. Mô hình Transformer và Large Language Model sử dụng trong đề tài

Phần mô hình trong đề cương nên ghi là: Mô hình Transformer và Large Language Model, viết tắt là LLM.

Lý do chọn cách gọi này là project hiện tại không khóa cứng vào một model duy nhất. Trong README ban đầu có nhắc GPT-4 và Llama, nhưng source code thực tế đã mở rộng thành kiến trúc đa provider. Frontend có danh sách model như Gemini 2.5 Flash, Gemini 2.5 Flash Lite, Groq Llama 3.3 70B, Groq Llama 3.1 8B Instant, Gemini 3 Flash Preview, Gemma 4 26B và FreeGPT4 local API. Backend aiService còn có mapping provider cho Gemini, Vertex Gemini, Vertex MaaS, Vertex endpoint, Vertex Claude, Groq, OpenRouter, OpenAI-compatible và FreeGPT4 local. Do đó, mô tả chính xác nhất là hệ thống tích hợp các LLM dựa trên Transformer thay vì một model cụ thể.

Transformer là kiến trúc nền tảng của hầu hết LLM hiện đại. Điểm cốt lõi của Transformer là cơ chế attention, cho phép mô hình xem xét quan hệ giữa các token trong chuỗi đầu vào và sinh chuỗi đầu ra phù hợp ngữ cảnh. Với bài toán copywriting, mô hình nhận prompt chứa thông tin sản phẩm, khách hàng mục tiêu, ngành nghề, tone, cấu trúc output và các ràng buộc về độ dài. Sau đó model sinh văn bản có tính thuyết phục, đúng định dạng và tự nhiên theo ngôn ngữ yêu cầu.

Trong hệ thống CopyPro, LLM được sử dụng theo ba vai trò chính. Thứ nhất là sinh nội dung gốc từ brief của người dùng. Thứ hai là dùng fine-tuned model hoặc brand voice prompt để tạo nội dung theo phong cách riêng. Thứ ba là hỗ trợ repair hoặc ổn định output trong một số trường hợp provider hoặc model trả về kết quả thiếu dấu tiếng Việt, thiếu icon hoặc sai số phiên bản. Lớp service đảm nhận việc chọn provider, tạo prompt, gọi API, chuẩn hóa output và fallback.

Đặc điểm quan trọng của thiết kế này là tách logic nghiệp vụ khỏi provider cụ thể. Người dùng chọn model ở frontend, backend chuyển model id thành provider call phù hợp. Nếu một provider không khả dụng, hệ thống có thể thử provider khác theo cấu hình hoặc trả fallback output. Với fine-tuned model, backend resolve model registry, kiểm tra provider gốc của job và tạo payload đặc thù như OpenAI fine-tuned model id, Vertex tuned endpoint hoặc brand voice prompt cho Claude.

## 2.2. Công nghệ sử dụng

| Nhóm công nghệ | Công nghệ hoặc thư viện | Vai trò trong project |
|---|---|---|
| Frontend framework | Next.js 14, React 18, TypeScript | Xây dựng giao diện web, App Router, component client, route public customer admin |
| Styling UI | Tailwind CSS, Radix UI, shadcn-style components, MUI icons, Lucide React | Tạo layout, form, dialog, table, button, icon, sidebar, dashboard |
| State data fetching | TanStack React Query, Zustand, Axios | Gọi API, cache dữ liệu, quản lý auth state, gửi cookie credentials |
| Charts editor | Chart.js, react-chartjs-2, TinyMCE, React Markdown | Biểu đồ dashboard, editor nội dung public blog, render markdown |
| Backend runtime | Node.js, Express.js | Xây dựng REST API server, middleware, route, controller, service |
| Database | MongoDB, Mongoose | Lưu user, content, project, template, payment, fine-tune, plagiarism, settings |
| Security auth | JWT, bcrypt, cookie-parser, Helmet, CORS, express-rate-limit | Xác thực, hash password, cookie auth, HTTP security header, giới hạn request |
| Validation | Joi | Validate body, query, params cho API user và admin |
| Upload file | Multer, pdf-parse, mammoth | Upload avatar, image, file plagiarism, trích text từ PDF hoặc DOCX |
| Email | Nodemailer | Gửi OTP xác minh email, OTP reset password và thông báo |
| AI providers | Gemini, Vertex AI, Groq, OpenRouter, OpenAI-compatible, FreeGPT4 local | Sinh nội dung, fine-tuning, brand voice, model registry |
| Payment | VietQR, VNPAY, ZaloPay, manual payment | Checkout, payment URL, callback, xác minh chữ ký, kích hoạt subscription |
| Dev deploy | Dockerfile backend, yarn scripts, seed script | Chạy local, seed dữ liệu demo, chuẩn bị build hoặc deploy |

### 2.2.1. Frontend Next.js

Frontend dùng Next.js App Router. Thư mục frontend/src/app chứa các route public như /, /about, /blog, /contact, /pricing; route auth như /login, /register, /forgot-password, /reset-password; route customer như /dashboard, /generate, /contents, /projects, /templates, /fine-tune, /plagiarism-check, /profile, /billing, /notifications; route admin như /admin, /admin/users, /admin/contents, /admin/templates, /admin/generate-options, /admin/plans, /admin/payments, /admin/models, /admin/settings, /admin/audit-logs, /admin/permissions, /admin/public-site, /admin/contacts.

Frontend có service layer trong frontend/src/services, ví dụ contentService.ts, fineTuningService.ts, plagiarismService.ts, billingService.ts, adminUserService.ts, adminDashboardService.ts. Các service này chuẩn hóa dữ liệu backend thành dạng UI, xử lý timeout request dài như generate, fine-tune và plagiarism, đồng thời cung cấp hàm cho component hoặc hook. React Query hook trong frontend/src/hooks/queries giúp cache, refetch và quản lý loading error.

### 2.2.2. Backend Express.js

Backend có entry src/server.js, cấu hình app trong src/app.js. App bật Helmet, CORS, Morgan, JSON parser, urlencoded parser, cookie parser, health route, sau đó mount các route public, admin và user. Các route admin và public quan trọng được mount trước maintenance mode ở một số nhóm như system, admin, public-site, contact; sau đó maintenanceMode bảo vệ các route user khi hệ thống bảo trì.

Source backend chia thành models, routes, controllers, services, middlewares, validations, utils và config. Cách chia này giúp mỗi module có đầy đủ route, controller, service, validation và model tương ứng. Ví dụ module plagiarism có routes/user/plagiarismRoutes.js, controllers/user/plagiarismController.js, services/plagiarismService.js, validations/plagiarismValidation.js, models/PlagiarismReport.js và middleware upload riêng.

### 2.2.3. MongoDB và Mongoose

Cơ sở dữ liệu dùng MongoDB với Mongoose model. Các schema đều có timestamps để theo dõi createdAt và updatedAt. Nhiều collection có soft delete bằng isDeleted và deletedAt, như Content, GenerateOption, Plan, AccountUser, AccountAdmin. Một số collection có TTL index như ForgotPassword và EmailVerification để tự dọn OTP hết hạn. Các collection quan trọng có index theo userId, createdAt, status, isDeleted để truy vấn nhanh.

### 2.2.4. AI service layer

backend/src/services/aiService.js là service lớn nhất, chịu trách nhiệm điều phối nhiều provider. Nó có mapping type, tone, industry, hướng dẫn format theo từng copy type, length instruction, variation instruction, output cleanup, token estimate, provider prompt, provider call và fallback output. Các provider call gồm Gemini, Vertex Gemini, Vertex endpoint predict, Vertex MaaS, Vertex Claude, OpenAI, OpenRouter, Groq và FreeGPT4. contentService không cần biết chi tiết API từng provider, chỉ gọi aiService.generateCopy.

### 2.2.5. Fine-tuning service layer

fineTuneService quản lý toàn bộ vòng đời fine-tuning: quota theo plan, danh sách provider base model, kiểm tra cấu hình provider, tạo training JSONL, submit OpenAI hoặc Vertex job, sync job, cancel job, seed metric, calculate progress, register completed job, tạo FineTunedModel, active hoặc deprecate model và expose quota. Đây là module nâng cao nhất của đồ án vì vừa có quản lý dữ liệu, vừa có tích hợp provider, vừa có logic trạng thái bất đồng bộ.

### 2.2.6. Plagiarism service layer

plagiarismService xử lý kiểm tra đạo văn bằng thuật toán local. Nó hỗ trợ database candidates, reference sources, uploaded candidates và web candidates từ Common Crawl service. Service tính exactMatchScore, phraseOverlapScore, wordOverlapScore, plagiarismScore, topicSimilarityScore, chọn matches và topicMatches, build analysis và lưu PlagiarismReport. Module upload đi kèm hỗ trợ file PDF, DOCX hoặc text để trích nội dung trước khi kiểm tra.

# Chương 3. PHÂN TÍCH THIẾT KẾ HỆ THỐNG

## 3.1. Khảo sát và phân tích yêu cầu

### 3.1.1. Bối cảnh nghiệp vụ

Người dùng mục tiêu của CopyPro thường có nhu cầu tạo nhiều nội dung marketing trong thời gian ngắn. Một chiến dịch bán hàng có thể cần headline quảng cáo, mô tả sản phẩm, caption social, email nhắc ưu đãi, landing page, SEO title, meta description và CTA. Nếu viết thủ công, người dùng phải tự xác định cấu trúc từng loại nội dung, tone, lợi ích sản phẩm và thông điệp phù hợp ngành. AI có thể hỗ trợ tạo bản nháp nhanh, nhưng người dùng vẫn cần lưu trữ, chỉnh sửa, kiểm tra trùng lặp, tổ chức theo dự án và quản lý chi phí sử dụng.

Project khảo sát nhu cầu này thông qua các route và module thực tế. Trang generate cho phép chọn copy type, industry, tone, model, template, project, length và variations. Trang contents cho phép quản lý lịch sử. Trang projects cho phép gom nội dung theo chiến dịch. Trang templates giúp tái sử dụng prompt chuyên nghiệp. Trang plagiarism-check giúp người dùng kiểm tra rủi ro trùng lặp. Trang fine-tune giúp người dùng đưa brand voice vào hệ thống. Trang billing giúp quản lý gói và thanh toán.

### 3.1.2. Nhóm người dùng và nhu cầu

| Nhóm người dùng | Nhu cầu chính | Chức năng tương ứng |
|---|---|---|
| Khách truy cập | Tìm hiểu sản phẩm, xem giá, đọc blog, liên hệ | Public pages, pricing, blog, contact |
| Khách hàng Free | Tạo nội dung cơ bản, xem nội dung đã tạo, quản lý tài khoản | Dashboard, generate, contents, profile, billing |
| Khách hàng Pro hoặc Business | Dùng đầy đủ project, template, fine-tune, plagiarism, model nâng cao | Projects, templates, fine-tune, plagiarism-check, allowed models, quota cao hơn |
| Content hoặc Marketing user | Tạo nhiều loại nội dung theo chiến dịch | Generate, projects, contents, templates, chỉnh sửa thủ công |
| Admin vận hành | Quản lý dữ liệu, danh mục, user, payment, settings | Admin portal, plan, payment, settings, audit |
| Finance admin | Theo dõi gói, doanh thu, giao dịch, xác nhận thanh toán | Plans, payments, revenue, confirm VietQR |
| AI engineer admin | Quản lý model AI và fine-tuning | Admin models, fine-tune provider, model registry |

### 3.1.3. Vấn đề cần giải quyết

Các vấn đề chính gồm: người dùng cần tạo nội dung nhanh nhưng vẫn đúng format; cần lưu và quản lý kết quả thay vì copy tạm thời; cần chọn đúng tone và ngành; cần dùng template để tái sử dụng prompt; cần kiểm tra nội dung có trùng lặp không; cần cá nhân hóa model theo brand voice; cần quản lý hạn mức sử dụng AI; cần thanh toán hoặc nâng cấp gói; admin cần vận hành và kiểm soát toàn bộ hệ thống.

### 3.1.4. Căn cứ từ project hiện tại

Các yêu cầu trên được phản ánh trực tiếp trong source code. Frontend có route /generate, /contents, /projects, /templates, /fine-tune, /plagiarism-check, /billing. Backend có route /api/contents/generate, /api/projects, /api/templates, /api/fine-tune, /api/plagiarism, /api/billing. Database có model Content, Project, Template, FineTune, PlagiarismReport, Plan, Subscription, Payment, UsageLog. Seed data có demo customer, admin, project mẫu, content mẫu, template mẫu, plan mẫu, payment mẫu, fine-tune dataset và job mẫu.

## 3.2. Xác định yêu cầu của hệ thống

### 3.2.1. Yêu cầu chức năng

#### A. Nhóm chức năng public site

- Hiển thị trang chủ giới thiệu CopyPro, các lợi ích, workflow và tính năng chính.
- Hiển thị bảng giá với các gói dịch vụ và giới hạn sử dụng.
- Hiển thị trang giới thiệu, blog, chi tiết blog và trang liên hệ.
- Cho phép khách gửi contact submission với name, email, company, topic và message.
- Admin có thể quản lý public pages, blog và contact thông qua admin public-site và contacts.

#### B. Nhóm chức năng xác thực tài khoản

- Đăng ký user bằng name, email, password.
- Đăng nhập user hoặc admin bằng email và password.
- Lưu session bằng JWT cookie; frontend lưu user trong localStorage để hydrate UI.
- Hỗ trợ remember login bằng cách gửi tùy chọn rememberLogin khi login hoặc refresh session.
- Hỗ trợ quên mật khẩu, gửi OTP qua email, verify OTP và reset password.
- Hỗ trợ xác minh email nếu system setting bật emailVerificationRequired.
- Cập nhật avatar và xóa avatar cho user hoặc admin.
- Khóa tài khoản bằng status locked để chặn đăng nhập hoặc truy cập.

#### C. Nhóm chức năng generate nội dung

- Người dùng nhập prompt hoặc brief, chọn copy type, industry, tone, language, model, length, variations.
- Chọn project để gắn nội dung vào chiến dịch.
- Chọn template để hệ thống ghép systemPrompt với input người dùng.
- Chọn base model hoặc fine-tuned model.
- Backend kiểm tra copy type, tone, industry có active trong GenerateOption không.
- Backend kiểm tra project thuộc user, template được phép dùng và model nằm trong plan.
- Backend kiểm tra quota trước khi gọi AI.
- Gọi AI provider phù hợp, lưu Content, UsageLog, tăng usageCount template và tạo notification.
- Trả về outputText, modelUsed, modelDisplayName, wordCount, token usage và fallback flag.

#### D. Nhóm chức năng quản lý content

- Xem danh sách content với phân trang, tìm kiếm và lọc theo project.
- Xem chi tiết một content.
- Tạo content thủ công nếu muốn lưu nội dung không sinh từ AI.
- Cập nhật title, prompt, outputText, type, tone, language, tags, projectId, favorite và trạng thái completed trong project.
- Soft delete content, xem thùng rác, restore hoặc permanent delete.
- Admin có thể xem, cập nhật, soft delete, restore và permanent delete content toàn hệ thống.

#### E. Nhóm chức năng quản lý project

- Tạo project với name, description, industry và color.
- Kiểm tra tên project không trùng trong cùng tài khoản.
- Xem danh sách project, tìm kiếm, phân trang và lọc archived.
- Tính thống kê project dựa trên Content: contentCount, completedCount, inProgressCount, completionPercent.
- Cập nhật project, archive hoặc unarchive.
- Khi gắn content vào project, content có thể đánh dấu isProjectCompleted.

#### F. Nhóm chức năng template

- Xem template system và template cá nhân đang active.
- Lọc template theo category, type và search.
- Tạo template cá nhân với name, description, category, type, systemPrompt và variables.
- Khi generate, backend lấy template nếu người dùng có quyền truy cập.
- Sau khi generate thành công, tăng usageCount template.
- Admin quản lý template system: tạo, sửa, archive, restore, permanent delete.

#### G. Nhóm chức năng generate options

- Quản lý danh mục ngành nghề, loại nội dung và tone giọng.
- Admin có thể list active hoặc trash, create, update, soft delete, restore, permanent delete.
- Backend tự seed default options nếu group chưa có dữ liệu.
- Trang generate chỉ cho phép dùng option đang active để tránh người dùng gửi slug không hợp lệ.

#### H. Nhóm chức năng plagiarism check

- Kiểm tra đạo văn bằng text nhập trực tiếp hoặc contentId.
- Upload file cần kiểm tra và file nguồn tham chiếu.
- Trích xuất text từ file PDF, DOCX hoặc text.
- Chọn source config: database, references, web, uploads.
- Chọn threshold, sensitivity, ignoreCommonPhrases, ignoredPhrases.
- Tính similarityScore, originalityScore, riskLevel, matches, topicMatches và sources.
- Lưu lịch sử PlagiarismReport và cho phép xem lại báo cáo.
- Cung cấp debug Common Crawl để kiểm tra nguồn web nếu bật.

#### I. Nhóm chức năng fine-tuning

- Xem danh sách provider và quota fine-tuning.
- Tạo dataset với name, industry, description, sourceType, language, tags.
- Thêm examples vào dataset, mỗi example có input, output, industry, tone, contentType, product, sourceContentId.
- Validate examples: kiểm tra độ dài, phát hiện từ nhạy cảm như password, secret, api_key, token, tính qualityScore, isValid và validationErrors.
- Tạo fine-tune job từ datasetId hoặc inline examples.
- Kiểm tra số ví dụ hợp lệ tối thiểu, quota running jobs và quota model theo plan.
- Submit job tới provider nếu cấu hình sẵn, hoặc xử lý brand voice model tùy provider.
- Theo dõi job status pending, queued, running, completed, failed, cancelled, progress, accuracy, loss, cost, token usage.
- Xem metric theo epoch, log huấn luyện và danh sách fine-tuned model registry.
- Active hoặc deactivate model, promote job thành model, dùng fine-tuned model khi generate.

#### J. Nhóm chức năng billing và subscription

- Xem danh sách plan active: Free, Pro, Business.
- Mỗi plan có priceMonthly, priceYearly, currency, features, excludedFeatures, allowedModels và limits.
- Xem billing hiện tại của user: subscription, plan, usage, remaining quota, payment history.
- Checkout plan theo billingCycle monthly hoặc yearly và method.
- Tự kích hoạt free plan.
- Tạo QR VietQR và chờ xác nhận thủ công.
- Tạo payment URL VNPAY hoặc ZaloPay và xử lý return, callback, IPN.
- Xác minh chữ ký, số tiền, invoice, transaction id.
- Kích hoạt subscription, cập nhật periodEnd, payment status success và customerRole theo plan.
- Admin quản lý plan, payment, revenue và confirm VietQR.

#### K. Nhóm chức năng notification

- Tạo thông báo cho user hoặc admin với recipientType, title, message, type, actionUrl.
- Người dùng xem notification, đánh dấu đã đọc hoặc đọc tất cả.
- Người dùng cập nhật notification preferences, ví dụ quotaLow.
- Admin gửi notification và quản lý notification admin.

#### L. Nhóm chức năng API key

- User tạo API key với name và permissions như generate, templates, history, fine-tune.
- Backend chỉ lưu keyHash, prefix và suffix để hiển thị mask.
- User list, revoke API key và xem log usage liên quan.

#### M. Nhóm chức năng admin

- Dashboard thống kê user, content, revenue, growth.
- Quản lý user hoặc admin account, soft delete, restore, permanent delete.
- Quản lý content, template, generate option, plan, payment, notification, public site, contact submission, settings và audit log.
- Phân quyền admin hoặc customer ở frontend theo role và permission.
- Cài đặt maintenance mode, registrationEnabled, emailVerificationRequired, email templates và quota reset.

### 3.2.2. Yêu cầu phi chức năng

#### A. Bảo mật

Mật khẩu phải được hash bằng bcrypt trước khi lưu. JWT token phải được verify ở backend trước khi truy cập tài nguyên bảo vệ. API admin phải yêu cầu accountType admin. Tài khoản locked không được truy cập. Dữ liệu đầu vào phải validate bằng Joi. CORS chỉ cho phép frontend origin cấu hình. Helmet được dùng để tăng an toàn HTTP headers. OTP reset password và email verification có TTL, hash OTP và giới hạn số lần thử.

#### B. Toàn vẹn dữ liệu

Các tài nguyên user-owned như Content, Project, Template, FineTuneDataset, FineTuneJob, PlagiarismReport phải lọc theo userId khi truy vấn. Khi tạo content gắn project, backend kiểm tra project thuộc user. Khi dùng template, backend kiểm tra template system hoặc authorId là user. Khi permanent delete plan, backend kiểm tra không có subscription liên quan. Khi update dataset đã submitted, hệ thống chặn chỉnh sửa.

#### C. Hiệu năng

Danh sách dữ liệu cần phân trang và giới hạn limit. MongoDB schema cần index theo userId, status, createdAt, isDeleted. AI, plagiarism và fine-tune request có timeout dài hơn request thường. Backend không tải toàn bộ dữ liệu nếu không cần. Plagiarism giới hạn số source, số match và độ dài text để tránh xử lý quá nặng.

#### D. Khả năng mở rộng

Provider AI được tách trong aiService, giúp thêm model hoặc provider mới mà không đổi nhiều code ở contentService. Fine-tuning provider được tách logic theo provider. Payment gateway được tách trong paymentGatewayService. Frontend dùng service layer và hook để giảm phụ thuộc trực tiếp vào endpoint trong component. Database dùng schema linh hoạt, có metadata cho provider hoặc payment.

#### E. Trải nghiệm người dùng

Giao diện cần responsive, có loading state, access denied state, toast notification, form rõ ràng, pagination, filter, dashboard dễ đọc. Với tác vụ lâu như generate, fine-tune và plagiarism, frontend dùng timeout phù hợp và thông báo lỗi từ backend. Route guard tự điều hướng user hoặc admin đúng nơi.

#### F. Khả năng bảo trì

Source code cần chia module rõ, đặt tên thống nhất, controller mỏng, service chứa nghiệp vụ, validation riêng, model riêng. Các module chính đều có service frontend tương ứng. README và USE_CASES giúp mô tả hệ thống. Seed script giúp tạo dữ liệu demo để kiểm thử.

## 3.3. Sơ đồ use case

### 3.3.1. Actor

- Khách truy cập: xem public site, pricing, blog, contact, đăng ký hoặc đăng nhập.
- Khách hàng: tạo và quản lý nội dung, dự án, template, fine-tune, plagiarism, billing, notification.
- Admin: quản lý dữ liệu hệ thống tùy quyền.
- Super Admin: quản lý toàn bộ hệ thống và phân quyền.
- Dịch vụ AI: cung cấp generate, fine-tuning, model inference.
- Cổng thanh toán: xử lý VNPAY, ZaloPay, VietQR hoặc manual confirmation.

### 3.3.2. Use case tổng quan dạng mô tả PlantUML

@startuml
left to right direction
actor Khach_truy_cap as Guest
actor Khach_hang as Customer
actor Admin
actor Super_Admin as SuperAdmin
actor Dich_vu_AI as AIService
actor Cong_thanh_toan as PaymentGateway
rectangle CopyPro_AI_Copywriter {
  usecase Xem_public_site as UC_Public
  usecase Dang_ky_Dang_nhap as UC_Auth
  usecase Tao_noi_dung_AI as UC_Generate
  usecase Quan_ly_noi_dung as UC_Content
  usecase Quan_ly_du_an as UC_Project
  usecase Su_dung_template as UC_Template
  usecase Kiem_tra_dao_van as UC_Plagiarism
  usecase Fine_tuning_Brand_voice as UC_FineTune
  usecase Quan_ly_goi_va_thanh_toan as UC_Billing
  usecase Xem_thong_bao as UC_Notification
  usecase Quan_tri_he_thong as UC_Admin
  usecase Quan_ly_phan_quyen as UC_Permission
}
Guest --> UC_Public
Guest --> UC_Auth
Customer --> UC_Generate
Customer --> UC_Content
Customer --> UC_Project
Customer --> UC_Template
Customer --> UC_Plagiarism
Customer --> UC_FineTune
Customer --> UC_Billing
Customer --> UC_Notification
Admin --> UC_Admin
SuperAdmin --> UC_Admin
SuperAdmin --> UC_Permission
UC_Generate --> AIService
UC_FineTune --> AIService
UC_Plagiarism --> AIService
UC_Billing --> PaymentGateway
@enduml

### 3.3.3. Use case khách hàng

Khách hàng bắt đầu bằng đăng nhập. Sau khi xác thực, họ vào dashboard để xem tổng quan tài khoản, sau đó có thể tạo nội dung AI. Trong use case tạo nội dung, khách hàng nhập prompt, chọn copy type, industry, tone, language, model, length, variations, template và project. Hệ thống kiểm tra quyền model và quota, gọi AI, lưu nội dung và trả kết quả. Khách hàng có thể chỉnh sửa nội dung, đánh dấu favorite, gắn project, kiểm tra đạo văn hoặc dùng nội dung làm nguồn ví dụ fine-tuning.

Các use case khách hàng gồm: quản lý dashboard, tạo nội dung AI, xem danh sách content, xem chi tiết content, cập nhật content, xóa hoặc khôi phục content, tạo project, cập nhật project, dùng template, tạo dataset fine-tuning, thêm example, validate dataset, tạo job, xem metric hoặc log, chọn fine-tuned model khi generate, kiểm tra đạo văn, xem billing, checkout, xem notification và cập nhật profile.

### 3.3.4. Use case admin

Admin đăng nhập qua /admin/login. Sau khi xác thực, route guard kiểm tra role admin và permission theo route. Admin có thể xem dashboard, quản lý người dùng, quản lý nội dung, template, public site, contact, generate option, plan, payment, notification, model, settings và audit log. Super admin có toàn quyền, gồm quản lý permission. Các role khác có tập quyền hạn chế: content_manager tập trung nội dung, danh mục và public site; user_manager tập trung user, notification và contact; finance_manager tập trung plan và payment; ai_engineer tập trung model; analyst tập trung audit và báo cáo.

## 3.5. Thiết kế kiến trúc hệ thống

### 3.5.1. Kiến trúc tổng thể

Người dùng hoặc admin thao tác trên trình duyệt. Frontend Next.js chịu trách nhiệm hiển thị UI, quản lý route, state, form và gọi API bằng Axios. Backend Express.js tiếp nhận request, đi qua middleware bảo mật và validate, sau đó controller gọi service để xử lý nghiệp vụ. Service thao tác MongoDB qua Mongoose models và gọi các dịch vụ ngoài như AI provider, payment gateway, email service, Common Crawl hoặc file parser. Kết quả được trả về JSON cho frontend.

Luồng tổng quát có thể mô tả như sau: Browser -> Next.js App Router -> Axios/React Query -> Express REST API -> Validation/Auth Middleware -> Controller -> Service -> Mongoose Model -> MongoDB. Các service phụ trợ gồm AI Providers, Payment Gateway, SMTP Email, Upload/Text Extraction và Common Crawl/Web Fetch.

### 3.5.2. Kiến trúc frontend

Frontend được chia thành các nhóm:

- src/app: route theo App Router, mỗi route có page.tsx và component màn hình.
- src/app/components: component UI, common, public, admin, generator, charts.
- src/services: service gọi API và normalize dữ liệu.
- src/hooks/queries: React Query hooks cho các module.
- src/lib: axios, permissions, generator config, model display name, content quality, UI helper.
- src/stores: Zustand auth store.
- src/types: type definition.
- src/styles: CSS, Tailwind, theme, fonts.

Thiết kế này giúp component không gọi API trực tiếp quá nhiều. Component gọi hook hoặc service; service biết endpoint backend và chuẩn hóa response. Ví dụ contentService.generate gọi /contents/generate, timeout 120 giây, nhận item, usage, fallback và convert thành UiContent. plagiarismService.check tự chọn endpoint /plagiarism/check hoặc /plagiarism/check-files tùy có upload file hay không.

### 3.5.3. Kiến trúc backend

Backend được chia thành:

- src/server.js: load env, connect MongoDB, listen port, graceful shutdown.
- src/app.js: cấu hình Express app, middleware chung, mount routes, error handler.
- src/routes: route user và admin, khai báo endpoint và middleware.
- src/controllers: xử lý request và response ở mức mỏng.
- src/services: nghiệp vụ chính.
- src/models: Mongoose schema và model.
- src/validations: Joi schema.
- src/middlewares: auth, error, upload, validation, maintenance, rateLimit.
- src/config: database, generator models.
- src/utils: JWT, cookie, error, asyncHandler, OTP, seed, helper.

### 3.5.4. Sơ đồ module backend

| Module | Route chính | Controller | Service | Model chính |
|---|---|---|---|---|
| Auth user admin | /api/auth/user, /api/auth/admin | authController | authService | AccountUser, AccountAdmin, ForgotPassword, EmailVerification |
| Content generate | /api/contents | contentController | contentService, aiService | Content, UsageLog |
| Project | /api/projects | projectController | projectService | Project, Content |
| Template | /api/templates, /api/admin/templates | templateController | templateService, adminTemplateService | Template |
| Generate options | /api/generate-options, /api/admin/generate-options | generateOptionController | generateOptionService | GenerateOption |
| Fine-tune | /api/fine-tune | fineTuneController | fineTuneService | FineTuneDataset, FineTuneExample, FineTuneJob, FineTuneMetric, FineTunedModel |
| Plagiarism | /api/plagiarism | plagiarismController | plagiarismService, plagiarismFileService | PlagiarismReport, Content |
| Billing payment | /api/billing, /api/admin/payments, /api/admin/plans | billing, payment, plan controllers | billingService, paymentGatewayService | Plan, Subscription, Payment, UsageLog |
| Notification | /api/notifications, /api/admin/notifications | notificationController | notificationService | Notification |
| Public site contact | /api/public-site, /api/contact-submissions, /api/admin/public-site | publicSite, contact controllers | publicSiteService, contactSubmissionService | PublicPage, ContactSubmission |
| Settings audit | /api/admin/settings, /api/admin/audit-logs | settings, audit controllers | systemSettingsService, auditLogService | SystemSetting, AuditLog |

### 3.5.5. Thiết kế bảo mật backend

Backend áp dụng nhiều lớp bảo mật. Helmet được bật để cấu hình header an toàn. CORS kiểm tra origin với FRONTEND_URL. JSON body giới hạn 1MB. Auth middleware đọc token từ Bearer hoặc cookie. Token invalid hoặc expired trả 401. Sai accountType trả 403. Account bị locked trả 403. Joi validation chặn dữ liệu sai format, quá dài hoặc thiếu field. Upload middleware giới hạn loại file và chuẩn hóa payload. Error handler tập trung trả response nhất quán.

## 3.6. Thiết kế luồng xử lý chính

### 3.6.1. Luồng đăng ký và đăng nhập user

1. Người dùng nhập name, email, password ở frontend.
2. Frontend gọi POST /api/auth/user/register.
3. Backend validate input bằng userRegisterSchema.
4. authService.registerUser kiểm tra registrationEnabled, kiểm tra email chưa tồn tại.
5. Tạo AccountUser, hash password bằng bcrypt pre-save hook.
6. Nếu emailVerificationRequired bật, tạo EmailVerification OTP, hash OTP, gửi email qua Nodemailer.
7. Khi đăng nhập, frontend gọi POST /api/auth/user/login với rememberLogin.
8. Backend tìm user, select password, compare bcrypt, kiểm tra locked và verified.
9. Backend ký JWT, set cookie, trả user serialized.
10. Frontend lưu user vào localStorage và hydrate auth store.

### 3.6.2. Luồng tạo nội dung AI

1. User mở /generate, nhập brief và chọn type, industry, tone, language, model, length, variations, template, project.
2. Frontend contentService.generate gọi POST /api/contents/generate với timeout 120 giây.
3. Backend validate generateContentSchema.
4. contentService.generateContent gọi ensureActiveGenerateOptions để kiểm tra type, tone, industry đang active.
5. Kiểm tra project thuộc user nếu có projectId.
6. Kiểm tra model được phép dùng theo plan bằng billingService.ensureGenerateModelAllowed.
7. Lấy template nếu có và kiểm tra quyền truy cập.
8. Resolve fine-tuned model nếu modelMode là fine-tuned hoặc model id dạng fine-tuned.
9. Ghép prompt với template hoặc dùng raw prompt tùy fine-tuned provider.
10. Kiểm tra quota bằng billingService.ensureGenerateQuotaAvailable.
11. Gọi aiService.generateCopy để sinh nội dung từ provider phù hợp.
12. Nếu dùng Vertex Llama fine-tuned, hệ thống có thể repair hoặc stabilize output để tránh lỗi dấu hoặc thiếu icon.
13. Tạo Content trong MongoDB.
14. Tạo UsageLog với promptTokens, completionTokens, totalTokens, quotaUnits.
15. Tăng usageCount của template nếu có.
16. Tạo notification generate success và quota low nếu cần.
17. Trả về content item, usage, template và fallback flag cho frontend.

### 3.6.3. Luồng quản lý content

Danh sách content dùng GET /api/contents với page, limit, search, projectId. Backend tạo filter theo userId, isDeleted false, regex search trên title, prompt, outputText, type, tags và projectId nếu có. Kết quả được sort createdAt desc, skip, limit và trả pagination. Content có thể update, soft delete, restore và permanent delete. Soft delete chỉ set isDeleted và deletedAt, giúp người dùng khôi phục. Permanent delete xóa thật record.

### 3.6.4. Luồng kiểm tra đạo văn

1. User nhập text hoặc chọn content hoặc upload file ở /plagiarism-check.
2. Nếu có file, frontend gửi multipart tới /api/plagiarism/check-files; nếu không, gửi JSON tới /api/plagiarism/check.
3. Middleware upload trích text từ checkFile hoặc referenceFiles và chuẩn bị uploadedSources.
4. Backend validate text hoặc contentId, threshold, sensitivity, source config và uploadedSources.
5. plagiarismService.getCheckText lấy checkText từ payload text hoặc Content theo contentId.
6. Nếu text dưới 5 từ, trả lỗi.
7. Chuẩn hóa text, bỏ ignored phrases hoặc common phrases tùy cấu hình.
8. Build candidates từ database content, reference sources, web hoặc Common Crawl và uploads.
9. Với mỗi candidate, tính scoreTexts gồm exact containment, normalized exact, n-gram phrase overlap, word overlap.
10. Tìm segment matches và topic matches nếu không dùng document-level match.
11. Sort nguồn theo similarity, giới hạn sources và matches.
12. Tính similarityScore, originalityScore, riskLevel và analysis.
13. Lưu PlagiarismReport.
14. Trả báo cáo cho frontend để hiển thị highlight, nguồn và mức rủi ro.

### 3.6.5. Luồng tạo dataset và fine-tune job

1. User mở /fine-tune, tạo dataset hoặc tạo job trực tiếp với inline examples.
2. Dataset gồm name, industry, description, sourceType, language, tags.
3. User thêm examples, mỗi example có input, output và metadata.
4. fineTuneService.validateExamplePayload kiểm tra input, output tối thiểu, tối đa, từ nhạy cảm, tính qualityScore.
5. refreshDatasetStats tính exampleCount, validExampleCount, average qualityScore và status draft hoặc validated.
6. Khi tạo job, backend chọn provider, baseModel, kiểm tra provider supported.
7. Nếu provider cần cấu hình remote, backend kiểm tra API key, project, bucket, endpoint.
8. Backend yêu cầu dataset có tối thiểu số valid examples theo MIN_VALID_EXAMPLES.
9. Kiểm tra quota running jobs và số model fine-tuned theo plan.
10. Tạo FineTuneJob pending, set dataset status submitted, seed metric epoch 0.
11. Submit job tới OpenAI hoặc Vertex, hoặc hoàn tất brand voice job tùy provider.
12. Các lần sync cập nhật status, progress, fineTunedModelId, metric, deployment status.
13. Khi job completed, createFineTunedModelFromJob tạo FineTunedModel registry.
14. User có thể active model và dùng trong generate.

### 3.6.6. Luồng thanh toán và kích hoạt subscription

1. User mở /billing, chọn plan và billing cycle.
2. Frontend gọi POST /api/billing/checkout với planId hoặc planSlug, method, billingCycle.
3. Backend kiểm tra user tồn tại, plan tồn tại, plan active, không checkout cùng plan đang active và không downgrade qua checkout thường.
4. Tính amount theo monthly hoặc yearly. Nếu plan free, tạo Payment pending rồi activate ngay.
5. Nếu method VietQR, tạo Payment pending, build QR data, lưu metadata VietQR và trả QR cho frontend.
6. Nếu method VNPAY, tạo Payment pending, build payment URL có secure hash và trả frontend redirect.
7. Nếu method ZaloPay, tạo order qua API, lưu gatewayTransactionId và trả paymentUrl.
8. Khi VNPAY hoặc ZaloPay callback hoặc return, backend verify chữ ký hoặc MAC và số tiền.
9. Nếu thành công, activatePayment tạo hoặc cập nhật Subscription, set Payment success, paidAt, periodStart, periodEnd.
10. Cập nhật customerRole theo plan: free_customer, pro_customer, business_customer.
11. Admin có thể xác nhận VietQR thủ công qua /api/admin/payments/:id/confirm.

### 3.6.7. Luồng admin quản trị dữ liệu

Admin đăng nhập qua /api/auth/admin/login. Frontend route guard kiểm tra user.role là admin và permission theo path. Khi admin truy cập các trang quản trị, frontend service gọi /api/admin. Các API admin cho phép list, create, update, soft delete, restore, permanent delete tùy module. Audit log dùng để ghi lại hành động quan trọng, phục vụ truy vết. Settings cho phép bật maintenanceMode, tắt registration, yêu cầu email verification, cấu hình email template và reset quota.

## 3.7. Thiết kế cơ sở dữ liệu

### 3.7.1. Tổng quan dữ liệu

Hệ thống dùng MongoDB, mỗi nhóm nghiệp vụ tương ứng một hoặc nhiều collection. Dữ liệu được thiết kế theo hướng document-oriented nhưng vẫn có quan hệ bằng ObjectId reference. Các quan hệ quan trọng gồm AccountUser với Content, AccountUser với Project, AccountUser với Subscription, Plan với Subscription, Payment với Plan, User, Subscription, FineTuneDataset với FineTuneExample, FineTuneDataset với FineTuneJob, FineTuneJob với FineTuneMetric, FineTuneJob với FineTunedModel, Content với PlagiarismReport.

### 3.7.2. Bảng collection chính

| Collection | Vai trò | Trường quan trọng | Ghi chú thiết kế |
|---|---|---|---|
| AccountUser | Tài khoản khách hàng | name, email, password, status, customerRole, avatar, isVerified, quotaResetAt, isDeleted | Hash password bằng bcrypt, index email status isDeleted |
| AccountAdmin | Tài khoản admin | name, email, password, adminRole, status, avatar, isDeleted | Role gồm super_admin, content_manager, user_manager, finance_manager, ai_engineer, analyst |
| Content | Nội dung AI hoặc thủ công | userId, projectId, templateId, title, prompt, outputText, type, tone, language, modelUsed, tags, wordCount | Có soft delete, favorite, completed trong project, tính wordCount tự động |
| Project | Dự án hoặc chiến dịch | userId, name, description, industry, isArchived, color | Tính thống kê từ Content |
| Template | Prompt template | name, slug, description, category, type, systemPrompt, variables, isSystem, authorId, status, usageCount | Template system hoặc template cá nhân |
| GenerateOption | Danh mục generate | group, name, slug, description, icon, color, isActive, order, isDeleted | group là industry, copy_type, tone, unique group slug |
| Plan | Gói dịch vụ | name, slug, priceMonthly, priceYearly, limits, features, allowedModels, isActive | Quản lý quota và quyền model |
| Subscription | Gói đang dùng | userId, planId, status, billingCycle, currentPeriodStart, currentPeriodEnd, provider | Liên kết user với plan |
| Payment | Giao dịch | invoiceNo, userId, planId, subscriptionId, amount, method, provider, status, paidAt, metadata | Hỗ trợ manual, VietQR, VNPAY, ZaloPay |
| UsageLog | Log sử dụng AI | userId, contentId, model, promptTokens, completionTokens, totalTokens, quotaUnits, status | Dùng tính quota và thống kê |
| FineTuneDataset | Bộ dữ liệu fine-tune | userId, name, industry, sourceType, status, exampleCount, validExampleCount, qualityScore | Status draft, validated, submitted, archived |
| FineTuneExample | Ví dụ huấn luyện | datasetId, userId, inputText, outputText, industry, tone, contentType, product, qualityScore, isValid | Có validationErrors và sourceContentId |
| FineTuneJob | Job huấn luyện | userId, datasetId, name, baseModel, provider, status, progress, samples, epochs, accuracy, loss, providerJobId | Lưu thông tin provider, endpoint, deployment |
| FineTuneMetric | Metric huấn luyện | jobId, userId, epoch, trainLoss, validationLoss, accuracy, tokenUsage, source | Dùng vẽ chart theo epoch |
| FineTunedModel | Registry model | jobId, userId, name, alias, providerModelId, baseModel, industry, version, isActive | Model hoàn tất để chọn khi generate |
| PlagiarismReport | Báo cáo đạo văn | userId, contentId, checkText, similarityScore, originalityScore, riskLevel, matches, sources, analysis | Lưu chi tiết nguồn, match và cấu hình kiểm tra |
| Notification | Thông báo | recipientType, userId, adminId, title, message, type, isRead, actionUrl | Dùng cho user hoặc admin notification center |
| AuditLog | Nhật ký hệ thống | actorId, actorType, actorEmail, action, targetType, targetId, level, metadata, ip | Truy vết hành động |
| SystemSetting | Cài đặt hệ thống | siteName, supportEmail, maintenanceMode, registrationEnabled, emailVerificationRequired, emailTemplates, quotaResetAt | Điều khiển hành vi hệ thống |
| PublicPage | Trang public blog settings | key, type, title, description, content, seo, isPublished, sortOrder | Admin chỉnh nội dung public site |
| ContactSubmission | Liên hệ | name, email, company, topic, message, status, adminNote, handledBy | Quản lý form liên hệ |
| ApiKey | API key user | userId, name, keyHash, keyPrefix, keySuffix, permissions, status, calls | Không lưu plain key |
| ForgotPassword | OTP reset password | email, accountType, accountId, otpHash, expiresAt, usedAt, attempts | TTL index expiresAt |
| EmailVerification | OTP xác minh email | email, accountId, otpHash, expiresAt, usedAt, attempts | TTL index expiresAt |

### 3.7.3. Quan hệ dữ liệu chính

AccountUser có nhiều Content. AccountUser có nhiều Project. Project có nhiều Content. Template có thể được nhiều Content sử dụng. AccountUser có nhiều FineTuneDataset. FineTuneDataset có nhiều FineTuneExample và nhiều FineTuneJob. FineTuneJob có nhiều FineTuneMetric và có thể tạo FineTunedModel. AccountUser có nhiều PlagiarismReport. Content có thể có nhiều PlagiarismReport. AccountUser có nhiều Subscription và Payment. Plan có nhiều Subscription và Payment. Subscription có nhiều Payment. AccountUser hoặc AccountAdmin nhận nhiều Notification. AccountAdmin hoặc system tạo nhiều AuditLog.

### 3.7.4. Thiết kế một số schema tiêu biểu

Content schema lưu cả prompt đầu vào và outputText đầu ra, vì hai thông tin này cần cho lịch sử, chỉnh sửa, kiểm tra đạo văn và tái sử dụng. Trường modelUsed giúp truy vết model đã dùng. Trường tags hỗ trợ phân loại nhanh. Trường wordCount được tính tự động để dashboard và content list không cần tính lại nhiều lần. Trường isDeleted và deletedAt hỗ trợ thùng rác.

Plan schema tách limits thành object gồm copyMonthly, apiCallsMonthly, apiCallsFiveHours, apiCallsWeekly, fineTuneModels, plagiarismChecks, seats và historyDays. Thiết kế này giúp thêm giới hạn mới mà không cần tạo collection khác. allowedModels là danh sách model access id, giúp billingService kiểm tra model trước khi generate.

PlagiarismReport schema phức tạp nhất vì lưu nhiều dữ liệu phân tích. Mỗi source lưu similarity, plagiarismScore, topicSimilarityScore, snippet, sourceText, exactMatchScore, phraseOverlapScore, wordOverlapScore. matches lưu start, end, matchedText, sourceText, sourceUrl, sourceType và score. analysis lưu thống kê candidateCount, sourceCount, matchCount, checkedSourceTypes, unavailableSourceTypes và chi tiết Common Crawl. Thiết kế này giúp frontend hiển thị báo cáo sâu mà không cần tính lại.

FineTuneJob schema lưu cả thông tin nghiệp vụ và thông tin provider. Ngoài status, progress, samples, epochs, accuracy, loss và cost, schema còn có providerJobId, tuningLocation, tuningEndpoint, fineTunedModelId, tunedModelResourceId, deploymentOperationId, deploymentStatus, deployedModelId. Điều này cần thiết vì fine-tuning là tác vụ bất đồng bộ, mỗi provider trả trạng thái và endpoint theo cách khác nhau.

# Chương 4. XÂY DỰNG VÀ TRIỂN KHAI ỨNG DỤNG

## 4.1. Xây dựng giao diện người dùng

### 4.1.1. Cấu trúc giao diện frontend

Frontend dùng Next.js App Router, mỗi màn hình chính có route tương ứng. Các component được chia theo mục đích: component dùng chung, component UI, component public, component customer, component admin, component generator và component chart. Thiết kế này giúp các màn hình lớn như Generate, FineTuningStudio, PlagiarismCheck, Billing, Dashboard và Admin Dashboard có thể tái sử dụng button, dialog, table, pagination, chart, layout và route guard.

### 4.1.2. Nhóm trang public

Các trang public gồm:

- /: Landing page giới thiệu CopyPro và các lợi ích chính.
- /pricing: Bảng giá gói dịch vụ, dùng dữ liệu billing hoặc plan.
- /about: Trang giới thiệu sản phẩm và dự án.
- /blog: Danh sách bài viết public.
- /blog/[slug]: Chi tiết bài viết.
- /contact: Form liên hệ gửi contact submission.
- /login, /register, /forgot-password, /reset-password: Luồng xác thực khách hàng.

Nhóm public site giúp người chưa đăng nhập hiểu sản phẩm, xem gói dịch vụ và chuyển đổi thành user. Admin có thể quản lý nội dung public hoặc blog thông qua /admin/public-site.

### 4.1.3. Nhóm trang khách hàng

Trang khách hàng nằm sau ProtectedRoute với requiredRole customer. Các trang gồm dashboard, generate, contents, projects, templates, fine-tune, plagiarism-check, profile, billing và notifications. Route guard kiểm tra user đã đăng nhập, role là customer, sau đó kiểm tra customer permission theo route. Ví dụ free_customer có thể bị hạn chế project, fine-tune hoặc plagiarism tùy permission cấu hình.

Trang generate là trung tâm của sản phẩm. Nó dùng các component như ProductInfoForm, IndustryPicker, CopyTypePicker, TonePicker, ModelPicker, AdvancedSettings và GeneratorResults. Người dùng chọn thông tin, gửi request và nhận kết quả. Trang contents hiển thị danh sách nội dung đã tạo, cho phép tìm kiếm hoặc lọc, xem chi tiết, chỉnh sửa, xóa, restore. Trang projects hiển thị tiến độ từng project dựa trên số content hoàn thành. Trang fine-tune hiển thị dataset, examples, jobs, metrics và model registry. Trang plagiarism-check hiển thị form kiểm tra, nguồn, threshold, sensitivity và báo cáo.

### 4.1.4. Nhóm trang admin

Admin portal nằm dưới /admin. Route admin dùng AdminRoute, kiểm tra user.role là admin và permission theo path. Menu admin trong permissions.ts gồm dashboard, contents, templates, public-site, generate options, models, users, notifications, contacts, plans, payments, permissions, audit logs, settings. Mỗi menu gắn icon Lucide và permission key.

Admin Dashboard hiển thị thống kê tổng quan. Admin Users quản lý tài khoản. Admin Contents quản lý nội dung đã tạo. Admin Templates quản lý template system. Admin Generate Options quản lý industries, copy-types, tones. Admin Plans và Payments quản lý gói và thanh toán. Admin Settings quản lý maintenance, registration, email verification. Admin Audit Logs xem lịch sử. Admin Permissions quản lý role và permission ở frontend.

### 4.1.5. Thiết kế trải nghiệm form và dữ liệu

Frontend chuẩn hóa dữ liệu backend thành UI model. Ví dụ contentService.normalizeContent chuyển outputText thành content, tính quality bằng scoreGeneratedContent, format ngày tiếng Việt, format model display name, tính word count nếu backend chưa trả. fineTuningService normalize status backend thành ready, training, failed, pending, format date, model label và registry model. plagiarismService normalize source, match, analysis và report, bổ sung default nếu backend thiếu field.

Điều này giúp component hiển thị dữ liệu ổn định, giảm lỗi do response thiếu field. Các request dài có timeout riêng: generate 120 giây, fine-tune job 300 giây, plagiarism 180 giây. Đây là chi tiết quan trọng vì các tác vụ AI, file hoặc web có thể lâu hơn request CRUD thông thường.

## 4.2. Xử lý nghiệp vụ hệ thống

### 4.2.1. Xử lý nghiệp vụ xác thực

authService xử lý đăng ký, đăng nhập user hoặc admin, refresh session, quên mật khẩu, verify OTP, verify email, resend verification, reset password, update avatar và update admin profile hoặc password. Password được hash bằng bcrypt trong pre-save hook của AccountUser hoặc AccountAdmin. OTP được generate, hash và lưu trong ForgotPassword hoặc EmailVerification. Khi gửi email thất bại, record OTP được đánh dấu usedAt để tránh mã không gửi được vẫn còn hiệu lực.

Frontend authStore gọi /auth/user hoặc /auth/admin, lưu user vào localStorage, hydrate bằng /me, hỗ trợ rememberLogin và logout local kể cả backend unreachable. Đây là cách thiết kế thực tế để UI không bị kẹt khi session hết hạn hoặc server lỗi.

### 4.2.2. Xử lý nghiệp vụ generate nội dung

Nghiệp vụ generate nằm trong contentService.generateContent. Service này là điểm hội tụ của nhiều module: generate options, project, billing, template, fine-tune, AI service, usage log và notification. Việc kiểm tra option active trước khi gọi AI giúp admin kiểm soát danh mục. Việc kiểm tra plan, model, quota giúp sản phẩm có mô hình trả phí. Việc lưu UsageLog giúp thống kê và quota. Việc tạo notification giúp người dùng biết nội dung đã sinh xong và cảnh báo quota thấp.

aiService xây prompt chi tiết theo type. Với headline, service yêu cầu headline, subheadline, benefit, CTA tùy length. Với description, yêu cầu mô tả ngắn, lợi ích, đặc điểm và CTA. Với social, yêu cầu hook, caption, CTA và hashtag. Với email, yêu cầu subject, preview text, lời chào, nội dung chính, CTA và P.S. Với landing, yêu cầu hero headline, subheadline, pain point, lợi ích, bằng chứng, offer và CTA. Với SEO, yêu cầu SEO title, meta description, slug, heading và mở bài. Với review, yêu cầu quote, người đánh giá, bối cảnh, kết quả và CTA mềm.

### 4.2.3. Xử lý nghiệp vụ project

projectService đảm bảo mỗi user không có project trùng tên. Khi list project, service aggregate Content để tính contentCount và completedCount. Từ đó trả completionPercent, inProgressCount và các alias field như contents, completedContents, progress để frontend dùng linh hoạt. Khi content chuyển project, contentService.updateContent reset isProjectCompleted nếu projectId thay đổi, tránh giữ trạng thái hoàn thành sai.

### 4.2.4. Xử lý nghiệp vụ template và generate options

Template có hai loại: system template và user template. Người dùng chỉ thấy template active, hoặc system, hoặc do chính họ tạo. Admin quản lý system template qua admin service. Template có variables để mô tả input cần điền, tuy nhiên generate hiện tại ghép systemPrompt và user prompt ở backend. usageCount giúp admin biết template nào được dùng nhiều.

GenerateOption quản lý ba group: industry, copy_type, tone. Service có default options bằng tiếng Việt cho ecommerce, realestate, technology, fnb, healthcare, education, finance, fashion, business, travel; copy type headline, description, social, email, cta, landing, seo, review; tone urgent, professional, friendly, luxury, humorous, emotional. Nếu DB chưa có options, service tự insert defaults.

### 4.2.5. Xử lý nghiệp vụ plagiarism

Plagiarism module gồm file upload, text extraction, candidate building, scoring, report. Validation yêu cầu text tối thiểu 20 ký tự nếu nhập trực tiếp, hoặc contentId. Upload sources tối đa 5 file nguồn, mỗi source có text tối thiểu 20 ký tự. Service dùng threshold mặc định 35 và sensitivity balanced. sensitivity có thể làm effectiveThreshold thay đổi: strict nhạy hơn, lenient ít nhạy hơn.

Điểm tốt của module này là báo cáo không chỉ có một số phần trăm. Nó lưu sources, matches, topicMatches, scoreBasis, exactMatchScore, phraseOverlapScore, wordOverlapScore, matchedWords, matchedPhrases và Common Crawl stats. Nhờ đó frontend có thể giải thích vì sao nội dung bị đánh dấu, nguồn nào giống, đoạn nào bị trùng, và mức độ trùng là exact, phrase hay word.

### 4.2.6. Xử lý nghiệp vụ fine-tuning

Fine-tuning module có nhiều bước kiểm tra để tránh tạo job không hợp lệ. Example phải có input và output, không quá ngắn, không quá dài và không chứa credential pattern. Dataset chỉ được edit khi chưa submitted. Job yêu cầu dataset có số valid examples tối thiểu. Plan phải có fineTuneModels lớn hơn 0. User không được vượt quota số model hoặc running job.

Khi job hoàn tất, hệ thống tạo FineTunedModel với alias, version, providerModelId, baseModel, industry, performance và deployedAt. Trước khi active model mới trong cùng industry, hệ thống deactivate các model active cũ của user và industry. Đây là cách giữ mỗi ngành có một model active chính, tránh người dùng chọn nhầm nhiều model cũ.

### 4.2.7. Xử lý nghiệp vụ billing

Billing module vừa quản lý plan vừa kiểm soát generate. Khi user generate, ensureGenerateModelAllowed lấy effective plan từ subscription hiện tại hoặc fallback free plan, sau đó kiểm tra model access id có trong allowedModels không. ensureGenerateQuotaAvailable tính usage trong tháng, 5 giờ và tuần, so với limits của plan. calculateGenerateQuotaUnits quy đổi token thành quota unit, tối thiểu 1.

Checkout xử lý nhiều trường hợp: plan free auto activate, VietQR tạo QR và pending, VNPAY hoặc ZaloPay redirect callback, manual pending. Khi activate payment, service tạo hoặc cập nhật subscription, set status active, periodStart, periodEnd, provider, providerSubscriptionId và payment status success. Đồng thời sync customerRole theo slug plan, giúp frontend permission thay đổi theo gói.

### 4.2.8. Xử lý nghiệp vụ admin và audit

Admin services cho phép quản lý dữ liệu với soft delete, restore, permanent delete ở nhiều module. AuditLog lưu actorId, actorType, actorEmail, actorRole, action, targetType, targetId, level, metadata và ip. Điều này quan trọng khi hệ thống có nhiều admin với role khác nhau. Settings service quản lý maintenance mode và quota reset, ảnh hưởng trực tiếp tới route user và billing usage.

### 4.2.9. Triển khai local và cấu hình

Frontend có script yarn dev để chạy Next.js dev server, yarn build để build frontend, yarn start để chạy Next.js production server sau build. Backend có script yarn dev để chạy nodemon src/server.js, yarn start để chạy node src/server.js, yarn seed để chạy node src/utils/seed.js.

Các biến môi trường quan trọng gồm: MONGODB_URI, PORT, FRONTEND_URL, JWT secret, email SMTP config, AI provider API keys, Google Cloud hoặc Vertex config, VNPAY config, ZaloPay config, VietQR config và public API URL hoặc ngrok cho callback. Khi chạy demo, cần seed dữ liệu để có tài khoản, project, content, template, plan và fine-tune sample.

# Chương 5. TỔNG KẾT

## 5.1. Kết quả đạt được

Đồ án đã xây dựng được một hệ thống full-stack tương đối đầy đủ cho bài toán AI Copywriter. Frontend có đủ public site, auth, customer portal và admin portal. Backend có REST API, xác thực JWT-cookie, validation Joi, database MongoDB Mongoose, service layer và middleware. Các module chính như generate nội dung, content management, project, template, generate option, plagiarism, fine-tuning, billing, notification, public site, contact, settings và audit log đều có code hiện hữu.

Về AI generation, hệ thống có khả năng điều phối nhiều provider hoặc model, tạo prompt theo loại nội dung, hỗ trợ length, variations, template, fine-tuned model và fallback. Về dữ liệu, nội dung sinh ra được lưu với prompt, output, model, tags, project, wordCount và usage token. Về vận hành, admin có thể quản lý nhiều nhóm dữ liệu, cấu hình hệ thống và theo dõi giao dịch.

Về fine-tuning, hệ thống có thiết kế khá hoàn chỉnh: dataset, example, validation, job, metric, log, provider, registry model, active model và quota theo plan. Về plagiarism, hệ thống có thuật toán kiểm tra local kết hợp database, reference, upload, web, tạo báo cáo chi tiết. Về billing, hệ thống có plan, subscription, payment, usage, allowedModels, quota và thanh toán Việt Nam.

## 5.2. Ưu điểm của hệ thống

Ưu điểm lớn nhất là kiến trúc module rõ ràng và có chiều sâu nghiệp vụ. Hệ thống không chỉ là một giao diện gọi AI, mà đã có các phần cần thiết của sản phẩm SaaS: account, role, plan, quota, billing, dashboard, admin, notification, audit, public site và settings. Điều này giúp đồ án có tính thực tế và dễ mở rộng hơn.

Ưu điểm thứ hai là khả năng tích hợp đa mô hình. aiService không phụ thuộc một provider duy nhất. Hệ thống có thể chọn Gemini, Llama qua Groq, Vertex, OpenAI-compatible, OpenRouter, Claude hoặc FreeGPT4 tùy cấu hình. Điều này giúp giảm rủi ro vendor lock-in và tạo nền tảng để thử nghiệm chất lượng model.

Ưu điểm thứ ba là fine-tuning và plagiarism được thiết kế thành module riêng, có database model và API rõ. Hai module này làm tăng giá trị đồ án vì chúng giải quyết hai nhu cầu quan trọng: cá nhân hóa phong cách và kiểm soát trùng lặp. Fine-tuning có quản lý vòng đời job, còn plagiarism có báo cáo chi tiết thay vì chỉ trả một số điểm.

Ưu điểm thứ tư là backend có nhiều cơ chế an toàn: bcrypt, JWT, cookie, Helmet, CORS, Joi, rate limiter, TTL OTP, soft delete, quota, role permission và error handler. Các tài nguyên user-owned đều lọc theo userId. Các module payment có verify chữ ký hoặc MAC và kiểm tra amount.

Ưu điểm thứ năm là frontend có cấu trúc phù hợp project lớn: route rõ ràng, service layer, React Query hooks, Zustand auth store, permission route guard, component UI tái sử dụng và normalize dữ liệu từ backend. Điều này giúp giao diện dễ phát triển tiếp.

## 5.3. Hạn chế

Hạn chế thứ nhất là một số chức năng phụ thuộc cấu hình bên ngoài. Nếu không có API key hoặc cloud project, các provider AI, fine-tuning, payment có thể không hoạt động đầy đủ. Điều này bình thường với hệ thống tích hợp dịch vụ, nhưng khi demo cần chuẩn bị kỹ env, tài khoản cloud, callback URL và seed data.

Hạn chế thứ hai là plagiarism hiện tại chủ yếu dựa trên thuật toán local exact, n-gram và word overlap. Cách này phù hợp đồ án và có thể giải thích được, nhưng chưa tương đương các hệ thống thương mại có kho dữ liệu lớn, embedding semantic search sâu, crawler riêng và dữ liệu học thuật. Với nội dung paraphrase mạnh, thuật toán word hoặc phrase overlap có thể bỏ sót hoặc chỉ đánh dấu topic similarity.

Hạn chế thứ ba là fine-tuning thực tế phụ thuộc provider, chi phí và quyền truy cập. Một số provider có thể yêu cầu Google Cloud project, bucket, location, endpoint hoặc API key. Nếu thiếu cấu hình, hệ thống sẽ báo lỗi hoặc không submit job. Việc huấn luyện model thật cũng có thời gian chờ và chi phí, nên demo cần dùng dataset hoặc job mẫu hoặc provider đã chuẩn bị.

Hạn chế thứ tư là một số file README hoặc documentation hiển thị lỗi encoding tiếng Việt khi đọc bằng môi trường hiện tại. Source code vẫn có thể chạy, nhưng tài liệu dự án nên được chuẩn hóa UTF-8 để nộp báo cáo và bảo trì lâu dài.

Hạn chế thứ năm là frontend permission hiện có phần lưu cấu hình role và permission bằng localStorage cho UI. Điều này tiện cho demo, nhưng trong production nên đồng bộ permission từ backend hoặc database để tránh người dùng tự sửa localStorage làm thay đổi UI. Dù backend vẫn bảo vệ route theo accountType, permission chi tiết nên được enforce ở server nếu hệ thống cần bảo mật nghiêm ngặt.

## 5.4. Hướng phát triển

Hướng phát triển đầu tiên là hoàn thiện streaming real-time cho generate bằng Server-Sent Events hoặc WebSocket. README có nhắc SSE, và đây là tính năng phù hợp với AI generation vì người dùng có thể thấy nội dung xuất hiện dần thay vì chờ toàn bộ response.

Hướng phát triển thứ hai là nâng cấp plagiarism bằng embedding hoặc vector search. Hệ thống có thể tạo embedding cho Content và uploaded/reference sources, lưu vào vector database hoặc MongoDB vector search, sau đó kết hợp semantic similarity với n-gram overlap. Điều này giúp phát hiện paraphrase tốt hơn.

Hướng phát triển thứ ba là hoàn thiện RAG từ tài liệu doanh nghiệp. Người dùng có thể upload brand guideline, product catalog, FAQ hoặc case study, hệ thống trích xuất text, chunk, embedding, tìm context liên quan và đưa vào prompt generate. Điều này giúp nội dung chính xác hơn với dữ liệu riêng.

Hướng phát triển thứ tư là nâng cấp export và workflow biên tập: export PDF hoặc DOCX, version history chi tiết, comment, review, collaborative workspace, approval flow cho team marketing, lịch đăng bài và tích hợp kênh social hoặc email.

Hướng phát triển thứ năm là production hóa billing và bảo mật: webhook payment đầy đủ, reconciliation giao dịch, invoice PDF, email receipt, backend-enforced permission, refresh token rotation, CSRF protection nếu cần, audit log đầy đủ cho mọi thao tác admin.

Hướng phát triển thứ sáu là CI/CD và test tự động. Project có một số regression script cho plagiarism và billing, nhưng có thể bổ sung unit test cho service, integration test cho API, Playwright test cho frontend, lint/format, Docker Compose với MongoDB và pipeline deploy.

## 5.5. Nguồn kỹ thuật và khảo sát

Nguồn khảo sát chính là mã nguồn project hiện tại trong workspace. Các file hoặc nhóm file quan trọng đã được dùng để lập báo cáo gồm:

- README.md: kế hoạch đồ án, công nghệ, module và tiến độ ban đầu.
- frontend/USE_CASES.md: actor, use case tổng quan, use case khách hàng, use case admin và mapping route.
- frontend/package.json: công nghệ frontend thực tế.
- backend/package.json: công nghệ backend thực tế.
- backend/src/app.js: cấu hình middleware và mount route.
- backend/src/server.js: connect database, listen port và graceful shutdown.
- backend/src/routes: danh sách endpoint user và admin.
- backend/src/controllers: controller cho từng module.
- backend/src/services: nghiệp vụ auth, content, AI, plagiarism, fine-tune, billing, payment gateway, template, project, notification, settings, admin.
- backend/src/models: schema MongoDB hoặc Mongoose.
- backend/src/validations: Joi schema cho auth, content, plagiarism, fine-tune, billing, admin.
- frontend/src/app: route public, customer, admin.
- frontend/src/services: service gọi API và normalize dữ liệu.
- frontend/src/stores/authStore.ts: state xác thực frontend.
- frontend/src/lib/permissions.ts: role, permission, frontend guard.
- backend/src/utils/seed.js: dữ liệu demo cho user, admin, project, content, template, plan, payment, fine-tune.

# TÀI LIỆU THAM KHẢO

1. Next.js Documentation: https://nextjs.org/docs
2. React Documentation: https://react.dev/
3. Express.js Documentation: https://expressjs.com/
4. MongoDB Documentation: https://www.mongodb.com/docs/
5. Mongoose Documentation: https://mongoosejs.com/docs/
6. Joi Documentation: https://joi.dev/api/
7. JSON Web Token Introduction: https://jwt.io/introduction
8. Google Gemini API Documentation: https://ai.google.dev/gemini-api/docs
9. Google Cloud Vertex AI Documentation: https://cloud.google.com/vertex-ai/generative-ai/docs
10. TanStack Query Documentation: https://tanstack.com/query/latest/docs/framework/react/overview
11. VNPAY Developer Documentation: https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html
12. ZaloPay Developer Documentation: https://docs.zalopay.vn/

# PHỤ LỤC A. MAPPING ROUTE THEO PROJECT HIỆN TẠI

| Nhóm route | Frontend route | Backend API liên quan | Mục đích |
|---|---|---|---|
| Public | /, /about, /pricing, /blog, /contact | /api/public-site, /api/contact-submissions | Trang công khai và liên hệ |
| Auth user | /login, /register, /forgot-password, /reset-password | /api/auth/user | Xác thực khách hàng |
| Auth admin | /admin/login, /admin/forgot-password | /api/auth/admin | Xác thực admin |
| Dashboard | /dashboard | /api/contents, /api/billing, /api/notifications | Tổng quan tài khoản |
| Generate | /generate | /api/contents/generate, /api/generate-options, /api/fine-tune/models | Sinh nội dung AI |
| Contents | /contents, /contents/[id] | /api/contents | Quản lý nội dung |
| Projects | /projects, /projects/[id] | /api/projects | Quản lý dự án |
| Templates | /templates | /api/templates | Thư viện template user system |
| Fine-tune | /fine-tune | /api/fine-tune | Dataset, job, metric, model registry |
| Plagiarism | /plagiarism-check | /api/plagiarism | Kiểm tra đạo văn và lịch sử báo cáo |
| Billing | /billing, /pricing | /api/billing | Plan, subscription, checkout, payment result |
| Notifications | /notifications | /api/notifications | Trung tâm thông báo user |
| Admin dashboard | /admin | /api/admin/stats | Thống kê quản trị |
| Admin users | /admin/users | /api/admin/users | Quản lý user admin account |
| Admin content template | /admin/contents, /admin/templates | /api/admin/contents, /api/admin/templates | Quản lý nội dung và template |
| Admin generate options | /admin/generate-options | /api/admin/generate-options | Quản lý ngành, type, tone |
| Admin finance | /admin/plans, /admin/payments | /api/admin/plans, /api/admin/payments | Quản lý plan, payment, revenue |
| Admin system | /admin/settings, /admin/audit-logs, /admin/permissions | /api/admin/settings, /api/admin/audit-logs | Cài đặt, audit, phân quyền UI |

# PHỤ LỤC B. DANH SÁCH API CHÍNH

## User API

- POST /api/auth/user/register: đăng ký user.
- POST /api/auth/user/login: đăng nhập user.
- GET /api/auth/user/me: lấy user hiện tại.
- PATCH /api/auth/user/session: cập nhật session preference.
- POST /api/auth/user/logout: đăng xuất.
- POST /api/auth/user/forgot-password: gửi OTP reset password.
- POST /api/auth/user/verify-otp: kiểm tra OTP.
- POST /api/auth/user/reset-password: đặt lại mật khẩu.
- POST /api/auth/user/verify-email: xác minh email.
- POST /api/auth/user/resend-verification: gửi lại OTP xác minh.
- GET /api/contents: danh sách content.
- POST /api/contents/generate: tạo nội dung AI.
- POST /api/contents: tạo content thủ công.
- GET /api/contents/:id: chi tiết content.
- PATCH /api/contents/:id: cập nhật content.
- DELETE /api/contents/:id: soft delete content.
- PATCH /api/contents/:id/restore: khôi phục content.
- DELETE /api/contents/:id/permanent: xóa vĩnh viễn.
- GET /api/projects: danh sách project.
- POST /api/projects: tạo project.
- GET /api/projects/:id: chi tiết project.
- PATCH /api/projects/:id: cập nhật project.
- GET /api/templates: danh sách template được phép dùng.
- POST /api/templates: tạo template cá nhân.
- GET /api/generate-options: lấy industries, copyTypes, tones active.
- GET /api/fine-tune/providers: danh sách provider fine-tune.
- GET /api/fine-tune/quotas: quota fine-tune.
- GET /api/fine-tune/datasets: danh sách dataset.
- POST /api/fine-tune/datasets: tạo dataset.
- POST /api/fine-tune/datasets/:id/examples: thêm ví dụ.
- POST /api/fine-tune/datasets/:id/validate: validate dataset.
- GET /api/fine-tune/jobs: danh sách job.
- POST /api/fine-tune/jobs: tạo job.
- POST /api/fine-tune/jobs/:id/cancel: hủy job.
- GET /api/fine-tune/jobs/:id/metrics: metric job.
- GET /api/fine-tune/jobs/:id/logs: log job.
- GET /api/fine-tune/models: danh sách fine-tuned model registry.
- POST /api/plagiarism/check: kiểm tra đạo văn từ text hoặc content.
- POST /api/plagiarism/check-files: kiểm tra đạo văn có upload file.
- POST /api/plagiarism/extract-text: trích text từ file.
- GET /api/plagiarism/history: lịch sử báo cáo.
- GET /api/plagiarism/:id: chi tiết báo cáo.
- GET /api/billing/plans: danh sách plan.
- GET /api/billing/me: billing hiện tại.
- POST /api/billing/checkout: checkout.
- GET /api/billing/vnpay/return: VNPAY return.
- GET /api/billing/vnpay/ipn: VNPAY IPN.
- GET /api/billing/zalopay/return: ZaloPay return.
- POST /api/billing/zalopay/callback: ZaloPay callback.

## Admin API

- POST /api/auth/admin/login: đăng nhập admin.
- GET /api/auth/admin/me: admin hiện tại.
- PATCH /api/auth/admin/me: cập nhật profile admin.
- PATCH /api/auth/admin/me/password: đổi mật khẩu admin.
- GET /api/admin/stats: thống kê dashboard.
- GET /api/admin/users: danh sách user hoặc admin.
- POST /api/admin/users: tạo tài khoản.
- PATCH /api/admin/users/:accountType/:id: cập nhật tài khoản.
- DELETE /api/admin/users/:accountType/:id: soft delete tài khoản.
- GET /api/admin/contents: danh sách content toàn hệ thống.
- PATCH /api/admin/contents/:id: cập nhật content.
- DELETE /api/admin/contents/:id: soft delete content.
- GET /api/admin/templates: danh sách template admin.
- POST /api/admin/templates: tạo template system.
- PATCH /api/admin/templates/:id: cập nhật template.
- DELETE /api/admin/templates/:id: archive template.
- GET /api/admin/generate-options/:group: danh sách option theo group.
- POST /api/admin/generate-options/:group: tạo option.
- PATCH /api/admin/generate-options/:group/:id: cập nhật option.
- DELETE /api/admin/generate-options/:group/:id: soft delete option.
- GET /api/admin/plans: danh sách plan.
- POST /api/admin/plans: tạo plan.
- PATCH /api/admin/plans/:id: cập nhật plan.
- DELETE /api/admin/plans/:id: soft delete plan.
- GET /api/admin/payments: danh sách giao dịch.
- GET /api/admin/payments/revenue: dữ liệu doanh thu.
- PATCH /api/admin/payments/:id/confirm: xác nhận VietQR.
- GET /api/admin/settings/system: lấy system settings.
- PATCH /api/admin/settings/system: cập nhật system settings.
- GET /api/admin/audit-logs: danh sách audit log.
- POST /api/admin/notifications/send: gửi thông báo.
- GET /api/admin/contact-submissions: quản lý liên hệ.
- GET /api/admin/public-site: quản lý trang public, blog, settings.

# PHỤ LỤC C. DỮ LIỆU DEMO TỪ SEED SCRIPT

Seed script tạo dữ liệu demo để phục vụ kiểm thử và trình bày đồ án. Tài khoản demo gồm customer customer@copypro.vn với mật khẩu customer123 và admin admin@copypro.vn với mật khẩu admin123. Admin demo có role super_admin. Seed cũng tạo nhiều project mẫu như Campaign Hè 2026, Ra mắt SaaS OmniCRM, The Grand Riverside Q2, Khóa học AI Copywriting, Menu mùa hè Nhà Bếp Lá và Serum Trà Xanh An Nhiên.

Nội dung demo gồm nhiều loại copy như Facebook Ad, Landing Page, Email, SEO Content, social caption và nội dung theo ngành. Template demo gồm nhiều prompt chuyên nghiệp như TikTok hook, launch post sản phẩm mới, email bỏ giỏ hàng, email nuôi dưỡng lead B2B, Google Search Ads, Facebook Lead Ads bất động sản, landing page SaaS B2B, landing page khóa học, bộ CTA chuyển đổi, testimonial, case study B2B, copy y tế an toàn, copy tài chính có disclaimer và copy tour du lịch.

Seed fine-tune tạo các pipeline demo như E-commerce Brand Voice Dataset, Luxury Real Estate Dataset, Healthcare Compassionate Dataset và FNB Promotion Dataset. Các dataset có ví dụ input output, status submitted, qualityScore, job completed, running hoặc queued và thông tin accuracy, loss. Điều này giúp màn hình fine-tune có dữ liệu để hiển thị ngay cả khi chưa kết nối provider thật.

# PHỤ LỤC D. NHẬN XÉT VỀ MỨC ĐỘ HOÀN THIỆN HIỆN TẠI

Project hiện tại đã vượt mức giao diện tĩnh vì backend có nhiều model, service và route thật. Các module CRUD, auth, billing, plagiarism, fine-tune đều có logic cụ thể. Frontend cũng đã chuyển sang Next.js App Router, dùng service layer và route guard. Vì vậy, khi viết báo cáo nên mô tả đồ án như một hệ thống full-stack đang có backend thật, không nên chỉ ghi là mock UI.

Tuy nhiên, khi bảo vệ hoặc demo, cần chuẩn bị môi trường kỹ: MongoDB URI, seed data, frontend API base URL, backend port, JWT secret, SMTP nếu demo OTP, AI provider key nếu demo generate thật, và payment config nếu demo gateway. Nếu không có provider AI, nên giải thích rõ cơ chế fallback hoặc dùng dữ liệu demo đã seed.
