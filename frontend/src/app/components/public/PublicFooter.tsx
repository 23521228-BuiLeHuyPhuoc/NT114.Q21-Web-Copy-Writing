import { useEffect, useState } from 'react';
import { Link } from '@/lib/next-router-compat';
import { ArrowUpRight, Mail } from 'lucide-react';
import { BrandLogo } from '@/app/components/BrandLogo';
import { PublicRichText } from '@/app/components/public/PublicRichText';
import { getPublicText } from '@/lib/publicSiteDefaults';
import { PUBLIC_SUPPORT_EMAIL } from '@/lib/publicEnv';
import { publicSiteService, type PublicPageContent } from '@/services/publicSiteService';

const FOOTER_LINKS = [
  { label: 'Tạo nội dung', href: '/generate' },
  { label: 'Mẫu copy', href: '/templates' },
  { label: 'Bảng giá', href: '/pricing' },
  { label: 'Giới thiệu', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Liên hệ', href: '/contact' },
];

export function PublicFooter() {
  const [footerContent, setFooterContent] = useState<PublicPageContent>({});

  useEffect(() => {
    let active = true;
    publicSiteService.getPage('footer')
      .then((page) => {
        if (active && page?.content) setFooterContent(page.content);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  const footerCtaTitle = getPublicText(footerContent, 'ctaTitle', 'Một brief tốt xứng đáng có nhiều hơn một bản nháp.');
  const footerCtaDescription = getPublicText(footerContent, 'ctaDescription', 'Đưa ý tưởng, ngữ cảnh và giọng thương hiệu vào cùng một không gian biên tập.');
  const footerBrandDescription = getPublicText(footerContent, 'brandDescription', 'CopyPro là studio AI hỗ trợ đội ngũ nội dung đi từ brief đến bản copy có thể tiếp tục chỉnh sửa, lưu trữ và quản lý.');
  const footerEmail = getPublicText(footerContent, 'email', PUBLIC_SUPPORT_EMAIL);
  const footerCopyright = getPublicText(footerContent, 'copyright', '© 2026 CopyPro.');

  return (
    <footer className="border-t-2 border-foreground bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
        <div className="grid gap-10 border-b border-background/20 pb-12 lg:grid-cols-[1.25fr_.75fr] lg:items-end">
          <div>
            <p className="editorial-kicker mb-5 text-accent">Bắt đầu một bản thảo</p>
            <h2 className="max-w-3xl text-background">{footerCtaTitle}</h2>
            <PublicRichText
              content={footerContent}
              field="ctaDescription"
              fallback={footerCtaDescription}
              className="mt-5 max-w-2xl text-sm leading-7 text-background/65 [&_a]:text-accent [&_a]:underline"
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <Link to="/register" className="inline-flex h-12 items-center justify-center gap-2 border-2 border-accent bg-accent px-6 text-sm font-bold text-foreground transition-transform hover:-translate-y-1">
              Mở studio <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link to="/pricing" className="inline-flex h-12 items-center justify-center border border-background/35 px-6 text-sm font-bold text-background hover:bg-background/10">
              Xem gói sử dụng
            </Link>
          </div>
        </div>

        <div className="grid gap-9 pt-10 md:grid-cols-[1.2fr_.8fr_.8fr]">
          <div>
            <Link to="/" className="inline-flex"><BrandLogo size="lg" tone="light" /></Link>
            <PublicRichText
              content={footerContent}
              field="brandDescription"
              fallback={footerBrandDescription}
              className="mt-5 max-w-md text-sm leading-7 text-background/60 [&_a]:text-accent [&_a]:underline"
            />
          </div>
          <div>
            <p className="font-mono-editorial text-[10px] font-bold uppercase tracking-[.18em] text-background/45">Điều hướng</p>
            <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3">
              {FOOTER_LINKS.map((link) => (
                <Link key={link.href} to={link.href} className="text-sm text-background/70 hover:text-accent">{link.label}</Link>
              ))}
            </div>
          </div>
          <div>
            <p className="font-mono-editorial text-[10px] font-bold uppercase tracking-[.18em] text-background/45">Hỗ trợ</p>
            <a href={`mailto:${footerEmail}`} className="mt-4 inline-flex items-center gap-2 text-sm text-background/70 hover:text-accent">
              <Mail className="h-4 w-4" /> {footerEmail}
            </a>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-background/20 pt-5 font-mono-editorial text-[10px] uppercase tracking-[.13em] text-background/45 sm:flex-row sm:items-center sm:justify-between">
          <span>{footerCopyright}</span>
          <span>Creative editorial studio · Vietnamese first</span>
        </div>
      </div>
    </footer>
  );
}
