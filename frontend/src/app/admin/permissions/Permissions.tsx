import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2, KeyRound, Plus, RotateCcw, Shield, Trash2, Users } from 'lucide-react';
import { Layout } from '@/app/components/Layout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';
import { Checkbox } from '@/app/components/ui/checkbox';
import {
  ADMIN_ROLES,
  getAdminPermissions,
  getAdminRoles,
  resetAdminPermissionConfig,
  saveAdminPermissions,
  saveAdminRoles,
  type AdminPermissionDef,
  type AdminRoleDef,
} from '@/lib/permissions';

const COLOR_PRESETS = [
  { name: 'Purple', color: 'bg-stone-100', textColor: 'text-stone-700', borderColor: 'border-stone-200', dotColor: 'bg-stone-500' },
  { name: 'Blue', color: 'bg-stone-100', textColor: 'text-stone-700', borderColor: 'border-stone-200', dotColor: 'bg-stone-500' },
  { name: 'Green', color: 'bg-green-100', textColor: 'text-green-700', borderColor: 'border-green-200', dotColor: 'bg-green-500' },
  { name: 'Amber', color: 'bg-amber-100', textColor: 'text-amber-700', borderColor: 'border-amber-200', dotColor: 'bg-amber-500' },
  { name: 'Cyan', color: 'bg-stone-100', textColor: 'text-stone-700', borderColor: 'border-stone-200', dotColor: 'bg-stone-500' },
  { name: 'Rose', color: 'bg-rose-100', textColor: 'text-rose-700', borderColor: 'border-rose-200', dotColor: 'bg-rose-500' },
];

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

export function AdminPermissions() {
  const [permissions, setPermissions] = useState<AdminPermissionDef[]>(() => getAdminPermissions());
  const [roles, setRoles] = useState<Record<string, AdminRoleDef>>(() => getAdminRoles());
  const [selectedRole, setSelectedRole] = useState('super_admin');
  const [newPermission, setNewPermission] = useState({ key: '', label: '', group: 'Custom', description: '' });
  const [newRole, setNewRole] = useState({ key: '', label: '', description: '', preset: 'Purple' });

  const groupedPermissions = useMemo(() => groupPermissions(permissions), [permissions]);
  const selectedRoleDef = roles[selectedRole];

  const persistPermissions = (next: AdminPermissionDef[]) => {
    setPermissions(next);
    saveAdminPermissions(next);
  };

  const persistRoles = (next: Record<string, AdminRoleDef>) => {
    setRoles(next);
    saveAdminRoles(next);
  };

  const createPermission = () => {
    const key = normalizeKey(newPermission.key || newPermission.label);
    if (!key || !newPermission.label.trim()) {
      toast.error('Nhập mã quyền và tên quyền');
      return;
    }
    if (permissions.some((permission) => permission.key === key)) {
      toast.error('Mã quyền đã tồn tại');
      return;
    }

    persistPermissions([
      ...permissions,
      {
        key,
        label: newPermission.label.trim(),
        group: newPermission.group.trim() || 'Custom',
        description: newPermission.description.trim() || 'Quyền tuỳ chỉnh',
        system: false,
      },
    ]);
    setNewPermission({ key: '', label: '', group: 'Custom', description: '' });
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
    toast.success('Đã xoá quyền');
  };

  const createRole = () => {
    const key = normalizeKey(newRole.key || newRole.label);
    if (!key || !newRole.label.trim()) {
      toast.error('Nhập mã loại admin và tên hiển thị');
      return;
    }
    if (roles[key]) {
      toast.error('Loại admin đã tồn tại');
      return;
    }

    const preset = COLOR_PRESETS.find((item) => item.name === newRole.preset) || COLOR_PRESETS[0];
    const { name: _, ...colors } = preset;
    const next = {
      ...roles,
      [key]: {
        label: newRole.label.trim(),
        description: newRole.description.trim() || 'Loại admin tuỳ chỉnh',
        ...colors,
        permissions: ['dashboard'],
        system: false,
      },
    };
    persistRoles(next);
    setSelectedRole(key);
    setNewRole({ key: '', label: '', description: '', preset: 'Purple' });
    toast.success('Đã tạo loại admin mới');
  };

  const deleteRole = (key: string) => {
    if (roles[key]?.system || ADMIN_ROLES[key]?.system) {
      toast.error('Không thể xoá loại admin hệ thống');
      return;
    }
    const next = { ...roles };
    delete next[key];
    persistRoles(next);
    setSelectedRole('super_admin');
    toast.success('Đã xoá loại admin');
  };

  const togglePermission = (permissionKey: string) => {
    if (!selectedRoleDef || selectedRole === 'super_admin') return;
    const hasPermission = selectedRoleDef.permissions.includes(permissionKey);
    persistRoles({
      ...roles,
      [selectedRole]: {
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
    setSelectedRole('super_admin');
    toast.success('Đã khôi phục cấu hình phân quyền mặc định');
  };

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-full px-3 py-1 text-xs font-semibold mb-3">
              <Shield className="w-3.5 h-3.5" />
              RBAC Admin
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Phân quyền Admin</h1>
            <p className="text-gray-500 text-sm mt-1">Tạo quyền, tạo loại admin và gán phạm vi truy cập cho từng nhóm.</p>
          </div>
          <Button variant="outline" className="gap-2" onClick={resetConfig}>
            <RotateCcw className="w-4 h-4" />
            Khôi phục mặc định
          </Button>
        </div>

        <div className="grid lg:grid-cols-[360px_1fr] gap-6">
          <div className="space-y-6">
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-green-600" />
                <h2 className="font-bold text-gray-900">Loại admin</h2>
              </div>
              <div className="space-y-2">
                {Object.entries(roles).map(([key, role]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedRole(key)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      selectedRole === key ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${role.dotColor}`} />
                      <span className="text-sm font-semibold text-gray-900">{role.label}</span>
                      {role.system && <Badge className="ml-auto bg-gray-100 text-gray-600 border-0">System</Badge>}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{role.description}</p>
                    <p className="text-[11px] text-gray-400 mt-1">{selectedRole === 'super_admin' && key === 'super_admin' ? permissions.length : role.permissions.length} quyền</p>
                  </button>
                ))}
              </div>
            </Card>

            <Card className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-600" />
                <h2 className="font-bold text-gray-900">Tạo loại admin</h2>
              </div>
              <div>
                <Label>Mã loại admin</Label>
                <Input className="mt-2" placeholder="support_manager" value={newRole.key} onChange={(e) => setNewRole((prev) => ({ ...prev, key: normalizeKey(e.target.value) }))} />
              </div>
              <div>
                <Label>Tên hiển thị</Label>
                <Input className="mt-2" placeholder="Support Manager" value={newRole.label} onChange={(e) => setNewRole((prev) => ({ ...prev, label: e.target.value }))} />
              </div>
              <div>
                <Label>Mô tả</Label>
                <Textarea className="mt-2 min-h-20" placeholder="Mô tả phạm vi công việc" value={newRole.description} onChange={(e) => setNewRole((prev) => ({ ...prev, description: e.target.value }))} />
              </div>
              <div>
                <Label>Màu badge</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setNewRole((prev) => ({ ...prev, preset: preset.name }))}
                      className={`flex items-center gap-2 border rounded-lg px-2 py-2 text-xs ${newRole.preset === preset.name ? 'border-green-400 bg-green-50' : 'border-gray-200'}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${preset.dotColor}`} />
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
              <Button className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white" onClick={createRole}>
                <Plus className="w-4 h-4" />
                Tạo loại admin
              </Button>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-5">
              {selectedRoleDef ? (
                <>
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-5">
                    <div>
                      <div className={`inline-flex items-center gap-2 ${selectedRoleDef.color} ${selectedRoleDef.textColor} border ${selectedRoleDef.borderColor} rounded-full px-3 py-1 text-xs font-semibold mb-2`}>
                        <span className={`w-2 h-2 rounded-full ${selectedRoleDef.dotColor}`} />
                        {selectedRoleDef.label}
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">Gán quyền cho loại admin</h2>
                      <p className="text-sm text-gray-500 mt-1">{selectedRoleDef.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className="bg-gray-100 text-gray-700 border-0">
                        {selectedRole === 'super_admin' ? permissions.length : selectedRoleDef.permissions.length}/{permissions.length} quyền
                      </Badge>
                      {!selectedRoleDef.system && (
                        <Button variant="outline" className="gap-2 border-red-200 text-red-600 hover:bg-red-50" onClick={() => deleteRole(selectedRole)}>
                          <Trash2 className="w-4 h-4" />
                          Xoá
                        </Button>
                      )}
                    </div>
                  </div>

                  {selectedRole === 'super_admin' && (
                    <div className="mb-4 flex items-start gap-2 rounded-xl border border-stone-200 bg-stone-50 p-3 text-sm text-stone-700">
                      <CheckCircle2 className="w-4 h-4 mt-0.5" />
                      Super Admin luôn có toàn bộ quyền, bao gồm quyền tuỳ chỉnh được tạo sau này.
                    </div>
                  )}

                  <div className="space-y-5">
                    {Object.entries(groupedPermissions).map(([group, items]) => (
                      <div key={group}>
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">{group}</p>
                        <div className="grid md:grid-cols-2 gap-3">
                          {items.map((permission) => {
                            const checked = selectedRole === 'super_admin' || selectedRoleDef.permissions.includes(permission.key);
                            return (
                              <div key={permission.key} className="flex gap-3 rounded-xl border border-gray-200 p-3">
                                <Checkbox
                                  checked={checked}
                                  disabled={selectedRole === 'super_admin'}
                                  onCheckedChange={() => togglePermission(permission.key)}
                                  className="mt-0.5"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-semibold text-gray-900">{permission.label}</p>
                                    {permission.system ? (
                                      <Badge className="bg-gray-100 text-gray-600 border-0">System</Badge>
                                    ) : (
                                      <Badge className="bg-green-100 text-green-700 border-0">Custom</Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500 mt-0.5">{permission.description}</p>
                                  <p className="text-[11px] text-gray-400 mt-1 font-mono">{permission.key}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="py-16 text-center text-gray-400">Chọn một loại admin để cấu hình quyền.</div>
              )}
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <KeyRound className="w-5 h-5 text-green-600" />
                <h2 className="font-bold text-gray-900">Tạo loại quyền</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Mã quyền</Label>
                  <Input className="mt-2" placeholder="support_tickets" value={newPermission.key} onChange={(e) => setNewPermission((prev) => ({ ...prev, key: normalizeKey(e.target.value) }))} />
                </div>
                <div>
                  <Label>Tên quyền</Label>
                  <Input className="mt-2" placeholder="Quản lý ticket hỗ trợ" value={newPermission.label} onChange={(e) => setNewPermission((prev) => ({ ...prev, label: e.target.value }))} />
                </div>
                <div>
                  <Label>Nhóm</Label>
                  <Input className="mt-2" placeholder="Hỗ trợ" value={newPermission.group} onChange={(e) => setNewPermission((prev) => ({ ...prev, group: e.target.value }))} />
                </div>
                <div>
                  <Label>Mô tả</Label>
                  <Input className="mt-2" placeholder="Mô tả quyền này dùng để làm gì" value={newPermission.description} onChange={(e) => setNewPermission((prev) => ({ ...prev, description: e.target.value }))} />
                </div>
              </div>
              <Button className="mt-4 gap-2 bg-green-600 hover:bg-green-700 text-white" onClick={createPermission}>
                <Plus className="w-4 h-4" />
                Tạo quyền
              </Button>

              <div className="mt-6 border-t pt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Quyền tuỳ chỉnh</p>
                <div className="space-y-2">
                  {permissions.filter((permission) => !permission.system).length === 0 ? (
                    <p className="text-sm text-gray-400">Chưa có quyền tuỳ chỉnh.</p>
                  ) : (
                    permissions.filter((permission) => !permission.system).map((permission) => (
                      <div key={permission.key} className="flex items-center justify-between rounded-xl border border-gray-200 p-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{permission.label}</p>
                          <p className="text-xs text-gray-500">{permission.description}</p>
                          <p className="text-[11px] text-gray-400 font-mono">{permission.key}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => deletePermission(permission.key)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
