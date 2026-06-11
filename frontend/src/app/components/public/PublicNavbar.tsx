import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from '@/lib/next-router-compat';
import { Button } from '@/app/components/ui/button';
import { BrandLogo } from '@/app/components/BrandLogo';
import {
  Sparkles, Menu, X, ChevronDown,
  Wand2, Brain, FileText, Key,
} from 'lucide-react';

const PRODUCTS = [
  { icon: Wand2, label: 'AI Generator', desc: 'Tạo copy với GPT-4o và Llama 3.1', href: '/login' },
  { icon: Brain, label: 'Fine-tuning Studio', desc: 'Huấn luyện AI theo giọng thương hiệu', href: '/login' },
  { icon: FileText, label: 'Template Library', desc: 'Mẫu copy tối ưu theo ngành', href: '/login' },
  { icon: Key, label: 'RESTful API', desc: 'Tích hợp vào ứng dụng của bạn', href: '/login' },
];

interface DropdownProps {
  label: string;
  items: { icon: any; label: string; desc: string; href: string }[];
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}

function Dropdown({ label, items, open, onToggle, onClose }: DropdownProps) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center gap-1 px-2 py-2 text-[0.9rem] font-semibold text-inherit transition-colors hover:text-primary"
      >
        {label}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <div className="absolute left-1/2 top-full z-50 mt-2 w-72 -translate-x-1/2 overflow-hidden rounded-lg border border-border bg-card shadow-xl">
            <div className="p-2">
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={onClose}
                    className="group flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-accent"
                  >
                    <div className="flex-shrink-0 rounded-lg bg-primary/10 p-2 transition-colors group-hover:bg-primary/15">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.label}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
  }, [location.pathname]);

  const toggleDropdown = (key: string) =>
    setOpenDropdown(prev => (prev === key ? null : key));

  const navLinks = [
    { label: 'Giới thiệu', href: '/about' },
    { label: 'Bảng giá', href: '/pricing' },
    { label: 'Blog', href: '/blog' },
    { label: 'Liên hệ', href: '/contact' },
  ];

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-border/80 bg-card/95 shadow-sm backdrop-blur-xl'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex h-[70px] items-center justify-between">
          <Link to="/" className="flex flex-shrink-0 items-center gap-2">
            <BrandLogo size="lg" tone={scrolled ? 'dark' : 'light'} surface="light" className="p-1" />
          </Link>

          <nav className={`hidden items-center gap-1 lg:flex ${scrolled ? 'text-foreground/70' : 'text-white/90'}`}>
            <Dropdown
              label="Sản phẩm"
              items={PRODUCTS}
              open={openDropdown === 'products'}
              onToggle={() => toggleDropdown('products')}
              onClose={() => setOpenDropdown(null)}
            />
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`rounded-lg px-3 py-2 text-[0.9rem] font-semibold transition-colors ${
                  location.pathname === link.href
                    ? scrolled ? 'bg-primary/10 text-primary' : 'bg-card/15 text-white'
                    : scrolled ? 'text-muted-foreground hover:bg-accent hover:text-primary' : 'text-white/90 hover:bg-card/15 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Button
              variant="ghost"
              className={`text-[0.9rem] font-semibold transition-colors ${scrolled ? 'text-muted-foreground hover:bg-accent hover:text-primary' : 'text-white/90 hover:bg-card/15 hover:text-white'}`}
              onClick={() => navigate('/login')}
            >
              Đăng nhập
            </Button>
            <Button
              className="rounded-lg bg-gradient-to-r from-primary to-success px-5 text-[0.9rem] text-primary-foreground shadow-md shadow-primary/20 hover:from-primary/90 hover:to-success/90"
              onClick={() => navigate('/register')}
            >
              <Sparkles className="mr-1.5 h-4 w-4" />
              Dùng thử miễn phí
            </Button>
          </div>

          <button
            className={`rounded-lg p-2 transition-colors lg:hidden ${scrolled ? 'text-foreground hover:bg-muted' : 'text-white hover:bg-card/15'}`}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-card shadow-xl lg:hidden">
          <div className="mx-auto max-w-7xl space-y-1 px-5 py-5">
            <p className="mb-2 px-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Sản phẩm</p>
            {PRODUCTS.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.label} to={item.href} className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-accent">
                  <div className="rounded-lg bg-primary/10 p-1.5"><Icon className="h-4 w-4 text-primary" /></div>
                  <span className="text-sm font-semibold text-foreground">{item.label}</span>
                </Link>
              );
            })}

            <div className="my-3 border-t border-border" />
            <p className="mb-2 px-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Điều hướng</p>
            {navLinks.map((link) => (
              <Link key={link.href} to={link.href} className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-foreground/80 transition-colors hover:bg-accent hover:text-primary">
                {link.label}
              </Link>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-4">
              <Button variant="outline" className="w-full rounded-lg text-sm" onClick={() => navigate('/login')}>Đăng nhập</Button>
              <Button className="w-full rounded-lg bg-gradient-to-r from-primary to-success text-sm text-primary-foreground" onClick={() => navigate('/register')}>Đăng ký</Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
