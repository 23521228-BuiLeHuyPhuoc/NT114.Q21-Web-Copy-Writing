import { Link } from '@/lib/next-router-compat';
import { BrandLogo } from '@/app/components/BrandLogo';
import {
  LifeBuoy, FileText, Wand2, Brain,
  CreditCard, MessageCircle,
  ExternalLink, Zap,
} from 'lucide-react';

const FOOTER_COLS = [
  {
    title: 'Công cụ',
    links: [
      { label: 'AI Generator',         href: '/generate',         icon: Wand2 },
      { label: 'Fine-tuning Studio',   href: '/fine-tune',        icon: Brain },
      { label: 'Mẫu Copy',             href: '/templates',        icon: FileText },
      { label: 'Kiểm tra đạo văn',     href: '/plagiarism-check', icon: Zap },
    ],
  },
  {
    title: 'Tài khoản',
    links: [
      { label: 'Hồ sơ',           href: '/profile',      icon: null },
      { label: 'Thanh toán',      href: '/billing',      icon: null },
      { label: 'Gói dịch vụ',    href: '/billing',      icon: null },
      { label: 'Thông báo',      href: '/notifications', icon: null },
      { label: 'Dự án của tôi',  href: '/projects',     icon: null },
    ],
  },
  {
    title: 'Hỗ trợ',
    links: [
      { label: 'Trung tâm hỗ trợ', href: '/blog',    icon: LifeBuoy, external: false },
      { label: 'Cộng đồng',        href: '/blog',    icon: MessageCircle, external: false },
      { label: 'Liên hệ',          href: '/contact', icon: null, external: false },
    ],
  },
];

const STATUS_SERVICES = [
  { name: 'GPT-4',          status: 'online' },
  { name: 'Llama 3.1',       status: 'online' },
  { name: 'Fine-tune Engine', status: 'busy'  },
];

export function CustomerFooter() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand + status */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-flex items-center mb-3 hover:opacity-80 transition-opacity">
              <BrandLogo size="md" />
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Nền tảng AI Copywriting hàng đầu Việt Nam, tích hợp GPT-4, Llama 3.1 & Fine-tuning.
            </p>

            {/* System status */}
            <div className="bg-surface-muted rounded-xl p-3">
              <p className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider mb-2">Trạng thái hệ thống</p>
              <div className="space-y-1.5">
                {STATUS_SERVICES.map(s => (
                  <div key={s.name} className="flex items-center justify-between">
                    <span className="text-xs text-foreground/70">{s.name}</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'online' ? 'bg-primary/50' : s.status === 'busy' ? 'bg-warning/100' : 'bg-destructive/100'} ${s.status === 'online' ? 'animate-pulse' : ''}`} />
                      <span className={`text-[10px] font-medium ${s.status === 'online' ? 'text-primary' : s.status === 'busy' ? 'text-amber-600' : 'text-red-600'}`}>
                        {s.status === 'online' ? 'Online' : s.status === 'busy' ? 'Bận' : 'Offline'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Links columns */}
          {FOOTER_COLS.map(col => (
            <div key={col.title}>
              <p className="text-xs font-bold text-foreground/80 uppercase tracking-wider mb-3">{col.title}</p>
              <ul className="space-y-2">
                {col.links.map(link => {
                  const Icon = link.icon;
                  return (
                    <li key={link.label}>
                      <Link
                        to={link.href}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors group"
                      >
                        {Icon && <Icon className="w-3 h-3 text-muted-foreground/80 group-hover:text-primary transition-colors flex-shrink-0" />}
                        {link.label}
                        {'external' in link && link.external && <ExternalLink className="w-2.5 h-2.5 text-muted-foreground/60" />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground/80">
            <span>© 2026 CopyPro Vietnam</span>
            <span className="text-gray-200">·</span>
            <Link to="#" className="hover:text-primary transition-colors">Điều khoản</Link>
            <span className="text-gray-200">·</span>
            <Link to="#" className="hover:text-primary transition-colors">Bảo mật</Link>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/80">
            <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-pulse" />
            <span>Tất cả dịch vụ hoạt động tốt</span>
            <span className="text-gray-200">·</span>
            <span>v2.0.1</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
