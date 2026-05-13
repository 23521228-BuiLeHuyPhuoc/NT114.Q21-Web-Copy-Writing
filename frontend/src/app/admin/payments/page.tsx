'use client';

import { AdminRoute } from '@/app/route-guards';
import { AdminPayments } from '@/app/pages/admin/Payments';

export default function AdminPaymentsPage() {
  return (
    <AdminRoute path="/admin/payments">
      <AdminPayments />
    </AdminRoute>
  );
}
