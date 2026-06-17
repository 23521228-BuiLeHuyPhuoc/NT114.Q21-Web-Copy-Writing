'use client';

import { AdminRoute } from '@/app/_shared/route-guards';
import { GenerateOptionsManager } from '../GenerateOptionsManager';

export default function AdminGenerateCopyTypesPage() {
  return (
    <AdminRoute path="/admin/generate-options/copy-types">
      <GenerateOptionsManager
        group="copy-types"
        title="Quản lý loại nội dung Generate"
        description="Thêm, sửa, bật/tắt các loại nội dung người dùng chọn ở mục Loại nội dung trong trang Generate."
        noun="loại nội dung"
        iconHint="Megaphone"
      />
    </AdminRoute>
  );
}
