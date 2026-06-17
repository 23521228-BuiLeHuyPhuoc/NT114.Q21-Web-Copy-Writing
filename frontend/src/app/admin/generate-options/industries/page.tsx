'use client';

import { AdminRoute } from '@/app/_shared/route-guards';
import { GenerateOptionsManager } from '../GenerateOptionsManager';

export default function AdminGenerateIndustriesPage() {
  return (
    <AdminRoute path="/admin/generate-options/industries">
      <GenerateOptionsManager
        group="industries"
        title="Quản lý ngành nghề Generate"
        description="Thêm, sửa, bật/tắt các ngành nghề người dùng chọn ở mục Ngành nghề trong trang Generate."
        noun="ngành nghề"
        iconHint="ShoppingBag"
        colorHint="bg-emerald-500"
      />
    </AdminRoute>
  );
}
