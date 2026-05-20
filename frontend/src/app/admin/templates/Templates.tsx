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
import {
  FilePlus, Edit2, Trash2, BarChart3, ScrollText, Star, Zap,
} from 'lucide-react';
import { ConfirmDialog } from '@/app/components/admin/ConfirmDialog';
import { TrashBin } from '@/app/components/admin/TrashBin';
import { StatTile } from '@/app/components/admin/StatTile';
import { AdminFilterBar } from '@/app/components/admin/AdminFilterBar';
import toast from 'react-hot-toast';

const INITIAL_TEMPLATES = [
  { id: 1, name: 'Facebook Ad Template', industry: 'E-commerce', type: 'headline', uses: 234, rating: 4.8, active: true, description: 'Template tạo quảng cáo Facebook chuẩn AIDA cho ngành thương mại điện tử. Bao gồm hook, offer và CTA mạnh.' },
  { id: 2, name: 'Email Marketing Template', industry: 'Công nghệ', type: 'email', uses: 189, rating: 4.6, active: true, description: 'Email nurturing cho SaaS & Tech startup. Cấu trúc subject line, body và CTA tối ưu open rate.' },
  { id: 3, name: 'Landing Page Copy', industry: 'Bất động sản', type: 'landing', uses: 156, rating: 4.9, active: true, description: 'Copy landing page bất động sản – hero headline, bullet benefits, social proof và urgency CTA.' },
  { id: 4, name: 'Social Media Post', industry: 'Ẩm thực', type: 'social', uses: 142, rating: 4.5, active: true, description: 'Caption Instagram/Facebook cho nhà hàng, quán cafe. Ngắn gọn, kèm emoji và hashtag gợi ý.' },
  { id: 5, name: 'Mô Tả Sản Phẩm', industry: 'Thời trang', type: 'description', uses: 98, rating: 4.4, active: false, description: 'Product description chuẩn SEO cho thời trang. Tập trung vào chất liệu, kiểu dáng và cảm giác mặc.' },
  { id: 6, name: 'Google Ads Copy', industry: 'Tài chính', type: 'ads', uses: 77, rating: 4.3, active: true, description: 'Headline & description cho Google Search Ads ngành tài chính. Tuân thủ giới hạn ký tự và best practices.' },
];

type Template = typeof INITIAL_TEMPLATES[0];
interface DeletedTemplate { id: number; name: string; industry: string; deletedAt: string; }

const INDUSTRY_OPTIONS = ['E-commerce', 'Công nghệ', 'Bất động sản', 'Ẩm thực', 'Thời trang', 'Tài chính', 'Y tế', 'Giáo dục', 'Du lịch'];
const TYPE_OPTIONS = ['headline', 'email', 'landing', 'social', 'description', 'ads'];

const typeBadgeColor: Record<string, string> = {
  headline: 'bg-stone-100 text-stone-700', email: 'bg-amber-100 text-amber-700',
  landing: 'bg-stone-100 text-stone-700', social: 'bg-amber-100 text-amber-700',
  description: 'bg-stone-100 text-stone-700', ads: 'bg-amber-100 text-amber-700',
};

export function AdminTemplates() {
  const [templates, setTemplates] = useState<Template[]>(INITIAL_TEMPLATES);
  const [search, setSearch] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('all');

  // Add
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState('');
  const [addIndustry, setAddIndustry] = useState('E-commerce');
  const [addType, setAddType] = useState('headline');
  const [addDesc, setAddDesc] = useState('');

  // Edit
  const [editItem, setEditItem] = useState<Template | null>(null);
  const [editName, setEditName] = useState('');
  const [editIndustry, setEditIndustry] = useState('');
  const [editType, setEditType] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [editSaving, setEditSaving] = useState(false);

  // Soft delete
  const [deletedTemplates, setDeletedTemplates] = useState<DeletedTemplate[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<Template | null>(null);
  const [trashOpen, setTrashOpen] = useState(false);
  const [trashLoading, setTrashLoading] = useState<string | null>(null);

  const visible = templates.filter(t => !deletedTemplates.find(d => d.id === t.id));
  const filtered = visible.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchIndustry = filterIndustry === 'all' || t.industry === filterIndustry;
    return matchSearch && matchIndustry;
  });

  const openEdit = (t: Template) => {
    setEditItem(t); setEditName(t.name); setEditIndustry(t.industry);
    setEditType(t.type); setEditDesc(t.description); setEditActive(t.active);
  };

  const handleSaveEdit = async () => {
    setEditSaving(true); await new Promise(r => setTimeout(r, 700));
    setTemplates(prev => prev.map(t => t.id === editItem!.id ? { ...t, name: editName, industry: editIndustry, type: editType, description: editDesc, active: editActive } : t));
    setEditSaving(false); setEditItem(null);
    toast.success('Đã cập nhật template');
  };

  const handleAdd = async () => {
    await new Promise(r => setTimeout(r, 500));
    const newT: Template = { id: Date.now(), name: addName, industry: addIndustry, type: addType, uses: 0, rating: 0, active: true, description: addDesc };
    setTemplates(prev => [newT, ...prev]);
    setShowAdd(false); setAddName(''); setAddDesc('');
    toast.success(`Đã thêm template "${addName}"`);
  };

  const handleSoftDelete = async () => {
    if (!confirmDelete) return;
    await new Promise(r => setTimeout(r, 400));
    setDeletedTemplates(prev => [...prev, { id: confirmDelete.id, name: confirmDelete.name, industry: confirmDelete.industry, deletedAt: new Date().toLocaleString('vi-VN') }]);
    setConfirmDelete(null); toast.success('Đã chuyển vào thùng rác');
  };

  const handleRestore = async (id: string | number) => {
    setTrashLoading(String(id)); await new Promise(r => setTimeout(r, 500));
    setDeletedTemplates(prev => prev.filter(t => t.id !== Number(id)));
    setTrashLoading(null); toast.success('Đã khôi phục template');
  };

  const handlePermanentDelete = async (id: string | number) => {
    setTrashLoading(String(id)); await new Promise(r => setTimeout(r, 500));
    setDeletedTemplates(prev => prev.filter(t => t.id !== Number(id)));
    setTemplates(prev => prev.filter(t => t.id !== Number(id)));
    setTrashLoading(null); toast.error('Đã xoá vĩnh viễn template');
  };

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Quản Lý Templates</h1>
            <p className="text-gray-500 text-sm">Quản lý mẫu copy cho các ngành nghề</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTrashOpen(true)}
              className="relative flex items-center gap-1.5 border border-gray-200 hover:border-red-300 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-xl px-3 py-2 text-sm font-semibold transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Thùng rác
              {deletedTemplates.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{deletedTemplates.length}</span>
              )}
            </button>
            <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl gap-2" onClick={() => setShowAdd(true)}>
              <FilePlus className="w-4 h-4" /> Thêm Template
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Tổng templates', value: visible.length, icon: ScrollText, color: 'text-green-600 bg-green-50' },
            { label: 'Đang hoạt động', value: visible.filter(t => t.active).length, icon: Zap, color: 'text-stone-600 bg-stone-50' },
            { label: 'Lượt sử dụng', value: visible.reduce((a, t) => a + t.uses, 0).toLocaleString(), icon: BarChart3, color: 'text-stone-600 bg-stone-50' },
            { label: 'Rating TB', value: (visible.reduce((a, t) => a + t.rating, 0) / (visible.length || 1)).toFixed(1), icon: Star, color: 'text-amber-600 bg-amber-50' },
          ].map((s, i) => (
            <StatTile key={i} icon={s.icon} label={s.label} value={s.value} color={s.color} />
          ))}
        </div>

        {/* Filters */}
        <AdminFilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Tìm template..."
          rightSlot={
            <Select value={filterIndustry} onValueChange={setFilterIndustry}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Ngành" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả ngành</SelectItem>
                {INDUSTRY_OPTIONS.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
              </SelectContent>
            </Select>
          }
        />

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(t => (
            <Card key={t.id} className={`p-5 hover:shadow-md transition-shadow ${!t.active ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold text-gray-900 text-sm truncate">{t.name}</h3>
                    {!t.active && <Badge className="bg-gray-100 text-gray-500 border-0 text-[10px]">Tắt</Badge>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`border-0 text-[10px] ${typeBadgeColor[t.type] || 'bg-gray-100 text-gray-600'}`}>{t.type}</Badge>
                    <span className="text-xs text-gray-500">{t.industry}</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">{t.description}</p>
              <div className="flex items-center justify-between mb-4 text-xs text-gray-500">
                <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" />{t.uses.toLocaleString()} lượt dùng</span>
                {t.rating > 0 && (
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" />{t.rating}</span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(t)}
                  className="flex-1 flex items-center justify-center gap-1.5 h-8 border border-stone-200 text-stone-600 hover:bg-stone-50 rounded-lg text-xs font-semibold transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Chỉnh sửa
                </button>
                <button
                  onClick={() => setConfirmDelete(t)}
                  className="w-8 h-8 flex items-center justify-center border border-red-200 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>
          ))}
        </div>
        {filtered.length === 0 && (
          <Card className="p-16 text-center">
            <ScrollText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Không tìm thấy template nào.</p>
          </Card>
        )}
      </div>

      {/* ── ADD DIALOG ── */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <FilePlus className="w-4 h-4 text-green-600" />
              </div>
              Thêm Template Mới
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div>
              <Label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">Tên template</Label>
              <Input value={addName} onChange={e => setAddName(e.target.value)} placeholder="VD: Google Ads Copy" className="h-10" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">Ngành</Label>
                <Select value={addIndustry} onValueChange={setAddIndustry}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>{INDUSTRY_OPTIONS.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">Loại</Label>
                <Select value={addType} onValueChange={setAddType}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>{TYPE_OPTIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">Mô tả</Label>
              <Textarea value={addDesc} onChange={e => setAddDesc(e.target.value)} placeholder="Mô tả ngắn về template này..." rows={3} className="resize-none" />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setShowAdd(false)} className="flex-1 h-10 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Huỷ</button>
              <button onClick={handleAdd} disabled={!addName.trim()} className="flex-1 h-10 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-40 text-white rounded-xl text-sm font-bold transition-all">
                Thêm Template
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
              Chỉnh sửa Template
            </DialogTitle>
          </DialogHeader>
          {editItem && (
            <div className="space-y-4 pt-1">
              <div>
                <Label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">Tên template</Label>
                <Input value={editName} onChange={e => setEditName(e.target.value)} className="h-10" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">Ngành</Label>
                  <Select value={editIndustry} onValueChange={setEditIndustry}>
                    <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>{INDUSTRY_OPTIONS.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">Loại</Label>
                  <Select value={editType} onValueChange={setEditType}>
                    <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>{TYPE_OPTIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">Mô tả</Label>
                <Textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={3} className="resize-none" />
              </div>
              <div>
                <Label className="text-xs text-gray-500 uppercase tracking-wider mb-1.5 block">Trạng thái</Label>
                <Select value={editActive ? 'true' : 'false'} onValueChange={v => setEditActive(v === 'true')}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">✅ Hoạt động</SelectItem>
                    <SelectItem value="false">⏸ Tắt</SelectItem>
                  </SelectContent>
                </Select>
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
        title={`Xoá template "${confirmDelete?.name}"?`}
        description="Template sẽ vào thùng rác, có thể khôi phục trong 30 ngày."
        confirmLabel="Chuyển vào thùng rác"
      />

      {/* ── TRASH BIN ── */}
      <TrashBin
        open={trashOpen}
        onClose={() => setTrashOpen(false)}
        items={deletedTemplates.map(t => ({ id: t.id, label: t.name, subLabel: t.industry, deletedAt: t.deletedAt }))}
        onRestore={handleRestore}
        onPermanentDelete={handlePermanentDelete}
        entityName="template"
        loading={trashLoading}
      />
    </Layout>
  );
}
