import { useState } from 'react';
import { Link, useNavigate } from '@/lib/next-router-compat';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/app/contexts/AuthContext';
import {
  AUTH_PASSWORD_RULES,
  validateConfirmPassword,
  validateEmail,
  validateName,
  validateStrongPassword,
} from '@/lib/authValidation';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { BrandLogo } from '@/app/components/BrandLogo';
import { Eye, EyeOff, User, Mail, Lock, ArrowLeft, CheckCircle2, ArrowRight, Crown, Zap, Building2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePublicSystemStatus } from '@/hooks/queries/useSystemSettings';

const PLANS = [
  { id: 'free',  name: 'Miễn Phí', price: '0₫',     icon: Zap,      desc: '30 copy/tháng',         color: 'border-border bg-card',      check: 'bg-muted text-muted-foreground',   badge: '' },
  { id: 'pro',   name: 'Pro',       price: '299K₫',  icon: Crown,    desc: '500 copy · Fine-tuning', color: 'border-primary bg-primary/5',  check: 'bg-primary/10 text-primary', badge: 'Phổ biến' },
  { id: 'biz',   name: 'Business',  price: '799K₫',  icon: Building2, desc: '3.000 copy · API 50K',  color: 'border-green-400 bg-primary/5', check: 'bg-primary/10 text-primary', badge: '' },
];

interface RegisterFormData { name: string; email: string; password: string; confirm: string }

export function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerAccount, verifyEmail, resendEmailVerification } = useAuth();
  const { data: systemStatus, isLoading: loadingSystemStatus } = usePublicSystemStatus();
  const [step, setStep] = useState(1);
  const [showPass, setShowPass] = useState(false);
  const [plan, setPlan] = useState('pro');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const {
    register: registerField,
    handleSubmit: rhfHandleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({ defaultValues: { name: '', email: '', password: '', confirm: '' } });

  const passwordValue = watch('password', '');
  const registrationClosed = systemStatus?.registrationEnabled === false;

  const handleStep1 = (_data: RegisterFormData) => {
    if (registrationClosed) {
      toast.error('Hệ thống đang tạm ngừng nhận đăng ký mới');
      return;
    }
    setStep(2);
  };

  const handleFinalSubmit = async () => {
    const values = watch();
    setIsLoading(true);
    try {
      const result = await registerAccount({
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });
      if (result.requiresEmailVerification) {
        setPendingVerificationEmail(values.email.trim().toLowerCase());
        setVerificationCode('');
        setStep(3);
        toast.success('Đã gửi mã xác thực đến email của bạn');
        return;
      }

      toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.message || 'Đăng ký thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!pendingVerificationEmail || verificationCode.trim().length !== 6) {
      toast.error('Vui lòng nhập mã OTP 6 chữ số');
      return;
    }

    setIsVerifying(true);
    try {
      await verifyEmail(pendingVerificationEmail, verificationCode.trim());
      toast.success('Email đã được xác thực. Vui lòng đăng nhập.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.message || 'Không xác thực được email');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendVerification = async () => {
    if (!pendingVerificationEmail) return;

    setIsResending(true);
    try {
      const result = await resendEmailVerification(pendingVerificationEmail);
      if (result.alreadyVerified) {
        toast.success('Email đã được xác thực. Vui lòng đăng nhập.');
        navigate('/login');
        return;
      }
      toast.success('Đã gửi lại mã xác thực');
    } catch (err: any) {
      toast.error(err.message || 'Không gửi lại được mã xác thực');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ─── LEFT PANEL ─── */}
      <div className="dark hidden lg:flex lg:w-[42%] flex-col relative overflow-hidden bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_20%_50%,rgba(20,184,166,0.15),transparent)]" />

        <div className="relative p-10">
          <Link to="/" className="inline-flex items-center hover:opacity-90 transition-opacity">
            <BrandLogo size="lg" tone="light" surface="light" />
          </Link>
        </div>

        <div className="relative flex-1 flex flex-col justify-center px-12 pb-16">
          <h2 className="text-white mb-4 leading-tight">
            Tham gia 2,000+<br />
            <span className="bg-gradient-to-r from-emerald-300 via-green-300 to-green-300 bg-clip-text text-transparent">doanh nghiệp Việt</span>
          </h2>
          <p className="text-muted-foreground/80 text-base leading-relaxed mb-10">
            Dùng thử 14 ngày với đầy đủ tính năng Pro. Không cần thẻ tín dụng.
          </p>

          {/* Steps preview */}
          <div className="space-y-5">
            {[
              { n: '01', label: 'Tạo tài khoản', desc: 'Tên, email và mật khẩu', done: step >= 1 },
              { n: '02', label: 'Chọn gói phù hợp', desc: 'Miễn phí, Pro hoặc Business', done: step >= 2 },
              { n: '03', label: 'Bắt đầu tạo copy', desc: 'AI Generator sẵn sàng ngay lập tức', done: false },
            ].map((s) => (
              <div key={s.n} className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 transition-all ${s.done ? 'bg-primary/50 text-white' : 'bg-card/10 border border-white/20 text-muted-foreground'}`}>
                  {s.done ? <CheckCircle2 className="w-4 h-4" /> : s.n}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${s.done ? 'text-white' : 'text-muted-foreground'}`}>{s.label}</p>
                  <p className="text-xs text-foreground/70 mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── RIGHT PANEL ─── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-br from-background via-green-50/45 to-green-50/70">
        {/* Mobile logo */}
        <Link to="/" className="lg:hidden mb-8 inline-flex items-center hover:opacity-80 transition-opacity">
          <BrandLogo size="xl" />
        </Link>

        <div className="w-full max-w-[420px]">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Đã có tài khoản? Đăng nhập
          </Link>

          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-8">
            {[1, 2].map(s => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-muted text-muted-foreground/80'}`}>
                  {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
                </div>
                <span className={`text-xs font-semibold ${step >= s ? 'text-primary' : 'text-muted-foreground/80'}`}>
                  {s === 1 ? 'Thông tin' : 'Chọn gói'}
                </span>
                {s < 2 && <div className={`flex-1 h-px ${step > s ? 'bg-green-400' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          {registrationClosed && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
              <div className="mb-3 flex items-center gap-2 font-bold">
                <AlertCircle className="h-5 w-5" />
                Đăng ký mới đang tạm đóng
              </div>
              <p className="text-sm leading-6">
                Hệ thống hiện không nhận tài khoản mới. Vui lòng quay lại sau hoặc liên hệ hỗ trợ nếu bạn cần được cấp tài khoản.
              </p>
              <Link to="/login" className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-amber-700 px-4 text-sm font-bold text-white hover:bg-amber-800">
                Quay lại đăng nhập
              </Link>
            </div>
          )}

          {/* ─── STEP 1 ─── */}
          {!registrationClosed && step === 1 && (
            <>
              <div className="mb-7">
                <h2 className="text-foreground mb-1">Tạo tài khoản</h2>
                <p className="text-muted-foreground text-sm">14 ngày dùng thử Pro miễn phí</p>
              </div>
              <form onSubmit={rhfHandleSubmit(handleStep1)} className="space-y-4">
                <div>
                  <Label className="text-foreground/80 mb-2 block">Họ và tên</Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
                    <Input placeholder="Nguyễn Văn A" {...registerField('name', { validate: validateName })} className="pl-10 h-12 rounded-xl border-border focus:border-primary" />
                  </div>
                  {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <Label className="text-foreground/80 mb-2 block">Email công ty / cá nhân</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
                  <Input type="email" placeholder="Nhập email của bạn" {...registerField('email', { validate: validateEmail })} className="pl-10 h-12 rounded-xl border-border focus:border-primary" />
                  </div>
                  {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <Label className="text-foreground/80 mb-2 block">Mật khẩu</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
                    <Input type={showPass ? 'text' : 'password'} placeholder="Ít nhất 8 ký tự" {...registerField('password', { validate: validateStrongPassword })} className="pl-10 pr-10 h-12 rounded-xl border-border focus:border-primary" />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/80 hover:text-foreground/70">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
                  {passwordValue && (
                    <div className="flex gap-3 mt-2.5">
                      {AUTH_PASSWORD_RULES.map(c => (
                        <div key={c.label} className={`flex items-center gap-1 text-xs ${c.test(passwordValue) ? 'text-primary' : 'text-muted-foreground/80'}`}>
                          <CheckCircle2 className={`w-3 h-3 ${c.test(passwordValue) ? 'text-primary' : 'text-muted-foreground/60'}`} />
                          {c.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <Label className="text-foreground/80 mb-2 block">Xác nhận mật khẩu</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
                    <Input type="password" placeholder="Nhập lại mật khẩu" {...registerField('confirm', { validate: (value) => validateConfirmPassword(value, watch('password')) })} className="pl-10 h-12 rounded-xl border-border focus:border-primary" />
                  </div>
                  {errors.confirm && <p className="text-xs text-red-600 mt-1">{errors.confirm.message}</p>}
                </div>
                <button
                  type="submit"
                  disabled={loadingSystemStatus}
                  className="w-full h-12 bg-gradient-to-r from-emerald-600 via-green-600 to-green-600 hover:from-emerald-500 hover:via-green-500 hover:to-green-500 disabled:opacity-60 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 mt-2"
                >
                  {loadingSystemStatus ? 'Đang kiểm tra hệ thống...' : 'Tiếp theo'} {!loadingSystemStatus && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            </>
          )}

          {/* ─── STEP 2 ─── */}
          {!registrationClosed && step === 2 && (
            <>
              <div className="mb-7">
                <h2 className="text-foreground mb-1">Chọn gói của bạn</h2>
                <p className="text-muted-foreground text-sm">Bắt đầu với 14 ngày dùng thử Pro miễn phí</p>
              </div>
              <div className="space-y-3 mb-7">
                {PLANS.map(p => {
                  const Icon = p.icon;
                  const isSelected = plan === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setPlan(p.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${isSelected ? p.color + ' shadow-md' : 'border-border bg-card hover:border-border'}`}
                    >
                      <div className={`p-2.5 rounded-xl flex-shrink-0 ${isSelected ? p.check : 'bg-muted text-muted-foreground'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-foreground">{p.name}</span>
                          {p.badge && <Badge className="bg-warning/15 text-amber-800 border-0 text-xs px-2 py-0">{p.badge}</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{p.desc}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="font-bold text-sm text-foreground">{p.price}</span>
                        {p.id !== 'free' && <p className="text-xs text-muted-foreground/80">/ tháng</p>}
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected ? 'border-primary bg-primary/50' : 'border-gray-300'}`}>
                        {isSelected && <div className="w-2 h-2 bg-card rounded-full" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="px-5 h-12 rounded-xl border border-border text-foreground/80 font-semibold text-sm hover:bg-surface-muted transition-colors flex-shrink-0">
                  ← Quay lại
                </button>
                <button
                  onClick={handleFinalSubmit}
                  disabled={isLoading}
                  className="flex-1 h-12 bg-gradient-to-r from-emerald-600 via-green-600 to-green-600 hover:from-emerald-500 hover:via-green-500 hover:to-green-500 disabled:opacity-60 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary/20"
                >
                  {isLoading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản →'}
                </button>
              </div>

              <p className="text-center text-xs text-muted-foreground/80 mt-5">
                Bằng cách đăng ký, bạn đồng ý với{' '}
                <a href="#" className="text-primary hover:underline">Điều khoản sử dụng</a>{' '}và{' '}
                <a href="#" className="text-primary hover:underline">Chính sách bảo mật</a>.
              </p>
            </>
          )}

          {/* ─── STEP 3 ─── */}
          {!registrationClosed && step === 3 && (
            <>
              <div className="mb-7">
                <h2 className="text-foreground mb-1">Xác thực email</h2>
                <p className="text-muted-foreground text-sm">Nhập mã OTP đã gửi đến {pendingVerificationEmail}</p>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-foreground/80 mb-2 block">Mã xác thực</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
                    <Input
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="Nhập 6 chữ số"
                      value={verificationCode}
                      onChange={event => setVerificationCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="pl-10 h-12 rounded-xl border-border focus:border-primary tracking-[0.3em]"
                    />
                  </div>
                </div>
                <button
                  onClick={handleVerifyEmail}
                  disabled={isVerifying || verificationCode.length !== 6}
                  className="w-full h-12 bg-gradient-to-r from-emerald-600 via-green-600 to-green-600 hover:from-emerald-500 hover:via-green-500 hover:to-green-500 disabled:opacity-60 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary/20"
                >
                  {isVerifying ? 'Đang xác thực...' : 'Xác thực email'}
                </button>
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="w-full h-11 rounded-xl border border-border text-sm font-semibold text-foreground/80 hover:bg-surface-muted disabled:opacity-60"
                >
                  {isResending ? 'Đang gửi lại...' : 'Gửi lại mã xác thực'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
