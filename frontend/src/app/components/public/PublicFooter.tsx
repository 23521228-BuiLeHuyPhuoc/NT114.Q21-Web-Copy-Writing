import { Link } from 'react-router-dom';
import { BrandLogo } from '@/app/components/BrandLogo';
import { Sparkles, Mail, Phone, MapPin, Facebook, Youtube, Linkedin, Twitter, ArrowUpRight } from 'lucide-react';

const FOOTER_LINKS = {
  product: {
    title: 'Sản phẩm',
    links: [
      { label: 'AI Copywriting Engine', href: '/login' },
      { label: 'Fine-tuning Studio', href: '/login' },
      { label: 'Template Library', href: '/login' },
      { label: 'RESTful API', href: '/login' },
      { label: 'Bảng giá', href: '/pricing' },
    ],
  },
  company: {
    title: 'Công ty',
    links: [
      { label: 'Giới thiệu', href: '/about' },
      { label: 'Blog & Kiến thức', href: '/blog' },
      { label: 'Liên hệ', href: '/contact' },
      { label: 'Tuyển dụng', href: '/about#careers' },
      { label: 'Đối tác', href: '/about#partners' },
    ],
  },
  support: {
    title: 'Hỗ trợ',
    links: [
      { label: 'Trung tâm hỗ trợ', href: '/blog' },
      { label: 'Tài liệu API', href: '/login' },
      { label: 'Hướng dẫn sử dụng', href: '/blog' },
      { label: 'Cộng đồng', href: '/blog' },
      { label: 'Báo cáo lỗi', href: '/contact' },
    ],
  },
  legal: {
    title: 'Pháp lý',
    links: [
      { label: 'Điều khoản sử dụng', href: '#' },
      { label: 'Chính sách bảo mật', href: '#' },
      { label: 'Chính sách Cookie', href: '#' },
      { label: 'Hoàn tiền', href: '#' },
    ],
  },
};

const SOCIALS = [
  { icon: Facebook, label: 'Facebook', href: '#', color: 'hover:bg-stone-600' },
  { icon: Youtube, label: 'Youtube', href: '#', color: 'hover:bg-red-600' },
  { icon: Linkedin, label: 'LinkedIn', href: '#', color: 'hover:bg-stone-700' },
  { icon: Twitter, label: 'Twitter/X', href: '#', color: 'hover:bg-gray-800' },
];

export function PublicFooter() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      {/* Top CTA strip */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <h3
                className="text-2xl font-bold text-white mb-2"
                style={{ letterSpacing: '-0.02em' }}
              >
                Sẵn sàng tạo copy đỉnh cao?
              </h3>
              <p className="text-gray-400 text-sm">
                Dùng thử miễn phí 14 ngày · Không cần thẻ tín dụng · Hủy bất kỳ lúc nào
              </p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <Link to="/register">
                <button className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-stone-500 hover:from-emerald-400 hover:to-stone-400 text-white rounded-xl px-6 py-3 text-sm font-bold transition-all shadow-lg shadow-stone-900/40">
                  <Sparkles className="w-4 h-4" />
                  Bắt đầu miễn phí
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </Link>
              <Link to="/pricing">
                <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl px-6 py-3 text-sm font-semibold transition-colors">
                  Xem bảng giá
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="inline-flex items-center mb-5 hover:opacity-90 transition-opacity">
              <BrandLogo size="lg" tone="light" surface="light" />
            </Link>
            <p className="text-sm leading-relaxed mb-6 text-gray-500">
              Nền tảng AI Copywriting hàng đầu Việt Nam — tích hợp GPT-4o, Llama 3.1 và Fine-tuning, giúp doanh nghiệp tạo nội dung marketing chuyên nghiệp trong vài giây.
            </p>

            {/* Contact */}
            <div className="space-y-2.5 text-sm">
              <a href="mailto:hello@copypro.vn" className="flex items-center gap-2.5 hover:text-stone-400 transition-colors">
                <Mail className="w-4 h-4 text-stone-500 flex-shrink-0" />
                hello@copypro.vn
              </a>
              <a href="tel:+84901234567" className="flex items-center gap-2.5 hover:text-stone-400 transition-colors">
                <Phone className="w-4 h-4 text-stone-500 flex-shrink-0" />
                +84 901 234 567
              </a>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>Tòa nhà Innovation Hub, 2 Nguyễn Thị Minh Khai, Q.1, TP.HCM</span>
              </div>
            </div>

            {/* Socials */}
            <div className="flex gap-2 mt-6">
              {SOCIALS.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className={`w-9 h-9 bg-gray-800 ${s.color} rounded-lg flex items-center justify-center transition-colors`}
                  >
                    <Icon className="w-4 h-4 text-gray-300" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links */}
          {Object.values(FOOTER_LINKS).map((section) => (
            <div key={section.title}>
              <h4 className="text-white text-sm font-bold mb-4 tracking-wide">{section.title}</h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-gray-500 hover:text-stone-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-14 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>© 2026 CopyPro Vietnam Co., Ltd.</span>
            <span className="text-gray-700">·</span>
            <span>Mã số doanh nghiệp: 0317xxxxxx</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Tất cả hệ thống hoạt động bình thường
            </span>
            <span className="text-gray-700">·</span>
            <span>Made with 🇻🇳 in Vietnam</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
