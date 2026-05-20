import {
  ShoppingBag, Building2, Cpu, Utensils, Heart, GraduationCap,
} from 'lucide-react';

export const INDUSTRY_MAP: Record<string, { label: string; color: string; Icon: any }> = {
  ecommerce:   { label: 'Thương Mại Điện Tử', color: 'bg-emerald-100 text-emerald-700', Icon: ShoppingBag },
  realestate:  { label: 'Bất Động Sản',       color: 'bg-green-100 text-green-700',     Icon: Building2 },
  technology:  { label: 'Công Nghệ',           color: 'bg-teal-100 text-teal-700',     Icon: Cpu },
  fnb:         { label: 'Ẩm Thực',             color: 'bg-orange-100 text-orange-700', Icon: Utensils },
  healthcare:  { label: 'Y Tế & Sức Khỏe',    color: 'bg-red-100 text-red-700',       Icon: Heart },
  education:   { label: 'Giáo Dục',            color: 'bg-green-100 text-green-700',   Icon: GraduationCap },
};

export const TYPE_MAP: Record<string, string> = {
  headline:    'Tiêu Đề',
  description: 'Mô Tả',
  cta:         'Call-to-Action',
  social:      'Social Media',
  email:       'Email Marketing',
  landing:     'Landing Page',
};

export const MODEL_MAP: Record<string, { label: string; color: string }> = {
  'gpt4':      { label: 'GPT-4o', color: 'bg-green-100 text-green-700' },
  'gpt35':     { label: 'GPT-3.5', color: 'bg-green-100 text-green-700' },
  'llama3':    { label: 'Llama 3.1', color: 'bg-orange-100 text-orange-700' },
  'finetuned': { label: 'Fine-tuned', color: 'bg-teal-100 text-teal-700' },
};

export const MOCK_HISTORY = [
  { id: 1, title: 'Tiêu đề Facebook Ad - Flash Sale mùa hè', type: 'headline', industry: 'ecommerce', model: 'gpt4', content: 'FLASH SALE HÈ 2026 🔥 Giảm sốc 70% toàn bộ sản phẩm hè. Chỉ trong 24 giờ – Mua ngay kẻo hết!', createdAt: '23/03/2026 14:30', words: 18, quality: 92, tone: 'Khẩn cấp', platform: 'Facebook' },
  { id: 2, title: 'Mô tả sản phẩm áo thun premium', type: 'description', industry: 'ecommerce', model: 'gpt4', content: 'Áo thun cotton 100% cao cấp, form dáng chuẩn unisex. Chất vải mềm mại, thoáng mát, phù hợp mặc cả ngày. Thiết kế tối giản sang trọng, phù hợp mọi phong cách. Bảo hành màu sắc 6 tháng. Đổi trả dễ dàng trong 7 ngày.', createdAt: '23/03/2026 11:15', words: 48, quality: 88, tone: 'Chuyên nghiệp', platform: 'Landing Page' },
  { id: 3, title: 'Landing Page - Căn hộ The Grand', type: 'landing', industry: 'realestate', model: 'llama3', content: 'Sở hữu ngay căn hộ The Grand – Nơi đẳng cấp gặp thiên nhiên. Vị trí vàng quận 2, view sông Sài Gòn triệu đô. Chỉ từ 3.5 tỷ, hỗ trợ vay 70%, 0% lãi suất 24 tháng đầu. Đặt chỗ hôm nay – Nhận ngay ưu đãi 150 triệu đồng.', createdAt: '22/03/2026 16:45', words: 52, quality: 95, tone: 'Sang trọng', platform: 'Landing Page' },
  { id: 4, title: 'Email marketing ra mắt phần mềm SaaS', type: 'email', industry: 'technology', model: 'finetuned', content: 'Chủ đề: Giới thiệu TechFlow – Giải pháp quản lý doanh nghiệp thế hệ mới\n\nKính gửi [Tên khách hàng],\n\nChúng tôi hân hạnh giới thiệu TechFlow – nền tảng ERP thông minh giúp tự động hóa toàn bộ quy trình kinh doanh. Tăng năng suất 300%, giảm chi phí vận hành 40%.', createdAt: '22/03/2026 09:20', words: 63, quality: 91, tone: 'Chuyên nghiệp', platform: 'Email' },
  { id: 5, title: 'Social media - Khai trương nhà hàng', type: 'social', industry: 'fnb', model: 'gpt35', content: '🎉 GRAND OPENING! Nhà hàng Phố Đêm chính thức khai trương! 🍜\n\n✨ Menu hơn 50 món ngon đặc sắc\n🎁 Giảm 30% toàn bộ menu tuần đầu\n📍 23 Nguyễn Huệ, Q.1, TP.HCM\n\nTag bạn bè cùng check-in và nhận ngay voucher 200K! ❤️\n#PhoDemd #GrandOpening #SaiGon', createdAt: '21/03/2026 18:00', words: 64, quality: 87, tone: 'Thân thiện', platform: 'Facebook' },
  { id: 6, title: 'CTA - Đăng ký khóa học lập trình', type: 'cta', industry: 'education', model: 'gpt4', content: 'HỌC LẬP TRÌNH FULL-STACK – THAY ĐỔI SỰ NGHIỆP CỦA BẠN! Đăng ký ngay hôm nay và nhận học bổng 50%. Chỉ còn 10 suất cuối!', createdAt: '20/03/2026 10:30', words: 30, quality: 90, tone: 'Khẩn cấp', platform: 'Google Ads' },
  { id: 7, title: 'Mô tả dịch vụ khám sức khỏe tổng quát', type: 'description', industry: 'healthcare', model: 'llama3', content: 'Gói khám sức khỏe tổng quát Premium bao gồm hơn 50 hạng mục kiểm tra toàn diện. Được thực hiện bởi đội ngũ bác sĩ chuyên khoa đầu ngành. Kết quả xét nghiệm trong 2 giờ, tư vấn chi tiết sau khám. Bảo hiểm y tế được chấp nhận.', createdAt: '19/03/2026 14:00', words: 55, quality: 89, tone: 'Chuyên nghiệp', platform: 'Website' },
];
