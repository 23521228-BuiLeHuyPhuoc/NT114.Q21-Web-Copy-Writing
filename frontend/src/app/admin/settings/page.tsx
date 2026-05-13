'use client';

import { AdminRoute } from '@/app/route-guards';
import { AdminSettings } from '@/app/pages/admin/Settings';

export default function AdminSettingsPage() {
  return (
    <AdminRoute path="/admin/settings">
      <AdminSettings />
    </AdminRoute>
  );
}
