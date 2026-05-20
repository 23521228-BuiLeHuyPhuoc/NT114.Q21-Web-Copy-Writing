import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Badge } from '@/app/components/ui/badge';
import {
  Bell, Search, Wand2, ChevronDown, User, CreditCard,
  Settings, LogOut, Crown, HelpCircle, X,
} from 'lucide-react';
import { BREADCRUMB_MAP, QUICK_ACTIONS } from '@/mocks/customerHeader';
import { useHeaderNotifications } from '@/hooks/queries/useNotifications';

export function CustomerHeader() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const { data: headerNotifications } = useHeaderNotifications();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [notiOpen, setNotiOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [notifications, setNotifications] = useState<NonNullable<typeof headerNotifications>>([] as any);
  useEffect(() => { if (headerNotifications) setNotifications(headerNotifications); }, [headerNotifications]);

  const notiRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const unread = notifications.filter(n => !n.read).length;
  const pageTitle = BREADCRUMB_MAP[location.pathname] || 'CopyPro';

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notiRef.current && !notiRef.current.contains(e.target as Node)) setNotiOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on route change
  useEffect(() => {
    setNotiOpen(false);
    setUserOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <header className="h-[60px] bg-card border-b border-border/80 flex items-center px-4 lg:px-6 gap-3 sticky top-0 z-30 flex-shrink-0">
      {/* Left: Page title + breadcrumb */}
      <div className="flex-1 min-w-0 hidden md:flex items-center gap-2">
        <Link to="/" className="text-xs text-muted-foreground hover:text-primary transition-colors shrink-0">CopyPro</Link>
        <span className="text-border text-xs">/</span>
        <span className="text-sm font-semibold text-foreground truncate">{pageTitle}</span>
      </div>

      {/* Center (mobile): page title */}
      <div className="flex-1 md:hidden text-sm font-semibold text-foreground truncate">{pageTitle}</div>

      {/* Right group */}
      <div className="flex items-center gap-1.5 flex-shrink-0">

        {/* Search */}
        {searchOpen ? (
          <div className="flex items-center gap-2 bg-surface-muted border border-border rounded-lg px-3 h-9 w-64 transition-all">
            <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            <input
              autoFocus
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder="Tìm nội dung, template..."
              className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground min-w-0"
              onKeyDown={e => e.key === 'Escape' && setSearchOpen(false)}
            />
            <button onClick={() => { setSearchOpen(false); setSearchVal(''); }}>
              <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>
        )}

        {/* Quick create button */}
        <button
          onClick={() => navigate('/generate')}
          className="hidden sm:flex items-center gap-1.5 h-9 px-3.5 bg-gradient-to-r from-primary to-success hover:from-primary/90 hover:to-success/90 text-primary-foreground rounded-lg text-xs font-bold transition-all shadow-sm shadow-primary/20"
        >
          <Wand2 className="w-3.5 h-3.5" />
          Tạo copy
        </button>

        {/* Notifications */}
        <div className="relative" ref={notiRef}>
          <button
            onClick={() => { setNotiOpen(!notiOpen); setUserOpen(false); }}
            className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full ring-2 ring-card" />
            )}
          </button>

          {notiOpen && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-card rounded-lg shadow-2xl border border-border z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-sm text-foreground">Thông báo</p>
                  {unread > 0 && (
                    <span className="bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full px-1.5 py-0.5">{unread} mới</span>
                  )}
                </div>
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-xs text-primary hover:text-primary/80 font-semibold transition-colors">
                    Đọc tất cả
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-border/60">
                {notifications.map(n => {
                  const Icon = n.icon;
                  return (
                    <button
                      key={n.id}
                      onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
                      className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-surface-muted transition-colors text-left ${!n.read ? 'bg-primary/5' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${n.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm truncate ${!n.read ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'}`}>{n.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{n.desc}</p>
                        <p className="text-[10px] text-muted-foreground/80 mt-1">{n.time} trước</p>
                      </div>
                      {!n.read && <span className="w-2 h-2 bg-destructive rounded-full flex-shrink-0 mt-1.5" />}
                    </button>
                  );
                })}
              </div>
              <div className="border-t px-4 py-2.5">
                <Link to="/notifications" onClick={() => setNotiOpen(false)} className="text-xs text-primary hover:text-primary/80 font-semibold transition-colors">
                  Xem tất cả thông báo →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User avatar dropdown */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => { setUserOpen(!userOpen); setNotiOpen(false); }}
            className="flex items-center gap-2 h-9 pl-1 pr-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Avatar className="w-7 h-7">
              <AvatarFallback className="bg-gradient-to-br from-primary to-success text-primary-foreground text-xs font-bold">
                {user?.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:block text-sm font-semibold text-foreground max-w-24 truncate">{user?.name.split(' ')[0]}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${userOpen ? 'rotate-180' : ''}`} />
          </button>

          {userOpen && (
            <div className="absolute top-full right-0 mt-2 w-60 bg-card rounded-lg shadow-2xl border border-border z-50 overflow-hidden">
              {/* User info */}
              <div className="px-4 py-4 border-b bg-gradient-to-br from-primary/10 to-success/10">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-success text-primary-foreground font-bold">
                      {user?.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-foreground truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    <Badge variant="warning" className="text-[10px] mt-1 px-1.5 py-0 h-4">
                      <Crown className="w-2.5 h-2.5 mr-1" /> Pro
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Quick actions */}
              <div className="p-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 mb-1.5">Truy cập nhanh</p>
                <div className="grid grid-cols-5 gap-1 mb-2">
                  {QUICK_ACTIONS.map(a => {
                    const Icon = a.icon;
                    return (
                      <Link key={a.path} to={a.path} onClick={() => setUserOpen(false)}
                        className="flex flex-col items-center gap-1 p-1.5 rounded-lg hover:bg-surface-muted transition-colors group">
                        <div className={`w-7 h-7 ${a.color} rounded-lg flex items-center justify-center`}>
                          <Icon className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-[9px] text-muted-foreground text-center leading-tight">{a.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="border-t p-2 space-y-0.5">
                {[
                  { icon: User,       label: 'Hồ sơ',        path: '/profile' },
                  { icon: CreditCard, label: 'Thanh toán',   path: '/billing' },
                  { icon: Crown,      label: 'Nâng gói',     path: '/subscription' },
                  { icon: Settings,   label: 'Cài đặt',      path: '/profile' },
                  { icon: HelpCircle, label: 'Hỗ trợ',       path: '/contact' },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.path + item.label} to={item.path} onClick={() => setUserOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-muted transition-colors group">
                      <Icon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-sm text-foreground/80 group-hover:text-foreground font-medium transition-colors">{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="border-t p-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-destructive/10 transition-colors group"
                >
                  <LogOut className="w-3.5 h-3.5 text-muted-foreground group-hover:text-destructive transition-colors" />
                  <span className="text-sm font-medium text-foreground/80 group-hover:text-destructive transition-colors">Đăng xuất</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
