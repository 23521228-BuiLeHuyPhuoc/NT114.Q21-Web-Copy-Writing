# TÓM TẮT ĐỒ ÁN

CopyPro - AI Copywriter là đồ án xây dựng một website hỗ trợ tạo nội dung marketing bằng mô hình ngôn ngữ lớn. Nếu nhìn ở mức người dùng, hệ thống cho phép nhập brief sản phẩm, chọn ngành nghề, loại nội dung, giọng văn, độ dài, ngôn ngữ, model AI và nhận lại các bản copy như headline quảng cáo, mô tả sản phẩm, nội dung mạng xã hội, email marketing, CTA, landing page hoặc nội dung SEO. Nếu nhìn ở mức kỹ thuật, đây là một project full-stack gồm frontend Next.js, backend Express.js và cơ sở dữ liệu MongoDB, có thêm các phần vận hành thường gặp trong một sản phẩm SaaS như tài khoản, phân quyền, quota, billing, thông báo, audit log và trang quản trị.

Điểm đáng chú ý của project là phần generate nội dung không đứng riêng lẻ. Nội dung sau khi sinh có thể được lưu vào collection Content, đưa vào Project, dùng lại Template, gắn tag, đánh dấu yêu thích, khôi phục sau khi xóa mềm và quản lý theo tài khoản. Điều này làm cho hệ thống giống một công cụ làm việc hơn là một trang demo gọi API AI. Trong mã nguồn backend, hướng tổ chức route - controller - service - model được dùng khá rõ: routes khai báo endpoint, controllers nhận request, services xử lý nghiệp vụ, models định nghĩa schema Mongoose, validations kiểm soát dữ liệu đầu vào bằng Joi.

Frontend nằm trong thư mục frontend, sử dụng Next.js 14, React 18, TypeScript, Tailwind CSS, Radix UI, Material UI, React Query, Axios, Zustand và Chart.js. Cấu trúc route thể hiện ba khu vực chính: public site, customer portal và admin portal. Người chưa đăng nhập có thể xem landing page, pricing, blog, about và contact. Người dùng đã đăng nhập có dashboard, generate, contents, projects, templates, fine-tune, plagiarism-check, billing, profile và notifications. Admin có dashboard riêng cùng các màn hình quản lý users, contents, templates, generate options, plans, payments, settings, audit logs, permissions, public site và contacts.

Backend nằm trong thư mục backend, sử dụng Node.js, Express.js, MongoDB/Mongoose, JWT, bcrypt, cookie-parser, Helmet, CORS, express-rate-limit, Multer, Nodemailer, pdf-parse và mammoth. File backend/src/app.js cho thấy các nhóm API chính được mount theo /api/auth, /api/contents, /api/projects, /api/templates, /api/fine-tune, /api/plagiarism, /api/billing, /api/admin và /api/public-site. File backend/src/config/generatorModels.js thể hiện danh sách model sinh nội dung như gemini-flash, gemini-flash-lite, groq-llama-3-3-70b, groq-llama-3-1-8b, gemini-3-flash-preview, gemma-4-26b, freegpt4-gpt-4, freegpt4-gpt-4o và nhóm fine-tuned.

Ngoài chức năng generate, đồ án còn có hai phần làm tăng độ sâu kỹ thuật. Phần fine-tune quản lý dataset, example, job, metric, log và fine-tuned model registry. Phần plagiarism kiểm tra trùng lặp từ nội dung nhập trực tiếp, content đã lưu hoặc file upload, có xử lý trích xuất văn bản từ PDF/DOCX và sinh báo cáo similarity. Billing quản lý gói Free, Pro, Business, quota theo tháng, quota năm giờ, weekly quota, fine-tune model, plagiarism check, payment manual, VietQR, VNPAY và ZaloPay. Các phần này cho thấy project không chỉ tập trung vào giao diện, mà đã có backend nghiệp vụ tương đối rõ.

Báo cáo này trình bày đồ án theo năm chương. Chương 1 nêu lý do chọn đề tài, mục tiêu, phạm vi, đối tượng sử dụng và kết quả mong đợi. Chương 2 trình bày cơ sở lý thuyết, trong đó phần mô hình được xác định là Transformer và Large Language Model, cùng các công nghệ được dùng trong project. Chương 3 phân tích yêu cầu, use case, kiến trúc, luồng xử lý và cơ sở dữ liệu. Chương 4 mô tả việc xây dựng giao diện và xử lý nghiệp vụ. Chương 5 tổng kết kết quả, ưu điểm, hạn chế và hướng phát triển.

# Chương 1. GIỚI THIỆU ĐỀ TÀI

## 1.1. Tên đề tài

Tên đề tài: Xây dựng website AI Copywriter hỗ trợ tạo nội dung marketing bằng mô hình ngôn ngữ lớn.

Tên sản phẩm trong project: CopyPro - AI Copywriter.

Tên repository: NT114.Q21-Web-Copy-Writing.

Có thể mô tả ngắn gọn đề tài như sau: CopyPro là một hệ thống web cho phép người dùng tạo, lưu, quản lý và kiểm tra nội dung marketing sinh bởi AI. Project không dừng ở màn hình nhập prompt và nhận kết quả, mà xây thêm các phần cần thiết cho một ứng dụng có người dùng thật: đăng ký, đăng nhập, phân quyền, quản lý nội dung, dự án, template, kiểm tra đạo văn, fine-tuning, billing, thông báo và trang admin.

## 1.2. Lý do chọn đề tài

Trong môi trường kinh doanh hiện nay, nhu cầu viết nội dung xuất hiện gần như mỗi ngày. Một sản phẩm mới cần mô tả ngắn cho website, bài đăng mạng xã hội, email giới thiệu, tiêu đề quảng cáo, landing page và nội dung SEO. Với doanh nghiệp nhỏ hoặc cá nhân bán hàng, việc thuê copywriter chuyên nghiệp cho mọi nội dung không phải lúc nào cũng khả thi. Với đội marketing, vấn đề thường gặp lại là tốc độ: cần nhiều phiên bản nội dung để thử nghiệm, nhưng thời gian lên ý tưởng và chỉnh sửa luôn có hạn.

Mô hình ngôn ngữ lớn mở ra một hướng xử lý thực tế hơn. Người dùng có thể cung cấp brief, ngành nghề, khách hàng mục tiêu, lợi ích sản phẩm và tone mong muốn; hệ thống sẽ sinh ra bản nháp có cấu trúc để người dùng chỉnh sửa tiếp. Cách làm này không thay thế hoàn toàn người viết, nhưng rút ngắn giai đoạn khởi tạo ý tưởng, giúp người không chuyên có bản nháp dễ dùng hơn và giúp marketer thử nhiều góc truyền thông trong thời gian ngắn.

Đề tài này được chọn vì phù hợp với cả nhu cầu ứng dụng và yêu cầu kỹ thuật của một đồ án web. Về ứng dụng, AI Copywriter là bài toán dễ hiểu, có ngữ cảnh sử dụng rõ, có thể demo trực quan. Về kỹ thuật, project buộc phải kết hợp nhiều mảng: frontend hiện đại, REST API, cơ sở dữ liệu, xác thực, phân quyền, upload file, gọi dịch vụ AI, kiểm soát quota, xử lý thanh toán và thiết kế dashboard admin. Đây là phạm vi vừa đủ rộng để thể hiện năng lực xây dựng hệ thống, nhưng vẫn có trọng tâm rõ là tạo và quản lý nội dung marketing.

Một lý do khác là hệ thống AI nếu làm đơn giản sẽ rất dễ trở thành một form gọi API. Project hiện tại cố gắng giải quyết điểm yếu đó bằng cách đặt AI generation vào một quy trình làm việc có lưu trữ, dự án, template, quota, fine-tune và plagiarism. Nhờ vậy báo cáo có thể phân tích được cả mặt nghiệp vụ lẫn mặt kiến trúc, thay vì chỉ trình bày giao diện.

## 1.3. Mục tiêu của đề tài

Mục tiêu tổng quát của đề tài là xây dựng một website AI Copywriter có thể sử dụng như một công cụ hỗ trợ tạo nội dung marketing. Người dùng có thể đăng ký tài khoản, chọn loại nội dung cần viết, sinh nội dung bằng AI, lưu lại kết quả, quản lý nội dung theo dự án, kiểm tra trùng lặp và theo dõi hạn mức sử dụng theo gói dịch vụ.

Các mục tiêu cụ thể gồm:

- Xây dựng public site để giới thiệu sản phẩm, hiển thị trang chủ, pricing, blog, about và contact.
- Xây dựng hệ thống xác thực cho user và admin, bao gồm đăng ký, đăng nhập, đăng xuất, quên mật khẩu, OTP, reset password, xác minh email và cập nhật hồ sơ.
- Xây dựng màn hình generate cho phép chọn ngành nghề, copy type, tone, độ dài, ngôn ngữ, số phiên bản, model AI, template và project.
- Tích hợp backend sinh nội dung, chuẩn hóa request, gọi AI provider, lưu Content và ghi nhận usage.
- Xây dựng chức năng quản lý content: xem danh sách, xem chi tiết, chỉnh sửa, xóa mềm, khôi phục, xóa vĩnh viễn, lọc, tìm kiếm, gắn tag và đánh dấu yêu thích.
- Xây dựng project management để gom các nội dung cùng chiến dịch hoặc cùng khách hàng.
- Xây dựng template library để tái sử dụng prompt có cấu trúc, bao gồm template hệ thống và template cá nhân.
- Xây dựng generate options để admin quản lý ngành nghề, loại nội dung và tone hiển thị trên màn hình generate.
- Xây dựng plagiarism checker có thể kiểm tra text, content đã lưu hoặc file upload.
- Xây dựng fine-tuning studio để quản lý dataset, example, job, metric, log và fine-tuned model.
- Xây dựng billing để quản lý plan, subscription, payment, quota và quyền truy cập model theo gói.
- Xây dựng admin portal để quản lý user, content, template, option, plan, payment, notification, setting, audit log và public site.
- Tổ chức backend theo nhiều lớp, có validation, middleware bảo mật, error handler và service layer để thuận tiện mở rộng.

## 1.4. Phạm vi của đề tài

Phạm vi chức năng của đồ án gồm ba vùng chính. Vùng public dành cho người chưa đăng nhập, gồm landing page, pricing, about, blog và contact. Vùng customer dành cho người dùng đã đăng nhập, gồm dashboard, generate, contents, projects, templates, fine-tune, plagiarism-check, billing, profile và notifications. Vùng admin dành cho người quản trị, gồm dashboard và các màn hình quản lý dữ liệu hệ thống.

Phạm vi backend gồm REST API, xác thực, phân quyền, xử lý dữ liệu MongoDB, gọi AI provider, xử lý file upload, gửi email, tính quota, tạo thanh toán, xác minh callback thanh toán, ghi audit log và sinh báo cáo đạo văn. Backend không tự huấn luyện mô hình deep learning từ đầu. Các model AI được sử dụng thông qua provider hoặc endpoint có sẵn. Phần fine-tuning trong project tập trung vào quản lý dataset, job và registry model, sau đó gửi yêu cầu đến provider khi có đủ cấu hình.

Phạm vi dữ liệu gồm các collection chính như AccountUser, AccountAdmin, Content, Project, Template, GenerateOption, Plan, Subscription, Payment, UsageLog, Notification, AuditLog, SystemSetting, PublicPage, ContactSubmission, ApiKey, FineTuneDataset, FineTuneExample, FineTuneJob, FineTuneMetric, FineTunedModel, PlagiarismReport, ForgotPassword và EmailVerification.

Phạm vi triển khai hiện tại là môi trường local/dev. Frontend chạy bằng next dev, backend chạy bằng nodemon src/server.js hoặc node src/server.js, database dùng MongoDB qua biến môi trường MONGODB_URI. Một số luồng phụ thuộc cấu hình bên ngoài như Gemini, Groq, Vertex, OpenRouter, OpenAI-compatible API, email SMTP, VNPAY, ZaloPay và VietQR. Vì vậy khi demo cần chuẩn bị env đầy đủ hoặc dùng dữ liệu seed để trình bày luồng nghiệp vụ.

## 1.5. Đối tượng sử dụng

Khách truy cập là người chưa đăng nhập. Họ có thể xem trang chủ, bảng giá, blog, thông tin giới thiệu, form liên hệ, đăng ký tài khoản, đăng nhập và dùng các luồng quên mật khẩu.

Khách hàng là người dùng đã đăng nhập với vai trò customer. Đây là nhóm sử dụng chính của hệ thống. Họ tạo nội dung AI, quản lý content, tạo project, dùng template, kiểm tra đạo văn, quản lý fine-tune, theo dõi billing và nhận thông báo.

Admin là người vận hành hệ thống. Tùy role, admin có thể xem dashboard, quản lý user, content, template, generate option, plan, payment, notification, contact, public site, system setting và audit log. Trong project có các vai trò như super_admin, content_manager, user_manager, finance_manager, ai_engineer và analyst.

Super admin là admin có toàn quyền. Ở frontend, super_admin được mặc định có toàn bộ permission. Đây là vai trò dùng để cấu hình hệ thống, xử lý các thao tác nhạy cảm và kiểm tra toàn bộ portal quản trị.

Dịch vụ AI và cổng thanh toán là các tác nhân bên ngoài. Dịch vụ AI phục vụ sinh nội dung hoặc fine-tune. Cổng thanh toán xử lý checkout và callback giao dịch. Trong project hiện tại có logic cho manual payment, VietQR, VNPAY và ZaloPay.

## 1.6. Phương pháp thực hiện

Đồ án được thực hiện theo hướng đi từ yêu cầu đến mã nguồn. Trước hết, chức năng được phân tích theo nhóm người dùng: guest, customer, admin, super admin, AI service và payment gateway. Từ các nhóm này xác định use case và route tương ứng. Tài liệu frontend/USE_CASES.md là nguồn quan trọng để đối chiếu actor, màn hình và luồng sử dụng.

Tiếp theo, hệ thống được chia thành frontend, backend và database. Frontend dùng Next.js App Router, mỗi route có page wrapper và component màn hình riêng. Các thao tác gọi API không viết trực tiếp rải rác trong component, mà được gom qua service layer và hook, kết hợp React Query để quản lý trạng thái request. Backend được chia thành routes, controllers, services, models, validations và middlewares. Đây là cách tổ chức dễ đọc với project nhiều module.

Về triển khai, từng module được xây theo chiều dọc: model dữ liệu, validation, service, controller, route, sau đó kết nối frontend. Ví dụ với nội dung AI, backend có Content model, contentValidation, contentService, contentController, contentRoutes; frontend có màn hình generate, components generator, content service và trang contents. Cách làm này giúp mỗi chức năng có đường đi rõ từ giao diện đến database.

Sau khi có chức năng chính, project bổ sung các phần vận hành: plan, quota, payment, notification, audit log, settings và public site management. Cuối cùng, seed script được dùng để tạo dữ liệu demo như tài khoản customer, admin, project mẫu, content mẫu, template, plan, payment và fine-tune dataset. Dữ liệu seed giúp demo ổn định hơn khi chưa kết nối đầy đủ các provider thật.

## 1.7. Kết quả mong đợi

Kết quả mong đợi là một website full-stack có thể demo được các luồng chính của một sản phẩm AI Copywriter. Người dùng có thể đăng ký, đăng nhập, tạo nội dung, lưu và quản lý kết quả, đưa nội dung vào project, dùng template, kiểm tra đạo văn, xem billing và nhận thông báo. Admin có thể theo dõi thống kê và quản lý dữ liệu hệ thống.

Về kỹ thuật, project cần thể hiện được cách tổ chức code có lớp, không trộn toàn bộ nghiệp vụ vào route hoặc component. Backend cần có middleware bảo mật cơ bản, validation, error handler và schema rõ. Frontend cần có route guard, auth store, service layer, UI nhất quán và các màn hình đủ cho luồng sử dụng.

Về báo cáo, tài liệu cần trình bày được không chỉ “có những chức năng nào”, mà còn “chức năng đó được đặt ở đâu trong kiến trúc, dùng công nghệ gì, dữ liệu lưu ra sao, luồng xử lý như thế nào và còn hạn chế gì”. Đây là tiêu chí quan trọng để báo cáo không bị chung chung.

# Chương 2. CƠ SỞ LÝ THUYẾT VÀ CÔNG NGHỆ SỬ DỤNG

## 2.1. Cơ sở lý thuyết

### 2.1.1. Mô hình Transformer và Large Language Model

Phần mô hình trong đề tài nên xác định là mô hình Transformer và Large Language Model (LLM). Đây là nền tảng phù hợp nhất với project vì chức năng trọng tâm là sinh văn bản marketing. LLM là mô hình học từ lượng lớn dữ liệu văn bản để dự đoán và sinh chuỗi token tiếp theo dựa trên ngữ cảnh đầu vào. Khi người dùng nhập brief, chọn ngành nghề, tone và loại nội dung, backend sẽ chuyển các thông tin đó thành prompt có cấu trúc rồi gửi đến model. Kết quả trả về được chuẩn hóa và lưu thành Content.

Transformer là kiến trúc quan trọng đứng sau nhiều LLM hiện đại. Điểm chính của Transformer là cơ chế self-attention. Thay vì xử lý từng từ hoàn toàn tuần tự, self-attention cho phép mô hình xem xét quan hệ giữa nhiều token trong cùng ngữ cảnh. Với copywriting, điều này giúp model giữ được mối liên hệ giữa sản phẩm, khách hàng mục tiêu, lợi ích, tone và yêu cầu định dạng. Ví dụ, nếu prompt yêu cầu viết email marketing cho sản phẩm SaaS B2B với giọng chuyên nghiệp, model cần liên kết đúng đối tượng, kênh nội dung và phong cách viết.

Trong project CopyPro, nhóm không tự xây Transformer từ đầu. Hướng đi thực tế hơn là tích hợp các model đã có qua provider. File generatorModels.js thể hiện các model sinh nội dung như gemini-flash, gemini-flash-lite, groq-llama-3-3-70b, groq-llama-3-1-8b, gemini-3-flash-preview, gemma-4-26b, freegpt4-gpt-4 và freegpt4-gpt-4o. Ngoài ra còn có nhóm fine-tuned model để người dùng chọn model đã được tùy chỉnh theo dataset riêng.

Prompt engineering là phần đi cùng LLM trong đồ án. Một prompt tốt không chỉ là câu hỏi tự do, mà nên có dữ liệu đầu vào rõ: tên sản phẩm, mô tả, ngành nghề, khách hàng mục tiêu, lợi ích, tone, độ dài, ngôn ngữ, loại nội dung và số phiên bản. Backend cần biến các trường này thành prompt ổn định để model trả kết quả gần đúng yêu cầu hơn. Template trong project phục vụ mục tiêu này: người dùng hoặc admin có thể chuẩn hóa cấu trúc prompt cho các trường hợp thường dùng.

Fine-tuning trong đồ án được hiểu là quá trình dùng dữ liệu mẫu để điều chỉnh hoặc đăng ký một model phù hợp với phong cách cụ thể hơn. Project có các model FineTuneDataset, FineTuneExample, FineTuneJob, FineTuneMetric và FineTunedModel. Vòng đời fine-tune gồm tạo dataset, thêm example, validate, tạo job, theo dõi metric/log và đưa model đã hoàn tất vào danh sách chọn khi generate. Trong phạm vi đồ án, đây là thiết kế hợp lý vì việc train model thật phụ thuộc nhiều vào provider, quyền truy cập, chi phí và cấu hình cloud.

### 2.1.2. Kiến trúc web client-server

CopyPro dùng kiến trúc client-server. Frontend chạy trên trình duyệt, hiển thị giao diện và gửi request đến backend. Backend xử lý xác thực, kiểm tra quyền, validate dữ liệu, gọi service, đọc ghi MongoDB và trả JSON response. Cách tách lớp này giúp giao diện và nghiệp vụ không phụ thuộc trực tiếp vào nhau. Khi cần thay đổi giao diện, backend vẫn giữ API; khi cần đổi provider AI, frontend không cần biết chi tiết bên trong aiService.

REST API được dùng làm cách giao tiếp chính. Các tài nguyên như contents, projects, templates, plans, payments, notifications và plagiarism reports được thao tác bằng các phương thức GET, POST, PATCH, DELETE. API được nhóm theo đường dẫn rõ: /api/contents cho nội dung, /api/projects cho project, /api/templates cho template, /api/admin cho quản trị và /api/billing cho thanh toán.

### 2.1.3. Xác thực, phân quyền và bảo vệ tài nguyên

Hệ thống có hai nhóm tài khoản: AccountUser và AccountAdmin. User dùng portal khách hàng, admin dùng portal quản trị. Xác thực dựa trên JWT, mật khẩu được hash bằng bcrypt. Cookie-parser được dùng để xử lý cookie, Helmet và CORS được dùng để tăng mức an toàn HTTP cơ bản. Auth middleware kiểm tra token, account type và trạng thái tài khoản trước khi cho truy cập route cần bảo vệ.

Phân quyền trong project có hai lớp. Lớp backend đảm bảo người dùng chỉ thao tác trên tài nguyên của mình hoặc admin mới được vào API quản trị. Lớp frontend dùng route guard, auth store và permission mapping để ẩn/hiện màn hình phù hợp. Cách làm này thuận tiện cho trải nghiệm người dùng, nhưng các quyền quan trọng vẫn nên được enforce ở server khi đưa lên production.

### 2.1.4. CRUD, soft delete và quản lý vòng đời dữ liệu

Các chức năng quản lý nội dung, project, template, plan, payment và user đều dùng tư duy CRUD. Điểm thực tế của project là nhiều tài nguyên dùng soft delete thay vì xóa ngay. Ví dụ content hoặc account có thể được đánh dấu deleted, sau đó khôi phục hoặc xóa vĩnh viễn. Cách làm này phù hợp với ứng dụng quản lý dữ liệu vì người dùng có thể thao tác nhầm, còn admin cần lịch sử để đối chiếu.

### 2.1.5. Kiểm tra đạo văn và so khớp văn bản

Plagiarism checker trong đồ án dựa trên các kỹ thuật có thể giải thích được: chuẩn hóa văn bản, so khớp exact containment, n-gram phrase overlap, word overlap và topic similarity. Nguồn kiểm tra có thể là database nội bộ, reference text, file upload hoặc nguồn web/Common Crawl nếu được cấu hình. Cách tiếp cận này chưa thay thế các hệ thống thương mại có kho dữ liệu lớn, nhưng phù hợp cho đồ án vì dễ triển khai, dễ kiểm thử và dễ trình bày thuật toán.

### 2.1.6. Quota, subscription và billing trong SaaS

Với sản phẩm AI, mỗi lượt generate hoặc fine-tune đều có chi phí. Vì vậy hệ thống cần quota để kiểm soát số lượt dùng theo plan. Project có Plan, Subscription, Payment và UsageLog. Plan định nghĩa hạn mức và quyền truy cập model; Subscription thể hiện gói hiện tại của user; Payment ghi nhận giao dịch; UsageLog lưu dấu vết sử dụng. Billing service kiểm tra hạn mức trước khi cho phép thao tác tốn tài nguyên.

## 2.2. Công nghệ sử dụng

| Nhóm | Công nghệ | Vai trò trong project |
|---|---|---|
| Frontend framework | Next.js 14, React 18, TypeScript | Xây dựng giao diện, routing, component và type checking |
| UI | Tailwind CSS, Radix UI, Material UI, lucide-react, motion | Tạo giao diện public, customer portal và admin portal |
| State/API frontend | Axios, TanStack React Query, Zustand | Gọi API, cache dữ liệu, quản lý trạng thái auth |
| Biểu đồ | Chart.js, react-chartjs-2 | Hiển thị dashboard và thống kê admin |
| Backend | Node.js, Express.js | Xây dựng REST API và middleware |
| Database | MongoDB, Mongoose | Lưu account, content, project, template, billing, fine-tune, plagiarism |
| Validation | Joi | Kiểm tra dữ liệu đầu vào cho API |
| Auth/security | JWT, bcrypt, cookie-parser, Helmet, CORS, express-rate-limit | Xác thực, hash mật khẩu, bảo vệ HTTP và hạn chế request |
| File/email | Multer, pdf-parse, mammoth, Nodemailer, Cloudinary | Upload file, trích text, gửi email, xử lý ảnh |
| AI provider | Gemini, Groq/Llama, Vertex, OpenRouter, OpenAI-compatible, FreeGPT4 local | Sinh nội dung, hỗ trợ model nhiều nguồn |
| Payment | Manual, VietQR, VNPAY, ZaloPay | Checkout, xác nhận giao dịch, nâng cấp gói |

Công nghệ được chọn tương đối hợp lý với phạm vi đồ án. Next.js và React phù hợp cho giao diện nhiều trang. Express.js đủ nhẹ để xây REST API nhiều module. MongoDB phù hợp với dữ liệu có cấu trúc linh hoạt như content, template, usage log và fine-tune metadata. Mongoose giúp định nghĩa schema, index và quan hệ tham chiếu. React Query giúp frontend xử lý trạng thái tải dữ liệu tốt hơn so với gọi API thủ công trong từng component.

# Chương 3. PHÂN TÍCH THIẾT KẾ HỆ THỐNG

## 3.1. Khảo sát và phân tích yêu cầu

Khi khảo sát mã nguồn, có thể thấy project được chia thành hai phần độc lập: frontend và backend. Frontend không chỉ có landing page mà đã có đầy đủ route cho người dùng và admin. Backend không chỉ có auth và content, mà còn có các nhóm service cho billing, payment gateway, fine-tune, plagiarism, public site, settings, notification và audit log. Đây là dấu hiệu cho thấy yêu cầu của hệ thống đã được mở rộng theo hướng SaaS.

Các nhu cầu chính của người dùng gồm tạo nội dung nhanh, lưu lại để chỉnh sửa, tổ chức nội dung theo project, dùng template để không phải nhập prompt từ đầu, kiểm tra trùng lặp và theo dõi hạn mức. Với admin, nhu cầu là quản lý người dùng, nội dung, template, option sinh nội dung, gói dịch vụ, thanh toán, thông báo, liên hệ và cài đặt hệ thống.

Từ góc nhìn vận hành, hệ thống cần xử lý một số điểm nhạy cảm. Thứ nhất là tài khoản và mật khẩu, nên cần hash mật khẩu, JWT và middleware xác thực. Thứ hai là quota AI, vì mỗi lượt generate có chi phí. Thứ ba là thanh toán, cần ghi nhận giao dịch và kiểm tra callback. Thứ tư là dữ liệu nội dung của user, cần lọc theo userId để không lộ dữ liệu giữa các tài khoản. Thứ năm là admin portal, cần phân quyền và audit log để dễ truy vết.

## 3.2. Xác định yêu cầu của hệ thống

### 3.2.1. Yêu cầu chức năng

Yêu cầu chức năng được chia theo nhóm actor.

Đối với khách truy cập:

- Xem trang chủ, tính năng, ví dụ copy và lời giới thiệu sản phẩm.
- Xem bảng giá và thông tin các plan.
- Xem blog, chi tiết bài viết và trang about.
- Gửi form liên hệ.
- Đăng ký tài khoản, đăng nhập, quên mật khẩu và reset password.

Đối với customer:

- Đăng nhập, đăng xuất và xem thông tin tài khoản hiện tại.
- Cập nhật profile, avatar và mật khẩu.
- Tạo nội dung AI từ brief, ngành nghề, copy type, tone, ngôn ngữ, độ dài, model và template.
- Lưu nội dung được sinh vào database.
- Xem danh sách content, tìm kiếm, lọc, phân trang và xem chi tiết.
- Chỉnh sửa content, đánh dấu yêu thích, gắn tag, xóa mềm, khôi phục hoặc xóa vĩnh viễn.
- Tạo và quản lý project để gom content theo chiến dịch.
- Xem và dùng template hệ thống hoặc template cá nhân.
- Kiểm tra plagiarism từ text, content đã lưu hoặc file upload.
- Tạo fine-tune dataset, thêm example, validate dataset, tạo job, xem metric/log và quản lý fine-tuned model.
- Xem plan hiện tại, quota, lịch sử thanh toán và thực hiện checkout.
- Xem notification và đánh dấu đã đọc.

Đối với admin:

- Đăng nhập admin và quản lý hồ sơ admin.
- Xem dashboard thống kê user, content, doanh thu, usage và hoạt động hệ thống.
- Quản lý user và admin account.
- Quản lý content toàn hệ thống.
- Quản lý template hệ thống.
- Quản lý generate options gồm industries, copy types và tones.
- Quản lý plans, payments và doanh thu.
- Gửi notification.
- Quản lý contact submissions.
- Quản lý public site, blog và page settings.
- Quản lý system settings, maintenance mode và cấu hình liên quan.
- Xem audit logs và phân quyền UI.

Đối với AI service:

- Nhận prompt từ backend và trả kết quả text.
- Trả usage hoặc token estimate nếu provider hỗ trợ.
- Hỗ trợ nhiều model hoặc endpoint tùy cấu hình.
- Tham gia fine-tune job khi provider được cấu hình.

Đối với payment gateway:

- Nhận yêu cầu tạo checkout.
- Trả payment URL hoặc thông tin QR/chuyển khoản.
- Gửi callback/IPN để backend xác nhận giao dịch.
- Cho phép backend kiểm tra amount, status và chữ ký/MAC.

### 3.2.2. Yêu cầu phi chức năng

Bảo mật: Mật khẩu phải được hash bằng bcrypt. API cần JWT và middleware bảo vệ route riêng tư. CORS chỉ cho phép origin frontend cấu hình. Header bảo mật được bổ sung bằng Helmet. Các request nhạy cảm như auth nên có rate limit. Tài nguyên của user phải lọc theo userId.

Tính đúng dữ liệu: Request đầu vào cần được validate bằng Joi. Các thao tác billing cần kiểm tra amount, plan, payment status và subscription. UsageLog cần ghi nhận để tính quota và audit về sau. Với payment gateway, callback cần được xác thực trước khi cập nhật subscription.

Khả năng mở rộng: AI provider được tách trong service để có thể thêm model mới. Generate options được đưa vào database để admin thay đổi mà không cần sửa code. Plan và allowed models cũng được quản lý theo dữ liệu để hỗ trợ nhiều gói dịch vụ.

Tính bảo trì: Backend chia lớp theo routes, controllers, services, models, validations và middlewares. Frontend chia theo route, component, service và store. Cách này giảm tình trạng một file chứa quá nhiều trách nhiệm.

Trải nghiệm người dùng: Giao diện cần có loading, thông báo lỗi, phân trang, lọc, route guard, trạng thái rỗng và phản hồi rõ sau thao tác. Với generate nội dung, người dùng cần thấy kết quả dễ đọc và có thao tác lưu/chỉnh sửa.

Hiệu năng: API danh sách cần phân trang. File upload cần giới hạn dung lượng. Payload JSON có limit 1mb trong app.js. Các truy vấn lớn như contents, payments, audit logs nên có filter và pagination.

Khả năng demo: Project cần có seed data để trình bày khi chưa kết nối đủ provider thật. Seed script hiện tạo user, admin, project, content, template, plan, payment và fine-tune dataset mẫu.

## 3.3. Sơ đồ use case

Các actor chính gồm Guest, Customer, Admin, Super Admin, AI Provider và Payment Gateway. Sơ đồ dưới đây trình bày ở dạng textual để có thể đưa trực tiếp vào báo cáo và giải thích khi bảo vệ.

@startuml
actor Guest
actor Customer
actor Admin
actor "Super Admin" as SuperAdmin
actor "AI Provider" as AI
actor "Payment Gateway" as Pay

rectangle "CopyPro - AI Copywriter" {
  usecase "Xem public site" as UC1
  usecase "Đăng ký / đăng nhập" as UC2
  usecase "Tạo nội dung AI" as UC3
  usecase "Quản lý content" as UC4
  usecase "Quản lý project" as UC5
  usecase "Sử dụng template" as UC6
  usecase "Kiểm tra đạo văn" as UC7
  usecase "Quản lý fine-tune" as UC8
  usecase "Xem billing / checkout" as UC9
  usecase "Nhận thông báo" as UC10
  usecase "Quản lý user" as UC11
  usecase "Quản lý content toàn hệ thống" as UC12
  usecase "Quản lý template và generate option" as UC13
  usecase "Quản lý plan và payment" as UC14
  usecase "Quản lý settings, audit, public site" as UC15
}

Guest --> UC1
Guest --> UC2
Customer --> UC3
Customer --> UC4
Customer --> UC5
Customer --> UC6
Customer --> UC7
Customer --> UC8
Customer --> UC9
Customer --> UC10
Admin --> UC11
Admin --> UC12
Admin --> UC13
Admin --> UC14
Admin --> UC15
SuperAdmin --> UC11
SuperAdmin --> UC13
SuperAdmin --> UC15
AI --> UC3
AI --> UC8
Pay --> UC9
@enduml

Use case quan trọng nhất là Tạo nội dung AI. Luồng này liên kết nhiều phần: frontend generate page, generate options, model access theo plan, content service, aiService, usage log và lưu Content. Use case Kiểm tra đạo văn và Quản lý fine-tune là hai luồng bổ sung để đồ án có chiều sâu hơn so với app generate thông thường.

## 3.5. Thiết kế kiến trúc hệ thống

Kiến trúc tổng thể gồm bốn lớp: giao diện người dùng, backend API, database và dịch vụ ngoài. Frontend gửi request qua Axios đến backend. Backend kiểm tra middleware, validate request, gọi service, đọc ghi MongoDB và gọi provider nếu cần. Database lưu dữ liệu nghiệp vụ. Dịch vụ ngoài gồm AI provider, email service, Cloudinary và payment gateway.

Sơ đồ khái quát:

@startuml
rectangle "Frontend - Next.js" as FE {
  rectangle "Public pages" as F1
  rectangle "Customer portal" as F2
  rectangle "Admin portal" as F3
  rectangle "Services / hooks / auth store" as F4
}

rectangle "Backend - Express.js" as BE {
  rectangle "Routes" as B1
  rectangle "Controllers" as B2
  rectangle "Services" as B3
  rectangle "Validations" as B4
  rectangle "Middlewares" as B5
  rectangle "Mongoose Models" as B6
}

database "MongoDB" as DB
cloud "AI Providers" as AI
cloud "Payment Gateways" as PAY
cloud "Email / Upload" as EXT

FE --> BE
B1 --> B2
B2 --> B3
B4 --> B1
B5 --> B1
B3 --> B6
B6 --> DB
B3 --> AI
B3 --> PAY
B3 --> EXT
@enduml

### Kiến trúc frontend

Frontend dùng Next.js App Router. Các route public nằm ở các thư mục như about, blog, contact, pricing và LandingPage. Route customer gồm dashboard, generate, contents, projects, templates, fine-tune, plagiarism-check, billing, profile và notifications. Route admin nằm dưới admin, gồm nhiều trang quản trị. Các component UI dùng chung nằm trong app/components, trong đó có nhóm ui, charts, generator, public, admin và customer.

Auth và route guard được xử lý ở các file như route-guards.tsx, AuthContext và authStore. Permission UI được mapping trong frontend/src/lib/permissions.ts. Với project này, frontend không chỉ dựng trang tĩnh, mà có service gọi API, normalize dữ liệu và kiểm soát quyền truy cập màn hình.

### Kiến trúc backend

Backend mount route trong app.js. Public route và contact route được đặt trước maintenanceMode để vẫn có thể truy cập một số thông tin công khai. Các route user như contents, projects, templates, billing, fine-tune và plagiarism được đặt sau middleware maintenanceMode. Admin route được tách riêng theo nhóm /api/admin.

Backend chia source theo trách nhiệm:

- routes: khai báo endpoint và middleware.
- controllers: nhận request, gọi service và trả response.
- services: xử lý nghiệp vụ chính.
- models: định nghĩa schema MongoDB bằng Mongoose.
- validations: khai báo Joi schema.
- middlewares: auth, upload, validation, rate limit, maintenance, error và notFound.
- utils: JWT, cookie, OTP, createError, seed data và helper khác.

Thiết kế này làm cho service có thể kiểm thử và mở rộng tốt hơn. Ví dụ paymentGatewayService có thể xử lý nhiều cổng thanh toán mà controller billing không cần biết toàn bộ chi tiết kỹ thuật của từng gateway.

## 3.6. Thiết kế luồng xử lý chính

### Luồng đăng ký và đăng nhập user

1. Người dùng gửi email, password và thông tin đăng ký từ frontend.
2. Frontend gọi API /api/auth/user/register.
3. Backend validate dữ liệu bằng authValidation.
4. authService kiểm tra email đã tồn tại hay chưa.
5. Password được hash bằng bcrypt.
6. AccountUser được lưu vào MongoDB.
7. Nếu bật xác minh email, hệ thống tạo OTP và gửi qua mailService.
8. Khi đăng nhập, backend kiểm tra mật khẩu, trạng thái tài khoản và tạo JWT.
9. Token được trả về hoặc lưu qua cookie tùy cơ chế triển khai.
10. Frontend lưu trạng thái auth vào store/context và chuyển người dùng vào dashboard.

### Luồng generate nội dung AI

1. Customer mở trang /generate.
2. Frontend tải industries, copyTypes và tones từ /api/generate-options.
3. Người dùng nhập product info, chọn copy type, tone, language, length, model, template và project.
4. Frontend gửi request đến /api/contents/generate.
5. Backend xác thực user và validate payload.
6. contentService kiểm tra plan, quota và quyền truy cập model.
7. Service dựng prompt từ input và template.
8. aiService chọn provider/model tương ứng.
9. Provider trả nội dung, usage hoặc token estimate.
10. Backend chuẩn hóa kết quả, lưu Content, ghi UsageLog và cập nhật usage.
11. Frontend hiển thị các phiên bản nội dung để người dùng đọc, copy, lưu hoặc chỉnh sửa.

### Luồng quản lý content

1. Customer vào trang /contents.
2. Frontend gọi GET /api/contents kèm filter, search và pagination.
3. Backend chỉ trả content thuộc user hiện tại, trừ route admin.
4. Người dùng chọn một content để xem chi tiết.
5. Khi chỉnh sửa, frontend gọi PATCH /api/contents/:id.
6. Khi xóa, backend thực hiện soft delete để có thể restore.
7. Nếu xóa vĩnh viễn, backend kiểm tra quyền rồi remove hoặc đánh dấu permanent theo logic service.

### Luồng kiểm tra đạo văn

1. Customer nhập text, chọn content có sẵn hoặc upload file.
2. Nếu upload file, backend dùng Multer và plagiarismFileService để đọc nội dung.
3. Với PDF, hệ thống dùng pdf-parse; với DOCX, dùng mammoth.
4. plagiarismService chuẩn hóa văn bản, tách cụm từ, tạo n-gram và so khớp nguồn.
5. Nguồn so khớp có thể gồm database nội bộ, reference text, upload và web/Common Crawl nếu cấu hình.
6. Service tính similarity score, originality score, risk level và danh sách đoạn trùng.
7. PlagiarismReport được lưu để người dùng xem lại lịch sử.

### Luồng fine-tuning

1. Customer vào /fine-tune và xem quota fine-tune.
2. Người dùng tạo dataset, đặt tên, mô tả, provider và mục tiêu sử dụng.
3. Người dùng thêm example gồm input và output mong muốn.
4. Backend validate dataset về số lượng mẫu, độ dài, định dạng và chất lượng cơ bản.
5. Khi tạo job, fineTuneService kiểm tra quota và provider.
6. Nếu provider có cấu hình, service submit job hoặc gọi service chuyên biệt như vertexOpenModelFineTuneService.
7. Job chuyển qua các trạng thái queued, running, completed, failed hoặc canceled.
8. Metric và log được lưu để hiển thị tiến độ.
9. Khi hoàn tất, FineTunedModel được đưa vào registry và có thể chọn trong generate.

### Luồng billing và thanh toán

1. Customer xem plan tại /billing hoặc /pricing.
2. Frontend gọi /api/billing/plans và /api/billing/me.
3. Khi checkout, backend tạo Payment với trạng thái pending.
4. Tùy phương thức, paymentGatewayService tạo hướng thanh toán manual, VietQR, VNPAY hoặc ZaloPay.
5. Sau khi thanh toán, gateway gọi return/callback/IPN.
6. Backend xác minh chữ ký/MAC, amount và mã giao dịch.
7. Nếu hợp lệ, Payment được chuyển sang paid và Subscription được cập nhật.
8. Quota và allowed models của user thay đổi theo plan mới.

### Luồng admin quản trị

1. Admin đăng nhập qua /api/auth/admin/login.
2. Frontend kiểm tra role và permission trước khi cho vào /admin.
3. Admin dashboard gọi /api/admin/stats để lấy thống kê.
4. Các màn hình users, contents, templates, plans, payments, settings gọi API admin tương ứng.
5. Thao tác quan trọng nên được ghi AuditLog để phục vụ truy vết.
6. Super admin có quyền rộng nhất, dùng để cấu hình role, permission và system settings.

## 3.7. Thiết kế cơ sở dữ liệu

Cơ sở dữ liệu dùng MongoDB và Mongoose. Dưới đây là các collection quan trọng và vai trò của chúng.

| Collection | Vai trò | Ghi chú thiết kế |
|---|---|---|
| AccountUser | Tài khoản khách hàng | Lưu email, password hash, profile, trạng thái, plan/subscription liên quan |
| AccountAdmin | Tài khoản admin | Lưu role, quyền, trạng thái và thông tin đăng nhập admin |
| Content | Nội dung AI hoặc nội dung thủ công | Gắn userId, projectId, templateId, copy type, tone, model, tags, favorite, soft delete |
| Project | Nhóm nội dung theo chiến dịch | Thuộc user, có thể thống kê số content hoặc trạng thái |
| Template | Prompt/template copywriting | Có template hệ thống và template cá nhân |
| GenerateOption | Danh mục ngành, loại nội dung, tone | Admin có thể bật/tắt hoặc sắp xếp |
| Plan | Gói dịch vụ | Lưu quota, giá, quyền truy cập model và giới hạn tính năng |
| Subscription | Gói hiện tại của user | Gắn với user và plan, theo dõi trạng thái subscription |
| Payment | Giao dịch thanh toán | Lưu gateway, amount, status, transaction code, callback data |
| UsageLog | Lịch sử sử dụng quota | Ghi lượt generate, token, fine-tune hoặc plagiarism |
| Notification | Thông báo | Gửi cho user hoặc nhóm user |
| AuditLog | Nhật ký admin | Ghi thao tác quản trị quan trọng |
| SystemSetting | Cấu hình hệ thống | Maintenance, email, public config hoặc giới hạn hệ thống |
| PublicPage | Nội dung public site/blog | Cho phép admin chỉnh public content |
| ContactSubmission | Form liên hệ | Lưu yêu cầu từ khách truy cập |
| ApiKey | API key user | Phục vụ tích hợp nếu user dùng API riêng |
| FineTuneDataset | Bộ dữ liệu fine-tune | Gồm metadata, provider, status, owner |
| FineTuneExample | Ví dụ input/output | Thuộc dataset, dùng để validate và submit job |
| FineTuneJob | Job fine-tune | Theo dõi trạng thái, provider job id, lỗi, thời gian |
| FineTuneMetric | Metric job | Lưu loss, accuracy hoặc metric provider trả về |
| FineTunedModel | Registry model sau fine-tune | Cho phép chọn model trong generate |
| PlagiarismReport | Báo cáo đạo văn | Lưu score, matches, sources, risk level và summary |
| ForgotPassword | OTP reset password | Có TTL hoặc thời hạn hết hạn |
| EmailVerification | OTP xác minh email | Dùng trong luồng verify email |

Quan hệ dữ liệu chính:

- AccountUser có nhiều Content, Project, Template cá nhân, Payment, UsageLog, Notification, FineTuneDataset và PlagiarismReport.
- Project có nhiều Content.
- Template có thể được dùng khi tạo Content.
- Plan liên kết với Subscription và Payment.
- FineTuneDataset có nhiều FineTuneExample và FineTuneJob.
- FineTuneJob có nhiều FineTuneMetric.
- FineTunedModel có thể được chọn trong Content generation.
- AccountAdmin tạo hoặc cập nhật dữ liệu quản trị và được ghi vào AuditLog.

Một điểm cần lưu ý là dữ liệu AI có thể tăng nhanh. Content, UsageLog, PlagiarismReport và AuditLog nên có index theo userId, createdAt, status và các trường lọc thường dùng. Với production, cần bổ sung cơ chế dọn dữ liệu cũ, giới hạn kích thước report và backup database.

# Chương 4. XÂY DỰNG VÀ TRIỂN KHAI ỨNG DỤNG

## 4.1. Xây dựng giao diện người dùng

Giao diện frontend được xây theo hướng chia khu vực. Public site dùng để giới thiệu sản phẩm và dẫn người dùng đến đăng ký hoặc pricing. Customer portal dùng cho công việc hằng ngày của người dùng. Admin portal dùng cho vận hành hệ thống. Cách chia này giúp mỗi nhóm màn hình có mục đích rõ, tránh lẫn lộn giữa giao diện bán hàng, giao diện làm việc và giao diện quản trị.

Ở public site, các trang chính gồm LandingPage, about, pricing, blog, blog detail và contact. Trang chủ có các thành phần giới thiệu AI Copywriter, ví dụ nội dung, demo generator và CTA. Trang pricing kết nối với billing plan để người dùng thấy các gói. Trang contact gửi thông tin về backend qua contact submission API. Blog và public site có phần quản lý từ admin, giúp nội dung công khai không bị hard-code hoàn toàn.

Ở customer portal, màn hình quan trọng nhất là /generate. Trang này được chia thành các phần nhập thông tin sản phẩm, chọn ngành nghề, chọn copy type, chọn tone, chọn model và cấu hình nâng cao. Các component như ProductInfoForm, IndustryPicker, CopyTypePicker, TonePicker, ModelPicker, AdvancedSettings và GeneratorResults cho thấy frontend đã tách nhỏ giao diện theo chức năng. Kết quả generate được hiển thị để người dùng đọc, copy, lưu hoặc tiếp tục chỉnh sửa.

Trang /contents giúp người dùng quản lý nội dung đã tạo. Trang /contents/[id] phục vụ xem chi tiết và chỉnh sửa. Trang /projects và /projects/[id] gom content theo chiến dịch. Trang /templates cho phép dùng prompt mẫu. Trang /fine-tune trình bày studio quản lý dataset và job. Trang /plagiarism-check cho phép nhập text hoặc upload file để kiểm tra. Trang /billing hiển thị plan, quota và thanh toán. Trang /notifications tập trung thông báo từ hệ thống.

Admin portal được xây với nhiều màn hình quản lý. /admin là dashboard, /admin/users quản lý user/admin, /admin/contents quản lý content, /admin/templates quản lý template, /admin/generate-options quản lý industries/copy types/tones, /admin/plans quản lý plan, /admin/payments quản lý giao dịch, /admin/settings quản lý cấu hình, /admin/audit-logs xem log, /admin/permissions quản lý quyền UI, /admin/public-site quản lý nội dung public và /admin/contacts xem liên hệ.

Về kỹ thuật giao diện, project dùng nhiều component tái sử dụng. Nhóm ui chứa button, dialog, table, tabs, select, input, textarea, tooltip, dropdown, pagination và các thành phần form khác. Nhóm charts dùng Chart.js để hiển thị thống kê. Nhóm admin có AdminTable, AdminFilterBar, ConfirmDialog, TrashBin và StatTile. Điều này giúp các màn hình admin có cùng cách hiển thị và thao tác.

Route guard là phần quan trọng của frontend. Người chưa đăng nhập không được vào customer portal. User thường không được vào admin portal. Admin thiếu quyền sẽ thấy màn hình access denied. Về trải nghiệm, cách này giúp người dùng được chuyển đúng luồng, đồng thời tránh việc hiển thị nhầm màn hình không thuộc vai trò của họ.

## 4.2. Xử lý nghiệp vụ hệ thống

### 4.2.1. Nghiệp vụ xác thực

Auth service xử lý đăng ký, đăng nhập, đăng xuất, reset password, verify email và cập nhật tài khoản. Password được hash bằng bcrypt. JWT dùng để xác định phiên đăng nhập. OTP phục vụ reset password và email verification. Middleware auth kiểm tra token, account type và trạng thái tài khoản. Với admin, route đăng nhập và profile được tách trong nhóm /api/auth/admin.

Điểm hợp lý ở đây là project tách AccountUser và AccountAdmin. Cách tách này làm rõ ranh giới giữa khách hàng và người quản trị, nhất là khi quyền admin phức tạp hơn. Khi demo, có thể dùng tài khoản seed customer@copypro.vn và admin@copypro.vn để trình bày hai luồng khác nhau.

### 4.2.2. Nghiệp vụ tạo nội dung AI

Nghiệp vụ tạo nội dung đi qua contentService và aiService. contentService chịu trách nhiệm phần sản phẩm: kiểm tra người dùng, quota, plan, template, project, lưu Content và ghi UsageLog. aiService chịu trách nhiệm phần provider: dựng prompt, chọn model, gọi API, xử lý response và fallback. Việc tách hai service này làm code dễ đọc hơn, vì logic AI không trộn lẫn hoàn toàn với logic lưu content.

Các model sinh nội dung được quản lý qua generatorModels.js. Project không khóa vào một provider duy nhất, mà có danh sách base models và cơ chế nhận fine-tuned model. Đây là hướng tốt nếu muốn mở rộng, vì sau này có thể thêm model mới hoặc thay provider mà không phải viết lại toàn bộ giao diện generate.

### 4.2.3. Nghiệp vụ template và generate options

Template giúp chuẩn hóa prompt. Thay vì yêu cầu người dùng luôn tự nghĩ cấu trúc prompt, hệ thống có thể cung cấp mẫu cho email, social post, landing page, CTA hoặc SEO. Template có thể là system template do admin quản lý hoặc template cá nhân của user.

GenerateOption giúp admin quản lý các giá trị lựa chọn trên màn hình generate. Industries, copy types và tones không nên hard-code mãi trong frontend, vì yêu cầu marketing thường thay đổi. Khi đưa các option vào database, admin có thể bật/tắt, sắp xếp hoặc cập nhật label mà không cần sửa code.

### 4.2.4. Nghiệp vụ project và content management

Project là lớp tổ chức nội dung. Một chiến dịch có thể có nhiều content: headline, email, social caption, landing copy và CTA. Khi content gắn với project, người dùng dễ tìm lại nội dung theo chiến dịch thay vì chỉ xem danh sách rời rạc. Backend cần đảm bảo project thuộc user hiện tại trước khi cho thêm hoặc sửa content.

Content management có các thao tác cơ bản như xem, sửa, xóa, restore và permanent delete. Soft delete là lựa chọn phù hợp, vì nội dung marketing có thể bị xóa nhầm hoặc cần khôi phục. Admin có thể xem content toàn hệ thống để kiểm duyệt hoặc hỗ trợ người dùng.

### 4.2.5. Nghiệp vụ plagiarism

Plagiarism service nhận text từ nhiều nguồn. Nếu người dùng upload file, backend trích văn bản trước rồi mới kiểm tra. Với PDF dùng pdf-parse, với DOCX dùng mammoth. Sau khi có text, service chuẩn hóa, so khớp với nguồn kiểm tra và tạo report. Report lưu lại lịch sử để người dùng xem lại.

Điểm mạnh của cách làm hiện tại là thuật toán có thể giải thích được. Người dùng có thể thấy vì sao nội dung bị đánh dấu trùng: đoạn nào trùng, nguồn nào, score bao nhiêu. Điểm hạn chế là so khớp n-gram và word overlap chưa đủ mạnh với trường hợp paraphrase sâu. Phần này nên được nêu rõ trong báo cáo để tránh trình bày quá mức so với khả năng thật.

### 4.2.6. Nghiệp vụ fine-tuning

Fine-tuning studio gồm nhiều bước: tạo dataset, thêm example, validate, tạo job, theo dõi metric/log và quản lý model hoàn tất. Backend có nhiều model riêng cho phần này, cho thấy thiết kế không chỉ lưu một trường text đơn giản. FineTuneDataset lưu metadata, FineTuneExample lưu cặp input/output, FineTuneJob lưu trạng thái job, FineTuneMetric lưu kết quả theo thời gian, FineTunedModel lưu model có thể dùng lại.

Trong demo, fine-tuning thật có thể khó chạy nếu thiếu provider hoặc cloud config. Vì vậy seed data cho fine-tune rất quan trọng. Nó cho phép trình bày luồng nghiệp vụ, trạng thái job và metric mà không phụ thuộc hoàn toàn vào việc provider có sẵn hay không.

### 4.2.7. Nghiệp vụ billing và quota

Billing service quản lý plan, subscription, payment và usage. Plan định nghĩa giá, giới hạn và quyền dùng model. Subscription cho biết user đang ở gói nào. Payment ghi nhận giao dịch. UsageLog ghi nhận lượt sử dụng để kiểm tra quota. Với sản phẩm AI, quota không phải phần phụ; nó là cách hệ thống kiểm soát chi phí và phân biệt gói dịch vụ.

Payment gateway service hỗ trợ manual, VietQR, VNPAY và ZaloPay. Với VNPAY và ZaloPay, backend cần xử lý return/callback và xác thực dữ liệu trước khi cập nhật payment. Với manual hoặc VietQR, admin có thể xác nhận giao dịch trong portal quản trị. Cách thiết kế nhiều phương thức giúp demo linh hoạt hơn.

### 4.2.8. Nghiệp vụ admin, settings và audit

Admin service xử lý dữ liệu toàn hệ thống. Dashboard hiển thị thống kê. User management cho phép quản lý tài khoản. Content và template management hỗ trợ kiểm soát dữ liệu sinh ra. Generate option management giúp thay đổi danh mục lựa chọn. Plan và payment management phục vụ phần thương mại. Settings và public site management giúp hệ thống có khả năng cấu hình.

AuditLog là phần nên có trong hệ thống admin. Khi admin sửa user, xác nhận payment, thay đổi plan hoặc cập nhật settings, hệ thống nên ghi lại ai thực hiện, lúc nào, thao tác gì và dữ liệu liên quan. Điều này không chỉ phục vụ bảo mật mà còn giúp debug khi có lỗi vận hành.

# Chương 5. TỔNG KẾT

## 5.1. Kết quả đạt được

Đồ án đã xây dựng được một project full-stack có phạm vi khá đầy đủ cho bài toán AI Copywriter. Frontend có public site, customer portal và admin portal. Backend có REST API, xác thực, phân quyền, quản lý content, project, template, generate option, fine-tune, plagiarism, billing, notification, public site, settings và audit log. Database có nhiều model phản ánh đúng nghiệp vụ thay vì chỉ lưu một bảng nội dung đơn giản.

Chức năng generate nội dung đã được đặt trong một luồng làm việc hoàn chỉnh hơn: người dùng nhập brief, chọn option, chọn model, backend kiểm tra quota, gọi AI provider, lưu Content và ghi UsageLog. Các màn hình quản lý content, project và template giúp người dùng tiếp tục làm việc với kết quả sau khi AI sinh ra.

Phần admin portal cũng đạt được nhiều yêu cầu quan trọng. Admin có thể quản lý user, content, template, generate option, plan, payment, notification, contact, public site, settings và audit log. Điều này giúp project có mặt vận hành, không chỉ có mặt người dùng cuối.

Fine-tuning và plagiarism là hai kết quả đáng chú ý. Dù việc fine-tune thật phụ thuộc provider, project đã có cấu trúc dữ liệu và API để quản lý vòng đời dataset/job/model. Plagiarism checker có xử lý text, content và file upload, đồng thời lưu report để xem lịch sử.

## 5.2. Ưu điểm của hệ thống

Ưu điểm đầu tiên là phạm vi chức năng có trọng tâm nhưng không quá hẹp. Trọng tâm là tạo nội dung marketing bằng AI, còn các chức năng phụ đều phục vụ trọng tâm đó: content để lưu kết quả, project để tổ chức, template để chuẩn hóa prompt, billing để kiểm soát quota, fine-tune để cá nhân hóa và plagiarism để kiểm tra chất lượng.

Ưu điểm thứ hai là backend được chia lớp rõ. Việc có routes, controllers, services, models, validations và middlewares giúp project dễ đọc hơn. Khi cần sửa logic nghiệp vụ, có thể tìm trong service. Khi cần sửa schema, tìm trong models. Khi cần sửa input rule, tìm trong validations.

Ưu điểm thứ ba là khả năng tích hợp nhiều model. Project không khóa chặt vào một provider duy nhất. Danh sách model base và fine-tuned access trong generatorModels.js cho thấy hướng thiết kế có thể mở rộng.

Ưu điểm thứ tư là có các yếu tố vận hành thật: quota, payment, notification, audit log, system settings, public site management và admin dashboard. Đây là những phần thường bị bỏ qua trong demo nhỏ, nhưng lại làm báo cáo có tính hệ thống hơn.

Ưu điểm thứ năm là frontend có cấu trúc route và component khá rõ. Các màn hình generate, contents, projects, fine-tune, plagiarism, billing và admin không nằm trong một file lớn. Service layer, React Query và auth store giúp giao diện làm việc với backend mạch lạc hơn.

## 5.3. Hạn chế

Hạn chế đầu tiên là nhiều chức năng phụ thuộc cấu hình bên ngoài. Nếu thiếu API key hoặc cloud project, AI provider, fine-tuning, email hoặc payment gateway có thể không chạy đầy đủ. Đây là hạn chế bình thường với hệ thống tích hợp dịch vụ, nhưng khi demo cần chuẩn bị env kỹ.

Hạn chế thứ hai là plagiarism hiện dựa nhiều vào so khớp local như exact, n-gram và word overlap. Cách này dễ giải thích và phù hợp đồ án, nhưng chưa mạnh bằng hệ thống có vector search, crawler lớn và kho dữ liệu học thuật. Với nội dung được diễn đạt lại sâu, kết quả có thể chưa chính xác.

Hạn chế thứ ba là fine-tuning thật có chi phí và ràng buộc provider. Một số provider yêu cầu project cloud, bucket, region, endpoint hoặc quyền truy cập riêng. Vì vậy phần fine-tune có thể cần dùng dữ liệu seed khi bảo vệ nếu chưa có cấu hình chạy thật.

Hạn chế thứ tư là phân quyền frontend có phần dựa vào local UI state. Điều này phù hợp demo, nhưng production cần enforce permission chi tiết hơn ở backend. Frontend chỉ nên hỗ trợ trải nghiệm, không nên là lớp bảo mật chính.

Hạn chế thứ năm là cần bổ sung test tự động. Project có cấu trúc đủ để test service và API, nhưng báo cáo nên thừa nhận rằng unit test, integration test và Playwright test chưa phải điểm mạnh hiện tại. Với hệ thống nhiều nghiệp vụ như billing và payment, test tự động rất quan trọng.

## 5.4. Hướng phát triển

Hướng phát triển đầu tiên là hoàn thiện streaming khi generate. Với AI content, người dùng thường muốn thấy kết quả xuất hiện dần thay vì chờ toàn bộ response. Có thể dùng Server-Sent Events hoặc WebSocket để stream nội dung từ backend về frontend.

Hướng thứ hai là nâng cấp plagiarism bằng embedding và vector search. Hệ thống có thể tạo embedding cho content, reference và file upload, sau đó kết hợp semantic similarity với n-gram overlap. Cách này giúp phát hiện paraphrase tốt hơn.

Hướng thứ ba là bổ sung RAG từ tài liệu doanh nghiệp. Người dùng có thể upload brand guideline, product catalog, FAQ hoặc case study. Backend trích text, chunk, embedding và đưa context liên quan vào prompt. Khi đó nội dung sinh ra sẽ sát dữ liệu riêng của doanh nghiệp hơn.

Hướng thứ tư là hoàn thiện workflow biên tập: version history, comment, approval flow, export DOCX/PDF, lịch đăng bài và tích hợp social/email. Đây là các tính năng làm CopyPro tiến gần hơn đến công cụ làm việc nhóm.

Hướng thứ năm là production hóa billing và bảo mật. Cần bổ sung webhook đầy đủ, đối soát giao dịch, hóa đơn, email receipt, refresh token rotation, CSRF protection nếu dùng cookie rộng hơn, backend-enforced permission và audit log cho nhiều thao tác hơn.

Hướng thứ sáu là bổ sung test và CI/CD. Backend nên có unit test cho service, integration test cho API, test payment callback và test quota. Frontend nên có Playwright test cho các luồng đăng nhập, generate, billing và admin. Có thể dùng Docker Compose để dựng MongoDB và môi trường dev ổn định.

## 5.5. Nguồn kỹ thuật và khảo sát

Nguồn khảo sát chính là mã nguồn trong workspace của project. Các file và nhóm file được dùng để lập báo cáo gồm:

- README.md: thông tin tổng quan, ý tưởng, công nghệ và định hướng project.
- frontend/USE_CASES.md: actor, use case và mapping route.
- frontend/package.json: công nghệ frontend thực tế.
- backend/package.json: công nghệ backend thực tế.
- backend/src/app.js: middleware và mount route API.
- backend/src/server.js: kết nối database, listen port và graceful shutdown.
- backend/src/config/generatorModels.js: danh sách model generate và fine-tuned access.
- backend/src/routes: các endpoint user và admin.
- backend/src/controllers: controller theo từng module.
- backend/src/services: nghiệp vụ auth, content, AI, plagiarism, fine-tune, billing, payment, template, project, notification, settings và admin.
- backend/src/models: schema MongoDB bằng Mongoose.
- backend/src/validations: Joi schema cho các API chính.
- frontend/src/app: route public, customer và admin.
- frontend/src/app/components: component UI, admin, charts, generator và public.
- frontend/src/stores/authStore.ts: trạng thái xác thực frontend.
- frontend/src/lib/permissions.ts: mapping role và permission.
- backend/src/utils/seed.js: dữ liệu demo cho user, admin, project, content, template, plan, payment và fine-tune.

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
| Templates | /templates | /api/templates | Thư viện template |
| Fine-tune | /fine-tune | /api/fine-tune | Dataset, job, metric, model registry |
| Plagiarism | /plagiarism-check | /api/plagiarism | Kiểm tra đạo văn |
| Billing | /billing, /pricing | /api/billing | Plan, subscription, checkout, payment |
| Notifications | /notifications | /api/notifications | Trung tâm thông báo |
| Admin dashboard | /admin | /api/admin/stats | Thống kê quản trị |
| Admin users | /admin/users | /api/admin/users | Quản lý tài khoản |
| Admin content/template | /admin/contents, /admin/templates | /api/admin/contents, /api/admin/templates | Quản lý content và template |
| Admin generate options | /admin/generate-options | /api/admin/generate-options | Quản lý industry, copy type, tone |
| Admin finance | /admin/plans, /admin/payments | /api/admin/plans, /api/admin/payments | Quản lý plan, payment, revenue |
| Admin system | /admin/settings, /admin/audit-logs, /admin/permissions | /api/admin/settings, /api/admin/audit-logs | Cài đặt, audit, phân quyền |

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
- GET /api/generate-options: lấy industries, copyTypes và tones active.
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
- GET /api/admin/public-site: quản lý trang public, blog và settings.

# PHỤ LỤC C. DỮ LIỆU DEMO TỪ SEED SCRIPT

Seed script tạo dữ liệu để demo nhanh. Tài khoản customer mẫu là customer@copypro.vn với mật khẩu customer123. Tài khoản admin mẫu là admin@copypro.vn với mật khẩu admin123 và role super_admin. Seed cũng tạo project mẫu như Campaign Hè 2026, Ra mắt SaaS OmniCRM, The Grand Riverside Q2, Khóa học AI Copywriting, Menu mùa hè Nhà Bếp Lá và Serum Trà Xanh An Nhiên.

Dữ liệu content mẫu gồm nhiều loại copy như Facebook Ad, Landing Page, Email, SEO Content và social caption. Template mẫu gồm TikTok hook, launch post sản phẩm mới, email bỏ giỏ hàng, email nuôi dưỡng lead B2B, Google Search Ads, Facebook Lead Ads bất động sản, landing page SaaS B2B, landing page khóa học, bộ CTA chuyển đổi, testimonial, case study B2B, copy y tế an toàn, copy tài chính có disclaimer và copy tour du lịch.

Seed fine-tune tạo các pipeline như E-commerce Brand Voice Dataset, Luxury Real Estate Dataset, Healthcare Compassionate Dataset và FNB Promotion Dataset. Các dataset có example input/output, qualityScore, job completed/running/queued và metric như accuracy hoặc loss. Phần này rất hữu ích khi bảo vệ vì có thể trình bày luồng fine-tune ngay cả khi chưa kết nối provider thật.

# PHỤ LỤC D. NHẬN XÉT VỀ MỨC ĐỘ HOÀN THIỆN HIỆN TẠI

Project hiện tại không phải chỉ là giao diện tĩnh. Backend có route, controller, service, validation và model cho nhiều module. Frontend cũng có route guard, service layer và nhiều màn hình làm việc thật. Vì vậy khi trình bày đồ án, nên nhấn mạnh đây là hệ thống full-stack có backend nghiệp vụ, không nên mô tả như một mockup đơn giản.

Tuy vậy, khi demo cần chuẩn bị môi trường kỹ: MongoDB URI, seed data, frontend API base URL, backend port, JWT secret, SMTP nếu demo OTP, AI provider key nếu demo generate thật và payment config nếu demo gateway. Nếu không có provider AI, nên trình bày rõ cơ chế fallback hoặc dùng dữ liệu seed để giải thích luồng nghiệp vụ.

Bản báo cáo nên giữ giọng vừa phải: nêu đúng phần đã có trong source, nêu thẳng phần phụ thuộc cấu hình, và tránh nói quá rằng hệ thống đã sẵn sàng production hoàn toàn. Cách trình bày này thuyết phục hơn khi bảo vệ, vì người nghe có thể đối chiếu trực tiếp với mã nguồn.
