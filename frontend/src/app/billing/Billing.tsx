import { useState } from 'react';
import { Layout } from '@/app/components/Layout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import {
  Crown, Zap, Building2, CheckCircle2, X,
  Download, FileText, Banknote, Landmark,
  Wallet, Smartphone, Copy, QrCode,
} from 'lucide-react';
import toast from 'react-hot-toast';

const CURRENT_PLAN = {
  name: 'Pro',
  price: 299000,
  renewDate: '23/04/2026',
  copyUsed: 312,
  copyLimit: 500,
  apiCalls: 1250,
  apiLimit: 5000,
};

const PLANS = [
  {
    id: 'free',
    name: 'Miễn phí',
    price: 0,
    icon: Zap,
    color: 'border-border',
    features: ['30 copy/tháng', '2 model AI cơ bản', '5 templates', 'Không có API'],
    limits: ['Không có fine-tuning', 'Không kiểm tra đạo văn'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 299000,
    icon: Crown,
    color: 'border-amber-500 ring-2 ring-amber-100',
    features: ['500 copy/tháng', 'Tất cả model AI', '100+ templates', 'API 5,000 calls/tháng', 'Fine-tuning 3 models', 'Kiểm tra đạo văn 100 lần', 'Hỗ trợ ưu tiên'],
    limits: [],
    popular: true,
  },
  {
    id: 'business',
    name: 'Business',
    price: 799000,
    icon: Building2,
    color: 'border-border',
    features: ['Unlimited copy', 'Tất cả model AI', 'Unlimited templates', 'API 50,000 calls/tháng', 'Fine-tuning unlimited', 'Kiểm tra đạo văn unlimited', 'Hỗ trợ 24/7 + SLA', 'Custom model training'],
    limits: [],
  },
];

const PAYMENT_METHODS = [
  {
    id: 'cash',
    name: 'Tiền mặt',
    shortName: 'Tiền mặt',
    desc: 'Thanh toán tại văn phòng hoặc khi nhân viên hỗ trợ thu phí.',
    icon: Banknote,
    color: 'bg-primary/10 text-primary',
    guide: 'CopyPro sẽ ghi nhận thanh toán sau khi thu tiền và kích hoạt gói trong giờ làm việc.',
  },
  {
    id: 'bank',
    name: 'Chuyển khoản ngân hàng',
    shortName: 'Ngân hàng',
    desc: 'Chuyển khoản qua số tài khoản doanh nghiệp CopyPro.',
    icon: Landmark,
    color: 'bg-primary/10 text-primary',
    guide: 'Ngân hàng: Vietcombank · STK: 0123456789 · Nội dung: COPYPRO + email tài khoản.',
  },
  {
    id: 'zalo',
    name: 'ZaloPay',
    shortName: 'ZaloPay',
    desc: 'Quét QR hoặc mở ứng dụng ZaloPay để thanh toán nhanh.',
    icon: Smartphone,
    color: 'bg-primary/10 text-primary',
    guide: 'Sau khi bấm thanh toán, hệ thống sẽ tạo mã QR ZaloPay cho hóa đơn đang chọn.',
  },
  {
    id: 'momo',
    name: 'MoMo',
    shortName: 'MoMo',
    desc: 'Thanh toán qua ví MoMo, hỗ trợ xác nhận gần như tức thì.',
    icon: Wallet,
    color: 'bg-warning/15 text-amber-800',
    guide: 'Sau khi bấm thanh toán, hệ thống sẽ tạo mã QR MoMo và tự cập nhật trạng thái hóa đơn.',
  },
];

const INVOICES = [
  { id: 'INV-2026-003', date: '23/03/2026', amount: 299000, status: 'paid', plan: 'Pro', method: 'MoMo' },
  { id: 'INV-2026-002', date: '23/02/2026', amount: 299000, status: 'paid', plan: 'Pro', method: 'Chuyển khoản ngân hàng' },
  { id: 'INV-2026-001', date: '23/01/2026', amount: 199000, status: 'paid', plan: 'Pro ưu đãi', method: 'ZaloPay' },
];

function formatCurrency(value: number) {
  return `${value.toLocaleString('vi-VN')}₫`;
}

export function CustomerBilling() {
  const [selectedMethod, setSelectedMethod] = useState(PAYMENT_METHODS[3]);

  const handleCopyBankInfo = () => {
    navigator.clipboard.writeText('Vietcombank - 0123456789 - COPYPRO + email tài khoản').catch(() => {});
    toast.success('Đã copy thông tin chuyển khoản');
  };

  const handlePlanAction = (plan: typeof PLANS[number]) => {
    if (plan.popular) {
      toast.success('Đây là gói hiện tại!');
      return;
    }

    if (plan.price === 0) {
      toast.success('Đã chọn gói miễn phí');
      return;
    }

    toast.success(`Đã chọn thanh toán gói ${plan.name} bằng ${selectedMethod.shortName}`);
  };

  return (
    <Layout>
      <div className="mx-auto max-w-6xl p-6">
        <div className="mb-8">
          <h1 className="mb-1 text-3xl font-bold text-foreground">Gói dịch vụ & Thanh toán</h1>
          <p className="text-foreground/70">Quản lý gói đăng ký, phương thức thanh toán và hóa đơn</p>
        </div>

        <Tabs defaultValue="plan">
          <TabsList className="mb-6">
            <TabsTrigger value="plan">Gói hiện tại</TabsTrigger>
            <TabsTrigger value="payment">Thanh toán</TabsTrigger>
            <TabsTrigger value="plans">Nâng cấp</TabsTrigger>
            <TabsTrigger value="invoices">Hóa đơn</TabsTrigger>
          </TabsList>

          <TabsContent value="plan">
            <Card className="mb-6 border-amber-200 bg-gradient-to-r from-amber-50 to-green-50 p-6">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-gradient-to-br from-amber-500 to-green-600 p-3">
                    <Crown className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Gói {CURRENT_PLAN.name}</h2>
                    <p className="text-sm text-foreground/70">Gia hạn ngày {CURRENT_PLAN.renewDate}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-amber-700">{formatCurrency(CURRENT_PLAN.price)}</p>
                  <p className="text-xs text-muted-foreground">/tháng</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-foreground/70">Copy đã tạo</span>
                    <span className="font-semibold">{CURRENT_PLAN.copyUsed}/{CURRENT_PLAN.copyLimit}</span>
                  </div>
                  <Progress value={(CURRENT_PLAN.copyUsed / CURRENT_PLAN.copyLimit) * 100} className="h-2" />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-foreground/70">API calls</span>
                    <span className="font-semibold">{CURRENT_PLAN.apiCalls.toLocaleString()}/{CURRENT_PLAN.apiLimit.toLocaleString()}</span>
                  </div>
                  <Progress value={(CURRENT_PLAN.apiCalls / CURRENT_PLAN.apiLimit) * 100} className="h-2" />
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-foreground">Phương thức thanh toán đang chọn</h3>
                  <p className="text-sm text-muted-foreground">Áp dụng cho lần gia hạn hoặc nâng cấp tiếp theo</p>
                </div>
                <Badge className="border-0 bg-warning/15 text-amber-800">{selectedMethod.name}</Badge>
              </div>
              <PaymentMethodGrid selectedId={selectedMethod.id} onSelect={setSelectedMethod} />
            </Card>
          </TabsContent>

          <TabsContent value="payment">
            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
              <Card className="p-5">
                <h3 className="mb-2 font-semibold text-foreground">Chọn phương thức thanh toán</h3>
                <p className="mb-5 text-sm text-muted-foreground">Hỗ trợ tiền mặt, chuyển khoản ngân hàng, ZaloPay và MoMo.</p>
                <PaymentMethodGrid selectedId={selectedMethod.id} onSelect={setSelectedMethod} />
              </Card>

              <Card className="p-5">
                <div className="mb-4 flex items-start gap-3">
                  <div className={`rounded-lg p-2 ${selectedMethod.color}`}>
                    <selectedMethod.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{selectedMethod.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedMethod.desc}</p>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-surface-muted p-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Hướng dẫn</p>
                  <p className="text-sm leading-relaxed text-foreground/80">{selectedMethod.guide}</p>
                </div>

                {selectedMethod.id === 'bank' && (
                  <Button variant="outline" className="mt-4 w-full" onClick={handleCopyBankInfo}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy thông tin chuyển khoản
                  </Button>
                )}

                {(selectedMethod.id === 'momo' || selectedMethod.id === 'zalo') && (
                  <div className="mt-4 flex items-center justify-center rounded-lg border border-dashed border-border bg-card p-6">
                    <div className="text-center">
                      <QrCode className="mx-auto mb-2 h-12 w-12 text-muted-foreground/60" />
                      <p className="text-xs text-muted-foreground">QR sẽ được tạo khi xác nhận thanh toán</p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="plans">
            <div className="mb-5 rounded-lg border border-amber-100 bg-warning/10 p-4">
              <p className="text-sm text-amber-800">
                Phương thức thanh toán đang chọn: <strong>{selectedMethod.name}</strong>. Bạn có thể đổi trong tab Thanh toán trước khi nâng cấp.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {PLANS.map(plan => {
                const Icon = plan.icon;
                return (
                  <Card key={plan.id} className={`relative p-6 ${plan.color}`}>
                    {plan.popular && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 border-0 bg-warning/100 px-3 text-white">Đang dùng</Badge>
                    )}
                    <div className="mb-6 text-center">
                      <div className="mb-3 inline-flex rounded-lg bg-warning/15 p-3">
                        <Icon className="h-6 w-6 text-amber-700" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                      <p className="mt-2 text-3xl font-bold text-foreground">
                        {plan.price === 0 ? 'Miễn phí' : formatCurrency(plan.price)}
                        {plan.price > 0 && <span className="text-sm font-normal text-muted-foreground">/tháng</span>}
                      </p>
                    </div>
                    <div className="mb-6 space-y-2">
                      {plan.features.map(feature => (
                        <div key={feature} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary" />
                          <span className="text-foreground/80">{feature}</span>
                        </div>
                      ))}
                      {plan.limits.map(limit => (
                        <div key={limit} className="flex items-center gap-2 text-sm">
                          <X className="h-4 w-4 flex-shrink-0 text-muted-foreground/60" />
                          <span className="text-muted-foreground/80">{limit}</span>
                        </div>
                      ))}
                    </div>
                    <Button
                      className={`w-full ${plan.popular ? 'bg-warning/100 text-white hover:bg-amber-600' : ''}`}
                      variant={plan.popular ? 'default' : 'outline'}
                      onClick={() => handlePlanAction(plan)}
                    >
                      {plan.popular ? 'Gói hiện tại' : plan.price === 0 ? 'Chọn miễn phí' : `Thanh toán bằng ${selectedMethod.shortName}`}
                    </Button>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="invoices">
            <Card className="p-5">
              <h3 className="mb-4 font-semibold text-foreground">Lịch sử hóa đơn</h3>
              <div className="space-y-3">
                {INVOICES.map(invoice => (
                  <div key={invoice.id} className="flex items-center gap-4 rounded-lg border bg-surface-muted p-3">
                    <div className="rounded-lg bg-primary/10 p-2"><FileText className="h-4 w-4 text-primary" /></div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{invoice.id}</p>
                      <p className="text-xs text-muted-foreground">{invoice.date} · {invoice.plan} · {invoice.method}</p>
                    </div>
                    <span className="text-sm font-semibold text-foreground">{formatCurrency(invoice.amount)}</span>
                    <Badge className="border-0 bg-primary/10 text-xs text-primary">Đã thanh toán</Badge>
                    <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

function PaymentMethodGrid({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (method: typeof PAYMENT_METHODS[number]) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {PAYMENT_METHODS.map(method => {
        const Icon = method.icon;
        const active = selectedId === method.id;

        return (
          <button
            key={method.id}
            type="button"
            onClick={() => onSelect(method)}
            className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-all ${
              active
                ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10'
                : 'border-border bg-card hover:border-primary/30 hover:bg-primary/5'
            }`}
          >
            <div className={`rounded-lg p-2 ${method.color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground">{method.name}</p>
                {active && <CheckCircle2 className="h-4 w-4 text-primary" />}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{method.desc}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
