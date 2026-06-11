import { useState } from 'react';
import { useNavigate, Link } from '@/lib/next-router-compat';
import { PublicNavbar } from '@/app/components/public/PublicNavbar';
import { PublicFooter } from '@/app/components/public/PublicFooter';
import { Badge } from '@/app/components/ui/badge';
import {
  Sparkles, CheckCircle2, X, Crown, Zap, Building2,
  Star, ChevronDown, ChevronUp, ArrowRight, HelpCircle,
} from 'lucide-react';

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
    id: 'pro', name: 'Pro', icon: Crown, monthlyPrice: 299000, yearlyPrice: 249000,
    desc: 'Dành cho marketer & freelancer chuyên nghiệp',
    color: 'border-primary', accent: 'text-primary', highlight: true,
    badge: 'Phổ biến nhất',
    features: [
      { text: '500 copy/tháng', ok: true },
      { text: '15+ ngành nghề', ok: true },
      { text: '100+ template', ok: true },
      { text: 'GPT-4o + GPT-3.5 + Llama 3.1', ok: true },
      { text: 'Lịch sử không giới hạn', ok: true },
      { text: 'Fine-tuning Studio (3 models)', ok: true },
      { text: 'API Access (5.000 calls/tháng)', ok: true },
      { text: 'Xuất file (.docx, .txt)', ok: true },
      { text: 'Hỗ trợ email trong 24h', ok: true },
      { text: 'Dedicated CSM', ok: false },
    ],
    cta: 'Bắt đầu dùng Pro',
  },
  {
    id: 'business', name: 'Business', icon: Building2, monthlyPrice: 799000, yearlyPrice: 665000,
    desc: 'Dành cho team và doanh nghiệp muốn scale không giới hạn',
    color: 'border-border', accent: 'text-foreground/80', highlight: false,
    badge: '',
    features: [
      { text: 'Không giới hạn copy', ok: true },
      { text: '15+ ngành nghề', ok: true },
      { text: 'Tất cả template', ok: true },
      { text: 'Tất cả model AI (incl. custom)', ok: true },
      { text: 'Lịch sử không giới hạn', ok: true },
      { text: 'Fine-tuning nâng cao (unlimited)', ok: true },
      { text: 'API Access (50.000 calls/tháng)', ok: true },
      { text: 'Xuất file (.docx, .pdf, .csv)', ok: true },
      { text: 'Hỗ trợ ưu tiên < 4 giờ + chat', ok: true },
      { text: 'Dedicated CSM + Onboarding', ok: true },
    ],
    cta: 'Liên hệ dùng Business',
  },
];

const COMPARE_ROWS = [
  { label: 'Copy/tháng',             free: '30',              pro: '500',                business: 'Không giới hạn' },
  { label: 'Ngành nghề',             free: '5',               pro: '15+',                business: '15+ & custom' },
  { label: 'Template library',       free: '20',              pro: '100+',               business: 'Tất cả' },
  { label: 'Model AI',               free: 'GPT-3.5',         pro: 'GPT-4o, 3.5, Llama', business: 'Tất cả + custom' },
  { label: 'Fine-tuning Studio',     free: null,              pro: '3 models',           business: 'Không giới hạn' },
  { label: 'API Access (calls/tháng)',free: null,             pro: '5.000',              business: '50.000' },
  { label: 'Lịch sử copy',           free: '7 ngày',          pro: 'Không giới hạn',     business: 'Không giới hạn' },
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
  { q: 'Gói Business có thể thêm thành viên không?', a: 'Gói Business hỗ trợ tối đa 10 user trong cùng workspace. Nếu cần nhiều hơn, liên hệ chúng tôi để nhận báo giá Enterprise.' },
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

  const formatPrice = (p: number) => p === 0 ? 'Miễn phí' : `${(p / 1000).toFixed(0)}K₫`;

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
              {yearly && <Badge className="bg-primary/10 text-primary border-0 text-xs">-17%</Badge>}
              {!yearly && <span className="text-xs bg-primary/20 text-primary rounded-md px-2 py-0.5">-17%</span>}
            </button>
          </div>

          <div className="mx-auto mt-6 max-w-2xl rounded-xl border border-amber-300/30 bg-amber-950/25 px-4 py-3 text-sm leading-relaxed text-amber-100">
            MVP demo: cac goi hien chi dung de chon luong dang ky hoac lien he tu van. He thong chua ket noi thanh toan tu dong hay Stripe production.
          </div>
        </div>
      </section>

      {/* ─── PRICING CARDS ─── */}
      <section className="pb-24 -mt-6">
        <div className="max-w-6xl mx-auto px-5 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6 items-start">
            {PLANS.map(plan => {
              const Icon = plan.icon;
              const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;
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
                    {price === 0 ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-foreground tracking-tight">Miễn phí</span>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold text-foreground tracking-tight">{(price / 1000).toFixed(0)}K</span>
                          <span className="text-muted-foreground/80 text-sm">₫ / tháng</span>
                        </div>
                        {yearly && (
                          <p className="text-sm text-primary font-medium mt-1">
                            Thanh toán {((price * 12) / 1000).toFixed(0)}K₫ / năm
                          </p>
                        )}
                        {!yearly && plan.yearlyPrice > 0 && (
                          <p className="text-xs text-muted-foreground/80 mt-1">
                            Tiết kiệm {(((plan.monthlyPrice - plan.yearlyPrice) * 12) / 1000).toFixed(0)}K₫/năm khi trả theo năm
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => navigate(plan.id === 'business' ? '/contact' : '/register')}
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
                  {PLANS.map(p => (
                    <th key={p.id} className={`px-4 py-4 text-sm font-bold text-center ${p.highlight ? 'text-primary bg-primary/5' : 'text-foreground/80'}`}>
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((row, i) => (
                  <tr key={i} className={`border-b border-border ${i % 2 === 0 ? 'bg-card' : 'bg-background/50'}`}>
                    <td className="px-6 py-4 text-sm text-foreground/80 font-medium">{row.label}</td>
                    {([row.free, row.pro, row.business] as (string | boolean | null)[]).map((val, j) => (
                      <td key={j} className={`px-4 py-4 text-center text-sm ${PLANS[j].highlight ? 'bg-primary/5' : ''}`}>
                        {val === null
                          ? <X className="w-4 h-4 text-muted-foreground/60 mx-auto" />
                          : val === true
                          ? <CheckCircle2 className="w-4 h-4 text-primary mx-auto" />
                          : <span className={`font-medium ${PLANS[j].highlight ? 'text-primary' : 'text-foreground/80'}`}>{val as string}</span>
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

      {/* ─── ENTERPRISE CTA ─── */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-emerald-700 mx-5 lg:mx-8 xl:mx-16 rounded-3xl mb-24">
        <div className="max-w-4xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <Badge className="mb-3 bg-card/20 text-white border-white/20">Enterprise</Badge>
            <h2 className="text-white mb-2">Cần hơn 10 user hoặc quota đặc biệt?</h2>
            <p className="text-green-100 text-sm leading-relaxed">
              Chúng tôi xây dựng gói Enterprise tùy chỉnh theo nhu cầu: SSO, private deployment, SLA riêng, và dedicated support team.
            </p>
          </div>
          <Link to="/contact" className="flex-shrink-0">
            <button className="inline-flex items-center gap-2 bg-card text-primary rounded-2xl px-8 py-4 font-bold text-sm hover:bg-primary/5 transition-colors shadow-xl whitespace-nowrap">
              Liên hệ tư vấn <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
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
