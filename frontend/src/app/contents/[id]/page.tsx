'use client';

import { ProtectedRoute } from '@/app/route-guards';
import { CustomerContentDetail } from '@/app/pages/customer/ContentDetail';

export default function ContentDetail() {
  return (
    <ProtectedRoute requiredRole="customer">
      <CustomerContentDetail />
    </ProtectedRoute>
  );
}
