import { useEffect, useState } from 'react';
import { ArrowRight, Braces, FileCheck2, Layers3, SlidersHorizontal } from 'lucide-react';
import { Link } from '@/lib/next-router-compat';
import { PublicNavbar } from '@/app/components/public/PublicNavbar';
import { PublicFooter } from '@/app/components/public/PublicFooter';
import { PublicRichText } from '@/app/components/public/PublicRichText';
import { EditorialGlyph, ManuscriptHeroArtwork } from '@/app/components/EditorialArtwork';
import { getPublicText } from '@/lib/publicSiteDefaults';
import { publicSiteService, type PublicPageContent } from '@/services/publicSiteService';

const PRINCIPLES = [
  { marker: 'A', title: 'Brief trước, model sau', desc: 'Chất lượng đầu ra bắt đầu từ ngữ cảnh. CopyPro đặt mục tiêu, người đọc và thông tin sản phẩm trước lựa chọn kỹ thuật.' },
  { marker: 'B', title: 'AI đề xuất, người viết quyết định', desc: 'Nhiều phiên bản giúp mở hướng. Editor, đánh giá chất lượng và thao tác lưu giúp người dùng giữ quyền kiểm soát bản cuối.' },
  { marker: 'C', title: 'Nội dung là tài sản có tổ chức', desc: 'Bản copy không biến mất sau một lần generate. Nội dung, template và dự án tạo thành một kho làm việc có thể tìm và dùng lại.' },
];

const SYSTEM_PARTS = [
  { icon: SlidersHorizontal, title: 'Brief có cấu trúc', desc: 'Ngành, loại copy, tone, độ dài, từ khóa, đối tượng và ngữ cảnh.' },
  { icon: Braces, title: 'Model linh hoạt', desc: 'Model gốc hoặc fine-tuned được chọn theo quyền truy cập và gói hiện tại.' },
  { icon: FileCheck2, title: 'Vùng biên tập', desc: 'Xem trước, chỉnh rich text, sao chép, tải xuống, lưu và tạo lại.' },
  { icon: Layers3, title: 'Kho nội dung', desc: 'Quản lý nội dung theo dự án, trạng thái, template và lịch sử sử dụng.' },
];

export function AboutPage() {
  const [aboutContent, setAboutContent] = useState<PublicPageContent>({});

  useEffect(() => {
    let active = true;
    publicSiteService.getPage('about')
      .then((page) => {
        if (active && page?.content) setAboutContent(page.content);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  const heroBadge = getPublicText(aboutContent, 'heroBadge', 'Về CopyPro');
  const heroTitle = getPublicText(aboutContent, 'heroTitle', 'AI copywriting cần một bàn biên tập, không chỉ một ô prompt.');
  const heroDescription = getPublicText(aboutContent, 'heroDescription', 'CopyPro được xây dựng như một creative editorial studio: nơi brief, model AI, bản nháp và công cụ quản lý nội dung nằm trong cùng một quy trình.');
  const missionTitle = getPublicText(aboutContent, 'missionTitle', 'Giảm phần việc lặp lại, giữ lại phần việc cần tư duy.');
  const missionDescription = getPublicText(aboutContent, 'missionDescription', 'Mục tiêu của CopyPro là giúp người làm nội dung dành ít thời gian hơn cho trang trắng và nhiều thời gian hơn cho lựa chọn thông điệp, chỉnh giọng viết và hoàn thiện bản cuối.');

  return (
    <div className="public-page min-h-screen">
      <PublicNavbar />

      <section className="relative overflow-hidden pt-28 md:pt-32">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 pb-16 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:px-8 lg:pb-20">
          <div className="editorial-reveal py-8">
            <p className="editorial-kicker text-primary">{heroBadge}</p>
            <h1 className="type-hero mt-6 max-w-3xl text-foreground">{heroTitle}</h1>
            <PublicRichText
              content={aboutContent}
              field="heroDescription"
              fallback={heroDescription}
              className="mt-7 max-w-xl text-base leading-8 text-muted-foreground [&_a]:text-primary [&_a]:underline [&_strong]:text-foreground"
            />
          </div>
          <ManuscriptHeroArtwork className="editorial-reveal-delay scale-90" />
        </div>
      </section>

      <section className="border-b-2 border-foreground bg-foreground py-16 text-background md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[.78fr_1.22fr] lg:px-8">
          <div>
            <EditorialGlyph kind="quote" className="h-16 w-16 text-background" />
            <h2 className="type-public-title mt-6 max-w-lg text-background">{missionTitle}</h2>
          </div>
          <PublicRichText
            content={aboutContent}
            field="missionDescription"
            fallback={missionDescription}
            className="self-end border-l border-background/25 pl-6 text-lg leading-9 text-background/70 [&_a]:text-accent [&_a]:underline [&_strong]:text-background"
          />
        </div>
      </section>

      <section className="border-b border-border py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[.6fr_1.4fr]">
            <div>
              <p className="editorial-kicker text-primary">Nguyên tắc sản phẩm</p>
              <p className="mt-5 max-w-sm text-sm leading-7 text-muted-foreground">Ba nguyên tắc này định hình cách các màn hình và luồng làm việc của CopyPro được tổ chức.</p>
            </div>
            <div className="border-t-2 border-foreground">
              {PRINCIPLES.map((item) => (
                <article key={item.marker} className="grid gap-4 border-b border-foreground py-7 md:grid-cols-[72px_.8fr_1.2fr] md:items-start">
                  <span className="font-display text-4xl font-bold text-primary">{item.marker}.</span>
                  <h3 className="text-xl text-foreground md:text-2xl">{item.title}</h3>
                  <p className="text-sm leading-7 text-muted-foreground">{item.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="paper-grid border-b-2 border-foreground bg-accent/70 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="max-w-2xl">
            <p className="editorial-kicker text-foreground">Một hệ thống hoàn chỉnh</p>
            <h2 className="type-public-title mt-5 text-foreground">Mỗi phần có một vai trò rõ trong quy trình nội dung.</h2>
          </div>
          <div className="mt-10 grid border-2 border-foreground bg-card md:grid-cols-2 lg:grid-cols-4">
            {SYSTEM_PARTS.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="border-b border-foreground p-6 last:border-b-0 md:border-r md:[&:nth-child(2)]:border-r-0 lg:border-b-0 lg:[&:nth-child(2)]:border-r lg:last:border-r-0">
                  <Icon className="h-6 w-6 text-primary" />
                  <h3 className="mt-8 text-xl text-foreground">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.desc}</p>
                </article>
              );
            })}
          </div>
          <Link to="/register" className="mt-10 inline-flex h-12 items-center gap-2 border-2 border-foreground bg-primary px-6 text-sm font-bold text-primary-foreground shadow-[4px_4px_0_#172033] hover:-translate-y-1">
            Bắt đầu với một brief <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
