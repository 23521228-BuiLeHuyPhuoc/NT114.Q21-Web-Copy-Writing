import ReactMarkdown from 'react-markdown';
import { looksLikeHtml, sanitizeHtml } from '@/lib/richText';

export function Markdown({ children, className = '' }: { children: string; className?: string }) {
  if (looksLikeHtml(children)) {
    return (
      <div
        className={`prose prose-sm max-w-none prose-headings:font-semibold prose-headings:text-foreground prose-p:text-foreground/80 prose-strong:text-foreground prose-a:text-primary prose-li:text-foreground/80 ${className}`}
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(children) }}
      />
    );
  }

  return (
    <div className={`prose prose-sm max-w-none prose-headings:font-semibold prose-headings:text-foreground prose-p:text-foreground/80 prose-strong:text-foreground prose-a:text-primary prose-li:text-foreground/80 ${className}`}>
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );
}
