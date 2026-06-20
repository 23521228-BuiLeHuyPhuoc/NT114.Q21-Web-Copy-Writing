import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from '@/lib/next-router-compat';
import { Button } from '@/app/components/ui/button';
import { BrandLogo } from '@/app/components/BrandLogo';
import { useAuth } from '@/app/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import {
  Sparkles, Menu, X, ChevronDown,
  Wand2, Brain, FileText, FolderOpen, FileCheck, ScrollText,
  User, CreditCard, LogOut, LayoutDashboard, ShieldCheck,
} from 'lucide-react';

const FEATURE_LINKS = [
  { icon: Wand2, label: 'Tạo nội dung AI', desc: 'Sinh headline, email, quảng cáo và bài đăng theo brief.', href: '/generate' },
  { icon: ScrollText, label: 'Mẫu copy', desc: 'Duyệt template theo ngành và mục tiêu nội dung.', href: '/templates' },
  { icon: FolderOpen, label: 'Dự án', desc: 'Quản lý nội dung theo chiến dịch và nhóm việc.', href: '/projects' },
  { icon: FileText, label: 'Nội dung của tôi', desc: 'Lưu, xem lại và tái sử dụng các bản copy đã tạo.', href: '/contents' },
  { icon: FileCheck, label: 'Kiểm tra đạo văn', desc: 'Phân tích mức độ trùng lặp trước khi xuất bản.', href: '/plagiarism-check' },
  { icon: Brain, label: 'Fine-tuning', desc: 'Huấn luyện AI theo dữ liệu và giọng thương hiệu.', href: '/fine-tune' },
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
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
    setAccountOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleDropdown = (key: string) =>
    setOpenDropdown(prev => (prev === key ? null : key));

  const navLinks = [
    { label: 'Giới thiệu', href: '/about' },
    { label: 'Bảng giá', href: '/pricing' },
    { label: 'Blog', href: '/blog' },
    { label: 'Liên hệ', href: '/contact' },
  ];

  const userInitial = user?.name?.trim().charAt(0).toUpperCase() || 'U';
  const firstName = user?.name?.split(' ')[0] || (user?.role === 'admin' ? 'Admin' : 'User');
  const primaryAppPath = user?.role === 'admin' ? '/admin' : '/generate';
  const profilePath = user?.role === 'admin' ? '/admin/profile' : '/profile';
  const logoutPath = user?.role === 'admin' ? '/admin/login' : '/login';
  const PrimaryIcon = user?.role === 'admin' ? LayoutDashboard : Wand2;
  const primaryLabel = user?.role === 'admin' ? 'Quản trị' : 'Tạo copy';

  const handleLogout = () => {
    setAccountOpen(false);
    setMobileOpen(false);
    void logout();
    navigate(logoutPath);
  };

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
              label="Chức năng"
              items={FEATURE_LINKS}
              open={openDropdown === 'features'}
              onToggle={() => toggleDropdown('features')}
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
            {isLoading ? (
              <div className={`h-9 w-44 animate-pulse rounded-lg ${scrolled ? 'bg-muted' : 'bg-white/15'}`} />
            ) : user ? (
              <>
                <Button
                  className="rounded-lg bg-gradient-to-r from-primary to-success px-5 text-[0.9rem] text-primary-foreground shadow-md shadow-primary/20 hover:from-primary/90 hover:to-success/90"
                  onClick={() => navigate(primaryAppPath)}
                >
                  <PrimaryIcon className="mr-1.5 h-4 w-4" />
                  {primaryLabel}
                </Button>

                <div className="relative" ref={accountRef}>
                  <button
                    onClick={() => setAccountOpen((open) => !open)}
                    className={`flex h-9 items-center gap-2 rounded-lg pl-1 pr-2 transition-colors ${scrolled ? 'text-foreground hover:bg-muted' : 'text-white hover:bg-card/15'}`}
                    aria-label="Tài khoản"
                  >
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={user.avatar || undefined} alt={user.name || 'Avatar'} className="object-cover" />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-success text-xs font-bold text-primary-foreground">
                        {userInitial}
                      </AvatarFallback>
                    </Avatar>
                    <span className="max-w-24 truncate text-sm font-semibold">{firstName}</span>
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${accountOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {accountOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setAccountOpen(false)} />
                      <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-lg border border-border bg-card shadow-xl">
                        <div className="border-b bg-gradient-to-br from-primary/10 to-success/10 px-4 py-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <Avatar className="h-10 w-10 flex-shrink-0">
                              <AvatarImage src={user.avatar || undefined} alt={user.name || 'Avatar'} className="object-cover" />
                              <AvatarFallback className="bg-gradient-to-br from-primary to-success font-bold text-primary-foreground">
                                {userInitial}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-foreground">{user.name}</p>
                              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                              <span className="mt-1 inline-flex h-5 items-center gap-1 rounded bg-card/70 px-1.5 text-[10px] font-semibold text-primary">
                                {user.role === 'admin' ? <ShieldCheck className="h-2.5 w-2.5" /> : <Sparkles className="h-2.5 w-2.5" />}
                                {user.role === 'admin' ? 'Admin' : 'Khách hàng'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="p-2">
                          <Link
                            to={primaryAppPath}
                            onClick={() => setAccountOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
                          >
                            <PrimaryIcon className="h-4 w-4 text-muted-foreground" />
                            {user.role === 'admin' ? 'Bảng điều khiển admin' : 'Tạo nội dung AI'}
                          </Link>
                          <Link
                            to={profilePath}
                            onClick={() => setAccountOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
                          >
                            <User className="h-4 w-4 text-muted-foreground" />
                            Hồ sơ
                          </Link>
                          {user.role === 'customer' && (
                            <Link
                              to="/billing"
                              onClick={() => setAccountOpen(false)}
                              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
                            >
                              <CreditCard className="h-4 w-4 text-muted-foreground" />
                              Gói & thanh toán
                            </Link>
                          )}
                        </div>

                        <div className="border-t p-2">
                          <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-destructive/10 hover:text-destructive"
                          >
                            <LogOut className="h-4 w-4" />
                            Đăng xuất
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>

          <button
            className={`rounded-lg p-2 transition-colors lg:hidden ${scrolled ? 'text-foreground hover:bg-muted' : 'text-white hover:bg-card/15'}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Mở menu"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : user ? (
              <Avatar className="h-7 w-7">
                <AvatarImage src={user.avatar || undefined} alt={user.name || 'Avatar'} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-primary to-success text-xs font-bold text-primary-foreground">
                  {userInitial}
                </AvatarFallback>
              </Avatar>
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-card shadow-xl lg:hidden">
          <div className="mx-auto max-w-7xl space-y-1 px-5 py-5">
            <p className="mb-2 px-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Chức năng</p>
            {FEATURE_LINKS.map((item) => {
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
            {isLoading ? (
              <div className="mt-3 border-t border-border pt-4">
                <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
              </div>
            ) : user ? (
              <div className="mt-3 space-y-3 border-t border-border pt-4">
                <div className="flex min-w-0 items-center gap-3 rounded-lg bg-surface-muted p-3">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={user.avatar || undefined} alt={user.name || 'Avatar'} className="object-cover" />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-success font-bold text-primary-foreground">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-foreground">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>

                <Button
                  className="w-full rounded-lg bg-gradient-to-r from-primary to-success text-sm text-primary-foreground"
                  onClick={() => navigate(primaryAppPath)}
                >
                  <PrimaryIcon className="mr-2 h-4 w-4" />
                  {user.role === 'admin' ? 'Bảng điều khiển admin' : 'Tạo nội dung AI'}
                </Button>

                <div className={`grid gap-2 ${user.role === 'customer' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  <Button variant="outline" className="w-full rounded-lg text-sm" onClick={() => navigate(profilePath)}>
                    <User className="mr-2 h-4 w-4" />
                    Hồ sơ
                  </Button>
                  {user.role === 'customer' && (
                    <Button variant="outline" className="w-full rounded-lg text-sm" onClick={() => navigate('/billing')}>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Thanh toán
                    </Button>
                  )}
                </div>

                <Button variant="outline" className="w-full rounded-lg text-sm text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Đăng xuất
                </Button>
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-4">
                <Button variant="outline" className="w-full rounded-lg text-sm" onClick={() => navigate('/login')}>Đăng nhập</Button>
                <Button className="w-full rounded-lg bg-gradient-to-r from-primary to-success text-sm text-primary-foreground" onClick={() => navigate('/register')}>Đăng ký</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
