'use client';

import { ProtectedRoute } from '@/app/route-guards';
import { CustomerFineTuningStudio } from '@/app/pages/customer/FineTuningStudio';

export default function FineTune() {
  return (
    <ProtectedRoute requiredRole="customer">
      <CustomerFineTuningStudio />
    </ProtectedRoute>
  );
}
