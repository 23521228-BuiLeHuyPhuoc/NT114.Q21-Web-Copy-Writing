import { useCallback, useEffect, useMemo, useState } from 'react';
import { Layout } from '@/app/components/Layout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import {
  Calendar,
  Edit2,
  Lock,
  Mail,
  RotateCcw,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';
import { getAdminRoleDef, getAdminRoles, getCustomerRoleDef, getCustomerRoles, type AdminRole, type CustomerRole } from '@/lib/permissions';
import { adminUserService, type AdminUser } from '@/services/adminUserService';
import { ConfirmDialog } from '@/app/components/admin/ConfirmDialog';
import { TrashBin } from '@/app/components/admin/TrashBin';
import { AdminFilterBar } from '@/app/components/admin/AdminFilterBar';
import { AdminTable } from '@/app/components/admin/AdminTable';
import { DataPagination } from '@/app/components/common/DataPagination';
import { usePagination } from '@/hooks/usePagination';
import toast from 'react-hot-toast';
import type { UserRole, UserStatus } from '@/types/auth';

const CUSTOMER_STATUS_OPTIONS: UserStatus[] = ['active', 'locked'];
const STATUS_LABELS: Record<UserStatus, string> = {
  active: 'Đang hoạt động',
  locked: 'Đã khóa',
};

function getErrorMessage(error: unknown, fallback: string) {
  const err = error as { response?: { data?: { message?: string } }; message?: string };
  return err.response?.data?.message || err.message || fallback;
}

function formatDate(value?: string | Date | null) {
  if (!value) return '-';
  return new Date(value).toLocaleString('vi-VN');
}

function accountTypeOf(user: AdminUser) {
  return adminUserService.accountTypeFromRole(user.role);
}

export function AdminUsers() {
  const { user } = useAuth();
  const isSuperAdmin = user?.adminRole === 'super_admin';
  const adminRoles = getAdminRoles();
  const customerRoles = getCustomerRoles();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [trashUsers, setTrashUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortUsers, setSortUsers] = useState('created-desc');

  const [processingTrashId, setProcessingTrashId] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [addConfirmPassword, setAddConfirmPassword] = useState('');
  const [addRole, setAddRole] = useState<UserRole>('customer');
  const [addAdminRole, setAddAdminRole] = useState<AdminRole>('analyst');
  const [addCustomerRole, setAddCustomerRole] = useState<CustomerRole>('pro_customer');
  const [addStatus, setAddStatus] = useState<UserStatus>('active');
  const [addSaving, setAddSaving] = useState(false);

  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<AdminRole>('analyst');
  const [editCustomerRole, setEditCustomerRole] = useState<CustomerRole>('pro_customer');
  const [editStatus, setEditStatus] = useState<UserStatus>('active');
  const [editSaving, setEditSaving] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<AdminUser | null>(null);
  const [trashOpen, setTrashOpen] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const [activeItems, deletedItems] = await Promise.all([
        adminUserService.list(),
        adminUserService.listTrash(),
      ]);
      setUsers(activeItems);
      setTrashUsers(deletedItems);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không tải được danh sách người dùng'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const resetAddForm = () => {
    setAddName('');
    setAddEmail('');
    setAddPassword('');
    setAddConfirmPassword('');
    setAddRole('customer');
    setAddAdminRole('analyst');
    setAddCustomerRole('pro_customer');
    setAddStatus('active');
  };

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const filtered = users.filter((item) => {
      const matchSearch = !keyword || [
        item.name,
        item.email,
        item.role,
        item.adminRole || '',
        item.customerRole || '',
        item.status,
      ].join(' ').toLowerCase().includes(keyword);
      const matchRole = filterRole === 'all' || item.role === filterRole;
      const matchStatus = filterStatus === 'all' || item.status === filterStatus;
      return matchSearch && matchRole && matchStatus;
    });

    return [...filtered].sort((a, b) => {
      switch (sortUsers) {
        case 'created-asc':
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case 'name-asc':
          return a.name.localeCompare(b.name, 'vi');
        case 'name-desc':
          return b.name.localeCompare(a.name, 'vi');
        case 'email-asc':
          return a.email.localeCompare(b.email, 'vi');
        case 'email-desc':
          return b.email.localeCompare(a.email, 'vi');
        case 'created-desc':
        default:
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });
  }, [filterRole, filterStatus, search, sortUsers, users]);

  const usersPagination = usePagination(filteredUsers, {
    initialPageSize: 10,
    resetKey: `${search}|${filterRole}|${filterStatus}|${sortUsers}`,
  });

  const openEdit = (item: AdminUser) => {
    setEditUser(item);
    setEditName(item.name);
    setEditEmail(item.email);
    setEditRole(item.adminRole || 'analyst');
    setEditCustomerRole(item.customerRole || 'pro_customer');
    setEditStatus(item.status);
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;
    setEditSaving(true);
    try {
      await adminUserService.update(accountTypeOf(editUser), editUser.id, {
        name: editName.trim(),
        email: editEmail.trim(),
        status: editStatus,
        ...(editUser.role === 'admin' ? { adminRole: editRole } : {}),
        ...(editUser.role === 'customer' ? { customerRole: editCustomerRole } : {}),
      });
      await loadUsers();
      setEditUser(null);
      toast.success(`Đã cập nhật thông tin "${editName}"`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không cập nhật được tài khoản'));
    } finally {
      setEditSaving(false);
    }
  };

  const handleCreateUser = async () => {
    if (!addName.trim() || !addEmail.trim() || !addPassword.trim() || !addConfirmPassword.trim()) {
      toast.error('Vui lòng nhập đầy đủ tên, email, mật khẩu và xác nhận mật khẩu');
      return;
    }
    if (addPassword.length < 8) {
      toast.error('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }
    if (addPassword !== addConfirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    setAddSaving(true);
    try {
      await adminUserService.create({
        name: addName.trim(),
        email: addEmail.trim(),
        password: addPassword,
        role: addRole,
        status: addStatus,
        ...(addRole === 'admin' ? { adminRole: addAdminRole } : {}),
        ...(addRole === 'customer' ? { customerRole: addCustomerRole } : {}),
      });
      const createdName = addName.trim();
      resetAddForm();
      setAddOpen(false);
      await loadUsers();
      toast.success(`Đã tạo tài khoản "${createdName}"`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không tạo được tài khoản'));
    } finally {
      setAddSaving(false);
    }
  };

  const handleSoftDelete = async () => {
    if (!confirmDelete) return;
    try {
      await adminUserService.remove(accountTypeOf(confirmDelete), confirmDelete.id);
      await loadUsers();
      toast.success('Đã chuyển vào thùng rác');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không xóa được tài khoản'));
    } finally {
      setConfirmDelete(null);
    }
  };

  const findTrashUser = (id: number | string) => trashUsers.find((item) => item.id === String(id));

  const handleRestore = async (id: number | string) => {
    const item = findTrashUser(id);
    if (!item) return;

    setProcessingTrashId(String(id));
    try {
      await adminUserService.restore(accountTypeOf(item), item.id);
      await loadUsers();
      toast.success('Đã khôi phục tài khoản');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không khôi phục được tài khoản'));
    } finally {
      setProcessingTrashId(null);
    }
  };

  const handlePermanentDelete = async (id: number | string) => {
    const item = findTrashUser(id);
    if (!item) return;

    setProcessingTrashId(String(id));
    try {
      await adminUserService.permanentDelete(accountTypeOf(item), item.id);
      await loadUsers();
      toast.success('Đã xóa vĩnh viễn tài khoản');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không xóa vĩnh viễn được tài khoản'));
    } finally {
      setProcessingTrashId(null);
    }
  };

  const handlePermanentDeleteAll = async (ids: Array<number | string>) => {
    const targets = ids
      .map(id => findTrashUser(id))
      .filter((item): item is AdminUser => Boolean(item));
    if (targets.length === 0) return;

    try {
      await adminUserService.permanentDeleteMany(targets.map(item => ({
        accountType: accountTypeOf(item),
        id: item.id,
      })));
      toast.success(`Đã xóa vĩnh viễn ${targets.length} tài khoản`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không xóa tất cả tài khoản được'));
    } finally {
      await loadUsers();
    }
  };

  const statusBadge = (status: UserStatus) => {
    if (status === 'active') return <Badge className="bg-primary/10 text-primary border-0 gap-1"><span className="w-1.5 h-1.5 bg-primary/50 rounded-full" />{STATUS_LABELS[status]}</Badge>;
    return <Badge className="bg-muted text-foreground/80 border-0 gap-1"><Lock className="w-3 h-3" />{STATUS_LABELS[status]}</Badge>;
  };

  const roleBadge = (item: AdminUser) => {
    if (item.role === 'customer') {
      const def = getCustomerRoleDef(item.customerRole);
      if (!def) return <Badge className="bg-muted text-foreground/70 border-0">Khách hàng</Badge>;
      return (
        <Badge className={`${def.color} ${def.textColor} border-0 gap-1`}>
          <span className={`w-1.5 h-1.5 rounded-full ${def.dotColor}`} />
          {def.label}
        </Badge>
      );
    }
    const def = getAdminRoleDef(item.adminRole);
    if (!def) return <Badge className="bg-destructive/10 text-destructive border-0">Quản trị viên</Badge>;
    return (
      <Badge className={`${def.color} ${def.textColor} border-0 gap-1`}>
        <span className={`w-1.5 h-1.5 rounded-full ${def.dotColor}`} />
        {def.label}
      </Badge>
    );
  };

  const statusOptions = () => CUSTOMER_STATUS_OPTIONS;

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Quản lý người dùng</h1>
            <p className="text-muted-foreground text-sm">Dữ liệu được đọc trực tiếp từ MongoDB qua API admin.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTrashOpen(true)}
              className="relative flex items-center gap-1.5 border border-border hover:border-red-300 hover:bg-destructive/10 text-muted-foreground hover:text-red-600 rounded-xl px-3 py-2 text-sm font-semibold transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Thùng rác
              {trashUsers.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive/100 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {trashUsers.length}
                </span>
              )}
            </button>
            {isSuperAdmin && (
              <Button
                onClick={() => setAddOpen(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl gap-2 text-sm"
              >
                <UserPlus className="w-4 h-4" /> Thêm người dùng
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <Card className="p-16 text-center text-sm text-muted-foreground">Đang tải dữ liệu MongoDB...</Card>
        ) : (
          <>
            <AdminFilterBar
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder="Tìm theo tên, email..."
              rightSlot={
                <div className="flex flex-wrap gap-2">
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả vai trò</SelectItem>
                      <SelectItem value="customer">Khách hàng</SelectItem>
                      <SelectItem value="admin">Quản trị viên</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
                      {CUSTOMER_STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status} value={status}>{STATUS_LABELS[status]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={sortUsers} onValueChange={setSortUsers}>
                    <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created-desc">Mới nhất</SelectItem>
                      <SelectItem value="created-asc">Cũ nhất</SelectItem>
                      <SelectItem value="name-asc">Tên A-Z</SelectItem>
                      <SelectItem value="name-desc">Tên Z-A</SelectItem>
                      <SelectItem value="email-asc">Email A-Z</SelectItem>
                      <SelectItem value="email-desc">Email Z-A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              }
              className="mb-4"
            />

            <AdminTable
              empty={filteredUsers.length === 0 ? <div className="text-center py-12 text-muted-foreground/80 text-sm">Không tìm thấy người dùng nào.</div> : undefined}
            >
              <TableHeader>
                <TableRow>
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tham gia</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersPagination.pageItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${item.role === 'admin' ? 'bg-gradient-to-br from-green-500 to-green-700' : 'bg-gradient-to-br from-green-500 to-emerald-700'}`}>
                          {item.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-foreground">{item.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" />{item.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{roleBadge(item)}</TableCell>
                    <TableCell>{statusBadge(item.status)}</TableCell>
                    <TableCell><span className="text-sm text-foreground/70 flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-muted-foreground/80" />{formatDate(item.createdAt)}</span></TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => openEdit(item)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary/5 text-muted-foreground/80 hover:text-primary transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {isSuperAdmin && (
                          <button onClick={() => setConfirmDelete(item)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-destructive/10 text-muted-foreground/80 hover:text-red-500 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </AdminTable>
            <DataPagination
              page={usersPagination.page}
              pageSize={usersPagination.pageSize}
              totalItems={usersPagination.totalItems}
              totalPages={usersPagination.totalPages}
              startIndex={usersPagination.startIndex}
              endIndex={usersPagination.endIndex}
              onPageChange={usersPagination.setPage}
              onPageSizeChange={usersPagination.setPageSize}
              itemLabel="người dùng"
            />
          </>
        )}
      </div>

      <Dialog open={addOpen} onOpenChange={(open) => { setAddOpen(open); if (!open) resetAddForm(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-primary" />
              </div>
              Thêm người dùng
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Họ và tên</Label>
              <Input value={addName} onChange={event => setAddName(event.target.value)} placeholder="Nguyễn Văn A" className="h-10" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Email</Label>
              <Input value={addEmail} onChange={event => setAddEmail(event.target.value)} placeholder="user@copypro.vn" className="h-10" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Mật khẩu</Label>
              <Input type="password" value={addPassword} onChange={event => setAddPassword(event.target.value)} placeholder="Tối thiểu 8 ký tự" className="h-10" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Xác nhận mật khẩu</Label>
              <Input type="password" value={addConfirmPassword} onChange={event => setAddConfirmPassword(event.target.value)} placeholder="Nhập lại mật khẩu" className="h-10" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Vai trò</Label>
                <Select value={addRole} onValueChange={(value: UserRole) => { setAddRole(value); setAddStatus('active'); }}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Khách hàng</SelectItem>
                    <SelectItem value="admin">Quản trị viên</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Trạng thái</Label>
                <Select value={addStatus} onValueChange={(value: UserStatus) => setAddStatus(value)}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statusOptions().map((status) => (
                      <SelectItem key={status} value={status}>{STATUS_LABELS[status]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {addRole === 'admin' && (
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Loại Admin</Label>
                <Select value={addAdminRole} onValueChange={(value) => setAddAdminRole(value)}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(adminRoles).map(([key, def]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${def.dotColor}`} />
                          {def.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {addRole === 'customer' && (
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Nhóm Customer</Label>
                <Select value={addCustomerRole} onValueChange={(value) => setAddCustomerRole(value)}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(customerRoles).map(([key, def]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${def.dotColor}`} />
                          {def.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <button onClick={() => setAddOpen(false)} className="flex-1 h-10 border border-border rounded-xl text-sm font-semibold text-foreground/70 hover:bg-surface-muted transition-colors">Hủy</button>
              <button onClick={handleCreateUser} disabled={addSaving} className="flex-1 h-10 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {addSaving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : 'Tạo người dùng'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Edit2 className="w-4 h-4 text-primary" />
              </div>
              Chỉnh sửa tài khoản
            </DialogTitle>
          </DialogHeader>
          {editUser && (
            <div className="space-y-4 pt-1">
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Họ và tên</Label>
                <Input value={editName} onChange={event => setEditName(event.target.value)} className="h-10" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Email</Label>
                <Input value={editEmail} onChange={event => setEditEmail(event.target.value)} className="h-10" />
              </div>
              {editUser.role === 'admin' && (
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Loại Admin</Label>
                  <Select value={editRole} onValueChange={(value) => setEditRole(value)}>
                    <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(adminRoles).map(([key, def]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${def.dotColor}`} />
                            {def.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {editUser.role === 'customer' && (
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Nhóm Customer</Label>
                  <Select value={editCustomerRole} onValueChange={(value) => setEditCustomerRole(value)}>
                    <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(customerRoles).map(([key, def]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${def.dotColor}`} />
                            {def.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Trạng thái</Label>
                <Select value={editStatus} onValueChange={(value: UserStatus) => setEditStatus(value)}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statusOptions().map((status) => (
                      <SelectItem key={status} value={status}>{STATUS_LABELS[status]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setEditUser(null)} className="flex-1 h-10 border border-border rounded-xl text-sm font-semibold text-foreground/70 hover:bg-surface-muted transition-colors">Hủy</button>
                <button onClick={handleSaveEdit} disabled={editSaving} className="flex-1 h-10 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {editSaving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : 'Lưu thay đổi'}
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleSoftDelete}
        title={`Xóa tài khoản "${confirmDelete?.name}"?`}
        description="Tài khoản sẽ được chuyển vào thùng rác và có thể khôi phục."
        confirmLabel="Chuyển vào thùng rác"
      />

      <TrashBin
        open={trashOpen}
        onClose={() => setTrashOpen(false)}
        items={trashUsers.map(item => ({
          id: item.id,
          label: item.name,
          subLabel: item.email,
          deletedAt: formatDate(item.deletedAt),
        }))}
        onRestore={handleRestore}
        onPermanentDelete={handlePermanentDelete}
        onPermanentDeleteAll={handlePermanentDeleteAll}
        entityName="tài khoản"
        loading={processingTrashId}
      />
    </Layout>
  );
}
