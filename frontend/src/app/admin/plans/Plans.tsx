import { useState } from 'react';
import { Layout } from '@/app/components/Layout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Label } from '@/app/components/ui/label';
import { Switch } from '@/app/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Crown, Edit2, Plus, Users, DollarSign, Zap, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/app/components/admin/ConfirmDialog';
import { TrashBin } from '@/app/components/admin/TrashBin';
import { StatTile } from '@/app/components/admin/StatTile';
import { AdminTable } from '@/app/components/admin/AdminTable';
import toast from 'react-hot-toast';

const INITIAL_PLANS = [
  { id: 1, name: 'Miễn Phí',  price: 0,      copyLimit: 30,  apiLimit: 0,     fineTune: 0,  users: 340, active: true,  popular: false, description: 'Phù hợp cho cá nhân mới bắt đầu' },
  { id: 2, name: 'Pro',        price: 299000,  copyLimit: 500, apiLimit: 5000,  fineTune: 3,  users: 780, active: true,  popular: true,  description: 'Dành cho freelancer và doanh nghiệp nhỏ' },
  { id: 3, name: 'Business',   price: 799000,  copyLimit: -1,  apiLimit: 50000, fineTune: -1, users: 114, active: true,  popular: false, description: 'Giải pháp đầy đủ cho đội nhóm marketing' },
  { id: 4, name: 'Enterprise', price: -1,      copyLimit: -1,  apiLimit: -1,    fineTune: -1, users: 12,  active: true,  popular: false, description: 'Custom solutions cho doanh nghiệp lớn' },
];

type Plan = typeof INITIAL_PLANS[0];
interface DeletedPlan { id: number; name: string; price: number; deletedAt: string; }

export function AdminPlans() {
  const [plans, setPlans] = useState<Plan[]>(INITIAL_PLANS);

  // Add
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState('');
  const [addPrice, setAddPrice] = useState('');
  const [addCopy, setAddCopy] = useState('');
  const [addApi, setAddApi] = useState('');
  const [addFine, setAddFine] = useState('');
  const [addDesc, setAddDesc] = useState('');

  // Edit
  const [editItem, setEditItem] = useState<Plan | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCopy, setEditCopy] = useState('');
  const [editApi, setEditApi] = useState('');
  const [editFine, setEditFine] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPopular, setEditPopular] = useState(false);
  const [editSaving, setEditSaving] = useState(false);

  // Soft delete
  const [deletedPlans, setDeletedPlans] = useState<DeletedPlan[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<Plan | null>(null);
  const [trashOpen, setTrashOpen] = useState(false);
  const [trashLoading, setTrashLoading] = useState<string | null>(null);

  const visible = plans.filter(p => !deletedPlans.find(d => d.id === p.id));
  const totalRevenue = visible.reduce((a, p) => a + (p.price > 0 ? p.price * p.users : 0), 0);

  const openEdit = (p: Plan) => {
    setEditItem(p);
    setEditName(p.name);
    setEditPrice(p.price === -1 ? '' : String(p.price));
    setEditCopy(p.copyLimit === -1 ? '' : String(p.copyLimit));
    setEditApi(p.apiLimit === -1 ? '' : String(p.apiLimit));
    setEditFine(p.fineTune === -1 ? '' : String(p.fineTune));
    setEditDesc(p.description);
    setEditPopular(p.popular);
  };

  const handleSaveEdit = async () => {
    setEditSaving(true); await new Promise(r => setTimeout(r, 700));
    setPlans(prev => prev.map(p => p.id === editItem!.id ? {
      ...p, name: editName,
      price: editPrice === '' ? -1 : Number(editPrice),
      copyLimit: editCopy === '' ? -1 : Number(editCopy),
      apiLimit: editApi === '' ? -1 : Number(editApi),
      fineTune: editFine === '' ? -1 : Number(editFine),
      description: editDesc, popular: editPopular,
    } : p));
    setEditSaving(false); setEditItem(null);
    toast.success('Đã cập nhật gói dịch vụ');
  };

  const handleAdd = async () => {
    if (!addName.trim()) return;
    await new Promise(r => setTimeout(r, 400));
    const newP: Plan = {
      id: Date.now(), name: addName,
      price: addPrice === '' ? -1 : Number(addPrice),
      copyLimit: addCopy === '' ? -1 : Number(addCopy),
      apiLimit: addApi === '' ? -1 : Number(addApi),
      fineTune: addFine === '' ? -1 : Number(addFine),
      users: 0, active: true, popular: false, description: addDesc,
    };
    setPlans(prev => [...prev, newP]);
    setShowAdd(false); setAddName(''); setAddPrice(''); setAddCopy(''); setAddApi(''); setAddFine(''); setAddDesc('');
    toast.success(`Đã tạo gói "${addName}"`);
  };

  const toggleActive = (id: number) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
    toast.success('Đã cập nhật trạng thái gói');
  };

  const handleSoftDelete = async () => {
    if (!confirmDelete) return;
    await new Promise(r => setTimeout(r, 400));
    setDeletedPlans(prev => [...prev, { id: confirmDelete.id, name: confirmDelete.name, price: confirmDelete.price, deletedAt: new Date().toLocaleString('vi-VN') }]);
    setConfirmDelete(null); toast.success('Đã chuyển vào thùng rác');
  };

  const handleRestore = async (id: string | number) => {
    setTrashLoading(String(id)); await new Promise(r => setTimeout(r, 500));
    setDeletedPlans(prev => prev.filter(p => p.id !== Number(id)));
    setTrashLoading(null); toast.success('Đã khôi phục gói dịch vụ');
  };

  const handlePermanentDelete = async (id: string | number) => {
    setTrashLoading(String(id)); await new Promise(r => setTimeout(r, 500));
    setDeletedPlans(prev => prev.filter(p => p.id !== Number(id)));
    setPlans(prev => prev.filter(p => p.id !== Number(id)));
    setTrashLoading(null); toast.error('Đã xoá vĩnh viễn gói dịch vụ');
  };

  const formatVal = (v: number, label = '') => v === -1 ? 'Unlimited' : v === 0 ? '—' : `${v.toLocaleString()}${label}`;
  const formatPrice = (p: number) => p === 0 ? 'Miễn phí' : p === -1 ? 'Liên hệ' : `${p.toLocaleString('vi-VN')}₫`;

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Quản Lý Gói Dịch Vụ</h1>
            <p className="text-muted-foreground text-sm">Cấu hình các gói subscription và pricing</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTrashOpen(true)}
              className="relative flex items-center gap-1.5 border border-border hover:border-red-300 hover:bg-destructive/10 text-muted-foreground hover:text-red-600 rounded-xl px-3 py-2 text-sm font-semibold transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Thùng rác
              {deletedPlans.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive/100 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{deletedPlans.length}</span>
              )}
            </button>
            <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl" onClick={() => setShowAdd(true)}>
              <Plus className="w-4 h-4 mr-2" /> Tạo Gói Mới
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Tổng gói', value: visible.length, icon: Crown, color: 'text-primary bg-primary/5' },
            { label: 'Tổng subscribers', value: visible.reduce((a, p) => a + p.users, 0).toLocaleString(), icon: Users, color: 'text-primary bg-primary/5' },
            { label: 'Doanh thu ước tính', value: (totalRevenue / 1000000).toFixed(1) + 'M₫', icon: DollarSign, color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Paid users', value: visible.filter(p => p.price > 0).reduce((a, p) => a + p.users, 0).toLocaleString(), icon: Zap, color: 'text-primary bg-primary/5' },
          ].map((s, i) => (
            <StatTile key={i} icon={s.icon} label={s.label} value={s.value} color={s.color} />
          ))}
        </div>

        {/* Table */}
        <AdminTable>
            <TableHeader>
              <TableRow>
                <TableHead>Gói</TableHead>
                <TableHead>Giá</TableHead>
                <TableHead>Copy/tháng</TableHead>
                <TableHead>API calls</TableHead>
                <TableHead>Fine-tune</TableHead>
                <TableHead>Subscribers</TableHead>
                <TableHead>Kích hoạt</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map(plan => (
                <TableRow key={plan.id} className={!plan.active ? 'opacity-60' : ''}>
                  <TableCell>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{plan.name}</span>
                        {plan.popular && <Badge className="bg-warning/15 text-amber-800 border-0 text-xs">Phổ biến</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground/80 mt-0.5">{plan.description}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-foreground">{formatPrice(plan.price)}</TableCell>
                  <TableCell className="text-sm text-foreground/70">{formatVal(plan.copyLimit)}</TableCell>
                  <TableCell className="text-sm text-foreground/70">{formatVal(plan.apiLimit)}</TableCell>
                  <TableCell className="text-sm text-foreground/70">{formatVal(plan.fineTune)}</TableCell>
                  <TableCell><Badge className="bg-primary/10 text-primary border-0">{plan.users}</Badge></TableCell>
                  <TableCell><Switch checked={plan.active} onCheckedChange={() => toggleActive(plan.id)} /></TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => openEdit(plan)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary/5 text-muted-foreground/80 hover:text-primary transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setConfirmDelete(plan)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-destructive/10 text-muted-foreground/80 hover:text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
        </AdminTable>
      </div>

      {/* ── ADD DIALOG ── */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Plus className="w-4 h-4 text-primary" />
              </div>
              Tạo Gói Mới
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Tên gói</Label>
              <Input value={addName} onChange={e => setAddName(e.target.value)} placeholder="VD: Team" className="h-10" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Mô tả</Label>
              <Input value={addDesc} onChange={e => setAddDesc(e.target.value)} placeholder="Dành cho..." className="h-10" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Giá (₫/tháng)</Label>
                <Input value={addPrice} onChange={e => setAddPrice(e.target.value)} placeholder="Trống = Liên hệ" className="h-10" type="number" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Copy/tháng</Label>
                <Input value={addCopy} onChange={e => setAddCopy(e.target.value)} placeholder="Trống = Unlimited" className="h-10" type="number" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">API calls/tháng</Label>
                <Input value={addApi} onChange={e => setAddApi(e.target.value)} placeholder="Trống = Unlimited" className="h-10" type="number" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Fine-tune models</Label>
                <Input value={addFine} onChange={e => setAddFine(e.target.value)} placeholder="Trống = Unlimited" className="h-10" type="number" />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setShowAdd(false)} className="flex-1 h-10 border border-border rounded-xl text-sm font-semibold text-foreground/70 hover:bg-surface-muted transition-colors">Huỷ</button>
              <button onClick={handleAdd} disabled={!addName.trim()} className="flex-1 h-10 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-40 text-white rounded-xl text-sm font-bold transition-all">
                Tạo gói
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
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Edit2 className="w-4 h-4 text-primary" />
              </div>
              Chỉnh sửa Gói: {editItem?.name}
            </DialogTitle>
          </DialogHeader>
          {editItem && (
            <div className="space-y-4 pt-1">
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Tên gói</Label>
                <Input value={editName} onChange={e => setEditName(e.target.value)} className="h-10" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Mô tả</Label>
                <Input value={editDesc} onChange={e => setEditDesc(e.target.value)} className="h-10" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Giá (₫/tháng)</Label>
                  <Input value={editPrice} onChange={e => setEditPrice(e.target.value)} placeholder="Trống = Liên hệ" className="h-10" type="number" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Copy/tháng</Label>
                  <Input value={editCopy} onChange={e => setEditCopy(e.target.value)} placeholder="Trống = Unlimited" className="h-10" type="number" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">API calls</Label>
                  <Input value={editApi} onChange={e => setEditApi(e.target.value)} placeholder="Trống = Unlimited" className="h-10" type="number" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Fine-tune</Label>
                  <Input value={editFine} onChange={e => setEditFine(e.target.value)} placeholder="Trống = Unlimited" className="h-10" type="number" />
                </div>
              </div>
              <div className="flex items-center justify-between bg-surface-muted rounded-xl p-3">
                <Label className="text-sm font-medium text-foreground/80">Đánh dấu "Phổ biến"</Label>
                <Switch checked={editPopular} onCheckedChange={setEditPopular} />
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setEditItem(null)} className="flex-1 h-10 border border-border rounded-xl text-sm font-semibold text-foreground/70 hover:bg-surface-muted transition-colors">Huỷ</button>
                <button onClick={handleSaveEdit} disabled={editSaving} className="flex-1 h-10 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center">
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
        title={`Xoá gói "${confirmDelete?.name}"?`}
        description={`Gói có ${confirmDelete?.users} subscribers. Tất cả sẽ được chuyển xuống gói Miễn Phí. Bạn có thể khôi phục trong 30 ngày.`}
        confirmLabel="Chuyển vào thùng rác"
        confirmVariant="warning"
      />

      {/* ── TRASH BIN ── */}
      <TrashBin
        open={trashOpen}
        onClose={() => setTrashOpen(false)}
        items={deletedPlans.map(p => ({ id: p.id, label: p.name, subLabel: p.price === -1 ? 'Liên hệ' : p.price === 0 ? 'Miễn phí' : `${p.price.toLocaleString('vi-VN')}₫/tháng`, deletedAt: p.deletedAt }))}
        onRestore={handleRestore}
        onPermanentDelete={handlePermanentDelete}
        entityName="gói dịch vụ"
        loading={trashLoading}
      />
    </Layout>
  );
}
