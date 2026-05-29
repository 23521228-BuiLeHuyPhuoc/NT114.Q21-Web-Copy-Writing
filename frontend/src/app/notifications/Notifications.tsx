import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/app/components/Layout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Bell, Check, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { TYPE_COLORS } from '@/mocks/notifications';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '@/hooks/queries/useNotifications';
import { DataPagination } from '@/app/components/common/DataPagination';
import { usePagination } from '@/hooks/usePagination';
import type { UiNotification } from '@/services/notificationService';

function formatFullDate(value?: string) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function CustomerNotifications() {
  const [selectedNotification, setSelectedNotification] = useState<UiNotification | null>(null);
  const { data, isLoading } = useNotifications({ limit: 50 });
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();
  const notifications = data || [];

  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const pagination = usePagination(notifications, {
    initialPageSize: 8,
    resetKey: notifications.length,
  });

  const markAllRead = () => {
    markAllReadMutation.mutate(undefined, {
      onSuccess: () => toast.success('Đã đánh dấu tất cả đã đọc'),
      onError: () => toast.error('Không thể đánh dấu tất cả đã đọc'),
    });
  };

  const markRead = (id: string, read: boolean) => {
    if (read) return;
    markReadMutation.mutate(id);
  };

  const openNotification = (notification: UiNotification) => {
    setSelectedNotification({ ...notification, read: true });
    markRead(notification.id, notification.read);
  };

  const closeNotification = (open: boolean) => {
    if (!open) {
      setSelectedNotification(null);
    }
  };

  const SelectedIcon = selectedNotification?.icon;
  const selectedColors = selectedNotification
    ? TYPE_COLORS[selectedNotification.type] || TYPE_COLORS.info
    : TYPE_COLORS.info;

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Thông Báo</h1>
            <p className="text-foreground/70">
              {unreadCount > 0
                ? `Bạn có ${unreadCount} thông báo chưa đọc`
                : 'Tất cả thông báo đã được đọc'}
            </p>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllRead}
                disabled={markAllReadMutation.isPending}
              >
                <Check className="w-4 h-4 mr-1.5" /> Đọc tất cả
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {isLoading && (
            <div className="text-center py-16 text-muted-foreground/80">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Đang tải thông báo...</p>
            </div>
          )}

          {!isLoading && notifications.length === 0 && (
            <div className="text-center py-16 text-muted-foreground/80">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Không có thông báo nào</p>
            </div>
          )}

          {pagination.pageItems.map((notification) => {
            const Icon = notification.icon;
            const colors = TYPE_COLORS[notification.type] || TYPE_COLORS.info;

            return (
              <Card
                key={notification.id}
                className={`p-4 transition-all cursor-pointer hover:shadow-md ${
                  !notification.read ? 'border-l-4 border-l-green-500 bg-primary/5' : ''
                }`}
                onClick={() => openNotification(notification)}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${colors} flex-shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3
                        className={`text-sm font-semibold ${
                          !notification.read ? 'text-foreground' : 'text-foreground/80'
                        }`}
                      >
                        {notification.title}
                      </h3>
                      {!notification.read && <div className="w-2 h-2 bg-destructive rounded-full flex-shrink-0" />}
                    </div>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{notification.desc}</p>
                    <p className="text-xs text-muted-foreground/80 mt-1.5">{notification.time}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <DataPagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          totalItems={pagination.totalItems}
          totalPages={pagination.totalPages}
          startIndex={pagination.startIndex}
          endIndex={pagination.endIndex}
          onPageChange={pagination.setPage}
          onPageSizeChange={pagination.setPageSize}
          itemLabel="thông báo"
        />

        <Dialog open={Boolean(selectedNotification)} onOpenChange={closeNotification}>
          <DialogContent className="flex max-h-[calc(100vh-2rem)] flex-col overflow-hidden p-0 sm:max-w-xl">
            {selectedNotification && SelectedIcon && (
              <>
                <DialogHeader className="border-b px-5 pb-4 pt-5 pr-12 sm:px-6 sm:pr-12 sm:pt-6">
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 rounded-lg p-2.5 ${selectedColors}`}>
                      <SelectedIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <DialogTitle className="break-words pr-2 text-lg leading-6">
                        {selectedNotification.title}
                      </DialogTitle>
                      <DialogDescription className="mt-1">
                        {selectedNotification.read ? 'Đã đọc' : 'Chưa đọc'}
                        {selectedNotification.time ? ` · ${selectedNotification.time}` : ''}
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <div className="min-h-0 overflow-y-auto px-5 py-5 sm:px-6">
                  <p className="whitespace-pre-wrap break-words text-sm leading-6 text-foreground">
                    {selectedNotification.desc || 'Thông báo này không có nội dung chi tiết.'}
                  </p>

                  {selectedNotification.createdAt && (
                    <div className="mt-5 rounded-lg border bg-muted/35 px-3 py-2 text-xs text-muted-foreground">
                      Thời gian: {formatFullDate(selectedNotification.createdAt)}
                    </div>
                  )}
                </div>

                <DialogFooter className="border-t px-5 py-4 sm:px-6">
                  <Button variant="outline" onClick={() => setSelectedNotification(null)}>
                    Đóng
                  </Button>
                  {selectedNotification.actionUrl && (
                    <Button asChild>
                      <Link to={selectedNotification.actionUrl} onClick={() => setSelectedNotification(null)}>
                        <ExternalLink className="h-4 w-4" />
                        Mở liên kết
                      </Link>
                    </Button>
                  )}
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
