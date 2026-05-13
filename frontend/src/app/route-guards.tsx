'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { AdminAccessDenied } from '@/app/components/admin/AdminAccessDenied';
import { hasPermission, PERMISSION_ROUTE_MAP } from '@/lib/permissions';
import type { AdminPermission } from '@/lib/permissions';

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600 text-sm">Đang tải...</p>
      </div>
    </div>
  );
}

export function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'customer';
}) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (requiredRole && user.role !== requiredRole) {
      router.replace(user.role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [isLoading, requiredRole, router, user]);

  if (isLoading || !user || (requiredRole && user.role !== requiredRole)) {
    return <LoadingState />;
  }

  return <>{children}</>;
}

export function AdminRoute({
  children,
  path,
}: {
  children: React.ReactNode;
  path: string;
}) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/admin/login');
      return;
    }
    if (user.role !== 'admin') {
      router.replace('/dashboard');
    }
  }, [isLoading, router, user]);

  if (isLoading || !user || user.role !== 'admin') {
    return <LoadingState />;
  }

  const permission = PERMISSION_ROUTE_MAP[path] as AdminPermission | undefined;
  if (permission && !hasPermission(user.adminRole, permission)) {
    return <AdminAccessDenied />;
  }

  return <>{children}</>;
}
