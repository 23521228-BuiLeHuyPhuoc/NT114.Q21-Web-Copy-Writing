'use client';

import { ProtectedRoute } from '@/app/route-guards';
import { CustomerProjectDetail } from '@/app/pages/customer/ProjectDetail';

export default function ProjectDetail() {
  return (
    <ProtectedRoute requiredRole="customer">
      <CustomerProjectDetail />
    </ProtectedRoute>
  );
}
