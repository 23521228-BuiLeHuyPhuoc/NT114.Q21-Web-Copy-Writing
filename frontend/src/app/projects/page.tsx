'use client';

import { ProtectedRoute } from '@/app/route-guards';
import { CustomerProjects } from '@/app/pages/customer/Projects';

export default function Projects() {
  return (
    <ProtectedRoute requiredRole="customer">
      <CustomerProjects />
    </ProtectedRoute>
  );
}
