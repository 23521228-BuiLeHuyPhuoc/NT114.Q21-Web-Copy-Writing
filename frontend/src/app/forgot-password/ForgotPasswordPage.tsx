import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { api } from '@/lib/axios';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { BrandLogo } from '@/app/components/BrandLogo';
import { ArrowLeft, Mail, KeyRound, CheckCircle2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

type Step = 'email' | 'otp' | 'reset' | 'done';

interface EmailFormData { email: string }
interface ResetFormData { newPass: string; confirmPass: string }

function formatCountdown(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);

  const emailForm = useForm<EmailFormData>({ defaultValues: { email: '' } });
  const resetForm = useForm<ResetFormData>({ defaultValues: { newPass: '', confirmPass: '' } });
  const email = emailForm.watch('email');

  useEffect(() => {
    if (resendSeconds <= 0) return undefined;

    const timer = window.setInterval(() => {
      setResendSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendSeconds]);

  const handleSendOtp = async (data: EmailFormData) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/user/forgot-password', { email: data.email });
      const expiresInSeconds = Number(response.data?.data?.expiresInSeconds || 300);
      setResendSeconds(expiresInSeconds);
      toast.success(`Mã OTP đã gửi đến ${data.email}`);
      setStep('otp');
    } catch (err: any) {
      const retryAfterSeconds = Number(err.response?.data?.data?.retryAfterSeconds || 0);

      if (retryAfterSeconds > 0) {
        setResendSeconds(retryAfterSeconds);
        setStep('otp');
      }

      toast.error(err.response?.data?.message || 'Không gửi được OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length < 6) { toast.error('Nhập đủ 6 chữ số'); return; }
    setIsLoading(true);
    try {
      await api.post('/auth/user/verify-otp', { email, otp: code });
      setStep('reset');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Mã OTP không đúng hoặc đã hết hạn');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (data: ResetFormData) => {
    setIsLoading(true);
    try {
      await api.post('/auth/user/reset-password', {
        email,
        otp: otp.join(''),
        newPassword: data.newPass,
      });
      setStep('done');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không đặt lại được mật khẩu');
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async () => {
    const currentEmail = emailForm.getValues('email');
    if (!currentEmail) {
      toast.error('Vui lòng nhập email trước');
      return;
    }

    if (resendSeconds > 0) {
      toast.error(`Vui lòng đợi ${formatCountdown(resendSeconds)} để gửi lại mã`);
      return;
    }

    setOtp(['', '', '', '', '', '']);
    await handleSendOtp({ email: currentEmail });
  };

  const handleOtpChange = (val: string, idx: number) => {
    const next = [...otp]; next[idx] = val.slice(-1); setOtp(next);
    if (val && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
  };

  const STEP_CONFIG = {
    email: { icon: Mail,       iconBg: 'bg-stone-100',   iconColor: 'text-stone-600',   title: 'Quên mật khẩu?',            sub: 'Nhập email để nhận mã OTP xác nhận' },
    otp:   { icon: KeyRound,   iconBg: 'bg-stone-100',   iconColor: 'text-stone-600',   title: 'Nhập mã OTP',               sub: `Mã 6 chữ số đã gửi đến ${email}` },
    reset: { icon: KeyRound,   iconBg: 'bg-stone-100',   iconColor: 'text-stone-600',   title: 'Đặt mật khẩu mới',        sub: 'Chọn mật khẩu an toàn, ít nhất 8 ký tự' },
    done:  { icon: CheckCircle2, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', title: 'Đổi mật khẩu thành công!', sub: 'Bạn có thể đăng nhập với mật khẩu mới' },
  };

  const cfg = STEP_CONFIG[step];
  const Icon = cfg.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-stone-50/60 flex items-center justify-center p-5">
      {/* Background dots */}
      <div className="fixed inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #0d9488 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

      <div className="w-full max-w-[420px] relative">
        {/* Back link */}
        <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-stone-700 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Quay lại đăng nhập
        </Link>

        <div className="bg-white rounded-3xl shadow-xl shadow-gray-100/80 border border-gray-100 p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link to="/" className="inline-flex items-center hover:opacity-80 transition-opacity">
              <BrandLogo size="xl" />
            </Link>
          </div>

          {/* Step icon */}
          <div className={`w-16 h-16 ${cfg.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-5`}>
            <Icon className={`w-8 h-8 ${cfg.iconColor}`} />
          </div>

          <div className="text-center mb-8">
            <h2 className="text-gray-900 mb-2">{cfg.title}</h2>
            <p className="text-gray-500 text-sm">{cfg.sub}</p>
          </div>

          {/* ─── Email step ─── */}
          {step === 'email' && (
            <form onSubmit={emailForm.handleSubmit(handleSendOtp)} className="space-y-4">
              <div>
                <Label className="text-gray-700 mb-2 block">Email đã đăng ký</Label>
                <Input type="email" placeholder="your@email.com" {...emailForm.register('email', { required: 'Email là bắt buộc', pattern: { value: /^\S+@\S+$/, message: 'Email không hợp lệ' } })} className="h-12 rounded-xl border-gray-200 focus:border-stone-500" />
                {emailForm.formState.errors.email && <p className="text-xs text-red-600 mt-1">{emailForm.formState.errors.email.message}</p>}
              </div>
              <button type="submit" disabled={isLoading || emailForm.formState.isSubmitting} className="w-full h-12 bg-gradient-to-r from-emerald-600 via-stone-600 to-stone-600 hover:from-emerald-500 hover:via-stone-500 hover:to-stone-500 disabled:opacity-60 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-stone-200">
                {isLoading ? 'Đang gửi...' : 'Gửi mã OTP →'}
              </button>
            </form>
          )}

          {/* ─── OTP step ─── */}
          {step === 'otp' && (
            <div className="space-y-5">
              <div className="flex gap-2.5 justify-center">
                {otp.map((d, idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={e => handleOtpChange(e.target.value, idx)}
                    onKeyDown={e => { if (e.key === 'Backspace' && !d && idx > 0) document.getElementById(`otp-${idx - 1}`)?.focus(); }}
                    className="w-11 h-13 text-center text-xl font-bold border-2 rounded-xl focus:border-stone-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                  />
                ))}
              </div>
              <button
                onClick={handleVerifyOtp}
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-emerald-600 via-stone-600 to-stone-600 hover:from-emerald-500 hover:via-stone-500 hover:to-stone-500 disabled:opacity-60 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-stone-200"
              >
                {isLoading ? 'Đang xác nhận...' : 'Xác nhận OTP →'}
              </button>
              <div className="text-center">
                <button
                  onClick={resendOtp}
                  disabled={isLoading || resendSeconds > 0}
                  className="text-sm text-stone-700 hover:underline disabled:text-gray-400 disabled:no-underline inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {resendSeconds > 0 ? `Gửi lại mã sau ${formatCountdown(resendSeconds)}` : 'Gửi lại mã'}
                </button>
              </div>
            </div>
          )}

          {/* ─── Reset step ─── */}
          {step === 'reset' && (
            <form onSubmit={resetForm.handleSubmit(handleReset)} className="space-y-4">
              <div>
                <Label className="text-gray-700 mb-2 block">Mật khẩu mới</Label>
                <Input type="password" placeholder="Ít nhất 8 ký tự" {...resetForm.register('newPass', { required: 'Mật khẩu là bắt buộc', minLength: { value: 8, message: 'Mật khẩu ít nhất 8 ký tự' } })} className="h-12 rounded-xl border-gray-200 focus:border-stone-500" />
                {resetForm.formState.errors.newPass && <p className="text-xs text-red-600 mt-1">{resetForm.formState.errors.newPass.message}</p>}
              </div>
              <div>
                <Label className="text-gray-700 mb-2 block">Xác nhận mật khẩu mới</Label>
                <Input type="password" placeholder="Nhập lại mật khẩu" {...resetForm.register('confirmPass', { required: 'Xác nhận mật khẩu là bắt buộc', validate: (v) => v === resetForm.watch('newPass') || 'Mật khẩu không khớp' })} className="h-12 rounded-xl border-gray-200 focus:border-stone-500" />
                {resetForm.formState.errors.confirmPass && <p className="text-xs text-red-600 mt-1">{resetForm.formState.errors.confirmPass.message}</p>}
              </div>
              <button type="submit" disabled={isLoading || resetForm.formState.isSubmitting} className="w-full h-12 bg-gradient-to-r from-emerald-600 via-stone-600 to-stone-600 hover:from-emerald-500 hover:via-stone-500 hover:to-stone-500 disabled:opacity-60 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-stone-200">
                {isLoading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu →'}
              </button>
            </form>
          )}

          {/* ─── Done step ─── */}
          {step === 'done' && (
            <div className="text-center space-y-4">
              <button
                onClick={() => navigate('/login')}
                className="w-full h-12 bg-gradient-to-r from-emerald-600 via-stone-600 to-stone-600 hover:from-emerald-500 hover:via-stone-500 hover:to-stone-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-stone-200"
              >
                Đăng nhập ngay →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
