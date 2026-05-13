'use client';

import { ProtectedRoute } from '@/app/route-guards';
import { CustomerPlagiarismCheck } from '@/app/pages/customer/PlagiarismCheck';

export default function PlagiarismCheck() {
  return (
    <ProtectedRoute requiredRole="customer">
      <CustomerPlagiarismCheck />
    </ProtectedRoute>
  );
}
