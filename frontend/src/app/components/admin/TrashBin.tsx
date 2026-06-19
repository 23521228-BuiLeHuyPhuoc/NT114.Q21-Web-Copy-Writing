import { useState } from 'react';
import { Flame, RotateCcw, Trash2, X } from 'lucide-react';
import { ConfirmDialog } from '@/app/components/admin/ConfirmDialog';
import { DataPagination } from '@/app/components/common/DataPagination';
import { usePagination } from '@/hooks/usePagination';

interface TrashItem {
  id: number | string;
  label: string;
  subLabel?: string;
  deletedAt: string;
}

interface TrashBinProps {
  open: boolean;
  onClose: () => void;
  items: TrashItem[];
  onRestore: (id: number | string) => void;
  onPermanentDelete: (id: number | string) => void;
  onPermanentDeleteAll?: (ids: Array<number | string>) => void | Promise<void>;
  deleteAllLoading?: boolean;
  deleteAllLabel?: string;
  entityName?: string;
  loading?: string | null;
}

export function TrashBin({
  open,
  onClose,
  items,
  onRestore,
  onPermanentDelete,
  onPermanentDeleteAll,
  deleteAllLoading = false,
  deleteAllLabel = 'Xóa tất cả',
  entityName = 'mục',
  loading,
}: TrashBinProps) {
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [internalDeleteAllLoading, setInternalDeleteAllLoading] = useState(false);
  const pagination = usePagination(items, {
    initialPageSize: 5,
    resetKey: `${items.length}|${open}`,
  });
  const isDeleteAllLoading = deleteAllLoading || internalDeleteAllLoading;

  const handleConfirmDeleteAll = async () => {
    if (!onPermanentDeleteAll) return;

    setInternalDeleteAllLoading(true);
    try {
      await onPermanentDeleteAll(items.map(item => item.id));
      setConfirmDeleteAll(false);
    } finally {
      setInternalDeleteAllLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-card w-full max-w-md h-full flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b bg-surface-muted">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-destructive/10 rounded-xl flex items-center justify-center">
              <Trash2 className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="font-bold text-foreground">Thùng rác</p>
              <p className="text-xs text-muted-foreground">{items.length} {entityName} đã xóa</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 text-muted-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {items.length > 0 && (
          <div className="mx-4 mt-4 bg-warning/10 border border-amber-200 rounded-xl p-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-2.5 items-start min-w-0">
              <Flame className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 leading-relaxed">
                Các mục trong thùng rác sẽ bị <span className="font-semibold">xóa vĩnh viễn sau 30 ngày</span>.
              </p>
            </div>
            {onPermanentDeleteAll && (
              <button
                onClick={() => setConfirmDeleteAll(true)}
                disabled={isDeleteAllLoading || Boolean(loading)}
                className="h-8 shrink-0 flex items-center justify-center gap-1.5 rounded-lg border border-red-200 px-3 text-xs font-bold text-red-600 hover:bg-destructive/10 transition-colors disabled:opacity-40"
              >
                {isDeleteAllLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-red-300 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Flame className="w-3.5 h-3.5" />
                    {deleteAllLabel}
                  </>
                )}
              </button>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
                <Trash2 className="w-8 h-8 text-muted-foreground/60" />
              </div>
              <p className="font-semibold text-muted-foreground/80">Thùng rác trống</p>
              <p className="text-xs text-muted-foreground/80 mt-1">Không có {entityName} nào bị xóa</p>
            </div>
          ) : (
            pagination.pageItems.map((item) => {
              const isItemLoading = loading === String(item.id);
              const actionsDisabled = isItemLoading || isDeleteAllLoading;
              return (
                <div
                  key={item.id}
                  className="bg-surface-muted border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-foreground/80 truncate">{item.label}</p>
                      {item.subLabel && (
                        <p className="text-xs text-muted-foreground/80 mt-0.5 truncate">{item.subLabel}</p>
                      )}
                      <p className="text-[11px] text-muted-foreground/80 mt-1">
                        Đã xóa lúc <span className="font-medium">{item.deletedAt}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onRestore(item.id)}
                      disabled={actionsDisabled}
                      className="flex-1 flex items-center justify-center gap-1.5 h-8 border border-primary/20 text-primary hover:bg-primary/5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40"
                    >
                      {isItemLoading ? (
                        <div className="w-3.5 h-3.5 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <RotateCcw className="w-3.5 h-3.5" />
                          Khôi phục
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => onPermanentDelete(item.id)}
                      disabled={actionsDisabled}
                      className="flex-1 flex items-center justify-center gap-1.5 h-8 border border-red-200 text-red-600 hover:bg-destructive/10 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40"
                    >
                      <Flame className="w-3.5 h-3.5" />
                      Xóa vĩnh viễn
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {items.length > 0 && (
          <div className="border-t p-4">
            <DataPagination
              page={pagination.page}
              pageSize={pagination.pageSize}
              totalItems={pagination.totalItems}
              totalPages={pagination.totalPages}
              startIndex={pagination.startIndex}
              endIndex={pagination.endIndex}
              onPageChange={pagination.setPage}
              onPageSizeChange={pagination.setPageSize}
              itemLabel={entityName}
              pageSizeOptions={[5, 10, 20]}
              className="mt-0"
            />
          </div>
        )}
        <ConfirmDialog
          open={confirmDeleteAll}
          onClose={() => setConfirmDeleteAll(false)}
          onConfirm={() => void handleConfirmDeleteAll()}
          title={`Xóa tất cả ${entityName} trong thùng rác?`}
          description={`Thao tác này sẽ xóa vĩnh viễn ${items.length} ${entityName} và không thể khôi phục.`}
          confirmLabel={deleteAllLabel}
          confirmVariant="danger"
          loading={isDeleteAllLoading}
        />
      </div>
    </div>
  );
}
