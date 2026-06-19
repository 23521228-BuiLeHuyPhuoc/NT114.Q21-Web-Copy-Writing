import { getPublicHtml } from '@/lib/publicSiteDefaults';
import type { PublicPageContent } from '@/services/publicSiteService';

interface PublicRichTextProps {
  content: PublicPageContent | undefined;
  field: string;
  fallback: string;
  className?: string;
}

export function PublicRichText({ content, field, fallback, className }: PublicRichTextProps) {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: getPublicHtml(content, field, fallback) }}
    />
  );
}
