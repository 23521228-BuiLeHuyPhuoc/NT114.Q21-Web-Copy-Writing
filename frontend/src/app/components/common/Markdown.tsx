import ReactMarkdown from 'react-markdown';
import { looksLikeHtml, sanitizeHtml } from '@/lib/richText';

export function Markdown({ children, className = '' }: { children: string; className?: string }) {
  if (looksLikeHtml(children)) {
    return (
      <div
        className={`rich-text rich-text--compact ${className}`}
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(children) }}
      />
    );
  }

  return (
    <div className={`rich-text rich-text--compact ${className}`}>
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );
}
