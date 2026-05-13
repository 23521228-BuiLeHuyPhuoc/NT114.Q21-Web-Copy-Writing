import { useState } from 'react';
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
  UserPlus, Mail, Calendar, CheckCircle2, XCircle,
  Clock, Shield, Users as UsersIcon, ChevronDown, Edit2, Trash2, RotateCcw,
} from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';
import { getAdminRoleDef, getAdminRoles } from '@/lib/permissions';
import { ConfirmDialog } from '@/app/components/admin/ConfirmDialog';
import { TrashBin } from '@/app/components/admin/TrashBin';
import { AdminFilterBar } from '@/app/components/admin/AdminFilterBar';
import { AdminTable } from '@/app/components/admin/AdminTable';
import toast from 'react-hot-toast';
import type { UserStatus } from '@/types/auth';

type Tab = 'all' | 'pending';

interface DeletedUser {
  id: string;
  name: string;
  email: string;
  deletedAt: string;
}

export function AdminUsers() {
  const { user, addUser, approveAdmin, rejectAdmin, updateUser, getAllUsers, getPendingAdmins } = useAuth();
  const isSuperAdmin = user?.adminRole === 'super_admin';
  const adminRoles = getAdminRoles();

  const [tab, setTab] = useState<Tab>('pending');
  const [search, setSearch] = useState('');
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId]  = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  // Edit
  const [editUser, setEditUser] = useState<any | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editStatus, setEditStatus] = useState<UserStatus>('active');
  const [editSaving, setEditSaving] = useState(false);

  // Add user
  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [addRole, setAddRole] = useState<'customer' | 'admin'>('customer');
  const [addAdminRole, setAddAdminRole] = useState('analyst');
  const [addStatus, setAddStatus] = useState<UserStatus>('active');
  const [addSaving, setAddSaving] = useState(false);

  // Soft delete
  const [deletedUsers, setDeletedUsers] = useState<DeletedUser[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<any | null>(null);
  const [trashOpen, setTrashOpen] = useState(false);
  const [trashLoading, setTrashLoading] = useState<string | null>(null);

  const forceRefresh = () => setTick(t => t + 1);

  const resetAddForm = () => {
    setAddName('');
    setAddEmail('');
    setAddPassword('');
    setAddRole('customer');
    setAddAdminRole('analyst');
    setAddStatus('active');
  };

  const allUsers = getAllUsers().map(({ password: _, ...u }) => u).filter(
    u => !deletedUsers.find(d => d.id === u.id)
  );
  const freshPending = getPendingAdmins().filter(u => !deletedUsers.find(d => d.id === u.id));

  const filteredAll = allUsers.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleApprove = async (id: string, name: string) => {
    setApprovingId(id); await new Promise(r => setTimeout(r, 600));
    approveAdmin(id); forceRefresh(); setApprovingId(null);
    toast.success(`Đã phê duyệt tài khoản "${name}"`);
  };

  const handleReject = async (id: string, name: string) => {
    setRejectingId(id); await new Promise(r => setTimeout(r, 600));
    rejectAdmin(id); forceRefresh(); setRejectingId(null);
    toast.error(`Đã từ chối tài khoản "${name}"`);
  };

  const openEdit = (u: any) => {
    setEditUser(u); setEditName(u.name); setEditEmail(u.email);
    setEditRole(u.adminRole || u.role);
    setEditStatus(u.status as UserStatus);
  };

  const handleSaveEdit = async () => {
    setEditSaving(true); await new Promise(r => setTimeout(r, 700));
    if (editUser) {
      updateUser(editUser.id, {
        name: editName,
        email: editEmail,
        status: editStatus,
        ...(editUser.role === 'admin' ? { adminRole: editRole } : {}),
      });
      forceRefresh();
    }
    setEditSaving(false); setEditUser(null);
    toast.success(`Đã cập nhật thông tin "${editName}"`);
  };

  const handleCreateUser = async () => {
    if (!addName.trim() || !addEmail.trim() || !addPassword.trim()) {
      toast.error('Vui lòng nhập đầy đủ tên, email và mật khẩu');
      return;
    }
    if (addPassword.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setAddSaving(true);
    await new Promise(r => setTimeout(r, 500));
    try {
      addUser({
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
      forceRefresh();
      toast.success(`Đã tạo tài khoản "${createdName}"`);
    } catch (err: any) {
      toast.error(err.message || 'Không thể tạo tài khoản');
    } finally {
      setAddSaving(false);
    }
  };

  const handleSoftDelete = async () => {
    if (!confirmDelete) return;
    await new Promise(r => setTimeout(r, 400));
    setDeletedUsers(prev => [...prev, {
      id: confirmDelete.id, name: confirmDelete.name,
      email: confirmDelete.email,
      deletedAt: new Date().toLocaleString('vi-VN'),
    }]);
    setConfirmDelete(null);
    toast.success('Đã chuyển vào thùng rác');
  };

  const handleRestore = async (id: string | number) => {
    setTrashLoading(String(id)); await new Promise(r => setTimeout(r, 600));
    setDeletedUsers(prev => prev.filter(u => u.id !== String(id)));
    setTrashLoading(null);
    toast.success('Đã khôi phục tài khoản');
  };

  const handlePermanentDelete = async (id: string | number) => {
    setTrashLoading(String(id)); await new Promise(r => setTimeout(r, 600));
    setDeletedUsers(prev => prev.filter(u => u.id !== String(id)));
    setTrashLoading(null);
    toast.error('Đã xoá vĩnh viễn tài khoản');
  };

  const statusBadge = (status: string) => {
    if (status === 'active')   return <Badge className="bg-green-100 text-green-700 border-0 gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full" />Active</Badge>;
    if (status === 'pending')  return <Badge className="bg-amber-100 text-amber-700 border-0 gap-1"><span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />Chờ duyệt</Badge>;
    if (status === 'rejected') return <Badge className="bg-red-100 text-red-700 border-0 gap-1"><span className="w-1.5 h-1.5 bg-red-500 rounded-full" />Từ chối</Badge>;
    return null;
  };

  const roleBadge = (u: any) => {
    if (u.role === 'customer') return <Badge className="bg-gray-100 text-gray-600 border-0">Customer</Badge>;
    if (!u.adminRole) return <Badge className="bg-red-100 text-red-700 border-0">Admin</Badge>;
    const def = getAdminRoleDef(u.adminRole);
    if (!def) return null;
    return (
      <Badge className={`${def.color} ${def.textColor} border-0 gap-1`}>
        <span className={`w-1.5 h-1.5 rounded-full ${def.dotColor}`} />
        {def.label}
      </Badge>
    );
  };

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto" key={tick}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Quản Lý Users</h1>
            <p className="text-gray-500 text-sm">Quản lý tài khoản và phê duyệt admin mới</p>
          </div>
          <div className="flex items-center gap-2">
            {freshPending.length > 0 && (
              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-3 py-1.5 text-xs font-semibold">
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                {freshPending.length} chờ duyệt
              </div>
            )}
            <button
              onClick={() => setTrashOpen(true)}
              className="relative flex items-center gap-1.5 border border-gray-200 hover:border-red-300 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-xl px-3 py-2 text-sm font-semibold transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Thùng rác
              {deletedUsers.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {deletedUsers.length}
                </span>
              )}
            </button>
            {isSuperAdmin && (
              <Button
                onClick={() => setAddOpen(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl gap-2 text-sm"
              >
                <UserPlus className="w-4 h-4" /> Thêm User
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
          <button onClick={() => setTab('pending')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'pending' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <Clock className="w-4 h-4" />
            Chờ duyệt
            {freshPending.length > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{freshPending.length}</span>
            )}
          </button>
          <button onClick={() => setTab('all')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <UsersIcon className="w-4 h-4" />
            Tất cả Users
          </button>
        </div>

        {/* ── PENDING TAB ── */}
        {tab === 'pending' && (
          <>
            {freshPending.length === 0 ? (
              <Card className="p-16 text-center">
                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Không có yêu cầu nào</h3>
                <p className="text-gray-400 text-sm">Tất cả tài khoản Admin đã được xem xét.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {freshPending.map(u => {
                  const roleDef = u.adminRole ? getAdminRoleDef(u.adminRole) : null;
                  const isApproving = approvingId === u.id;
                  const isRejecting = rejectingId  === u.id;
                  return (
                    <Card key={u.id} className="p-5 border-2 border-amber-100 bg-amber-50/30 hover:border-amber-200 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-md shadow-amber-200">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="font-semibold text-gray-900 text-sm">{u.name}</p>
                            {roleDef && (
                              <span className={`inline-flex items-center gap-1 ${roleDef.color} border ${roleDef.borderColor} rounded-full px-2 py-0.5 text-[11px] font-semibold ${roleDef.textColor}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${roleDef.dotColor}`} />
                                {roleDef.label}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1 bg-amber-100 border border-amber-200 rounded-full px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                              <Clock className="w-2.5 h-2.5" /> Chờ duyệt
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{u.email}</span>
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Đăng ký {u.createdAt}</span>
                          </div>
                          {roleDef && <p className="text-xs text-gray-400 mt-1">{roleDef.description}</p>}
                        </div>
                        {isSuperAdmin ? (
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button onClick={() => handleReject(u.id, u.name)} disabled={isApproving || isRejecting} className="flex items-center gap-1.5 border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-40 rounded-xl px-4 py-2 text-sm font-semibold transition-all">
                              {isRejecting ? <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                              Từ chối
                            </button>
                            <button onClick={() => handleApprove(u.id, u.name)} disabled={isApproving || isRejecting} className="flex items-center gap-1.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-40 text-white rounded-xl px-4 py-2 text-sm font-semibold transition-all shadow-sm shadow-green-200">
                              {isApproving ? <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                              Phê duyệt
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic flex-shrink-0">Chỉ Super Admin mới có thể duyệt</span>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── ALL USERS TAB ── */}
        {tab === 'all' && (
          <>
            <AdminFilterBar
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder="Tìm theo tên, email..."
              className="mb-4"
              rightSlot={
                <Button variant="outline" size="sm" className="gap-1.5 text-sm">
                  Lọc <ChevronDown className="w-3.5 h-3.5" />
                </Button>
              }
            />

            <AdminTable
              empty={filteredAll.length === 0 ? <div className="text-center py-12 text-gray-400 text-sm">Không tìm thấy user nào.</div> : undefined}
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
                  {filteredAll.map((u) => (
                    <TableRow key={u.id} className={u.status === 'pending' ? 'bg-amber-50/40' : u.status === 'rejected' ? 'bg-red-50/30' : ''}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${u.status === 'pending' ? 'bg-gradient-to-br from-amber-400 to-amber-600' : u.status === 'rejected' ? 'bg-gradient-to-br from-red-400 to-red-600' : u.role === 'admin' ? 'bg-gradient-to-br from-purple-500 to-purple-700' : 'bg-gradient-to-br from-green-500 to-emerald-700'}`}>
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-sm text-gray-900">{u.name}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1"><Mail className="w-3 h-3" />{u.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{roleBadge(u)}</TableCell>
                      <TableCell>{statusBadge(u.status)}</TableCell>
                      <TableCell><span className="text-sm text-gray-600 flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-gray-400" />{u.createdAt}</span></TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-end">
                          {isSuperAdmin && u.status === 'pending' && (
                            <>
                              <button onClick={() => handleReject(u.id, u.name)} className="text-xs text-red-600 hover:text-red-700 font-semibold border border-red-200 hover:bg-red-50 rounded-lg px-2.5 py-1 transition-all">Từ chối</button>
                              <button onClick={() => handleApprove(u.id, u.name)} className="text-xs text-green-700 hover:text-green-800 font-semibold border border-green-200 hover:bg-green-50 rounded-lg px-2.5 py-1 transition-all">Duyệt</button>
                            </>
                          )}
                          <button onClick={() => openEdit(u)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {isSuperAdmin && (
                            <button onClick={() => setConfirmDelete(u)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
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

      {/* ADD USER DIALOG */}
      <Dialog open={addOpen} onOpenChange={(open) => { setAddOpen(open); if (!open) resetAddForm(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-green-600" />
              </div>
              Thêm User
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div>
              <Label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">Họ và tên</Label>
              <Input value={addName} onChange={e => setAddName(e.target.value)} placeholder="Nguyễn Văn A" className="h-10" />
            </div>
            <div>
              <Label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">Email</Label>
              <Input value={addEmail} onChange={e => setAddEmail(e.target.value)} placeholder="user@copypro.vn" className="h-10" />
            </div>
            <div>
              <Label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">Mật khẩu</Label>
              <Input type="password" value={addPassword} onChange={e => setAddPassword(e.target.value)} placeholder="Tối thiểu 6 ký tự" className="h-10" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">Vai trò</Label>
                <Select value={addRole} onValueChange={(value: 'customer' | 'admin') => setAddRole(value)}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">Trạng thái</Label>
                <Select value={addStatus} onValueChange={(value) => setAddStatus(value as UserStatus)}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Chờ duyệt</SelectItem>
                    <SelectItem value="rejected">Từ chối</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {addRole === 'admin' && (
              <div>
                <Label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">Loại Admin</Label>
                <Select value={addAdminRole} onValueChange={setAddAdminRole}>
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
              <button onClick={() => setAddOpen(false)} className="flex-1 h-10 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Huỷ</button>
              <button onClick={handleCreateUser} disabled={addSaving} className="flex-1 h-10 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {addSaving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : 'Tạo user'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── EDIT DIALOG ── */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Edit2 className="w-4 h-4 text-blue-600" />
              </div>
              Chỉnh sửa tài khoản
            </DialogTitle>
          </DialogHeader>
          {editUser && (
            <div className="space-y-4 pt-1">
              <div>
                <Label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">Họ và tên</Label>
                <Input value={editName} onChange={e => setEditName(e.target.value)} className="h-10" />
              </div>
              <div>
                <Label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">Email</Label>
                <Input value={editEmail} onChange={e => setEditEmail(e.target.value)} className="h-10" />
              </div>
              {editUser.role === 'admin' && (
                <div>
                  <Label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">Loại Admin</Label>
                  <Select value={editRole} onValueChange={setEditRole}>
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
                <Label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">Trạng thái</Label>
                <Select value={editStatus} onValueChange={(value) => setEditStatus(value as UserStatus)}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">✅ Active</SelectItem>
                    <SelectItem value="pending">🕐 Chờ duyệt</SelectItem>
                    <SelectItem value="rejected">❌ Từ chối</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setEditUser(null)} className="flex-1 h-10 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Huỷ</button>
                <button onClick={handleSaveEdit} disabled={editSaving} className="flex-1 h-10 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {editSaving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : 'Lưu thay đổi'}
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── CONFIRM DELETE ── */}
      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleSoftDelete}
        title={`Xoá tài khoản "${confirmDelete?.name}"?`}
        description="Tài khoản sẽ được chuyển vào thùng rác. Bạn có thể khôi phục trong vòng 30 ngày."
        confirmLabel="Chuyển vào thùng rác"
      />

      {/* ── TRASH BIN ── */}
      <TrashBin
        open={trashOpen}
        onClose={() => setTrashOpen(false)}
        items={deletedUsers.map(u => ({ id: u.id, label: u.name, subLabel: u.email, deletedAt: u.deletedAt }))}
        onRestore={id => handleRestore(id)}
        onPermanentDelete={id => handlePermanentDelete(id)}
        entityName="tài khoản"
        loading={trashLoading}
      />
    </Layout>
  );
}
