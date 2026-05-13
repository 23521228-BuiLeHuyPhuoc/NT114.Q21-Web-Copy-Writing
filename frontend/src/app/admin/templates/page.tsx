'use client';

import { AdminRoute } from '@/app/route-guards';
import { AdminTemplates } from '@/app/pages/admin/Templates';

export default function AdminTemplatesPage() {
  return (
    <AdminRoute path="/admin/templates">
      <AdminTemplates />
    </AdminRoute>
  );
}
