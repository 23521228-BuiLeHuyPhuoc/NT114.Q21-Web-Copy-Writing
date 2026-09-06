import { useState } from 'react';
import { Link, useNavigate } from '@/lib/next-router-compat';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/app/contexts/AuthContext';
import { validateEmail, validateLoginPassword } from '@/lib/authValidation';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { BrandLogo } from '@/app/components/BrandLogo';
import {
  Eye, EyeOff, Mail, Lock,
  ArrowLeft, CheckCircle2, Shield,
} from 'lucide-react';
import toast from 'react-hot-toast';

const BENEFITS = [
  'Brief có cấu trúc trước khi generate',
  'Nhiều phiên bản để so sánh',
  'Rich text editor cho bản cuối',
  'Nội dung được lưu theo dự án',
];

interface LoginFormData { email: string; password: string }

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ defaultValues: { email: '', password: '' } });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password, 'user');
      toast.success('Đăng nhập thành công! Chào mừng trở lại');
      navigate('/dashboard');
    } catch {
      toast.error('Email hoặc mật khẩu không đúng.');
    }
  };

  return (
    <div className="auth-page min-h-screen flex">

      {/* ── LEFT PANEL ── */}
      <div className="dark relative hidden flex-col overflow-hidden bg-sidebar lg:flex lg:w-1/2 xl:w-[55%]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_30%_40%,rgba(255,118,92,0.16),transparent)]" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />

        {/* Logo */}
        <div className="relative p-10">
          <Link to="/" className="inline-flex items-center hover:opacity-90 transition-opacity">
            <BrandLogo size="lg" tone="light" surface="light" />
          </Link>
        </div>

        {/* Main content */}
        <div className="relative flex-1 flex flex-col justify-center px-12 xl:px-16 pb-16">
          <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-4">
            Creative Editorial Studio
          </p>
          <h1 className="type-public-title mb-6 text-sidebar-foreground">
            Trở lại bàn viết.<br />
            <span className="text-accent">Tiếp tục bản thảo.</span>
          </h1>
          <p className="text-muted-foreground/80 text-lg leading-relaxed mb-10">
            Brief, model, bản nháp và vùng biên tập nằm trong cùng một quy trình làm việc.
          </p>

          <ul className="space-y-4 mb-12">
            {BENEFITS.map(b => (
              <li key={b} className="flex items-center gap-3 text-muted-foreground/60">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-primary/35 bg-primary/15">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-sm">{b}</span>
              </li>
            ))}
          </ul>

          <div className="paper-noise border-2 border-white/25 bg-card/10 p-5 backdrop-blur">
            <p className="font-mono-editorial text-[10px] font-bold uppercase tracking-[.16em] text-primary">Ghi chú biên tập</p>
            <p className="mt-3 font-display text-2xl font-bold leading-snug text-white">“AI mở thêm hướng viết. Người biên tập chọn câu chữ cuối cùng.”</p>
          </div>
        </div>

        <div className="relative border-t border-white/10 px-12 pb-10 pt-6 font-mono-editorial text-[10px] uppercase tracking-[.16em] text-muted-foreground xl:px-16">Brief → Generate → Edit → Save</div>
      </div>

      {/* ── RIGHT PANEL: Form ── */}
      <div className="paper-grid flex flex-1 flex-col items-center justify-center bg-background px-6 py-12">
        {/* Mobile logo */}
        <Link to="/" className="lg:hidden mb-10 inline-flex items-center hover:opacity-80 transition-opacity">
          <BrandLogo size="xl" />
        </Link>

        <div className="w-full max-w-[400px]">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Về trang chủ
          </Link>

          <div className="mb-8">
            <h2 className="type-auth-title mb-1.5 text-foreground">Chào mừng trở lại</h2>
            <p className="text-muted-foreground text-sm">Đăng nhập vào tài khoản CopyPro của bạn</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <Label className="text-foreground/80 mb-2 block">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
                <Input
                  type="email"
                  placeholder="Nhập email của bạn"
                  {...register('email', {
                    validate: validateEmail,
                  })}
                  className="pl-10 h-12 rounded-xl border-border focus:border-primary focus:ring-ring/30"
                />
              </div>
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="mb-2">
                <Label className="text-foreground/80">Mật khẩu</Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
                <Input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu"
                  {...register('password', { validate: validateLoginPassword })}
                  className="pl-10 pr-10 h-12 rounded-xl border-border focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/80 hover:text-foreground/70 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
              <div className="mt-2 text-right">
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Quên mật khẩu?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="h-12 w-full rounded-md bg-primary text-sm font-bold text-primary-foreground shadow-[4px_4px_0_rgba(23,32,51,.18)] transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Đang đăng nhập...
                </span>
              ) : 'Đăng nhập →'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs font-medium text-muted-foreground/80">
            <div className="h-px flex-1 bg-border" />
            <span className="shrink-0">Dành cho quản trị viên?</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Link
            to="/admin/login"
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card/80 text-sm font-semibold text-muted-foreground transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
          >
            <Shield className="h-4 w-4" />
            Đăng nhập Admin
          </Link>

          <p className="text-center text-sm text-muted-foreground mt-7">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-primary hover:underline font-semibold">
              Đăng ký miễn phí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
