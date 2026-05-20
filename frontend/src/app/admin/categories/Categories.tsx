import { useState } from 'react';
import { Layout } from '@/app/components/Layout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Label } from '@/app/components/ui/label';
import { Switch } from '@/app/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Tag, Plus, Edit2, Trash2, Search } from 'lucide-react';
import { ConfirmDialog } from '@/app/components/admin/ConfirmDialog';
import { TrashBin } from '@/app/components/admin/TrashBin';
import toast from 'react-hot-toast';

const INITIAL_CATEGORIES = [
  { id: 1, name: 'E-commerce',    slug: 'ecommerce',  icon: '🛒', templates: 24, users: 450, active: true,  order: 1 },
  { id: 2, name: 'Bất Động Sản',  slug: 'realestate', icon: '🏠', templates: 18, users: 380, active: true,  order: 2 },
  { id: 3, name: 'Công Nghệ',     slug: 'technology', icon: '💻', templates: 15, users: 320, active: true,  order: 3 },
  { id: 4, name: 'Ẩm Thực F&B',   slug: 'fnb',        icon: '🍜', templates: 12, users: 280, active: true,  order: 4 },
  { id: 5, name: 'Y Tế & Sức Khỏe', slug: 'healthcare', icon: '🏥', templates: 10, users: 150, active: true, order: 5 },
  { id: 6, name: 'Giáo Dục',      slug: 'education',  icon: '📚', templates: 14, users: 200, active: true,  order: 6 },
  { id: 7, name: 'Tài Chính',     slug: 'finance',    icon: '💰', templates: 8,  users: 120, active: true,  order: 7 },
  { id: 8, name: 'Thời Trang',    slug: 'fashion',    icon: '👗', templates: 11, users: 190, active: true,  order: 8 },
  { id: 9, name: 'Du Lịch',       slug: 'travel',     icon: '✈️', templates: 9,  users: 140, active: true,  order: 9 },
  { id: 10, name: 'Logistics',    slug: 'logistics',  icon: '🚚', templates: 5,  users: 60,  active: false, order: 10 },
];

type Category = typeof INITIAL_CATEGORIES[0];
interface DeletedCategory { id: number; name: string; slug: string; deletedAt: string; }

const ICON_OPTIONS = ['🛒','🏠','💻','🍜','🏥','📚','💰','👗','✈️','🚚','🏦','🎓','💄','🎮','🏋️','🚗','🐾','🌿'];

export function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [search, setSearch] = useState('');

  // Add
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState('');
  const [addSlug, setAddSlug] = useState('');
  const [addIcon, setAddIcon] = useState('🏷️');

  // Edit
  const [editItem, setEditItem] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editIcon, setEditIcon] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  // Soft delete
  const [deletedCategories, setDeletedCategories] = useState<DeletedCategory[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<Category | null>(null);
  const [trashOpen, setTrashOpen] = useState(false);
  const [trashLoading, setTrashLoading] = useState<string | null>(null);

  const visible = categories.filter(c => !deletedCategories.find(d => d.id === c.id));
  const filtered = visible.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.slug.toLowerCase().includes(search.toLowerCase()));

  const toggleActive = (id: number) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
    toast.success('Đã cập nhật trạng thái!');
  };

  const openEdit = (c: Category) => {
    setEditItem(c); setEditName(c.name); setEditSlug(c.slug); setEditIcon(c.icon);
  };

  const handleSaveEdit = async () => {
    setEditSaving(true); await new Promise(r => setTimeout(r, 700));
    setCategories(prev => prev.map(c => c.id === editItem!.id ? { ...c, name: editName, slug: editSlug, icon: editIcon } : c));
    setEditSaving(false); setEditItem(null);
    toast.success('Đã cập nhật danh mục');
  };

  const handleAdd = async () => {
    if (!addName.trim()) return;
    await new Promise(r => setTimeout(r, 400));
    const newCat: Category = {
      id: Date.now(), name: addName, slug: addSlug || addName.toLowerCase().replace(/\s+/g, ''),
      icon: addIcon, templates: 0, users: 0, active: true, order: categories.length + 1,
    };
    setCategories(prev => [...prev, newCat]);
    setShowAdd(false); setAddName(''); setAddSlug(''); setAddIcon('🏷️');
    toast.success(`Đã thêm danh mục "${addName}"`);
  };

  const handleSoftDelete = async () => {
    if (!confirmDelete) return;
    await new Promise(r => setTimeout(r, 400));
    setDeletedCategories(prev => [...prev, { id: confirmDelete.id, name: confirmDelete.name, slug: confirmDelete.slug, deletedAt: new Date().toLocaleString('vi-VN') }]);
    setConfirmDelete(null); toast.success('Đã chuyển vào thùng rác');
  };

  const handleRestore = async (id: string | number) => {
    setTrashLoading(String(id)); await new Promise(r => setTimeout(r, 500));
    setDeletedCategories(prev => prev.filter(c => c.id !== Number(id)));
    setTrashLoading(null); toast.success('Đã khôi phục danh mục');
  };

  const handlePermanentDelete = async (id: string | number) => {
    setTrashLoading(String(id)); await new Promise(r => setTimeout(r, 500));
    setDeletedCategories(prev => prev.filter(c => c.id !== Number(id)));
    setCategories(prev => prev.filter(c => c.id !== Number(id)));
    setTrashLoading(null); toast.error('Đã xoá vĩnh viễn danh mục');
  };

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Quản Lý Danh Mục</h1>
            <p className="text-gray-500 text-sm">Quản lý ngành nghề và danh mục cho templates</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTrashOpen(true)}
              className="relative flex items-center gap-1.5 border border-gray-200 hover:border-red-300 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-xl px-3 py-2 text-sm font-semibold transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Thùng rác
              {deletedCategories.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{deletedCategories.length}</span>
              )}
            </button>
            <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl" onClick={() => setShowAdd(true)}>
              <Plus className="w-4 h-4 mr-2" /> Thêm Danh Mục
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Tìm danh mục..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 max-w-md" />
        </div>

        {/* Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Templates</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(cat => (
                <TableRow key={cat.id} className={!cat.active ? 'opacity-60' : ''}>
                  <TableCell className="text-gray-400 text-sm">{cat.order}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{cat.icon}</span>
                      <span className="font-semibold text-gray-900 text-sm">{cat.name}</span>
                    </div>
                  </TableCell>
                  <TableCell><code className="text-xs bg-gray-100 px-2 py-0.5 rounded-md">{cat.slug}</code></TableCell>
                  <TableCell><Badge className="bg-green-100 text-green-700 border-0 text-xs">{cat.templates}</Badge></TableCell>
                  <TableCell className="text-sm text-gray-600">{cat.users}</TableCell>
                  <TableCell>
                    <Switch checked={cat.active} onCheckedChange={() => toggleActive(cat.id)} />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => openEdit(cat)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-stone-50 text-gray-400 hover:text-stone-600 transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setConfirmDelete(cat)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filtered.length === 0 && <div className="text-center py-12 text-gray-400 text-sm">Không tìm thấy danh mục nào.</div>}
        </Card>
      </div>

      {/* ── ADD DIALOG ── */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Plus className="w-4 h-4 text-green-600" />
              </div>
              Thêm Danh Mục Mới
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div>
              <Label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">Tên danh mục</Label>
              <Input value={addName} onChange={e => { setAddName(e.target.value); setAddSlug(e.target.value.toLowerCase().replace(/\s+/g, '').replace(/[^\w]/g, '')); }} placeholder="VD: Bảo Hiểm" className="h-10" />
            </div>
            <div>
              <Label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">Slug</Label>
              <Input value={addSlug} onChange={e => setAddSlug(e.target.value)} placeholder="insurance" className="h-10 font-mono text-sm" />
            </div>
            <div>
              <Label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Icon</Label>
              <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map(icon => (
                  <button key={icon} onClick={() => setAddIcon(icon)}
                    className={`w-9 h-9 text-xl rounded-xl border-2 transition-all ${addIcon === icon ? 'border-green-500 bg-green-50 scale-110' : 'border-gray-200 hover:border-gray-300'}`}>
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setShowAdd(false)} className="flex-1 h-10 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Huỷ</button>
              <button onClick={handleAdd} disabled={!addName.trim()} className="flex-1 h-10 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-40 text-white rounded-xl text-sm font-bold transition-all">
                Thêm danh mục
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── EDIT DIALOG ── */}
      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center">
                <Edit2 className="w-4 h-4 text-stone-600" />
              </div>
              Chỉnh sửa Danh Mục
            </DialogTitle>
          </DialogHeader>
          {editItem && (
            <div className="space-y-4 pt-1">
              <div>
                <Label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">Tên danh mục</Label>
                <Input value={editName} onChange={e => setEditName(e.target.value)} className="h-10" />
              </div>
              <div>
                <Label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">Slug</Label>
                <Input value={editSlug} onChange={e => setEditSlug(e.target.value)} className="h-10 font-mono text-sm" />
              </div>
              <div>
                <Label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Icon</Label>
                <div className="flex flex-wrap gap-2">
                  {ICON_OPTIONS.map(icon => (
                    <button key={icon} onClick={() => setEditIcon(icon)}
                      className={`w-9 h-9 text-xl rounded-xl border-2 transition-all ${editIcon === icon ? 'border-stone-500 bg-stone-50 scale-110' : 'border-gray-200 hover:border-gray-300'}`}>
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setEditItem(null)} className="flex-1 h-10 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Huỷ</button>
                <button onClick={handleSaveEdit} disabled={editSaving} className="flex-1 h-10 bg-gradient-to-r from-stone-600 to-stone-700 hover:from-stone-700 hover:to-stone-800 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center">
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
        title={`Xoá danh mục "${confirmDelete?.name}"?`}
        description="Danh mục sẽ vào thùng rác. Templates và người dùng liên quan sẽ không bị ảnh hưởng."
        confirmLabel="Chuyển vào thùng rác"
      />

      {/* ── TRASH BIN ── */}
      <TrashBin
        open={trashOpen}
        onClose={() => setTrashOpen(false)}
        items={deletedCategories.map(c => ({ id: c.id, label: c.name, subLabel: c.slug, deletedAt: c.deletedAt }))}
        onRestore={handleRestore}
        onPermanentDelete={handlePermanentDelete}
        entityName="danh mục"
        loading={trashLoading}
      />
    </Layout>
  );
}
