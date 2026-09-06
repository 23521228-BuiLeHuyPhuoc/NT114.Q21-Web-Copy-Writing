import { cn } from '@/app/components/ui/utils';

type BrandLogoSize = 'sm' | 'md' | 'lg' | 'xl';
type BrandLogoSurface = 'none' | 'light';
type BrandLogoTone = 'dark' | 'light';

interface BrandLogoProps {
  size?: BrandLogoSize;
  surface?: BrandLogoSurface;
  tone?: BrandLogoTone;
  className?: string;
  imageClassName?: string;
}

const imageSizes: Record<BrandLogoSize, string> = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
  xl: 'text-3xl',
};

const surfaceClasses: Record<BrandLogoSurface, string> = {
  none: '',
  light: 'drop-shadow-[0_1px_2px_rgba(255,255,255,0.55)]',
};

export function BrandLogo({
  size = 'md',
  surface = 'none',
  tone = 'dark',
  className,
  imageClassName,
}: BrandLogoProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-2',
        surfaceClasses[surface],
        tone === 'light' ? 'text-white' : 'text-foreground',
        className,
      )}
    >
      <span className={cn('relative inline-flex h-[1.85em] w-[1.5em] items-center justify-center', imageSizes[size], imageClassName)} aria-hidden="true">
        <span className="absolute inset-x-0 bottom-[.08em] top-[.16em] rotate-[-4deg] border-2 border-current bg-accent" />
        <span className="absolute left-[.38em] top-[-.02em] h-[1.7em] w-[.16em] rotate-[24deg] bg-primary" />
        <span className="absolute bottom-[.38em] left-[.18em] h-[2px] w-[.84em] bg-current" />
      </span>
      <span className={cn('font-display font-bold leading-none tracking-[-0.06em]', imageSizes[size])}>
        Copy<span className="text-primary">Pro</span>
      </span>
      <span className="hidden border-l border-current/25 pl-2 font-mono-editorial text-[8px] font-bold uppercase leading-[1.15] tracking-[.16em] opacity-65 xl:inline">
        AI editorial<br />studio
      </span>
    </span>
  );
}
