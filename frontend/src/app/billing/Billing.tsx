import { useCallback, useEffect, useState } from 'react';
import { Layout } from '@/app/components/Layout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { api } from '@/lib/axios';
import {
  Crown,
  Zap,
  Building2,
  CheckCircle2,
  X,
  Download,
  FileText,
  Smartphone,
  CreditCard,
  QrCode,
  Copy,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { DataPagination } from '@/app/components/common/DataPagination';
import { usePagination } from '@/hooks/usePagination';

type PlanIcon = typeof Crown;

interface BillingPlanCard {
  id: string;
  slug: string;
  name: string;
  price: number;
  currency: string;
  icon: PlanIcon;
  color: string;
  features: string[];
  limits: string[];
  popular?: boolean;
}

const CURRENT_PLAN = {
  name: 'Pro',
  slug: 'pro',
  price: 299000,
  renewDate: '23/04/2026',
  copyUsed: 312,
  copyLimit: 500,
  apiCalls: 1250,
  apiLimit: 5000,
  quotaUsedFiveHours: 120,
  quotaLimitFiveHours: 800,
  quotaUsedWeekly: 720,
  quotaLimitWeekly: 2000,
};

const PLANS: BillingPlanCard[] = [
  {
    id: 'free',
    slug: 'free',
    name: 'Miễn phí',
    price: 0,
    currency: 'VND',
    icon: Zap,
    color: 'border-border',
    features: ['30 copy/tháng', '2 model AI cơ bản', '5 templates', 'Không có API'],
    limits: ['Không có fine-tuning', 'Không kiểm tra đạo văn'],
  },
  {
    id: 'pro',
    slug: 'pro',
    name: 'Pro',
    price: 299000,
    currency: 'VND',
    icon: Crown,
    color: 'border-amber-500 ring-2 ring-amber-100',
    features: ['500 copy/tháng', 'Tất cả model AI', '100+ templates', 'API 5,000 calls/tháng', 'Fine-tuning 3 models', 'Kiểm tra đạo văn 100 lần', 'Hỗ trợ ưu tiên'],
    limits: [],
    popular: true,
  },
  {
    id: 'business',
    slug: 'business',
    name: 'Business',
    price: 799000,
    currency: 'VND',
    icon: Building2,
    color: 'border-border',
    features: ['Unlimited copy', 'Tất cả model AI', 'Unlimited templates', 'API 50,000 calls/tháng', 'Fine-tuning unlimited', 'Kiểm tra đạo văn unlimited', 'Hỗ trợ 24/7 + SLA', 'Custom model training'],
    limits: [],
  },
];

const PAYMENT_METHODS = [
  {
    id: 'vnpay',
    name: 'VNPAY',
    shortName: 'VNPAY',
    desc: 'Thanh toán qua cổng VNPAY sandbox.',
    icon: CreditCard,
    color: 'bg-emerald-100 text-emerald-700',
    guide: 'Sau khi bấm thanh toán, hệ thống sẽ tạo link VNPAY và chuyển sang trang thanh toán.',
  },
  {
    id: 'zalo',
    name: 'ZaloPay',
    shortName: 'ZaloPay',
    desc: 'Thanh toán trực tiếp qua cổng ZaloPay sandbox.',
    icon: Smartphone,
    color: 'bg-primary/10 text-primary',
    guide: 'Sau khi bấm thanh toán, hệ thống sẽ tạo link ZaloPay và chuyển sang cổng thanh toán.',
  },
  {
    id: 'vietqr',
    name: 'VietQR',
    shortName: 'VietQR',
    desc: 'Quét mã QR ngân hàng và chuyển khoản theo nội dung hóa đơn.',
    icon: QrCode,
    color: 'bg-sky-100 text-sky-700',
    guide: 'Sau khi bấm thanh toán, hệ thống sẽ tạo mã VietQR với đúng số tiền và nội dung chuyển khoản.',
  },
];

const INVOICES = [
  { id: 'INV-2026-003', date: '23/03/2026', amount: 299000, status: 'paid', plan: 'Pro', method: 'MoMo' },
  { id: 'INV-2026-002', date: '23/02/2026', amount: 299000, status: 'paid', plan: 'Pro', method: 'Chuyển khoản ngân hàng' },
  { id: 'INV-2026-001', date: '23/01/2026', amount: 199000, status: 'paid', plan: 'Pro ưu đãi', method: 'ZaloPay' },
];

interface BillingMeResponse {
  currentPlan?: {
    name?: string;
    slug?: string;
    price?: number;
    renewDate?: string;
    copyUsed?: number;
    copyLimit?: number;
    apiCalls?: number;
    apiLimit?: number;
    quotaUsedFiveHours?: number;
    quotaLimitFiveHours?: number;
    quotaUsedWeekly?: number;
    quotaLimitWeekly?: number;
  };
  invoices?: typeof INVOICES;
}

interface BillingPlanResponseItem {
  id?: string;
  _id?: string;
  slug?: string;
  name?: string;
  description?: string;
  price?: number;
  monthlyPrice?: number;
  currency?: string;
  features?: string[];
  excludedFeatures?: string[];
  isPopular?: boolean;
  popular?: boolean;
  limits?: {
    copyMonthly?: number;
    apiCallsMonthly?: number;
    apiCallsFiveHours?: number;
    apiCallsWeekly?: number;
    fineTuneModels?: number;
    plagiarismChecks?: number;
  };
}

interface BillingPlansResponse {
  items?: BillingPlanResponseItem[];
}

interface VietQrCheckoutData {
  bankId?: string;
  bankName?: string;
  accountNo?: string;
  accountName?: string;
  amount?: number;
  currency?: string;
  transferContent?: string;
  qrImageUrl?: string;
  expiresAt?: string;
}

interface BillingCheckoutResponse {
  paymentUrl?: string | null;
  gateway?: string | null;
  status?: string;
  message?: string;
  payment?: { status?: string };
  vietqr?: VietQrCheckoutData | null;
}

function formatCurrency(value: number) {
  if (value === -1) return 'Liên hệ';
  if (value === 0) return 'Miễn phí';
  return `${value.toLocaleString('vi-VN')}₫`;
}

function formatLimitValue(value: number | undefined, label: string) {
  if (value === -1) return `${label} không giới hạn`;
  if (!value || value <= 0) return '';
  return `${value.toLocaleString('vi-VN')} ${label}`;
}

function getPlanIcon(slug: string): PlanIcon {
  if (slug === 'free') return Zap;
  if (slug === 'business' || slug === 'enterprise') return Building2;
  return Crown;
}

function normalizeBillingPlan(plan: BillingPlanResponseItem): BillingPlanCard {
  const slug = plan.slug || plan.id || plan._id || '';
  const price = Number(plan.monthlyPrice ?? plan.price ?? 0);
  const limits = plan.limits || {};
  const generatedFeatures = [
    formatLimitValue(limits.copyMonthly, 'copy/tháng'),
    formatLimitValue(limits.apiCallsMonthly, 'quota generate/tháng'),
    formatLimitValue(limits.apiCallsFiveHours, 'quota generate/5h'),
    formatLimitValue(limits.apiCallsWeekly, 'quota generate/tuần'),
    formatLimitValue(limits.fineTuneModels, 'fine-tune models'),
    formatLimitValue(limits.plagiarismChecks, 'kiểm tra đạo văn'),
  ].filter(Boolean);
  const popular = Boolean(plan.isPopular ?? plan.popular);

  return {
    id: plan.id || plan._id || slug,
    slug,
    name: plan.name || slug || 'Gói dịch vụ',
    price: Number.isFinite(price) ? price : 0,
    currency: plan.currency || 'VND',
    icon: getPlanIcon(slug),
    color: popular ? 'border-amber-500 ring-2 ring-amber-100' : 'border-border',
    features: (plan.features && plan.features.length > 0) ? plan.features : generatedFeatures,
    limits: plan.excludedFeatures || [],
    popular,
  };
}

function getPaymentNotice(payment: string | null) {
  if (!payment) return null;
  if (payment.includes('success')) return { type: 'success' as const, message: 'Thanh toán đã được ghi nhận.' };
  if (payment.includes('pending')) return { type: 'info' as const, message: 'Giao dịch đang chờ xác nhận từ cổng thanh toán.' };
  return { type: 'info' as const, message: 'Đang xử lý phiên thanh toán.' };
}

function getInvoiceStatusMeta(status: string) {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'paid' || normalized === 'success') {
    return { label: 'Đã thanh toán', className: 'bg-primary/10 text-primary' };
  }
  if (normalized === 'pending') {
    return { label: 'Chờ xác nhận', className: 'bg-amber-100 text-amber-700' };
  }
  if (normalized === 'failed') {
    return { label: 'Thất bại', className: 'bg-destructive/10 text-destructive' };
  }
  return { label: 'Đang xử lý', className: 'bg-muted text-muted-foreground' };
}

export function CustomerBilling() {
  const [currentPlan, setCurrentPlan] = useState(CURRENT_PLAN);
  const [plans, setPlans] = useState<BillingPlanCard[]>(PLANS);
  const [invoices, setInvoices] = useState(INVOICES);
  const [checkoutMethod, setCheckoutMethod] = useState<(typeof PAYMENT_METHODS)[number]>(PAYMENT_METHODS[0]);
  const [checkoutPlan, setCheckoutPlan] = useState<BillingPlanCard | null>(null);
  const [checkoutPlanId, setCheckoutPlanId] = useState<string | null>(null);
  const [vietqrPayment, setVietqrPayment] = useState<VietQrCheckoutData | null>(null);

  const loadPlans = useCallback(async () => {
    try {
      const response = await api.get<{ data?: BillingPlansResponse }>('/billing/plans');
      const items = response.data.data?.items || [];
      if (items.length > 0) {
        setPlans(items.map(normalizeBillingPlan));
      }
    } catch {
      // Giữ fallback demo nếu backend billing chưa sẵn sàng.
    }
  }, []);

  const loadBilling = useCallback(async () => {
    try {
      const response = await api.get<{ data?: BillingMeResponse }>('/billing/me');
      const data = response.data.data;
      if (!data) return;

      const currentPlanData = data.currentPlan;
      if (currentPlanData) {
        setCurrentPlan((prev) => ({
          ...prev,
          ...currentPlanData,
          slug: currentPlanData.slug || prev.slug,
          price: currentPlanData.price ?? prev.price,
          renewDate: currentPlanData.renewDate || prev.renewDate,
          copyUsed: currentPlanData.copyUsed ?? prev.copyUsed,
          copyLimit: currentPlanData.copyLimit ?? prev.copyLimit,
          apiCalls: currentPlanData.apiCalls ?? prev.apiCalls,
          apiLimit: currentPlanData.apiLimit ?? prev.apiLimit,
          quotaUsedFiveHours: currentPlanData.quotaUsedFiveHours ?? prev.quotaUsedFiveHours,
          quotaLimitFiveHours: currentPlanData.quotaLimitFiveHours ?? prev.quotaLimitFiveHours,
          quotaUsedWeekly: currentPlanData.quotaUsedWeekly ?? prev.quotaUsedWeekly,
          quotaLimitWeekly: currentPlanData.quotaLimitWeekly ?? prev.quotaLimitWeekly,
        }));
      }

      if (Array.isArray(data.invoices) && data.invoices.length > 0) {
        setInvoices(data.invoices);
      }
    } catch {
      // Giữ fallback demo nếu backend billing chưa sẵn sàng.
    }
  }, []);

  useEffect(() => {
    void loadBilling();
    void loadPlans();
  }, [loadBilling, loadPlans]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    const notice = getPaymentNotice(payment);
    let timer: number | undefined;

    if (notice) {
      if (notice.type === 'success') toast.success(notice.message);
      else toast(notice.message);
      void loadBilling();
      if (payment?.includes('return') || payment?.includes('pending')) {
        timer = window.setTimeout(() => {
          void loadBilling();
        }, 3000);
      }
      window.history.replaceState({}, '', window.location.pathname);
    }

    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [loadBilling]);

  const invoicePagination = usePagination(invoices, {
    initialPageSize: 5,
  });

  const isCurrentPlan = (plan: BillingPlanCard) => plan.slug === currentPlan.slug;

  const closeCheckout = () => {
    setCheckoutPlan(null);
    setVietqrPayment(null);
  };

  const selectCheckoutMethod = (method: typeof PAYMENT_METHODS[number]) => {
    setCheckoutMethod(method);
    setVietqrPayment(null);
  };

  const copyToClipboard = async (value: string | number | undefined, label: string) => {
    if (value === undefined || value === null || value === '') return;

    try {
      await navigator.clipboard.writeText(String(value));
      toast.success(`Đã sao chép ${label}`);
    } catch {
      toast.error('Không sao chép được nội dung');
    }
  };

  const openCheckout = (plan: BillingPlanCard) => {
    if (isCurrentPlan(plan)) {
      toast.success('Đây là gói hiện tại!');
      return;
    }

    if (plan.price < 0) {
      toast('Gói này cần liên hệ tư vấn để kích hoạt.');
      return;
    }

    if (plan.price === 0) {
      toast.success('Đã chọn gói miễn phí');
      return;
    }

    setCheckoutMethod(PAYMENT_METHODS[0]);
    setVietqrPayment(null);
    setCheckoutPlan(plan);
  };

  const handleCheckout = async () => {
    if (!checkoutPlan) return;

    setCheckoutPlanId(checkoutPlan.slug);
    try {
      const response = await api.post<{ data?: BillingCheckoutResponse }>('/billing/checkout', {
        planSlug: checkoutPlan.slug,
        billingCycle: 'monthly',
        method: checkoutMethod.id,
      });

      const data = response.data.data;
      if (!data) {
        toast.error('Không nhận được phản hồi thanh toán');
        return;
      }

      if (data.paymentUrl) {
        window.location.assign(data.paymentUrl);
        return;
      }

      if (data.gateway === 'vietqr' && data.vietqr?.qrImageUrl) {
        setVietqrPayment(data.vietqr);
        toast.success(data.message || 'Đã tạo mã VietQR');
        await loadBilling();
        return;
      }

      if (data.payment?.status === 'success') {
        toast.success(data.message || `Thanh toán thành công qua ${checkoutMethod.shortName}`);
      } else {
        toast.success(data.message || 'Đã tạo hóa đơn thanh toán');
      }

      await loadBilling();
      setCheckoutPlan(null);
    } catch (error) {
      const validationDetail = (error as {
        response?: { data?: { errors?: Array<{ field?: string; message?: string }> } };
      }).response?.data?.errors?.[0];
      if (validationDetail) {
        toast.error(`${validationDetail.field ? `${validationDetail.field}: ` : ''}${validationDetail.message || 'Validation error'}`);
        return;
      }
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(err.response?.data?.message || err.message || 'Không tạo được thanh toán');
    } finally {
      setCheckoutPlanId(null);
    }
  };

  const hasCreatedVietQr = checkoutMethod.id === 'vietqr' && Boolean(vietqrPayment);
  const checkoutButtonDisabled = !checkoutPlan || checkoutPlanId !== null || hasCreatedVietQr;

  return (
    <Layout>
      <div className="mx-auto max-w-6xl p-6">
        <div className="mb-8">
          <h1 className="mb-1 text-3xl font-bold text-foreground">Gói dịch vụ & Thanh toán</h1>
          <p className="text-foreground/70">Quản lý gói đăng ký, nâng cấp gói và hóa đơn</p>
        </div>

        <Tabs defaultValue="plan">
          <TabsList className="mb-6">
            <TabsTrigger value="plan">Gói hiện tại</TabsTrigger>
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
                    <h2 className="text-xl font-bold text-foreground">Gói {currentPlan.name}</h2>
                    <p className="text-sm text-foreground/70">Gia hạn ngày {currentPlan.renewDate}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-amber-700">{formatCurrency(currentPlan.price)}</p>
                  {currentPlan.price > 0 && <p className="text-xs text-muted-foreground">/tháng</p>}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-foreground/70">Copy đã tạo</span>
                    <span className="font-semibold">{currentPlan.copyUsed}/{currentPlan.copyLimit}</span>
                  </div>
                  <Progress value={currentPlan.copyLimit > 0 ? (currentPlan.copyUsed / currentPlan.copyLimit) * 100 : 0} className="h-2" />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-foreground/70">Quota generate/tháng</span>
                    <span className="font-semibold">{currentPlan.apiCalls.toLocaleString()}/{currentPlan.apiLimit.toLocaleString()}</span>
                  </div>
                  <Progress value={currentPlan.apiLimit > 0 ? (currentPlan.apiCalls / currentPlan.apiLimit) * 100 : 0} className="h-2" />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-foreground/70">Quota generate/5h</span>
                    <span className="font-semibold">{currentPlan.quotaUsedFiveHours.toLocaleString()}/{currentPlan.quotaLimitFiveHours.toLocaleString()}</span>
                  </div>
                  <Progress value={currentPlan.quotaLimitFiveHours > 0 ? (currentPlan.quotaUsedFiveHours / currentPlan.quotaLimitFiveHours) * 100 : 0} className="h-2" />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-foreground/70">Quota generate/tuần</span>
                    <span className="font-semibold">{currentPlan.quotaUsedWeekly.toLocaleString()}/{currentPlan.quotaLimitWeekly.toLocaleString()}</span>
                  </div>
                  <Progress value={currentPlan.quotaLimitWeekly > 0 ? (currentPlan.quotaUsedWeekly / currentPlan.quotaLimitWeekly) * 100 : 0} className="h-2" />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="plans">
            <div className="mb-5 rounded-lg border border-border bg-surface-muted p-4">
              <p className="text-sm text-foreground/70">
                Chọn gói trả phí để mở bước thanh toán VNPAY, ZaloPay hoặc VietQR.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {plans.map((plan) => {
                const Icon = plan.icon;
                const current = isCurrentPlan(plan);
                const isLoading = checkoutPlanId === plan.slug;

                return (
                  <Card key={plan.id} className={`relative p-6 ${plan.color}`}>
                    {current && (
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
                      {plan.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary" />
                          <span className="text-foreground/80">{feature}</span>
                        </div>
                      ))}
                      {plan.limits.map((limit) => (
                        <div key={limit} className="flex items-center gap-2 text-sm">
                          <X className="h-4 w-4 flex-shrink-0 text-muted-foreground/60" />
                          <span className="text-muted-foreground/80">{limit}</span>
                        </div>
                      ))}
                    </div>
                    <Button
                      className={`w-full ${current ? 'bg-warning/100 text-white hover:bg-amber-600' : ''}`}
                      variant={current ? 'default' : 'outline'}
                      onClick={() => openCheckout(plan)}
                      disabled={checkoutPlanId !== null || current}
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Đang tạo thanh toán...
                        </span>
                      ) : current ? 'Gói hiện tại' : plan.price < 0 ? 'Liên hệ tư vấn' : plan.price === 0 ? 'Chọn miễn phí' : 'Chọn gói'}
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
                {invoicePagination.pageItems.map((invoice) => {
                  const statusMeta = getInvoiceStatusMeta(invoice.status);

                  return (
                    <div key={invoice.id} className="flex items-center gap-4 rounded-lg border bg-surface-muted p-3">
                      <div className="rounded-lg bg-primary/10 p-2"><FileText className="h-4 w-4 text-primary" /></div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">{invoice.id}</p>
                        <p className="text-xs text-muted-foreground">{invoice.date} · {invoice.plan} · {invoice.method}</p>
                      </div>
                      <span className="text-sm font-semibold text-foreground">{formatCurrency(invoice.amount)}</span>
                      <Badge className={`border-0 text-xs ${statusMeta.className}`}>{statusMeta.label}</Badge>
                      <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                    </div>
                  );
                })}
              </div>
              <DataPagination
                page={invoicePagination.page}
                pageSize={invoicePagination.pageSize}
                totalItems={invoicePagination.totalItems}
                totalPages={invoicePagination.totalPages}
                startIndex={invoicePagination.startIndex}
                endIndex={invoicePagination.endIndex}
                onPageChange={invoicePagination.setPage}
                onPageSizeChange={invoicePagination.setPageSize}
                itemLabel="hóa đơn"
              />
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog
          open={Boolean(checkoutPlan)}
          onOpenChange={(open) => {
            if (!open && checkoutPlanId === null) {
              closeCheckout();
            }
          }}
        >
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Thanh toán gói {checkoutPlan?.name || ''}</DialogTitle>
            </DialogHeader>

            {checkoutPlan && (
              <div className="space-y-5">
                <div className="rounded-lg border border-border bg-surface-muted p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Gói đã chọn</p>
                      <p className="mt-1 text-lg font-semibold text-foreground">{checkoutPlan.name}</p>
                      <p className="text-sm text-muted-foreground">Thanh toán theo chu kỳ tháng</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-foreground">{formatCurrency(checkoutPlan.price)}</p>
                      {checkoutPlan.price > 0 && <p className="text-xs text-muted-foreground">/tháng</p>}
                    </div>
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-sm font-semibold text-foreground">Chọn phương thức thanh toán</p>
                  <PaymentMethodGrid selectedId={checkoutMethod.id} onSelect={selectCheckoutMethod} />
                </div>

                <div className="rounded-lg border border-border bg-surface-muted p-4">
                  <div className="mb-3 flex items-start gap-3">
                    <div className={`rounded-lg p-2 ${checkoutMethod.color}`}>
                      <checkoutMethod.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{checkoutMethod.name}</h3>
                      <p className="text-sm text-muted-foreground">{checkoutMethod.desc}</p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/80">{checkoutMethod.guide}</p>
                </div>

                {checkoutMethod.id === 'vietqr' && vietqrPayment && (
                  <VietQrPaymentPanel payment={vietqrPayment} onCopy={copyToClipboard} />
                )}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={closeCheckout} disabled={checkoutPlanId !== null}>
                Đóng
              </Button>
              <Button onClick={() => void handleCheckout()} disabled={checkoutButtonDisabled}>
                {checkoutPlanId ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Đang tạo thanh toán...
                  </span>
                ) : hasCreatedVietQr ? (
                  'Đã tạo VietQR'
                ) : (
                  `Tiếp tục với ${checkoutMethod.shortName}`
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}

function VietQrPaymentPanel({
  payment,
  onCopy,
}: {
  payment: VietQrCheckoutData;
  onCopy: (value: string | number | undefined, label: string) => void | Promise<void>;
}) {
  if (!payment.qrImageUrl) return null;

  const rows: Array<{
    label: string;
    value?: string;
    copyValue?: string | number;
    copyLabel: string;
    emphasis?: boolean;
  }> = [
    { label: 'Ngân hàng', value: payment.bankName || payment.bankId, copyLabel: 'ngân hàng' },
    { label: 'Số tài khoản', value: payment.accountNo, copyLabel: 'số tài khoản' },
    { label: 'Chủ tài khoản', value: payment.accountName, copyLabel: 'chủ tài khoản' },
    {
      label: 'Số tiền',
      value: formatCurrency(payment.amount || 0),
      copyValue: payment.amount,
      copyLabel: 'số tiền',
      emphasis: true,
    },
    {
      label: 'Nội dung chuyển khoản',
      value: payment.transferContent,
      copyLabel: 'nội dung chuyển khoản',
      emphasis: true,
    },
  ];

  return (
    <div className="rounded-lg border border-sky-200 bg-sky-50/60 p-4">
      <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
        <div className="rounded-lg border border-border bg-white p-3">
          <img
            src={payment.qrImageUrl}
            alt="Mã VietQR thanh toán"
            className="h-52 w-full object-contain"
          />
        </div>

        <div className="space-y-2">
          {rows.map((row) => row.value ? (
            <div key={row.label} className="flex items-center justify-between gap-3 rounded-lg border border-white/70 bg-white/80 px-3 py-2">
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">{row.label}</p>
                <p className={`break-words text-sm ${row.emphasis ? 'font-semibold text-foreground' : 'text-foreground/80'}`}>
                  {row.value}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 shrink-0 px-2"
                aria-label={`Sao chép ${row.copyLabel}`}
                onClick={() => void onCopy(row.copyValue ?? row.value, row.copyLabel)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          ) : null)}
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-sky-800">
        Sau khi chuyển khoản, hóa đơn sẽ ở trạng thái chờ xác nhận. Vui lòng giữ đúng số tiền và nội dung chuyển khoản để đối soát nhanh hơn.
      </p>
    </div>
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
    <div className="grid gap-3 sm:grid-cols-3">
      {PAYMENT_METHODS.map((method) => {
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
