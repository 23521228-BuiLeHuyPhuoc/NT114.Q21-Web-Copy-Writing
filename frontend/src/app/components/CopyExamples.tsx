import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { BookOpen, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

interface CopyExamplesProps {
  industry: string;
}

const industryExamples: Record<string, any> = {
  ecommerce: {
    name: 'Thương Mại Điện Tử',
    examples: [
      {
        type: 'Landing Page',
        title: 'Trang Bán Hàng',
        content: `🎯 Tiêu đề: "Giảm 50% Toàn Bộ Sản Phẩm - Flash Sale 24H"

📝 Mô tả: 
"Mua sắm thả ga với hàng nghìn sản phẩm chất lượng cao, giá cực ưu đãi. Cam kết hàng chính hãng 100%, đổi trả miễn phí trong 7 ngày nếu không hài lòng. Freeship toàn quốc cho đơn từ 299K."

💡 Lợi ích:
• Tiết kiệm đến 50% chi phí
• Giao hàng nhanh trong 24-48h
• Hỗ trợ 24/7 qua hotline
• Thanh toán an toàn, bảo mật

🎁 Ưu đãi đặc biệt: Mua 2 tặng 1, tích điểm đổi quà

👉 MUA NGAY - Số lượng có hạn!`
      },
      {
        type: 'Email Marketing',
        title: 'Email Khuyến Mãi',
        content: `Subject: [VIP] 🎁 Ưu đãi độc quyền dành riêng cho bạn!

Xin chào [Tên khách hàng],

Bạn là khách hàng thân thiết của chúng tôi, vì vậy bạn sẽ là người đầu tiên nhận được ưu đãi đặc biệt này:

🔥 FLASH SALE 50% - Chỉ trong 24H
📦 Freeship toàn quốc - Không giới hạn đơn hàng
🎁 Tặng voucher 200K cho đơn hàng tiếp theo

Nhanh tay click vào link bên dưới để không bỏ lỡ!

[MUA NGAY - Nhận ưu đãi]

Trân trọng,
Team [Tên Shop]`
      }
    ]
  },
  realestate: {
    name: 'Bất Động Sản',
    examples: [
      {
        type: 'Sales Page',
        title: 'Trang Giới Thiệu Dự Án',
        content: `🏢 DỰ ÁN VINHOMES RIVERSIDE - VỊ TRÍ VÀNG, SỐNG ĐẲNG CẤP

📍 Vị trí: Trung tâm Quận 2, TP.HCM
🏗️ Tiến độ: Bàn giao Q4/2026
💰 Giá: Từ 2.5 tỷ - 5 tỷ

✨ ĐIỂM NỔI BẬT:
• View sông Sài Gòn thoáng đẹp
• Gần trường quốc tế, bệnh viện Vinmec
• Hệ thống tiện ích 5 sao: Hồ bơi, gym, công viên
• An ninh 24/7 với hệ thống camera AI

🎁 ƯU ĐÃI ĐẶC BIỆT:
✓ Chiết khấu 5% khi thanh toán nhanh
✓ Tặng 2 năm phí quản lý
✓ Hỗ trợ vay 70%, lãi suất 0% trong 12 tháng

📞 ĐĂNG KÝ NGAY để nhận bảng giá chi tiết và xem căn hộ mẫu!`
      },
      {
        type: 'Social Post',
        title: 'Bài Đăng Facebook',
        content: `🏡 RA MẮT DỰ ÁN GOLDEN PALACE - CĂN HỘ CAO CẤP GIÁ TỐT!

📢 Chỉ 500 triệu sở hữu ngay căn hộ 2PN tại trung tâm thành phố!

🌟 Những gì bạn nhận được:
👉 Vị trí đắc địa, gần trung tâm thương mại
👉 Thiết kế hiện đại, thông minh
👉 Tiện ích đầy đủ: Hồ bơi, gym, khu BBQ
👉 Bàn giao hoàn thiện cao cấp

💵 Chính sách thanh toán linh hoạt:
• Trả trước 30%, còn lại trả góp 0% lãi suất
• Hỗ trợ vay ngân hàng lên đến 70%

🎁 Ưu đãi tháng 1: Tặng gói nội thất 200 triệu!

📱 Inbox ngay để được tư vấn chi tiết và đặt lịch xem nhà mẫu!

#BatDongSan #CanHoCaoCap #DauTu #GoldenPalace`
      }
    ]
  },
  technology: {
    name: 'Công Nghệ',
    examples: [
      {
        type: 'Product Page',
        title: 'Trang Sản Phẩm',
        content: `💻 PHẦN MỀM QUẢN LÝ DOANH NGHIỆP SMARTBIZ

🚀 Giải pháp toàn diện cho SME - Tăng hiệu suất 10x

⚡ TÍNH NĂNG NỔI BẬT:
• Quản lý bán hàng & kho: Tự động hóa quy trình
• CRM: Chăm sóc khách hàng hiệu quả
• Báo cáo thông minh: Phân tích dữ liệu real-time
• Tích hợp đa nền tảng: Website, App, Social

✅ LỢI ÍCH:
✓ Tiết kiệm 40% thời gian vận hành
✓ Giảm 30% chi phí nhân sự
✓ Tăng 50% năng suất làm việc
✓ Bảo mật dữ liệu tuyệt đối

💰 GIÁ: Chỉ từ 1.5 triệu/tháng
🎁 Dùng thử MIỄN PHÍ 30 ngày - Không cần thẻ tín dụng

👉 ĐĂNG KÝ NGAY để nhận tư vấn 1-1 từ chuyên gia!`
      },
      {
        type: 'Webinar',
        title: 'Lời Mời Webinar',
        content: `🎯 WEBINAR MIỄN PHÍ: "Chuyển Đổi Số Cho Doanh Nghiệp Nhỏ"

📅 Thời gian: 20:00 - 21:30, Thứ 7 ngày 15/02/2026
💻 Nền tảng: Zoom (link sẽ gửi sau khi đăng ký)

🎓 Nội dung:
1️⃣ Tại sao doanh nghiệp cần chuyển đổi số?
2️⃣ Các bước triển khai CĐS hiệu quả
3️⃣ Công cụ & giải pháp phù hợp với SME
4️⃣ Case study thực tế & Q&A

👨‍🏫 Diễn giả: 
Nguyễn Văn A - CEO TechViet, 15 năm kinh nghiệm

🎁 QUÀ TẶNG:
• Ebook "Chuyển đổi số từ A-Z"
• Voucher giảm 50% phần mềm SmartBiz
• Tư vấn miễn phí 1-1 với chuyên gia

👉 SỐ CHỖ CÓ HẠN - Đăng ký ngay tại: [Link]`
      }
    ]
  },
  fnb: {
    name: 'Ẩm Thực',
    examples: [
      {
        type: 'Menu Copy',
        title: 'Giới Thiệu Món Ăn',
        content: `🍜 PHỞ BÒ ĐẶC BIỆT - CÔNG THỨC BÍ TRUYỀN

Trải nghiệm hương vị phở truyền thống Hà Nội chuẩn vị với:

🥩 Thịt bò tươi ngon: Nạm, gầu, tái, nạc
🍜 Bánh phở dai mềm vừa phải
🌿 Nước dùng ninh từ xương 12 tiếng
🥬 Rau thơm tươi sạch, giá đỗ giòn ngọt

💰 Giá: 65.000đ/tô (Size lớn)

⭐ 4.8/5 sao - Hơn 10.000 đánh giá
📍 Địa chỉ: 123 Phố Huế, Hai Bà Trưng, HN

🎁 Ưu đãi hôm nay: Order online giảm 15%
🚗 Giao hàng nhanh trong 30 phút

👉 GỌI MÓN NGAY: 0123.456.789`
      },
      {
        type: 'Event',
        title: 'Sự Kiện Khai Trương',
        content: `🎉 GRAND OPENING - NHÀ HÀNG BUFFET SEAFOOD

📅 Khai trương: 01/02/2026
📍 Địa điểm: 456 Nguyễn Huệ, Q.1, TP.HCM

🦞 BUFFET HẢI SẢN CAO CẤP
🦀 Hơn 80 món hải sản tươi sống
🍤 Cua Hoàng Đế, Tôm Hùm, Bào Ngư...
🍺 Nước uống không giới hạn

💰 GIÁ ưu đãi khai trương:
• Người lớn: 499K (giá gốc 799K)
• Trẻ em: 299K (giá gốc 399K)
• Miễn phí cho trẻ dưới 5 tuổi

🎁 QUÀ TẶNG KHỦNG:
✓ 100 khách đầu tiên nhận voucher 500K
✓ Check-in tặng 1 set lẩu hải sản
✓ Bốc thăm trúng iPhone 15 Pro Max

📞 ĐẶT BÀN NGAY: 0987.654.321
⏰ Số lượng có hạn - Book sớm để có chỗ đẹp!`
      }
    ]
  },
  healthcare: {
    name: 'Y Tế & Sức Khỏe',
    examples: [
      {
        type: 'Service Page',
        title: 'Gói Dịch Vụ',
        content: `💚 GÓI KHÁM SỨC KHỎE TỔNG QUÁT PLATINUM

🏥 Phòng Khám Đa Khoa Quốc Tế HealthCare

📋 NỘI DUNG GÓI KHÁM (30+ hạng mục):
✅ Khám lâm sàng: Tim mạch, Hô hấp, Tiêu hóa
✅ Xét nghiệm: Máu, Nước tiểu, Sinh hóa
✅ Chẩn đoán hình ảnh: X-quang, Siêu âm, ECG
✅ Sàng lọc ung thư: Phổi, Gan, Đại trực tràng

👨‍⚕️ ĐỘI NGŨ:
• Bác sĩ chuyên khoa giàu kinh nghiệm
• Trang thiết bị y tế hiện đại
• Quy trình chuẩn quốc tế JCI

💰 GIÁ: 2.500.000đ → 1.500.000đ (-40%)

🎁 ƯU ĐÃI THÊM:
✓ Tư vấn miễn phí từ bác sĩ chuyên khoa
✓ Tặng gói khám răng miệng
✓ Theo dõi sức khỏe online 6 tháng

📞 ĐẶT LỊCH: 1900.xxxx (Miễn phí)
🕐 Làm việc: 7:00 - 20:00 (kể cả T7, CN)`
      },
      {
        type: 'Educational',
        title: 'Bài Viết Chăm Sóc Sức Khỏe',
        content: `💡 5 DẤU HIỆU CƠ THỂ CẦN KHÁM SỨC KHỎE NGAY

Đừng bỏ qua những tín hiệu cảnh báo này của cơ thể:

1️⃣ MỆT MỎI KÉO DÀI
→ Có thể thiếu máu, rối loạn giấc ngủ

2️⃣ ĐAU ĐẦU THƯỜNG XUYÊN
→ Cảnh báo huyết áp, stress

3️⃣ GIẢM CÂN NHANH KHÔNG R�� NGUYÊN NHÂN
→ Cần kiểm tra tuyến giáp, đường huyết

4️⃣ KHÓ THỞ, ĐAU NGỰC
→ Liên quan đến tim mạch, phổi

5️⃣ RỐI LOẠN TIÊU HÓA
→ Dấu hiệu của bệnh lý dạ dày, gan

⚠️ KHUYẾN CÁO:
• Khám sức khỏe định kỳ 6 tháng/lần
• Không tự ý dùng thuốc khi có triệu chứng
• Tham khảo ý kiến bác sĩ khi có dấu hiệu bất thường

📞 Đặt lịch khám: 1900.xxxx
💬 Tư vấn miễn phí qua Zalo: 098.765.4321`
      }
    ]
  },
  education: {
    name: 'Giáo Dục',
    examples: [
      {
        type: 'Course Landing',
        title: 'Trang Khóa Học',
        content: `📚 KHÓA HỌC LẬP TRÌNH WEB FULLSTACK 2026

🎯 Từ con số 0 đến đi làm chỉ trong 6 tháng!

💻 NỘI DUNG KHÓA HỌC:
Module 1: HTML, CSS, JavaScript cơ bản
Module 2: React.js & Next.js
Module 3: Node.js & Express
Module 4: MongoDB & PostgreSQL
Module 5: Dự án thực tế & Deploy

✨ LỢI ÍCH:
✓ Học thực hành 70%, lý thuyết 30%
✓ Làm 5+ dự án thực tế cho CV
✓ Mentor 1-1 hỗ trợ 24/7
✓ Chứng chỉ quốc tế từ FreeCodeCamp

👨‍🏫 GIẢNG VIÊN:
• 10+ năm kinh nghiệm tại Google, Meta
• Top 1% developer trên GitHub
• Đã đào tạo hơn 5000 học viên

💰 HỌC PHÍ: 15 triệu → 9.9 triệu (-33%)
���� Khai giảng: 15/02/2026

🎁 ƯU ĐÃI:
• Tặng khóa tiếng Anh IT
• Miễn phí tài khoản Premium 1 năm
• Hỗ trợ tìm việc sau tốt nghiệp

👉 ĐĂNG KÝ NGAY - Chỉ còn 10 suất!`
      },
      {
        type: 'Success Story',
        title: 'Câu Chuyện Thành Công',
        content: `🌟 CÂU CHUYỆN CỦA NGUYỄN VĂN A

"Từ nhân viên văn phòng đến Senior Developer"

📖 HÀNH TRÌNH:
• Tháng 1/2025: Đăng ký khóa học, 0 kiến thức IT
• Tháng 6/2025: Hoàn thành khóa học với điểm A
• Tháng 7/2025: Nhận offer Junior Dev - 15 triệu
• Tháng 1/2026: Thăng Senior Dev - 30 triệu

💬 Chia sẻ của bạn A:
"Ban đầu tôi rất lo lắng vì không có background IT. Nhưng chương trình học rất bài bản, thầy cô nhiệt tình. Quan trọng là có nhiều project thực tế để luyện tập. Sau 6 tháng, tôi đã tự tin apply việc và nhận được 3 offer!"

🎯 KẾT QUẢ:
✓ Tăng gấp đôi thu nhập
✓ Chuyển đổi nghề nghiệp thành công
✓ Làm việc remote, linh hoạt thời gian

👉 Bạn cũng có thể như anh A!
📞 Đăng ký tư vấn: 0123.456.789`
      }
    ]
  },
  finance: {
    name: 'Tài Chính',
    examples: [
      {
        type: 'Loan Product',
        title: 'Sản Phẩm Vay Vốn',
        content: `💰 VAY VỐN KINH DOANH - LÃI SUẤT ƯU ĐÃI

🏦 Ngân Hàng TMCP Đầu Tư & Phát Triển

📊 THÔNG TIN SẢN PHẨM:
• Hạn mức: 50 triệu - 5 tỷ
• Lãi suất: Từ 0.5%/tháng
• Thời gian vay: 12 - 60 tháng
• Thế chấp: Sổ đỏ, xe ô tô, giấy tờ có giá trị

✅ ƯU ĐIỂM:
✓ Duyệt nhanh trong 24h
✓ Giải ngân trong ngày
✓ Không phí ẩn, minh bạch
✓ Trả nợ trước hạn không phạt

📋 HỒ SƠ ĐƠN GIẢN:
• CMND/CCCD
• Giấy tờ nhà đất/xe
• Hợp đồng kinh doanh (nếu có)

🎁 ƯU ĐÃI THÁNG 1:
• Miễn phí thẩm định
• Giảm 50% phí hồ sơ
• Tặng bảo hiểm khoản vay

📞 LIÊN HỆ NGAY: 1800.xxxx
💬 Hoặc để lại SĐT, chúng tôi sẽ gọi lại!`
      },
      {
        type: 'Investment',
        title: 'Sản Phẩm Đầu Tư',
        content: `📈 QUỸ ĐẦU TƯ SMARTFUND - SINH LỜI BỀN VỮNG

💎 Giải pháp đầu tư thông minh cho mọi nhà đầu tư

🎯 ĐẶC ĐIỂM:
• Lợi nhuận kỳ vọng: 12-15%/năm
• Rủi ro: Trung bình
• Đầu tư tối thiểu: 10 triệu
• Thanh khoản: Linh hoạt, rút bất kỳ lúc nào

💼 DANH MỤC ĐẦU TƯ:
40% Cổ phiếu bluechip
30% Trái phiếu chính phủ
20% Bất động sản
10% Vàng & ngoại tệ

✨ LỢI ÍCH:
✓ Đa dạng hóa danh mục
✓ Quản lý bởi chuyên gia 15+ năm KN
✓ Minh bạch, báo cáo định kỳ
✓ Phí quản lý cạnh tranh: 1.5%/năm

📊 THÀNH TÍCH:
• 5 năm liên tục sinh lời
• Vượt VN-Index 3.5%
• Hơn 50,000 nhà đầu tư tin tưởng

🎁 ƯU ĐÃI:
Miễn phí phí giao dịch 6 tháng đầu

👉 MỞ TÀI KHOẢN NGAY: [Link]
📞 Hotline: 1900.xxxx`
      }
    ]
  },
  fashion: {
    name: 'Thời Trang',
    examples: [
      {
        type: 'Collection Launch',
        title: 'Ra Mắt Bộ Sưu Tập',
        content: `👗 BỘ SƯU TẬP XUÂN HÈ 2026 - "BLOOM"

🌸 Tươi mới • Thanh lịch • Năng động

✨ ĐIỂM NỔI BẬT:
• Thiết kế độc quyền từ NTK Nguyễn Công Trí
• Chất liệu cao cấp: Lụa, cotton organic
• Màu sắc pastel dịu mắt, trẻ trung
• Phù hợp đi làm, dạo phố, dự tiệc

👚 SẢN PHẨM HOT:
🌟 Váy midi hoa cúc - 1.290.000đ
🌟 Áo sơ mi lụa tơ tằm - 890.000đ
🌟 Set đồ vest nữ - 1.690.000đ
🌟 Quần culottes thanh lịch - 790.000đ

📏 SIZE: S - XXL (tư vấn size miễn phí)

🎁 ƯU ĐÃI RA MẮT:
✓ Giảm 30% toàn bộ BST
✓ Freeship đơn từ 500K
✓ Tặng phụ kiện khi mua từ 2 sản phẩm

📸 Style inspiration: #BloomCollection2026

🛍️ MUA NGAY tại: [Website/App]
📍 Hoặc ghé store: 789 Lê Lợi, Q.1, TP.HCM`
      },
      {
        type: 'Instagram Post',
        title: 'Bài Đăng Instagram',
        content: `✨ OUTFIT OF THE DAY ✨

🤍 Mix & Match cùng set đồ BLOOM mới nhất:
• Áo sơ mi trắng basic
• Quần ống rộng be
• Phụ kiện tối giản

💫 Phong cách: Minimalist & Chic
🎯 Phù hợp: Đi làm, cafe, meeting

📌 TIP MẶC ĐẸP:
Chọn tông màu trung tính để dễ phối đồ, thêm 1-2 điểm nhấn như túi xách hoặc giày để tạo điểm nhấn cho outfit!

💰 GIÁ CẢ:
• Áo sơ mi: 890K
• Quần culottes: 790K
→ COMBO chỉ 1.490K (tiết kiệm 190K!)

🛒 Shop ngay tại bio
📦 Freeship toàn quốc
💳 COD toàn quốc

#OOTD #Fashion #MinimalistStyle #BloomCollection #ThờiTrang2026 #OutfitInspo`
      }
    ]
  },
  business: {
    name: 'Dịch Vụ Doanh Nghiệp',
    examples: [
      {
        type: 'B2B Service',
        title: 'Dịch Vụ B2B',
        content: `🚀 GIẢI PHÁT MARKETING TỔNG THỂ CHO DOANH NGHIỆP

📊 BizMarketing Solutions - Đối tác tăng trưởng của bạn

🎯 DỊCH VỤ:
1️⃣ Digital Marketing
   • SEO/SEM, Social Media, Content
   
2️⃣ Branding & Design
   • Logo, Website, Catalogue
   
3️⃣ Marketing Automation
   • Email, CRM, Analytics
   
4️⃣ Tư vấn chiến lược
   • Market research, Planning

💼 LĨNH VỰC PHỤC VỤ:
✓ Bất động sản
✓ F&B
✓ E-commerce
✓ Giáo dục
✓ Y tế

📈 KẾT QUẢ CAM KẾT:
• Tăng 150% traffic website
• Tăng 200% tương tác mạng xã hội
• Tăng 80% tỷ lệ chuyển đổi
• ROI trung bình: 300%

🏆 THÀNH TÍCH:
• 500+ dự án thành công
• 98% khách hàng hài lòng
• Top 10 agency Việt Nam

💰 GIÁ: Từ 15 triệu/tháng
🎁 Tư vấn miễn phí + Audit website

📞 LIÊN HỆ: 0123.456.789
📧 Email: hello@bizmarketing.vn`
      },
      {
        type: 'Case Study',
        title: 'Case Study Khách Hàng',
        content: `📊 CASE STUDY: CÔNG TY ABC - TĂNG TRƯỞNG 300% DOANH THU

🏢 KHÁCH HÀNG: ABC Food & Beverage
📍 Ngành: Chuỗi nhà hàng (10 chi nhánh)
⏰ Thời gian: 6 tháng (06/2025 - 12/2025)

❌ THÁCH THỨC:
• Doanh thu đình trệ
• Brand awareness thấp
• Cạnh tranh khốc liệt

✅ GIẢI PHÁT:
1. Xây dựng chiến lược Marketing tổng thể
2. Tối ưu kênh Digital (Facebook, TikTok, Google)
3. Chương trình Loyalty & Referral
4. Cải thiện trải nghiệm khách hàng

📈 KẾT QUẢ:
✓ Doanh thu: Tăng 300% (từ 2 tỷ → 6 tỷ/tháng)
✓ Khách hàng mới: +12,000 người
✓ Traffic website: +450%
✓ Social engagement: +380%
✓ ROI: 450%

💬 PHẢN HỒI KHÁCH HÀNG:
"BizMarketing đã giúp chúng tôi thay đổi hoàn toàn cách tiếp cận khách hàng. Các chiến dịch rất sáng tạo và hiệu quả!" - CEO ABC F&B

👉 Doanh nghiệp của bạn cũng có thể!
📞 Đặt lịch tư vấn: 0123.456.789`
      }
    ]
  },
  travel: {
    name: 'Du Lịch',
    examples: [
      {
        type: 'Tour Package',
        title: 'Gói Tour Du Lịch',
        content: `✈️ TOUR CHÂU ÂU 7 NGÀY 6 ĐÊM

🌍 Pháp - Thụy Sĩ - Ý (Khởi hành từ HCM)

📅 Lịch khởi hành: 15/03, 22/03, 05/04/2026

🗺️ HÀNH TRÌNH:
Ngày 1-2: Paris - Tháp Eiffel, Khải Hoàn Môn
Ngày 3-4: Thụy Sĩ - Núi Jungfrau, Lucerne
Ngày 5-7: Ý - Rome, Vatican, Milan

🏨 TIỆN ÍCH:
✓ Khách sạn 4 sao trung tâm
✓ Xe đưa đón riêng, wifi miễn phí
✓ HDV tiếng Việt nhiệt tình
✓ Bảo hiểm du lịch toàn diện

🍽️ ĂN UỐNG:
• Buffet sáng tại khách sạn
• Trưa/tối: Ẩm thực địa phương
• Tặng 1 bữa fine dining tại Paris

💰 GIÁ TOUR:
• Người lớn: 68 triệu/người
• Trẻ em 6-11 tuổi: 54 triệu
• Trẻ em <6 tuổi: 15 triệu

🎁 ƯU ĐÃI:
✓ Giảm 3 triệu cho khách đăng ký trước 30 ngày
✓ Miễn phí làm visa Schengen
✓ Tặng sim 4G châu Âu

📞 HOTLINE: 1900.xxxx
💬 Hoặc inbox để nhận tư vấn chi tiết!`
      },
      {
        type: 'Resort Promotion',
        title: 'Khuyến Mãi Resort',
        content: `🏝️ PEARL RESORT PHÚ QUỐC - NGHỈ DƯỠNG 5 SAO

🌊 "Thiên đường nghỉ dưỡng giữa lòng đảo ngọc"

🏨 TIỆN ÍCH:
• 150 phòng view biển sang trọng
• 3 hồ bơi vô cực
• Spa & Massage cao cấp
• Nhà hàng buffet hải sản
• Kids club, gym, yoga

🏖️ HOẠT ĐỘNG:
✓ Lặn biển ngắm san hô
✓ Câu cá, chèo kayak
✓ BBQ bãi biển
✓ Tour tham quan đảo

💰 GIÁ ƯU ĐÃI (2N1Đ):
• Phòng Superior: 2.9 triệu
• Phòng Deluxe Sea View: 3.9 triệu
• Villa riêng biệt: 8.9 triệu

🎁 GÓI "SUMMER GETAWAY":
✓ Miễn phí buffet sáng
✓ Tặng 1 bữa tối lãng mạn
✓ Spa voucher 500K
✓ Late checkout đến 14h
✓ Đón/tiễn sân bay miễn phí

📅 Áp dụng: 01/02 - 30/04/2026

📞 ĐẶT PHÒNG: 0297.xxx.xxxx
🌐 Website: pearlresort.vn

#PhuQuoc #Resort5Sao #NghiDuong #DuLich`
      }
    ]
  }
};

export function CopyExamples({ industry }: CopyExamplesProps) {
  const examples = industryExamples[industry];

  if (!examples) return null;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <BookOpen className="w-6 h-6 text-stone-600" />
        <h2 className="text-2xl font-bold">Mẫu Copy Thực Tế - {examples.name}</h2>
      </div>

      <Tabs defaultValue="0" className="w-full">
        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${examples.examples.length}, 1fr)` }}>
          {examples.examples.map((example: any, index: number) => (
            <TabsTrigger key={index} value={String(index)}>
              {example.type}
            </TabsTrigger>
          ))}
        </TabsList>

        {examples.examples.map((example: any, index: number) => (
          <TabsContent key={index} value={String(index)} className="mt-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{example.type}</Badge>
                <h3 className="font-semibold text-lg">{example.title}</h3>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-700">
                  {example.content}
                </pre>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(example.content);
                    toast.success('Đã sao chép mẫu copy!');
                  }}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Sao chép mẫu này
                </Button>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  );
}