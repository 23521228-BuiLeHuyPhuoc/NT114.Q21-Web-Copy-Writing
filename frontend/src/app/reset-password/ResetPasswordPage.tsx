import { useState } from 'react';
import { Link, useNavigate } from '@/lib/next-router-compat';
import { useForm } from 'react-hook-form';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { BrandLogo } from '@/app/components/BrandLogo';
import { Lock, CheckCircle2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

interface ResetPwFormData { password: string; confirm: string }

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPwFormData>({ defaultValues: { password: '', confirm: '' }, mode: 'onChange' });

  const password = watch('password');
  const confirm = watch('confirm');

  const checks = [
    { label: 'Ít nhất 8 ký tự', ok: password.length >= 8 },
    { label: 'Có chữ hoa', ok: /[A-Z]/.test(password) },
    { label: 'Có số', ok: /[0-9]/.test(password) },
  ];

  const allValid = checks.every(c => c.ok) && password === confirm && confirm.length > 0;

  const onSubmit = async (_data: ResetPwFormData) => {
    await new Promise(r => setTimeout(r, 1500));
    setDone(true);
    toast.success('Đặt lại mật khẩu thành công!');
  };

  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-green-50 flex items-center justify-center p-5">
        <div className="bg-card rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Đặt lại thành công!</h2>
          <p className="text-foreground/70 mb-6">Mật khẩu đã được cập nhật. Bạn có thể đăng nhập ngay.</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-gradient-to-r from-emerald-600 via-green-600 to-green-600 text-white rounded-xl py-3 font-semibold hover:from-emerald-500 hover:via-green-500 hover:to-green-500 transition-all"
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-green-50 flex items-center justify-center p-5">
      <div className="bg-card rounded-3xl shadow-xl p-8 max-w-md w-full">
        <Link to="/login" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="w-4 h-4" /> Quay lại đăng nhập
        </Link>

        <Link to="/" className="inline-flex items-center mb-6 hover:opacity-80 transition-opacity">
          <BrandLogo size="lg" />
        </Link>

        <h1 className="text-2xl font-bold text-foreground mb-1">Đặt lại mật khẩu</h1>
        <p className="text-foreground/70 mb-6">Nhập mật khẩu mới cho tài khoản của bạn</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Mật khẩu mới</Label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
              <Input type={showPw ? 'text' : 'password'} placeholder="Nhập mật khẩu mới" {...register('password', { required: 'Mật khẩu là bắt buộc', minLength: { value: 8, message: 'Mật khẩu ít nhất 8 ký tự' }, pattern: { value: /^(?=.*[A-Z])(?=.*\d).+$/, message: 'Mật khẩu cần có chữ hoa và số' } })} className="pl-10 pr-10" />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff className="w-4 h-4 text-muted-foreground/80" /> : <Eye className="w-4 h-4 text-muted-foreground/80" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          <div className="space-y-1">
            {checks.map((c, i) => (
              <div key={i} className={`flex items-center gap-2 text-xs ${c.ok ? 'text-primary' : 'text-muted-foreground/80'}`}>
                <CheckCircle2 className="w-3.5 h-3.5" /> {c.label}
              </div>
            ))}
          </div>

          <div>
            <Label>Xác nhận mật khẩu</Label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
              <Input type="password" placeholder="Nhập lại mật khẩu mới" {...register('confirm', { required: 'Xác nhận mật khẩu là bắt buộc', validate: (v) => v === watch('password') || 'Mật khẩu không khớp' })} className="pl-10" />
            </div>
            {errors.confirm && <p className="text-xs text-red-500 mt-1">{errors.confirm.message}</p>}
          </div>

          <button
            type="submit"
            disabled={!allValid || isSubmitting}
            className="w-full bg-gradient-to-r from-emerald-600 via-green-600 to-green-600 text-white rounded-xl py-3 font-semibold hover:from-emerald-500 hover:via-green-500 hover:to-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
          </button>
        </form>
      </div>
    </div>
  );
}
