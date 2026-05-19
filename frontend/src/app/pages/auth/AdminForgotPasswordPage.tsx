import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { BrandLogo } from '@/app/components/BrandLogo';
import {
  ArrowLeft, CheckCircle2, KeyRound, Mail, RefreshCw, Shield,
} from 'lucide-react';
import toast from 'react-hot-toast';

type Step = 'email' | 'otp' | 'reset' | 'done';

interface EmailFormData {
  email: string;
}

interface ResetFormData {
  newPass: string;
  confirmPass: string;
}

const STEP_META = {
  email: {
    icon: Mail,
    title: 'Quên mật khẩu Admin?',
    subtitle: 'Nhập email admin để nhận mã OTP xác nhận trong 5 phút.',
  },
  otp: {
    icon: KeyRound,
    title: 'Nhập mã OTP',
    subtitle: 'Mã 6 chữ số chỉ dùng cho tài khoản admin này.',
  },
  reset: {
    icon: KeyRound,
    title: 'Đặt mật khẩu admin mới',
    subtitle: 'Chọn mật khẩu mới tối thiểu 8 ký tự để bảo vệ console.',
  },
  done: {
    icon: CheckCircle2,
    title: 'Đặt lại mật khẩu thành công',
    subtitle: 'Bạn có thể quay lại Admin Console và đăng nhập bằng mật khẩu mới.',
  },
};

export function AdminForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);

  const emailForm = useForm<EmailFormData>({ defaultValues: { email: 'admin@copypro.vn' } });
  const resetForm = useForm<ResetFormData>({ defaultValues: { newPass: '', confirmPass: '' } });
  const email = emailForm.watch('email');
  const meta = STEP_META[step];
  const Icon = meta.icon;

  const handleSendOtp = async (data: EmailFormData) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setIsLoading(false);
    toast.success(`Mã OTP admin đã gửi đến ${data.email}`);
    setStep('otp');
  };

  const handleVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length < 6) {
      toast.error('Nhập đủ 6 chữ số OTP');
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setIsLoading(false);

    if (code === '123456') {
      setStep('reset');
      return;
    }

    toast.error('Mã OTP không đúng. Demo: 123456');
  };

  const handleReset = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setIsLoading(false);
    setStep('done');
  };

  const handleOtpChange = (value: string, index: number) => {
    const next = [...otp];
    next[index] = value.replace(/\D/g, '').slice(-1);
    setOtp(next);

    if (next[index] && index < 5) {
      document.getElementById(`admin-otp-${index + 1}`)?.focus();
    }
  };

  const resendOtp = async () => {
    setOtp(['', '', '', '', '', '']);
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsLoading(false);
    toast.success('Đã gửi lại OTP admin. Demo: 123456');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-5 py-10">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_70%_60%_at_20%_30%,rgba(20,184,166,0.12),transparent)] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_60%_50%_at_90%_80%,rgba(245,158,11,0.08),transparent)] pointer-events-none" />

      <div className="w-full max-w-[430px] relative">
        <Link
          to="/admin/login"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-cyan-300 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại đăng nhập Admin
        </Link>

        <div className="bg-gray-900/90 border border-gray-800 rounded-3xl shadow-2xl shadow-cyan-950/20 p-8">
          <div className="flex justify-center mb-8">
            <Link to="/" className="inline-flex items-center hover:opacity-90 transition-opacity">
              <BrandLogo size="lg" tone="light" surface="light" />
            </Link>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-cyan-950/70 border border-cyan-800/50 flex items-center justify-center mx-auto mb-5">
            <Icon className="w-8 h-8 text-cyan-300" />
          </div>

          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-amber-950/50 border border-amber-700/40 rounded-full px-3 py-1 mb-4">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-300 text-xs font-semibold">Admin Console</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">{meta.title}</h1>
            <p className="text-gray-500 text-sm leading-relaxed">{meta.subtitle}</p>
          </div>

          {step === 'email' && (
            <form onSubmit={emailForm.handleSubmit(handleSendOtp)} className="space-y-4">
              <div>
                <Label className="text-gray-400 mb-2 block text-xs uppercase tracking-wider">
                  Email admin
                </Label>
                <Input
                  type="email"
                  placeholder="admin@copypro.vn"
                  {...emailForm.register('email', {
                    required: 'Email là bắt buộc',
                    pattern: { value: /^\S+@\S+$/, message: 'Email không hợp lệ' },
                  })}
                  className="h-12 rounded-xl bg-gray-950 border-gray-700 text-white placeholder:text-gray-600 focus:border-cyan-500"
                />
                {emailForm.formState.errors.email && (
                  <p className="text-xs text-red-400 mt-1">{emailForm.formState.errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || emailForm.formState.isSubmitting}
                className="w-full h-12 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-500 disabled:opacity-60 text-white rounded-xl font-bold text-sm transition-all shadow-xl shadow-cyan-900/30"
              >
                {isLoading ? 'Đang gửi OTP...' : 'Gửi mã OTP admin'}
              </button>

              <div className="bg-cyan-950/35 border border-cyan-800/40 rounded-xl p-3 text-xs text-cyan-200 text-center">
                MVP demo: OTP admin là <strong>123456</strong> và sẽ hết hạn sau 5 phút khi nối API thật.
              </div>
            </form>
          )}

          {step === 'otp' && (
            <div className="space-y-5">
              <div className="text-center text-xs text-gray-500">
                Mã xác nhận đã gửi đến <span className="text-cyan-300 font-semibold">{email}</span>
              </div>

              <div className="flex gap-2.5 justify-center">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`admin-otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(event) => handleOtpChange(event.target.value, index)}
                    onKeyDown={(event) => {
                      if (event.key === 'Backspace' && !digit && index > 0) {
                        document.getElementById(`admin-otp-${index - 1}`)?.focus();
                      }
                    }}
                    className="w-11 h-12 rounded-xl bg-gray-950 border border-gray-700 text-center text-xl font-bold text-white focus:border-cyan-500 focus:outline-none transition-colors"
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-500 disabled:opacity-60 text-white rounded-xl font-bold text-sm transition-all shadow-xl shadow-cyan-900/30"
              >
                {isLoading ? 'Đang xác nhận...' : 'Xác nhận OTP'}
              </button>

              <button
                type="button"
                onClick={resendOtp}
                disabled={isLoading}
                className="w-full h-10 text-sm text-cyan-300 hover:text-cyan-200 transition-colors inline-flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Gửi lại mã OTP
              </button>
            </div>
          )}

          {step === 'reset' && (
            <form onSubmit={resetForm.handleSubmit(handleReset)} className="space-y-4">
              <div>
                <Label className="text-gray-400 mb-2 block text-xs uppercase tracking-wider">
                  Mật khẩu admin mới
                </Label>
                <Input
                  type="password"
                  placeholder="Tối thiểu 8 ký tự"
                  {...resetForm.register('newPass', {
                    required: 'Mật khẩu là bắt buộc',
                    minLength: { value: 8, message: 'Mật khẩu tối thiểu 8 ký tự' },
                  })}
                  className="h-12 rounded-xl bg-gray-950 border-gray-700 text-white placeholder:text-gray-600 focus:border-cyan-500"
                />
                {resetForm.formState.errors.newPass && (
                  <p className="text-xs text-red-400 mt-1">{resetForm.formState.errors.newPass.message}</p>
                )}
              </div>

              <div>
                <Label className="text-gray-400 mb-2 block text-xs uppercase tracking-wider">
                  Xác nhận mật khẩu
                </Label>
                <Input
                  type="password"
                  placeholder="Nhập lại mật khẩu"
                  {...resetForm.register('confirmPass', {
                    required: 'Xác nhận mật khẩu là bắt buộc',
                    validate: (value) => value === resetForm.watch('newPass') || 'Mật khẩu không khớp',
                  })}
                  className="h-12 rounded-xl bg-gray-950 border-gray-700 text-white placeholder:text-gray-600 focus:border-cyan-500"
                />
                {resetForm.formState.errors.confirmPass && (
                  <p className="text-xs text-red-400 mt-1">{resetForm.formState.errors.confirmPass.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || resetForm.formState.isSubmitting}
                className="w-full h-12 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-500 disabled:opacity-60 text-white rounded-xl font-bold text-sm transition-all shadow-xl shadow-cyan-900/30"
              >
                {isLoading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu admin'}
              </button>
            </form>
          )}

          {step === 'done' && (
            <div className="space-y-4 text-center">
              <div className="bg-emerald-950/40 border border-emerald-800/50 rounded-xl p-4 text-sm text-emerald-200">
                Mật khẩu admin đã được cập nhật trong luồng demo.
              </div>
              <button
                type="button"
                onClick={() => navigate('/admin/login')}
                className="w-full h-12 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-500 text-white rounded-xl font-bold text-sm transition-all shadow-xl shadow-cyan-900/30"
              >
                Về trang đăng nhập Admin
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
