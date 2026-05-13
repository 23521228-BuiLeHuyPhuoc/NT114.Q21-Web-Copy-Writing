import ReactMarkdown from 'react-markdown';

export function Markdown({ children, className = '' }: { children: string; className?: string }) {
  return (
    <div className={`prose prose-sm max-w-none prose-headings:font-semibold prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-a:text-green-600 prose-li:text-gray-700 ${className}`}>
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );
}
