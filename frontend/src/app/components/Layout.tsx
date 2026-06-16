import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from '@/lib/next-router-compat';
import { useAuth } from '@/app/contexts/AuthContext';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/app/components/ui/sheet';
import {
  LayoutDashboard, Wand2, FileText, User,
  LogOut, Menu, CreditCard, Brain, Key, Settings,
  FolderOpen, Bell, Shield, Tag, DollarSign, ScrollText,
  FileCheck, Crown,
} from 'lucide-react';
import {
  ADMIN_MENU_ITEMS, getAdminRoleDef, hasPermission,
} from '@/lib/permissions';
import { CustomerHeader } from '@/app/components/CustomerHeader';
import { CustomerFooter } from '@/app/components/CustomerFooter';
import { BrandLogo } from '@/app/components/BrandLogo';

interface LayoutProps { children: ReactNode; }
interface MenuItem { label: string; icon: any; path: string; badge?: string; }

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const customerMenu: MenuItem[] = [
    { label: 'Dashboard',           icon: LayoutDashboard, path: '/dashboard' },
    { label: 'AI Generator',        icon: Wand2,           path: '/generate', badge: 'New' },
    { label: 'Nội Dung',            icon: FileText,        path: '/contents' },
    { label: 'Dự Án',               icon: FolderOpen,      path: '/projects' },
    { label: 'Mẫu Copy',            icon: ScrollText,      path: '/templates' },
    { label: 'Fine-tuning',         icon: Brain,           path: '/fine-tune' },
    { label: 'Kiểm Tra Đạo Văn',   icon: FileCheck,       path: '/plagiarism-check' },
    { label: 'Hồ Sơ',              icon: User,            path: '/profile' },
    { label: 'Thanh Toán',          icon: CreditCard,      path: '/billing' },
    { label: 'Thông Báo',           icon: Bell,            path: '/notifications' },
  ];

  const filteredAdminMenu = ADMIN_MENU_ITEMS.filter(item =>
    hasPermission(user?.adminRole, item.permission)
  );

  const menuItems = user?.role === 'admin' ? filteredAdminMenu : customerMenu;
  const handleLogout = () => { logout(); navigate('/login'); };

  const adminRoleDef = user?.role === 'admin' && user.adminRole
    ? getAdminRoleDef(user.adminRole)
    : null;
  const userInitial = user?.name?.charAt(0).toUpperCase() || 'U';

  const Sidebar = () => (
    <div className="h-full flex flex-col overflow-y-auto">
      {/* Logo */}
      <div className="p-5 border-b flex-shrink-0">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <BrandLogo size="md" />
        </Link>
      </div>

      {/* Role badge */}
      <div className="px-4 py-3 border-b flex-shrink-0 space-y-1.5">
        {user?.role === 'admin' && adminRoleDef ? (
          <div className={`inline-flex items-center gap-1.5 ${adminRoleDef.color} border ${adminRoleDef.borderColor} rounded-lg px-2.5 py-1.5 w-full`}>
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${adminRoleDef.dotColor}`} />
            <span className={`text-xs font-semibold ${adminRoleDef.textColor} truncate`}>{adminRoleDef.label}</span>
          </div>
        ) : (
          <Badge variant="warning">👤 Khách hàng · Pro</Badge>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}>
              <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}>
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-primary' : ''}`} />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                {'badge' in item && item.badge && (
                  <Badge variant="warning" className="text-xs px-1.5 py-0">{item.badge}</Badge>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-9 h-9 flex-shrink-0">
            <AvatarImage src={user?.avatar || undefined} alt={user?.name || 'Avatar'} className="object-cover" />
            <AvatarFallback className="bg-gradient-to-br from-primary to-success text-primary-foreground text-sm">
              {userInitial}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate text-foreground">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <Button variant="outline" className="w-full h-9 text-sm rounded-xl" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" /> Đăng xuất
        </Button>
      </div>
    </div>
  );

  // ── ADMIN LAYOUT (sidebar only, no extra header/footer) ──
  if (user?.role === 'admin') {
    return (
      <div className="min-h-screen bg-surface-muted flex">
        <aside className="hidden md:block w-60 bg-card border-r flex-shrink-0">
          <Sidebar />
        </aside>
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Header for admin */}
          <header className="md:hidden bg-card border-b p-4 flex items-center justify-between flex-shrink-0">
            <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
              <BrandLogo size="md" />
            </Link>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon"><Menu className="w-5 h-5" /></Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-60">
                <Sidebar />
              </SheetContent>
            </Sheet>
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // ── CUSTOMER LAYOUT (sidebar + header + footer) ──
  return (
    <div className="min-h-screen bg-surface-muted flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-60 bg-card border-r flex-shrink-0 sticky top-0 h-screen overflow-y-auto">
        <Sidebar />
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden bg-card border-b p-4 flex items-center justify-between flex-shrink-0">
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
            <BrandLogo size="md" />
          </Link>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon"><Menu className="w-5 h-5" /></Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-60">
              <Sidebar />
            </SheetContent>
          </Sheet>
        </header>

        {/* ✅ Customer Header (desktop) */}
        <div className="hidden md:block">
          <CustomerHeader />
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>

        {/* ✅ Customer Footer */}
        <CustomerFooter />
      </div>
    </div>
  );
}
