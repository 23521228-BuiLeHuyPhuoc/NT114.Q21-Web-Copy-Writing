import { useState } from 'react';
import { Layout } from '@/app/components/Layout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import {
  FileText, Eye, Trash2, Flag, Calendar, Users, AlertCircle, Edit2, EyeOff,
} from 'lucide-react';
import { ConfirmDialog } from '@/app/components/admin/ConfirmDialog';
import { TrashBin } from '@/app/components/admin/TrashBin';
import { StatTile } from '@/app/components/admin/StatTile';
import { AdminFilterBar } from '@/app/components/admin/AdminFilterBar';
import { AdminTable } from '@/app/components/admin/AdminTable';
import { DataPagination } from '@/app/components/common/DataPagination';
import { usePagination } from '@/hooks/usePagination';
import toast from 'react-hot-toast';

const INITIAL_CONTENTS = [
  { id: 1, title: 'Facebook Ad – Flash Sale Hè', user: 'Nguyễn Văn A', email: 'customer@copypro.vn', type: 'headline', model: 'GPT-4o', quality: 92, words: 45, date: '23/03/2026', status: 'active', flagged: false, body: 'Đừng bỏ lỡ Flash Sale Hè! Giảm đến 70% tất cả sản phẩm chỉ trong 24 giờ. Mua ngay – nhận quà tặng kèm hấp dẫn!' },
  { id: 2, title: 'Landing Page – BĐS The Grand', user: 'Trần Thị B', email: 'tranb@email.com', type: 'landing', model: 'Llama 3.1', quality: 95, words: 320, date: '23/03/2026', status: 'active', flagged: false, body: 'The Grand – Biểu tượng sống đẳng cấp tại trung tâm TP.HCM. Căn hộ cao cấp từ 3.5 tỷ. Vị trí vàng, tiện ích 5 sao.' },
  { id: 3, title: 'Email Marketing – SaaS Launch', user: 'Lê Văn C', email: 'lec@email.com', type: 'email', model: 'Fine-tuned', quality: 91, words: 180, date: '22/03/2026', status: 'active', flagged: true, body: 'Chúng tôi vui mừng giới thiệu CopyPro AI 2.0 – nền tảng copywriting AI mạnh mẽ nhất cho doanh nghiệp Việt.' },
  { id: 4, title: 'Social Post – Khai Trương', user: 'Nguyễn Văn A', email: 'customer@copypro.vn', type: 'social', model: 'GPT-4o', quality: 87, words: 120, date: '21/03/2026', status: 'hidden', flagged: true, body: 'Grand Opening! Nhà hàng Hương Vị Việt chính thức khai trương. Tặng voucher 200k cho 100 khách đầu tiên.' },
  { id: 5, title: 'Mô Tả SP – Thời Trang', user: 'Phạm Đức D', email: 'phamd@email.com', type: 'description', model: 'GPT-4o', quality: 88, words: 95, date: '20/03/2026', status: 'active', flagged: false, body: 'Váy maxi hoa nhí – thiết kế thanh lịch, chất liệu lụa cao cấp. Phù hợp dạo phố, tiệc nhẹ và du lịch.' },
];

type ContentItem = typeof INITIAL_CONTENTS[0];
interface DeletedContent { id: number; title: string; user: string; deletedAt: string; }

export function AdminContents() {
  const [contents, setContents] = useState<ContentItem[]>(INITIAL_CONTENTS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // View
  const [viewItem, setViewItem] = useState<ContentItem | null>(null);

  // Edit
  const [editItem, setEditItem] = useState<ContentItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editFlagged, setEditFlagged] = useState(false);
  const [editSaving, setEditSaving] = useState(false);

  // Soft delete
  const [deletedContents, setDeletedContents] = useState<DeletedContent[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<ContentItem | null>(null);
  const [trashOpen, setTrashOpen] = useState(false);
  const [trashLoading, setTrashLoading] = useState<string | null>(null);

  const visible = contents.filter(c => !deletedContents.find(d => d.id === c.id));
  const filtered = visible.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.user.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchSearch && matchStatus;
  });
  const pagination = usePagination(filtered, {
    initialPageSize: 10,
    resetKey: `${search}|${filterStatus}`,
  });

  const openEdit = (item: ContentItem) => {
    setEditItem(item); setEditTitle(item.title); setEditBody(item.body);
    setEditStatus(item.status); setEditFlagged(item.flagged);
  };

  const handleSaveEdit = async () => {
    setEditSaving(true); await new Promise(r => setTimeout(r, 700));
    setContents(prev => prev.map(c => c.id === editItem!.id ? { ...c, title: editTitle, body: editBody, status: editStatus, flagged: editFlagged } : c));
    setEditSaving(false); setEditItem(null);
    toast.success('Đã cập nhật nội dung');
  };

  const handleSoftDelete = async () => {
    if (!confirmDelete) return;
    await new Promise(r => setTimeout(r, 400));
    setDeletedContents(prev => [...prev, { id: confirmDelete.id, title: confirmDelete.title, user: confirmDelete.user, deletedAt: new Date().toLocaleString('vi-VN') }]);
    setConfirmDelete(null);
    toast.success('Đã chuyển vào thùng rác');
  };

  const handleRestore = async (id: string | number) => {
    setTrashLoading(String(id)); await new Promise(r => setTimeout(r, 500));
    setDeletedContents(prev => prev.filter(c => c.id !== Number(id)));
    setTrashLoading(null); toast.success('Đã khôi phục nội dung');
  };

  const handlePermanentDelete = async (id: string | number) => {
    setTrashLoading(String(id)); await new Promise(r => setTimeout(r, 500));
    setDeletedContents(prev => prev.filter(c => c.id !== Number(id)));
    setContents(prev => prev.filter(c => c.id !== Number(id)));
    setTrashLoading(null); toast.error('Đã xoá vĩnh viễn nội dung');
  };

  const typeBadgeColor: Record<string, string> = {
    headline: 'bg-primary/10 text-primary', landing: 'bg-primary/10 text-primary',
    email: 'bg-warning/15 text-amber-800', social: 'bg-warning/15 text-amber-800',
    description: 'bg-primary/10 text-primary',
  };

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Quản Lý Nội Dung</h1>
            <p className="text-muted-foreground text-sm">Quản lý tất cả nội dung do người dùng tạo</p>
          </div>
          <button
            onClick={() => setTrashOpen(true)}
            className="relative flex items-center gap-1.5 border border-border hover:border-red-300 hover:bg-destructive/10 text-muted-foreground hover:text-red-600 rounded-xl px-3 py-2 text-sm font-semibold transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Thùng rác
            {deletedContents.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive/100 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{deletedContents.length}</span>
            )}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Tổng nội dung', value: visible.length.toString(), icon: FileText, color: 'text-primary bg-primary/5' },
            { label: 'Hôm nay', value: '124', icon: Calendar, color: 'text-primary bg-primary/5' },
            { label: 'Đã flag', value: visible.filter(c => c.flagged).length.toString(), icon: Flag, color: 'text-red-600 bg-destructive/10' },
            { label: 'Người dùng hoạt động', value: '342', icon: Users, color: 'text-primary bg-primary/5' },
          ].map((s, i) => (
            <StatTile key={i} icon={s.icon} label={s.label} value={s.value} color={s.color} />
          ))}
        </div>

        {/* Filters */}
        <AdminFilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Tìm nội dung hoặc user..."
          rightSlot={
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="active">Hoạt động</SelectItem>
                <SelectItem value="hidden">Ẩn</SelectItem>
              </SelectContent>
            </Select>
          }
        />

        {/* Table */}
        <AdminTable
          empty={filtered.length === 0 ? <div className="text-center py-12 text-muted-foreground/80 text-sm">Không tìm thấy nội dung nào.</div> : undefined}
        >
            <TableHeader>
              <TableRow>
                <TableHead>Nội dung</TableHead>
                <TableHead>Người tạo</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Chất lượng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagination.pageItems.map(item => (
                <TableRow key={item.id} className={item.flagged ? 'bg-destructive/10' : ''}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {item.flagged && <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                      <span className="font-medium text-sm truncate max-w-44">{item.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{item.user}</p>
                      <p className="text-xs text-muted-foreground">{item.email}</p>
                    </div>
                  </TableCell>
                  <TableCell><Badge className={`border-0 text-xs ${typeBadgeColor[item.type] || 'bg-muted text-foreground/70'}`}>{item.type}</Badge></TableCell>
                  <TableCell><Badge className="bg-primary/10 text-primary border-0 text-xs">{item.model}</Badge></TableCell>
                  <TableCell><span className="text-sm font-semibold text-primary">{item.quality}%</span></TableCell>
                  <TableCell>
                    <Badge className={`border-0 text-xs ${item.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                      {item.status === 'active' ? 'Hoạt động' : 'Ẩn'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{item.date}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => setViewItem(item)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground/80 hover:text-foreground/80 transition-colors" title="Xem">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => openEdit(item)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary/5 text-muted-foreground/80 hover:text-primary transition-colors" title="Chỉnh sửa">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setConfirmDelete(item)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-destructive/10 text-muted-foreground/80 hover:text-red-500 transition-colors" title="Xoá">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
        </AdminTable>
        <DataPagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          totalItems={pagination.totalItems}
          totalPages={pagination.totalPages}
          startIndex={pagination.startIndex}
          endIndex={pagination.endIndex}
          onPageChange={pagination.setPage}
          onPageSizeChange={pagination.setPageSize}
          itemLabel="nội dung"
        />
      </div>

      {/* ── VIEW DIALOG ── */}
      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-muted-foreground" /> Xem nội dung
            </DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground/80 uppercase tracking-wider mb-1">Tiêu đề</p>
                <p className="font-semibold text-foreground">{viewItem.title}</p>
              </div>
              <div className="flex gap-2">
                <Badge className={`border-0 text-xs ${typeBadgeColor[viewItem.type] || 'bg-muted text-foreground/70'}`}>{viewItem.type}</Badge>
                <Badge className="bg-primary/10 text-primary border-0 text-xs">{viewItem.model}</Badge>
                <Badge className={`border-0 text-xs ${viewItem.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>{viewItem.status === 'active' ? 'Hoạt động' : 'Ẩn'}</Badge>
                {viewItem.flagged && <Badge className="bg-destructive/10 text-red-600 border-0 text-xs">Đã flag</Badge>}
              </div>
              <div className="bg-surface-muted rounded-xl p-4">
                <p className="text-sm text-foreground/80 leading-relaxed">{viewItem.body}</p>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Tạo bởi: <span className="font-medium text-foreground/80">{viewItem.user}</span></span>
                <span>{viewItem.words} từ · {viewItem.quality}% chất lượng · {viewItem.date}</span>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => { setViewItem(null); openEdit(viewItem); }} className="flex-1 h-9 border border-primary/20 text-primary hover:bg-primary/5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-1.5">
                  <Edit2 className="w-3.5 h-3.5" /> Chỉnh sửa
                </button>
                <button onClick={() => setViewItem(null)} className="flex-1 h-9 bg-muted hover:bg-gray-200 text-foreground/80 rounded-xl text-sm font-semibold transition-colors">Đóng</button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── EDIT DIALOG ── */}
      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Edit2 className="w-4 h-4 text-primary" />
              </div>
              Chỉnh sửa nội dung
            </DialogTitle>
          </DialogHeader>
          {editItem && (
            <div className="space-y-4 pt-1">
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Tiêu đề</Label>
                <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="h-10" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Nội dung</Label>
                <Textarea value={editBody} onChange={e => setEditBody(e.target.value)} rows={4} className="resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Trạng thái</Label>
                  <Select value={editStatus} onValueChange={setEditStatus}>
                    <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">✅ Hoạt động</SelectItem>
                      <SelectItem value="hidden">🚫 Ẩn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Flag vi phạm</Label>
                  <Select value={editFlagged ? 'true' : 'false'} onValueChange={v => setEditFlagged(v === 'true')}>
                    <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">Bình thường</SelectItem>
                      <SelectItem value="true">⚠️ Đã flag</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setEditItem(null)} className="flex-1 h-10 border border-border rounded-xl text-sm font-semibold text-foreground/70 hover:bg-surface-muted transition-colors">Huỷ</button>
                <button onClick={handleSaveEdit} disabled={editSaving} className="flex-1 h-10 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
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
        title={`Xoá nội dung "${confirmDelete?.title}"?`}
        description="Nội dung sẽ vào thùng rác và có thể khôi phục trong 30 ngày."
        confirmLabel="Chuyển vào thùng rác"
      />

      {/* ── TRASH BIN ── */}
      <TrashBin
        open={trashOpen}
        onClose={() => setTrashOpen(false)}
        items={deletedContents.map(c => ({ id: c.id, label: c.title, subLabel: c.user, deletedAt: c.deletedAt }))}
        onRestore={handleRestore}
        onPermanentDelete={handlePermanentDelete}
        entityName="nội dung"
        loading={trashLoading}
      />
    </Layout>
  );
}
