import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import {
  Sparkles, Menu, X, ChevronDown,
  Wand2, Brain, FileText, Key, Shield,
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
        className="flex items-center gap-1 px-2 py-2 text-[0.9rem] font-semibold text-inherit transition-colors hover:text-green-400"
      >
        {label}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <div className="absolute left-1/2 top-full z-50 mt-2 w-72 -translate-x-1/2 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-xl">
            <div className="p-2">
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={onClose}
                    className="group flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-green-50"
                  >
                    <div className="flex-shrink-0 rounded-lg bg-green-100 p-2 transition-colors group-hover:bg-green-200">
                      <Icon className="h-4 w-4 text-green-700" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                      <p className="mt-0.5 text-xs text-gray-500">{item.desc}</p>
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
          ? 'border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur-xl'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex h-[70px] items-center justify-between">
          <Link to="/" className="flex flex-shrink-0 items-center gap-2.5">
            <div className="rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 p-2 shadow-md shadow-green-200">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-[1.35rem] font-bold tracking-tight transition-colors ${scrolled ? 'text-gray-900' : 'text-white'}`}
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                CopyPro
              </span>
              <Badge className="h-4 border-0 bg-green-100 px-1.5 py-0 text-[10px] text-green-700">AI</Badge>
            </div>
          </Link>

          <nav className={`hidden items-center gap-1 lg:flex ${scrolled ? 'text-gray-600' : 'text-white/90'}`}>
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
                    ? scrolled ? 'bg-green-50 text-green-700' : 'bg-white/15 text-white'
                    : scrolled ? 'text-gray-600 hover:bg-green-50/60 hover:text-green-700' : 'text-white/90 hover:bg-white/15 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Button
              variant="ghost"
              className={`text-[0.9rem] font-semibold transition-colors ${scrolled ? 'text-gray-600 hover:bg-green-50 hover:text-green-700' : 'text-white/90 hover:bg-white/15 hover:text-white'}`}
              onClick={() => navigate('/login')}
            >
              Đăng nhập
            </Button>
            <Button
              className="rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-5 text-[0.9rem] text-white shadow-md shadow-green-200/60 hover:from-green-700 hover:to-emerald-700"
              onClick={() => navigate('/register')}
            >
              <Sparkles className="mr-1.5 h-4 w-4" />
              Dùng thử miễn phí
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-9 w-9 rounded-lg transition-colors ${scrolled ? 'text-gray-400 hover:bg-gray-100 hover:text-gray-600' : 'text-white/60 hover:bg-white/15 hover:text-white'}`}
              onClick={() => navigate('/admin/login')}
              title="Admin Login"
            >
              <Shield className="h-4 w-4" />
            </Button>
          </div>

          <button
            className={`rounded-lg p-2 transition-colors lg:hidden ${scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/15'}`}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white shadow-xl lg:hidden">
          <div className="mx-auto max-w-7xl space-y-1 px-5 py-5">
            <p className="mb-2 px-3 text-xs font-bold uppercase tracking-widest text-gray-400">Sản phẩm</p>
            {PRODUCTS.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.label} to={item.href} className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-green-50">
                  <div className="rounded-lg bg-green-100 p-1.5"><Icon className="h-4 w-4 text-green-700" /></div>
                  <span className="text-sm font-semibold text-gray-800">{item.label}</span>
                </Link>
              );
            })}

            <div className="my-3 border-t border-gray-100" />
            <p className="mb-2 px-3 text-xs font-bold uppercase tracking-widest text-gray-400">Điều hướng</p>
            {navLinks.map((link) => (
              <Link key={link.href} to={link.href} className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-green-50 hover:text-green-700">
                {link.label}
              </Link>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-gray-100 pt-4">
              <Button variant="outline" className="w-full rounded-lg text-sm" onClick={() => navigate('/login')}>Đăng nhập</Button>
              <Button className="w-full rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-sm text-white" onClick={() => navigate('/register')}>Đăng ký</Button>
            </div>
            <div className="mt-2">
              <Button variant="ghost" className="w-full rounded-lg text-xs text-gray-400 hover:text-gray-600" onClick={() => navigate('/admin/login')}>
                <Shield className="mr-1.5 h-3.5 w-3.5" /> Đăng nhập Admin
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
