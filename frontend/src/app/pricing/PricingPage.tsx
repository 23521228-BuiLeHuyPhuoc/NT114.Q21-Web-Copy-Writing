import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from '@/lib/next-router-compat';
import { PublicNavbar } from '@/app/components/public/PublicNavbar';
import { PublicFooter } from '@/app/components/public/PublicFooter';
import { Badge } from '@/app/components/ui/badge';
import {
  CheckCircle2, X, Crown, Zap, Building2,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import { billingService, type BillingPlan } from '@/services/billingService';
import { EditorialEmptyState } from '@/app/components/EditorialArtwork';

/* ─── Data ─────────────────────────────────────────────────── */

const PLANS = [
  {
    id: 'free', name: 'Miễn Phí', icon: Zap, monthlyPrice: 0, yearlyPrice: 0,
    desc: 'Gói khởi đầu được cấu hình trong hệ thống.',
    color: 'border-border', accent: 'text-foreground/80', highlight: false,
    badge: '',
    features: [] as Array<{ text: string; ok: boolean }>,
    cta: 'Bắt đầu miễn phí',
  },
  {
    id: 'pro', name: 'Pro', icon: Crown, monthlyPrice: 0, yearlyPrice: 0,
    desc: 'Gói mở rộng quota và quyền truy cập.',
    color: 'border-primary', accent: 'text-primary', highlight: true,
    badge: 'Phổ biến nhất',
    features: [] as Array<{ text: string; ok: boolean }>,
    cta: 'Bắt đầu dùng Pro',
  },
  {
    id: 'business', name: 'Business', icon: Building2, monthlyPrice: 0, yearlyPrice: 0,
    desc: 'Gói dành cho nhu cầu vận hành lớn hơn.',
    color: 'border-border', accent: 'text-foreground/80', highlight: false,
    badge: '',
    features: [] as Array<{ text: string; ok: boolean }>,
    cta: 'Liên hệ dùng Business',
  },
];

const PLAN_ORDER = ['free', 'pro', 'business'];

type PricingPlan = (typeof PLANS)[number] & { limits?: BillingPlan['limits'] };

function formatCompareLimit(value: number | undefined, unit = '') {
  const numeric = Number(value ?? 0);
  if (numeric < 0) return 'Liên hệ';
  if (numeric === 0) return null;
  return `${numeric.toLocaleString('vi-VN')}${unit ? ` ${unit}` : ''}`;
}

function buildCompareRows(plans: PricingPlan[]) {
  return [
    { label: 'Copy/tháng', values: plans.map(plan => formatCompareLimit(plan.limits?.copyMonthly)) },
    { label: 'Generate/tháng', values: plans.map(plan => formatCompareLimit(plan.limits?.apiCallsMonthly)) },
    { label: 'Generate/5h', values: plans.map(plan => formatCompareLimit(plan.limits?.apiCallsFiveHours)) },
    { label: 'Generate/tuần', values: plans.map(plan => formatCompareLimit(plan.limits?.apiCallsWeekly)) },
    { label: 'Fine-tune models', values: plans.map(plan => formatCompareLimit(plan.limits?.fineTuneModels)) },
    { label: 'Kiểm tra đạo văn', values: plans.map(plan => formatCompareLimit(plan.limits?.plagiarismChecks, 'lần')) },
  ];
}

function buildLimitFeatures(plan: BillingPlan) {
  const limits = plan.limits;
  const formatLimit = (value: number, suffix: string) => {
    if (value === -1) return `${suffix} liên hệ`;
    if (value === 0) return '';
    return `${value.toLocaleString('vi-VN')} ${suffix}`;
  };

  return [
    formatLimit(limits.copyMonthly, 'copy/tháng'),
    formatLimit(limits.apiCallsMonthly, 'API calls/tháng'),
    formatLimit(limits.fineTuneModels, 'fine-tune models'),
  ].filter(Boolean);
}

function toPricingPlan(plan: BillingPlan, index: number): PricingPlan {
  const fallback = PLANS.find(item => item.id === plan.slug) || PLANS[Math.min(index, PLANS.length - 1)];
  const positiveFeatures = plan.features.length > 0 ? plan.features : buildLimitFeatures(plan);
  const negativeFeatures = plan.excludedFeatures;

  return {
    ...fallback,
    id: plan.slug || plan.id,
    name: plan.name || fallback.name,
    monthlyPrice: plan.monthlyPrice,
    yearlyPrice: plan.yearlyPrice,
    desc: plan.description || fallback.desc,
    highlight: plan.isPopular,
    badge: plan.isPopular ? (fallback.badge || 'Phổ biến') : '',
    features: [
      ...positiveFeatures.map(text => ({ text, ok: true })),
      ...negativeFeatures.map(text => ({ text, ok: false })),
    ],
    limits: plan.limits,
    cta: plan.monthlyPrice === -1 ? 'Liên hệ tư vấn' : plan.monthlyPrice === 0 ? 'Bắt đầu miễn phí' : `Bắt đầu dùng ${plan.name}`,
  };
}

function getPlanOrder(slug: string) {
  const index = PLAN_ORDER.indexOf(slug);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

function isSupportedPlanSlug(slug: string) {
  return PLAN_ORDER.includes(slug);
}

const FAQ = [
  { q: 'Các giới hạn trên trang này lấy từ đâu?', a: 'Giá, quota, model và tính năng được đọc từ cấu hình gói hiện hành của backend.' },
  { q: 'Khi nào tôi cần nâng gói?', a: 'Bạn có thể xem mức sử dụng và quota còn lại trong Dashboard hoặc trang Gói & thanh toán.' },
  { q: 'Fine-tuning có phụ thuộc gói không?', a: 'Có. Quyền truy cập fine-tuning và số model khả dụng được xác định bởi cấu hình gói và phân quyền hiện tại.' },
  { q: 'Tôi cần hỏi thêm về thanh toán?', a: 'Dùng trang Liên hệ và chọn chủ đề Thanh toán & hóa đơn để gửi yêu cầu vào hệ thống hỗ trợ.' },
];

/* ─── Component ─────────────────────────────────────────────── */

export function PricingPage() {
  const navigate = useNavigate();
  const [yearly, setYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState(false);

  useEffect(() => {
    let active = true;
    billingService.listPlans()
      .then((items) => {
        if (active) {
          setPlans(items
            .filter(plan => isSupportedPlanSlug(plan.slug))
            .sort((a, b) => getPlanOrder(a.slug) - getPlanOrder(b.slug))
            .map(toPricingPlan));
        }
      })
      .catch(() => { if (active) setPlansError(true); })
      .finally(() => { if (active) setPlansLoading(false); });

    return () => { active = false; };
  }, []);

  const compareRows = useMemo(() => {
    return buildCompareRows(plans);
  }, [plans]);

  const yearlyDiscountPercent = useMemo(() => {
    const discounts = plans
      .map((plan) => {
        if (plan.monthlyPrice <= 0 || plan.yearlyPrice <= 0) return 0;
        return Math.round((1 - (plan.yearlyPrice / (plan.monthlyPrice * 12))) * 100);
      })
      .filter((value) => value > 0);

    return discounts.length > 0 ? Math.max(...discounts) : 0;
  }, [plans]);

  return (
    <div className="public-page min-h-screen overflow-x-hidden bg-card">
      <PublicNavbar />

      {/* ─── HERO ─── */}
      <section className="paper-grid relative overflow-hidden border-b-2 border-foreground bg-background pb-16 pt-28 md:pb-20 md:pt-32">
        <div className="pointer-events-none absolute -right-16 top-24 h-40 w-40 rotate-12 border-[26px] border-primary/10" />

        <div className="relative max-w-3xl mx-auto px-5 text-center">
          <Badge className="mb-6 border border-foreground/30 bg-accent/35 px-4 py-1.5 text-sm text-foreground">
            💳 Bảng giá minh bạch
          </Badge>
          <h1 className="type-hero mb-5 text-foreground">
            Chọn đúng không gian cho nhịp sản xuất nội dung.
          </h1>
          <p className="mb-9 text-lg leading-8 text-muted-foreground md:text-xl">
            Giá, quota và quyền truy cập bên dưới được lấy trực tiếp từ cấu hình gói hiện hành.
          </p>

          {/* Toggle billing */}
          <div className="inline-flex items-center gap-2 rounded-md border-2 border-foreground bg-card p-1.5 shadow-[4px_4px_0_rgba(23,32,51,.12)]">
            <button
              onClick={() => setYearly(false)}
              className={`rounded-sm px-6 py-2.5 text-sm font-semibold transition-all ${!yearly ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
            >
              Hàng tháng
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`flex items-center gap-2 rounded-sm px-6 py-2.5 text-sm font-semibold transition-all ${yearly ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
            >
              Hàng năm
              {yearlyDiscountPercent > 0 && yearly && <Badge className="bg-primary/10 text-primary border-0 text-xs">-{yearlyDiscountPercent}%</Badge>}
              {yearlyDiscountPercent > 0 && !yearly && <span className="text-xs bg-primary/20 text-primary rounded-md px-2 py-0.5">-{yearlyDiscountPercent}%</span>}
            </button>
          </div>

          <div className="mx-auto mt-6 max-w-2xl rounded-md border border-warning/45 bg-warning/10 px-4 py-3 text-sm leading-relaxed text-foreground/80">
            Thông tin gói được lấy từ cấu hình hiện hành trong hệ thống. Thanh toán đang chạy qua VNPAY, ZaloPay và VietQR ở môi trường kiểm thử.
          </div>
        </div>
      </section>

      {/* ─── PRICING CARDS ─── */}
      <section className="pb-24 -mt-6">
        <div className="max-w-6xl mx-auto px-5 lg:px-8">
          {plansLoading && <div className="paper-noise border-2 border-foreground bg-card p-10 text-center text-sm text-muted-foreground">Đang tải cấu hình gói...</div>}
          {!plansLoading && (plansError || plans.length === 0) && <EditorialEmptyState title="Chưa tải được bảng giá" description="Không có dữ liệu gói khả dụng từ backend. Vui lòng thử lại hoặc liên hệ hỗ trợ." action={<Link to="/contact" className="inline-flex h-10 items-center border border-foreground bg-primary px-4 text-sm font-bold text-primary-foreground">Liên hệ hỗ trợ</Link>} />}
          <div className="grid gap-6 items-start md:grid-cols-3">
            {plans.map(plan => {
              const Icon = plan.icon;
              const yearlyTotal = plan.yearlyPrice;
              const displayPrice = yearly && yearlyTotal > 0 ? Math.round(yearlyTotal / 12) : plan.monthlyPrice;
              const annualSavings = plan.monthlyPrice > 0 && yearlyTotal > 0 ? (plan.monthlyPrice * 12) - yearlyTotal : 0;
              return (
                <div
                  key={plan.id}
                  className={`relative bg-card rounded-3xl p-8 border-2 transition-all ${
                    plan.highlight
                      ? 'border-primary shadow-2xl shadow-primary/10 -mt-4'
                      : 'border-border hover:border-primary/20 hover:shadow-xl'
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="border-0 bg-primary px-4 py-1.5 text-xs text-primary-foreground shadow-sm">
                        ⭐ {plan.badge}
                      </Badge>
                    </div>
                  )}

                  {/* Plan header */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2.5 rounded-xl ${plan.highlight ? 'bg-primary/10' : 'bg-muted'}`}>
                      <Icon className={`w-5 h-5 ${plan.highlight ? 'text-primary' : 'text-foreground/70'}`} />
                    </div>
                    <h3 className="text-foreground">{plan.name}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed">{plan.desc}</p>

                  {/* Price */}
                  <div className="mb-6 pb-6 border-b border-border">
                    {displayPrice === -1 ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-foreground tracking-tight">Liên hệ</span>
                      </div>
                    ) : displayPrice === 0 ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-foreground tracking-tight">Miễn phí</span>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold text-foreground tracking-tight">{(displayPrice / 1000).toFixed(0)}K</span>
                          <span className="text-muted-foreground/80 text-sm">₫ / tháng</span>
                        </div>
                        {yearly && yearlyTotal > 0 && (
                          <p className="text-sm text-primary font-medium mt-1">
                            Thanh toán {(yearlyTotal / 1000).toFixed(0)}K₫ / năm
                          </p>
                        )}
                        {!yearly && annualSavings > 0 && (
                          <p className="text-xs text-muted-foreground/80 mt-1">
                            Tiết kiệm {(annualSavings / 1000).toFixed(0)}K₫/năm khi trả theo năm
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => navigate(plan.monthlyPrice === -1 ? '/contact' : '/register')}
                    className={`w-full py-3.5 rounded-2xl font-bold text-sm mb-7 transition-all ${
                      plan.highlight
                        ? 'bg-primary text-primary-foreground shadow-[3px_3px_0_rgba(23,32,51,.16)] hover:bg-primary/90'
                        : 'bg-gray-900 hover:bg-gray-700 text-white'
                    }`}
                  >
                    {plan.cta}
                  </button>

                  {/* Features */}
                  <ul className="space-y-3">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        {f.ok
                          ? <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          : <X className="w-4 h-4 text-muted-foreground/60 flex-shrink-0 mt-0.5" />
                        }
                        <span className={f.ok ? 'text-foreground/80' : 'text-muted-foreground/80'}>{f.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ─── COMPARE TABLE ─── */}
      {plans.length > 0 && <section className="py-24">
        <div className="max-w-5xl mx-auto px-5 lg:px-8">
          <div className="text-center mb-14">
            <Badge className="mb-5 bg-primary/10 text-primary border-0 px-4 py-1.5">So sánh chi tiết</Badge>
            <h2 className="type-public-title text-foreground">Tính năng đầy đủ theo từng gói</h2>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-border shadow-sm">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-background border-b border-border">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-foreground/70 w-1/2">Tính năng</th>
                  {plans.map(p => (
                    <th key={p.id} className={`px-4 py-4 text-sm font-bold text-center ${p.highlight ? 'text-primary bg-primary/5' : 'text-foreground/80'}`}>
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {compareRows.map((row, i) => (
                  <tr key={i} className={`border-b border-border ${i % 2 === 0 ? 'bg-card' : 'bg-background/50'}`}>
                    <td className="px-6 py-4 text-sm text-foreground/80 font-medium">{row.label}</td>
                    {row.values.map((val, j) => (
                      <td key={j} className={`px-4 py-4 text-center text-sm ${plans[j]?.highlight ? 'bg-primary/5' : ''}`}>
                        {val === null
                          ? <X className="w-4 h-4 text-muted-foreground/60 mx-auto" />
                          : <span className={`font-medium ${plans[j]?.highlight ? 'text-primary' : 'text-foreground/80'}`}>{val}</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>}

      {/* ─── FAQ ─── */}
      <section className="pb-24">
        <div className="max-w-3xl mx-auto px-5 lg:px-8">
          <div className="text-center mb-14">
            <Badge className="mb-5 bg-primary/10 text-primary border-0 px-4 py-1.5">FAQ</Badge>
            <h2 className="type-public-title mb-3 text-foreground">Câu hỏi thường gặp</h2>
            <p className="text-muted-foreground">Không tìm thấy câu trả lời?{' '}
              <Link to="/contact" className="text-primary hover:underline font-semibold">Liên hệ chúng tôi.</Link>
            </p>
          </div>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <div
                key={i}
                className={`overflow-hidden rounded-md border transition-all ${openFaq === i ? 'border-primary/50 shadow-sm' : 'border-border hover:border-primary/30'}`}
              >
                <button
                  className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="text-sm font-semibold text-foreground">{item.q}</span>
                  <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full transition-colors ${openFaq === i ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {openFaq === i ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6">
                    <p className="text-sm text-foreground/70 leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
