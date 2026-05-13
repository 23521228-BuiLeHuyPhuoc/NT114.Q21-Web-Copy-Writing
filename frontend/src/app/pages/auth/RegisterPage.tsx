import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Sparkles, Eye, EyeOff, User, Mail, Lock, ArrowLeft, CheckCircle2, ArrowRight, Crown, Zap, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

const PLANS = [
  { id: 'free',  name: 'Miễn Phí', price: '0₫',     icon: Zap,      desc: '30 copy/tháng',         color: 'border-gray-200 bg-white',      check: 'bg-gray-100 text-gray-500',   badge: '' },
  { id: 'pro',   name: 'Pro',       price: '299K₫',  icon: Crown,    desc: '500 copy · Fine-tuning', color: 'border-green-500 bg-green-50',  check: 'bg-green-100 text-green-700', badge: 'Phổ biến' },
  { id: 'biz',   name: 'Business',  price: '799K₫',  icon: Building2, desc: 'Unlimited · API 50K',  color: 'border-gray-200 bg-white',      check: 'bg-gray-100 text-gray-500',   badge: '' },
];

const PW_CHECKS = [
  { label: 'Ít nhất 8 ký tự',      test: (p: string) => p.length >= 8 },
  { label: 'Có chữ hoa',            test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Có số',                 test: (p: string) => /[0-9]/.test(p) },
];

interface RegisterFormData { name: string; email: string; password: string; confirm: string }

export function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPass, setShowPass] = useState(false);
  const [plan, setPlan] = useState('pro');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit: rhfHandleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({ defaultValues: { name: '', email: '', password: '', confirm: '' } });

  const passwordValue = watch('password', '');

  const handleStep1 = (_data: RegisterFormData) => {
    setStep(2);
  };

  const handleFinalSubmit = async () => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setIsLoading(false);
    toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex">
      {/* ─── LEFT PANEL ─── */}
      <div className="hidden lg:flex lg:w-[42%] flex-col relative overflow-hidden bg-gradient-to-br from-gray-950 via-green-950 to-emerald-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_20%_50%,rgba(34,197,94,0.15),transparent)]" />

        <div className="relative p-10">
          <Link to="/" className="inline-flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-2 rounded-xl shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-white text-xl font-bold">CopyPro</span>
          </Link>
        </div>

        <div className="relative flex-1 flex flex-col justify-center px-12 pb-16">
          <h2 className="text-white mb-4 leading-tight">
            Tham gia 2,000+<br />
            <span className="text-green-400">doanh nghiệp Việt</span>
          </h2>
          <p className="text-gray-400 text-base leading-relaxed mb-10">
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
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 transition-all ${s.done ? 'bg-green-500 text-white' : 'bg-white/10 border border-white/20 text-gray-500'}`}>
                  {s.done ? <CheckCircle2 className="w-4 h-4" /> : s.n}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${s.done ? 'text-white' : 'text-gray-500'}`}>{s.label}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── RIGHT PANEL ─── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-white">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8 flex items-center gap-2.5">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-xl shadow-md">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-gray-900 text-xl font-bold">CopyPro</span>
        </div>

        <div className="w-full max-w-[420px]">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-700 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Đã có tài khoản? Đăng nhập
          </Link>

          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-8">
            {[1, 2].map(s => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s ? 'bg-green-600 text-white shadow-md shadow-green-200' : 'bg-gray-100 text-gray-400'}`}>
                  {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
                </div>
                <span className={`text-xs font-semibold ${step >= s ? 'text-green-700' : 'text-gray-400'}`}>
                  {s === 1 ? 'Thông tin' : 'Chọn gói'}
                </span>
                {s < 2 && <div className={`flex-1 h-px ${step > s ? 'bg-green-400' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          {/* ─── STEP 1 ─── */}
          {step === 1 && (
            <>
              <div className="mb-7">
                <h2 className="text-gray-900 mb-1">Tạo tài khoản</h2>
                <p className="text-gray-500 text-sm">14 ngày dùng thử Pro miễn phí</p>
              </div>
              <form onSubmit={rhfHandleSubmit(handleStep1)} className="space-y-4">
                <div>
                  <Label className="text-gray-700 mb-2 block">Họ và tên</Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input placeholder="Nguyễn Văn A" {...register('name', { required: 'Họ và tên là bắt buộc' })} className="pl-10 h-12 rounded-xl border-gray-200 focus:border-green-500" />
                  </div>
                  {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <Label className="text-gray-700 mb-2 block">Email công ty / cá nhân</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input type="email" placeholder="your@email.com" {...register('email', { required: 'Email là bắt buộc', pattern: { value: /^\S+@\S+$/, message: 'Email không hợp lệ' } })} className="pl-10 h-12 rounded-xl border-gray-200 focus:border-green-500" />
                  </div>
                  {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <Label className="text-gray-700 mb-2 block">Mật khẩu</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input type={showPass ? 'text' : 'password'} placeholder="Ít nhất 8 ký tự" {...register('password', { required: 'Mật khẩu là bắt buộc', minLength: { value: 8, message: 'Mật khẩu ít nhất 8 ký tự' } })} className="pl-10 pr-10 h-12 rounded-xl border-gray-200 focus:border-green-500" />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
                  {passwordValue && (
                    <div className="flex gap-3 mt-2.5">
                      {PW_CHECKS.map(c => (
                        <div key={c.label} className={`flex items-center gap-1 text-xs ${c.test(passwordValue) ? 'text-green-600' : 'text-gray-400'}`}>
                          <CheckCircle2 className={`w-3 h-3 ${c.test(passwordValue) ? 'text-green-500' : 'text-gray-300'}`} />
                          {c.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <Label className="text-gray-700 mb-2 block">Xác nhận mật khẩu</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input type="password" placeholder="Nhập lại mật khẩu" {...register('confirm', { required: 'Xác nhận mật khẩu là bắt buộc', validate: (v) => v === watch('password') || 'Mật khẩu không khớp' })} className="pl-10 h-12 rounded-xl border-gray-200 focus:border-green-500" />
                  </div>
                  {errors.confirm && <p className="text-xs text-red-600 mt-1">{errors.confirm.message}</p>}
                </div>
                <button type="submit" className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-green-200 flex items-center justify-center gap-2 mt-2">
                  Tiếp theo <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </>
          )}

          {/* ─── STEP 2 ─── */}
          {step === 2 && (
            <>
              <div className="mb-7">
                <h2 className="text-gray-900 mb-1">Chọn gói của bạn</h2>
                <p className="text-gray-500 text-sm">Bắt đầu với 14 ngày dùng thử Pro miễn phí</p>
              </div>
              <div className="space-y-3 mb-7">
                {PLANS.map(p => {
                  const Icon = p.icon;
                  const isSelected = plan === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setPlan(p.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${isSelected ? p.color + ' shadow-md' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                    >
                      <div className={`p-2.5 rounded-xl flex-shrink-0 ${isSelected ? p.check : 'bg-gray-100 text-gray-500'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-gray-900">{p.name}</span>
                          {p.badge && <Badge className="bg-green-100 text-green-700 border-0 text-xs px-2 py-0">{p.badge}</Badge>}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{p.desc}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="font-bold text-sm text-gray-900">{p.price}</span>
                        {p.id !== 'free' && <p className="text-xs text-gray-400">/ tháng</p>}
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected ? 'border-green-500 bg-green-500' : 'border-gray-300'}`}>
                        {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="px-5 h-12 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors flex-shrink-0">
                  ← Quay lại
                </button>
                <button
                  onClick={handleFinalSubmit}
                  disabled={isLoading}
                  className="flex-1 h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:opacity-60 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-green-200"
                >
                  {isLoading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản →'}
                </button>
              </div>

              <p className="text-center text-xs text-gray-400 mt-5">
                Bằng cách đăng ký, bạn đồng ý với{' '}
                <a href="#" className="text-green-700 hover:underline">Điều khoản sử dụng</a>{' '}và{' '}
                <a href="#" className="text-green-700 hover:underline">Chính sách bảo mật</a>.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
