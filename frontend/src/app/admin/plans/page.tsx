'use client';

import { AdminRoute } from '@/app/route-guards';
import { AdminPlans } from '@/app/pages/admin/Plans';

export default function AdminPlansPage() {
  return (
    <AdminRoute path="/admin/plans">
      <AdminPlans />
    </AdminRoute>
  );
}
