import { useCallback, useEffect, useMemo, useState } from 'react';
import { Layout } from '@/app/components/Layout';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Calendar, Edit2, Eye, FileText, Star, Trash2, Users } from 'lucide-react';
import { ConfirmDialog } from '@/app/components/admin/ConfirmDialog';
import { TrashBin } from '@/app/components/admin/TrashBin';
import { StatTile } from '@/app/components/admin/StatTile';
import { AdminFilterBar } from '@/app/components/admin/AdminFilterBar';
import { AdminTable } from '@/app/components/admin/AdminTable';
import { DataPagination } from '@/app/components/common/DataPagination';
import { usePagination } from '@/hooks/usePagination';
import { adminContentService, type AdminContentItem } from '@/services/adminContentService';
import { matchesSearchRegex } from '@/lib/searchRegex';
import toast from 'react-hot-toast';

type ContentItem = AdminContentItem;

function getErrorMessage(error: unknown, fallback: string) {
  const err = error as { response?: { data?: { message?: string } }; message?: string };
  return err.response?.data?.message || err.message || fallback;
}

function isToday(value?: string) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  return date.getFullYear() === now.getFullYear()
    && date.getMonth() === now.getMonth()
    && date.getDate() === now.getDate();
}

function formatDeletedAt(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('vi-VN');
}

function splitTags(value: string) {
  return value
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean);
}

export function AdminContents() {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [trashContents, setTrashContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterModel, setFilterModel] = useState('all');
  const [filterFavorite, setFilterFavorite] = useState('all');
  const [sortContent, setSortContent] = useState('created-desc');

  const [viewItem, setViewItem] = useState<ContentItem | null>(null);
  const [editItem, setEditItem] = useState<ContentItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editType, setEditType] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editFavorite, setEditFavorite] = useState(false);
  const [editSaving, setEditSaving] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<ContentItem | null>(null);
  const [trashOpen, setTrashOpen] = useState(false);
  const [trashLoading, setTrashLoading] = useState<string | null>(null);

  const loadContents = useCallback(async () => {
    setLoading(true);
    try {
      const [activeItems, deletedItems] = await Promise.all([
        adminContentService.list(),
        adminContentService.listTrash(),
      ]);
      setContents(activeItems);
      setTrashContents(deletedItems);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không tải được danh sách nội dung'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadContents();
  }, [loadContents]);

  const contentTypes = useMemo(() => {
    return Array.from(new Set(contents.map(item => item.type).filter(Boolean))).sort();
  }, [contents]);

  const contentModels = useMemo(() => {
    return Array.from(new Set(contents.map(item => item.model).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'vi'));
  }, [contents]);

  const filtered = useMemo(() => {
    const filteredItems = contents.filter(item => {
      const matchSearch = matchesSearchRegex(search, [
        item.title,
        item.user,
        item.email,
        item.type,
        item.model,
        item.body,
        item.tags.join(' '),
      ]);
      const matchType = filterType === 'all' || item.type === filterType;
      const matchModel = filterModel === 'all' || item.model === filterModel;
      const matchFavorite = filterFavorite === 'all'
        || (filterFavorite === 'favorite' && item.isFavorite)
        || (filterFavorite === 'normal' && !item.isFavorite);
      return matchSearch && matchType && matchModel && matchFavorite;
    });

    return [...filteredItems].sort((a, b) => {
      switch (sortContent) {
        case 'created-asc':
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case 'words-desc':
          return b.words - a.words;
        case 'words-asc':
          return a.words - b.words;
        case 'title-asc':
          return a.title.localeCompare(b.title, 'vi');
        case 'title-desc':
          return b.title.localeCompare(a.title, 'vi');
        case 'created-desc':
        default:
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });
  }, [contents, filterFavorite, filterModel, filterType, search, sortContent]);

  const pagination = usePagination(filtered, {
    initialPageSize: 10,
    resetKey: `${search}|${filterType}|${filterModel}|${filterFavorite}|${sortContent}`,
  });

  const activeUsers = useMemo(() => new Set(contents.map(item => item.email).filter(email => email !== '-')).size, [contents]);

  const openEdit = (item: ContentItem) => {
    setEditItem(item);
    setEditTitle(item.title);
    setEditType(item.type);
    setEditTags(item.tags.join(', '));
    setEditFavorite(item.isFavorite);
  };

  const handleSaveEdit = async () => {
    if (!editItem) return;
    const title = editTitle.trim();
    const type = editType.trim();
    const tags = Array.from(new Set(splitTags(editTags)));

    if (!title || !type) {
      toast.error('Tiêu đề và loại nội dung không được để trống');
      return;
    }

    if (tags.length > 10) {
      toast.error('Tối đa 10 tag cho mỗi nội dung');
      return;
    }

    if (tags.some(tag => tag.length > 40)) {
      toast.error('Mỗi tag tối đa 40 ký tự');
      return;
    }

    setEditSaving(true);
    try {
      await adminContentService.update(editItem.id, {
        title,
        type,
        tags,
        isFavorite: editFavorite,
      });
      await loadContents();
      setEditItem(null);
      toast.success('Đã cập nhật nội dung');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không cập nhật được nội dung'));
    } finally {
      setEditSaving(false);
    }
  };

  const handleSoftDelete = async () => {
    if (!confirmDelete) return;
    try {
      await adminContentService.remove(confirmDelete.id);
      await loadContents();
      toast.success('Đã chuyển nội dung vào thùng rác');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không xóa được nội dung'));
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleRestore = async (id: string | number) => {
    setTrashLoading(String(id));
    try {
      await adminContentService.restore(String(id));
      await loadContents();
      toast.success('Đã khôi phục nội dung');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không khôi phục được nội dung'));
    } finally {
      setTrashLoading(null);
    }
  };

  const handlePermanentDelete = async (id: string | number) => {
    setTrashLoading(String(id));
    try {
      await adminContentService.permanentDelete(String(id));
      await loadContents();
      toast.success('Đã xóa vĩnh viễn nội dung');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không xóa vĩnh viễn được nội dung'));
    } finally {
      setTrashLoading(null);
    }
  };

  const handlePermanentDeleteAll = async (ids: Array<string | number>) => {
    const contentIds = ids.map(String).filter(Boolean);
    if (contentIds.length === 0) return;

    try {
      await adminContentService.permanentDeleteMany(contentIds);
      toast.success(`Đã xóa vĩnh viễn ${contentIds.length} nội dung`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không xóa tất cả nội dung được'));
    } finally {
      await loadContents();
    }
  };

  const typeBadgeColor: Record<string, string> = {
    headline: 'bg-primary/10 text-primary',
    landing: 'bg-primary/10 text-primary',
    email: 'bg-warning/15 text-amber-800',
    social: 'bg-warning/15 text-amber-800',
    description: 'bg-primary/10 text-primary',
    seo: 'bg-teal-100 text-teal-700',
    review: 'bg-emerald-100 text-emerald-700',
    cta: 'bg-amber-100 text-amber-700',
  };

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Quản lý nội dung</h1>
            <p className="text-muted-foreground text-sm">Danh sách nội dung thật từ collection Content.</p>
          </div>
          <button
            onClick={() => setTrashOpen(true)}
            className="relative flex items-center gap-1.5 border border-border hover:border-red-300 hover:bg-destructive/10 text-muted-foreground hover:text-red-600 rounded-xl px-3 py-2 text-sm font-semibold transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Thùng rác
            {trashContents.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive/100 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {trashContents.length}
              </span>
            )}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatTile icon={FileText} label="Tổng nội dung" value={contents.length.toLocaleString('vi-VN')} color="text-primary bg-primary/5" />
          <StatTile icon={Calendar} label="Hôm nay" value={contents.filter(item => isToday(item.createdAt)).length.toLocaleString('vi-VN')} color="text-primary bg-primary/5" />
          <StatTile icon={Star} label="Đã đánh dấu" value={contents.filter(item => item.isFavorite).length.toLocaleString('vi-VN')} color="text-amber-700 bg-amber-100" />
          <StatTile icon={Users} label="Người tạo" value={activeUsers.toLocaleString('vi-VN')} color="text-primary bg-primary/5" />
        </div>

        <AdminFilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Tìm nội dung, user, model..."
          rightSlot={
            <div className="flex flex-wrap gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả loại</SelectItem>
                  {contentTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterModel} onValueChange={setFilterModel}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả model</SelectItem>
                  {contentModels.map(model => (
                    <SelectItem key={model} value={model}>{model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterFavorite} onValueChange={setFilterFavorite}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả đánh dấu</SelectItem>
                  <SelectItem value="favorite">Đã đánh dấu</SelectItem>
                  <SelectItem value="normal">Bình thường</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortContent} onValueChange={setSortContent}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="created-desc">Mới nhất</SelectItem>
                  <SelectItem value="created-asc">Cũ nhất</SelectItem>
                  <SelectItem value="words-desc">Nhiều từ nhất</SelectItem>
                  <SelectItem value="words-asc">Ít từ nhất</SelectItem>
                  <SelectItem value="title-asc">Tiêu đề A-Z</SelectItem>
                  <SelectItem value="title-desc">Tiêu đề Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          }
        />

        {loading ? (
          <Card className="p-16 text-center text-sm text-muted-foreground">Đang tải dữ liệu MongoDB...</Card>
        ) : (
          <>
            <AdminTable
              empty={filtered.length === 0 ? <div className="text-center py-12 text-muted-foreground/80 text-sm">Không tìm thấy nội dung nào.</div> : undefined}
            >
              <TableHeader>
                <TableRow>
                  <TableHead>Nội dung</TableHead>
                  <TableHead>Người tạo</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Số từ</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagination.pageItems.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2 min-w-0">
                        {item.isFavorite && <Star className="w-4 h-4 text-amber-500 flex-shrink-0" />}
                        <span className="font-medium text-sm truncate max-w-52">{item.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{item.user}</p>
                        <p className="text-xs text-muted-foreground">{item.email}</p>
                      </div>
                    </TableCell>
                    <TableCell><Badge className={`border-0 text-xs ${typeBadgeColor[item.type] || 'bg-muted text-foreground/70'}`}>{item.type}</Badge></TableCell>
                    <TableCell><Badge className="max-w-72 whitespace-normal bg-primary/10 text-left text-primary border-0 text-xs leading-tight" title={item.model}>{item.model}</Badge></TableCell>
                    <TableCell><span className="text-sm font-semibold text-primary">{item.words.toLocaleString('vi-VN')}</span></TableCell>
                    <TableCell>
                      <Badge className="border-0 text-xs bg-primary/10 text-primary">Hoạt động</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{item.date}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => setViewItem(item)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground/80 hover:text-foreground/80 transition-colors" title="Xem">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => openEdit(item)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary/5 text-muted-foreground/80 hover:text-primary transition-colors" title="Chỉnh sửa">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setConfirmDelete(item)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-destructive/10 text-muted-foreground/80 hover:text-red-500 transition-colors" title="Xóa">
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
          </>
        )}
      </div>

      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
        <DialogContent className="max-w-lg max-h-[calc(100vh-2rem)] overflow-y-auto">
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
              <div className="flex flex-wrap gap-2">
                <Badge className={`border-0 text-xs ${typeBadgeColor[viewItem.type] || 'bg-muted text-foreground/70'}`}>{viewItem.type}</Badge>
                <Badge className="max-w-full whitespace-normal bg-primary/10 text-left text-primary border-0 text-xs leading-tight" title={viewItem.model}>{viewItem.model}</Badge>
                {viewItem.isFavorite && <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">Đã đánh dấu</Badge>}
              </div>
              <div className="bg-surface-muted rounded-xl p-4 max-h-72 overflow-y-auto">
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{viewItem.body}</p>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground gap-4">
                <span className="truncate">Tạo bởi: <span className="font-medium text-foreground/80">{viewItem.email}</span></span>
                <span className="flex-shrink-0">{viewItem.words.toLocaleString('vi-VN')} từ · {viewItem.date}</span>
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

      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="max-w-lg max-h-[calc(100vh-2rem)] overflow-y-auto">
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
                <Input value={editTitle} onChange={event => setEditTitle(event.target.value)} className="h-10" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Loại nội dung</Label>
                <Input value={editType} onChange={event => setEditType(event.target.value)} className="h-10" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Tag</Label>
                <Input value={editTags} onChange={event => setEditTags(event.target.value)} className="h-10" placeholder="seo, email, social" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Đánh dấu</Label>
                <Select value={editFavorite ? 'true' : 'false'} onValueChange={value => setEditFavorite(value === 'true')}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">Bình thường</SelectItem>
                    <SelectItem value="true">Đã đánh dấu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setEditItem(null)} className="flex-1 h-10 border border-border rounded-xl text-sm font-semibold text-foreground/70 hover:bg-surface-muted transition-colors">Hủy</button>
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
        title={`Xóa nội dung "${confirmDelete?.title}"?`}
        description="Nội dung sẽ vào thùng rác và có thể khôi phục."
        confirmLabel="Chuyển vào thùng rác"
      />

      <TrashBin
        open={trashOpen}
        onClose={() => setTrashOpen(false)}
        items={trashContents.map(item => ({
          id: item.id,
          label: item.title,
          subLabel: item.email,
          deletedAt: formatDeletedAt(item.deletedAt),
        }))}
        onRestore={handleRestore}
        onPermanentDelete={handlePermanentDelete}
        onPermanentDeleteAll={handlePermanentDeleteAll}
        entityName="nội dung"
        loading={trashLoading}
      />
    </Layout>
  );
}
