import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2, ChevronLeft, ChevronRight, KeyRound, Plus, RotateCcw, Shield, Trash2, Users } from 'lucide-react';
import { Layout } from '@/app/components/Layout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/app/components/ui/toggle-group';
import { DataPagination } from '@/app/components/common/DataPagination';
import { usePagination } from '@/hooks/usePagination';
import { cn } from '@/app/components/ui/utils';
import {
  ADMIN_ROLES,
  CUSTOMER_ROLES,
  PERMISSION_ROUTE_OPTIONS,
  getPermissionScope,
  getPermissionScopeLabel,
  getAdminPermissions,
  getAdminRoles,
  getCustomerRoles,
  resetAdminPermissionConfig,
  saveAdminPermissions,
  saveAdminRoles,
  saveCustomerRoles,
  type AdminPermissionDef,
  type AdminRoleDef,
  type CustomerRoleDef,
  type PermissionScope,
} from '@/lib/permissions';

const COLOR_PRESETS = [
  { name: 'Forest', color: 'bg-primary/10', textColor: 'text-primary', borderColor: 'border-primary/20', dotColor: 'bg-primary/50' },
  { name: 'Sage', color: 'bg-lime-100', textColor: 'text-lime-700', borderColor: 'border-lime-200', dotColor: 'bg-lime-500' },
  { name: 'Leaf', color: 'bg-emerald-100', textColor: 'text-emerald-700', borderColor: 'border-emerald-200', dotColor: 'bg-emerald-500' },
  { name: 'Amber', color: 'bg-warning/15', textColor: 'text-amber-700', borderColor: 'border-amber-200', dotColor: 'bg-warning/100' },
  { name: 'Teal', color: 'bg-teal-100', textColor: 'text-teal-700', borderColor: 'border-teal-200', dotColor: 'bg-teal-500' },
  { name: 'Rose', color: 'bg-rose-100', textColor: 'text-rose-700', borderColor: 'border-rose-200', dotColor: 'bg-rose-500' },
];

type ManagementView = 'groups' | 'permissions';

const DEFAULT_ROLE_BY_SCOPE: Record<PermissionScope, string> = {
  admin: 'super_admin',
  customer: 'pro_customer',
};

interface CompactPaginationProps {
  page: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  totalItems: number;
  itemLabel: string;
  onPageChange: (page: number) => void;
}

function CompactPagination({
  page,
  totalPages,
  startIndex,
  endIndex,
  totalItems,
  itemLabel,
  onPageChange,
}: CompactPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-1 flex items-center justify-between gap-3 rounded-lg border bg-surface-muted/50 px-3 py-2 text-sm">
      <span className="min-w-0 truncate text-muted-foreground">
        <span className="font-semibold text-foreground">{startIndex}-{endIndex}</span> / {totalItems} {itemLabel}
      </span>
      <div className="flex shrink-0 items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="min-w-10 text-center text-xs font-semibold text-foreground">{page}/{totalPages}</span>
        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function normalizeKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_ -]/g, '')
    .replace(/[\s-]+/g, '_');
}

function groupPermissions(permissions: AdminPermissionDef[]) {
  return permissions.reduce<Record<string, AdminPermissionDef[]>>((acc, permission) => {
    acc[permission.group] = acc[permission.group] || [];
    acc[permission.group].push(permission);
    return acc;
  }, {});
}

function getScopeBadgeClass(scope: PermissionScope) {
  return scope === 'admin'
    ? 'border-0 bg-primary/10 text-primary'
    : 'border-0 bg-teal-100 text-teal-700';
}

function getDefaultPermissionKey(route: string, scope: PermissionScope) {
  const routeKey = route
    .replace(/^\//, '')
    .replace(/^admin\/?/, '')
    .replace(/\[(.+?)\]/g, '$1')
    .replace(/\//g, '_');

  return normalizeKey(`${scope}_${routeKey || 'dashboard'}`);
}

export function AdminPermissions() {
  const [permissions, setPermissions] = useState<AdminPermissionDef[]>(() => getAdminPermissions());
  const [roles, setRoles] = useState<Record<string, AdminRoleDef>>(() => getAdminRoles());
  const [customerRoles, setCustomerRoles] = useState<Record<string, CustomerRoleDef>>(() => getCustomerRoles());
  const [selectedRole, setSelectedRole] = useState('super_admin');
  const [selectedCustomerRole, setSelectedCustomerRole] = useState('pro_customer');
  const [newPermission, setNewPermission] = useState({ key: '', label: '', group: 'Custom', description: '', route: '' });
  const [newRole, setNewRole] = useState({ key: '', label: '', description: '', preset: 'Forest' });
  const [roleSearch, setRoleSearch] = useState('');
  const [roleSort, setRoleSort] = useState('label-asc');
  const [permissionSearch, setPermissionSearch] = useState('');
  const [permissionGroup, setPermissionGroup] = useState('all');
  const [permissionScope, setPermissionScope] = useState<'all' | PermissionScope>('all');
  const [managementView, setManagementView] = useState<ManagementView>('groups');
  const [roleScope, setRoleScope] = useState<PermissionScope>('admin');

  const activeRoles = roleScope === 'admin' ? roles : customerRoles;
  const activeSystemRoles = roleScope === 'admin' ? ADMIN_ROLES : CUSTOMER_ROLES;
  const activeSelectedRole = roleScope === 'admin' ? selectedRole : selectedCustomerRole;
  const selectedRoleDef = activeRoles[activeSelectedRole];
  const roleScopeLabel = getPermissionScopeLabel(roleScope);
  const roleEntries = useMemo(() => {
    const keyword = roleSearch.trim().toLowerCase();
    const entries = Object.entries(activeRoles).filter(([key, role]) => {
      const haystack = [key, role.label, role.description].join(' ').toLowerCase();
      return !keyword || haystack.includes(keyword);
    });

    return entries.sort(([, a], [, b]) => {
      switch (roleSort) {
        case 'permissions-desc':
          return b.permissions.length - a.permissions.length;
        case 'permissions-asc':
          return a.permissions.length - b.permissions.length;
        case 'label-desc':
          return b.label.localeCompare(a.label, 'vi');
        case 'label-asc':
        default:
          return a.label.localeCompare(b.label, 'vi');
      }
    });
  }, [activeRoles, roleSearch, roleSort]);
  const customPermissions = useMemo(() => permissions.filter((permission) => !permission.system), [permissions]);
  const routeUsageMap = useMemo(() => (
    new Map(permissions.filter((permission) => permission.route).map((permission) => [permission.route, permission]))
  ), [permissions]);
  const selectedRouteOption = useMemo(() => (
    PERMISSION_ROUTE_OPTIONS.find((option) => option.route === newPermission.route)
  ), [newPermission.route]);
  const routeOptionsByScope = useMemo(() => ({
    admin: PERMISSION_ROUTE_OPTIONS.filter((option) => option.scope === 'admin'),
    customer: PERMISSION_ROUTE_OPTIONS.filter((option) => option.scope === 'customer'),
  }), []);
  const permissionGroups = useMemo(() => (
    Array.from(new Set(permissions.map(permission => permission.group).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'vi'))
  ), [permissions]);
  const filteredPermissions = useMemo(() => {
    const keyword = permissionSearch.trim().toLowerCase();
    return permissions.filter((permission) => {
      const scope = getPermissionScope(permission);
      const haystack = [permission.key, permission.label, permission.group, permission.description, permission.route, getPermissionScopeLabel(scope)]
        .join(' ')
        .toLowerCase();
      const matchSearch = !keyword || haystack.includes(keyword);
      const matchGroup = permissionGroup === 'all' || permission.group === permissionGroup;
      const matchScope = permissionScope === 'all' || scope === permissionScope;
      return matchSearch && matchGroup && matchScope;
    });
  }, [permissionGroup, permissionScope, permissionSearch, permissions]);
  const activeScopePermissions = useMemo(() => (
    permissions.filter((permission) => getPermissionScope(permission) === roleScope)
  ), [permissions, roleScope]);
  const rolePermissionGroups = useMemo(() => (
    Array.from(new Set(activeScopePermissions.map(permission => permission.group).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'vi'))
  ), [activeScopePermissions]);
  const activeScopePermissionKeys = useMemo(() => (
    new Set(activeScopePermissions.map((permission) => permission.key))
  ), [activeScopePermissions]);
  const roleFilteredPermissions = useMemo(() => {
    const keyword = permissionSearch.trim().toLowerCase();
    return activeScopePermissions.filter((permission) => {
      const scope = getPermissionScope(permission);
      const haystack = [permission.key, permission.label, permission.group, permission.description, permission.route, getPermissionScopeLabel(scope)]
        .join(' ')
        .toLowerCase();
      const matchSearch = !keyword || haystack.includes(keyword);
      const matchGroup = permissionGroup === 'all' || permission.group === permissionGroup;
      return matchSearch && matchGroup;
    });
  }, [activeScopePermissions, permissionGroup, permissionSearch]);
  const rolesPagination = usePagination(roleEntries, {
    initialPageSize: 6,
    resetKey: `${roleScope}|${roleSearch}|${roleSort}|${roleEntries.length}`,
  });
  const permissionPagination = usePagination(roleFilteredPermissions, {
    initialPageSize: 8,
    resetKey: `${roleScope}|${activeSelectedRole}|${permissionSearch}|${permissionGroup}|${roleFilteredPermissions.length}`,
  });
  const permissionDirectoryPagination = usePagination(filteredPermissions, {
    initialPageSize: 8,
    resetKey: `${permissionSearch}|${permissionGroup}|${permissionScope}|${filteredPermissions.length}`,
  });
  const groupedPermissions = useMemo(() => groupPermissions(permissionPagination.pageItems), [permissionPagination.pageItems]);
  const groupedPermissionDirectory = useMemo(() => groupPermissions(permissionDirectoryPagination.pageItems), [permissionDirectoryPagination.pageItems]);
  const customPermissionPagination = usePagination(customPermissions, {
    initialPageSize: 5,
    resetKey: customPermissions.length,
  });

  const persistPermissions = (next: AdminPermissionDef[]) => {
    setPermissions(next);
    saveAdminPermissions(next);
  };

  const persistRoles = (next: Record<string, AdminRoleDef>) => {
    setRoles(next);
    saveAdminRoles(next);
  };

  const persistCustomerRoleDefs = (next: Record<string, CustomerRoleDef>) => {
    setCustomerRoles(next);
    saveCustomerRoles(next);
  };

  const persistActiveRoles = (next: Record<string, AdminRoleDef>) => {
    if (roleScope === 'admin') {
      persistRoles(next);
    } else {
      persistCustomerRoleDefs(next);
    }
  };

  const setActiveSelectedRole = (key: string) => {
    if (roleScope === 'admin') {
      setSelectedRole(key);
    } else {
      setSelectedCustomerRole(key);
    }
  };

  const handlePermissionRouteChange = (route: string) => {
    const option = PERMISSION_ROUTE_OPTIONS.find((item) => item.route === route);
    setNewPermission((prev) => ({
      ...prev,
      route,
      key: prev.key || getDefaultPermissionKey(route, option?.scope || (route.startsWith('/admin') ? 'admin' : 'customer')),
      label: prev.label || option?.label || '',
      group: !prev.group || prev.group === 'Custom' ? option?.group || 'Custom' : prev.group,
    }));
  };

  const createPermission = () => {
    const key = normalizeKey(newPermission.key || newPermission.label);
    if (!key || !newPermission.label.trim()) {
      toast.error('Nhập mã quyền và tên quyền');
      return;
    }
    if (!newPermission.route) {
      toast.error('Chọn route áp dụng cho quyền');
      return;
    }
    if (permissions.some((permission) => permission.key === key)) {
      toast.error('Mã quyền đã tồn tại');
      return;
    }
    const assignedRoutePermission = routeUsageMap.get(newPermission.route);
    if (assignedRoutePermission) {
      toast.error(`Route này đã thuộc quyền "${assignedRoutePermission.label}"`);
      return;
    }

    const routeOption = PERMISSION_ROUTE_OPTIONS.find((option) => option.route === newPermission.route);

    persistPermissions([
      ...permissions,
      {
        key,
        label: newPermission.label.trim(),
        group: newPermission.group.trim() || routeOption?.group || 'Custom',
        description: newPermission.description.trim() || 'Quyền tùy chỉnh',
        route: newPermission.route,
        scope: routeOption?.scope || (newPermission.route.startsWith('/admin') ? 'admin' : 'customer'),
        system: false,
      },
    ]);
    setNewPermission({ key: '', label: '', group: 'Custom', description: '', route: '' });
    toast.success('Đã tạo quyền mới');
  };

  const deletePermission = (key: string) => {
    const permission = permissions.find((item) => item.key === key);
    if (permission?.system) {
      toast.error('Không thể xoá quyền hệ thống');
      return;
    }

    persistPermissions(permissions.filter((item) => item.key !== key));
    persistRoles(
      Object.fromEntries(
        Object.entries(roles).map(([roleKey, role]) => [
          roleKey,
          { ...role, permissions: role.permissions.filter((permissionKey) => permissionKey !== key) },
        ]),
      ),
    );
    persistCustomerRoleDefs(
      Object.fromEntries(
        Object.entries(customerRoles).map(([roleKey, role]) => [
          roleKey,
          { ...role, permissions: role.permissions.filter((permissionKey) => permissionKey !== key) },
        ]),
      ),
    );
    toast.success('Đã xoá quyền');
  };

  const createRole = () => {
    const key = normalizeKey(newRole.key || newRole.label);
    if (!key || !newRole.label.trim()) {
      toast.error('Nhập mã nhóm và tên hiển thị');
      return;
    }
    if (activeRoles[key]) {
      toast.error(`Nhóm ${roleScopeLabel} đã tồn tại`);
      return;
    }

    const preset = COLOR_PRESETS.find((item) => item.name === newRole.preset) || COLOR_PRESETS[0];
    const { name: _, ...colors } = preset;
    const next = {
      ...activeRoles,
      [key]: {
        label: newRole.label.trim(),
        description: newRole.description.trim() || `Nhóm ${roleScopeLabel} tùy chỉnh`,
        ...colors,
        permissions: roleScope === 'admin' ? ['dashboard'] : ['customer_dashboard'],
        system: false,
      },
    };
    persistActiveRoles(next);
    setActiveSelectedRole(key);
    setNewRole({ key: '', label: '', description: '', preset: 'Forest' });
    toast.success(`Đã tạo nhóm ${roleScopeLabel} mới`);
  };

  const deleteRole = (key: string) => {
    if (activeRoles[key]?.system || activeSystemRoles[key]?.system) {
      toast.error('Không thể xoá nhóm hệ thống');
      return;
    }
    const next = { ...activeRoles };
    delete next[key];
    persistActiveRoles(next);
    setActiveSelectedRole(DEFAULT_ROLE_BY_SCOPE[roleScope]);
    toast.success(`Đã xoá nhóm ${roleScopeLabel}`);
  };

  const togglePermission = (permissionKey: string) => {
    if (!selectedRoleDef || (roleScope === 'admin' && activeSelectedRole === 'super_admin')) return;
    const hasPermission = selectedRoleDef.permissions.includes(permissionKey);
    persistActiveRoles({
      ...activeRoles,
      [activeSelectedRole]: {
        ...selectedRoleDef,
        permissions: hasPermission
          ? selectedRoleDef.permissions.filter((key) => key !== permissionKey)
          : [...selectedRoleDef.permissions, permissionKey],
      },
    });
  };

  const resetConfig = () => {
    resetAdminPermissionConfig();
    setPermissions(getAdminPermissions());
    setRoles(getAdminRoles());
    setCustomerRoles(getCustomerRoles());
    setSelectedRole('super_admin');
    setSelectedCustomerRole('pro_customer');
    toast.success('Đã khôi phục cấu hình phân quyền mặc định');
  };

  const getRolePermissionCount = (key: string, role: AdminRoleDef) => (
    roleScope === 'admin' && key === 'super_admin'
      ? activeScopePermissions.length
      : role.permissions.filter((permissionKey) => activeScopePermissionKeys.has(permissionKey)).length
  );
  const selectedPermissionCount = selectedRoleDef ? getRolePermissionCount(activeSelectedRole, selectedRoleDef) : 0;
  const adminPermissionCount = permissions.filter((permission) => getPermissionScope(permission) === 'admin').length;
  const customerPermissionCount = permissions.filter((permission) => getPermissionScope(permission) === 'customer').length;

  return (
    <Layout>
      <div className="mx-auto flex max-w-7xl flex-col gap-5 p-4 sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
              <Shield className="h-3.5 w-3.5" />
              RBAC
            </div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Phân quyền người dùng</h1>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
              Quản lý nhóm admin, nhóm customer, loại quyền và phạm vi truy cập theo từng route.
            </p>
          </div>
          <Button variant="outline" className="w-full gap-2 md:w-auto" onClick={resetConfig}>
            <RotateCcw className="h-4 w-4" />
            Khôi phục mặc định
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs font-medium uppercase text-muted-foreground">Nhóm admin</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{Object.keys(roles).length}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs font-medium uppercase text-muted-foreground">Nhóm customer</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{Object.keys(customerRoles).length}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs font-medium uppercase text-muted-foreground">Quyền admin</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{adminPermissionCount}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs font-medium uppercase text-muted-foreground">Quyền customer</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{customerPermissionCount}</p>
          </div>
        </div>

        <Card className="p-2">
          <ToggleGroup
            type="single"
            value={managementView}
            onValueChange={(value) => {
              if (value) setManagementView(value as ManagementView);
            }}
            className="grid w-full grid-cols-1 gap-1 rounded-xl bg-muted p-1 sm:grid-cols-2"
          >
            <ToggleGroupItem value="groups" className="min-h-12 justify-start gap-3 rounded-lg px-3 py-2 text-left data-[state=on]:bg-card data-[state=on]:shadow-sm">
              <Users className="h-4 w-4 shrink-0" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">Nhóm người dùng</span>
                <span className="block truncate text-xs font-normal text-muted-foreground">Chọn nhóm và gán quyền</span>
              </span>
            </ToggleGroupItem>
            <ToggleGroupItem value="permissions" className="min-h-12 justify-start gap-3 rounded-lg px-3 py-2 text-left data-[state=on]:bg-card data-[state=on]:shadow-sm">
              <KeyRound className="h-4 w-4 shrink-0" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">Loại quyền</span>
                <span className="block truncate text-xs font-normal text-muted-foreground">Tạo và quản lý danh mục quyền</span>
              </span>
            </ToggleGroupItem>
          </ToggleGroup>
        </Card>

        {managementView === 'groups' ? (
          <div className="grid gap-5 xl:grid-cols-[minmax(300px,360px)_1fr]">
            <div className="space-y-5">
              <Card className="gap-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      <h2 className="text-lg font-bold text-foreground">Danh sách nhóm</h2>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">Chọn một nhóm để chỉnh phạm vi truy cập.</p>
                  </div>
                  <Badge className="border-0 bg-muted text-foreground/80">{roleEntries.length}</Badge>
                </div>

                <ToggleGroup
                  type="single"
                  value={roleScope}
                  onValueChange={(value) => {
                    if (value) {
                      setRoleScope(value as PermissionScope);
                      setPermissionGroup('all');
                    }
                  }}
                  className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1"
                >
                  <ToggleGroupItem value="admin" className="rounded-md data-[state=on]:bg-card data-[state=on]:shadow-sm">Admin</ToggleGroupItem>
                  <ToggleGroupItem value="customer" className="rounded-md data-[state=on]:bg-card data-[state=on]:shadow-sm">Customer</ToggleGroupItem>
                </ToggleGroup>

                <div className="grid gap-2 sm:grid-cols-[1fr_150px]">
                  <Input placeholder="Tìm nhóm..." value={roleSearch} onChange={(event) => setRoleSearch(event.target.value)} />
                  <Select value={roleSort} onValueChange={setRoleSort}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="label-asc">Tên A-Z</SelectItem>
                      <SelectItem value="label-desc">Tên Z-A</SelectItem>
                      <SelectItem value="permissions-desc">Nhiều quyền</SelectItem>
                      <SelectItem value="permissions-asc">Ít quyền</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  {rolesPagination.pageItems.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">Không tìm thấy nhóm phù hợp.</div>
                  ) : rolesPagination.pageItems.map(([key, role]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setActiveSelectedRole(key)}
                      className={cn(
                        'w-full rounded-lg border p-3 text-left transition-colors',
                        activeSelectedRole === key ? 'border-primary/40 bg-primary/5' : 'border-border hover:bg-surface-muted',
                      )}
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span className={cn('h-2 w-2 shrink-0 rounded-full', role.dotColor)} />
                        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">{role.label}</span>
                        {role.system && <Badge className="shrink-0 border-0 bg-muted text-foreground/70">Mặc định</Badge>}
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{role.description}</p>
                      <p className="mt-2 text-[11px] font-medium text-muted-foreground/80">{getRolePermissionCount(key, role)} quyền</p>
                    </button>
                  ))}
                </div>

                {rolesPagination.totalPages > 1 && (
                  <CompactPagination
                    page={rolesPagination.page}
                    totalPages={rolesPagination.totalPages}
                    startIndex={rolesPagination.startIndex}
                    endIndex={rolesPagination.endIndex}
                    totalItems={rolesPagination.totalItems}
                    itemLabel="nhóm"
                    onPageChange={rolesPagination.setPage}
                  />
                )}
              </Card>

              <Card className="gap-4 p-5">
                <div className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold text-foreground">Tạo nhóm {roleScopeLabel}</h2>
                </div>
                <div className="grid gap-4">
                  <div>
                    <Label>Mã nhóm</Label>
                    <Input className="mt-2" placeholder={roleScope === 'admin' ? 'support_manager' : 'vip_customer'} value={newRole.key} onChange={(event) => setNewRole((prev) => ({ ...prev, key: normalizeKey(event.target.value) }))} />
                  </div>
                  <div>
                    <Label>Tên hiển thị</Label>
                    <Input className="mt-2" placeholder="Nhóm hỗ trợ" value={newRole.label} onChange={(event) => setNewRole((prev) => ({ ...prev, label: event.target.value }))} />
                  </div>
                  <div>
                    <Label>Mô tả</Label>
                    <Textarea className="mt-2 min-h-20" placeholder="Mô tả phạm vi công việc" value={newRole.description} onChange={(event) => setNewRole((prev) => ({ ...prev, description: event.target.value }))} />
                  </div>
                  <div>
                    <Label>Màu nhận diện</Label>
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {COLOR_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => setNewRole((prev) => ({ ...prev, preset: preset.name }))}
                          className={cn(
                            'flex min-w-0 items-center gap-2 rounded-lg border px-2 py-2 text-xs transition-colors',
                            newRole.preset === preset.name ? 'border-primary/40 bg-primary/5' : 'border-border hover:bg-surface-muted',
                          )}
                        >
                          <span className={cn('h-2 w-2 shrink-0 rounded-full', preset.dotColor)} />
                          <span className="truncate">{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <Button className="w-full gap-2 bg-primary text-white hover:bg-green-700" onClick={createRole}>
                  <Plus className="h-4 w-4" />
                  Tạo nhóm
                </Button>
              </Card>
            </div>

            <Card className="gap-5 p-5">
              {selectedRoleDef ? (
                <>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className={cn('mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold', selectedRoleDef.color, selectedRoleDef.textColor, selectedRoleDef.borderColor)}>
                        <span className={cn('h-2 w-2 rounded-full', selectedRoleDef.dotColor)} />
                        {selectedRoleDef.label}
                      </div>
                      <h2 className="text-xl font-bold text-foreground">Phân quyền cho nhóm</h2>
                      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{selectedRoleDef.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="border-0 bg-muted text-foreground/80">{selectedPermissionCount}/{activeScopePermissions.length} quyền</Badge>
                      {!selectedRoleDef.system && (
                        <Button variant="outline" className="gap-2 border-red-200 text-red-600 hover:bg-destructive/10" onClick={() => deleteRole(activeSelectedRole)}>
                          <Trash2 className="h-4 w-4" />
                          Xoá nhóm
                        </Button>
                      )}
                    </div>
                  </div>

                  {roleScope === 'admin' && activeSelectedRole === 'super_admin' && (
                    <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm text-primary">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>Super Admin luôn có toàn bộ quyền, bao gồm cả quyền tùy chỉnh được tạo sau này.</span>
                    </div>
                  )}

                  <div className="grid gap-2 md:grid-cols-[1fr_190px]">
                    <Input placeholder="Tìm quyền..." value={permissionSearch} onChange={(event) => setPermissionSearch(event.target.value)} />
                    <Select value={permissionGroup} onValueChange={setPermissionGroup}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả nhóm</SelectItem>
                        {rolePermissionGroups.map(group => <SelectItem key={group} value={group}>{group}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {Object.entries(groupedPermissions).length === 0 ? (
                    <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">Không tìm thấy quyền phù hợp.</div>
                  ) : (
                    <div className="space-y-5">
                      {Object.entries(groupedPermissions).map(([group, items]) => (
                        <section key={group}>
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{group}</p>
                            <span className="text-xs text-muted-foreground">{items.length} quyền</span>
                          </div>
                          <div className="grid gap-3 md:grid-cols-2">
                            {items.map((permission) => {
                              const isLockedRole = roleScope === 'admin' && activeSelectedRole === 'super_admin';
                              const checked = isLockedRole || selectedRoleDef.permissions.includes(permission.key);
                              const scope = getPermissionScope(permission);
                              return (
                                <div key={permission.key} className="flex gap-3 rounded-lg border border-border p-3">
                                  <Checkbox
                                    checked={checked}
                                    disabled={isLockedRole}
                                    onCheckedChange={() => togglePermission(permission.key)}
                                    className="mt-0.5"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <div className="flex min-w-0 items-center gap-2">
                                      <p className="min-w-0 truncate text-sm font-semibold text-foreground">{permission.label}</p>
                                      <Badge className={cn('shrink-0 border-0', permission.system ? 'bg-muted text-foreground/70' : 'bg-primary/10 text-primary')}>
                                        {permission.system ? 'Mặc định' : 'Tùy chỉnh'}
                                      </Badge>
                                    </div>
                                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{permission.description}</p>
                                    <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2">
                                      <Badge className={getScopeBadgeClass(scope)}>{getPermissionScopeLabel(scope)}</Badge>
                                      <span className="min-w-0 truncate font-mono text-[11px] text-muted-foreground/80">{permission.route || 'no-route'}</span>
                                    </div>
                                    <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground/80">{permission.key}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </section>
                      ))}
                    </div>
                  )}

                  {permissionPagination.totalPages > 1 && (
                    <DataPagination
                      page={permissionPagination.page}
                      pageSize={permissionPagination.pageSize}
                      totalItems={permissionPagination.totalItems}
                      totalPages={permissionPagination.totalPages}
                      startIndex={permissionPagination.startIndex}
                      endIndex={permissionPagination.endIndex}
                      onPageChange={permissionPagination.setPage}
                      onPageSizeChange={permissionPagination.setPageSize}
                      itemLabel="quyền"
                      pageSizeOptions={[8, 12, 20]}
                    />
                  )}
                </>
              ) : (
                <div className="py-16 text-center text-sm text-muted-foreground">Chọn một nhóm để cấu hình quyền.</div>
              )}
            </Card>
          </div>
        ) : (
          <div className="grid gap-5 xl:grid-cols-[minmax(300px,360px)_1fr]">
            <div className="space-y-5">
              <Card className="gap-4 p-5">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold text-foreground">Tạo loại quyền</h2>
                </div>
                <div className="grid gap-4">
                  <div>
                    <Label>Mã quyền</Label>
                    <Input className="mt-2" placeholder="support_tickets" value={newPermission.key} onChange={(event) => setNewPermission((prev) => ({ ...prev, key: normalizeKey(event.target.value) }))} />
                  </div>
                  <div>
                    <Label>Tên quyền</Label>
                    <Input className="mt-2" placeholder="Quản lý ticket hỗ trợ" value={newPermission.label} onChange={(event) => setNewPermission((prev) => ({ ...prev, label: event.target.value }))} />
                  </div>
                  <div>
                    <Label>Route áp dụng</Label>
                    <Select value={newPermission.route} onValueChange={handlePermissionRouteChange}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Chọn route admin hoặc customer" />
                      </SelectTrigger>
                      <SelectContent className="max-h-80">
                        <SelectGroup>
                          <SelectLabel>Admin routes</SelectLabel>
                          {routeOptionsByScope.admin.map((option) => {
                            const assignedPermission = routeUsageMap.get(option.route);
                            return (
                              <SelectItem key={option.route} value={option.route} disabled={Boolean(assignedPermission)}>
                                <span className="flex min-w-0 flex-col items-start gap-0.5">
                                  <span className="truncate">{option.label}{assignedPermission ? ' · đã có quyền' : ''}</span>
                                  <span className="font-mono text-[11px] text-muted-foreground">{option.route}</span>
                                </span>
                              </SelectItem>
                            );
                          })}
                        </SelectGroup>
                        <SelectSeparator />
                        <SelectGroup>
                          <SelectLabel>Customer routes</SelectLabel>
                          {routeOptionsByScope.customer.map((option) => {
                            const assignedPermission = routeUsageMap.get(option.route);
                            return (
                              <SelectItem key={option.route} value={option.route} disabled={Boolean(assignedPermission)}>
                                <span className="flex min-w-0 flex-col items-start gap-0.5">
                                  <span className="truncate">{option.label}{assignedPermission ? ' · đã có quyền' : ''}</span>
                                  <span className="font-mono text-[11px] text-muted-foreground">{option.route}</span>
                                </span>
                              </SelectItem>
                            );
                          })}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {selectedRouteOption && (
                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        <Badge className={getScopeBadgeClass(selectedRouteOption.scope)}>{getPermissionScopeLabel(selectedRouteOption.scope)}</Badge>
                        <Badge className="border-0 bg-muted text-foreground/70">{selectedRouteOption.group}</Badge>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label>Nhóm</Label>
                    <Input className="mt-2" placeholder="Tự điền theo route" value={newPermission.group} onChange={(event) => setNewPermission((prev) => ({ ...prev, group: event.target.value }))} />
                  </div>
                  <div>
                    <Label>Mô tả</Label>
                    <Textarea className="mt-2 min-h-20" placeholder="Mô tả quyền này dùng để làm gì" value={newPermission.description} onChange={(event) => setNewPermission((prev) => ({ ...prev, description: event.target.value }))} />
                  </div>
                </div>
                <Button className="w-full gap-2 bg-primary text-white hover:bg-green-700" onClick={createPermission}>
                  <Plus className="h-4 w-4" />
                  Tạo quyền
                </Button>
              </Card>

              <Card className="gap-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Quyền tùy chỉnh</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Các quyền có thể xoá hoặc gán cho nhóm.</p>
                  </div>
                  <Badge className="border-0 bg-primary/10 text-primary">{customPermissions.length}</Badge>
                </div>
                <div className="space-y-2">
                  {customPermissions.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">Chưa có quyền tùy chỉnh.</div>
                  ) : customPermissionPagination.pageItems.map((permission) => {
                    const scope = getPermissionScope(permission);
                    return (
                      <div key={permission.key} className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">{permission.label}</p>
                          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{permission.description}</p>
                          <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2">
                            <Badge className={getScopeBadgeClass(scope)}>{getPermissionScopeLabel(scope)}</Badge>
                            <span className="min-w-0 truncate font-mono text-[11px] text-muted-foreground/80">{permission.route || 'no-route'}</span>
                          </div>
                          <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground/80">{permission.key}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="shrink-0 text-red-500 hover:bg-destructive/10" onClick={() => deletePermission(permission.key)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
                {customPermissionPagination.totalPages > 1 && (
                  <CompactPagination
                    page={customPermissionPagination.page}
                    totalPages={customPermissionPagination.totalPages}
                    startIndex={customPermissionPagination.startIndex}
                    endIndex={customPermissionPagination.endIndex}
                    totalItems={customPermissionPagination.totalItems}
                    itemLabel="quyền"
                    onPageChange={customPermissionPagination.setPage}
                  />
                )}
              </Card>
            </div>

            <Card className="gap-5 p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-bold text-foreground">Danh sách loại quyền</h2>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">Tra cứu quyền hệ thống và quyền tùy chỉnh theo từng nhóm chức năng.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className="border-0 bg-muted text-foreground/80">{filteredPermissions.length}/{permissions.length} quyền</Badge>
                  <Badge className="border-0 bg-primary/10 text-primary">{customPermissions.length} tùy chỉnh</Badge>
                </div>
              </div>

              <div className="grid gap-2 md:grid-cols-[1fr_190px_190px]">
                <Input placeholder="Tìm loại quyền..." value={permissionSearch} onChange={(event) => setPermissionSearch(event.target.value)} />
                <Select value={permissionScope} onValueChange={(value) => setPermissionScope(value as 'all' | PermissionScope)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả phạm vi</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={permissionGroup} onValueChange={setPermissionGroup}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả nhóm</SelectItem>
                    {permissionGroups.map(group => <SelectItem key={group} value={group}>{group}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {Object.entries(groupedPermissionDirectory).length === 0 ? (
                <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">Không tìm thấy loại quyền phù hợp.</div>
              ) : (
                <div className="space-y-5">
                  {Object.entries(groupedPermissionDirectory).map(([group, items]) => (
                    <section key={group}>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{group}</p>
                        <span className="text-xs text-muted-foreground">{items.length} quyền</span>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        {items.map((permission) => {
                          const scope = getPermissionScope(permission);
                          return (
                            <div key={permission.key} className="rounded-lg border border-border p-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-foreground">{permission.label}</p>
                                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{permission.description}</p>
                                </div>
                                {permission.system ? (
                                  <Badge className="shrink-0 border-0 bg-muted text-foreground/70">Mặc định</Badge>
                                ) : (
                                  <Button variant="ghost" size="icon" className="shrink-0 text-red-500 hover:bg-destructive/10" onClick={() => deletePermission(permission.key)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                              <div className="mt-3 flex min-w-0 flex-wrap items-center gap-2">
                                <Badge className={getScopeBadgeClass(scope)}>{getPermissionScopeLabel(scope)}</Badge>
                                <Badge className="border-0 bg-primary/10 text-primary">{permission.group}</Badge>
                                <span className="min-w-0 truncate font-mono text-[11px] text-muted-foreground/80">{permission.route || 'no-route'}</span>
                                <span className="min-w-0 truncate font-mono text-[11px] text-muted-foreground/80">{permission.key}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              )}

              {permissionDirectoryPagination.totalPages > 1 && (
                <DataPagination
                  page={permissionDirectoryPagination.page}
                  pageSize={permissionDirectoryPagination.pageSize}
                  totalItems={permissionDirectoryPagination.totalItems}
                  totalPages={permissionDirectoryPagination.totalPages}
                  startIndex={permissionDirectoryPagination.startIndex}
                  endIndex={permissionDirectoryPagination.endIndex}
                  onPageChange={permissionDirectoryPagination.setPage}
                  onPageSizeChange={permissionDirectoryPagination.setPageSize}
                  itemLabel="loại quyền"
                  pageSizeOptions={[8, 12, 20]}
                />
              )}
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
