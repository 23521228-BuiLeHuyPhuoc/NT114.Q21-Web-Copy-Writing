import type { PublicPageContent } from '@/services/publicSiteService';

export const PUBLIC_PAGE_FIELD_DEFS = [
  {
    key: 'home',
    label: 'Trang chủ',
    type: 'page' as const,
    fields: [
      { key: 'heroBadge', label: 'Nhãn hero', multiline: false, fallback: 'AI Copywriting cho doanh nghiệp Việt' },
      { key: 'heroTitle', label: 'Tiêu đề hero', multiline: false, fallback: 'Tạo copy marketing rõ ý, đúng giọng thương hiệu' },
      { key: 'heroDescription', label: 'Mô tả hero', multiline: true, fallback: 'CopyPro giúp đội marketing tạo headline, email, landing page và social post trong vài giây, có thể tinh chỉnh theo ngành và thương hiệu.' },
      { key: 'primaryCta', label: 'Nút CTA chính', multiline: false, fallback: 'Dùng thử miễn phí' },
      { key: 'secondaryCta', label: 'Nút CTA phụ', multiline: false, fallback: 'Xem cách hoạt động' },
    ],
  },
  {
    key: 'about',
    label: 'Giới thiệu',
    type: 'page' as const,
    fields: [
      { key: 'heroBadge', label: 'Nhãn hero', multiline: false, fallback: '🌱 Câu chuyện của chúng tôi' },
      { key: 'heroTitle', label: 'Tiêu đề hero', multiline: false, fallback: 'Xây dựng tương lai Copywriting bằng AI' },
      { key: 'heroDescription', label: 'Mô tả hero', multiline: true, fallback: 'CopyPro ra đời từ một câu hỏi đơn giản: "Tại sao marketer Việt Nam phải mất hàng giờ để viết một đoạn copy, trong khi AI có thể làm trong vài giây?" Chúng tôi đã xây dựng câu trả lời đó.' },
      { key: 'missionTitle', label: 'Tiêu đề sứ mệnh', multiline: false, fallback: 'Dân chủ hóa copywriting chuyên nghiệp cho mọi doanh nghiệp Việt Nam' },
      { key: 'missionDescription', label: 'Mô tả sứ mệnh', multiline: true, fallback: 'Cung cấp công nghệ AI copywriting tiên tiến nhất, được tối ưu cho văn hóa và ngôn ngữ Việt Nam, với chi phí phù hợp cho mọi quy mô doanh nghiệp.' },
    ],
  },
  {
    key: 'contact',
    label: 'Liên hệ',
    type: 'page' as const,
    fields: [
      { key: 'heroBadge', label: 'Nhãn hero', multiline: false, fallback: '💬 Liên hệ với chúng tôi' },
      { key: 'heroTitle', label: 'Tiêu đề hero', multiline: false, fallback: 'Chúng tôi luôn sẵn sàng lắng nghe' },
      { key: 'heroDescription', label: 'Mô tả hero', multiline: true, fallback: 'Dù bạn có câu hỏi về sản phẩm, cần hỗ trợ kỹ thuật hay muốn thảo luận về hợp tác — đội ngũ của chúng tôi sẽ phản hồi trong vòng 24 giờ.' },
      { key: 'email', label: 'Email liên hệ', multiline: false, fallback: 'hello@copypro.vn' },
      { key: 'phone', label: 'Hotline', multiline: false, fallback: '+84 901 234 567' },
      { key: 'address', label: 'Địa chỉ', multiline: true, fallback: 'Innovation Hub, Q.1, TP.HCM' },
    ],
  },
  {
    key: 'footer',
    label: 'Footer',
    type: 'settings' as const,
    fields: [
      { key: 'ctaTitle', label: 'Tiêu đề CTA', multiline: false, fallback: 'Sẵn sàng tạo copy đỉnh cao?' },
      { key: 'ctaDescription', label: 'Mô tả CTA', multiline: true, fallback: 'Dùng thử miễn phí 14 ngày · Không cần thẻ tín dụng · Hủy bất kỳ lúc nào' },
      { key: 'brandDescription', label: 'Mô tả thương hiệu', multiline: true, fallback: 'Nền tảng AI Copywriting hàng đầu Việt Nam — tích hợp GPT-4o, Llama 3.1 và Fine-tuning, giúp doanh nghiệp tạo nội dung marketing chuyên nghiệp trong vài giây.' },
      { key: 'email', label: 'Email footer', multiline: false, fallback: 'hello@copypro.vn' },
      { key: 'phone', label: 'Điện thoại footer', multiline: false, fallback: '+84 901 234 567' },
      { key: 'address', label: 'Địa chỉ footer', multiline: true, fallback: 'Tòa nhà Innovation Hub, 2 Nguyễn Thị Minh Khai, Q.1, TP.HCM' },
      { key: 'copyright', label: 'Copyright', multiline: false, fallback: '© 2026 CopyPro Vietnam Co., Ltd.' },
    ],
  },
];

export type PublicPageKey = (typeof PUBLIC_PAGE_FIELD_DEFS)[number]['key'];

export function getPublicPageDef(key: string) {
  return PUBLIC_PAGE_FIELD_DEFS.find(def => def.key === key) || PUBLIC_PAGE_FIELD_DEFS[0];
}

export function getPublicText(content: PublicPageContent | undefined, key: string, fallback: string) {
  const value = content?.[key];
  return typeof value === 'string' && value.trim() ? value : fallback;
}

export function buildDefaultContent(key: string, content?: PublicPageContent) {
  const def = getPublicPageDef(key);
  return def.fields.reduce<Record<string, string>>((acc, field) => {
    const value = content?.[field.key];
    acc[field.key] = typeof value === 'string' ? value : field.fallback;
    return acc;
  }, {});
}
