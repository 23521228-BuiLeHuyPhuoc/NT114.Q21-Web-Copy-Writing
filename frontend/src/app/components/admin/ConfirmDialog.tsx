import { AlertTriangle, RotateCcw, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/app/components/ui/alert-dialog';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  confirmVariant?: 'danger' | 'warning' | 'success';
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Xác nhận',
  confirmVariant = 'danger',
  loading = false,
}: ConfirmDialogProps) {
  const variantMap = {
    danger: {
      button: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      icon: <Trash2 className="h-5 w-5" />,
      ring: 'bg-destructive/10 text-destructive',
    },
    warning: {
      button: 'bg-warning text-warning-foreground hover:bg-warning/90',
      icon: <AlertTriangle className="h-5 w-5" />,
      ring: 'bg-warning/15 text-warning-foreground',
    },
    success: {
      button: 'bg-primary text-primary-foreground hover:bg-primary/90',
      icon: <RotateCcw className="h-5 w-5" />,
      ring: 'bg-primary/10 text-primary',
    },
  } as const;
  const variant = variantMap[confirmVariant];

  return (
    <AlertDialog open={open} onOpenChange={(nextOpen) => !nextOpen && !loading && onClose()}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader className="text-left">
          <div className={`mb-1 flex h-11 w-11 items-center justify-center rounded-md ${variant.ring}`}>
            {variant.icon}
          </div>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription className="text-sm leading-6">
              {description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-2 grid grid-cols-2 sm:grid-cols-2">
          <AlertDialogCancel disabled={loading} className="mt-0 w-full">
            Hủy
          </AlertDialogCancel>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex h-10 w-full items-center justify-center gap-2 rounded-md px-4 text-sm font-bold transition-colors disabled:pointer-events-none disabled:opacity-40 ${variant.button}`}
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              confirmLabel
            )}
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
