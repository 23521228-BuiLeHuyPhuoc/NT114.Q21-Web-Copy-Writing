'use client';

import { AdminRoute } from '@/app/_shared/route-guards';
import { AdminNotifications } from './Notifications';

export default function AdminNotificationsPage() {
  return (
    <AdminRoute path="/admin/notifications">
      <AdminNotifications />
    </AdminRoute>
  );
}
