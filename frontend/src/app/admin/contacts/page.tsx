'use client';

import { AdminRoute } from '@/app/_shared/route-guards';
import { AdminContacts } from './Contacts';

export default function AdminContactsPage() {
  return (
    <AdminRoute path="/admin/contacts">
      <AdminContacts />
    </AdminRoute>
  );
}
