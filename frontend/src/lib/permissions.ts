import {
  Cpu,
  Crown,
  DollarSign,
  FileText,
  KeyRound,
  LayoutDashboard,
  ScrollText,
  Settings,
  Shield,
  Tag,
  Users,
} from 'lucide-react';

export type AdminRole = string;
export type AdminPermission = string;

export interface AdminPermissionDef {
  key: AdminPermission;
  label: string;
  description: string;
  group: string;
  route?: string;
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

const ROLE_STORAGE_KEY = 'admin_role_defs';
const PERMISSION_STORAGE_KEY = 'admin_permission_defs';

export const ADMIN_PERMISSIONS: AdminPermissionDef[] = [
  { key: 'dashboard', label: 'Dashboard', description: 'Xem trang tổng quan hệ thống', group: 'Tổng quan', route: '/admin', system: true },
  { key: 'users', label: 'Quản lý users', description: 'Xem, duyệt và chỉnh sửa tài khoản', group: 'Người dùng', route: '/admin/users', system: true },
  { key: 'contents', label: 'Nội dung', description: 'Quản lý nội dung copy đã tạo', group: 'Nội dung', route: '/admin/contents', system: true },
  { key: 'templates', label: 'Templates', description: 'Quản lý mẫu copywriting', group: 'Nội dung', route: '/admin/templates', system: true },
  { key: 'categories', label: 'Danh mục', description: 'Quản lý danh mục ngành nghề/template', group: 'Nội dung', route: '/admin/categories', system: true },
  { key: 'plans', label: 'Gói dịch vụ', description: 'Quản lý subscription plan', group: 'Tài chính', route: '/admin/plans', system: true },
  { key: 'payments', label: 'Thanh toán', description: 'Xem giao dịch và doanh thu', group: 'Tài chính', route: '/admin/payments', system: true },
  { key: 'models', label: 'Model AI', description: 'Quản lý model và fine-tuning', group: 'AI', route: '/admin/models', system: true },
  { key: 'settings', label: 'Cài đặt', description: 'Quản lý cấu hình hệ thống', group: 'Hệ thống', route: '/admin/settings', system: true },
  { key: 'audit_logs', label: 'Nhật ký', description: 'Xem audit log quản trị', group: 'Hệ thống', route: '/admin/audit-logs', system: true },
  { key: 'permissions', label: 'Phân quyền', description: 'Tạo quyền và loại admin', group: 'Bảo mật', route: '/admin/permissions', system: true },
];

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
    description: 'Quản lý nội dung, template và danh mục',
    color: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
    dotColor: 'bg-green-500',
    permissions: ['dashboard', 'contents', 'templates', 'categories'],
    system: true,
  },
  user_manager: {
    label: 'User Manager',
    description: 'Quản lý tài khoản và hồ sơ người dùng',
    color: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
    dotColor: 'bg-green-500',
    permissions: ['dashboard', 'users'],
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
    description: 'Cấu hình và vận hành mô hình AI và fine-tuning',
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

export function getAdminPermissions(): AdminPermissionDef[] {
  const stored = readJson<AdminPermissionDef[]>(PERMISSION_STORAGE_KEY, []);
  const merged = [...ADMIN_PERMISSIONS];

  stored.forEach((permission) => {
    const index = merged.findIndex((item) => item.key === permission.key);
    if (index >= 0) {
      if (!merged[index].system) merged[index] = { ...merged[index], ...permission };
    } else {
      merged.push(permission);
    }
  });

  return merged;
}

export function saveAdminPermissions(permissions: AdminPermissionDef[]) {
  writeJson(PERMISSION_STORAGE_KEY, permissions);
}

export function getAdminRoles(): Record<AdminRole, AdminRoleDef> {
  const stored = readJson<Record<AdminRole, AdminRoleDef>>(ROLE_STORAGE_KEY, {});
  return {
    ...stored,
    ...ADMIN_ROLES,
  };
}

export function saveAdminRoles(roles: Record<AdminRole, AdminRoleDef>) {
  writeJson(ROLE_STORAGE_KEY, roles);
}

export function resetAdminPermissionConfig() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(ROLE_STORAGE_KEY);
  window.localStorage.removeItem(PERMISSION_STORAGE_KEY);
}

export const ADMIN_MENU_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin', permission: 'dashboard' as AdminPermission },
  { label: 'Quản lý Users', icon: Users, path: '/admin/users', permission: 'users' as AdminPermission },
  { label: 'Nội dung', icon: FileText, path: '/admin/contents', permission: 'contents' as AdminPermission },
  { label: 'Templates', icon: ScrollText, path: '/admin/templates', permission: 'templates' as AdminPermission },
  { label: 'Danh mục', icon: Tag, path: '/admin/categories', permission: 'categories' as AdminPermission },
  { label: 'Gói dịch vụ', icon: Crown, path: '/admin/plans', permission: 'plans' as AdminPermission },
  { label: 'Thanh toán', icon: DollarSign, path: '/admin/payments', permission: 'payments' as AdminPermission },
  { label: 'Model AI', icon: Cpu, path: '/admin/models', permission: 'models' as AdminPermission },
  { label: 'Cài đặt', icon: Settings, path: '/admin/settings', permission: 'settings' as AdminPermission },
  { label: 'Nhật ký', icon: Shield, path: '/admin/audit-logs', permission: 'audit_logs' as AdminPermission },
  { label: 'Phân quyền', icon: KeyRound, path: '/admin/permissions', permission: 'permissions' as AdminPermission },
];

export const PERMISSION_ROUTE_MAP: Record<string, AdminPermission> = {
  '/admin': 'dashboard',
  '/admin/users': 'users',
  '/admin/contents': 'contents',
  '/admin/templates': 'templates',
  '/admin/categories': 'categories',
  '/admin/plans': 'plans',
  '/admin/payments': 'payments',
  '/admin/models': 'models',
  '/admin/settings': 'settings',
  '/admin/audit-logs': 'audit_logs',
  '/admin/permissions': 'permissions',
};

export function hasPermission(adminRole: AdminRole | undefined, permission: AdminPermission): boolean {
  if (!adminRole) return false;
  if (adminRole === 'super_admin') return true;
  return getAdminRoles()[adminRole]?.permissions.includes(permission) ?? false;
}

export function getAdminRoleDef(adminRole: AdminRole | undefined): AdminRoleDef | null {
  if (!adminRole) return null;
  return getAdminRoles()[adminRole] ?? null;
}
