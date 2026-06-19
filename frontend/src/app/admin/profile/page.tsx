'use client';

import { AdminRoute } from '@/app/_shared/route-guards';
import { AdminProfile } from './AdminProfile';

export default function AdminProfilePage() {
  return (
    <AdminRoute path="/admin/profile">
      <AdminProfile />
    </AdminRoute>
  );
}
