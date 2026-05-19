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
  sm: 'h-8',
  md: 'h-10',
  lg: 'h-12',
  xl: 'h-14',
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
  const src = tone === 'light' ? '/images/logo-light.svg' : '/images/logo.svg';

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden',
        surfaceClasses[surface],
        className,
      )}
    >
      <img
        src={src}
        alt="CopyPro"
        draggable={false}
        className={cn('block w-auto max-w-full object-contain', imageSizes[size], imageClassName)}
      />
    </span>
  );
}
