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
    <Card className={`p-4 mb-6 ${className}`}>
      <div className="flex flex-wrap gap-3 items-center">
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
                    className={`border-0 cursor-pointer transition-colors ${
                      active
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                        : 'bg-primary/10 text-primary hover:bg-primary/10'
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
