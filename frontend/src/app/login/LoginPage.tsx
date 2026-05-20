import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/app/contexts/AuthContext';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { BrandLogo } from '@/app/components/BrandLogo';
import {
  Eye, EyeOff, Mail, Lock,
  ArrowLeft, CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';

const BENEFITS = [
  'GPT-4o + Llama 3.1 70B',
  'Fine-tuning theo thương hiệu',
  '100+ template chuyên ngành',
  'RESTful API tích hợp',
];

interface LoginFormData { email: string; password: string }

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ defaultValues: { email: '', password: '' } });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password, 'user');
      // AuthContext throws if admin tries to log in here — allow customer only
      const saved = localStorage.getItem('user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u.role === 'admin') {
          // Redirect admin away
          toast('Tài khoản Admin — chuyển hướng đến Admin Console');
          navigate('/admin');
        } else {
          toast.success('Đăng nhập thành công! Chào mừng trở lại 👋');
          navigate('/dashboard');
        }
      }
    } catch {
      toast.error('Email hoặc mật khẩu không đúng.');
    }
  };

  const fillDemo = () => {
    setValue('email', 'customer@copypro.vn');
    setValue('password', 'customer123');
  };

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT PANEL ── */}
      <div className="dark hidden lg:flex lg:w-1/2 xl:w-[55%] flex-col relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_30%_40%,rgba(20,184,166,0.18),transparent)]" />
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
            AI Copywriting Platform
          </p>
          <h1 className="text-white mb-6 leading-tight">
            Copy chuyên nghiệp<br />
            <span className="bg-gradient-to-r from-emerald-300 via-green-300 to-green-300 bg-clip-text text-transparent">
              trong vài giây
            </span>
          </h1>
          <p className="text-muted-foreground/80 text-lg leading-relaxed mb-10">
            Tích hợp GPT-4o, Llama 3.1 và Fine-tuning theo thương hiệu — nền tảng AI copywriting số 1 Việt Nam.
          </p>

          <ul className="space-y-4 mb-12">
            {BENEFITS.map(b => (
              <li key={b} className="flex items-center gap-3 text-muted-foreground/60">
                <div className="w-6 h-6 rounded-full bg-green-400/15 border border-green-300/30 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-sm">{b}</span>
              </li>
            ))}
          </ul>

          {/* Mock copy card */}
          <div className="bg-card/10 border border-white/10 rounded-2xl p-5 backdrop-blur">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
              <span className="text-primary text-xs font-semibold">AI đang tạo...</span>
              <span className="ml-auto bg-green-950/50 text-green-200 border border-green-700/30 rounded-md px-2 py-0.5 text-xs">
                GPT-4o
              </span>
            </div>
            <p className="text-muted-foreground/60 text-sm leading-relaxed italic">
              "🔥 FLASH SALE 48H! Giảm đến 70% toàn bộ sản phẩm — Đặt ngay kẻo lỡ. Freeship mọi đơn hàng trong hôm nay!"
            </p>
            <div className="flex items-center gap-2 mt-3">
              <span className="bg-amber-950/45 text-amber-200 border border-amber-700/30 text-xs rounded-md px-2 py-0.5">
                ⭐ 94% chất lượng
              </span>
              <span className="text-muted-foreground text-xs">· 1.8 giây</span>
            </div>
          </div>
        </div>

        {/* Bottom social proof */}
        <div className="relative px-12 xl:px-16 pb-10 border-t border-white/8 pt-6">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {['TK', 'LH', 'PA', 'MK'].map((av, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full border-2 border-slate-950 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                    ['bg-emerald-600', 'bg-primary', 'bg-primary', 'bg-warning/100'][i]
                  }`}
                >
                  {av}
                </div>
              ))}
            </div>
            <p className="text-muted-foreground/80 text-sm">
              <span className="text-white font-semibold">2,000+</span> doanh nghiệp đang dùng hôm nay
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Form ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-br from-background via-emerald-50/45 to-green-50/70">
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
            <h2 className="text-foreground mb-1.5">Chào mừng trở lại</h2>
            <p className="text-muted-foreground text-sm">Đăng nhập vào tài khoản CopyPro của bạn</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <Label className="text-foreground/80 mb-2 block">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
                <Input
                  type="email"
                  placeholder="your@email.com"
                  {...register('email', {
                    required: 'Email là bắt buộc',
                    pattern: { value: /^\S+@\S+$/, message: 'Email không hợp lệ' },
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
                  placeholder="••••••••"
                  {...register('password', { required: 'Mật khẩu là bắt buộc' })}
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
              className="w-full h-12 bg-gradient-to-r from-emerald-600 via-green-600 to-green-600 hover:from-emerald-500 hover:via-green-500 hover:to-green-500 disabled:opacity-60 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary/20"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Đang đăng nhập...
                </span>
              ) : 'Đăng nhập →'}
            </button>
          </form>

          {/* Demo button */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-3 text-xs text-muted-foreground/80 font-medium">Demo nhanh</span>
            </div>
          </div>

          <button
            onClick={fillDemo}
            className="w-full flex items-center justify-between gap-2 p-4 border border-border rounded-xl bg-card/80 hover:border-primary/30 hover:bg-primary/5 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 group-hover:bg-primary/10 flex items-center justify-center transition-colors flex-shrink-0">
                <span className="text-base">👤</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">Customer Demo</p>
                <p className="text-xs text-muted-foreground/80">customer@copypro.vn · customer123</p>
              </div>
            </div>
            <span className="text-xs text-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Điền →</span>
          </button>

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
