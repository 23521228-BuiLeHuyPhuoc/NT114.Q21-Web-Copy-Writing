import type { ReactNode } from 'react';
import { cn } from '@/app/components/ui/utils';

type EditorialGlyphKind = 'manuscript' | 'cursor' | 'quote' | 'pen' | 'card';

export function EditorialGlyph({ kind, className }: { kind: EditorialGlyphKind; className?: string }) {
  const common = cn('h-10 w-10', className);

  if (kind === 'cursor') {
    return (
      <svg viewBox="0 0 48 48" className={common} aria-hidden="true">
        <path d="M10 6 37 27l-12 2 7 11-6 3-7-12-9 8V6Z" fill="#f2cc59" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
        <path d="m31 9 2-5m6 10 5-2m-7 10 5 3" fill="none" stroke="#d64b32" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === 'quote') {
    return (
      <svg viewBox="0 0 48 48" className={common} aria-hidden="true">
        <path d="M8 13h14v13c0 9-5 14-13 16l-2-5c5-2 7-5 7-9H8V13Zm22 0h14v13c0 9-5 14-13 16l-2-5c5-2 7-5 7-9h-7V13Z" fill="#d64b32" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    );
  }

  if (kind === 'pen') {
    return (
      <svg viewBox="0 0 48 48" className={common} aria-hidden="true">
        <path d="m10 37 4-11L34 6l8 8-20 20-12 3Z" fill="#fffdf7" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
        <path d="m29 11 8 8M14 26l8 8M10 37l8-7 4 4-12 3Z" fill="#f2cc59" stroke="currentColor" strokeWidth="2.2" />
        <path d="M8 42h28" stroke="#d64b32" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === 'card') {
    return (
      <svg viewBox="0 0 48 48" className={common} aria-hidden="true">
        <path d="M5 12h30v25H5z" fill="#fffdf7" stroke="currentColor" strokeWidth="2.2" />
        <path d="M13 6h30v25H13z" fill="#f2cc59" stroke="currentColor" strokeWidth="2.2" />
        <path d="M19 14h18M19 20h13M19 26h16" stroke="#172033" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="37" cy="10" r="5" fill="#d64b32" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 48 48" className={common} aria-hidden="true">
      <path d="M9 5h25l6 6v32H9z" fill="#fffdf7" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M34 5v7h6" fill="#f2cc59" stroke="currentColor" strokeWidth="2.2" />
      <path d="M15 19h18M15 25h18M15 31h12" stroke="#172033" strokeWidth="2.2" strokeLinecap="round" />
      <path d="m28 36 10-10" stroke="#d64b32" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function ManuscriptHeroArtwork({ className }: { className?: string }) {
  return (
    <div className={cn('relative mx-auto aspect-[6/5] w-full max-w-[660px]', className)} aria-label="Bàn biên tập với bản thảo AI" role="img">
      <div className="paper-grid absolute inset-[8%_1%_2%_7%] rotate-[2deg] border-2 border-foreground bg-accent shadow-[12px_12px_0_rgba(23,32,51,.14)]" />
      <svg viewBox="0 0 640 520" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
        <path d="M103 61h390l56 55v336H103z" fill="#fffdf7" stroke="#172033" strokeWidth="3" />
        <path d="M493 61v58h56" fill="#f2cc59" stroke="#172033" strokeWidth="3" />
        <path d="M149 139h72M149 169h309M149 196h260" stroke="#172033" strokeWidth="8" strokeLinecap="square" />
        <path d="M149 246h350M149 277h314M149 308h333M149 339h202" stroke="#172033" strokeOpacity=".34" strokeWidth="5" />
        <path d="M150 382c82-15 165-13 250 2" fill="none" stroke="#d64b32" strokeWidth="5" strokeLinecap="round" />
        <path d="m410 372 75-83 33 30-79 80-45 12 16-39Z" fill="#f2cc59" stroke="#172033" strokeWidth="3" strokeLinejoin="round" />
        <path d="m478 297 33 30" stroke="#d64b32" strokeWidth="5" />
        <path d="M69 120h100v55H69z" fill="#d64b32" stroke="#172033" strokeWidth="3" />
        <path d="M86 139h65M86 154h43" stroke="#fffdf7" strokeWidth="4" />
        <path d="M459 26h130v62H459z" fill="#1f6f78" stroke="#172033" strokeWidth="3" />
        <path d="m478 43 13 13 25-25M478 68h89" fill="none" stroke="#fffdf7" strokeWidth="4" />
        <path d="m53 330 59 45-28 5 15 30-15 8-16-31-23 20 8-77Z" fill="#fffdf7" stroke="#172033" strokeWidth="3" strokeLinejoin="round" />
        <path d="M532 176c25 5 39 20 43 45M550 158l9-24M580 175l24-10" fill="none" stroke="#d64b32" strokeWidth="4" strokeLinecap="round" />
        <path d="M205 99h177" stroke="#d64b32" strokeWidth="3" strokeDasharray="7 8" />
        <text x="149" y="116" fill="#d64b32" fontSize="15" fontFamily="monospace" fontWeight="700" letterSpacing="2">BẢN THẢO / 01</text>
      </svg>
      <div className="absolute bottom-[2%] right-[3%] rotate-[-3deg] border-2 border-foreground bg-card px-4 py-3 shadow-[5px_5px_0_#d64b32]">
        <span className="font-mono-editorial text-[10px] font-bold uppercase tracking-[.16em] text-muted-foreground">Trạng thái</span>
        <p className="mt-1 text-sm font-bold text-foreground">Sẵn sàng biên tập <span className="ml-1 inline-block h-4 w-[2px] animate-[cursor-blink_1s_infinite] bg-primary align-middle" /></p>
      </div>
    </div>
  );
}

export function EditorialEmptyState({
  title,
  description,
  action,
  compact = false,
  className,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('paper-noise flex flex-col items-center border border-dashed border-foreground/35 bg-card text-center', compact ? 'p-6' : 'p-10 md:p-14', className)}>
      <div className={cn('relative mb-5', compact ? 'h-20 w-24' : 'h-28 w-36')} aria-hidden="true">
        <div className="absolute inset-0 rotate-[-4deg] border-2 border-foreground bg-accent" />
        <div className="absolute inset-0 translate-x-3 translate-y-2 rotate-[3deg] border-2 border-foreground bg-card p-4 shadow-[4px_4px_0_rgba(23,32,51,.14)]">
          <div className="mb-2 h-1.5 w-3/4 bg-foreground" />
          <div className="mb-2 h-1 w-full bg-foreground/30" />
          <div className="mb-2 h-1 w-5/6 bg-foreground/30" />
          <div className="h-1 w-2/3 bg-primary" />
        </div>
      </div>
      <h3 className="font-display text-xl font-bold text-foreground md:text-2xl">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
