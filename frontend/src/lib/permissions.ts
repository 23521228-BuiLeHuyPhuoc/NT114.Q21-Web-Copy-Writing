import {
  Bell,
  Cpu,
  Crown,
  DollarSign,
  FileText,
  Globe2,
  Inbox,
  KeyRound,
  LayoutDashboard,
  MessageSquare,
  ScrollText,
  Settings,
  Shield,
  Tag,
  Users,
} from 'lucide-react';

export type AdminRole = string;
export type CustomerRole = string;
export type AdminPermission = string;
export type PermissionScope = 'admin' | 'customer';

export interface PermissionRouteOption {
  scope: PermissionScope;
  route: string;
  label: string;
  group: string;
}

export interface AdminPermissionDef {
  key: AdminPermission;
  label: string;
  description: string;
  group: string;
  route?: string;
  scope?: PermissionScope;
  system?: boolean;
}

export interface AdminRoleDef {
  label: string;
  description: string;
  color: string;
  textColor: string;
  borderColor: string;
  dotColor: string;
  permissions: AdminPermission[];
  system?: boolean;
}

export type CustomerRoleDef = AdminRoleDef;

const ROLE_STORAGE_KEY = 'admin_role_defs';
const CUSTOMER_ROLE_STORAGE_KEY = 'customer_role_defs';
const PERMISSION_STORAGE_KEY = 'admin_permission_defs';
const DEFAULT_CUSTOMER_ROLE: CustomerRole = 'free_customer';

export const PERMISSION_ROUTE_OPTIONS: PermissionRouteOption[] = [
  { scope: 'admin', route: '/admin', label: 'Bảng điều khiển admin', group: 'Tổng quan' },
  { scope: 'admin', route: '/admin/users', label: 'Tài khoản người dùng', group: 'Người dùng' },
  { scope: 'admin', route: '/admin/notifications', label: 'Thông báo admin', group: 'Người dùng' },
  { scope: 'admin', route: '/admin/contents', label: 'Nội dung đã tạo', group: 'Nội dung' },
  { scope: 'admin', route: '/admin/templates', label: 'Mẫu copy', group: 'Nội dung' },
  { scope: 'admin', route: '/admin/generate-options/industries', label: 'Cấu hình ngành nghề', group: 'Cấu hình tạo nội dung' },
  { scope: 'admin', route: '/admin/generate-options/copy-types', label: 'Cấu hình loại nội dung', group: 'Cấu hình tạo nội dung' },
  { scope: 'admin', route: '/admin/generate-options/tones', label: 'Cấu hình tone giọng', group: 'Cấu hình tạo nội dung' },
  { scope: 'admin', route: '/admin/models', label: 'Mô hình AI', group: 'AI & mô hình' },
  { scope: 'admin', route: '/admin/plans', label: 'Gói dịch vụ', group: 'Tài chính' },
  { scope: 'admin', route: '/admin/payments', label: 'Giao dịch thanh toán', group: 'Tài chính' },
  { scope: 'admin', route: '/admin/permissions', label: 'Phân quyền admin', group: 'Hệ thống' },
  { scope: 'admin', route: '/admin/audit-logs', label: 'Nhật ký audit', group: 'Hệ thống' },
  { scope: 'admin', route: '/admin/settings', label: 'Cài đặt hệ thống', group: 'Hệ thống' },
  { scope: 'admin', route: '/admin/profile', label: 'Hồ sơ admin', group: 'Hệ thống' },
  { scope: 'customer', route: '/dashboard', label: 'Bảng điều khiển khách hàng', group: 'Customer - Tổng quan' },
  { scope: 'customer', route: '/generate', label: 'Tạo nội dung AI', group: 'Customer - Sáng tạo nội dung' },
  { scope: 'customer', route: '/contents', label: 'Nội dung của tôi', group: 'Customer - Sáng tạo nội dung' },
  { scope: 'customer', route: '/contents/[id]', label: 'Chi tiết nội dung', group: 'Customer - Sáng tạo nội dung' },
  { scope: 'customer', route: '/projects', label: 'Dự án', group: 'Customer - Sáng tạo nội dung' },
  { scope: 'customer', route: '/projects/[id]', label: 'Chi tiết dự án', group: 'Customer - Sáng tạo nội dung' },
  { scope: 'customer', route: '/templates', label: 'Mẫu copy', group: 'Customer - Sáng tạo nội dung' },
  { scope: 'customer', route: '/fine-tune', label: 'Fine-tuning', group: 'Customer - AI nâng cao' },
  { scope: 'customer', route: '/plagiarism-check', label: 'Kiểm tra đạo văn', group: 'Customer - AI nâng cao' },
  { scope: 'customer', route: '/profile', label: 'Hồ sơ khách hàng', group: 'Customer - Tài khoản' },
  { scope: 'customer', route: '/billing', label: 'Gói & thanh toán', group: 'Customer - Tài khoản' },
  { scope: 'customer', route: '/notifications', label: 'Thông báo khách hàng', group: 'Customer - Tài khoản' },
];

export const ADMIN_PERMISSIONS: AdminPermissionDef[] = [
  { key: 'dashboard', label: 'Bảng điều khiển', description: 'Xem tổng quan hệ thống', group: 'Tổng quan', route: '/admin', scope: 'admin', system: true },
  { key: 'users', label: 'Tài khoản người dùng', description: 'Xem, duyệt và chỉnh sửa tài khoản', group: 'Người dùng', route: '/admin/users', scope: 'admin', system: true },
  { key: 'notifications', label: 'Thông báo', description: 'Gửi thông báo tới khách hàng và admin', group: 'Người dùng', route: '/admin/notifications', scope: 'admin', system: true },
  { key: 'contents', label: 'Nội dung đã tạo', description: 'Quản lý nội dung copy đã tạo', group: 'Nội dung', route: '/admin/contents', scope: 'admin', system: true },
  { key: 'templates', label: 'Mẫu copy', description: 'Quản lý mẫu copywriting', group: 'Nội dung', route: '/admin/templates', scope: 'admin', system: true },
  { key: 'generate_industries', label: 'Ngành nghề', description: 'Quản lý ngành nghề trong trang tạo nội dung', group: 'Cấu hình tạo nội dung', route: '/admin/generate-options/industries', scope: 'admin', system: true },
  { key: 'generate_copy_types', label: 'Loại nội dung', description: 'Quản lý loại nội dung trong trang tạo nội dung', group: 'Cấu hình tạo nội dung', route: '/admin/generate-options/copy-types', scope: 'admin', system: true },
  { key: 'generate_tones', label: 'Tone giọng', description: 'Quản lý tone/cảm xúc trong trang tạo nội dung', group: 'Cấu hình tạo nội dung', route: '/admin/generate-options/tones', scope: 'admin', system: true },
  { key: 'plans', label: 'Gói dịch vụ', description: 'Quản lý subscription plan', group: 'Tài chính', route: '/admin/plans', scope: 'admin', system: true },
  { key: 'payments', label: 'Giao dịch thanh toán', description: 'Xem giao dịch và doanh thu', group: 'Tài chính', route: '/admin/payments', scope: 'admin', system: true },
  { key: 'models', label: 'Mô hình AI', description: 'Quản lý model và fine-tuning', group: 'AI & mô hình', route: '/admin/models', scope: 'admin', system: true },
  { key: 'settings', label: 'Cài đặt hệ thống', description: 'Quản lý cấu hình hệ thống', group: 'Hệ thống', route: '/admin/settings', scope: 'admin', system: true },
  { key: 'audit_logs', label: 'Nhật ký audit', description: 'Xem audit log quản trị', group: 'Hệ thống', route: '/admin/audit-logs', scope: 'admin', system: true },
  { key: 'permissions', label: 'Phân quyền admin', description: 'Tạo quyền và loại admin', group: 'Hệ thống', route: '/admin/permissions', scope: 'admin', system: true },
  { key: 'customer_dashboard', label: 'Bảng điều khiển khách hàng', description: 'Truy cập tổng quan tài khoản khách hàng', group: 'Customer - Tổng quan', route: '/dashboard', scope: 'customer', system: true },
  { key: 'customer_generate', label: 'Tạo nội dung AI', description: 'Truy cập công cụ tạo nội dung AI', group: 'Customer - Sáng tạo nội dung', route: '/generate', scope: 'customer', system: true },
  { key: 'customer_contents', label: 'Nội dung của tôi', description: 'Xem danh sách nội dung đã tạo của khách hàng', group: 'Customer - Sáng tạo nội dung', route: '/contents', scope: 'customer', system: true },
  { key: 'customer_content_detail', label: 'Chi tiết nội dung', description: 'Xem chi tiết một nội dung đã tạo', group: 'Customer - Sáng tạo nội dung', route: '/contents/[id]', scope: 'customer', system: true },
  { key: 'customer_projects', label: 'Dự án', description: 'Truy cập danh sách dự án của khách hàng', group: 'Customer - Sáng tạo nội dung', route: '/projects', scope: 'customer', system: true },
  { key: 'customer_project_detail', label: 'Chi tiết dự án', description: 'Xem nội dung và thông tin trong một dự án', group: 'Customer - Sáng tạo nội dung', route: '/projects/[id]', scope: 'customer', system: true },
  { key: 'customer_templates', label: 'Mẫu copy khách hàng', description: 'Truy cập thư viện mẫu copy phía khách hàng', group: 'Customer - Sáng tạo nội dung', route: '/templates', scope: 'customer', system: true },
  { key: 'customer_fine_tune', label: 'Fine-tuning', description: 'Truy cập studio fine-tuning của khách hàng', group: 'Customer - AI nâng cao', route: '/fine-tune', scope: 'customer', system: true },
  { key: 'customer_plagiarism', label: 'Kiểm tra đạo văn', description: 'Truy cập công cụ kiểm tra đạo văn', group: 'Customer - AI nâng cao', route: '/plagiarism-check', scope: 'customer', system: true },
  { key: 'customer_profile', label: 'Hồ sơ khách hàng', description: 'Truy cập và cập nhật hồ sơ khách hàng', group: 'Customer - Tài khoản', route: '/profile', scope: 'customer', system: true },
  { key: 'customer_billing', label: 'Gói & thanh toán', description: 'Truy cập gói dịch vụ và hóa đơn khách hàng', group: 'Customer - Tài khoản', route: '/billing', scope: 'customer', system: true },
  { key: 'customer_notifications', label: 'Thông báo khách hàng', description: 'Xem thông báo phía khách hàng', group: 'Customer - Tài khoản', route: '/notifications', scope: 'customer', system: true },
];

PERMISSION_ROUTE_OPTIONS.push({
  scope: 'admin',
  route: '/admin/public-site',
  label: 'Public site',
  group: 'Noi dung',
});

ADMIN_PERMISSIONS.push({
  key: 'public_site',
  label: 'Public site',
  description: 'Quan ly home, about, blog, contact va footer ngoai website',
  group: 'Noi dung',
  route: '/admin/public-site',
  scope: 'admin',
  system: true,
});

PERMISSION_ROUTE_OPTIONS.push({
  scope: 'admin',
  route: '/admin/contacts',
  label: 'Lien he',
  group: 'Nguoi dung',
});

ADMIN_PERMISSIONS.push({
  key: 'contacts',
  label: 'Lien he',
  description: 'Quan ly tin nhan lien he tu public site',
  group: 'Nguoi dung',
  route: '/admin/contacts',
  scope: 'admin',
  system: true,
});

export const ADMIN_ROLES: Record<AdminRole, AdminRoleDef> = {
  super_admin: {
    label: 'Super Admin',
    description: 'Toàn quyền truy cập và quản lý toàn bộ hệ thống',
    color: 'bg-emerald-100',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    dotColor: 'bg-emerald-500',
    permissions: ADMIN_PERMISSIONS.map((permission) => permission.key),
    system: true,
  },
  content_manager: {
    label: 'Content Manager',
    description: 'Quản lý nội dung, mẫu copy và cấu hình tạo nội dung',
    color: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
    dotColor: 'bg-green-500',
    permissions: ['dashboard', 'contents', 'templates', 'public_site', 'contacts', 'generate_industries', 'generate_copy_types', 'generate_tones'],
    system: true,
  },
  user_manager: {
    label: 'User Manager',
    description: 'Quản lý tài khoản và hồ sơ người dùng',
    color: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
    dotColor: 'bg-green-500',
    permissions: ['dashboard', 'users', 'notifications', 'contacts'],
    system: true,
  },
  finance_manager: {
    label: 'Finance Manager',
    description: 'Quản lý gói dịch vụ, thanh toán và doanh thu',
    color: 'bg-amber-100',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
    dotColor: 'bg-amber-500',
    permissions: ['dashboard', 'plans', 'payments'],
    system: true,
  },
  ai_engineer: {
    label: 'AI Engineer',
    description: 'Cấu hình và vận hành mô hình AI, fine-tuning',
    color: 'bg-teal-100',
    textColor: 'text-teal-700',
    borderColor: 'border-teal-200',
    dotColor: 'bg-teal-500',
    permissions: ['dashboard', 'models'],
    system: true,
  },
  analyst: {
    label: 'Analyst',
    description: 'Xem báo cáo, audit log và phân tích dữ liệu',
    color: 'bg-rose-100',
    textColor: 'text-rose-700',
    borderColor: 'border-rose-200',
    dotColor: 'bg-rose-500',
    permissions: ['dashboard', 'audit_logs'],
    system: true,
  },
};

const CUSTOMER_BASE_PERMISSION_KEYS = ADMIN_PERMISSIONS
  .filter((permission) => permission.scope === 'customer')
  .map((permission) => permission.key);

const CUSTOMER_STANDARD_PERMISSION_KEYS = CUSTOMER_BASE_PERMISSION_KEYS.filter((permission) => (
  !['customer_fine_tune', 'customer_plagiarism'].includes(permission)
));

export const CUSTOMER_ROLES: Record<CustomerRole, CustomerRoleDef> = {
  free_customer: {
    label: 'Khách hàng Free',
    description: 'Quyền cơ bản để tạo nội dung, xem nội dung đã tạo và quản lý tài khoản.',
    color: 'bg-slate-100',
    textColor: 'text-slate-700',
    borderColor: 'border-slate-200',
    dotColor: 'bg-slate-500',
    permissions: CUSTOMER_STANDARD_PERMISSION_KEYS.filter((permission) => (
      !['customer_projects', 'customer_project_detail'].includes(permission)
    )),
    system: true,
  },
  pro_customer: {
    label: 'Khách hàng Pro',
    description: 'Quyền mặc định cho khách hàng hiện tại, bao gồm các trang customer đang có.',
    color: 'bg-teal-100',
    textColor: 'text-teal-700',
    borderColor: 'border-teal-200',
    dotColor: 'bg-teal-500',
    permissions: CUSTOMER_BASE_PERMISSION_KEYS,
    system: true,
  },
  business_customer: {
    label: 'Khách hàng Business',
    description: 'Quyền nâng cao cho nhóm khách hàng cần dự án, AI nâng cao và thanh toán.',
    color: 'bg-emerald-100',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    dotColor: 'bg-emerald-500',
    permissions: CUSTOMER_BASE_PERMISSION_KEYS,
    system: true,
  },
};

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (canUseStorage()) {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
}

function normalizeRoute(route: string) {
  if (!route || route === '/') return route;
  return route.endsWith('/') ? route.slice(0, -1) : route;
}

function routeMatches(pattern: string, path: string) {
  const normalizedPattern = normalizeRoute(pattern);
  const normalizedPath = normalizeRoute(path);
  if (normalizedPattern === normalizedPath) return true;

  const patternParts = normalizedPattern.split('/').filter(Boolean);
  const pathParts = normalizedPath.split('/').filter(Boolean);
  if (patternParts.length !== pathParts.length) return false;

  return patternParts.every((part, index) => (
    (part.startsWith('[') && part.endsWith(']')) || part === pathParts[index]
  ));
}

function inferPermissionScope(route?: string): PermissionScope {
  return route?.startsWith('/admin') ? 'admin' : 'customer';
}

function hydratePermission(permission: AdminPermissionDef): AdminPermissionDef {
  const routeOption = permission.route
    ? PERMISSION_ROUTE_OPTIONS.find((option) => option.route === normalizeRoute(permission.route || ''))
    : undefined;

  return {
    ...permission,
    route: permission.route ? normalizeRoute(permission.route) : permission.route,
    scope: permission.scope ?? routeOption?.scope ?? inferPermissionScope(permission.route),
  };
}

export function getPermissionScope(permission: AdminPermissionDef): PermissionScope {
  return permission.scope ?? inferPermissionScope(permission.route);
}

export function getPermissionScopeLabel(scope: PermissionScope) {
  return scope === 'admin' ? 'Admin' : 'Customer';
}

export function getAdminPermissions(): AdminPermissionDef[] {
  const stored = readJson<AdminPermissionDef[]>(PERMISSION_STORAGE_KEY, []);
  const merged = ADMIN_PERMISSIONS.map(hydratePermission);

  stored.forEach((permission) => {
    const normalizedPermission = hydratePermission(permission);
    const index = merged.findIndex((item) => item.key === permission.key);
    if (index >= 0) {
      if (!merged[index].system) merged[index] = { ...merged[index], ...normalizedPermission };
    } else {
      merged.push(normalizedPermission);
    }
  });

  return merged;
}

export function getPermissionsByScope(scope: PermissionScope): AdminPermissionDef[] {
  return getAdminPermissions().filter((permission) => getPermissionScope(permission) === scope);
}

export function saveAdminPermissions(permissions: AdminPermissionDef[]) {
  writeJson(PERMISSION_STORAGE_KEY, permissions);
}

export function getAdminRoles(): Record<AdminRole, AdminRoleDef> {
  const stored = readJson<Record<AdminRole, AdminRoleDef>>(ROLE_STORAGE_KEY, {});
  const merged: Record<AdminRole, AdminRoleDef> = { ...ADMIN_ROLES };

  Object.entries(stored).forEach(([key, role]) => {
    const systemRole = ADMIN_ROLES[key];
    if (systemRole?.system) {
      merged[key] = {
        ...systemRole,
        permissions: Array.isArray(role.permissions) ? role.permissions : systemRole.permissions,
      };
      return;
    }

    merged[key] = role;
  });

  return merged;
}

export function saveAdminRoles(roles: Record<AdminRole, AdminRoleDef>) {
  writeJson(ROLE_STORAGE_KEY, roles);
}

export function getCustomerRoles(): Record<CustomerRole, CustomerRoleDef> {
  const stored = readJson<Record<CustomerRole, CustomerRoleDef>>(CUSTOMER_ROLE_STORAGE_KEY, {});
  const validCustomerPermissions = new Set(getPermissionsByScope('customer').map((permission) => permission.key));
  const merged: Record<CustomerRole, CustomerRoleDef> = { ...CUSTOMER_ROLES };

  Object.entries(stored).forEach(([key, role]) => {
    const systemRole = CUSTOMER_ROLES[key];
    const permissions = Array.isArray(role.permissions)
      ? role.permissions.filter((permission) => validCustomerPermissions.has(permission))
      : systemRole?.permissions || [];

    if (systemRole?.system) {
      merged[key] = {
        ...systemRole,
        permissions,
      };
      return;
    }

    merged[key] = {
      ...role,
      permissions,
    };
  });

  return merged;
}

export function saveCustomerRoles(roles: Record<CustomerRole, CustomerRoleDef>) {
  writeJson(CUSTOMER_ROLE_STORAGE_KEY, roles);
}

export function resetAdminPermissionConfig() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(ROLE_STORAGE_KEY);
  window.localStorage.removeItem(CUSTOMER_ROLE_STORAGE_KEY);
  window.localStorage.removeItem(PERMISSION_STORAGE_KEY);
}

export const ADMIN_MENU_ITEMS = [
  { section: 'Tổng quan', label: 'Bảng điều khiển', icon: LayoutDashboard, path: '/admin', permission: 'dashboard' as AdminPermission },
  { section: 'Nội dung', label: 'Nội dung đã tạo', icon: FileText, path: '/admin/contents', permission: 'contents' as AdminPermission },
  { section: 'Nội dung', label: 'Mẫu copy', icon: ScrollText, path: '/admin/templates', permission: 'templates' as AdminPermission },
  { section: 'Cấu hình tạo nội dung', label: 'Ngành nghề', icon: Tag, path: '/admin/generate-options/industries', permission: 'generate_industries' as AdminPermission },
  { section: 'Cấu hình tạo nội dung', label: 'Loại nội dung', icon: FileText, path: '/admin/generate-options/copy-types', permission: 'generate_copy_types' as AdminPermission },
  { section: 'Cấu hình tạo nội dung', label: 'Tone giọng', icon: MessageSquare, path: '/admin/generate-options/tones', permission: 'generate_tones' as AdminPermission },
  { section: 'AI & mô hình', label: 'Mô hình AI', icon: Cpu, path: '/admin/models', permission: 'models' as AdminPermission },
  { section: 'Người dùng', label: 'Tài khoản', icon: Users, path: '/admin/users', permission: 'users' as AdminPermission },
  { section: 'Người dùng', label: 'Thông báo', icon: Bell, path: '/admin/notifications', permission: 'notifications' as AdminPermission },
  { section: 'Tài chính', label: 'Gói dịch vụ', icon: Crown, path: '/admin/plans', permission: 'plans' as AdminPermission },
  { section: 'Tài chính', label: 'Giao dịch', icon: DollarSign, path: '/admin/payments', permission: 'payments' as AdminPermission },
  { section: 'Hệ thống', label: 'Phân quyền', icon: KeyRound, path: '/admin/permissions', permission: 'permissions' as AdminPermission },
  { section: 'Hệ thống', label: 'Nhật ký audit', icon: Shield, path: '/admin/audit-logs', permission: 'audit_logs' as AdminPermission },
  { section: 'Hệ thống', label: 'Cài đặt', icon: Settings, path: '/admin/settings', permission: 'settings' as AdminPermission },
];

const publicSiteMenuSection = ADMIN_MENU_ITEMS.find(item => item.path === '/admin/contents')?.section || 'Noi dung';
ADMIN_MENU_ITEMS.splice(3, 0, {
  section: publicSiteMenuSection,
  label: 'Public site',
  icon: Globe2,
  path: '/admin/public-site',
  permission: 'public_site' as AdminPermission,
});

const notificationsMenuIndex = ADMIN_MENU_ITEMS.findIndex(item => item.path === '/admin/notifications');
ADMIN_MENU_ITEMS.splice(notificationsMenuIndex >= 0 ? notificationsMenuIndex + 1 : ADMIN_MENU_ITEMS.length, 0, {
  section: 'Người dùng',
  label: 'Liên hệ',
  icon: Inbox,
  path: '/admin/contacts',
  permission: 'contacts' as AdminPermission,
});

export const PERMISSION_ROUTE_MAP: Record<string, AdminPermission> = {
  '/admin': 'dashboard',
  '/admin/users': 'users',
  '/admin/notifications': 'notifications',
  '/admin/contacts': 'contacts',
  '/admin/contents': 'contents',
  '/admin/templates': 'templates',
  '/admin/public-site': 'public_site',
  '/admin/generate-options/industries': 'generate_industries',
  '/admin/generate-options/copy-types': 'generate_copy_types',
  '/admin/generate-options/tones': 'generate_tones',
  '/admin/plans': 'plans',
  '/admin/payments': 'payments',
  '/admin/models': 'models',
  '/admin/settings': 'settings',
  '/admin/audit-logs': 'audit_logs',
  '/admin/permissions': 'permissions',
};

export function getPermissionForRoute(path: string, scope?: PermissionScope): AdminPermission | undefined {
  const route = normalizeRoute(path);
  const matchedPermission = getAdminPermissions().find((permission) => {
    if (!permission.route) return false;
    if (!routeMatches(permission.route, route)) return false;
    return !scope || getPermissionScope(permission) === scope;
  });

  return matchedPermission?.key ?? PERMISSION_ROUTE_MAP[route];
}

export function hasPermission(adminRole: AdminRole | undefined, permission: AdminPermission): boolean {
  if (!adminRole) return false;
  if (adminRole === 'super_admin') return true;
  return getAdminRoles()[adminRole]?.permissions.includes(permission) ?? false;
}

export function resolveCustomerRole(customerRole: CustomerRole | undefined): CustomerRole {
  const roles = getCustomerRoles();
  if (customerRole && roles[customerRole]) return customerRole;
  return DEFAULT_CUSTOMER_ROLE;
}

export function hasCustomerPermission(customerRole: CustomerRole | undefined, permission: AdminPermission): boolean {
  const role = resolveCustomerRole(customerRole);
  return getCustomerRoles()[role]?.permissions.includes(permission) ?? false;
}

export function getAdminRoleDef(adminRole: AdminRole | undefined): AdminRoleDef | null {
  if (!adminRole) return null;
  return getAdminRoles()[adminRole] ?? null;
}

export function getCustomerRoleDef(customerRole: CustomerRole | undefined): CustomerRoleDef | null {
  return getCustomerRoles()[resolveCustomerRole(customerRole)] ?? null;
}
