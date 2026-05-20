import { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Copy, RefreshCw, Wand2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface CopywritingGeneratorProps {
  industry: string;
}

const copyTemplates: Record<string, Record<string, string[]>> = {
  ecommerce: {
    headline: [
      'Giảm Giá 50% - Chỉ Hôm Nay! Mua Ngay Kẻo Lỡ',
      'Miễn Phí Vận Chuyển Toàn Quốc - Đặt Hàng Ngay',
      'Flash Sale 24H - Giá Sốc Không Thể Bỏ Lỡ'
    ],
    description: [
      'Sản phẩm chất lượng cao, được hàng nghìn khách hàng tin dùng. Cam kết 100% hàng chính hãng, đổi trả miễn phí trong 7 ngày.',
      'Khám phá bộ sưu tập mới nhất với thiết kế độc đáo, phong cách hiện đại. Đặt hàng ngay để nhận ưu đãi đặc biệt.',
      'Sản phẩm được làm từ nguyên liệu cao cấp, đảm bảo an toàn cho sức khỏe. Mua 2 tặng 1 - Cơ hội vàng không nên bỏ lỡ!'
    ],
    cta: [
      'MUA NGAY - Nhận Ưu Đãi',
      'THÊM VÀO GIỎ HÀNG',
      'ĐẶT HÀNG NGAY - Freeship'
    ],
    social: [
      '🔥 SALE SẬP SÀN! Giảm đến 50% toàn bộ sản phẩm. Click ngay để không bỏ lỡ! 🛒',
      '✨ Sản phẩm mới về - Phiên bản giới hạn! Nhanh tay đặt hàng trước khi hết! 💝',
      '🎁 Mua 1 tặng 1 - Chương trình có giới hạn! Inbox ngay để được tư vấn! 📲'
    ]
  },
  realestate: {
    headline: [
      'Căn Hộ Cao Cấp - Vị Trí Vàng - Giá Hấp Dẫn',
      'Sở Hữu Nhà Mơ Ước - Chỉ Từ 2 Tỷ',
      'Dự Án Mới 2026 - Cơ Hội Đầu Tư Sinh Lời'
    ],
    description: [
      'Vị trí đắc địa tại trung tâm thành phố, gần trường học, bệnh viện, trung tâm thương mại. Thiết kế hiện đại, đầy đủ tiện ích 5 sao.',
      'Căn hộ 2-3 phòng ngủ, view đẹp, thoáng mát. Hỗ trợ vay ngân hàng lên đến 70%, lãi suất ưu đãi 0% trong 12 tháng đầu.',
      'Không gian sống xanh, an ninh 24/7, hồ bơi, phòng gym, công viên nội khu. Bàn giao hoàn thiện cao cấp.'
    ],
    cta: [
      'ĐĂNG KÝ THÔNG TIN',
      'LIÊN HỆ TƯ VẤN NGAY',
      'XEM BẢNG GIÁ CHI TIẾT'
    ],
    social: [
      '🏢 RA MẮT DỰ ÁN MỚI! Vị trí vàng - Giá đầu tư. Đặt chỗ ngay hôm nay để nhận ưu đãi khủng! 📞',
      '🏡 CĂN HỘ MẪU ĐÃ HOÀN THIỆN! Đến xem trực tiếp và nhận voucher 50 triệu. Đặt lịch tham quan ngay! ✨',
      '💰 CHÍNH SÁCH ƯU ĐÃI ĐẶC BIỆT! Chiết khấu 5%, tặng 2 năm phí quản lý. Inbox để được tư vấn chi tiết! 🎁'
    ]
  },
  technology: {
    headline: [
      'Công Nghệ Tiên Tiến - Giải Pháp Tối Ưu Cho Doanh Nghiệp',
      'Tăng Hiệu Suất 10x Với Phần Mềm Thông Minh',
      'Chuyển Đổi Số Dễ Dàng - Tiết Kiệm Chi Phí'
    ],
    description: [
      'Nền tảng công nghệ hàng đầu, được tin dùng bởi hơn 1000+ doanh nghiệp. Tích hợp dễ dàng, hỗ trợ 24/7.',
      'Giải pháp toàn diện giúp tự động hóa quy trình, tăng năng suất và giảm sai sót. Dùng thử miễn phí 30 ngày.',
      'Bảo mật tuyệt đối với công nghệ mã hóa tiên tiến. Giao diện thân thiện, dễ sử dụng cho mọi đối tượng.'
    ],
    cta: [
      'DÙNG THỬ MIỄN PHÍ',
      'ĐĂNG KÝ NGAY',
      'TƯ VẤN GIẢI PHÁP'
    ],
    social: [
      '🚀 RA MẮT TÍNH NĂNG MỚI! Tăng hiệu suất làm việc gấp 10 lần. Dùng thử miễn phí ngay hôm nay! 💻',
      '⚡ CÔNG NGHỆ AI TÂN TIẾN! Tự động hóa mọi quy trình trong 5 phút. Xem demo trực tiếp tại đây! 🤖',
      '🔒 BẢO MẬT TUYỆT ĐỐI! Giải pháp an toàn cho dữ liệu doanh nghiệp của bạn. Tìm hiểu ngay! 🛡️'
    ]
  },
  fnb: {
    headline: [
      'Món Ngon Mỗi Ngày - Giao Nhanh 30 Phút',
      'Ẩm Thực Đặc Sắc - Giá Cả Hợp Lý',
      'Buffet Cao Cấp - Chỉ Từ 299K'
    ],
    description: [
      'Thực đơn đa dạng với hơn 100 món ăn ngon. Nguyên liệu tươi sống, chế biến theo công thức truyền thống.',
      'Không gian sang trọng, phục vụ tận tình. Phù hợp cho gia đình, bạn bè và các buổi tiệc công ty.',
      'Combo tiết kiệm cho 2-4 người. Miễn phí nước uống và tráng miệng. Đặt bàn ngay để nhận ưu đãi!'
    ],
    cta: [
      'ĐẶT BÀN NGAY',
      'XEM THỰC ĐƠN',
      'GỌI MÓN ONLINE'
    ],
    social: [
      '🍜 MÓN MỚI RA LÒ! Phở bò đặc biệt với công thức bí truyền. Thử ngay hôm nay! 🔥',
      '🎉 KHAI TRƯƠNG CHI NHÁNH MỚI! Giảm 30% toàn menu. Check-in nhận thêm voucher 100k! 📍',
      '🥘 BUFFET CUỐI TUẦN! Hơn 50 món ngon chỉ 299k/người. Đặt bàn ngay kẻo hết chỗ! 🍽️'
    ]
  },
  healthcare: {
    headline: [
      'Chăm Sóc Sức Khỏe Toàn Diện - Uy Tín Hàng Đầu',
      'Khám Bệnh Nhanh - Không Cần Chờ Đợi',
      'Gói Khám Sức Khỏe - Giá Ưu Đãi'
    ],
    description: [
      'Đội ngũ bác sĩ giàu kinh nghiệm, trang thiết bị y tế hiện đại. Quy trình khám chuyên nghiệp, nhanh chóng.',
      'Gói khám sức khỏe tổng quát với 30+ hạng mục kiểm tra. Kết quả chính xác, tư vấn chi tiết từ chuyên gia.',
      'Hỗ trợ đặt lịch online, khám tại nhà cho người cao tuổi. Chấp nhận bảo hiểm y tế và thanh toán linh hoạt.'
    ],
    cta: [
      'ĐẶT LỊCH KHÁM',
      'TƯ VẤN MIỄN PHÍ',
      'XEM GÓI KHÁM'
    ],
    social: [
      '💚 GÓI KHÁM SỨC KHỎE TỔNG QUÁT! Chỉ 1.5 triệu - Kiểm tra 30+ hạng mục. Đặt lịch ngay! ☎️',
      '👨‍⚕️ BÁC SĨ CHUYÊN GIA TƯ VẤN MIỄN PHÍ! Đặt câu hỏi về sức khỏe qua hotline. Gọi ngay! 📞',
      '🏥 KHAI TRƯƠNG PHÒNG KHÁM MỚI! Ưu đãi 20% dịch vụ khám bệnh trong tháng đầu. Đăng ký ngay! ✨'
    ]
  },
  education: {
    headline: [
      'Khóa Học Chất Lượng - Giá Cả Phải Chăng',
      'Học Online Hiệu Quả - Linh Hoạt Thời Gian',
      'Chứng Chỉ Quốc Tế - Cơ Hội Việc Làm Cao'
    ],
    description: [
      'Giảng viên giàu kinh nghiệm, chương trình học cập nhật theo chuẩn quốc tế. Học lý thuyết kết hợp thực hành.',
      'Học viên được hỗ trợ tài liệu, video bài giảng trọn đời. Cam kết đầu ra hoặc học lại miễn phí.',
      'Lớp học nhỏ, tương tác cao. Hỗ trợ giới thiệu việc làm sau khóa học. Học phí ưu đãi khi đăng ký sớm.'
    ],
    cta: [
      'ĐĂNG KÝ HỌC',
      'TƯ VẤN KHÓA HỌC',
      'HỌC THỬ MIỄN PHÍ'
    ],
    social: [
      '📚 KHAI GIẢNG KHÓA HỌC MỚI! Lập trình từ A-Z cho người mới bắt đầu. Đăng ký ngay! 💻',
      '🎓 HỌC ONLINE LINH HOẠT! Xem lại bài giảng không giới hạn. Giảm 30% khi đăng ký hôm nay! ⏰',
      '🏆 CHỨNG CHỈ QUỐC TẾ! Tăng cơ hội việc làm với bằng cấp uy tín. Tư vấn miễn phí! 📞'
    ]
  },
  finance: {
    headline: [
      'Giải Pháp Tài Chính Thông Minh - An Toàn & Hiệu Quả',
      'Vay Vốn Nhanh - Lãi Suất Ưu Đãi',
      'Đầu Tư Sinh Lời - Rủi Ro Thấp'
    ],
    description: [
      'Dịch vụ tài chính đa dạng, phù hợp với mọi nhu cầu. Quy trình nhanh gọn, hỗ trợ 24/7.',
      'Lãi suất cạnh tranh, không phí ẩn. Duyệt hồ sơ trong 24h, giải ngân nhanh chóng.',
      'Đội ngũ chuyên viên tư vấn giàu kinh nghiệm. Bảo mật thông tin tuyệt đối, tuân thủ quy định pháp luật.'
    ],
    cta: [
      'ĐĂNG KÝ NGAY',
      'TƯ VẤN MIỄN PHÍ',
      'TÍNH TOÁN LÃI SUẤT'
    ],
    social: [
      '💰 LÃI SUẤT ƯU ĐÃI CHỈ TỪ 0.5%/THÁNG! Vay nhanh, duyệt dễ. Đăng ký ngay! 📱',
      '📈 ĐẦU TƯ THÔNG MINH! Lợi nhuận ổn định, rủi ro thấp. Tư vấn miễn phí từ chuyên gia! 💼',
      '🎁 ƯU ĐÃI ĐẶC BIỆT! Miễn phí quản lý tài khoản 12 tháng đầu. Mở tài khoản ngay! ✨'
    ]
  },
  fashion: {
    headline: [
      'Thời Trang Xu Hướng 2026 - Giá Tốt Nhất',
      'Bộ Sưu Tập Mới - Phong Cách Độc Đáo',
      'Sale Up To 70% - Mua Ngay Kẻo Lỡ'
    ],
    description: [
      'Thiết kế độc quyền, chất liệu cao cấp, form dáng chuẩn. Phù hợp với mọi lứa tuổi và phong cách.',
      'Xu hướng thời trang hot nhất 2026. Mẫu mã đa dạng, size từ S đến XXL. Miễn phí đổi trả trong 7 ngày.',
      'Ưu đãi đặc biệt khi mua combo. Freeship toàn quốc cho đơn từ 299k. Tích điểm đổi quà hấp dẫn.'
    ],
    cta: [
      'MUA NGAY',
      'XEM BỘ SƯU TẬP',
      'TƯ VẤN SIZE'
    ],
    social: [
      '👗 BỘ SƯU TẬP MỚI RA MẮT! Phong cách hiện đại, trendy. Sale 50% ngày đầu tiên! 🛍️',
      '✨ THỜI TRANG CAO CẤP GIÁ BÌNH DÂN! Chất liệu premium, thiết kế sang trọng. Mua ngay! 💝',
      '🔥 FLASH SALE 24H! Giảm đến 70% toàn bộ sản phẩm. Nhanh tay kẻo hết hàng! ⏰'
    ]
  },
  business: {
    headline: [
      'Giải Pháp Toàn Diện Cho Doanh Nghiệp',
      'Tối Ưu Hoạt Động - Tăng Doanh Thu',
      'Dịch Vụ Chuyên Nghiệp - Uy Tín Hàng Đầu'
    ],
    description: [
      'Đội ngũ chuyên gia nhiều năm kinh nghiệm, am hiểu thị trường. Giải pháp tùy chỉnh theo nhu cầu doanh nghiệp.',
      'Quy trình làm việc chuyên nghiệp, minh bạch. Cam kết chất lượng, đúng tiến độ. Hỗ trợ sau bán hàng lâu dài.',
      'Giá cả cạnh tranh, linh hoạt thanh toán. Được hơn 500+ doanh nghiệp tin tưởng lựa chọn.'
    ],
    cta: [
      'LIÊN HỆ TƯ VẤN',
      'XEM DỊCH VỤ',
      'ĐẶT LỊCH HẸN'
    ],
    social: [
      '💼 GIẢI PHÁP TĂNG TRƯỞNG CHO DOANH NGHIỆP! Tư vấn miễn phí từ chuyên gia. Đăng ký ngay! 📊',
      '🚀 TỐI ƯU QUY TRÌNH KINH DOANH! Tiết kiệm 40% chi phí vận hành. Liên hệ ngay! ☎️',
      '🎯 CHIẾN LƯỢC MARKETING HIỆU QUẢ! Tăng doanh thu gấp 3 lần trong 6 tháng. Inbox để biết thêm! 📈'
    ]
  },
  travel: {
    headline: [
      'Du Lịch Trọn Gói - Giá Cực Ưu Đãi',
      'Khám Phá Thiên Đường - Trải Nghiệm Tuyệt Vời',
      'Tour Hot 2026 - Đặt Ngay Kẻo Hết Chỗ'
    ],
    description: [
      'Tour du lịch chất lượng cao, lịch trình hợp lý. Khách sạn 4-5 sao, xe đưa đón riêng, hướng dẫn viên nhiệt tình.',
      'Bữa ăn ngon, check-in điểm đẹp. Bảo hiểm du lịch toàn diện. Không phát sinh chi phí ẩn.',
      'Ưu đãi đặc biệt cho nhóm, gia đình. Hỗ trợ làm visa nhanh chóng. Đặt tour sớm giảm đến 20%.'
    ],
    cta: [
      'ĐặT TOUR NGAY',
      'TƯ VẤN LỊCH TRÌNH',
      'XEM TOUR HOT'
    ],
    social: [
      '✈️ TOUR CHÂU ÂU 7 NGÀY! Trọn gói chỉ 35 triệu. Khởi hành tháng 3. Đặt ngay! 🌍',
      '🏝️ NGHỈ DƯỠNG BIỂN PHÚ QUỐC! Resort 5 sao, giá chỉ 4.9tr/người. Book ngay kẻo lỡ! 🌊',
      '🎒 TOUR KHÁM PHÁ MIỀN TÂY! 3 ngày 2 đêm, trải nghiệm văn hóa đặc sắc. Chỉ 2.5 triệu! 🚤'
    ]
  }
};

export function CopywritingGenerator({ industry }: CopywritingGeneratorProps) {
  const [generatedCopy, setGeneratedCopy] = useState('');
  const [copyType, setCopyType] = useState('headline');
  const [productName, setProductName] = useState('');
  const [keywords, setKeywords] = useState('');

  const generateCopy = () => {
    const templates = copyTemplates[industry]?.[copyType] || [];
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    
    let copy = randomTemplate;
    if (productName) {
      copy = copy.replace(/Sản phẩm|Món|Khóa học|Dịch vụ|Tour/gi, productName);
    }
    
    setGeneratedCopy(copy);
    toast.success('Đã tạo copy thành công!');
  };

  const copyCopy = () => {
    if (generatedCopy) {
      navigator.clipboard.writeText(generatedCopy);
      toast.success('Đã sao chép vào clipboard!');
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Wand2 className="w-6 h-6 text-stone-600" />
        <h2 className="text-2xl font-bold">Tạo Nội dung Marketing</h2>
      </div>

      <Tabs value={copyType} onValueChange={setCopyType} className="mb-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
          <TabsTrigger value="headline">Tiêu Đề</TabsTrigger>
          <TabsTrigger value="description">Mô Tả</TabsTrigger>
          <TabsTrigger value="cta">Call-to-Action</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
        </TabsList>

        <TabsContent value="headline" className="mt-4">
          <p className="text-sm text-gray-600 mb-4">
            Tạo tiêu đề hấp dẫn, thu hút sự chú ý của khách hàng ngay lập tức
          </p>
        </TabsContent>
        <TabsContent value="description" className="mt-4">
          <p className="text-sm text-gray-600 mb-4">
            Mô tả sản phẩm/dịch vụ chi tiết, làm nổi bật lợi ích và giá trị
          </p>
        </TabsContent>
        <TabsContent value="cta" className="mt-4">
          <p className="text-sm text-gray-600 mb-4">
            Tạo lời kêu gọi hành động mạnh mẽ, thúc đẩy khách hàng chuyển đổi
          </p>
        </TabsContent>
        <TabsContent value="social" className="mt-4">
          <p className="text-sm text-gray-600 mb-4">
            Nội dung cho Facebook, Instagram, TikTok với hashtag và emoji
          </p>
        </TabsContent>
      </Tabs>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <Label htmlFor="productName">Tên sản phẩm/dịch vụ (tùy chọn)</Label>
          <Input
            id="productName"
            placeholder="VD: Áo thun cotton..."
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="keywords">Từ khóa (tùy chọn)</Label>
          <Input
            id="keywords"
            placeholder="VD: cao cấp, giá tốt, chất lượng..."
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            className="mt-2"
          />
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <Button onClick={generateCopy} className="flex-1 bg-stone-600 hover:bg-stone-700">
          <RefreshCw className="w-4 h-4 mr-2" />
          Tạo Nội Dung
        </Button>
      </div>

      {generatedCopy && (
        <div className="bg-gray-50 rounded-lg p-4 border-2 border-stone-200">
          <div className="flex justify-between items-start mb-2">
            <Label className="text-sm font-semibold text-stone-600">Kết quả:</Label>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={copyCopy}
              className="h-8"
            >
              <Copy className="w-4 h-4 mr-1" />
              Sao chép
            </Button>
          </div>
          <Textarea
            value={generatedCopy}
            onChange={(e) => setGeneratedCopy(e.target.value)}
            className="min-h-[100px] bg-white"
          />
        </div>
      )}
    </Card>
  );
}
