'use client';

import { AdminRoute } from '@/app/route-guards';
import { AdminCategories } from '@/app/pages/admin/Categories';

export default function AdminCategoriesPage() {
  return (
    <AdminRoute path="/admin/categories">
      <AdminCategories />
    </AdminRoute>
  );
}
