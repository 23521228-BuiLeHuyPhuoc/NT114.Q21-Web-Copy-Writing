'use client';

import { ProtectedRoute } from '@/app/route-guards';
import { CustomerTemplates } from '@/app/pages/customer/Templates';

export default function Templates() {
  return (
    <ProtectedRoute requiredRole="customer">
      <CustomerTemplates />
    </ProtectedRoute>
  );
}
