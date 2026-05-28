import { Layout } from '@/app/components/Layout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Bell, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { TYPE_COLORS } from '@/mocks/notifications';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '@/hooks/queries/useNotifications';
import { DataPagination } from '@/app/components/common/DataPagination';
import { usePagination } from '@/hooks/usePagination';

export function CustomerNotifications() {
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
    if (read || markReadMutation.isPending) return;
    markReadMutation.mutate(id);
  };

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
                onClick={() => markRead(notification.id, notification.read)}
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
                    <p className="text-sm text-muted-foreground">{notification.desc}</p>
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
      </div>
    </Layout>
  );
}
