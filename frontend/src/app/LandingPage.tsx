import { useEffect, useState } from 'react';
import { useNavigate, Link } from '@/lib/next-router-compat';
import { PublicNavbar } from '@/app/components/public/PublicNavbar';
import { PublicFooter } from '@/app/components/public/PublicFooter';
import { AIDemoSection } from '@/app/components/public/AIDemoSection';
import { HeroGeneratorDemo } from '@/app/components/public/HeroGeneratorDemo';
import { Badge } from '@/app/components/ui/badge';
import { getPublicText } from '@/lib/publicSiteDefaults';
import { publicSiteService, type PublicPageContent } from '@/services/publicSiteService';
import {
  Sparkles, Wand2, FileText, ShoppingBag, Home,
  Cpu, Utensils, Stethoscope, GraduationCap, Star, CheckCircle2,
  ArrowRight, Zap, Users, Brain, Key, Play, BarChart3, Globe,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Wand2,
    title: 'AI Generator đa model',
    desc: 'Tạo headline, email, mô tả sản phẩm và social post bằng GPT-4o hoặc Llama 3.1.',
    accent: 'bg-primary/10 text-primary',
  },
  {
    icon: Brain,
    title: 'Fine-tuning Studio',
    desc: 'Huấn luyện AI theo giọng thương hiệu để nội dung nhất quán hơn giữa các chiến dịch.',
    accent: 'bg-primary/10 text-primary',
  },
  {
    icon: FileText,
    title: 'Template Library',
    desc: 'Bộ mẫu copy theo ngành, phù hợp cho quảng cáo, email, landing page và thương mại điện tử.',
    accent: 'bg-warning/15 text-amber-800',
  },
  {
    icon: Key,
    title: 'RESTful API',
    desc: 'Kết nối CopyPro vào CMS, website hoặc workflow tự động hóa của đội marketing.',
    accent: 'bg-primary/10 text-primary',
  },
];

const INDUSTRIES = [
  { icon: ShoppingBag, name: 'E-commerce', tone: 'bg-primary/10 text-primary' },
  { icon: Home, name: 'Bất động sản', tone: 'bg-warning/10 text-amber-800' },
  { icon: Cpu, name: 'Công nghệ', tone: 'bg-primary/10 text-primary' },
  { icon: Utensils, name: 'F&B', tone: 'bg-warning/10 text-amber-800' },
  { icon: Stethoscope, name: 'Y tế', tone: 'bg-destructive/10 text-destructive' },
  { icon: GraduationCap, name: 'Giáo dục', tone: 'bg-primary/10 text-primary' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Chọn loại nội dung', desc: 'Chọn mục tiêu như quảng cáo, email, mô tả sản phẩm hoặc landing page.', icon: FileText },
  { step: '02', title: 'Nhập thông tin sản phẩm', desc: 'Thêm điểm bán hàng, tệp khách hàng và từ khóa chính.', icon: Wand2 },
  { step: '03', title: 'Tạo nhiều phiên bản', desc: 'AI đề xuất nhiều hướng copy để bạn so sánh và chọn nhanh.', icon: Brain },
  { step: '04', title: 'Chỉnh sửa và dùng ngay', desc: 'Tinh chỉnh câu chữ, lưu lại hoặc đưa vào chiến dịch.', icon: CheckCircle2 },
];

const TESTIMONIALS = [
  {
    name: 'Trần Minh Khoa',
    role: 'CEO - Shopviet.vn',
    content: 'CopyPro giúp đội marketing tạo nội dung cho hàng trăm SKU nhanh hơn nhiều, trong khi giọng viết vẫn nhất quán.',
    avatar: 'TK',
  },
  {
    name: 'Lê Thị Hương',
    role: 'Marketing Director - PropVN',
    content: 'Fine-tuning giúp copy bất động sản đúng tone thương hiệu hơn, giảm rất nhiều thời gian biên tập lại.',
    avatar: 'LH',
  },
  {
    name: 'Phạm Đức Anh',
    role: 'Co-founder - TechStart VN',
    content: 'API tích hợp gọn vào workflow nội dung hiện tại. Team có thể scale chiến dịch mà không tăng thêm đầu việc thủ công.',
    avatar: 'PA',
  },
];

const STATS = [
  { value: '2,000+', label: 'doanh nghiệp tin dùng', icon: Users, tone: 'text-primary' },
  { value: '500K+', label: 'copy đã tạo', icon: BarChart3, tone: 'text-primary' },
  { value: '15+', label: 'ngành nghề hỗ trợ', icon: Globe, tone: 'text-amber-600' },
  { value: '< 2s', label: 'thời gian phản hồi', icon: Zap, tone: 'text-primary' },
];

export function LandingPage() {
  const navigate = useNavigate();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [homeContent, setHomeContent] = useState<PublicPageContent>({});

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress = scrollableHeight > 0
        ? Math.min(100, Math.max(0, (window.scrollY / scrollableHeight) * 100))
        : 0;

      setScrollProgress(nextProgress);
    };

    updateScrollProgress();
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    window.addEventListener('resize', updateScrollProgress);

    return () => {
      window.removeEventListener('scroll', updateScrollProgress);
      window.removeEventListener('resize', updateScrollProgress);
    };
  }, []);

  useEffect(() => {
    let active = true;
    publicSiteService.getPage('home')
      .then((page) => {
        if (active && page?.content) setHomeContent(page.content);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  const homeHeroBadge = getPublicText(homeContent, 'heroBadge', 'AI Copywriting cho doanh nghiệp Việt');
  const homeHeroTitle = getPublicText(homeContent, 'heroTitle', 'Tạo copy marketing rõ ý, đúng giọng thương hiệu');
  const homeHeroDescription = getPublicText(homeContent, 'heroDescription', 'CopyPro giúp đội marketing tạo headline, email, landing page và social post trong vài giây, có thể tinh chỉnh theo ngành và thương hiệu.');
  const homePrimaryCta = getPublicText(homeContent, 'primaryCta', 'Dùng thử miễn phí');
  const homeSecondaryCta = getPublicText(homeContent, 'secondaryCta', 'Xem cách hoạt động');

  return (
    <div className="min-h-screen overflow-x-hidden bg-card">
      <div className="pointer-events-none fixed left-0 right-0 top-0 z-[70] h-1 bg-transparent" aria-hidden="true">
        <div
          className="h-full origin-left bg-gradient-to-r from-green-400 via-emerald-500 to-amber-400 shadow-[0_0_18px_rgba(47,182,93,0.45)] transition-transform duration-150 ease-out will-change-transform"
          style={{ transform: `scaleX(${scrollProgress / 100})` }}
        />
      </div>
      <PublicNavbar />

      <section className="relative pt-28 pb-16 md:pt-32 md:pb-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_-10%,rgba(34,197,94,0.18),transparent)]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="text-center lg:col-span-5 lg:text-left">
              <Badge className="mb-5 border border-green-700/40 bg-green-950/45 px-4 py-1.5 text-sm text-green-200">
                {homeHeroBadge}
              </Badge>
              <h1 className="mb-6 text-white leading-[1.08]">
                {homeHeroTitle}
              </h1>
              <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-muted-foreground/60 lg:mx-0 lg:text-lg">
                {homeHeroDescription}
              </p>

              <div className="mb-7 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                <button
                  onClick={() => navigate('/register')}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all hover:from-green-400 hover:to-emerald-400"
                >
                  <Sparkles className="h-4 w-4" />
                  {homePrimaryCta}
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => navigate('/about')}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/25 bg-card/10 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-card/15"
                >
                  <Play className="h-4 w-4" />
                  {homeSecondaryCta}
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground/80 lg:justify-start">
                <span className="flex items-center gap-1.5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
                  4.9/5
                </span>
                <span className="hidden text-white/20 sm:inline">|</span>
                <span><span className="font-semibold text-white">2,000+</span> doanh nghiệp</span>
                <span className="hidden text-white/20 sm:inline">|</span>
                <span>Không cần thẻ tín dụng</span>
              </div>
            </div>

            <div className="w-full min-w-0 lg:col-span-7">
              <HeroGeneratorDemo />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-card py-10">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {STATS.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="rounded-lg border border-border bg-card p-5 text-center">
                  <Icon className={`mx-auto mb-3 h-5 w-5 ${stat.tone}`} />
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <AIDemoSection />

      <section className="bg-card py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <Badge className="mb-4 border-0 bg-primary/10 px-4 py-1.5 text-sm text-primary">Tính năng</Badge>
            <h2 className="mb-4 text-foreground">Những công cụ cần thiết để sản xuất copy nhanh hơn</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Tập trung vào các năng lực chính, dễ hiểu và sát nhu cầu vận hành nội dung hằng ngày.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="rounded-lg border border-border bg-card p-6 shadow-sm transition-colors hover:border-primary/20">
                  <div className={`mb-5 inline-flex rounded-lg p-3 ${feature.accent}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-3 text-base text-foreground">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-surface-muted py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
            <Badge className="mb-4 border-0 bg-primary/10 px-4 py-1.5 text-sm text-primary">Quy trình</Badge>
              <h2 className="mb-4 text-foreground">Từ ý tưởng đến copy hoàn chỉnh trong 4 bước</h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                Luồng làm việc ngắn gọn để người không chuyên copywriting vẫn có thể tạo nội dung dùng được ngay.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {HOW_IT_WORKS.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.step} className="rounded-lg border border-border bg-card p-5 shadow-sm">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
                        {step.step}
                      </div>
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="mb-2 text-base text-foreground">{step.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-card py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <Badge className="mb-4 border-0 bg-warning/15 px-4 py-1.5 text-sm text-amber-700">Ngành nghề</Badge>
            <h2 className="mb-4 text-foreground">Tối ưu cho các lĩnh vực dùng copy thường xuyên</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Mỗi ngành có cách nói, điểm đau và lời kêu gọi hành động khác nhau. CopyPro giúp bạn bắt đầu đúng hướng nhanh hơn.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {INDUSTRIES.map((industry) => {
              const Icon = industry.icon;
              return (
                <div key={industry.name} className="rounded-lg border border-border bg-card p-5 text-center shadow-sm">
                  <div className={`mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg ${industry.tone}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">{industry.name}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-surface-muted py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <Badge className="mb-4 border-0 bg-warning/15 px-4 py-1.5 text-sm text-amber-700">Phản hồi</Badge>
            <h2 className="mb-4 text-foreground">Đội marketing dùng CopyPro để giảm việc lặp lại</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((item) => (
              <div key={item.name} className="flex h-full flex-col rounded-lg border border-border bg-card p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="mb-6 flex-1 text-sm leading-relaxed text-foreground/70">"{item.content}"</p>
                <div className="flex items-center gap-3 border-t border-border pt-5">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-green-600 to-amber-500 text-sm font-bold text-white">
                    {item.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-20 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,rgba(245,158,11,0.14),transparent)]" />

        <div className="relative mx-auto max-w-3xl px-5 text-center lg:px-8">
          <Badge className="mb-5 border border-amber-700/40 bg-amber-950/40 px-4 py-1.5 text-sm text-amber-200">
            Sẵn sàng bắt đầu?
          </Badge>
          <h2 className="mb-5 text-white">Tạo copy chuyên nghiệp nhanh hơn, gọn hơn</h2>
          <p className="mb-8 text-base leading-relaxed text-muted-foreground/60">
            Dùng thử miễn phí, không cần thẻ tín dụng. Bắt đầu với template có sẵn và tinh chỉnh theo thương hiệu của bạn.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <button
              onClick={() => navigate('/register')}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/30 transition-colors hover:from-green-400 hover:to-emerald-400"
            >
              <Sparkles className="h-4 w-4" />
              Bắt đầu miễn phí
              <ArrowRight className="h-4 w-4" />
            </button>
            <Link to="/pricing">
              <button className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 px-8 py-3.5 text-sm font-semibold text-white/85 transition-colors hover:bg-card/10 hover:text-white sm:w-auto">
                Xem bảng giá
              </button>
            </Link>
          </div>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground/80">
            {['Setup trong 2 phút', 'Hủy bất kỳ lúc nào', 'Hỗ trợ tiếng Việt'].map((item) => (
              <span key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" /> {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
