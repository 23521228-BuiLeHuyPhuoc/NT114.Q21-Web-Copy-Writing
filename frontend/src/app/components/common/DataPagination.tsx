import type { MouseEvent } from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from '@/app/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { cn } from '@/app/components/ui/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DataPaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  itemLabel?: string;
  pageSizeOptions?: number[];
  className?: string;
}

function getPageRange(page: number, totalPages: number) {
  const range: Array<number | 'ellipsis'> = [];

  for (let candidate = 1; candidate <= totalPages; candidate += 1) {
    const isEdge = candidate === 1 || candidate === totalPages;
    const isNearCurrent = Math.abs(candidate - page) <= 1;

    if (isEdge || isNearCurrent) {
      range.push(candidate);
      continue;
    }

    if (range[range.length - 1] !== 'ellipsis') {
      range.push('ellipsis');
    }
  }

  return range;
}

export function DataPagination({
  page,
  pageSize,
  totalItems,
  totalPages,
  startIndex,
  endIndex,
  onPageChange,
  onPageSizeChange,
  itemLabel = 'mục',
  pageSizeOptions = [5, 10, 20, 50],
  className,
}: DataPaginationProps) {
  if (totalItems === 0) return null;

  const goToPage = (nextPage: number) => (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) return;
    onPageChange(nextPage);
  };

  return (
    <div className={cn('mt-5 flex flex-col gap-3 rounded-lg border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div className="text-sm text-muted-foreground">
        Hiển thị <span className="font-semibold text-foreground">{startIndex}-{endIndex}</span> /{' '}
        <span className="font-semibold text-foreground">{totalItems}</span> {itemLabel}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Dòng/trang</span>
          <Select value={String(pageSize)} onValueChange={(value) => onPageSizeChange(Number(value))}>
            <SelectTrigger className="h-9 w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((option) => (
                <SelectItem key={option} value={String(option)}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Pagination className="mx-0 w-auto justify-start sm:justify-center">
          <PaginationContent>
            <PaginationItem>
              <PaginationLink
                href="#"
                aria-label="Trang trước"
                size="default"
                onClick={goToPage(page - 1)}
                className={cn('gap-1 px-2.5', page === 1 && 'pointer-events-none opacity-50')}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Trước</span>
              </PaginationLink>
            </PaginationItem>

            {getPageRange(page, totalPages).map((entry, index) => (
              <PaginationItem key={`${entry}-${index}`}>
                {entry === 'ellipsis' ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    href="#"
                    isActive={entry === page}
                    onClick={goToPage(entry)}
                  >
                    {entry}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationLink
                href="#"
                aria-label="Trang sau"
                size="default"
                onClick={goToPage(page + 1)}
                className={cn('gap-1 px-2.5', page === totalPages && 'pointer-events-none opacity-50')}
              >
                <span className="hidden sm:inline">Sau</span>
                <ChevronRight className="h-4 w-4" />
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
