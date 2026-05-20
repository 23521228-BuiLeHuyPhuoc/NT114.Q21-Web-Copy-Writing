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
  CheckCircle2,
  Clock,
  Edit2,
  Lock,
  Mail,
  RotateCcw,
  Trash2,
  UserPlus,
  Users as UsersIcon,
  XCircle,
} from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';
import { getAdminRoleDef, getAdminRoles, type AdminRole } from '@/lib/permissions';
import { adminUserService, type AdminUser } from '@/services/adminUserService';
import { ConfirmDialog } from '@/app/components/admin/ConfirmDialog';
import { TrashBin } from '@/app/components/admin/TrashBin';
import { AdminFilterBar } from '@/app/components/admin/AdminFilterBar';
import { AdminTable } from '@/app/components/admin/AdminTable';
import toast from 'react-hot-toast';
import type { UserRole, UserStatus } from '@/types/auth';

type Tab = 'all' | 'pending';

const CUSTOMER_STATUS_OPTIONS: UserStatus[] = ['active', 'locked'];
const ADMIN_STATUS_OPTIONS: UserStatus[] = ['pending', 'active', 'rejected', 'locked'];

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

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [trashUsers, setTrashUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('pending');
  const [search, setSearch] = useState('');

  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [processingTrashId, setProcessingTrashId] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [addRole, setAddRole] = useState<UserRole>('customer');
  const [addAdminRole, setAddAdminRole] = useState<AdminRole>('analyst');
  const [addStatus, setAddStatus] = useState<UserStatus>('active');
  const [addSaving, setAddSaving] = useState(false);

  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<AdminRole>('analyst');
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
      toast.error(getErrorMessage(error, 'Khong tai duoc danh sach users'));
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
    setAddRole('customer');
    setAddAdminRole('analyst');
    setAddStatus('active');
  };

  const pendingUsers = useMemo(
    () => users.filter((item) => item.role === 'admin' && item.status === 'pending'),
    [users],
  );

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return users;
    return users.filter((item) =>
      item.name.toLowerCase().includes(keyword) ||
      item.email.toLowerCase().includes(keyword)
    );
  }, [search, users]);

  const openEdit = (item: AdminUser) => {
    setEditUser(item);
    setEditName(item.name);
    setEditEmail(item.email);
    setEditRole(item.adminRole || 'analyst');
    setEditStatus(item.status);
  };

  const handleApprove = async (id: string, name: string) => {
    setApprovingId(id);
    try {
      await adminUserService.approve(id);
      await loadUsers();
      toast.success(`Da phe duyet tai khoan "${name}"`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Khong phe duyet duoc tai khoan'));
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (id: string, name: string) => {
    setRejectingId(id);
    try {
      await adminUserService.reject(id);
      await loadUsers();
      toast.success(`Da tu choi tai khoan "${name}"`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Khong tu choi duoc tai khoan'));
    } finally {
      setRejectingId(null);
    }
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
      });
      await loadUsers();
      setEditUser(null);
      toast.success(`Da cap nhat thong tin "${editName}"`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Khong cap nhat duoc tai khoan'));
    } finally {
      setEditSaving(false);
    }
  };

  const handleCreateUser = async () => {
    if (!addName.trim() || !addEmail.trim() || !addPassword.trim()) {
      toast.error('Vui long nhap day du ten, email va mat khau');
      return;
    }
    if (addPassword.length < 8) {
      toast.error('Mat khau phai co it nhat 8 ky tu');
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
      });
      const createdName = addName.trim();
      resetAddForm();
      setAddOpen(false);
      setTab('all');
      await loadUsers();
      toast.success(`Da tao tai khoan "${createdName}"`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Khong tao duoc tai khoan'));
    } finally {
      setAddSaving(false);
    }
  };

  const handleSoftDelete = async () => {
    if (!confirmDelete) return;
    try {
      await adminUserService.remove(accountTypeOf(confirmDelete), confirmDelete.id);
      await loadUsers();
      toast.success('Da chuyen vao thung rac');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Khong xoa duoc tai khoan'));
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
      toast.success('Da khoi phuc tai khoan');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Khong khoi phuc duoc tai khoan'));
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
      toast.success('Da xoa vinh vien tai khoan');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Khong xoa vinh vien duoc tai khoan'));
    } finally {
      setProcessingTrashId(null);
    }
  };

  const statusBadge = (status: UserStatus) => {
    if (status === 'active') return <Badge className="bg-primary/10 text-primary border-0 gap-1"><span className="w-1.5 h-1.5 bg-primary/50 rounded-full" />Active</Badge>;
    if (status === 'pending') return <Badge className="bg-warning/15 text-amber-800 border-0 gap-1"><span className="w-1.5 h-1.5 bg-warning/100 rounded-full animate-pulse" />Cho duyet</Badge>;
    if (status === 'rejected') return <Badge className="bg-destructive/10 text-destructive border-0 gap-1"><span className="w-1.5 h-1.5 bg-destructive/100 rounded-full" />Tu choi</Badge>;
    return <Badge className="bg-muted text-foreground/80 border-0 gap-1"><Lock className="w-3 h-3" />Locked</Badge>;
  };

  const roleBadge = (item: AdminUser) => {
    if (item.role === 'customer') return <Badge className="bg-muted text-foreground/70 border-0">Customer</Badge>;
    const def = getAdminRoleDef(item.adminRole);
    if (!def) return <Badge className="bg-destructive/10 text-destructive border-0">Admin</Badge>;
    return (
      <Badge className={`${def.color} ${def.textColor} border-0 gap-1`}>
        <span className={`w-1.5 h-1.5 rounded-full ${def.dotColor}`} />
        {def.label}
      </Badge>
    );
  };

  const statusOptions = (role: UserRole) => role === 'admin' ? ADMIN_STATUS_OPTIONS : CUSTOMER_STATUS_OPTIONS;

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Quan Ly Users</h1>
            <p className="text-muted-foreground text-sm">Du lieu duoc doc truc tiep tu MongoDB qua API admin.</p>
          </div>
          <div className="flex items-center gap-2">
            {pendingUsers.length > 0 && (
              <div className="flex items-center gap-1.5 bg-warning/10 border border-amber-200 text-amber-700 rounded-xl px-3 py-1.5 text-xs font-semibold">
                <span className="w-2 h-2 bg-warning/100 rounded-full animate-pulse" />
                {pendingUsers.length} cho duyet
              </div>
            )}
            <button
              onClick={() => setTrashOpen(true)}
              className="relative flex items-center gap-1.5 border border-border hover:border-red-300 hover:bg-destructive/10 text-muted-foreground hover:text-red-600 rounded-xl px-3 py-2 text-sm font-semibold transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Thung rac
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
                <UserPlus className="w-4 h-4" /> Them User
              </Button>
            )}
          </div>
        </div>

        <div className="flex gap-1 mb-5 bg-muted p-1 rounded-xl w-fit">
          <button onClick={() => setTab('pending')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'pending' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground/80'}`}>
            <Clock className="w-4 h-4" />
            Cho duyet
            {pendingUsers.length > 0 && (
              <span className="bg-warning/100 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{pendingUsers.length}</span>
            )}
          </button>
          <button onClick={() => setTab('all')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'all' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground/80'}`}>
            <UsersIcon className="w-4 h-4" />
            Tat ca Users
          </button>
        </div>

        {loading ? (
          <Card className="p-16 text-center text-sm text-muted-foreground">Dang tai du lieu MongoDB...</Card>
        ) : tab === 'pending' ? (
          pendingUsers.length === 0 ? (
            <Card className="p-16 text-center">
              <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">Khong co yeu cau nao</h3>
              <p className="text-muted-foreground/80 text-sm">Tat ca tai khoan Admin da duoc xem xet.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingUsers.map((item) => {
                const roleDef = item.adminRole ? getAdminRoleDef(item.adminRole) : null;
                const isApproving = approvingId === item.id;
                const isRejecting = rejectingId === item.id;
                return (
                  <Card key={item.id} className="p-5 border-2 border-amber-100 bg-warning/10 hover:border-amber-200 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-md shadow-amber-200">
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-semibold text-foreground text-sm">{item.name}</p>
                          {roleDef && (
                            <span className={`inline-flex items-center gap-1 ${roleDef.color} border ${roleDef.borderColor} rounded-full px-2 py-0.5 text-[11px] font-semibold ${roleDef.textColor}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${roleDef.dotColor}`} />
                              {roleDef.label}
                            </span>
                          )}
                          {statusBadge(item.status)}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{item.email}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Dang ky {formatDate(item.createdAt)}</span>
                        </div>
                      </div>
                      {isSuperAdmin ? (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button onClick={() => handleReject(item.id, item.name)} disabled={isApproving || isRejecting} className="flex items-center gap-1.5 border border-red-200 text-red-600 hover:bg-destructive/10 disabled:opacity-40 rounded-xl px-4 py-2 text-sm font-semibold transition-all">
                            {isRejecting ? <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                            Tu choi
                          </button>
                          <button onClick={() => handleApprove(item.id, item.name)} disabled={isApproving || isRejecting} className="flex items-center gap-1.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-40 text-white rounded-xl px-4 py-2 text-sm font-semibold transition-all shadow-sm shadow-primary/20">
                            {isApproving ? <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                            Phe duyet
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/80 italic flex-shrink-0">Chi Super Admin moi co the duyet</span>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )
        ) : (
          <>
            <AdminFilterBar
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder="Tim theo ten, email..."
              className="mb-4"
            />

            <AdminTable
              empty={filteredUsers.length === 0 ? <div className="text-center py-12 text-muted-foreground/80 text-sm">Khong tim thay user nao.</div> : undefined}
            >
              <TableHeader>
                <TableRow>
                  <TableHead>Nguoi dung</TableHead>
                  <TableHead>Vai tro</TableHead>
                  <TableHead>Trang thai</TableHead>
                  <TableHead>Ngay tham gia</TableHead>
                  <TableHead className="text-right">Thao tac</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((item) => (
                  <TableRow key={item.id} className={item.status === 'pending' ? 'bg-warning/15' : item.status === 'rejected' ? 'bg-destructive/10' : ''}>
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
                        {isSuperAdmin && item.role === 'admin' && item.status === 'pending' && (
                          <>
                            <button onClick={() => handleReject(item.id, item.name)} className="text-xs text-red-600 hover:text-red-700 font-semibold border border-red-200 hover:bg-destructive/10 rounded-lg px-2.5 py-1 transition-all">Tu choi</button>
                            <button onClick={() => handleApprove(item.id, item.name)} className="text-xs text-primary hover:text-primary/80 font-semibold border border-primary/20 hover:bg-primary/5 rounded-lg px-2.5 py-1 transition-all">Duyet</button>
                          </>
                        )}
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
              Them User
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Ho va ten</Label>
              <Input value={addName} onChange={event => setAddName(event.target.value)} placeholder="Nguyen Van A" className="h-10" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Email</Label>
              <Input value={addEmail} onChange={event => setAddEmail(event.target.value)} placeholder="user@copypro.vn" className="h-10" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Mat khau</Label>
              <Input type="password" value={addPassword} onChange={event => setAddPassword(event.target.value)} placeholder="Toi thieu 8 ky tu" className="h-10" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Vai tro</Label>
                <Select value={addRole} onValueChange={(value: UserRole) => { setAddRole(value); setAddStatus(value === 'admin' ? 'pending' : 'active'); }}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Trang thai</Label>
                <Select value={addStatus} onValueChange={(value: UserStatus) => setAddStatus(value)}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statusOptions(addRole).map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {addRole === 'admin' && (
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Loai Admin</Label>
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
            <div className="flex gap-2 pt-2">
              <button onClick={() => setAddOpen(false)} className="flex-1 h-10 border border-border rounded-xl text-sm font-semibold text-foreground/70 hover:bg-surface-muted transition-colors">Huy</button>
              <button onClick={handleCreateUser} disabled={addSaving} className="flex-1 h-10 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {addSaving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : 'Tao user'}
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
              Chinh sua tai khoan
            </DialogTitle>
          </DialogHeader>
          {editUser && (
            <div className="space-y-4 pt-1">
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Ho va ten</Label>
                <Input value={editName} onChange={event => setEditName(event.target.value)} className="h-10" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Email</Label>
                <Input value={editEmail} onChange={event => setEditEmail(event.target.value)} className="h-10" />
              </div>
              {editUser.role === 'admin' && (
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Loai Admin</Label>
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
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Trang thai</Label>
                <Select value={editStatus} onValueChange={(value: UserStatus) => setEditStatus(value)}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statusOptions(editUser.role).map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setEditUser(null)} className="flex-1 h-10 border border-border rounded-xl text-sm font-semibold text-foreground/70 hover:bg-surface-muted transition-colors">Huy</button>
                <button onClick={handleSaveEdit} disabled={editSaving} className="flex-1 h-10 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {editSaving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : 'Luu thay doi'}
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
        title={`Xoa tai khoan "${confirmDelete?.name}"?`}
        description="Tai khoan se duoc chuyen vao thung rac va co the khoi phuc."
        confirmLabel="Chuyen vao thung rac"
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
        entityName="tai khoan"
        loading={processingTrashId}
      />
    </Layout>
  );
}
