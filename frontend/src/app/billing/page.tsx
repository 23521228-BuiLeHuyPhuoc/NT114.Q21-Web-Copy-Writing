'use client';

import { ProtectedRoute } from '@/app/route-guards';
import { CustomerBilling } from '@/app/pages/customer/Billing';

export default function Billing() {
  return (
    <ProtectedRoute requiredRole="customer">
      <CustomerBilling />
    </ProtectedRoute>
  );
}
