'use client';

import { ProtectedRoute } from '@/app/route-guards';
import { CustomerGenerator } from '@/app/pages/customer/Generator';

export default function Generate() {
  return (
    <ProtectedRoute requiredRole="customer">
      <CustomerGenerator />
    </ProtectedRoute>
  );
}
