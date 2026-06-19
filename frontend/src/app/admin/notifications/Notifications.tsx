'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Bell,
  Check,
  Inbox,
  Mail,
  RefreshCw,
  Search,
  Send,
  Shield,
  Users,
} from 'lucide-react';
import { Layout } from '@/app/components/Layout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';
import { Checkbox } from '@/app/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { AdminFilterBar } from '@/app/components/admin/AdminFilterBar';
import { AdminTable } from '@/app/components/admin/AdminTable';
import { DataPagination } from '@/app/components/common/DataPagination';
import { useAuth } from '@/app/contexts/AuthContext';
import { getAdminRoleDef } from '@/lib/permissions';
import { matchesSearchRegex } from '@/lib/searchRegex';
import { adminUserService, type AdminUser } from '@/services/adminUserService';
import {
  adminNotificationService,
  type AdminNotification,
  type AdminNotificationAccountType,
  type AdminNotificationRecipientInput,
  type AdminNotificationRecipientMode,
  type AdminNotificationSource,
  type AdminNotificationType,
} from '@/services/adminNotificationService';

const TYPE_LABELS: Record<AdminNotificationType, string> = {
  system: 'Hệ thống',
  billing: 'Thanh toán',
  ai: 'AI',
  account: 'Tài khoản',
};

const TYPE_CLASSES: Record<AdminNotificationType, string> = {
  system: 'bg-blue-100 text-blue-700 border-0',
  billing: 'bg-amber-100 text-amber-700 border-0',
  ai: 'bg-emerald-100 text-emerald-700 border-0',
  account: 'bg-slate-100 text-slate-700 border-0',
};

const MODE_LABELS: Record<AdminNotificationRecipientMode, string> = {
  all_users: 'Tất cả khách hàng',
  all_admins: 'Tất cả admin khác',
  selected: 'Chọn thủ công',
};

function getErrorMessage(error: unknown, fallback: string) {
  const err = error as { response?: { data?: { message?: string } }; message?: string };
  return err.response?.data?.message || err.message || fallback;
}

function formatDate(value?: string | Date | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function accountTypeOf(account: AdminUser): AdminNotificationAccountType {
  return account.role === 'admin' ? 'admin' : 'user';
}

function recipientKey(account: AdminUser) {
  return `${accountTypeOf(account)}:${account.id}`;
}

function parseRecipientKey(key: string): AdminNotificationRecipientInput | null {
  const [accountType, id] = key.split(':');
  if ((accountType !== 'user' && accountType !== 'admin') || !id) return null;
  return { accountType, id };
}

function roleBadge(account: AdminUser) {
  if (account.role === 'customer') {
    return <Badge className="bg-muted text-foreground/70 border-0">Khách hàng</Badge>;
  }

  const def = getAdminRoleDef(account.adminRole);
  return (
    <Badge className={`${def?.color || 'bg-emerald-100'} ${def?.textColor || 'text-emerald-700'} border-0 gap-1`}>
      <span className={`h-1.5 w-1.5 rounded-full ${def?.dotColor || 'bg-emerald-500'}`} />
      {def?.label || 'Admin'}
    </Badge>
  );
}

function notificationRecipientLabel(item: AdminNotification) {
  if (item.recipient) return `${item.recipient.name} · ${item.recipient.email}`;
  if (item.recipientType === 'admin') return item.adminId || 'Admin';
  return item.userId || 'Khách hàng';
}

export function AdminNotifications() {
  const { user } = useAuth();

  const [accounts, setAccounts] = useState<AdminUser[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [actionUrl, setActionUrl] = useState('');
  const [type, setType] = useState<AdminNotificationType>('system');
  const [recipientMode, setRecipientMode] = useState<AdminNotificationRecipientMode>('all_users');
  const [selectedRecipientKeys, setSelectedRecipientKeys] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);

  const [recipientSearch, setRecipientSearch] = useState('');
  const [recipientRoleFilter, setRecipientRoleFilter] = useState<'all' | 'customer' | 'admin'>('all');
  const [historySearch, setHistorySearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<AdminNotificationSource>('all');
  const [recipientTypeFilter, setRecipientTypeFilter] = useState<'all' | AdminNotificationAccountType>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | AdminNotificationType>('all');
  const [selectedNotification, setSelectedNotification] = useState<AdminNotification | null>(null);

  const loadAccounts = useCallback(async () => {
    setAccountsLoading(true);
    try {
      const items = await adminUserService.list();
      setAccounts(items.filter((item) => item.status === 'active'));
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không tải được danh sách người nhận'));
    } finally {
      setAccountsLoading(false);
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const data = await adminNotificationService.list({
        page,
        limit: pageSize,
        source: sourceFilter,
        recipientType: recipientTypeFilter,
        type: typeFilter,
        search: historySearch.trim(),
      });
      setNotifications(data.items);
      setUnreadCount(data.unreadCount);
      setTotalItems(data.pagination.totalItems);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không tải được lịch sử thông báo'));
    } finally {
      setHistoryLoading(false);
    }
  }, [historySearch, page, pageSize, recipientTypeFilter, sourceFilter, typeFilter]);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    setPage(1);
  }, [historySearch, pageSize, recipientTypeFilter, sourceFilter, typeFilter]);

  const filteredRecipients = useMemo(() => {
    return accounts
      .filter((account) => {
        if (account.id === user?.id && account.role === 'admin') return false;
        if (recipientRoleFilter !== 'all' && account.role !== recipientRoleFilter) return false;
        return matchesSearchRegex(recipientSearch, [account.name, account.email, account.role, account.adminRole || '']);
      })
      .slice(0, 80);
  }, [accounts, recipientRoleFilter, recipientSearch, user?.id]);

  const selectedRecipients = useMemo(() => {
    return Array.from(selectedRecipientKeys)
      .map(parseRecipientKey)
      .filter((item): item is AdminNotificationRecipientInput => Boolean(item));
  }, [selectedRecipientKeys]);

  const selectVisibleRecipients = () => {
    setSelectedRecipientKeys((current) => {
      const next = new Set(current);
      filteredRecipients.forEach((account) => next.add(recipientKey(account)));
      return next;
    });
  };

  const toggleRecipient = (account: AdminUser, checked: boolean) => {
    const key = recipientKey(account);
    setSelectedRecipientKeys((current) => {
      const next = new Set(current);
      if (checked) next.add(key);
      else next.delete(key);
      return next;
    });
  };

  const resetForm = () => {
    setTitle('');
    setMessage('');
    setActionUrl('');
    setType('system');
    setRecipientMode('all_users');
    setSelectedRecipientKeys(new Set());
  };

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error('Vui lòng nhập tiêu đề và nội dung thông báo');
      return;
    }

    if (recipientMode === 'selected' && selectedRecipients.length === 0) {
      toast.error('Vui lòng chọn ít nhất một người nhận');
      return;
    }

    setSending(true);
    try {
      const result = await adminNotificationService.send({
        title: title.trim(),
        message: message.trim(),
        type,
        actionUrl: actionUrl.trim(),
        recipientMode,
        recipients: recipientMode === 'selected' ? selectedRecipients : [],
      });
      toast.success(`Đã gửi ${result.createdCount} thông báo`);
      resetForm();
      await loadNotifications();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không gửi được thông báo'));
    } finally {
      setSending(false);
    }
  };

  const openNotification = async (item: AdminNotification) => {
    setSelectedNotification(item);
    if (item.recipientType !== 'admin' || item.adminId !== user?.id || item.isRead) return;

    try {
      await adminNotificationService.markRead(item.id);
      setNotifications((current) => current.map((notification) => (
        notification.id === item.id ? { ...notification, isRead: true, readAt: new Date().toISOString() } : notification
      )));
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch {
      // The detail dialog can still be shown even if read-state sync fails.
    }
  };

  const startIndex = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, totalItems);

  return (
    <Layout>
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Thông báo</h1>
            <p className="text-sm text-muted-foreground">Gửi thông báo hệ thống tới khách hàng hoặc admin khác.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-primary/10 text-primary border-0 gap-1.5 px-3 py-1.5">
              <Inbox className="h-3.5 w-3.5" /> {unreadCount} chưa đọc
            </Badge>
            <Button variant="outline" size="sm" onClick={() => void loadNotifications()} disabled={historyLoading}>
              <RefreshCw className="h-4 w-4" /> Làm mới
            </Button>
          </div>
        </div>

        <div className="mb-6 grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(380px,1.05fr)]">
          <Card className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Send className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Soạn thông báo</h2>
                <p className="text-xs text-muted-foreground">Nội dung sẽ xuất hiện trong trang thông báo của người nhận.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Nhóm nhận</Label>
                <Select value={recipientMode} onValueChange={(value: AdminNotificationRecipientMode) => setRecipientMode(value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_users">{MODE_LABELS.all_users}</SelectItem>
                    <SelectItem value="all_admins">{MODE_LABELS.all_admins}</SelectItem>
                    <SelectItem value="selected">{MODE_LABELS.selected}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Loại thông báo</Label>
                <Select value={type} onValueChange={(value: AdminNotificationType) => setType(value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TYPE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Tiêu đề</Label>
                <Input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={160} placeholder="Ví dụ: Cập nhật chính sách sử dụng" />
              </div>

              <div>
                <Label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Nội dung</Label>
                <Textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  maxLength={1000}
                  rows={6}
                  placeholder="Nhập nội dung thông báo..."
                />
                <p className="mt-1 text-right text-xs text-muted-foreground">{message.length}/1000</p>
              </div>

              <div>
                <Label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Đường dẫn hành động</Label>
                <Input value={actionUrl} onChange={(event) => setActionUrl(event.target.value)} maxLength={500} placeholder="/billing hoặc /admin/users" />
              </div>

              <Button onClick={handleSend} disabled={sending} className="w-full gap-2">
                {sending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Gửi thông báo
              </Button>
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">Người nhận thủ công</h2>
                  <p className="text-xs text-muted-foreground">Đã chọn {selectedRecipients.length} tài khoản.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectVisibleRecipients} disabled={recipientMode !== 'selected'}>
                  <Check className="h-4 w-4" /> Chọn kết quả
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedRecipientKeys(new Set())} disabled={selectedRecipientKeys.size === 0}>
                  Bỏ chọn
                </Button>
              </div>
            </div>

            <div className="mb-3 grid gap-2 md:grid-cols-[minmax(0,1fr)_160px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9" value={recipientSearch} onChange={(event) => setRecipientSearch(event.target.value)} placeholder="Tìm tên hoặc email..." />
              </div>
              <Select value={recipientRoleFilter} onValueChange={(value: 'all' | 'customer' | 'admin') => setRecipientRoleFilter(value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả vai trò</SelectItem>
                  <SelectItem value="customer">Khách hàng</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="max-h-[442px] overflow-y-auto rounded-lg border">
              {accountsLoading ? (
                <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">Đang tải người nhận...</div>
              ) : filteredRecipients.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-9 w-9 opacity-40" />
                  Không tìm thấy người nhận phù hợp
                </div>
              ) : (
                <div className="divide-y">
                  {filteredRecipients.map((account) => {
                    const key = recipientKey(account);
                    const checked = selectedRecipientKeys.has(key);
                    return (
                      <label key={key} className="flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-muted/50">
                        <Checkbox
                          checked={checked}
                          disabled={recipientMode !== 'selected'}
                          onCheckedChange={(value) => toggleRecipient(account, value === true)}
                        />
                        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white ${account.role === 'admin' ? 'bg-emerald-700' : 'bg-green-600'}`}>
                          {account.role === 'admin' ? <Shield className="h-4 w-4" /> : account.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">{account.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{account.email}</p>
                        </div>
                        <div className="hidden sm:block">{roleBadge(account)}</div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        </div>

        <AdminFilterBar
          search={historySearch}
          onSearchChange={setHistorySearch}
          searchPlaceholder="Tìm theo tiêu đề, nội dung, đường dẫn..."
          rightSlot={
            <div className="flex flex-wrap gap-2">
              <Select value={sourceFilter} onValueChange={(value: AdminNotificationSource) => setSourceFilter(value)}>
                <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả thông báo</SelectItem>
                  <SelectItem value="sent_by_me">Tôi đã gửi</SelectItem>
                  <SelectItem value="received_by_me">Tôi nhận được</SelectItem>
                </SelectContent>
              </Select>
              <Select value={recipientTypeFilter} onValueChange={(value: 'all' | AdminNotificationAccountType) => setRecipientTypeFilter(value)}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Mọi người nhận</SelectItem>
                  <SelectItem value="user">Khách hàng</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={(value: 'all' | AdminNotificationType) => setTypeFilter(value)}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Mọi loại</SelectItem>
                  {Object.entries(TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          }
          className="mb-4"
        />

        <AdminTable
          empty={!historyLoading && notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
              <Bell className="h-10 w-10 opacity-40" />
              Không có thông báo phù hợp
            </div>
          ) : undefined}
        >
          <TableHeader>
            <TableRow>
              <TableHead>Thông báo</TableHead>
              <TableHead>Người nhận</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Người gửi</TableHead>
              <TableHead>Thời gian</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {historyLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-sm text-muted-foreground">Đang tải thông báo...</TableCell>
              </TableRow>
            ) : notifications.map((item) => (
              <TableRow key={item.id} className="cursor-pointer" onClick={() => void openNotification(item)}>
                <TableCell>
                  <div className="max-w-md">
                    <p className="truncate text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="line-clamp-1 text-xs text-muted-foreground">{item.message}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="max-w-[240px] truncate text-sm text-foreground">{notificationRecipientLabel(item)}</p>
                    <Badge className="bg-muted text-foreground/70 border-0">
                      {item.recipientType === 'admin' ? 'Admin' : 'Khách hàng'}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell><Badge className={TYPE_CLASSES[item.type]}>{TYPE_LABELS[item.type]}</Badge></TableCell>
                <TableCell>
                  {item.isRead ? (
                    <Badge className="bg-muted text-foreground/70 border-0">Đã đọc</Badge>
                  ) : (
                    <Badge className="bg-destructive/10 text-destructive border-0">Chưa đọc</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">{item.sender?.email || 'Hệ thống'}</span>
                </TableCell>
                <TableCell><span className="text-sm text-muted-foreground">{formatDate(item.createdAt)}</span></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </AdminTable>

        <DataPagination
          page={page}
          pageSize={pageSize}
          totalItems={totalItems}
          totalPages={totalPages}
          startIndex={startIndex}
          endIndex={endIndex}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          itemLabel="thông báo"
        />

        <Dialog open={Boolean(selectedNotification)} onOpenChange={(open) => { if (!open) setSelectedNotification(null); }}>
          <DialogContent className="max-w-xl">
            {selectedNotification && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedNotification.title}</DialogTitle>
                  <DialogDescription>
                    {TYPE_LABELS[selectedNotification.type]} · {formatDate(selectedNotification.createdAt)}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="whitespace-pre-wrap break-words text-sm leading-6 text-foreground">{selectedNotification.message}</p>
                  <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
                    Người nhận: {notificationRecipientLabel(selectedNotification)}
                    <br />
                    Người gửi: {selectedNotification.sender?.email || 'Hệ thống'}
                    {selectedNotification.actionUrl ? <><br />Đường dẫn: {selectedNotification.actionUrl}</> : null}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSelectedNotification(null)}>Đóng</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
