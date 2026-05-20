import { useEffect, useState } from 'react';
import { Layout } from '@/app/components/Layout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Bell, Trash2, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { TYPE_COLORS } from '@/mocks/notifications';
import { useNotifications } from '@/hooks/queries/useNotifications';

export function CustomerNotifications() {
  const { data } = useNotifications();
  const [notifications, setNotifications] = useState<NonNullable<typeof data>>([] as any);

  useEffect(() => {
    if (data) setNotifications(data);
  }, [data]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('Đã đánh dấu tất cả đã đọc');
  };

  const markRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success('Đã xóa thông báo');
  };

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Thông Báo</h1>
            <p className="text-foreground/70">
              {unreadCount > 0 ? `Bạn có ${unreadCount} thông báo chưa đọc` : 'Tất cả thông báo đã được đọc'}
            </p>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllRead}>
                <Check className="w-4 h-4 mr-1.5" /> Đọc tất cả
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {notifications.length === 0 && (
            <div className="text-center py-16 text-muted-foreground/80">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Không có thông báo nào</p>
            </div>
          )}
          {notifications.map(notif => {
            const Icon = notif.icon;
            const colors = TYPE_COLORS[notif.type] || TYPE_COLORS.info;
            return (
              <Card
                key={notif.id}
                className={`p-4 transition-all cursor-pointer hover:shadow-md ${!notif.read ? 'border-l-4 border-l-green-500 bg-primary/5' : ''}`}
                onClick={() => markRead(notif.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${colors} flex-shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`text-sm font-semibold ${!notif.read ? 'text-foreground' : 'text-foreground/80'}`}>{notif.title}</h3>
                      {!notif.read && <div className="w-2 h-2 bg-destructive/100 rounded-full flex-shrink-0" />}
                    </div>
                    <p className="text-sm text-muted-foreground">{notif.desc}</p>
                    <p className="text-xs text-muted-foreground/80 mt-1.5">{notif.time}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-muted-foreground/80 hover:text-red-500 flex-shrink-0" onClick={e => { e.stopPropagation(); deleteNotification(notif.id); }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
