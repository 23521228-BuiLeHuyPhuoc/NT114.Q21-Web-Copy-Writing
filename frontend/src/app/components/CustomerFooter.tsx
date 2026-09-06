import { Link } from '@/lib/next-router-compat';
import { ArrowUpRight, CircleHelp, FileText, ShieldCheck } from 'lucide-react';

export function CustomerFooter() {
  return (
    <footer className="border-t border-border bg-card/70 px-5 py-4 backdrop-blur md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono-editorial uppercase tracking-[.14em]">CopyPro / Creative Editorial Studio</p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link to="/blog" className="inline-flex items-center gap-1.5 hover:text-primary"><FileText className="h-3.5 w-3.5" /> Hướng dẫn</Link>
          <Link to="/contact" className="inline-flex items-center gap-1.5 hover:text-primary"><CircleHelp className="h-3.5 w-3.5" /> Hỗ trợ</Link>
          <Link to="/profile" className="inline-flex items-center gap-1.5 hover:text-primary"><ShieldCheck className="h-3.5 w-3.5" /> Tài khoản <ArrowUpRight className="h-3 w-3" /></Link>
        </div>
      </div>
    </footer>
  );
}
