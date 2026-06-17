'use client';

import { AdminRoute } from '@/app/_shared/route-guards';
import { GenerateOptionsManager } from '../GenerateOptionsManager';

export default function AdminGenerateTonesPage() {
  return (
    <AdminRoute path="/admin/generate-options/tones">
      <GenerateOptionsManager
        group="tones"
        title="Quản lý tone giọng văn Generate"
        description="Thêm, sửa, bật/tắt các tone hoặc cảm xúc người dùng chọn ở mục Tone giọng văn trong trang Generate."
        noun="tone giọng văn"
        iconHint="fire"
      />
    </AdminRoute>
  );
}
