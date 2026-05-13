'use client';

import { AdminRoute } from '@/app/route-guards';
import { AdminContents } from '@/app/pages/admin/Contents';

export default function AdminContentsPage() {
  return (
    <AdminRoute path="/admin/contents">
      <AdminContents />
    </AdminRoute>
  );
}
