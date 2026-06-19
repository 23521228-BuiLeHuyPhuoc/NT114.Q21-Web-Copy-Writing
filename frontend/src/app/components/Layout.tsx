import { type ReactNode, type UIEvent, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from '@/lib/next-router-compat';
import { useAuth } from '@/app/contexts/AuthContext';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/app/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import {
  LayoutDashboard, Wand2, FileText, User,
  LogOut, Menu, CreditCard, Brain,
  FolderOpen, Bell, ScrollText,
  FileCheck, ChevronDown, ShieldCheck, Settings,
} from 'lucide-react';
import {
  ADMIN_MENU_ITEMS, getAdminRoleDef, getCustomerRoleDef, getPermissionForRoute, hasCustomerPermission, hasPermission,
} from '@/lib/permissions';
import {
  useAdminHeaderNotifications,
  useMarkAdminNotificationRead,
  useMarkAllAdminNotificationsRead,
} from '@/hooks/queries/useAdminNotifications';
import type { AdminUiNotification } from '@/services/adminNotificationService';
import { CustomerHeader } from '@/app/components/CustomerHeader';
import { CustomerFooter } from '@/app/components/CustomerFooter';
import { BrandLogo } from '@/app/components/BrandLogo';

interface LayoutProps { children: ReactNode; }
interface MenuItem { label: string; icon: any; path: string; badge?: string; }
type AdminMenuItem = (typeof ADMIN_MENU_ITEMS)[number];
interface MenuGroup<T extends MenuItem> { label: string; items: T[]; }

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const adminCanUseNotifications = user?.role === 'admin' && hasPermission(user?.adminRole, 'notifications');
  const { data: adminHeaderNotifications } = useAdminHeaderNotifications(adminCanUseNotifications);
  const markAdminNotificationRead = useMarkAdminNotificationRead();
  const markAllAdminNotificationsRead = useMarkAllAdminNotificationsRead();
  const adminNotifications = adminHeaderNotifications?.items || [];
  const adminUnread = adminHeaderNotifications?.unreadCount || 0;
  const [adminNotiOpen, setAdminNotiOpen] = useState(false);
  const [adminUserOpen, setAdminUserOpen] = useState(false);
  const adminNotiRef = useRef<HTMLDivElement>(null);

  const customerMenuGroups: MenuGroup<MenuItem>[] = [
    {
      label: 'Tổng quan',
      items: [
        { label: 'Bảng điều khiển', icon: LayoutDashboard, path: '/dashboard' },
      ],
    },
    {
      label: 'Sáng tạo nội dung',
      items: [
        { label: 'Tạo nội dung AI', icon: Wand2, path: '/generate' },
        { label: 'Nội dung của tôi', icon: FileText, path: '/contents' },
        { label: 'Dự án', icon: FolderOpen, path: '/projects' },
        { label: 'Mẫu copy', icon: ScrollText, path: '/templates' },
        { label: 'Kiểm tra đạo văn', icon: FileCheck, path: '/plagiarism-check' },
      ],
    },
    {
      label: 'AI nâng cao',
      items: [
        { label: 'Fine-tuning', icon: Brain, path: '/fine-tune' },
      ],
    },
    {
      label: 'Tài khoản',
      items: [
        { label: 'Hồ sơ', icon: User, path: '/profile' },
        { label: 'Gói & thanh toán', icon: CreditCard, path: '/billing' },
        { label: 'Thông báo', icon: Bell, path: '/notifications' },
      ],
    },
  ];

  const filteredCustomerMenuGroups = customerMenuGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        const permission = getPermissionForRoute(item.path, 'customer');
        return !permission || hasCustomerPermission(user?.customerRole, permission);
      }),
    }))
    .filter((group) => group.items.length > 0);

  const filteredAdminMenu = ADMIN_MENU_ITEMS.filter(item =>
    hasPermission(user?.adminRole, item.permission)
  );
  const adminMenuGroups = filteredAdminMenu.reduce<MenuGroup<AdminMenuItem>[]>((groups, item) => {
    const group = groups.find((entry) => entry.label === item.section);
    if (group) {
      group.items.push(item);
    } else {
      groups.push({ label: item.section, items: [item] });
    }
    return groups;
  }, []);

  const handleLogout = () => {
    const redirectPath = user?.role === 'admin' ? '/admin/login' : '/login';
    logout();
    navigate(redirectPath);
  };

  const adminRoleDef = user?.role === 'admin' && user.adminRole
    ? getAdminRoleDef(user.adminRole)
    : null;
  const customerRoleDef = user?.role === 'customer'
    ? getCustomerRoleDef(user.customerRole)
    : null;
  const userInitial = user?.name?.charAt(0).toUpperCase() || 'U';
  const firstName = user?.name?.split(' ')[0] || (user?.role === 'admin' ? 'Admin' : 'User');

  const isPathActive = (path: string) => location.pathname === path || (
    path !== '/dashboard' &&
    path !== '/admin' &&
    location.pathname.startsWith(`${path}/`)
  );

  const activeAdminMenuItem = filteredAdminMenu.find((item) => isPathActive(item.path));
  const adminSelfPage = location.pathname === '/admin/profile'
    ? { label: 'Tài khoản admin', section: 'Tài khoản' }
    : null;
  const adminPageTitle = activeAdminMenuItem?.label || adminSelfPage?.label || 'Quản trị';
  const adminPageSection = activeAdminMenuItem?.section || adminSelfPage?.section || 'Admin';
  const sidebarScrollKey = `copypro.sidebar.scroll.${user?.role || 'guest'}`;

  const restoreSidebarScroll = (node: HTMLDivElement | null) => {
    if (!node || typeof window === 'undefined') return;
    const savedTop = Number(window.sessionStorage.getItem(sidebarScrollKey) || 0);
    if (!Number.isFinite(savedTop) || savedTop <= 0) return;

    window.requestAnimationFrame(() => {
      node.scrollTop = savedTop;
    });
  };

  const saveSidebarScroll = (event: UIEvent<HTMLDivElement>) => {
    if (typeof window === 'undefined') return;
    window.sessionStorage.setItem(sidebarScrollKey, String(event.currentTarget.scrollTop));
  };

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (adminNotiRef.current && !adminNotiRef.current.contains(event.target as Node)) {
        setAdminNotiOpen(false);
      }
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    setAdminNotiOpen(false);
    setAdminUserOpen(false);
  }, [location.pathname]);

  const markAllAdminRead = () => {
    if (markAllAdminNotificationsRead.isPending) return;
    markAllAdminNotificationsRead.mutate();
  };

  const openAdminNotification = (notification: AdminUiNotification) => {
    if (!notification.read) {
      markAdminNotificationRead.mutate(notification.id);
    }

    setAdminNotiOpen(false);
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const renderMenuLink = (item: MenuItem) => {
    const Icon = item.icon;
    const isActive = isPathActive(item.path);

    return (
      <Link key={item.path} to={item.path}>
        <div className={`flex items-start justify-between gap-2 px-3 py-2.5 rounded-xl transition-colors ${
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        }`}>
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <Icon className={`mt-0.5 h-4 w-4 flex-shrink-0 ${isActive ? 'text-primary' : ''}`} />
            <span className="min-w-0 flex-1 whitespace-normal break-words text-sm font-medium leading-snug">
              {item.label}
            </span>
          </div>
          {'badge' in item && item.badge && (
            <Badge variant="warning" className="mt-0.5 flex-shrink-0 px-1.5 py-0 text-xs">{item.badge}</Badge>
          )}
        </div>
      </Link>
    );
  };

  const AdminHeader = () => (
    <header className="hidden md:flex h-[60px] bg-card border-b border-border/80 items-center px-4 lg:px-6 gap-3 sticky top-0 z-30 flex-shrink-0">
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <Link to="/admin" className="text-xs text-muted-foreground hover:text-primary transition-colors shrink-0">
          CopyPro Admin
        </Link>
        <span className="text-border text-xs">/</span>
        <span className="text-xs text-muted-foreground truncate max-w-44">{adminPageSection}</span>
        <span className="text-border text-xs">/</span>
        <span className="text-sm font-semibold text-foreground truncate">{adminPageTitle}</span>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        {adminRoleDef && (
          <div className={`hidden sm:inline-flex items-center gap-1.5 h-9 ${adminRoleDef.color} border ${adminRoleDef.borderColor} rounded-lg px-3`}>
            <ShieldCheck className={`w-3.5 h-3.5 ${adminRoleDef.textColor}`} />
            <span className={`text-xs font-semibold ${adminRoleDef.textColor}`}>{adminRoleDef.label}</span>
          </div>
        )}

        {adminCanUseNotifications && (
          <div className="relative" ref={adminNotiRef}>
            <Button
              variant="ghost"
              size="icon"
              className={`relative w-9 h-9 rounded-lg transition-colors ${
                location.pathname === '/admin/notifications' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => { setAdminNotiOpen((open) => !open); setAdminUserOpen(false); }}
            >
              <Bell className="w-4 h-4" />
              <span className="sr-only">Thông báo</span>
              {adminUnread > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full ring-2 ring-card" />
              )}
            </Button>

            {adminNotiOpen && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-card rounded-lg shadow-2xl border border-border z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-foreground">Thông báo admin</p>
                    {adminUnread > 0 && (
                      <span className="bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full px-1.5 py-0.5">
                        {adminUnread} mới
                      </span>
                    )}
                  </div>
                  {adminUnread > 0 && (
                    <button
                      onClick={markAllAdminRead}
                      disabled={markAllAdminNotificationsRead.isPending}
                      className="text-xs text-primary hover:text-primary/80 font-semibold transition-colors disabled:opacity-60"
                    >
                      Đọc tất cả
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-border/60">
                  {adminNotifications.length === 0 && (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                      Chưa có thông báo nào
                    </div>
                  )}

                  {adminNotifications.map((notification) => {
                    const Icon = notification.icon;

                    return (
                      <button
                        key={notification.id}
                        onClick={() => openAdminNotification(notification)}
                        className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-surface-muted transition-colors text-left ${
                          !notification.read ? 'bg-primary/5' : ''
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${notification.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm truncate ${!notification.read ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'}`}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{notification.desc}</p>
                          <p className="text-[10px] text-muted-foreground/80 mt-1">{notification.time}</p>
                        </div>
                        {!notification.read && <span className="w-2 h-2 bg-destructive rounded-full flex-shrink-0 mt-1.5" />}
                      </button>
                    );
                  })}
                </div>

                <div className="border-t px-4 py-2.5">
                  <Link
                    to="/admin/notifications"
                    onClick={() => setAdminNotiOpen(false)}
                    className="text-xs text-primary hover:text-primary/80 font-semibold transition-colors"
                  >
                    Xem tất cả thông báo →
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        <DropdownMenu
          open={adminUserOpen}
          onOpenChange={(open) => {
            setAdminUserOpen(open);
            if (open) setAdminNotiOpen(false);
          }}
        >
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2 h-9 pl-1 pr-2 rounded-lg hover:bg-muted transition-colors"
              onPointerDown={() => setAdminNotiOpen(false)}
            >
              <Avatar className="w-7 h-7">
                <AvatarImage src={user?.avatar || undefined} alt={user?.name || 'Avatar'} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-primary to-success text-primary-foreground text-xs font-bold">
                  {userInitial}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:block text-sm font-semibold text-foreground max-w-24 truncate">{firstName}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${adminUserOpen ? 'rotate-180' : ''}`} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60 p-0 overflow-hidden">
            <DropdownMenuLabel className="px-4 py-4 border-b bg-gradient-to-br from-primary/10 to-success/10">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarImage src={user?.avatar || undefined} alt={user?.name || 'Avatar'} className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-success text-primary-foreground font-bold">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-foreground truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  {adminRoleDef && (
                    <span className={`inline-flex items-center gap-1 ${adminRoleDef.color} ${adminRoleDef.textColor} text-[10px] font-semibold rounded px-1.5 h-4 mt-1`}>
                      <ShieldCheck className="w-2.5 h-2.5" /> {adminRoleDef.label}
                    </span>
                  )}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="m-0" />
            <div className="p-2 space-y-0.5">
              <DropdownMenuItem asChild className="px-3 py-2 rounded-lg">
                <Link to="/admin/profile" className="cursor-pointer gap-2.5">
                  <User className="w-4 h-4" />
                Tài khoản admin
                </Link>
              </DropdownMenuItem>
              {hasPermission(user?.adminRole, 'settings') && (
              <DropdownMenuItem asChild className="px-3 py-2 rounded-lg">
                <Link to="/admin/settings" className="cursor-pointer gap-2.5">
                  <Settings className="w-4 h-4" />
                  Cài đặt
                </Link>
              </DropdownMenuItem>
              )}
              {hasPermission(user?.adminRole, 'notifications') && (
              <DropdownMenuItem asChild className="px-3 py-2 rounded-lg">
                <Link to="/admin/notifications" className="cursor-pointer gap-2.5">
                  <Bell className="w-4 h-4" />
                  Thông báo
                </Link>
              </DropdownMenuItem>
              )}
            </div>
            <DropdownMenuSeparator className="m-0" />
            <div className="p-2">
              <DropdownMenuItem variant="destructive" onClick={handleLogout} className="px-3 py-2 rounded-lg">
                <LogOut className="w-4 h-4" />
              Đăng xuất
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );

  const Sidebar = () => (
    <div ref={restoreSidebarScroll} onScroll={saveSidebarScroll} className="h-full flex flex-col overflow-y-auto overscroll-contain">
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
        ) : customerRoleDef ? (
          <div className={['inline-flex w-full items-center gap-1.5 rounded-lg border px-2.5 py-1.5', customerRoleDef.color, customerRoleDef.borderColor].join(' ')}>
            <div className={['h-2 w-2 flex-shrink-0 rounded-full', customerRoleDef.dotColor].join(' ')} />
            <span className={['truncate text-xs font-semibold', customerRoleDef.textColor].join(' ')}>{customerRoleDef.label}</span>
          </div>
        ) : (
          <Badge variant="warning">Khách hàng</Badge>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 p-3">
        {user?.role === 'admin' ? (
          <div className="space-y-3">
            {adminMenuGroups.map((group) => (
              <div key={group.label} className="space-y-1">
                <p className="px-3 text-[11px] font-semibold uppercase text-muted-foreground/70">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.items.map(renderMenuLink)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCustomerMenuGroups.map((group) => (
              <div key={group.label} className="space-y-1">
                <p className="px-3 text-[11px] font-semibold uppercase text-muted-foreground/70">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.items.map(renderMenuLink)}
                </div>
              </div>
            ))}
          </div>
        )}
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

  // ── ADMIN LAYOUT ──
  if (user?.role === 'admin') {
    return (
      <div className="min-h-screen bg-surface-muted flex">
        <aside className="hidden md:block w-60 bg-card border-r flex-shrink-0 sticky top-0 h-screen">
          <Sidebar />
        </aside>
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Header for admin */}
          <header className="md:hidden bg-card border-b p-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <Link to="/admin" className="flex items-center hover:opacity-80 transition-opacity flex-shrink-0">
                <BrandLogo size="md" />
              </Link>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">{adminPageSection}</p>
                <p className="text-sm font-semibold text-foreground truncate">{adminPageTitle}</p>
              </div>
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon"><Menu className="w-5 h-5" /></Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-60">
                <Sidebar />
              </SheetContent>
            </Sheet>
          </header>
          <AdminHeader />
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
      <aside className="hidden md:block w-60 bg-card border-r flex-shrink-0 sticky top-0 h-screen">
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
