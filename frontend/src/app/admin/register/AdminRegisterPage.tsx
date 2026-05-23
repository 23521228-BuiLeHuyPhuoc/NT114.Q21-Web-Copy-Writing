import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, ADMIN_INVITE_CODE } from '@/app/contexts/AuthContext';
import {
  validateConfirmPassword,
  validateEmail,
  validateName,
  validateStrongPassword,
} from '@/lib/authValidation';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { BrandLogo } from '@/app/components/BrandLogo';
import {
  Shield, Eye, EyeOff, Mail, Lock, User, Key,
  CheckCircle2, AlertTriangle, ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getAdminRoles, type AdminRole } from '@/lib/permissions';

export function AdminRegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName]               = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [inviteCode, setInviteCode]   = useState('');
  const [adminRole, setAdminRole]     = useState<AdminRole>('content_manager');
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCode, setShowCode]       = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [isLoading, setIsLoading]     = useState(false);
  const [success, setSuccess]         = useState(false);

  const ROLE_OPTIONS = Object.entries(getAdminRoles()).map(([key, def]) => ({
    value: key as AdminRole,
    label: def.label,
    description: def.description,
    color: def.color,
    textColor: def.textColor,
    borderColor: def.borderColor,
    dotColor: def.dotColor,
    permissions: def.permissions,
  }));
  const selectedRole = ROLE_OPTIONS.find(r => r.value === adminRole)!;

  const passwordStrength = (() => {
    if (password.length === 0) return null;
    let score = 0;
    if (password.length >= 8)          score++;
    if (/[A-Z]/.test(password))        score++;
    if (/[0-9]/.test(password))        score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return { level: 'Yếu',      color: 'bg-destructive/100',    width: '25%'  };
    if (score === 2) return { level: 'Trung bình', color: 'bg-warning/100', width: '50%'  };
    if (score === 3) return { level: 'Mạnh',     color: 'bg-primary/50',   width: '75%'  };
    return               { level: 'Rất mạnh',   color: 'bg-primary/50',  width: '100%' };
  })();

  const passMatch    = confirmPass.length > 0 && password === confirmPass;
  const passMismatch = confirmPass.length > 0 && password !== confirmPass;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const passwordError = validateStrongPassword(password);
    const confirmError = validateConfirmPassword(confirmPass, password);

    if (nameError !== true) { toast.error(nameError); return; }
    if (emailError !== true) { toast.error(emailError); return; }
    if (passwordError !== true) { toast.error(passwordError); return; }
    if (confirmError !== true) { toast.error(confirmError); return; }
    if (inviteCode.trim().length < 4) { toast.error('Mã mời Admin là bắt buộc'); return; }

    setIsLoading(true);
    try {
      await register({
        email: email.trim().toLowerCase(),
        password,
        name: name.trim(),
        role: 'admin',
        adminRole,
        inviteCode: inviteCode.trim(),
      });
      setSuccess(true);
      toast('Yêu cầu đã gửi — đang chờ Super Admin phê duyệt.');
    } catch (err: any) {
      toast.error(err.message || 'Đăng ký thất bại');
    }
    setIsLoading(false);
  };

  if (success) {
    return (
      <div className="dark min-h-screen flex items-center justify-center bg-gray-950 px-5">
        <div className="text-center max-w-md">

          {/* Animated pending icon */}
          <div className="relative w-28 h-28 mx-auto mb-8">
            {/* Outer spinning ring */}
            <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" style={{ animationDuration: '2s' }} />
            {/* Inner pulsing circle */}
            <div className="absolute inset-3 rounded-full bg-warning/10 animate-pulse flex items-center justify-center">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg shadow-amber-900/50">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                  <path strokeLinecap="round" d="M12 6v6l4 2" />
                </svg>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="inline-flex items-center gap-2 bg-amber-950/50 border border-amber-700/40 rounded-full px-4 py-1.5 mb-5">
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
            <span className="text-amber-400 text-xs font-semibold tracking-wide">Đang chờ xét duyệt</span>
          </div>

          <h2 className="text-white mb-3 leading-snug">
            Yêu cầu đã được<br />
            <span className="text-amber-400">gửi đi!</span>
          </h2>

          <p className="text-muted-foreground/80 text-sm leading-relaxed mb-6">
            Tài khoản <span className="text-white font-semibold">{name}</span> với email{' '}
            <span className="text-primary font-semibold">{email}</span> đã được tạo và đang chờ Super Admin xem xét và phê duyệt.
          </p>

          {/* Role badge */}
          <div className={`inline-flex items-center gap-2 ${selectedRole.color} border ${selectedRole.borderColor} rounded-full px-4 py-2 mb-8`}>
            <div className={`w-2 h-2 rounded-full ${selectedRole.dotColor}`} />
            <span className={`text-sm font-semibold ${selectedRole.textColor}`}>{selectedRole.label}</span>
          </div>

          {/* Status steps */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-8 text-left space-y-3">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Tiến trình xét duyệt</p>

            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-primary/50 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Đăng ký thành công</p>
                <p className="text-xs text-muted-foreground">Thông tin tài khoản đã được lưu</p>
              </div>
            </div>

            <div className="ml-3.5 w-px h-4 bg-gray-700" />

            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-warning/20 border-2 border-amber-500 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
                <div className="w-2.5 h-2.5 bg-amber-400 rounded-full" />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-300">Đang chờ Super Admin duyệt</p>
                <p className="text-xs text-muted-foreground">Có thể mất 24–48 giờ</p>
              </div>
            </div>

            <div className="ml-3.5 w-px h-4 bg-gray-800" />

            <div className="flex items-center gap-3 opacity-40">
              <div className="w-7 h-7 bg-gray-800 border-2 border-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-foreground/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground/80">Kích hoạt & Đăng nhập</p>
                <p className="text-xs text-foreground/70">Nhận email thông báo khi được duyệt</p>
              </div>
            </div>
          </div>

          {/* Note box */}
          <div className="bg-green-950/30 border border-green-800/30 rounded-xl p-4 mb-8 text-left flex gap-3">
            <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-muted-foreground/80 text-xs leading-relaxed">
              Trong thời gian chờ, bạn <span className="text-white">chưa thể đăng nhập</span>. Khi tài khoản được phê duyệt, bạn sẽ có thể đăng nhập với email và mật khẩu đã đăng ký.
            </p>
          </div>

          {/* CTA */}
          <a href="/admin/login">
            <button className="w-full h-12 border border-gray-800 hover:border-gray-700 text-muted-foreground/80 hover:text-gray-200 hover:bg-gray-900 rounded-xl font-semibold text-sm transition-all">
              ← Quay lại trang đăng nhập Admin
            </button>
          </a>

          <p className="text-center text-xs text-foreground/80 mt-6">
            Liên hệ <span className="text-muted-foreground">admin@copypro.vn</span> nếu cần hỗ trợ
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen flex bg-gray-950">

      {/* ── LEFT: Role Selector Panel ── */}
      <div className="hidden lg:flex lg:w-[52%] flex-col relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-slate-900 to-green-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_20%_50%,rgba(20,184,166,0.1),transparent)]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(20,184,166,0.45) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,0.45) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-warning/10 rounded-full blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="relative p-10 flex items-center gap-3 border-b border-white/5">
          <Link to="/" className="inline-flex items-center hover:opacity-90 transition-opacity">
            <BrandLogo size="lg" tone="light" surface="light" />
          </Link>
          <span className="text-xs bg-amber-950/60 text-amber-300 border border-amber-700/40 rounded px-2 py-0.5">Admin Console</span>
        </div>

        {/* Role cards */}
        <div className="relative flex-1 flex flex-col justify-center px-12 xl:px-16">
          <p className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-3">Phân quyền Admin</p>
          <h2 className="text-white mb-2 leading-tight">Chọn loại tài khoản</h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-8">
            Mỗi loại Admin có phạm vi quyền truy cập riêng. Phù hợp với vai trò trong tổ chức của bạn.
          </p>

          <div className="space-y-2">
            {ROLE_OPTIONS.map((role) => {
              const isSelected = adminRole === role.value;
              return (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setAdminRole(role.value)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-card/8 border-primary/50 ring-1 ring-green-500/30'
                      : 'bg-card/3 border-white/8 hover:bg-card/10 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${role.dotColor} ${isSelected ? 'ring-2 ring-offset-1 ring-offset-gray-900' : 'opacity-60'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-muted-foreground/60'}`}>{role.label}</p>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-foreground/70 mt-0.5 truncate">{role.description}</p>
                    </div>
                    {/* Permission count */}
                    <span className="text-[10px] text-foreground/70 flex-shrink-0">
                      {role.permissions.length} quyền
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Hint invite code */}
          <div className="mt-6 bg-amber-950/40 border border-amber-700/30 rounded-xl p-3 flex gap-2.5 items-start">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-muted-foreground text-xs leading-relaxed">
              Mã mời (demo): <span className="font-mono text-amber-300">{ADMIN_INVITE_CODE}</span>
            </p>
          </div>
        </div>

        <div className="relative px-12 xl:px-16 pb-10 pt-6 border-t border-white/5">
          <p className="text-foreground/70 text-xs">CopyPro Admin Console v2.0 · Chỉ dành cho nhân viên được ủy quyền</p>
        </div>
      </div>

      {/* ── RIGHT: Form ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 bg-gray-950 overflow-y-auto">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8 flex items-center gap-2.5">
          <Link to="/" className="inline-flex items-center hover:opacity-90 transition-opacity">
            <BrandLogo size="lg" tone="light" surface="light" />
          </Link>
          <span className="text-xs bg-amber-950/60 text-amber-300 border border-amber-700/40 rounded px-2 py-0.5">Admin</span>
        </div>

        <div className="w-full max-w-[400px]">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 mb-5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span className="text-amber-500 text-xs font-semibold">Khu vực giới hạn</span>
            </div>
            <h2 className="text-white mb-1.5 leading-tight">Đăng ký Admin</h2>
            <p className="text-muted-foreground text-sm">Tạo tài khoản quản trị viên mới cho hệ thống CopyPro.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Họ tên */}
            <div>
              <Label className="text-muted-foreground/80 mb-2 block text-xs uppercase tracking-wider">Họ và tên</Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/70" />
                <Input type="text" placeholder="Nguyễn Văn Admin" value={name} onChange={e => setName(e.target.value)}
                  className="pl-10 h-12 rounded-xl bg-gray-900 border-gray-700 text-white placeholder:text-foreground/70 focus:border-primary focus:bg-gray-800" required />
              </div>
            </div>

            {/* Email */}
            <div>
              <Label className="text-muted-foreground/80 mb-2 block text-xs uppercase tracking-wider">Email Admin</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/70" />
                <Input type="email" placeholder="admin@copypro.vn" value={email} onChange={e => setEmail(e.target.value)}
                  className="pl-10 h-12 rounded-xl bg-gray-900 border-gray-700 text-white placeholder:text-foreground/70 focus:border-primary focus:bg-gray-800" required />
              </div>
            </div>

            {/* Loại Admin - mobile only dropdown (desktop: left panel) */}
            <div className="lg:hidden">
              <Label className="text-muted-foreground/80 mb-2 block text-xs uppercase tracking-wider">Loại Admin</Label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className="w-full h-12 bg-gray-900 border border-gray-700 rounded-xl px-4 flex items-center justify-between text-white hover:border-primary transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full ${selectedRole.dotColor}`} />
                    <span className="text-sm font-medium">{selectedRole.label}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showRoleDropdown && (
                  <div className="absolute top-full mt-1 left-0 right-0 bg-gray-900 border border-gray-700 rounded-xl overflow-hidden z-20 shadow-2xl">
                    {ROLE_OPTIONS.map(role => (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => { setAdminRole(role.value); setShowRoleDropdown(false); }}
                        className={`w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-800 transition-colors ${adminRole === role.value ? 'bg-green-950/30' : ''}`}
                      >
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${role.dotColor}`} />
                        <div>
                          <p className="text-sm font-medium text-white">{role.label}</p>
                          <p className="text-xs text-foreground/70">{role.description}</p>
                        </div>
                        {adminRole === role.value && <CheckCircle2 className="w-4 h-4 text-primary ml-auto flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <Label className="text-muted-foreground/80 mb-2 block text-xs uppercase tracking-wider">Mật khẩu</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/70" />
                <Input type={showPass ? 'text' : 'password'} placeholder="Tối thiểu 8 ký tự" value={password} onChange={e => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 rounded-xl bg-gray-900 border-gray-700 text-white placeholder:text-foreground/70 focus:border-primary focus:bg-gray-800" required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground/70 hover:text-muted-foreground/80 transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordStrength && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-foreground/70">Độ mạnh</span>
                    <span className={`text-[11px] font-semibold ${passwordStrength.level === 'Yếu' ? 'text-red-400' : passwordStrength.level === 'Trung bình' ? 'text-amber-400' : passwordStrength.level === 'Mạnh' ? 'text-primary' : 'text-primary'}`}>{passwordStrength.level}</span>
                  </div>
                  <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`} style={{ width: passwordStrength.width }} />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <Label className="text-muted-foreground/80 mb-2 block text-xs uppercase tracking-wider">Xác nhận mật khẩu</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/70" />
                <Input type={showConfirm ? 'text' : 'password'} placeholder="Nhập lại mật khẩu" value={confirmPass} onChange={e => setConfirmPass(e.target.value)}
                  className={`pl-10 pr-10 h-12 rounded-xl bg-gray-900 text-white placeholder:text-foreground/70 focus:bg-gray-800 transition-colors ${passMismatch ? 'border-red-600' : passMatch ? 'border-primary' : 'border-gray-700 focus:border-primary'}`} required />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground/70 hover:text-muted-foreground/80 transition-colors">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passMismatch && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Mật khẩu không khớp</p>}
              {passMatch   && <p className="text-primary text-xs mt-1.5 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Mật khẩu khớp</p>}
            </div>

            {/* Invite code */}
            <div>
              <Label className="text-muted-foreground/80 mb-2 block text-xs uppercase tracking-wider">
                Mã mời Admin <span className="text-amber-500 normal-case tracking-normal font-normal ml-1">(bắt buộc)</span>
              </Label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/70" />
                <Input type={showCode ? 'text' : 'password'} placeholder="Nhập mã mời từ quản trị viên" value={inviteCode} onChange={e => setInviteCode(e.target.value)}
                  className="pl-10 pr-10 h-12 rounded-xl bg-gray-900 border-gray-700 text-white placeholder:text-foreground/70 focus:border-amber-500 focus:bg-gray-800 font-mono tracking-widest" required />
                <button type="button" onClick={() => setShowCode(!showCode)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground/70 hover:text-muted-foreground/80 transition-colors">
                  {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-foreground/80 text-[11px] mt-1.5">Demo: <span className="font-mono text-amber-500/70">{ADMIN_INVITE_CODE}</span></p>
            </div>

            {/* Selected role preview */}
            <div className={`${selectedRole.color} border ${selectedRole.borderColor} rounded-xl p-3 flex items-center gap-2.5`}>
              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${selectedRole.dotColor}`} />
              <div>
                <p className={`text-xs font-semibold ${selectedRole.textColor}`}>{selectedRole.label}</p>
                <p className="text-[11px] text-foreground/70">{selectedRole.description}</p>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={isLoading || passMismatch}
              className="w-full h-12 bg-gradient-to-r from-emerald-600 via-green-600 to-green-600 hover:from-emerald-500 hover:via-green-500 hover:to-green-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-all shadow-xl shadow-primary/25 mt-1 flex items-center justify-center gap-2">
              {isLoading ? (
                <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Đang tạo tài khoản...</>
              ) : (
                <><Shield className="w-4 h-4" /> Tạo tài khoản Admin</>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-800" /></div>
            <div className="relative flex justify-center"><span className="bg-gray-950 px-3 text-xs text-foreground/70">Đã có tài khoản?</span></div>
          </div>

          <Link to="/admin/login">
            <button className="w-full h-11 border border-gray-800 hover:border-gray-700 text-muted-foreground/80 hover:text-gray-200 rounded-xl font-semibold text-sm transition-all hover:bg-gray-900">
              ← Quay lại đăng nhập Admin
            </button>
          </Link>

          <p className="text-center text-xs text-foreground/80 mt-6">© 2026 CopyPro Vietnam · Hệ thống nội bộ</p>
        </div>
      </div>
    </div>
  );
}
