'use client';

import { ProtectedRoute } from '@/app/route-guards';
import { CustomerDashboard } from '@/app/pages/customer/Dashboard';

export default function Dashboard() {
  return (
    <ProtectedRoute requiredRole="customer">
      <CustomerDashboard />
    </ProtectedRoute>
  );
}
