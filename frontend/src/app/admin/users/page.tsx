'use client';

import { AdminRoute } from '@/app/route-guards';
import { AdminUsers } from '@/app/pages/admin/Users';

export default function AdminUsersPage() {
  return (
    <AdminRoute path="/admin/users">
      <AdminUsers />
    </AdminRoute>
  );
}
