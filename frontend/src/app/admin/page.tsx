'use client';

import { AdminRoute } from '@/app/route-guards';
import { AdminDashboard } from '@/app/pages/admin/Dashboard';

export default function AdminHome() {
  return (
    <AdminRoute path="/admin">
      <AdminDashboard />
    </AdminRoute>
  );
}
