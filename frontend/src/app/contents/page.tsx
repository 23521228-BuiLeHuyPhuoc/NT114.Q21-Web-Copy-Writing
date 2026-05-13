'use client';

import { ProtectedRoute } from '@/app/route-guards';
import { CustomerContents } from '@/app/pages/customer/Contents';

export default function Contents() {
  return (
    <ProtectedRoute requiredRole="customer">
      <CustomerContents />
    </ProtectedRoute>
  );
}
