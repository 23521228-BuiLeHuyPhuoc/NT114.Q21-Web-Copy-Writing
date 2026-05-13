'use client';

import { ProtectedRoute } from '@/app/route-guards';
import { CustomerNotifications } from '@/app/pages/customer/Notifications';

export default function Notifications() {
  return (
    <ProtectedRoute requiredRole="customer">
      <CustomerNotifications />
    </ProtectedRoute>
  );
}
