'use client';

import { AdminRoute } from '@/app/route-guards';
import { AdminModelManagement } from '@/app/pages/admin/ModelManagement';

export default function AdminModelsPage() {
  return (
    <AdminRoute path="/admin/models">
      <AdminModelManagement />
    </AdminRoute>
  );
}
