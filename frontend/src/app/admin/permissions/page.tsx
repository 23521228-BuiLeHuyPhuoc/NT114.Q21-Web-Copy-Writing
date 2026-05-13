'use client';

import { AdminRoute } from '@/app/route-guards';
import { AdminPermissions } from '@/app/pages/admin/Permissions';

export default function AdminPermissionsPage() {
  return (
    <AdminRoute path="/admin/permissions">
      <AdminPermissions />
    </AdminRoute>
  );
}
