import { useEffect, useMemo, useState } from 'react';

interface UsePaginationOptions {
  initialPageSize?: number;
  resetKey?: string | number;
}

export function usePagination<T>(
  items: T[],
  { initialPageSize = 6, resetKey = '' }: UsePaginationOptions = {},
) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    setPage(1);
  }, [pageSize, resetKey]);

  useEffect(() => {
    setPage((current) => Math.min(Math.max(current, 1), totalPages));
  }, [totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  return {
    page,
    pageItems,
    pageSize,
    setPage,
    setPageSize,
    totalItems,
    totalPages,
    startIndex: totalItems === 0 ? 0 : (page - 1) * pageSize + 1,
    endIndex: Math.min(page * pageSize, totalItems),
  };
}
