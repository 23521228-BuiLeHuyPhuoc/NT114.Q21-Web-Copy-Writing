import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from '@/lib/next-router-compat';
import { PublicNavbar } from '@/app/components/public/PublicNavbar';
import { PublicFooter } from '@/app/components/public/PublicFooter';
import { Badge } from '@/app/components/ui/badge';
import {
  CheckCircle2, X, Crown, Zap, Building2,
  Star, ChevronDown, ChevronUp,
} from 'lucide-react';
import { billingService, type BillingPlan } from '@/services/billingService';

/* ─── Data ─────────────────────────────────────────────────── */

const PLANS = [
  {
    id: 'free', name: 'Miễn Phí', icon: Zap, monthlyPrice: 0, yearlyPrice: 0,
    desc: 'Dành cho cá nhân muốn khám phá AI copywriting',
    color: 'border-border', accent: 'text-foreground/80', highlight: false,
    badge: '',
    features: [
      { text: '30 copy/tháng', ok: true },
      { text: '5 ngành nghề cơ bản', ok: true },
      { text: '20 template', ok: true },
      { text: 'GPT-3.5 Turbo', ok: true },
      { text: 'Lịch sử 7 ngày', ok: true },
      { text: 'GPT-4o & Llama 3.1', ok: false },
      { text: 'Fine-tuning Studio', ok: false },
      { text: 'API Access', ok: false },
      { text: 'Xuất file (.docx, .pdf)', ok: false },
      { text: 'Hỗ trợ ưu tiên', ok: false },
    ],
    cta: 'Bắt đầu miễn phí',
  },
  {
    id: 'pro', name: 'Pro', icon: Crown, monthlyPrice: 299000, yearlyPrice: 2990000,
    desc: 'Dành cho marketer & freelancer chuyên nghiệp',
    color: 'border-primary', accent: 'text-primary', highlight: true,
    badge: 'Phổ biến nhất',
    features: [
      { text: '500 copy/tháng', ok: true },
      { text: '15+ ngành nghề', ok: true },
      { text: '100+ template', ok: true },
      { text: 'GPT-4o + GPT-3.5 + Llama 3.1', ok: true },
      { text: 'Lịch sử 30 ngày', ok: true },
      { text: 'Fine-tuning Studio (3 models)', ok: true },
      { text: 'API Access (5.000 calls/tháng)', ok: true },
      { text: 'Xuất file (.docx, .txt)', ok: true },
      { text: 'Hỗ trợ email trong 24h', ok: true },
      { text: 'Dedicated CSM', ok: false },
    ],
    cta: 'Bắt đầu dùng Pro',
  },
  {
    id: 'business', name: 'Business', icon: Building2, monthlyPrice: 799000, yearlyPrice: 7990000,
    desc: 'Dành cho team và doanh nghiệp cần quota lớn, kiểm soát rõ ràng',
    color: 'border-border', accent: 'text-foreground/80', highlight: false,
    badge: '',
    features: [
      { text: '3.000 copy/tháng', ok: true },
      { text: '15+ ngành nghề', ok: true },
      { text: 'Tất cả template', ok: true },
      { text: 'Tất cả model AI (incl. custom)', ok: true },
      { text: 'Lịch sử 90 ngày', ok: true },
      { text: 'Fine-tuning nâng cao (10 models)', ok: true },
      { text: 'API Access (50.000 calls/tháng)', ok: true },
      { text: 'Xuất file (.docx, .pdf, .csv)', ok: true },
      { text: 'Hỗ trợ ưu tiên < 4 giờ + chat', ok: true },
      { text: 'Dedicated CSM + Onboarding', ok: true },
    ],
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
    { label: 'Seats', values: plans.map(plan => formatCompareLimit(plan.limits?.seats)) },
    { label: 'Lịch sử', values: plans.map(plan => formatCompareLimit(plan.limits?.historyDays, 'ngày')) },
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
    formatLimit(limits.seats, 'seats'),
    formatLimit(limits.historyDays, 'ngay lich su'),
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

const COMPARE_ROWS = [
  { label: 'Copy/tháng',             free: '30',              pro: '500',                business: '3.000' },
  { label: 'Ngành nghề',             free: '5',               pro: '15+',                business: '15+ & custom' },
  { label: 'Template library',       free: '20',              pro: '100+',               business: 'Tất cả' },
  { label: 'Model AI',               free: 'GPT-3.5',         pro: 'GPT-4o, 3.5, Llama', business: 'Tất cả + custom' },
  { label: 'Fine-tuning Studio',     free: null,              pro: '3 models',           business: '10 models' },
  { label: 'API Access (calls/tháng)',free: null,             pro: '5.000',              business: '50.000' },
  { label: 'Lịch sử copy',           free: '7 ngày',          pro: '30 ngày',            business: '90 ngày' },
  { label: 'Xuất file',              free: null,              pro: '.docx, .txt',        business: '.docx, .pdf, .csv' },
  { label: 'Hỗ trợ',                 free: 'Email (72h)',      pro: 'Email (24h)',        business: 'Email + Chat (4h)' },
  { label: 'Dedicated CSM',          free: null,              pro: null,                 business: true },
  { label: 'Onboarding riêng',       free: null,              pro: null,                 business: true },
];

const FAQ = [
  { q: 'Tôi có thể hủy gói bất kỳ lúc nào không?', a: 'Hoàn toàn có thể. Không hợp đồng ràng buộc. Hủy trong vài click từ trang Cài đặt. Bạn vẫn được dùng đến hết kỳ thanh toán hiện tại.' },
  { q: 'Fine-tuning mất bao lâu và khó không?', a: 'Không cần biết code. Bạn chỉ cần cung cấp 50-100 cặp ví dụ input/output. Training tự động mất khoảng 30-60 phút tùy dữ liệu.' },
  { q: 'API có ổn định không? SLA như thế nào?', a: 'Chúng tôi cam kết 99.8% uptime với SLA rõ ràng. API có rate limiting thông minh và retry logic tự động. Xem status page tại status.copypro.vn.' },
  { q: 'Có dùng thử gói Pro trước khi mua không?', a: 'Có. Tất cả tài khoản mới đều có 14 ngày dùng thử đầy đủ tính năng Pro, không cần thẻ tín dụng.' },
  { q: 'Dữ liệu của tôi có an toàn không?', a: 'Tuyệt đối. Chúng tôi không dùng nội dung của bạn để train model. Dữ liệu mã hóa AES-256, lưu trong datacenter Việt Nam, tuân thủ PDPA.' },
  { q: 'Gói Business có thể thêm thành viên không?', a: 'Gói Business hỗ trợ tối đa 10 user trong cùng workspace. Nếu cần nhiều hơn, liên hệ chúng tôi để được tư vấn giới hạn phù hợp trong 3 gói hiện có.' },
];

const TESTIMONIALS = [
  { name: 'Nguyễn Hồng Sơn', role: 'CMO – RetailX', text: 'ROI của chúng tôi là 520% sau 3 tháng. Copy chất lượng, không phải AI viết thứ vô hồn.', avatar: 'HS', rating: 5 },
  { name: 'Mai Thị Loan', role: 'Founder – Bloom Agency', text: 'Dùng Business plan cho 8 client cùng lúc. API integration với CMS tuyệt vời.', avatar: 'ML', rating: 5 },
  { name: 'Đinh Trọng Khải', role: 'Growth Lead – FoodTech', text: 'Fine-tuning với data ngành F&B cho ra copy ngon hơn cả copywriter thật. Không đùa.', avatar: 'TK', rating: 5 },
];

/* ─── Component ─────────────────────────────────────────────── */

export function PricingPage() {
  const navigate = useNavigate();
  const [yearly, setYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [plans, setPlans] = useState<PricingPlan[]>(PLANS);

  useEffect(() => {
    let active = true;
    billingService.listPlans()
      .then((items) => {
        if (active && items.length > 0) {
          setPlans(items
            .filter(plan => isSupportedPlanSlug(plan.slug))
            .sort((a, b) => getPlanOrder(a.slug) - getPlanOrder(b.slug))
            .map(toPricingPlan));
        }
      })
      .catch(() => undefined);

    return () => { active = false; };
  }, []);

  const compareRows = useMemo(() => {
    if (plans.every(plan => plan.limits)) return buildCompareRows(plans);
    return COMPARE_ROWS.map(row => ({ label: row.label, values: [row.free, row.pro, row.business] }));
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
    <div className="min-h-screen bg-card overflow-x-hidden">
      <PublicNavbar />

      {/* ─── HERO ─── */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-green-950 to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_-5%,rgba(34,197,94,0.15),transparent)]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative max-w-3xl mx-auto px-5 text-center">
          <Badge className="mb-6 bg-green-950/50 text-green-200 border border-green-700/40 px-4 py-1.5 text-sm">
            💳 Bảng giá minh bạch
          </Badge>
          <h1 className="text-white mb-5">
            Đầu tư vào copy = đầu tư vào{' '}
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              doanh thu
            </span>
          </h1>
          <p className="text-gray-300 text-xl leading-relaxed mb-10">
            Bắt đầu miễn phí, nâng cấp khi bạn sẵn sàng. Không phí ẩn, không hợp đồng ràng buộc.
          </p>

          {/* Toggle billing */}
          <div className="inline-flex items-center gap-4 bg-card/8 border border-white/15 rounded-2xl p-1.5 backdrop-blur">
            <button
              onClick={() => setYearly(false)}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${!yearly ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-300 hover:text-white'}`}
            >
              Hàng tháng
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${yearly ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-300 hover:text-white'}`}
            >
              Hàng năm
              {yearlyDiscountPercent > 0 && yearly && <Badge className="bg-primary/10 text-primary border-0 text-xs">-{yearlyDiscountPercent}%</Badge>}
              {yearlyDiscountPercent > 0 && !yearly && <span className="text-xs bg-primary/20 text-primary rounded-md px-2 py-0.5">-{yearlyDiscountPercent}%</span>}
            </button>
          </div>

          <div className="mx-auto mt-6 max-w-2xl rounded-xl border border-amber-300/30 bg-amber-950/25 px-4 py-3 text-sm leading-relaxed text-amber-100">
            Thông tin gói được lấy từ cấu hình hiện hành trong hệ thống. Thanh toán đang chạy qua VNPAY, ZaloPay và VietQR ở môi trường kiểm thử.
          </div>
        </div>
      </section>

      {/* ─── PRICING CARDS ─── */}
      <section className="pb-24 -mt-6">
        <div className="max-w-6xl mx-auto px-5 lg:px-8">
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
                      <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0 px-4 py-1.5 text-xs shadow-lg">
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
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg shadow-primary/20'
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

          <p className="text-center text-sm text-muted-foreground mt-8">
            Tất cả gói có 14 ngày dùng thử Pro miễn phí · Không cần thẻ tín dụng
          </p>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-20 bg-background border-y border-border">
        <div className="max-w-6xl mx-auto px-5 lg:px-8">
          <p className="text-center text-xs font-bold text-muted-foreground/80 uppercase tracking-widest mb-10">Khách hàng nói gì về CopyPro</p>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-card rounded-3xl p-6 border border-border hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-foreground/80 text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMPARE TABLE ─── */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-5 lg:px-8">
          <div className="text-center mb-14">
            <Badge className="mb-5 bg-primary/10 text-primary border-0 px-4 py-1.5">So sánh chi tiết</Badge>
            <h2 className="text-foreground">Tính năng đầy đủ theo từng gói</h2>
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
                          : val === true
                          ? <CheckCircle2 className="w-4 h-4 text-primary mx-auto" />
                          : <span className={`font-medium ${plans[j]?.highlight ? 'text-primary' : 'text-foreground/80'}`}>{val as string}</span>
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="pb-24">
        <div className="max-w-3xl mx-auto px-5 lg:px-8">
          <div className="text-center mb-14">
            <Badge className="mb-5 bg-primary/10 text-primary border-0 px-4 py-1.5">FAQ</Badge>
            <h2 className="text-foreground mb-3">Câu hỏi thường gặp</h2>
            <p className="text-muted-foreground">Không tìm thấy câu trả lời?{' '}
              <Link to="/contact" className="text-primary hover:underline font-semibold">Liên hệ chúng tôi.</Link>
            </p>
          </div>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <div
                key={i}
                className={`rounded-2xl border transition-all overflow-hidden ${openFaq === i ? 'border-green-300 shadow-md shadow-green-50' : 'border-border hover:border-primary/30'}`}
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
