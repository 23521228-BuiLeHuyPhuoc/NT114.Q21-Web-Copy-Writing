import { Card } from '@/app/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/app/components/ui/accordion';
import { Lightbulb } from 'lucide-react';

export function TipsSection() {
  const tips = [
    {
      title: 'Hiểu rõ khách hàng mục tiêu',
      content: `Trước khi viết copy, hãy tìm hiểu kỹ về đối tượng khách hàng:
      
• Độ tuổi, giới tính, thu nhập
• Nhu cầu và mong muốn
• Vấn đề họ đang gặp phải
• Ngôn ngữ họ thường sử dụng

Viết copy bằng ngôn ngữ của khách hàng sẽ giúp thông điệp dễ tiếp cận và gây được sự đồng cảm hơn.`
    },
    {
      title: 'Sử dụng công thức AIDA',
      content: `AIDA là công thức copywriting hiệu quả:

A - Attention (Thu hút chú ý): Tiêu đề hấp dẫn, gây tò mò
I - Interest (Tạo hứng thú): Nội dung liên quan đến nhu cầu
D - Desire (Kích thích mong muốn): Làm nổi bật lợi ích, giá trị
A - Action (Kêu gọi hành động): CTA rõ ràng, mạnh mẽ

Ví dụ:
• A: "Giảm 50% - Chỉ hôm nay!"
• I: "Sản phẩm chất lượng cao, được nghìn người tin dùng"
• D: "Tiết kiệm 5 triệu, nhận quà 2 triệu"
• A: "MUA NGAY - Số lượng có hạn!"`
    },
    {
      title: 'Tập trung vào lợi ích, không phải tính năng',
      content: `Khách hàng quan tâm đến những gì sản phẩm mang lại cho họ:

❌ SAI: "Laptop RAM 16GB, SSD 512GB"
✅ ĐÚNG: "Làm việc đa nhiệm mượt mà, khởi động nhanh trong 5 giây"

❌ SAI: "Kem chống nắng SPF 50+"
✅ ĐÚNG: "Bảo vệ làn da khỏi tia UV, ngăn ngừa nám sạm và lão hóa"

Hãy chuyển tính năng thành lợi ích cụ thể mà khách hàng có thể cảm nhận được.`
    },
    {
      title: 'Tạo sự khan hiếm và cấp bách',
      content: `Thúc đẩy hành động ngay lập tức bằng cách:

• Giới hạn số lượng: "Chỉ còn 10 sản phẩm cuối cùng"
• Giới hạn thời gian: "Flash sale 24h", "Ưu đãi đến hết tháng"
• Giới hạn đối tượng: "Dành riêng cho 100 khách hàng đầu tiên"

Lưu ý: Phải trung thực, không lạm dụng để không mất lòng tin khách hàng.`
    },
    {
      title: 'Sử dụng bằng chứng xã hội',
      content: `Xây dựng niềm tin thông qua:

• Đánh giá khách hàng: "4.8/5 sao - 10,000 đánh giá"
• Số liệu cụ thể: "Được 50,000+ khách hàng tin dùng"
• Chứng nhận: "Chứng nhận FDA", "Top 10 sản phẩm tốt nhất"
• Case study: "Khách hàng X tăng doanh thu 300%"
• Testimonial: Lời chứng thực từ khách hàng thực

Bằng chứng xã hội giúp giảm rủi ro và tăng độ tin cậy.`
    },
    {
      title: 'Viết CTA (Call-to-Action) mạnh mẽ',
      content: `CTA hiệu quả cần:

• Rõ ràng: "Mua ngay", "Đăng ký học", "Đặt lịch hẹn"
• Tạo giá trị: "Nhận ưu đãi 50%", "Dùng thử miễn phí"
• Tạo cấp bách: "Đăng ký ngay - Còn 5 suất", "Mua hôm nay"
• Giảm rủi ro: "Dùng thử 30 ngày", "Hoàn tiền 100%"

Ví dụ CTA tốt:
✓ "MUA NGAY - Giảm 50%"
✓ "ĐĂNG KÝ - Nhận quà 2 triệu"
✓ "DÙNG THỬ MIỄN PHÍ - Không cần thẻ tín dụng"`
    },
    {
      title: 'Tối ưu cho từng kênh truyền thông',
      content: `Mỗi kênh có đặc điểm riêng:

📱 FACEBOOK/INSTAGRAM:
• Ngắn gọn, súc tích (100-150 từ)
• Sử dụng emoji để thu hút
• Hashtag phù hợp (#thuongmaidientu)
• Kèm hình ảnh/video chất lượng

✉️ EMAIL:
• Subject line hấp dẫn
• Personalization (Xin chào [Tên])
• Nội dung chia đoạn, dễ đọc
• 1 CTA chính rõ ràng

🌐 WEBSITE:
• Headline mạnh mẽ
• Bullet points dễ scan
• Trust signals (chứng nhận, đánh giá)
• CTA nổi bật trên fold

💬 ZALO/SMS:
• Cực kỳ ngắn gọn (< 100 từ)
• Đi thẳng vào ưu đãi
• Link rút gọn`
    },
    {
      title: 'Kiểm tra và tối ưu liên tục',
      content: `Copywriting là quá trình cải tiến không ngừng:

• A/B Testing: Test nhiều phiên bản tiêu đề, CTA
• Phân tích dữ liệu: Click rate, conversion rate, engagement
• Thu thập feedback: Hỏi ý kiến khách hàng
• Học từ đối thủ: Nghiên cứu copy của competitor
• Cập nhật xu hướng: Ngôn ngữ, meme, trend mới

Theo dõi các chỉ số:
• CTR (Click-through rate)
• Conversion rate
• Engagement (like, comment, share)
• ROI (Return on Investment)

Điều chỉnh chiến lược dựa trên kết quả thực tế.`
    }
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Lightbulb className="w-6 h-6 text-amber-600" />
        <h2 className="text-2xl font-bold">Tips & Chiến Lược Copywriting</h2>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {tips.map((tip, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left">
              <span className="font-semibold">{index + 1}. {tip.title}</span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-700">
                  {tip.content}
                </pre>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="mt-6 p-4 bg-gradient-to-r from-stone-100 to-stone-100 rounded-lg">
        <h3 className="font-semibold text-lg mb-2">💡 Lời khuyên cuối cùng:</h3>
        <p className="text-sm text-gray-700">
          Copy tốt nhất là copy được viết từ góc nhìn của khách hàng, giải quyết vấn đề của họ và mang lại giá trị thực sự. 
          Hãy luôn đặt mình vào vị trí khách hàng khi viết copy và tự hỏi: "Nếu tôi là khách hàng, thông điệp này có thuyết phục tôi không?"
        </p>
      </div>
    </Card>
  );
}
