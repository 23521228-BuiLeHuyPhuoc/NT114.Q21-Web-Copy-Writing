import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from '@/app/contexts/AuthContext';
import { queryClient } from '@/lib/queryClient';
import { AdminAccessDenied } from '@/app/components/AdminAccessDenied';
import { hasPermission, PERMISSION_ROUTE_MAP } from '@/lib/permissions';
import type { AdminPermission } from '@/lib/permissions';

// Public
import { LandingPage } from '@/app/pages/LandingPage';
import { PricingPage } from '@/app/pages/PricingPage';
import { LoginPage } from '@/app/pages/LoginPage';
import { RegisterPage } from '@/app/pages/RegisterPage';
import { ForgotPasswordPage } from '@/app/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/app/pages/ResetPasswordPage';
import { AboutPage } from '@/app/pages/AboutPage';
import { BlogPage } from '@/app/pages/BlogPage';
import { BlogDetailPage } from '@/app/pages/BlogDetailPage';
import { ContactPage } from '@/app/pages/ContactPage';
import { AdminLoginPage } from '@/app/pages/AdminLoginPage';
import { AdminRegisterPage } from '@/app/pages/AdminRegisterPage';

// Customer
import { CustomerDashboard } from '@/app/pages/customer/Dashboard';
import { CustomerGenerator } from '@/app/pages/customer/Generator';
import { CustomerContents } from '@/app/pages/customer/Contents';
import { CustomerContentDetail } from '@/app/pages/customer/ContentDetail';
import { CustomerProjects } from '@/app/pages/customer/Projects';
import { CustomerProjectDetail } from '@/app/pages/customer/ProjectDetail';
import { CustomerTemplates } from '@/app/pages/customer/Templates';
import { CustomerFineTuningStudio } from '@/app/pages/customer/FineTuningStudio';
import { CustomerPlagiarismCheck } from '@/app/pages/customer/PlagiarismCheck';
import { CustomerProfile } from '@/app/pages/customer/Profile';
import { CustomerBilling } from '@/app/pages/customer/Billing';
import { CustomerNotifications } from '@/app/pages/customer/Notifications';

// Admin
import { AdminDashboard } from '@/app/pages/admin/Dashboard';
import { AdminUsers } from '@/app/pages/admin/Users';
import { AdminContents } from '@/app/pages/admin/Contents';
import { AdminTemplates } from '@/app/pages/admin/Templates';
import { AdminCategories } from '@/app/pages/admin/Categories';
import { AdminPlans } from '@/app/pages/admin/Plans';
import { AdminPayments } from '@/app/pages/admin/Payments';
import { AdminModelManagement } from '@/app/pages/admin/ModelManagement';
import { AdminSettings } from '@/app/pages/admin/Settings';
import { AdminAuditLogs } from '@/app/pages/admin/AuditLogs';
import { AdminPermissions } from '@/app/pages/admin/Permissions';

/* ── Generic protected route (customer / admin check) ─────────── */
function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'customer';
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 text-sm">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return <>{children}</>;
}

/* ── Admin route with fine-grained permission check ───────────── */
function AdminRoute({
  children,
  path,
}: {
  children: React.ReactNode;
  path: string;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 text-sm">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/admin/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;

  const permission = PERMISSION_ROUTE_MAP[path] as AdminPermission | undefined;
  if (permission && !hasPermission(user.adminRole, permission)) {
    return <AdminAccessDenied />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
          {/* ── Public Routes ─────────────────── */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogDetailPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/register" element={<AdminRegisterPage />} />

          {/* ── Customer Routes ───────────────── */}
          <Route path="/dashboard" element={<ProtectedRoute requiredRole="customer"><CustomerDashboard /></ProtectedRoute>} />
          <Route path="/generate" element={<ProtectedRoute requiredRole="customer"><CustomerGenerator /></ProtectedRoute>} />
          <Route path="/contents" element={<ProtectedRoute requiredRole="customer"><CustomerContents /></ProtectedRoute>} />
          <Route path="/contents/:id" element={<ProtectedRoute requiredRole="customer"><CustomerContentDetail /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute requiredRole="customer"><CustomerProjects /></ProtectedRoute>} />
          <Route path="/projects/:id" element={<ProtectedRoute requiredRole="customer"><CustomerProjectDetail /></ProtectedRoute>} />
          <Route path="/templates" element={<ProtectedRoute requiredRole="customer"><CustomerTemplates /></ProtectedRoute>} />
          <Route path="/fine-tune" element={<ProtectedRoute requiredRole="customer"><CustomerFineTuningStudio /></ProtectedRoute>} />
          <Route path="/plagiarism-check" element={<ProtectedRoute requiredRole="customer"><CustomerPlagiarismCheck /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute requiredRole="customer"><CustomerProfile /></ProtectedRoute>} />
          <Route path="/billing" element={<ProtectedRoute requiredRole="customer"><CustomerBilling /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute requiredRole="customer"><CustomerNotifications /></ProtectedRoute>} />

          {/* Legacy redirects */}
          <Route path="/generator" element={<Navigate to="/generate" replace />} />
          <Route path="/history" element={<Navigate to="/contents" replace />} />
          <Route path="/subscription" element={<Navigate to="/billing" replace />} />
          <Route path="/fine-tuning" element={<Navigate to="/fine-tune" replace />} />
          <Route path="/api-keys" element={<Navigate to="/dashboard" replace />} />

          {/* ── Admin Routes (permission-gated) ─ */}
          <Route path="/admin"              element={<AdminRoute path="/admin"><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/users"        element={<AdminRoute path="/admin/users"><AdminUsers /></AdminRoute>} />
          <Route path="/admin/contents"     element={<AdminRoute path="/admin/contents"><AdminContents /></AdminRoute>} />
          <Route path="/admin/templates"    element={<AdminRoute path="/admin/templates"><AdminTemplates /></AdminRoute>} />
          <Route path="/admin/categories"   element={<AdminRoute path="/admin/categories"><AdminCategories /></AdminRoute>} />
          <Route path="/admin/plans"        element={<AdminRoute path="/admin/plans"><AdminPlans /></AdminRoute>} />
          <Route path="/admin/payments"     element={<AdminRoute path="/admin/payments"><AdminPayments /></AdminRoute>} />
          <Route path="/admin/models"       element={<AdminRoute path="/admin/models"><AdminModelManagement /></AdminRoute>} />
          <Route path="/admin/settings"     element={<AdminRoute path="/admin/settings"><AdminSettings /></AdminRoute>} />
          <Route path="/admin/audit-logs"   element={<AdminRoute path="/admin/audit-logs"><AdminAuditLogs /></AdminRoute>} />
          <Route path="/admin/permissions"  element={<AdminRoute path="/admin/permissions"><AdminPermissions /></AdminRoute>} />

          {/* Legacy admin redirects */}
          <Route path="/admin/analytics"   element={<Navigate to="/admin" replace />} />
          <Route path="/admin/fine-tuning" element={<Navigate to="/admin/models" replace />} />
          <Route path="/admin/api"         element={<Navigate to="/admin/settings" replace />} />

          {/* ── Fallback ──────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      </AuthProvider>
    </BrowserRouter>
    </QueryClientProvider>
  );
}
