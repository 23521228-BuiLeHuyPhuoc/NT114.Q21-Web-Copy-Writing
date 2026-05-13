'use client';

import { AdminRoute } from '@/app/route-guards';
import { AdminAuditLogs } from '@/app/pages/admin/AuditLogs';

export default function AdminAuditLogsPage() {
  return (
    <AdminRoute path="/admin/audit-logs">
      <AdminAuditLogs />
    </AdminRoute>
  );
}
