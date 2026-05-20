import type { LucideIcon } from 'lucide-react';
import { Card } from '@/app/components/ui/card';

export interface StatTileProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  /** When provided, renders the stacked layout (icon+label row, then large value, then trend) */
  trend?: { value: string; positive?: boolean };
  /** Tailwind classes for the icon bubble background (e.g. "bg-primary/5") */
  iconBg?: string;
  /** Tailwind classes for the icon color (e.g. "text-primary") */
  iconColor?: string;
  /** Combined "text-... bg-..." className for the icon bubble (legacy shape used by existing pages) */
  color?: string;
  /** Override icon size (default w-4 h-4) */
  iconClassName?: string;
  /** Override value text size (default text-xl in horizontal, text-2xl with trend) */
  valueClassName?: string;
}

/**
 * Reusable admin stat card. Two visual modes:
 *  - Default (no trend): horizontal layout — icon bubble on the left,
 *    value + label stacked on the right. Matches Contents / Templates /
 *    Plans / ModelManagement.
 *  - With trend: stacked layout — icon+label row on top, large value,
 *    trend value underneath. Matches Payments.
 */
export function StatTile({
  icon: Icon,
  label,
  value,
  trend,
  iconBg,
  iconColor,
  color,
  iconClassName = 'w-4 h-4',
  valueClassName,
}: StatTileProps) {
  const bubbleClass = color ?? `${iconColor ?? ''} ${iconBg ?? ''}`.trim();

  if (trend) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-2 rounded-lg ${bubbleClass}`}>
            <Icon className={iconClassName} />
          </div>
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <p className={`${valueClassName ?? 'text-2xl'} font-bold text-foreground`}>{value}</p>
        <p
          className={`text-xs mt-1 ${
            trend.positive === false ? 'text-red-600' : 'text-primary'
          }`}
        >
          {trend.value}
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4 flex items-center gap-3">
      <div className={`p-2 rounded-lg ${bubbleClass}`}>
        <Icon className={iconClassName} />
      </div>
      <div>
        <p className={`${valueClassName ?? 'text-xl'} font-bold text-foreground`}>{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </Card>
  );
}
