'use client';

import { usePathname } from 'next/navigation';
import { Clock, Mail, ShieldCheck } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { BrandLogo } from '@/app/components/BrandLogo';
import { useAuth } from '@/app/contexts/AuthContext';
import { usePublicSystemStatus } from '@/hooks/queries/useSystemSettings';

function MaintenancePage({
  message,
  supportEmail,
  siteName,
}: {
  message: string;
  supportEmail: string;
  siteName: string;
}) {
  return (
    <main className="min-h-screen bg-surface-muted px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl flex-col justify-center">
        <div className="mb-8">
          <BrandLogo size="lg" />
        </div>
        <div className="rounded-lg border border-amber-200 bg-card p-8 shadow-sm">
          <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
            <Clock className="h-6 w-6" />
          </div>
          <h1 className="mb-3 text-3xl font-bold text-foreground">{siteName} đang bảo trì</h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            {message || 'Hệ thống đang bảo trì. Vui lòng quay lại sau.'}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild variant="outline" className="gap-2">
              <a href={`mailto:${supportEmail}`}>
                <Mail className="h-4 w-4" />
                Liên hệ hỗ trợ
              </a>
            </Button>
            <Button asChild className="gap-2">
              <a href="/admin/login">
                <ShieldCheck className="h-4 w-4" />
                Đăng nhập admin
              </a>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

export function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const isAdminRoute = pathname?.startsWith('/admin');
  const { data: status } = usePublicSystemStatus(!isAdminRoute);

  if (!isAdminRoute && status?.maintenanceMode && !isLoading && user?.role !== 'admin') {
    return (
      <MaintenancePage
        siteName={status.siteName}
        supportEmail={status.supportEmail}
        message={status.maintenanceMessage}
      />
    );
  }

  return <>{children}</>;
}
