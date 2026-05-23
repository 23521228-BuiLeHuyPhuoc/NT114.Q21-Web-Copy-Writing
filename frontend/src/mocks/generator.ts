import {
  Star, BarChart3, ShoppingBag, Building2, Laptop, Utensils, Heart,
  GraduationCap, DollarSign, Shirt, Briefcase, Plane,
  Target, MessageSquare, FileText, Globe, Mail, Megaphone,
} from 'lucide-react';

export const MODELS = [
  { id: 'gemini-flash', name: 'Gemini 2.5 Flash', badge: 'Free', color: 'text-green-600', desc: 'Free tier chạy ổn với key hiện tại, hợp đa số nội dung marketing', latency: '~2s', tokens: '1M' },
  { id: 'gemini-flash-lite', name: 'Gemini 2.5 Flash Lite', badge: 'Free', color: 'text-teal-600', desc: 'Free tier nhẹ và nhanh, hợp demo hoặc request nhiều', latency: '~1s', tokens: '1M' },
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash Preview', badge: 'Free', color: 'text-emerald-600', desc: 'Preview đang gọi được với key này, chất lượng mới hơn Flash 2.5', latency: '~2s', tokens: '1M' },
  { id: 'gemini-3-1-flash-lite', name: 'Gemini 3.1 Flash Lite', badge: 'Free', color: 'text-cyan-600', desc: 'Model free/lite mới, hợp nội dung ngắn và phản hồi nhanh', latency: '~5-15s', tokens: '1M' },
  { id: 'gemma-4-26b', name: 'Gemma 4 26B', badge: 'Free', color: 'text-orange-600', desc: 'Gemma qua Gemini API, miễn phí nhưng có thể chậm hơn dòng Flash', latency: '~30-90s', tokens: '262K' },
  { id: 'openrouter-free', name: 'OpenRouter Free Router', badge: 'Free', color: 'text-blue-600', desc: 'Tự chọn model free khả dụng trên OpenRouter; dùng khi Gemini lỗi/quota', latency: '~3s', tokens: '200K' },
];

export const COPY_TYPES = [
  { id: 'headline', name: 'Tiêu Đề Quảng Cáo', icon: Megaphone, desc: 'Headline thu hút click' },
  { id: 'description', name: 'Mô Tả Sản Phẩm', icon: FileText, desc: 'Mô tả chi tiết, thuyết phục' },
  { id: 'social', name: 'Social Media Post', icon: MessageSquare, desc: 'Facebook, Instagram, TikTok' },
  { id: 'email', name: 'Email Marketing', icon: Mail, desc: 'Subject line + nội dung email' },
  { id: 'cta', name: 'Call-to-Action', icon: Target, desc: 'Nút bấm và lời kêu gọi' },
  { id: 'landing', name: 'Landing Page', icon: Globe, desc: 'Hero section toàn bộ' },
  { id: 'seo', name: 'SEO Content', icon: BarChart3, desc: 'Tiêu đề & meta SEO' },
  { id: 'review', name: 'Review/Testimonial', icon: Star, desc: 'Đánh giá sản phẩm' },
];

export const TONES = [
  { id: 'urgent', name: 'Khẩn cấp', emoji: '🔥', desc: 'FOMO, limited time, flash sale' },
  { id: 'professional', name: 'Chuyên nghiệp', emoji: '💼', desc: 'Formal, B2B, uy tín' },
  { id: 'friendly', name: 'Thân thiện', emoji: '😊', desc: 'Gần gũi, trò chuyện, F2C' },
  { id: 'luxury', name: 'Sang trọng', emoji: '✨', desc: 'Premium, cao cấp, đẳng cấp' },
  { id: 'humorous', name: 'Hài hước', emoji: '😄', desc: 'Vui vẻ, trendy, viral' },
  { id: 'emotional', name: 'Cảm xúc', emoji: '❤️', desc: 'Chạm cảm xúc, storytelling' },
];

export const INDUSTRIES = [
  { id: 'ecommerce', name: 'Thương Mại Điện Tử', icon: ShoppingBag, color: 'bg-emerald-500' },
  { id: 'realestate', name: 'Bất Động Sản', icon: Building2, color: 'bg-green-500' },
  { id: 'technology', name: 'Công Nghệ', icon: Laptop, color: 'bg-teal-500' },
  { id: 'fnb', name: 'Ẩm Thực F&B', icon: Utensils, color: 'bg-orange-500' },
  { id: 'healthcare', name: 'Y Tế & Sức Khỏe', icon: Heart, color: 'bg-red-500' },
  { id: 'education', name: 'Giáo Dục', icon: GraduationCap, color: 'bg-green-500' },
  { id: 'finance', name: 'Tài Chính', icon: DollarSign, color: 'bg-emerald-500' },
  { id: 'fashion', name: 'Thời Trang', icon: Shirt, color: 'bg-pink-500' },
  { id: 'business', name: 'Doanh Nghiệp', icon: Briefcase, color: 'bg-slate-500' },
  { id: 'travel', name: 'Du Lịch', icon: Plane, color: 'bg-emerald-500' },
];

export const MOCK_OUTPUTS: Record<string, Record<string, string[]>> = {
  ecommerce: {
    headline: [
      '🔥 FLASH SALE 48H! Giảm Đến 70% – Cơ Hội Vàng Không Thể Bỏ Lỡ. Mua Ngay!',
      'Sản Phẩm Bán Chạy Số 1 – Hơn 10.000 Khách Hàng Đã Tin Dùng. Order Ngay!',
      '⚡ Chỉ Còn 12 Sản Phẩm! Đặt Hàng Ngay – Giao Hàng Trong 2 Giờ. Freeship!',
    ],
    description: [
      'Chất liệu cao cấp, được kiểm định bởi hơn 10,000 khách hàng thực tế. Thiết kế thông minh, sử dụng tiện lợi mọi hoàn cảnh. Cam kết 100% hàng chính hãng – Đổi trả miễn phí trong 30 ngày nếu không hài lòng.',
      'Sản phẩm premium được nhập khẩu trực tiếp, đảm bảo chất lượng tuyệt đối. Form dáng chuẩn, phù hợp mọi lứa tuổi. Khi mua hôm nay: tặng kèm hộp đựng sang trọng + miễn phí vận chuyển toàn quốc.',
    ],
    social: [
      '🛍️ ĐÃ TRỞ LẠI! Phiên bản giới hạn cuối cùng của năm. Chỉ còn 50 suất.\n\n✅ Chất lượng 5 sao\n✅ Freeship toàn quốc\n✅ Đổi trả 30 ngày\n\nTag người bạn muốn tặng quà và cùng nhau order! 🎁\n#FlashSale #LimitedEdition #MuaHàngOnline',
      '💥 AI có thể viết copy hay hơn bạn nghĩ!\n\nKết quả thực tế của khách hàng dùng CopyPro:\n📈 CTR tăng 40%\n💰 Doanh thu tăng 28%\n⏰ Tiết kiệm 90% thời gian\n\nDùng thử miễn phí 14 ngày – Không cần thẻ tín dụng! 🚀',
    ],
    email: [
      'Chủ đề: [Khẩn] Chỉ còn 3 giờ – Ưu đãi đặc biệt dành riêng cho bạn 🔥\n\nKính gửi [Tên khách hàng],\n\nChúng tôi muốn gửi đến bạn một ưu đãi đặc biệt mà ít ai biết đến...\n\nGiảm THÊM 20% cho đơn hàng tiếp theo của bạn. Mã: VIPKHACH20\n\nƯu đãi hết hạn lúc 23:59 hôm nay. Đừng để lỡ!\n\n→ ĐẶT HÀNG NGAY\n\nTrân trọng,\nTeam CopyPro',
    ],
    cta: ['MUA NGAY – FLASH SALE HẾT LÚC 23:59!', 'THÊM VÀO GIỎ HÀNG – FREESHIP TOÀN QUỐC', '✅ ĐẶT HÀNG NGAY – CHỈ CÒN 5 SUẤT!'],
    landing: [
      '# Sản Phẩm Đang Gây Bão Thị Trường 2026\n\n**Hơn 50,000 khách hàng đã tin dùng và yêu thích**\n\nChúng tôi không chỉ bán sản phẩm – chúng tôi mang đến trải nghiệm tuyệt vời nhất cho bạn. Với công nghệ sản xuất hiện đại và nguyên liệu cao cấp được kiểm định nghiêm ngặt.\n\n🏆 Giải thưởng Sản phẩm tốt nhất 2025\n⭐ Đánh giá trung bình 4.9/5 từ 10,000+ review\n🚚 Giao hàng 2 giờ tại TP.HCM, HN\n🔄 Đổi trả 30 ngày miễn phí\n\n**→ Đặt ngay hôm nay để nhận thêm quà tặng trị giá 500K**',
    ],
    seo: ['Tiêu đề SEO: Mua [Sản phẩm] Chính Hãng – Giá Tốt Nhất 2026 | Freeship Toàn Quốc\nMeta description: Mua [sản phẩm] chính hãng với giá tốt nhất, đảm bảo chất lượng 100%. Freeship toàn quốc, đổi trả 30 ngày. Đặt hàng ngay!'],
    review: ['Mình đã dùng sản phẩm này được 3 tháng và thực sự rất hài lòng! Chất lượng vượt mong đợi so với giá tiền. Giao hàng nhanh, đóng gói cẩn thận. Đặc biệt dịch vụ hỗ trợ khách hàng rất nhiệt tình. 5 sao xứng đáng! ⭐⭐⭐⭐⭐'],
  },
  realestate: {
    headline: [
      '🏢 DỰ ÁN VÀNG Q.2! Căn Hộ 2-3PN View Sông – Sở Hữu Ngay Chỉ Từ 3.5 Tỷ',
      'Khai Mở Không Gian Sống Đẳng Cấp – Vị Trí Kim Cương Trung Tâm TP. Đặt Chỗ Hôm Nay',
      '✨ Luxury Residences – Nơi Thành Đạt Gặp Thiên Nhiên. Chỉ Còn 12 Căn Đặc Biệt',
    ],
    description: [
      'Tọa lạc tại vị trí đắc địa nhất Quận 2, dự án mang đến không gian sống xanh đích thực. Căn hộ thiết kế theo phong cách Nhật Bản – tối giản mà tinh tế. Hồ bơi vô cực tầng 40, Spa 5 sao, Sky Garden riêng tư. Pháp lý rõ ràng, sổ hồng trao tay.',
    ],
    social: ['🏡 OPEN HOUSE CUỐI TUẦN NÀY!\n\nMời bạn và gia đình đến tham quan trực tiếp căn hộ mẫu đã hoàn thiện.\n\n📍 Địa chỉ: [Địa chỉ dự án]\n🕐 Thời gian: Thứ 7 & CN, 9h-17h\n🎁 Quà tặng khi tham quan: Voucher nhà hàng 500K\n\nĐặt lịch tham quan TẠI ĐÂY ⬇️'],
    email: ['Chủ đề: Chỉ còn 5 căn premium – Cơ hội cuối cùng sở hữu view sông đẹp nhất TP\n\nKính gửi [Tên quý khách],\n\nChúng tôi vui mừng thông báo đợt mở bán cuối cùng dự án The Grand Riverside...\n\nVới chính sách ưu đãi đặc biệt: Chiết khấu 8% thanh toán sớm + Miễn phí 3 năm phí quản lý...'],
    cta: ['ĐĂNG KÝ NHẬN BẢNG GIÁ VÀ CHÍNH SÁCH ƯU ĐÃI', 'ĐẶT LỊCH THAM QUAN MIỄN PHÍ HÔM NAY', 'XEM VIDEO THỰC TẾ DỰ ÁN →'],
    landing: ['# The Grand Riverside – Biểu Tượng Mới Của Sài Gòn\n\n**Nơi mỗi buổi sáng bạn thức dậy cùng dòng sông**\n\nCăn hộ hạng sang 3 phòng ngủ, tầm nhìn panorama sông Sài Gòn. Thiết kế bởi kiến trúc sư người Ý, nội thất nhập khẩu châu Âu.\n\n🌟 Top 10 dự án hot nhất 2026\n🏊 Hồ bơi vô cực cao nhất TP\n🍃 1ha công viên xanh nội khu'],
    seo: ['Tiêu đề SEO: Căn Hộ View Sông Quận 2 – The Grand Riverside | Giá Từ 3.5 Tỷ\nMeta description: Căn hộ cao cấp view sông Sài Gòn tại Quận 2. Thiết kế sang trọng, đầy đủ tiện ích 5 sao. Hỗ trợ vay 70%, lãi suất 0% 24 tháng. Liên hệ ngay!'],
    review: ['Sau 2 năm sinh sống tại đây, gia đình mình hoàn toàn hài lòng. View sông tuyệt đẹp, tiện ích đầy đủ, an ninh tốt. Hàng xóm văn minh, con cái có sân chơi an toàn. Giá trị đầu tư tăng trưởng ổn định. Xứng đáng là lựa chọn đúng đắn! ⭐⭐⭐⭐⭐'],
  },
  technology: {
    headline: [
      '🚀 Tăng Hiệu Suất Team 300% Với AI Automation – Dùng Thử 30 Ngày Miễn Phí',
      'Chuyển Đổi Số Trong 7 Ngày – Không Cần K Thuật, Không Phí Setup',
      '⚡ SaaS Platform #1 Việt Nam – Được 500+ Doanh Nghiệp Tin Dùng. Xem Demo!',
    ],
    description: ['Nền tảng quản lý toàn diện tích hợp AI, giúp tự động hóa 80% công việc lặp lại. API mở cho phép kết nối với mọi hệ thống hiện có. Bảo mật ISO 27001, uptime 99.99%. Onboarding trong 1 giờ với team hỗ trợ tận tình.'],
    social: ['💡 Bạn biết không?\n\nCác doanh nghiệp sử dụng AI automation tiết kiệm trung bình:\n⏰ 15 giờ/tuần cho mỗi nhân viên\n💰 40% chi phí vận hành\n📈 Tăng doanh thu 35% trong 6 tháng\n\nTìm hiểu giải pháp AI cho doanh nghiệp của bạn → Link trong bio 🔗\n#AIAutomation #CongNgheSo #ChuyenDoiSo'],
    email: ['Chủ đề: [Case Study] Công ty A tăng trưởng 200% sau 3 tháng dùng [Sản phẩm]\n\nChào [Tên],\n\nTôi muốn chia sẻ câu chuyện thực tế của một khách hàng...\n\nTrước khi dùng [Sản phẩm]: 5 nhân viên làm thủ công, mất 3 ngày/báo cáo\nSau khi dùng [Sản phẩm]: Tự động hóa 90%, báo cáo real-time, cắt giảm 60% chi phí\n\n→ Đặt lịch demo 30 phút để xem kết quả tương tự'],
    cta: ['BẮT ĐẦU DÙNG THỬ MIỄN PHÍ 30 NGÀY', 'ĐẶT LỊCH DEMO TRỰC TIẾP – NHẬN TƯ VẤN MIỄN PHÍ', 'XEM CASE STUDY KHCH HÀNG THỰC TẾ →'],
    landing: ['# Nền Tảng AI Duy Nhất Giúp Bạn Tăng Trưởng 10x\n\n**Không phải lời hứa – đây là kết quả đo lường được**\n\nHơn 500 doanh nghiệp Việt Nam đã chuyển đổi số thành công với chúng tôi. Trung bình mỗi khách hàng tiết kiệm 40% chi phí và tăng 35% doanh thu trong 6 tháng đầu.'],
    seo: ['Tiêu đề SEO: Phần Mềm Quản Lý Doanh Nghiệp AI – Tự Động Hóa 80% Quy Trình\nMeta description: Nền tảng SaaS quản lý doanh nghiệp với AI. Tự động hóa quy trình, tăng năng suất 300%. Dùng thử miễn phí 30 ngày. 500+ doanh nghiệp tin dùng.'],
    review: ['Chúng tôi đã thử nhiều giải pháp khác nhau nhưng đây là sản phẩm thực sự hiệu quả. Implementation nhanh, team support rất chuyên nghiệp. ROI đạt 340% sau 6 tháng. Đặc biệt tính năng báo cáo AI rất ấn tượng! ⭐⭐⭐⭐⭐'],
  },
};

export const DEFAULT_OUTPUTS = {
  headline: ['Giải Pháp Hàng Đầu Cho Nhu Cầu Của Bạn – Chất Lượng Vượt Trội, Giá Cả Hợp Lý. Khám Phá Ngay!', 'Hơn 10,000 Khách Hàng Hài Lòng – Gia Nhập Cộng Đồng Và Trải Nghiệm Sự Khác Biệt', '🌟 Ưu Đãi Đặc Biệt Chỉ Dành Cho Bạn – Đừng Bỏ Lỡ Cơ Hội Tuyệt Vời Này!'],
  description: ['Dịch vụ chuyên nghiệp, được tin dùng bởi hàng nghìn khách hàng. Cam kết chất lượng cao nhất, giá cả minh bạch, hỗ trợ tận tâm 24/7. Đặt hàng ngay để nhận ưu đãi đặc biệt và trải nghiệm sự khác biệt!'],
  social: ['✨ Tin tốt dành cho bạn!\n\nChúng tôi vừa ra mắt sản phẩm/dịch vụ mới với nhiều ưu đãi hấp dẫn.\n\n👉 Xem chi tiết tại link trong bio\n\nTag bạn bè để cùng nhau khám phá! 🎉'],
  email: ['Chủ đề: Ưu đãi đặc biệt dành riêng cho bạn – Chỉ có hiệu lực 48 giờ\n\nKính gửi [Tên khách hàng],\n\nChúng tôi trân trọng gửi đến bạn ưu đãi đặc biệt...\n\nHãy tận dụng ngay cơ hội này!'],
  cta: ['KHÁM PHÁT NGAY – ƯU ĐÃI ĐẶC BIỆT', 'ĐĂNG KÝ MIỄN PHÍ – BẮT ĐẦU NGAY HÔM NAY', 'XEM THÊM CHI TIẾT →'],
  landing: ['# Trải Nghiệm Vượt Mong Đợi\n\n**Dịch vụ chuyên nghiệp, tận tâm, và hiệu quả**\n\nChúng tôi cam kết mang đến giải pháp tốt nhất cho bạn với đội ngũ chuyên gia giàu kinh nghiệm và quy trình làm việc chuyên nghiệp.'],
  seo: ['Tiêu đề SEO: Dịch Vụ [Ngành] Uy Tín – Chất Lượng Cao, Giá Hợp Lý 2026\nMeta description: Cung cấp dịch vụ [ngành] chuyên nghiệp, uy tín hàng đầu. Đội ngũ kinh nghiệm, hỗ trợ 24/7. Liên hệ ngay để được tư vấn miễn phí!'],
  review: ['Tôi đã sử dụng dịch vụ này được 6 tháng và vô cùng hài lòng. Chất lượng ổn định, đội ngũ hỗ trợ nhiệt tình và chuyên nghiệp. Giá cả hợp lý so với chất lượng nhận được. Tôi sẽ tiếp tục sử dụng và giới thiệu cho bạn bè! ⭐⭐⭐⭐⭐'],
};
