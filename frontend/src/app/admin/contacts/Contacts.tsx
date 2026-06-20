'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  Archive,
  CheckCircle2,
  Clock,
  Eye,
  Inbox,
  Mail,
  MessageSquare,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { Layout } from '@/app/components/Layout';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Textarea } from '@/app/components/ui/textarea';
import { AdminFilterBar } from '@/app/components/admin/AdminFilterBar';
import { AdminTable } from '@/app/components/admin/AdminTable';
import { ConfirmDialog } from '@/app/components/admin/ConfirmDialog';
import { StatTile } from '@/app/components/admin/StatTile';
import { DataPagination } from '@/app/components/common/DataPagination';
import {
  contactSubmissionService,
  type ContactStatus,
  type ContactSubmission,
  type ContactSubmissionStats,
  type ContactTopic,
} from '@/services/contactSubmissionService';

const STATUS_META: Record<ContactStatus, { label: string; badge: string; icon: LucideIcon; statColor: string }> = {
  new: { label: 'Mới', badge: 'bg-sky-100 text-sky-700 border-0', icon: Inbox, statColor: 'text-sky-700 bg-sky-50' },
  in_progress: { label: 'Đang xử lý', badge: 'bg-amber-100 text-amber-700 border-0', icon: Clock, statColor: 'text-amber-700 bg-amber-50' },
  resolved: { label: 'Đã xử lý', badge: 'bg-emerald-100 text-emerald-700 border-0', icon: CheckCircle2, statColor: 'text-emerald-700 bg-emerald-50' },
  spam: { label: 'Spam', badge: 'bg-red-100 text-red-700 border-0', icon: AlertTriangle, statColor: 'text-red-700 bg-red-50' },
  archived: { label: 'Lưu trữ', badge: 'bg-slate-100 text-slate-700 border-0', icon: Archive, statColor: 'text-slate-700 bg-slate-50' },
};

const TOPIC_LABELS: Record<ContactTopic, string> = {
  product: 'Tư vấn sản phẩm',
  support: 'Hỗ trợ kỹ thuật',
  partner: 'Đối tác',
  business: 'Business',
  billing: 'Thanh toán',
  other: 'Khác',
};

const INITIAL_STATS: ContactSubmissionStats = {
  total: 0,
  new: 0,
  inProgress: 0,
  resolved: 0,
  spam: 0,
  archived: 0,
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

function statusBadge(status: ContactStatus) {
  const meta = STATUS_META[status] || STATUS_META.new;
  return <Badge className={meta.badge}>{meta.label}</Badge>;
}

export function AdminContacts() {
  const [items, setItems] = useState<ContactSubmission[]>([]);
  const [stats, setStats] = useState<ContactSubmissionStats>(INITIAL_STATS);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContactStatus | 'all'>('all');
  const [topicFilter, setTopicFilter] = useState<ContactTopic | 'all'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [selected, setSelected] = useState<ContactSubmission | null>(null);
  const [draftStatus, setDraftStatus] = useState<ContactStatus>('new');
  const [draftNote, setDraftNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ContactSubmission | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await contactSubmissionService.listAdmin({
        page,
        limit: pageSize,
        status: statusFilter,
        topic: topicFilter,
        search: search.trim(),
        dateFrom,
        dateTo,
      });
      setItems(data.items);
      setStats(data.stats);
      setTotalItems(data.pagination.totalItems);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không tải được danh sách liên hệ'));
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, page, pageSize, search, statusFilter, topicFilter]);

  useEffect(() => {
    void loadSubmissions();
  }, [loadSubmissions]);

  useEffect(() => {
    setPage(1);
  }, [dateFrom, dateTo, pageSize, search, statusFilter, topicFilter]);

  const statCards = useMemo(() => ([
    { label: 'Tổng liên hệ', value: stats.total, icon: Mail, color: 'text-primary bg-primary/5' },
    { label: STATUS_META.new.label, value: stats.new, icon: STATUS_META.new.icon, color: STATUS_META.new.statColor },
    { label: STATUS_META.in_progress.label, value: stats.inProgress, icon: STATUS_META.in_progress.icon, color: STATUS_META.in_progress.statColor },
    { label: STATUS_META.resolved.label, value: stats.resolved, icon: STATUS_META.resolved.icon, color: STATUS_META.resolved.statColor },
    { label: STATUS_META.spam.label, value: stats.spam + stats.archived, icon: Archive, color: 'text-slate-700 bg-slate-50' },
  ]), [stats]);

  const startIndex = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, totalItems);
  const hasActiveFilters = Boolean(search || dateFrom || dateTo || statusFilter !== 'all' || topicFilter !== 'all');

  const openDetail = (item: ContactSubmission) => {
    setSelected(item);
    setDraftStatus(item.status);
    setDraftNote(item.adminNote || '');
  };

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setTopicFilter('all');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const handleSave = async () => {
    if (!selected) return;

    setSaving(true);
    try {
      const updated = await contactSubmissionService.updateAdmin(selected.id, {
        status: draftStatus,
        adminNote: draftNote.trim(),
      });
      setSelected(updated);
      setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      toast.success('Đã cập nhật liên hệ');
      await loadSubmissions();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không cập nhật được liên hệ'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await contactSubmissionService.deleteAdmin(deleteTarget.id);
      toast.success('Đã xóa liên hệ');
      if (selected?.id === deleteTarget.id) setSelected(null);
      setDeleteTarget(null);
      await loadSubmissions();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không xóa được liên hệ'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Quản lý liên hệ</h1>
            <p className="text-sm text-muted-foreground">Theo dõi tin nhắn gửi từ trang contact và ghi nhận trạng thái xử lý.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => void loadSubmissions()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">
          {statCards.map((item) => (
            <StatTile key={item.label} icon={item.icon} label={item.label} value={item.value.toLocaleString('vi-VN')} color={item.color} />
          ))}
        </div>

        <AdminFilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Tìm tên, email, công ty, nội dung..."
          rightSlot={
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ContactStatus | 'all')}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Mọi trạng thái</SelectItem>
                  {Object.entries(STATUS_META).map(([key, meta]) => (
                    <SelectItem key={key} value={key}>{meta.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={topicFilter} onValueChange={(value) => setTopicFilter(value as ContactTopic | 'all')}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Mọi chủ đề</SelectItem>
                  {Object.entries(TOPIC_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="w-40" />
              <Input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className="w-40" />
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={resetFilters}>Xóa lọc</Button>
              )}
            </div>
          }
        />

        <AdminTable
          empty={!loading && items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
              <MessageSquare className="h-10 w-10 opacity-40" />
              Không có liên hệ phù hợp
            </div>
          ) : undefined}
        >
          <TableHeader>
            <TableRow>
              <TableHead>Người gửi</TableHead>
              <TableHead>Chủ đề</TableHead>
              <TableHead>Nội dung</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-sm text-muted-foreground">Đang tải liên hệ...</TableCell>
              </TableRow>
            ) : items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex min-w-[220px] items-center gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                      {item.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{item.email}</p>
                      {item.company ? <p className="truncate text-xs text-muted-foreground">{item.company}</p> : null}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className="bg-primary/10 text-primary border-0">{TOPIC_LABELS[item.topic]}</Badge>
                </TableCell>
                <TableCell className="max-w-[360px] whitespace-normal">
                  <p className="line-clamp-2 text-sm text-foreground/80">{item.message}</p>
                </TableCell>
                <TableCell>{statusBadge(item.status)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatDate(item.createdAt)}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openDetail(item)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(item)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
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
          itemLabel="liên hệ"
        />

        <Dialog open={Boolean(selected)} onOpenChange={(open) => { if (!open) setSelected(null); }}>
          <DialogContent className="max-w-2xl">
            {selected && (
              <>
                <DialogHeader>
                  <DialogTitle>{selected.name}</DialogTitle>
                  <DialogDescription>
                    {selected.email} | {TOPIC_LABELS[selected.topic]} | {formatDate(selected.createdAt)}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="grid gap-3 rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground md:grid-cols-2">
                    <div><span className="font-medium text-foreground">Email:</span> {selected.email}</div>
                    <div><span className="font-medium text-foreground">Công ty:</span> {selected.company || '-'}</div>
                    <div><span className="font-medium text-foreground">IP:</span> {selected.ip || '-'}</div>
                    <div><span className="font-medium text-foreground">Xử lý bởi:</span> {selected.handledBy?.email || '-'}</div>
                  </div>

                  <div>
                    <Label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Nội dung khách gửi</Label>
                    <div className="max-h-56 overflow-y-auto whitespace-pre-wrap rounded-lg border bg-card p-3 text-sm leading-6 text-foreground">
                      {selected.message}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
                    <div>
                      <Label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Trạng thái</Label>
                      <Select value={draftStatus} onValueChange={(value) => setDraftStatus(value as ContactStatus)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(STATUS_META).map(([key, meta]) => (
                            <SelectItem key={key} value={key}>{meta.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Ghi chú admin</Label>
                      <Textarea
                        value={draftNote}
                        onChange={(event) => setDraftNote(event.target.value)}
                        maxLength={2000}
                        rows={5}
                        placeholder="Ghi chú nội bộ về cách xử lý yêu cầu này..."
                      />
                      <p className="mt-1 text-right text-xs text-muted-foreground">{draftNote.length}/2000</p>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setSelected(null)}>Đóng</Button>
                  <Button onClick={() => void handleSave()} disabled={saving}>
                    {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Lưu xử lý
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        <ConfirmDialog
          open={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => void handleDelete()}
          title="Xóa liên hệ này?"
          description={deleteTarget ? `Tin nhắn từ ${deleteTarget.email} sẽ bị xóa khỏi hệ thống.` : undefined}
          confirmLabel="Xóa"
          loading={deleting}
        />
      </div>
    </Layout>
  );
}
