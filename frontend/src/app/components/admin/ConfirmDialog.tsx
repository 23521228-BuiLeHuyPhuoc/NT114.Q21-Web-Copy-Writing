import { AlertTriangle, RotateCcw, Trash2, X } from 'lucide-react';

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
  if (!open) return null;

  const variantMap = {
    danger: {
      btn: 'bg-red-600 hover:bg-red-700 shadow-red-200/60',
      icon: <Trash2 className="w-5 h-5" />,
      ring: 'bg-destructive/10',
      iconColor: 'text-red-600',
    },
    warning: {
      btn: 'bg-warning/100 hover:bg-amber-600 shadow-amber-200/60',
      icon: <AlertTriangle className="w-5 h-5" />,
      ring: 'bg-warning/15',
      iconColor: 'text-amber-600',
    },
    success: {
      btn: 'bg-primary hover:bg-green-700 shadow-primary/20',
      icon: <RotateCcw className="w-5 h-5" />,
      ring: 'bg-primary/10',
      iconColor: 'text-primary',
    },
  };
  const v = variantMap[confirmVariant];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground/80 hover:text-foreground/70 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className={`w-12 h-12 ${v.ring} rounded-2xl flex items-center justify-center mb-4`}>
          <span className={v.iconColor}>{v.icon}</span>
        </div>

        <h3 className="font-bold text-foreground mb-2 pr-6">{title}</h3>
        {description && <p className="text-sm text-muted-foreground leading-relaxed mb-6">{description}</p>}

        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 h-10 border border-border rounded-xl text-sm font-semibold text-foreground/70 hover:bg-surface-muted transition-colors disabled:opacity-40"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 h-10 ${v.btn} text-white rounded-xl text-sm font-bold shadow-md transition-all disabled:opacity-40 flex items-center justify-center gap-1.5`}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
