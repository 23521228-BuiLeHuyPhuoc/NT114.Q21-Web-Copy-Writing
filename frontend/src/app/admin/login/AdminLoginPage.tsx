import { useState } from 'react';
import { Link, useNavigate } from '@/lib/next-router-compat';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/app/contexts/AuthContext';
import { validateEmail, validateLoginPassword } from '@/lib/authValidation';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { BrandLogo } from '@/app/components/BrandLogo';
import {
  Shield, Eye, EyeOff, Mail, Lock, AlertTriangle,
  BarChart3, Users, Brain, Activity,
} from 'lucide-react';
import toast from 'react-hot-toast';

const ADMIN_STATS = [
  { icon: Users,    label: 'Tổng người dùng', value: '2,419' },
  { icon: BarChart3, label: 'Copy tháng này', value: '124K' },
  { icon: Brain,    label: 'Models đang chạy', value: '7' },
  { icon: Activity, label: 'Uptime hệ thống',  value: '99.8%' },
];

interface AdminLoginFormData { email: string; password: string }

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginFormData>({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: AdminLoginFormData) => {
    try {
      await login(data.email, data.password, 'admin');
      toast.success('Chào mừng trở lại, Admin!');
      navigate('/admin');
    } catch (err: any) {
      toast.error(err.message || 'Sai thông tin đăng nhập hoặc không có quyền Admin.');
    }
  };

  return (
    <div className="dark min-h-screen flex bg-gray-950">

      {/* ── LEFT: System Panel ── */}
      <div className="hidden lg:flex lg:w-[52%] flex-col relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-slate-900 to-green-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_20%_50%,rgba(20,184,166,0.1),transparent)]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(20,184,166,0.45) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,0.45) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-warning/10 rounded-full blur-3xl pointer-events-none" />

        {/* Logo bar */}
        <div className="relative p-10 flex items-center gap-3 border-b border-white/5">
          <Link to="/" className="inline-flex items-center hover:opacity-90 transition-opacity">
            <BrandLogo size="lg" tone="light" surface="light" />
          </Link>
          <span className="text-xs bg-amber-950/60 text-amber-300 border border-amber-700/40 rounded px-2 py-0.5">Admin Console</span>
        </div>

        {/* Main */}
        <div className="relative flex-1 flex flex-col justify-center px-12 xl:px-16">
          <p className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-4">Hệ thống quản trị</p>
          <h2 className="text-white mb-4 leading-tight">
            Trung tâm điều hành
            <br />
            <span className="text-primary">CopyPro Platform</span>
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-10">
            Quản lý toàn bộ người dùng, mô hình AI, templates, analytics và cấu hình hệ thống từ một nơi duy nhất.
          </p>

          {/* Live Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {ADMIN_STATS.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="bg-card/4 border border-white/8 rounded-2xl p-4 hover:bg-card/10 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-3.5 h-3.5 text-primary" />
                    <span className="text-muted-foreground text-xs">{s.label}</span>
                  </div>
                  <p className="text-white text-xl font-bold tracking-tight">{s.value}</p>
                </div>
              );
            })}
          </div>

          {/* System status */}
          <div className="bg-green-950/35 border border-green-800/35 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-primary text-xs font-bold uppercase tracking-wider">Trạng thái hệ thống</span>
            </div>
            <div className="space-y-2">
              {[
                { name: 'GPT-4o API', status: 'Online', dot: 'bg-green-400' },
                { name: 'Llama 3.1 Server', status: 'Online', dot: 'bg-green-400' },
                { name: 'Fine-tuning Engine', status: 'Đang xử lý 2 jobs', dot: 'bg-amber-400' },
              ].map(item => (
                <div key={item.name} className="flex items-center justify-between">
                  <span className="text-muted-foreground/80 text-xs">{item.name}</span>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
                    <span className="text-xs text-muted-foreground/60 font-medium">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative px-12 xl:px-16 pb-10 pt-6 border-t border-white/5">
          <p className="text-foreground/70 text-xs">
            CopyPro Admin Console v2.0 · Chỉ dành cho nhân viên được ủy quyền
          </p>
        </div>
      </div>

      {/* ── RIGHT: Login Form ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-gray-950">
        {/* Mobile logo */}
        <div className="lg:hidden mb-10 flex items-center gap-2.5">
          <Link to="/" className="inline-flex items-center hover:opacity-90 transition-opacity">
            <BrandLogo size="lg" tone="light" surface="light" />
          </Link>
          <span className="text-xs bg-amber-950/60 text-amber-300 border border-amber-700/40 rounded px-2 py-0.5">Admin</span>
        </div>

        <div className="w-full max-w-[380px]">
          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 mb-5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span className="text-amber-500 text-xs font-semibold">Khu vực giới hạn</span>
            </div>
            <h2 className="text-white mb-1.5 leading-tight">Đăng nhập Admin</h2>
            <p className="text-muted-foreground text-sm">
              Chỉ dành cho nhân viên CopyPro được ủy quyền.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label className="text-muted-foreground/80 mb-2 block text-xs uppercase tracking-wider">Email Admin</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/70" />
                <Input
                  type="email"
                  placeholder="admin@copypro.vn"
                  {...register('email', {
                    validate: validateEmail,
                  })}
                  className="pl-10 h-12 rounded-xl bg-gray-900 border-gray-700 text-white placeholder:text-foreground/70 focus:border-primary focus:bg-gray-800"
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="mb-2">
                <Label className="text-muted-foreground/80 block text-xs uppercase tracking-wider">Mật khẩu</Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/70" />
                <Input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password', { validate: validateLoginPassword })}
                  className="pl-10 pr-10 h-12 rounded-xl bg-gray-900 border-gray-700 text-white placeholder:text-foreground/70 focus:border-primary focus:bg-gray-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground/70 hover:text-muted-foreground/80 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
              <div className="mt-2 text-right">
                <Link
                  to="/admin/forgot-password"
                  className="text-xs text-primary hover:text-green-200 hover:underline font-semibold transition-colors"
                >
                  Quên mật khẩu?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-gradient-to-r from-emerald-600 via-green-600 to-green-600 hover:from-emerald-500 hover:via-green-500 hover:to-green-500 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-all shadow-xl shadow-primary/25 mt-2 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Đang xác thực...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Truy cập Admin Console
                </>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-gray-950 px-3 text-xs text-foreground/70">Không phải Admin?</span>
            </div>
          </div>

          <Link to="/login">
            <button className="w-full h-11 border border-gray-800 hover:border-gray-700 text-muted-foreground/80 hover:text-gray-200 rounded-xl font-semibold text-sm transition-all hover:bg-gray-900">
              → Trang đăng nhập người dùng
            </button>
          </Link>

          <p className="text-center text-xs text-foreground/80 mt-6">
            © 2026 CopyPro Vietnam · Hệ thống nội bộ
          </p>
        </div>
      </div>
    </div>
  );
}
