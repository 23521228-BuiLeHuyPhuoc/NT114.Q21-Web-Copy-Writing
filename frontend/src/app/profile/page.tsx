'use client';

import { ProtectedRoute } from '@/app/route-guards';
import { CustomerProfile } from '@/app/pages/customer/Profile';

export default function Profile() {
  return (
    <ProtectedRoute requiredRole="customer">
      <CustomerProfile />
    </ProtectedRoute>
  );
}
