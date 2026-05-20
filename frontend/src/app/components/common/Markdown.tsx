import ReactMarkdown from 'react-markdown';

export function Markdown({ children, className = '' }: { children: string; className?: string }) {
  return (
    <div className={`prose prose-sm max-w-none prose-headings:font-semibold prose-headings:text-foreground prose-p:text-foreground/80 prose-strong:text-foreground prose-a:text-primary prose-li:text-foreground/80 ${className}`}>
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );
}
