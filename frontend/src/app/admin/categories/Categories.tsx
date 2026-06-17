import { useCallback, useEffect, useMemo, useState } from 'react';
import { Edit2, Plus, RefreshCw, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { Layout } from '@/app/components/Layout';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Switch } from '@/app/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Textarea } from '@/app/components/ui/textarea';
import { AdminFilterBar } from '@/app/components/admin/AdminFilterBar';
import { ConfirmDialog } from '@/app/components/admin/ConfirmDialog';
import { TrashBin } from '@/app/components/admin/TrashBin';
import { DataPagination } from '@/app/components/common/DataPagination';
import { usePagination } from '@/hooks/usePagination';
import { categoryService, type AdminCategory } from '@/services/categoryService';

const ICON_OPTIONS = ['🏷️', '🛒', '🏠', '💻', '🍜', '🏥', '📚', '💰', '👗', '✈️', '🚚', '🔎', '📱', '✉️', '📣', '🏦', '🎓', '💄', '🎮', '🏋️'];

function getErrorMessage(error: unknown, fallback: string) {
  const err = error as { response?: { data?: { message?: string } }; message?: string };
  return err.response?.data?.message || err.message || fallback;
}

function formatDate(value?: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleString('vi-VN');
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function AdminCategories() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [trashCategories, setTrashCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortCategories, setSortCategories] = useState('order-asc');

  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState('');
  const [addSlug, setAddSlug] = useState('');
  const [addDescription, setAddDescription] = useState('');
  const [addIcon, setAddIcon] = useState('🏷️');
  const [addSaving, setAddSaving] = useState(false);

  const [editItem, setEditItem] = useState<AdminCategory | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIcon, setEditIcon] = useState('🏷️');
  const [editOrder, setEditOrder] = useState('0');
  const [editActive, setEditActive] = useState(true);
  const [editSaving, setEditSaving] = useState(false);

  const [toggleId, setToggleId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AdminCategory | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [trashOpen, setTrashOpen] = useState(false);
  const [trashLoading, setTrashLoading] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const [activeItems, deletedItems] = await Promise.all([
        categoryService.list(),
        categoryService.listTrash(),
      ]);
      setCategories(activeItems);
      setTrashCategories(deletedItems);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không tải được danh mục từ API'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const filteredCategories = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const filtered = categories.filter((item) => {
      const matchSearch = !keyword || [item.name, item.slug, item.description]
        .join(' ')
        .toLowerCase()
        .includes(keyword);
      const matchStatus = filterStatus === 'all'
        || (filterStatus === 'active' && item.isActive)
        || (filterStatus === 'inactive' && !item.isActive);
      return matchSearch && matchStatus;
    });

    return [...filtered].sort((a, b) => {
      switch (sortCategories) {
        case 'order-desc':
          return b.order - a.order;
        case 'name-asc':
          return a.name.localeCompare(b.name, 'vi');
        case 'name-desc':
          return b.name.localeCompare(a.name, 'vi');
        case 'templates-desc':
          return b.templateCount - a.templateCount;
        case 'templates-asc':
          return a.templateCount - b.templateCount;
        case 'created-desc':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'created-asc':
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case 'order-asc':
        default:
          return a.order - b.order;
      }
    });
  }, [categories, filterStatus, search, sortCategories]);

  const pagination = usePagination(filteredCategories, {
    initialPageSize: 10,
    resetKey: `${search}|${filterStatus}|${sortCategories}`,
  });

  const activeCount = categories.filter((item) => item.isActive).length;
  const templateTotal = categories.reduce((sum, item) => sum + item.templateCount, 0);

  const resetAddForm = () => {
    setAddName('');
    setAddSlug('');
    setAddDescription('');
    setAddIcon('🏷️');
  };

  const openEdit = (item: AdminCategory) => {
    setEditItem(item);
    setEditName(item.name);
    setEditSlug(item.slug);
    setEditDescription(item.description);
    setEditIcon(item.icon || '🏷️');
    setEditOrder(String(item.order || 0));
    setEditActive(item.isActive);
  };

  const handleAdd = async () => {
    const name = addName.trim();
    if (!name) {
      toast.error('Vui lòng nhập tên danh mục');
      return;
    }

    setAddSaving(true);
    try {
      await categoryService.create({
        name,
        slug: addSlug.trim() || slugify(name),
        description: addDescription.trim(),
        icon: addIcon,
        order: categories.length + 1,
        isActive: true,
      });
      resetAddForm();
      setShowAdd(false);
      await loadCategories();
      toast.success(`Đã thêm danh mục "${name}"`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không thêm được danh mục'));
    } finally {
      setAddSaving(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editItem) return;
    const name = editName.trim();
    if (!name) {
      toast.error('Vui lòng nhập tên danh mục');
      return;
    }

    setEditSaving(true);
    try {
      await categoryService.update(editItem.id, {
        name,
        slug: editSlug.trim() || slugify(name),
        description: editDescription.trim(),
        icon: editIcon,
        order: Number(editOrder) || 0,
        isActive: editActive,
      });
      setEditItem(null);
      await loadCategories();
      toast.success(`Đã cập nhật danh mục "${name}"`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không cập nhật được danh mục'));
    } finally {
      setEditSaving(false);
    }
  };

  const toggleActive = async (item: AdminCategory) => {
    setToggleId(item.id);
    try {
      await categoryService.update(item.id, { isActive: !item.isActive });
      await loadCategories();
      toast.success('Đã cập nhật trạng thái danh mục');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không cập nhật được trạng thái'));
    } finally {
      setToggleId(null);
    }
  };

  const handleSoftDelete = async () => {
    if (!confirmDelete) return;
    setDeleteLoading(true);
    try {
      await categoryService.remove(confirmDelete.id);
      await loadCategories();
      toast.success('Đã chuyển danh mục vào thùng rác');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không xóa được danh mục'));
    } finally {
      setDeleteLoading(false);
      setConfirmDelete(null);
    }
  };

  const findTrashCategory = (id: number | string) => trashCategories.find((item) => item.id === String(id));

  const handleRestore = async (id: number | string) => {
    const item = findTrashCategory(id);
    if (!item) return;

    setTrashLoading(String(id));
    try {
      await categoryService.restore(item.id);
      await loadCategories();
      toast.success('Đã khôi phục danh mục');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không khôi phục được danh mục'));
    } finally {
      setTrashLoading(null);
    }
  };

  const handlePermanentDelete = async (id: number | string) => {
    const item = findTrashCategory(id);
    if (!item) return;

    setTrashLoading(String(id));
    try {
      await categoryService.permanentDelete(item.id);
      await loadCategories();
      toast.success('Đã xóa vĩnh viễn danh mục');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không xóa vĩnh viễn được danh mục'));
    } finally {
      setTrashLoading(null);
    }
  };

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Quản lý danh mục</h1>
            <p className="text-muted-foreground text-sm">Dữ liệu được đọc và ghi trực tiếp qua API admin categories.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTrashOpen(true)}
              className="relative flex items-center gap-1.5 border border-border hover:border-red-300 hover:bg-destructive/10 text-muted-foreground hover:text-red-600 rounded-xl px-3 py-2 text-sm font-semibold transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Thùng rác
              {trashCategories.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive/100 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {trashCategories.length}
                </span>
              )}
            </button>
            <Button
              variant="outline"
              onClick={() => void loadCategories()}
              disabled={loading}
              className="rounded-xl gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Làm mới
            </Button>
            <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl gap-2" onClick={() => setShowAdd(true)}>
              <Plus className="w-4 h-4" /> Thêm danh mục
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          <Card className="p-4">
            <p className="text-xs text-muted-foreground uppercase font-semibold">Tổng danh mục</p>
            <p className="text-2xl font-bold text-foreground mt-1">{categories.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground uppercase font-semibold">Đang hoạt động</p>
            <p className="text-2xl font-bold text-primary mt-1">{activeCount}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground uppercase font-semibold">Template liên quan</p>
            <p className="text-2xl font-bold text-foreground mt-1">{templateTotal}</p>
          </Card>
        </div>

        <AdminFilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Tìm danh mục..."
          className="mb-5"
          rightSlot={
            <div className="flex flex-wrap gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="inactive">Tạm tắt</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortCategories} onValueChange={setSortCategories}>
                <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="order-asc">Thứ tự tăng dần</SelectItem>
                  <SelectItem value="order-desc">Thứ tự giảm dần</SelectItem>
                  <SelectItem value="templates-desc">Nhiều templates</SelectItem>
                  <SelectItem value="templates-asc">Ít templates</SelectItem>
                  <SelectItem value="created-desc">Mới nhất</SelectItem>
                  <SelectItem value="created-asc">Cũ nhất</SelectItem>
                  <SelectItem value="name-asc">Tên A-Z</SelectItem>
                  <SelectItem value="name-desc">Tên Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          }
        />

        {loading ? (
          <Card className="p-12 text-center text-sm text-muted-foreground">Đang tải danh mục từ API...</Card>
        ) : (
          <>
            <Card>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Danh mục</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Templates</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagination.pageItems.map((item) => (
                      <TableRow key={item.id} className={!item.isActive ? 'opacity-60' : ''}>
                        <TableCell className="text-muted-foreground/80 text-sm">{item.order || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-start gap-3">
                            <span className="text-xl leading-none mt-0.5">{item.icon}</span>
                            <div>
                              <p className="font-semibold text-foreground text-sm">{item.name}</p>
                              {item.description && (
                                <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell><code className="text-xs bg-muted px-2 py-0.5 rounded-md">{item.slug}</code></TableCell>
                        <TableCell><Badge className="bg-primary/10 text-primary border-0 text-xs">{item.templateCount}</Badge></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={item.isActive}
                              onCheckedChange={() => void toggleActive(item)}
                              disabled={toggleId === item.id}
                            />
                            <span className="text-xs text-muted-foreground">
                              {item.isActive ? 'Hoạt động' : 'Tạm tắt'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 justify-end">
                            <button onClick={() => openEdit(item)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary/5 text-muted-foreground/80 hover:text-primary transition-colors">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setConfirmDelete(item)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-destructive/10 text-muted-foreground/80 hover:text-red-500 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {filteredCategories.length === 0 && (
                <div className="text-center py-12 text-muted-foreground/80 text-sm">Không tìm thấy danh mục nào.</div>
              )}
            </Card>
            <DataPagination
              page={pagination.page}
              pageSize={pagination.pageSize}
              totalItems={pagination.totalItems}
              totalPages={pagination.totalPages}
              startIndex={pagination.startIndex}
              endIndex={pagination.endIndex}
              onPageChange={pagination.setPage}
              onPageSizeChange={pagination.setPageSize}
              itemLabel="danh mục"
            />
          </>
        )}
      </div>

      <Dialog open={showAdd} onOpenChange={(open) => { setShowAdd(open); if (!open) resetAddForm(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Plus className="w-4 h-4 text-primary" />
              </div>
              Thêm danh mục mới
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Tên danh mục</Label>
              <Input
                value={addName}
                onChange={(event) => {
                  setAddName(event.target.value);
                  setAddSlug(slugify(event.target.value));
                }}
                placeholder="VD: Bảo hiểm"
                className="h-10"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Slug</Label>
              <Input value={addSlug} onChange={(event) => setAddSlug(slugify(event.target.value))} placeholder="bao-hiem" className="h-10 font-mono text-sm" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Mô tả</Label>
              <Textarea value={addDescription} onChange={(event) => setAddDescription(event.target.value)} placeholder="Mô tả ngắn về nhóm template này..." rows={3} className="resize-none" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Icon</Label>
              <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => setAddIcon(icon)}
                    className={`w-9 h-9 text-xl rounded-xl border-2 transition-all ${addIcon === icon ? 'border-primary bg-primary/5 scale-110' : 'border-border hover:border-primary/30'}`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setShowAdd(false)} className="flex-1 h-10 border border-border rounded-xl text-sm font-semibold text-foreground/70 hover:bg-surface-muted transition-colors">Hủy</button>
              <button onClick={handleAdd} disabled={addSaving || !addName.trim()} className="flex-1 h-10 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-40 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center">
                {addSaving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : 'Thêm danh mục'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Edit2 className="w-4 h-4 text-primary" />
              </div>
              Chỉnh sửa danh mục
            </DialogTitle>
          </DialogHeader>
          {editItem && (
            <div className="space-y-4 pt-1">
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Tên danh mục</Label>
                <Input value={editName} onChange={(event) => setEditName(event.target.value)} className="h-10" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Slug</Label>
                <Input value={editSlug} onChange={(event) => setEditSlug(slugify(event.target.value))} className="h-10 font-mono text-sm" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Mô tả</Label>
                <Textarea value={editDescription} onChange={(event) => setEditDescription(event.target.value)} rows={3} className="resize-none" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Thứ tự</Label>
                <Input value={editOrder} onChange={(event) => setEditOrder(event.target.value)} type="number" min={0} className="h-10" />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border p-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">Trạng thái</p>
                  <p className="text-xs text-muted-foreground">Bật để hiển thị danh mục trong hệ thống.</p>
                </div>
                <Switch checked={editActive} onCheckedChange={setEditActive} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Icon</Label>
                <div className="flex flex-wrap gap-2">
                  {ICON_OPTIONS.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setEditIcon(icon)}
                      className={`w-9 h-9 text-xl rounded-xl border-2 transition-all ${editIcon === icon ? 'border-primary bg-primary/5 scale-110' : 'border-border hover:border-primary/30'}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setEditItem(null)} className="flex-1 h-10 border border-border rounded-xl text-sm font-semibold text-foreground/70 hover:bg-surface-muted transition-colors">Hủy</button>
                <button onClick={handleSaveEdit} disabled={editSaving} className="flex-1 h-10 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center">
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
        loading={deleteLoading}
        title={`Xóa danh mục "${confirmDelete?.name}"?`}
        description="Danh mục sẽ vào thùng rác. Templates liên quan vẫn được giữ nguyên."
        confirmLabel="Chuyển vào thùng rác"
      />

      <TrashBin
        open={trashOpen}
        onClose={() => setTrashOpen(false)}
        items={trashCategories.map((item) => ({
          id: item.id,
          label: item.name,
          subLabel: item.slug,
          deletedAt: formatDate(item.deletedAt),
        }))}
        onRestore={handleRestore}
        onPermanentDelete={handlePermanentDelete}
        entityName="danh mục"
        loading={trashLoading}
      />
    </Layout>
  );
}
