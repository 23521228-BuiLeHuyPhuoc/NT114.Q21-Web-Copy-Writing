import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { BookOpen, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

interface CopyExamplesProps {
  industry: string;
}

interface CopyExample {
  type: string;
  title: string;
  content: string;
}

interface IndustryExamples {
  name: string;
  examples: CopyExample[];
}

const industryExamples: Record<string, IndustryExamples> = {
  ecommerce: {
    name: 'Thương Mại Điện Tử',
    examples: [
      {
        type: 'Landing Page',
        title: 'Trang bán serum phục hồi da',
        content: `Brief: Serum phục hồi hàng rào bảo vệ da, dành cho người 25-35 tuổi có da yếu sau treatment.

Hero headline:
Da dễ kích ứng không cần thêm một lời hứa quá đà. Da cần một routine phục hồi đúng cách.

Subheadline:
Serum Restore C5 kết hợp panthenol, ceramide và madecassoside để làm dịu da, hỗ trợ phục hồi độ ẩm và giúp bề mặt da trông khỏe hơn sau 14 ngày sử dụng đều đặn.

Lợi ích chính:
- Làm dịu cảm giác căng rát sau khi dùng AHA/BHA/retinoid.
- Củng cố độ ẩm, giảm tình trạng bong tróc nhìn thấy bằng mắt thường.
- Kết cấu mỏng nhẹ, thấm nhanh, phù hợp dùng sáng và tối.

Bằng chứng tin cậy:
- 94% người dùng thử nói da bớt khô căng sau 7 ngày.
- Không cồn khô, không hương liệu, đã kiểm nghiệm da liễu.
- Đổi trả trong 14 ngày nếu sản phẩm lỗi hoặc kích ứng do công thức.

Offer:
Mua trong tuần này nhận bộ sample sữa rửa mặt pH 5.5 và miễn phí vận chuyển cho đơn từ 399.000đ.

CTA chính:
Chọn serum phục hồi cho da của bạn

Microcopy:
Tư vấn routine miễn phí trước khi mua nếu bạn đang dùng treatment.`
      },
      {
        type: 'Email Marketing',
        title: 'Email giỏ hàng bị bỏ quên',
        content: `Subject:
Bạn vẫn đang cân nhắc Restore C5?

Preview text:
Giữ lại giỏ hàng của bạn thêm 24 giờ, kèm hướng dẫn chọn serum phù hợp tình trạng da.

Chào [Tên],

Bạn đã thêm Serum Restore C5 vào giỏ hàng nhưng chưa hoàn tất thanh toán. Nếu bạn còn phân vân vì da đang yếu, đây là vài thông tin giúp bạn quyết định chắc hơn:

- Công thức tập trung vào phục hồi độ ẩm và làm dịu, không chạy theo cảm giác "bật tone" nhanh.
- Phù hợp dùng sau các bước active, nhưng nên giãn tần suất nếu da đang bong tróc mạnh.
- Có đội tư vấn kiểm tra routine hiện tại trước khi bạn đặt mua.

Ưu đãi riêng cho giỏ hàng này:
Nhập mã RESTORE10 để giảm 10% trong 24 giờ tới.

CTA:
Hoàn tất đơn hàng

P.S. Nếu bạn chưa chắc sản phẩm hợp với routine hiện tại, trả lời email này với danh sách sản phẩm đang dùng. Team chăm sóc da sẽ gợi ý cách kết hợp an toàn.`
      },
      {
        type: 'Paid Ads',
        title: 'Bộ quảng cáo chuyển đổi',
        content: `Mục tiêu: Chuyển đổi đơn hàng cho nhóm khách đã xem trang sản phẩm nhưng chưa mua.

Primary text:
Da sau treatment thường không cần thêm một sản phẩm "mạnh". Điều cần hơn là một bước phục hồi đủ dịu, đủ ẩm và dùng được đều đặn.

Serum Restore C5 hỗ trợ làm dịu cảm giác khô căng, củng cố hàng rào ẩm và giúp da trông ổn định hơn sau routine active.

Headline:
Phục hồi da yếu sau treatment

Description:
Không hương liệu. Không cồn khô. Tư vấn routine trước khi mua.

CTA:
Mua ngay

Lưu ý triển khai:
Không dùng claim điều trị bệnh da. Không hứa kết quả tuyệt đối. Creative nên dùng ảnh texture, routine thật và review có bối cảnh.`
      }
    ]
  },
  realestate: {
    name: 'Bất Động Sản',
    examples: [
      {
        type: 'Landing Page',
        title: 'Trang thu lead dự án căn hộ',
        content: `Brief: Dự án căn hộ trung cấp, khách hàng là gia đình trẻ và chuyên viên văn phòng đang tìm nơi ở thật.

Hero headline:
Căn hộ 2 phòng ngủ gần trung tâm, thiết kế cho gia đình muốn ở thuận tiện hơn mỗi ngày.

Subheadline:
The Riverline nằm trong khu dân cư đã hình thành, kết nối nhanh đến trường học, siêu thị và tuyến metro. Diện tích tối ưu, pháp lý minh bạch, tiến độ cập nhật hàng tháng.

Điểm nổi bật:
- Căn 2PN từ 68m2, bố trí bếp kín, logia riêng và phòng khách nhiều ánh sáng.
- Di chuyển khoảng 15 phút đến khu văn phòng trung tâm trong điều kiện giao thông bình thường.
- Tiện ích nội khu gồm sân chơi trẻ em, hồ bơi, phòng gym và khu sinh hoạt cộng đồng.
- Hỗ trợ tư vấn phương án vay dựa trên thu nhập thực tế của từng gia đình.

Bằng chứng:
- Hồ sơ pháp lý và tiến độ xây dựng được cung cấp khi khách đăng ký tư vấn.
- Căn hộ mẫu mở cửa thứ 7 và chủ nhật hằng tuần.

CTA chính:
Nhận bảng giá và lịch xem nhà mẫu

Lưu ý:
Thông tin giá, diện tích và chính sách bán hàng cần được xác nhận tại thời điểm tư vấn. Không dùng lời hứa cam kết lợi nhuận.`
      },
      {
        type: 'Lead Ads',
        title: 'Quảng cáo Facebook thu đăng ký',
        content: `Primary text:
Bạn đang tìm căn hộ đầu tiên cho gia đình nhưng không muốn chọn theo cảm tính?

The Riverline có căn 2PN diện tích tối ưu, khu dân cư hiện hữu và tiện ích đủ dùng cho sinh hoạt hằng ngày. Đăng ký để nhận:

- Bảng giá theo từng tầng và hướng căn.
- Lịch tham quan căn hộ mẫu cuối tuần.
- Tư vấn phương án tài chính phù hợp thu nhập.

Headline:
Nhận bảng giá căn hộ 2PN The Riverline

Description:
Tư vấn minh bạch, không ép đặt chỗ khi chưa đủ thông tin.

Form question gợi ý:
- Anh/chị dự kiến mua để ở hay đầu tư?
- Ngân sách dự kiến?
- Thời điểm muốn nhận nhà?

CTA:
Đăng ký tư vấn`
      },
      {
        type: 'Email Follow-up',
        title: 'Email sau khi khách xem nhà mẫu',
        content: `Subject:
Cảm ơn anh/chị đã tham quan căn hộ mẫu The Riverline

Preview text:
Tóm tắt thông tin căn phù hợp và các bước tiếp theo để anh/chị dễ so sánh.

Kính gửi anh/chị [Tên],

Cảm ơn anh/chị đã dành thời gian tham quan căn hộ mẫu The Riverline vào cuối tuần vừa rồi.

Dựa trên nhu cầu anh/chị chia sẻ, team gửi lại 3 nhóm thông tin quan trọng để anh/chị cân nhắc:

1. Căn phù hợp:
- Loại căn: 2 phòng ngủ, khoảng 68-72m2.
- Ưu tiên: logia thoáng, bếp kín, phòng ngủ phụ đủ rộng cho trẻ nhỏ.

2. Tài chính:
- Team có thể gửi bảng mô phỏng dòng tiền theo 3 kịch bản trả trước khác nhau.
- Anh/chị nên so sánh thêm chi phí quản lý, nội thất và khoản dự phòng sau nhận nhà.

3. Bước tiếp theo:
Nếu anh/chị muốn xem lại căn mẫu cùng người thân, team có thể giữ lịch ưu tiên vào thứ 7 tuần này.

CTA:
Xác nhận lịch xem lại căn hộ mẫu`
      }
    ]
  },
  technology: {
    name: 'Công Nghệ',
    examples: [
      {
        type: 'SaaS Landing',
        title: 'Landing page phần mềm quản lý sales',
        content: `Brief: SaaS CRM cho đội sales B2B 10-100 nhân sự, bán theo demo.

Hero headline:
CRM giúp đội sales nhìn rõ pipeline, ưu tiên đúng cơ hội và chốt deal đều hơn.

Subheadline:
SalesFlow gom lead, lịch hẹn, báo giá và nhắc việc vào một nơi. Quản lý biết deal nào đang kẹt, sales biết việc gì cần làm tiếp theo, khách hàng nhận phản hồi đúng lúc hơn.

Pain point:
Nhiều đội sales mất cơ hội không phải vì thiếu lead, mà vì dữ liệu rời rạc, follow-up trễ và không ai nhìn thấy điểm nghẽn trong pipeline.

Lợi ích chính:
- Theo dõi trạng thái từng deal theo pipeline trực quan.
- Tự động nhắc follow-up sau cuộc gọi, email hoặc báo giá.
- Dashboard doanh thu dự kiến theo nhân viên, nguồn lead và giai đoạn.
- Tích hợp form website, Zalo OA và email doanh nghiệp.

Bằng chứng:
Khách hàng triển khai thử trong 30 ngày thường giảm thời gian tổng hợp báo cáo cuối tuần từ vài giờ xuống dưới 20 phút.

CTA:
Đặt lịch demo 30 phút`
      },
      {
        type: 'Cold Email',
        title: 'Email tiếp cận khách B2B',
        content: `Subject:
Một cách giảm follow-up trễ cho team sales [Công ty]

Chào anh/chị [Tên],

Em thấy [Công ty] đang mở rộng đội kinh doanh ở mảng [ngành]. Khi số lượng lead tăng, nhiều team bắt đầu gặp tình trạng dữ liệu nằm rải rác giữa file Excel, inbox và ghi chú cá nhân.

SalesFlow giúp team:
- Nhìn toàn bộ pipeline theo từng giai đoạn.
- Tự động nhắc follow-up sau mỗi tương tác.
- Báo cáo doanh thu dự kiến mà không phải gom dữ liệu thủ công.

Nếu phù hợp, em xin gửi anh/chị một bản demo ngắn theo đúng quy trình sales hiện tại của team.

CTA:
Anh/chị có tiện xem demo 20 phút trong tuần này không?

Chữ ký:
[Tên] - SalesFlow
[Số điện thoại]`
      },
      {
        type: 'Case Study',
        title: 'Case study ngắn cho website',
        content: `Khách hàng:
Một công ty phân phối thiết bị văn phòng với 42 nhân sự sales.

Vấn đề trước khi triển khai:
- Lead từ website, hotline và đối tác được nhập vào nhiều file khác nhau.
- Quản lý không biết deal nào cần hỗ trợ trước.
- Báo cáo tuần mất 3-4 giờ tổng hợp thủ công.

Giải pháp:
SalesFlow chuẩn hóa pipeline thành 5 giai đoạn, tự động tạo nhắc việc sau mỗi cuộc gọi và hiển thị dashboard theo nguồn lead.

Kết quả sau 8 tuần:
- 96% lead mới được phân công trong ngày.
- Thời gian làm báo cáo tuần giảm còn khoảng 25 phút.
- Tỷ lệ follow-up đúng hẹn tăng rõ rệt theo dữ liệu CRM.

Quote:
"Điểm đáng giá nhất không phải là thêm một phần mềm, mà là cả team cùng nhìn một sự thật về pipeline." - Trưởng phòng Kinh doanh

CTA:
Xem cách SalesFlow có thể mô phỏng pipeline của đội bạn`
      }
    ]
  },
  fnb: {
    name: 'Ẩm Thực F&B',
    examples: [
      {
        type: 'Menu Copy',
        title: 'Mô tả món signature',
        content: `Món:
Mì Ý cua sốt kem tiêu xanh

Mô tả ngắn:
Sợi spaghetti áo đều lớp sốt kem tiêu xanh béo nhẹ, kết hợp thịt cua tươi được xào nhanh cùng tỏi, bơ lạt và rượu vang trắng. Món ăn có độ thơm rõ, vị cay nhẹ cuối lưỡi và hậu vị ngọt tự nhiên từ cua.

Điểm khác biệt:
- Thịt cua được gỡ trong ngày, không dùng thanh cua thay thế.
- Sốt kem nấu theo mẻ nhỏ để giữ độ mượt và không bị ngấy.
- Có thể giảm tiêu xanh cho khách không ăn cay.

Gợi ý upsell:
Dùng kèm salad rocket chanh vàng hoặc một ly sparkling water để cân bằng vị béo.

CTA tại menu:
Phù hợp cho bữa tối nhẹ nhưng vẫn muốn một món chính đủ ấn tượng.`
      },
      {
        type: 'Social Post',
        title: 'Bài đăng giới thiệu set lunch',
        content: `Hook:
Một bữa trưa ngon không cần kéo dài cả buổi.

Caption:
Từ thứ 2 đến thứ 6, Luma Bistro phục vụ set lunch 3 món cho khách văn phòng muốn ăn gọn, đủ chất và vẫn có cảm giác được nghỉ giữa ngày.

Set gồm:
- Soup hoặc salad theo ngày.
- Món chính: gà nướng thảo mộc, cá áp chảo hoặc pasta nấm.
- Tráng miệng mini và trà lạnh.

Thời gian phục vụ:
11:00 - 14:00, từ thứ 2 đến thứ 6.

CTA:
Đặt bàn trước 10:30 để được giữ chỗ gần cửa sổ.

Hashtags:
#LumaBistro #SetLunch #AnTruaVanPhong #NhaHangQuan1`
      },
      {
        type: 'Event Copy',
        title: 'Thông báo khai trương chi nhánh',
        content: `Headline:
Luma Bistro mở chi nhánh mới tại Thảo Điền

Subheadline:
Không gian ấm, thực đơn Âu hiện đại và khu bàn ngoài trời dành cho những buổi tối chậm lại một chút.

Thông tin sự kiện:
- Thời gian khai trương: 18:00, ngày 08/06/2026.
- Địa chỉ: 24 Đường số 12, Thảo Điền, TP. Thủ Đức.
- Thực đơn khai trương: 5 món signature và 3 món tráng miệng mới.

Ưu đãi mở bán:
Khách đặt bàn trong 7 ngày đầu nhận 1 phần dessert tasting cho mỗi bàn từ 2 người.

CTA:
Giữ bàn khai trương

Microcopy:
Số lượng bàn ngoài trời có hạn, ưu tiên theo thời gian đặt trước.`
      }
    ]
  },
  healthcare: {
    name: 'Y Tế & Sức Khỏe',
    examples: [
      {
        type: 'Service Page',
        title: 'Gói khám sức khỏe tổng quát',
        content: `Brief: Gói khám tổng quát cho nhân viên văn phòng 28-45 tuổi.

Hero headline:
Kiểm tra sức khỏe định kỳ để hiểu cơ thể trước khi các dấu hiệu nhỏ bị bỏ qua.

Subheadline:
Gói khám Tổng quát Cơ bản tại An Tâm Clinic giúp đánh giá các chỉ số quan trọng về tim mạch, gan thận, đường huyết và tình trạng dinh dưỡng. Kết quả được bác sĩ giải thích rõ, dễ hiểu và có khuyến nghị theo từng trường hợp.

Hạng mục chính:
- Khám lâm sàng với bác sĩ nội tổng quát.
- Xét nghiệm máu, nước tiểu và chỉ số chuyển hóa cơ bản.
- Đo huyết áp, BMI, điện tim theo chỉ định gói.
- Tư vấn sau khám và hướng dẫn theo dõi nếu có chỉ số cần lưu ý.

Điểm tạo niềm tin:
- Lịch hẹn rõ ràng, hạn chế chờ lâu.
- Kết quả được lưu trữ bảo mật.
- Có tư vấn trước để chọn gói phù hợp tuổi, giới tính và tiền sử sức khỏe.

CTA:
Đặt lịch khám phù hợp với thời gian của bạn

Lưu ý:
Nội dung không thay thế chẩn đoán y khoa. Khách hàng cần trao đổi trực tiếp với bác sĩ khi có triệu chứng bất thường.`
      },
      {
        type: 'Educational Post',
        title: 'Bài giáo dục sức khỏe',
        content: `Hook:
Mệt mỏi kéo dài không phải lúc nào cũng do "thiếu ngủ vài hôm".

Nội dung:
Nếu tình trạng mệt mỏi lặp lại nhiều tuần, bạn nên quan sát thêm các dấu hiệu đi kèm:

- Ngủ đủ nhưng vẫn uể oải vào buổi sáng.
- Chóng mặt, hồi hộp hoặc khó tập trung.
- Sụt cân, chán ăn hoặc thay đổi thói quen tiêu hóa.
- Căng thẳng kéo dài, dễ cáu gắt, giảm hiệu suất làm việc.

Bạn có thể bắt đầu bằng những việc đơn giản:
- Ghi lại thời gian ngủ, mức độ mệt và bữa ăn trong 7 ngày.
- Uống đủ nước, giảm caffeine sau 15:00.
- Đặt lịch kiểm tra sức khỏe nếu triệu chứng không cải thiện.

CTA:
Trao đổi với bác sĩ nếu tình trạng mệt mỏi kéo dài hơn 2 tuần.

Lưu ý:
Không tự dùng thuốc bổ hoặc thuốc điều trị khi chưa có tư vấn chuyên môn.`
      },
      {
        type: 'Reminder Email',
        title: 'Email nhắc lịch tái khám',
        content: `Subject:
Nhắc lịch tái khám của anh/chị tại An Tâm Clinic

Preview text:
Vui lòng xác nhận lịch hẹn để phòng khám chuẩn bị hồ sơ và rút ngắn thời gian chờ.

Kính gửi anh/chị [Tên],

An Tâm Clinic xin nhắc anh/chị về lịch tái khám:

- Thời gian: [Giờ], [Ngày]
- Chuyên khoa: [Chuyên khoa]
- Bác sĩ phụ trách: [Tên bác sĩ]
- Địa chỉ: [Địa chỉ phòng khám]

Anh/chị vui lòng mang theo:
- Kết quả xét nghiệm hoặc toa thuốc gần nhất nếu có.
- Danh sách thuốc đang sử dụng.
- Các câu hỏi cần trao đổi thêm với bác sĩ.

CTA:
Xác nhận lịch hẹn

Nếu cần đổi lịch, anh/chị có thể phản hồi email này hoặc gọi hotline [Số điện thoại] trước giờ hẹn ít nhất 4 tiếng.`
      }
    ]
  },
  education: {
    name: 'Giáo Dục',
    examples: [
      {
        type: 'Course Landing',
        title: 'Trang khóa học phân tích dữ liệu',
        content: `Brief: Khóa học Data Analytics cho người đi làm muốn chuyển hướng nghề nghiệp.

Hero headline:
Học phân tích dữ liệu bằng dự án thực tế, không học rời rạc từng công cụ.

Subheadline:
Trong 12 tuần, bạn sẽ học Excel nâng cao, SQL, Power BI và tư duy phân tích qua các bài toán bán hàng, vận hành và marketing. Mục tiêu là xây portfolio có thể trình bày trong buổi phỏng vấn.

Đối tượng phù hợp:
- Nhân viên văn phòng muốn dùng dữ liệu để ra quyết định tốt hơn.
- Người muốn chuyển sang vị trí Data Analyst entry-level.
- Chủ shop hoặc marketer muốn tự đọc báo cáo kinh doanh.

Bạn sẽ làm được:
- Viết truy vấn SQL để lấy và làm sạch dữ liệu.
- Xây dashboard Power BI có insight rõ.
- Trình bày phát hiện bằng ngôn ngữ kinh doanh.
- Hoàn thiện 3 dự án portfolio có feedback từ mentor.

Bằng chứng:
Học viên được chấm bài theo rubric, có buổi sửa CV và mock interview cuối khóa.

CTA:
Nhận lộ trình học và bài kiểm tra đầu vào`
      },
      {
        type: 'Nurture Email',
        title: 'Email nuôi dưỡng lead khóa học',
        content: `Subject:
Bạn nên học SQL hay Power BI trước?

Preview text:
Câu trả lời phụ thuộc vào mục tiêu công việc và loại dữ liệu bạn đang xử lý.

Chào [Tên],

Nhiều bạn bắt đầu học phân tích dữ liệu bằng cách mở ngay một công cụ mới. Điều đó không sai, nhưng dễ khiến việc học bị rời rạc.

Nếu bạn đang đi làm và muốn ứng dụng sớm, thứ tự nên là:

1. Tư duy đặt câu hỏi kinh doanh.
Bạn cần biết mình đang muốn trả lời điều gì trước khi kéo chart.

2. Excel hoặc SQL để làm sạch và chuẩn bị dữ liệu.
Dữ liệu đầu vào gọn thì dashboard mới có ý nghĩa.

3. Power BI để trực quan hóa và kể câu chuyện từ số liệu.
Dashboard tốt không chỉ đẹp, mà giúp người xem ra quyết định.

Trong buổi tư vấn miễn phí, mentor sẽ giúp bạn chọn lộ trình theo nền tảng hiện tại.

CTA:
Đặt lịch tư vấn lộ trình 15 phút`
      },
      {
        type: 'Testimonial',
        title: 'Câu chuyện học viên',
        content: `Quote:
"Trước khóa học, tôi chỉ biết làm báo cáo Excel theo mẫu có sẵn. Sau 12 tuần, tôi tự xây được dashboard doanh thu và giải thích được vì sao một nhóm sản phẩm tăng trưởng chậm."

Người chia sẻ:
Minh Anh, 27 tuổi, nhân viên kinh doanh tại công ty FMCG.

Bối cảnh:
Minh Anh muốn chuyển sang vai trò Sales Analyst nhưng thiếu portfolio và chưa quen SQL.

Trải nghiệm học:
Bạn bắt đầu từ case dữ liệu bán hàng quen thuộc, sau đó học cách làm sạch dữ liệu, viết truy vấn cơ bản và dựng dashboard Power BI. Mentor góp ý từng dự án để phần phân tích bớt kể lể và tập trung vào insight.

Kết quả:
Sau khóa học, Minh Anh có 3 dự án portfolio, tự tin trình bày logic phân tích trong phỏng vấn và nhận được lời mời cho vị trí Junior Data Analyst.

CTA mềm:
Nếu bạn cũng đang muốn chuyển hướng bằng dữ liệu, hãy bắt đầu bằng một lộ trình có dự án thật.`
      }
    ]
  },
  finance: {
    name: 'Tài Chính',
    examples: [
      {
        type: 'Product Page',
        title: 'Trang dịch vụ tư vấn tài chính cá nhân',
        content: `Brief: Dịch vụ tư vấn lập kế hoạch tài chính cá nhân cho người đi làm 25-40 tuổi.

Hero headline:
Lập kế hoạch tiền bạc rõ ràng hơn trước khi bạn ra quyết định lớn.

Subheadline:
FinWise giúp bạn nhìn lại dòng tiền, mục tiêu tiết kiệm, bảo hiểm, khoản vay và kế hoạch đầu tư ở mức phù hợp khẩu vị rủi ro. Buổi tư vấn tập trung vào quyết định thực tế, không bán sản phẩm bằng lời hứa lợi nhuận.

Vấn đề thường gặp:
- Thu nhập ổn nhưng cuối tháng không biết tiền đi đâu.
- Có nhiều mục tiêu cùng lúc: mua nhà, quỹ dự phòng, học thêm, đầu tư.
- Không rõ nên ưu tiên trả nợ, tiết kiệm hay đầu tư trước.

Dịch vụ gồm:
- Phân tích dòng tiền cá nhân.
- Xác định quỹ dự phòng và mục tiêu theo mốc thời gian.
- Gợi ý phân bổ tài sản theo khả năng chịu rủi ro.
- Kế hoạch hành động 90 ngày đầu.

CTA:
Đặt buổi tư vấn tài chính cá nhân

Lưu ý:
Nội dung tư vấn không cam kết lợi nhuận và không thay thế tư vấn đầu tư được cấp phép trong các trường hợp cần chứng chỉ chuyên môn.`
      },
      {
        type: 'Educational Post',
        title: 'Bài giáo dục tài chính',
        content: `Hook:
Quỹ dự phòng không làm bạn giàu nhanh, nhưng giúp bạn không phải bán tài sản sai thời điểm.

Nội dung:
Trước khi bắt đầu đầu tư dài hạn, hãy kiểm tra quỹ dự phòng của bạn:

- Người độc thân: thường nên có 3-6 tháng chi phí thiết yếu.
- Gia đình có con nhỏ hoặc thu nhập không ổn định: nên cân nhắc 6-12 tháng.
- Khoản này nên để ở nơi dễ rút, ít biến động, không đặt mục tiêu sinh lời cao.

Cách bắt đầu:
1. Tính chi phí thiết yếu mỗi tháng.
2. Tách tài khoản riêng cho quỹ dự phòng.
3. Tự động chuyển một khoản cố định ngay sau khi nhận lương.
4. Chỉ dùng cho tình huống khẩn cấp thật sự.

CTA:
Tải checklist lập quỹ dự phòng cá nhân.

Lưu ý:
Đây là nội dung giáo dục tài chính chung, không phải khuyến nghị đầu tư cá nhân.`
      },
      {
        type: 'Email Marketing',
        title: 'Email mời tư vấn kế hoạch tài chính',
        content: `Subject:
Một bản kế hoạch tài chính 90 ngày có thể giúp bạn bắt đầu rõ hơn

Preview text:
Không cần quyết định đầu tư ngay. Hãy bắt đầu bằng việc hiểu dòng tiền hiện tại.

Chào [Tên],

Nếu bạn đang có nhiều mục tiêu cùng lúc như mua nhà, học thêm, xây quỹ dự phòng hoặc đầu tư dài hạn, việc khó nhất thường không phải là thiếu thông tin. Việc khó là biết nên ưu tiên điều gì trước.

Trong buổi tư vấn 60 phút, chuyên viên FinWise sẽ cùng bạn:
- Rà soát dòng tiền hiện tại.
- Xác định mục tiêu theo mức độ ưu tiên.
- Đề xuất kế hoạch hành động 90 ngày.
- Chỉ ra các rủi ro cần lưu ý trước khi ra quyết định.

CTA:
Đặt lịch tư vấn 60 phút

P.S. Buổi tư vấn không yêu cầu bạn mua sản phẩm tài chính. Mục tiêu là giúp bạn có một bản đồ rõ hơn trước khi đi tiếp.`
      }
    ]
  },
  fashion: {
    name: 'Thời Trang',
    examples: [
      {
        type: 'Collection Launch',
        title: 'Ra mắt bộ sưu tập linen',
        content: `Hero headline:
Linen cho những ngày cần mặc đẹp mà vẫn thở được.

Subheadline:
Bộ sưu tập Linen Ease được thiết kế cho nhịp sống thành thị: form rộng vừa phải, màu trung tính dễ phối và chất vải thoáng cho những ngày di chuyển nhiều.

Tinh thần bộ sưu tập:
Không cầu kỳ, không chạy theo trend quá ngắn. Mỗi thiết kế tập trung vào phom dáng, độ rũ và khả năng phối lại trong nhiều hoàn cảnh.

Sản phẩm nổi bật:
- Áo sơ mi linen cổ mở: phù hợp đi làm và cuối tuần.
- Quần ống suông lưng cao: tôn dáng, dễ phối sandal hoặc loafer.
- Đầm midi dây bản lớn: gọn gàng, có túi, mặc riêng hoặc khoác blazer.

Offer:
Giảm 15% cho đơn đầu tiên thuộc bộ sưu tập Linen Ease trong 5 ngày mở bán.

CTA:
Khám phá Linen Ease`
      },
      {
        type: 'Instagram Post',
        title: 'Caption phối đồ',
        content: `Hook:
Một chiếc sơ mi linen có thể đi qua cả ngày nếu bạn phối đúng.

Caption:
Gợi ý hôm nay từ Linen Ease:

Buổi sáng đi làm:
Sơ mi linen trắng, quần suông màu olive, loafer nâu.

Buổi chiều cafe:
Mở một nút cổ áo, đổi sang sandal da và thêm túi canvas.

Buổi tối gặp bạn:
Khoác cardigan mỏng, thêm khuyên tai nhỏ để tổng thể mềm hơn.

Điểm hay của linen là càng mặc càng có độ rũ tự nhiên. Không cần quá phẳng phiu, chỉ cần vừa vặn và thoải mái.

CTA:
Lưu bài này cho lần bạn không biết mặc gì.

Hashtags:
#LinenEase #MinimalWardrobe #MacDepMoiNgay #ThoiTrangNu`
      },
      {
        type: 'Product Page',
        title: 'Mô tả sản phẩm đầm midi',
        content: `Tên sản phẩm:
Đầm midi Linen Ease màu Sage

Mô tả ngắn:
Chiếc đầm midi dành cho những ngày bạn muốn mặc gọn, thoáng và vẫn đủ chỉn chu. Phom chữ A nhẹ giúp di chuyển thoải mái, phần dây bản lớn che bra strap tốt hơn và túi hai bên đủ sâu cho điện thoại hoặc thẻ.

Chi tiết sản phẩm:
- Chất liệu: linen pha rayon để giảm nhăn cứng và tăng độ rũ.
- Lót thân trên mỏng, không bí.
- Khóa kéo sau lưng, dễ mặc một mình.
- Dài qua gối, phù hợp đi làm, đi chơi hoặc du lịch.

Gợi ý chọn size:
Nếu bạn ở giữa hai size và thích mặc thoải mái, nên chọn size lớn hơn.

CTA:
Chọn size đầm Linen Ease`
      }
    ]
  },
  business: {
    name: 'Dịch Vụ Doanh Nghiệp',
    examples: [
      {
        type: 'B2B Landing',
        title: 'Trang dịch vụ tư vấn vận hành',
        content: `Brief: Dịch vụ tư vấn chuẩn hóa vận hành cho SME 20-200 nhân sự.

Hero headline:
Chuẩn hóa vận hành để doanh nghiệp bớt phụ thuộc vào trí nhớ của từng người.

Subheadline:
OpsLab giúp SME rà soát quy trình, phân quyền, biểu mẫu và dashboard quản trị để đội ngũ làm việc nhất quán hơn khi công ty bắt đầu mở rộng.

Vấn đề thường gặp:
- Mỗi phòng ban có một cách làm riêng.
- Người mới mất nhiều tuần để hiểu quy trình.
- Quản lý thiếu số liệu để biết điểm nghẽn nằm ở đâu.

Dịch vụ gồm:
- Audit quy trình hiện tại trong 2 tuần.
- Vẽ lại luồng công việc và trách nhiệm chính.
- Chuẩn hóa biểu mẫu, checklist, SLA nội bộ.
- Thiết kế dashboard theo chỉ số vận hành quan trọng.

Kết quả kỳ vọng:
Doanh nghiệp có một bộ quy trình dễ dùng, dễ bàn giao và đủ rõ để đo lường.

CTA:
Đăng ký buổi audit vận hành`
      },
      {
        type: 'Case Study',
        title: 'Case study dịch vụ tư vấn',
        content: `Khách hàng:
Chuỗi bán lẻ thiết bị gia dụng có 14 cửa hàng.

Thách thức:
- Quy trình xử lý bảo hành khác nhau giữa các cửa hàng.
- Khiếu nại bị chuyển qua nhiều người nhưng không có SLA rõ.
- Ban giám đốc chỉ nhận báo cáo tổng hợp cuối tháng, khó can thiệp sớm.

Giải pháp:
OpsLab chuẩn hóa 4 luồng chính: tiếp nhận bảo hành, kiểm tra sản phẩm, phản hồi khách hàng và báo cáo lỗi lặp lại. Mỗi bước có người phụ trách, thời hạn xử lý và mẫu cập nhật trạng thái.

Kết quả sau 10 tuần:
- Thời gian phản hồi đầu tiên giảm từ 24 giờ xuống còn dưới 6 giờ làm việc.
- 100% yêu cầu bảo hành được ghi nhận trên cùng một hệ thống.
- Quản lý vùng theo dõi được cửa hàng nào đang quá tải.

Quote:
"Chúng tôi không còn phải hỏi từng cửa hàng xem việc đến đâu. Mọi người nhìn cùng một quy trình và cùng một dashboard." - Giám đốc vận hành

CTA:
Xem mẫu audit quy trình cho doanh nghiệp của bạn`
      },
      {
        type: 'LinkedIn Post',
        title: 'Bài đăng chuyên môn B2B',
        content: `Hook:
Nhiều doanh nghiệp không thiếu người giỏi. Họ thiếu một cách làm đủ rõ để người giỏi không phải giải thích lại mọi thứ mỗi tuần.

Nội dung:
Khi công ty còn nhỏ, vận hành thường dựa vào kinh nghiệm cá nhân. Cách này linh hoạt, nhưng bắt đầu tạo chi phí ẩn khi đội ngũ tăng nhanh:

- Người mới hỏi lại cùng một vấn đề.
- Quản lý phải kiểm tra thủ công.
- Khách hàng nhận trải nghiệm không nhất quán.
- Dữ liệu nằm trong chat, file riêng và trí nhớ của từng người.

Chuẩn hóa vận hành không có nghĩa là làm công ty cứng nhắc. Một quy trình tốt nên giúp đội ngũ biết khi nào cần làm đúng chuẩn và khi nào cần linh hoạt có kiểm soát.

CTA:
Nếu doanh nghiệp đang mở rộng từ 20 lên 100 nhân sự, hãy bắt đầu bằng việc audit 3 quy trình lặp lại nhiều nhất.`
      }
    ]
  },
  travel: {
    name: 'Du Lịch',
    examples: [
      {
        type: 'Tour Package',
        title: 'Trang tour Nhật Bản mùa thu',
        content: `Hero headline:
Nhật Bản mùa thu, lịch trình vừa đủ để ngắm cảnh đẹp mà không phải chạy điểm.

Subheadline:
Tour 6 ngày 5 đêm Tokyo - Fuji - Kyoto dành cho nhóm khách muốn trải nghiệm văn hóa, ẩm thực và cảnh thu theo nhịp thoải mái hơn.

Điểm nổi bật:
- Ngắm lá đỏ tại khu vực Fuji hoặc Kyoto tùy thời điểm mùa.
- Trải nghiệm onsen một đêm tại khách sạn kiểu Nhật.
- Lịch trình có thời gian tự do mua sắm và khám phá khu phố địa phương.
- Hướng dẫn viên tiếng Việt theo đoàn.

Bao gồm:
- Vé máy bay khứ hồi theo chương trình.
- Khách sạn tiêu chuẩn 3-4 sao, phòng 2 người.
- Bữa ăn theo lịch trình, xe đưa đón và vé tham quan trong tour.
- Bảo hiểm du lịch theo quy định công ty.

CTA:
Nhận lịch khởi hành và báo giá chi tiết

Lưu ý:
Lịch ngắm lá đỏ phụ thuộc thời tiết từng năm. Công ty sẽ cập nhật điểm tham quan phù hợp trước ngày khởi hành.`
      },
      {
        type: 'Resort Email',
        title: 'Email khuyến mãi nghỉ dưỡng',
        content: `Subject:
Một cuối tuần chậm lại ở Phú Quốc

Preview text:
Ưu đãi 2 đêm tại Seabright Resort, bao gồm bữa sáng và đưa đón sân bay.

Chào [Tên],

Nếu bạn đang cần một kỳ nghỉ ngắn nhưng đủ riêng tư, Seabright Resort có gói cuối tuần dành cho cặp đôi và gia đình nhỏ trong tháng này.

Gói bao gồm:
- 2 đêm phòng Deluxe Garden hoặc Ocean View.
- Buffet sáng hằng ngày.
- Đưa đón sân bay theo lịch resort.
- Một buổi trà chiều cho 2 người.
- Ưu đãi 15% cho dịch vụ spa đặt trước.

Phù hợp nếu bạn muốn:
- Nghỉ ở khu yên tĩnh, không quá xa trung tâm.
- Có bãi biển riêng và hồ bơi cho trẻ em.
- Tối giản lịch trình, ưu tiên nghỉ ngơi hơn chạy tour.

CTA:
Kiểm tra phòng còn trống

P.S. Giá có thể thay đổi theo ngày lưu trú. Đặt sớm giúp bạn có nhiều lựa chọn hạng phòng hơn.`
      },
      {
        type: 'Social Post',
        title: 'Bài đăng tour nội địa',
        content: `Hook:
Đà Lạt vẫn có những góc rất yên nếu bạn không đi theo lịch trình quá dày.

Caption:
Tour Đà Lạt 3 ngày 2 đêm của Wander Viet được thiết kế cho nhóm bạn và gia đình nhỏ muốn nghỉ ngơi, ăn ngon và có ảnh đẹp mà không phải thức dậy từ 4 giờ sáng mỗi ngày.

Lịch trình có:
- Một buổi cafe sáng nhìn thung lũng.
- Tham quan nông trại rau và vườn dâu theo mùa.
- Bữa tối lẩu gà lá é hoặc set menu địa phương.
- Thời gian tự do ở trung tâm để mua quà và đi dạo.

CTA:
Nhắn tin để nhận lịch khởi hành tháng này.

Hashtags:
#DaLat #DuLichNoiDia #WanderViet #TourNhomNho`
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
        <BookOpen className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Mẫu Copy Thực Tế - {examples.name}</h2>
      </div>

      <Tabs defaultValue="0" className="w-full">
        <TabsList
          className="grid h-auto w-full gap-1"
          style={{ gridTemplateColumns: `repeat(${examples.examples.length}, minmax(0, 1fr))` }}
        >
          {examples.examples.map((example, index) => (
            <TabsTrigger key={example.title} value={String(index)} className="whitespace-normal py-2 text-xs sm:text-sm">
              {example.type}
            </TabsTrigger>
          ))}
        </TabsList>

        {examples.examples.map((example, index) => (
          <TabsContent key={example.title} value={String(index)} className="mt-4">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{example.type}</Badge>
                <h3 className="font-semibold text-lg">{example.title}</h3>
              </div>

              <div className="bg-surface-muted rounded-lg p-6 border border-border">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/80">
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
