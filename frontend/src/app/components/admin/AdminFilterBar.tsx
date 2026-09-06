import type { ReactNode } from 'react';
import { Search } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';

export interface AdminFilterBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  searchPlaceholder?: string;
  filters?: Array<{ label: string; value: string; count?: number }>;
  activeFilter?: string;
  onFilterChange?: (v: string) => void;
  /** Optional slot for a Select/Button on the right side */
  rightSlot?: ReactNode;
  className?: string;
}

/**
 * Reusable toolbar: search input + optional badge-pill filters + optional right slot.
 * Wraps the contents in a Card to match existing admin pages.
 */
export function AdminFilterBar({
  search,
  onSearchChange,
  searchPlaceholder = 'Tìm kiếm...',
  filters,
  activeFilter,
  onFilterChange,
  rightSlot,
  className = '',
}: AdminFilterBarProps) {
  return (
    <Card className={`mb-6 gap-0 overflow-hidden border border-foreground/55 ${className}`}>
      <div className="border-b border-foreground/55 bg-foreground px-4 py-2 text-xs font-bold uppercase tracking-[.06em] text-background">Bộ lọc dữ liệu</div>
      <div className="flex flex-wrap items-center gap-3 p-4">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {filters && filters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {filters.map(f => {
              const active = f.value === activeFilter;
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => onFilterChange?.(f.value)}
                  className="focus:outline-none"
                >
                  <Badge
                    className={`cursor-pointer border transition-colors ${
                      active
                        ? 'border-foreground bg-accent text-foreground'
                        : 'border-border bg-card text-foreground/65 hover:border-foreground/40'
                    }`}
                  >
                    {f.label}
                    {typeof f.count === 'number' && (
                      <span className="ml-1.5 opacity-80">({f.count})</span>
                    )}
                  </Badge>
                </button>
              );
            })}
          </div>
        )}

        {rightSlot}
      </div>
    </Card>
  );
}
