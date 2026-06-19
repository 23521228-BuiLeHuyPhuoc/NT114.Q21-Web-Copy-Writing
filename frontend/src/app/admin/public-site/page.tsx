'use client';

import { AdminRoute } from '@/app/_shared/route-guards';
import { PublicSiteManager } from './PublicSiteManager';

export default function AdminPublicSitePage() {
  return (
    <AdminRoute path="/admin/public-site">
      <PublicSiteManager />
    </AdminRoute>
  );
}
