import { useEffect, useState } from 'react';
import { ArrowDownRight, ArrowRight, Check, FileText, Layers3, Wand2 } from 'lucide-react';
import { useNavigate } from '@/lib/next-router-compat';
import { PublicNavbar } from '@/app/components/public/PublicNavbar';
import { PublicFooter } from '@/app/components/public/PublicFooter';
import { AIDemoSection } from '@/app/components/public/AIDemoSection';
import { PublicRichText } from '@/app/components/public/PublicRichText';
import { EditorialGlyph, ManuscriptHeroArtwork } from '@/app/components/EditorialArtwork';
import { getPublicText } from '@/lib/publicSiteDefaults';
import { publicSiteService, type PublicPageContent } from '@/services/publicSiteService';

const CAPABILITIES = [
  {
    index: '01',
    glyph: 'manuscript' as const,
    title: 'Từ brief đến bản nháp',
    desc: 'Tổ chức mục tiêu, sản phẩm, đối tượng và ngữ cảnh thành một brief rõ ràng trước khi gọi model.',
  },
  {
    index: '02',
    glyph: 'cursor' as const,
    title: 'Chọn hướng, không chọn bừa',
    desc: 'So sánh nhiều phiên bản, chất lượng và độ tương đồng ngay trong cùng vùng kết quả.',
  },
  {
    index: '03',
    glyph: 'pen' as const,
    title: 'Biên tập ngay tại chỗ',
    desc: 'Chuyển giữa xem trước và rich text editor, rồi sao chép, tải xuống hoặc tạo lại khi cần.',
  },
  {
    index: '04',
    glyph: 'card' as const,
    title: 'Đưa vào hệ thống nội dung',
    desc: 'Lưu bản đã chọn vào thư viện, gắn dự án, dùng lại template và theo dõi nội dung lâu dài.',
  },
];

const WORKFLOW = [
  { step: 'Brief', note: 'Mục tiêu · sản phẩm · người đọc', icon: FileText },
  { step: 'Generate', note: 'Model · tone · số phiên bản', icon: Wand2 },
  { step: 'Editorial', note: 'So sánh · sửa · kiểm tra', icon: Layers3 },
  { step: 'Publish', note: 'Lưu · dự án · tái sử dụng', icon: Check },
];

const USE_CASES = ['Quảng cáo', 'Email marketing', 'Landing page', 'Mô tả sản phẩm', 'Social post', 'Blog SEO'];

export function LandingPage() {
  const navigate = useNavigate();
  const [homeContent, setHomeContent] = useState<PublicPageContent>({});

  useEffect(() => {
    let active = true;
    publicSiteService.getPage('home')
      .then((page) => {
        if (active && page?.content) setHomeContent(page.content);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  const homeHeroBadge = getPublicText(homeContent, 'heroBadge', 'Creative Editorial Studio / AI');
  const homeHeroTitle = getPublicText(homeContent, 'heroTitle', 'Viết nhanh bằng AI. Biên tập như một studio.');
  const homeHeroDescription = getPublicText(homeContent, 'heroDescription', 'CopyPro giúp đội ngũ nội dung biến brief thành nhiều hướng copy, tiếp tục chỉnh sửa và quản lý bản đã chọn trong một quy trình liền mạch.');
  const homePrimaryCta = getPublicText(homeContent, 'primaryCta', 'Bắt đầu bản thảo');
  const homeSecondaryCta = getPublicText(homeContent, 'secondaryCta', 'Xem cách hoạt động');

  return (
    <div className="public-page min-h-screen overflow-x-hidden">
      <PublicNavbar />

      <main>
        <section className="relative overflow-hidden border-b-2 border-foreground pt-28 md:pt-32">
          <div className="pointer-events-none absolute -left-20 top-36 h-44 w-44 rounded-full border-[28px] border-primary/10" />
          <div className="pointer-events-none absolute right-0 top-20 h-24 w-1/3 bg-accent/25 [clip-path:polygon(10%_0,100%_0,100%_100%,0_70%)]" />

          <div className="relative mx-auto grid max-w-7xl gap-10 px-5 pb-14 lg:grid-cols-[.92fr_1.08fr] lg:items-center lg:px-8 lg:pb-20">
            <div className="editorial-reveal relative z-10 py-4 lg:py-12">
              <p className="editorial-kicker mb-7 text-primary">{homeHeroBadge}</p>
              <h1 className="max-w-3xl text-foreground">{homeHeroTitle}</h1>
              <div className="my-7 h-2 w-32 -rotate-1 bg-accent" />
              <PublicRichText
                content={homeContent}
                field="heroDescription"
                fallback={homeHeroDescription}
                className="max-w-xl text-base leading-8 text-muted-foreground md:text-lg [&_a]:text-primary [&_a]:underline [&_strong]:text-foreground"
              />

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => navigate('/register')}
                  className="inline-flex h-13 items-center justify-center gap-2 border-2 border-foreground bg-primary px-7 text-sm font-bold text-primary-foreground shadow-[5px_5px_0_#172033] transition-transform hover:-translate-y-1"
                >
                  {homePrimaryCta} <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => document.getElementById('workflow')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex h-13 items-center justify-center gap-2 border-2 border-foreground bg-card px-7 text-sm font-bold text-foreground transition-colors hover:bg-accent/45"
                >
                  {homeSecondaryCta} <ArrowDownRight className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-2 font-mono-editorial text-[10px] font-bold uppercase tracking-[.13em] text-muted-foreground">
                <span>Tiếng Việt có dấu</span><span>•</span><span>Nhiều model AI</span><span>•</span><span>Rich text editor</span>
              </div>
            </div>

            <div className="editorial-reveal-delay lg:-mr-10">
              <ManuscriptHeroArtwork />
            </div>
          </div>

          <div className="border-t-2 border-foreground bg-foreground text-background">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center px-5 py-3 lg:px-8">
              <span className="mr-6 font-mono-editorial text-[10px] font-bold uppercase tracking-[.18em] text-accent">Bàn biên tập cho</span>
              {USE_CASES.map((item) => <span key={item} className="border-l border-background/25 px-4 py-1 text-xs font-semibold text-background/75">{item}</span>)}
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-card py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:items-start">
              <div className="lg:sticky lg:top-28">
                <p className="editorial-kicker text-primary">Năng lực cốt lõi</p>
                <h2 className="mt-5 max-w-md text-foreground">Không chỉ tạo chữ. Tạo một quy trình biên tập.</h2>
                <p className="mt-5 max-w-md text-sm leading-7 text-muted-foreground">Mỗi công cụ nằm đúng vị trí trong vòng đời nội dung: chuẩn bị brief, tạo phương án, biên tập và đưa vào kho làm việc.</p>
              </div>

              <div className="grid border-l border-t border-foreground md:grid-cols-2">
                {CAPABILITIES.map((item) => (
                  <article key={item.index} className="group min-h-64 border-b border-r border-foreground bg-background p-6 transition-colors hover:bg-accent/20 md:p-8">
                    <div className="flex items-start justify-between">
                      <EditorialGlyph kind={item.glyph} className="text-foreground transition-transform group-hover:-rotate-6 group-hover:scale-110" />
                      <span className="font-mono-editorial text-xs font-bold text-primary">/{item.index}</span>
                    </div>
                    <h3 className="mt-10 text-2xl text-foreground">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.desc}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="workflow" className="relative overflow-hidden border-b-2 border-foreground bg-accent py-16 md:py-20">
          <div className="paper-grid absolute inset-0 opacity-40" />
          <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="editorial-kicker text-foreground">Luồng làm việc</p>
                <h2 className="mt-5 max-w-2xl text-foreground">Một đường thẳng từ ý tưởng đến nội dung có thể dùng.</h2>
              </div>
              <p className="max-w-md text-sm leading-7 text-foreground/70">Giữ đầy đủ tùy chọn chuyên sâu, nhưng trình bày theo thứ tự ra quyết định để người dùng không phải dò từng card rời rạc.</p>
            </div>

            <div className="mt-12 grid border-2 border-foreground bg-card md:grid-cols-4">
              {WORKFLOW.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={item.step} className="relative border-b border-foreground p-5 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
                    <div className="flex items-center justify-between">
                      <Icon className="h-5 w-5 text-primary" />
                      <span className="font-mono-editorial text-[10px] font-bold text-muted-foreground">0{index + 1}</span>
                    </div>
                    <p className="mt-8 font-display text-2xl font-bold text-foreground">{item.step}</p>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">{item.note}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <div className="bg-background [&>section]:border-b-2 [&>section]:border-foreground">
          <AIDemoSection />
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
