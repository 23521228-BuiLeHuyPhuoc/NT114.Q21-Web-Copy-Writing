import { useMemo, useState } from 'react';
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
  BarChart3,
  Edit2,
  FilePlus,
  ScrollText,
  ShieldCheck,
  Trash2,
  Zap,
} from 'lucide-react';
import { ConfirmDialog } from '@/app/components/admin/ConfirmDialog';
import { TrashBin } from '@/app/components/admin/TrashBin';
import { StatTile } from '@/app/components/admin/StatTile';
import { AdminFilterBar } from '@/app/components/admin/AdminFilterBar';
import { DataPagination } from '@/app/components/common/DataPagination';
import { usePagination } from '@/hooks/usePagination';
import {
  useAdminTemplates,
  useAdminTemplateTrash,
  useCreateAdminTemplate,
  usePermanentDeleteAdminTemplate,
  useRemoveAdminTemplate,
  useRestoreAdminTemplate,
  useUpdateAdminTemplate,
} from '@/hooks/queries/useAdminTemplates';
import type { AdminTemplate } from '@/services/adminTemplateService';
import toast from 'react-hot-toast';

const CATEGORY_OPTIONS = [
  'general',
  'ecommerce',
  'technology',
  'realestate',
  'fnb',
  'healthcare',
  'education',
  'finance',
  'fashion',
  'travel',
];

const TYPE_OPTIONS = ['headline', 'email', 'landing', 'social', 'description', 'ads', 'cta', 'seo', 'review'];

const typeBadgeColor: Record<string, string> = {
  headline: 'bg-primary/10 text-primary',
  email: 'bg-warning/15 text-amber-800',
  landing: 'bg-primary/10 text-primary',
  social: 'bg-warning/15 text-amber-800',
  description: 'bg-primary/10 text-primary',
  ads: 'bg-warning/15 text-amber-800',
  cta: 'bg-primary/10 text-primary',
  seo: 'bg-warning/15 text-amber-800',
  review: 'bg-primary/10 text-primary',
};

function getErrorMessage(error: unknown, fallback: string) {
  const err = error as { response?: { data?: { message?: string } }; message?: string };
  return err.response?.data?.message || err.message || fallback;
}

function formatDate(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('vi-VN');
}

export function AdminTemplates() {
  const { data: templates = [], isLoading, isError } = useAdminTemplates();
  const { data: deletedTemplates = [] } = useAdminTemplateTrash();
  const createTemplate = useCreateAdminTemplate();
  const updateTemplate = useUpdateAdminTemplate();
  const removeTemplate = useRemoveAdminTemplate();
  const restoreTemplate = useRestoreAdminTemplate();
  const permanentDeleteTemplate = usePermanentDeleteAdminTemplate();

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortTemplates, setSortTemplates] = useState('created-desc');

  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState('');
  const [addCategory, setAddCategory] = useState('general');
  const [addType, setAddType] = useState('headline');
  const [addDesc, setAddDesc] = useState('');
  const [addPrompt, setAddPrompt] = useState('');

  const [editItem, setEditItem] = useState<AdminTemplate | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editType, setEditType] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPrompt, setEditPrompt] = useState('');
  const [editActive, setEditActive] = useState(true);

  const [confirmDelete, setConfirmDelete] = useState<AdminTemplate | null>(null);
  const [trashOpen, setTrashOpen] = useState(false);
  const [trashLoading, setTrashLoading] = useState<string | null>(null);

  const categoryOptions = useMemo(() => {
    const values = new Set([...CATEGORY_OPTIONS, ...templates.map(template => template.category).filter(Boolean)]);
    return Array.from(values);
  }, [templates]);

  const typeOptions = useMemo(() => {
    const values = new Set([...TYPE_OPTIONS, ...templates.map(template => template.type).filter(Boolean)]);
    return Array.from(values);
  }, [templates]);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    const filteredTemplates = templates.filter((template) => {
      const haystack = [template.name, template.description, template.category, template.type]
        .join(' ')
        .toLowerCase();
      const matchSearch = !keyword || haystack.includes(keyword);
      const matchCategory = filterCategory === 'all' || template.category === filterCategory;
      const matchType = filterType === 'all' || template.type === filterType;
      const matchStatus = filterStatus === 'all'
        || (filterStatus === 'active' && template.active)
        || (filterStatus === 'inactive' && !template.active)
        || (filterStatus === 'system' && template.isSystem)
        || (filterStatus === 'custom' && !template.isSystem);
      return matchSearch && matchCategory && matchType && matchStatus;
    });

    return [...filteredTemplates].sort((a, b) => {
      switch (sortTemplates) {
        case 'created-asc':
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case 'uses-desc':
          return b.uses - a.uses;
        case 'uses-asc':
          return a.uses - b.uses;
        case 'name-asc':
          return a.name.localeCompare(b.name, 'vi');
        case 'name-desc':
          return b.name.localeCompare(a.name, 'vi');
        case 'created-desc':
        default:
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });
  }, [filterCategory, filterStatus, filterType, search, sortTemplates, templates]);

  const pagination = usePagination(filtered, {
    initialPageSize: 6,
    resetKey: `${search}|${filterCategory}|${filterType}|${filterStatus}|${sortTemplates}`,
  });

  const resetAddForm = () => {
    setAddName('');
    setAddCategory('general');
    setAddType('headline');
    setAddDesc('');
    setAddPrompt('');
  };

  const openEdit = (template: AdminTemplate) => {
    setEditItem(template);
    setEditName(template.name);
    setEditCategory(template.category);
    setEditType(template.type);
    setEditDesc(template.description);
    setEditPrompt(template.systemPrompt);
    setEditActive(template.status === 'active');
  };

  const handleAdd = async () => {
    if (!addName.trim()) {
      toast.error('Vui lòng nhập tên template');
      return;
    }
    if (addPrompt.trim().length < 10) {
      toast.error('System prompt phải có ít nhất 10 ký tự');
      return;
    }

    try {
      await createTemplate.mutateAsync({
        name: addName.trim(),
        category: addCategory,
        type: addType,
        description: addDesc.trim(),
        systemPrompt: addPrompt.trim(),
        status: 'active',
        isSystem: true,
      });
      const createdName = addName.trim();
      resetAddForm();
      setShowAdd(false);
      toast.success(`Đã thêm template "${createdName}"`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không thêm được template'));
    }
  };

  const handleSaveEdit = async () => {
    if (!editItem) return;
    if (editPrompt.trim().length < 10) {
      toast.error('System prompt phải có ít nhất 10 ký tự');
      return;
    }

    try {
      await updateTemplate.mutateAsync({
        id: editItem.id,
        payload: {
          name: editName.trim(),
          category: editCategory,
          type: editType,
          description: editDesc.trim(),
          systemPrompt: editPrompt.trim(),
          status: editActive ? 'active' : 'inactive',
        },
      });
      setEditItem(null);
      toast.success('Đã cập nhật template');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không cập nhật được template'));
    }
  };

  const handleSoftDelete = async () => {
    if (!confirmDelete) return;

    try {
      await removeTemplate.mutateAsync(confirmDelete.id);
      toast.success('Đã chuyển template vào thùng rác');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không xóa được template'));
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleRestore = async (id: string | number) => {
    setTrashLoading(String(id));
    try {
      await restoreTemplate.mutateAsync(String(id));
      toast.success('Đã khôi phục template');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không khôi phục được template'));
    } finally {
      setTrashLoading(null);
    }
  };

  const handlePermanentDelete = async (id: string | number) => {
    setTrashLoading(String(id));
    try {
      await permanentDeleteTemplate.mutateAsync(String(id));
      toast.success('Đã xóa vĩnh viễn template');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không xóa vĩnh viễn được template'));
    } finally {
      setTrashLoading(null);
    }
  };

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Quản lý templates</h1>
            <p className="text-muted-foreground text-sm">Quản lý mẫu copy từ MongoDB qua API admin.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTrashOpen(true)}
              className="relative flex items-center gap-1.5 border border-border hover:border-red-300 hover:bg-destructive/10 text-muted-foreground hover:text-red-600 rounded-xl px-3 py-2 text-sm font-semibold transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Thùng rác
              {deletedTemplates.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive/100 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{deletedTemplates.length}</span>
              )}
            </button>
            <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl gap-2" onClick={() => setShowAdd(true)}>
              <FilePlus className="w-4 h-4" /> Thêm template
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Tổng templates', value: templates.length, icon: ScrollText, color: 'text-primary bg-primary/5' },
            { label: 'Đang hoạt động', value: templates.filter(template => template.active).length, icon: Zap, color: 'text-primary bg-primary/5' },
            { label: 'Lượt sử dụng', value: templates.reduce((total, template) => total + template.uses, 0).toLocaleString('vi-VN'), icon: BarChart3, color: 'text-primary bg-primary/5' },
            { label: 'System templates', value: templates.filter(template => template.isSystem).length, icon: ShieldCheck, color: 'text-amber-600 bg-warning/10' },
          ].map((item) => (
            <StatTile key={item.label} icon={item.icon} label={item.label} value={item.value} color={item.color} />
          ))}
        </div>

        <AdminFilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Tìm template..."
          rightSlot={
            <div className="flex flex-wrap gap-2">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Ngành" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả ngành</SelectItem>
                  {categoryOptions.map(category => <SelectItem key={category} value={category}>{category}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả loại</SelectItem>
                  {typeOptions.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="inactive">Tắt</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortTemplates} onValueChange={setSortTemplates}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="created-desc">Mới nhất</SelectItem>
                  <SelectItem value="created-asc">Cũ nhất</SelectItem>
                  <SelectItem value="uses-desc">Dùng nhiều nhất</SelectItem>
                  <SelectItem value="uses-asc">Dùng ít nhất</SelectItem>
                  <SelectItem value="name-asc">Tên A-Z</SelectItem>
                  <SelectItem value="name-desc">Tên Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          }
        />

        {isLoading ? (
          <Card className="p-16 text-center text-sm text-muted-foreground">Đang tải templates...</Card>
        ) : isError ? (
          <Card className="p-16 text-center text-sm text-destructive">Không tải được danh sách templates.</Card>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pagination.pageItems.map((template) => (
                <Card key={template.id} className={`p-5 hover:shadow-md transition-shadow ${!template.active ? 'opacity-60' : ''}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-bold text-foreground text-sm truncate">{template.name}</h3>
                        {!template.active && <Badge className="bg-muted text-muted-foreground border-0 text-[10px]">Tắt</Badge>}
                        {template.isSystem && <Badge className="bg-primary/10 text-primary border-0 text-[10px]">System</Badge>}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`border-0 text-[10px] ${typeBadgeColor[template.type] || 'bg-muted text-foreground/70'}`}>{template.type}</Badge>
                        <span className="text-xs text-muted-foreground">{template.category}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-2">{template.description || template.slug}</p>
                  <div className="flex items-center justify-between mb-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" />{template.uses.toLocaleString('vi-VN')} lượt dùng</span>
                    <span>{template.status}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(template)}
                      className="flex-1 flex items-center justify-center gap-1.5 h-8 border border-primary/20 text-primary hover:bg-primary/5 rounded-lg text-xs font-semibold transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Chỉnh sửa
                    </button>
                    <button
                      onClick={() => setConfirmDelete(template)}
                      className="w-8 h-8 flex items-center justify-center border border-red-200 text-red-500 hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
            <DataPagination
              page={pagination.page}
              pageSize={pagination.pageSize}
              totalItems={pagination.totalItems}
              totalPages={pagination.totalPages}
              startIndex={pagination.startIndex}
              endIndex={pagination.endIndex}
              onPageChange={pagination.setPage}
              onPageSizeChange={pagination.setPageSize}
              itemLabel="template"
            />
            {filtered.length === 0 && (
              <Card className="p-16 text-center">
                <ScrollText className="w-10 h-10 text-muted-foreground/60 mx-auto mb-3" />
                <p className="text-muted-foreground/80 text-sm">Không tìm thấy template nào.</p>
              </Card>
            )}
          </>
        )}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <FilePlus className="w-4 h-4 text-primary" />
              </div>
              Thêm template mới
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Tên template</Label>
              <Input value={addName} onChange={event => setAddName(event.target.value)} placeholder="VD: Google Ads Copy" className="h-10" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Ngành</Label>
                <Select value={addCategory} onValueChange={setAddCategory}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>{categoryOptions.map(category => <SelectItem key={category} value={category}>{category}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Loại</Label>
                <Select value={addType} onValueChange={setAddType}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>{TYPE_OPTIONS.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Mô tả</Label>
              <Textarea value={addDesc} onChange={event => setAddDesc(event.target.value)} placeholder="Mô tả ngắn về template này..." rows={3} className="resize-none" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">System prompt</Label>
              <Textarea value={addPrompt} onChange={event => setAddPrompt(event.target.value)} placeholder="Hướng dẫn model tạo nội dung cho template này..." rows={5} className="resize-none font-mono text-sm" />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setShowAdd(false)} className="flex-1 h-10 border border-border rounded-xl text-sm font-semibold text-foreground/70 hover:bg-surface-muted transition-colors">Hủy</button>
              <button onClick={() => void handleAdd()} disabled={!addName.trim() || createTemplate.isPending} className="flex-1 h-10 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-40 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center">
                {createTemplate.isPending ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : 'Thêm template'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Edit2 className="w-4 h-4 text-primary" />
              </div>
              Chỉnh sửa template
            </DialogTitle>
          </DialogHeader>
          {editItem && (
            <div className="space-y-4 pt-1">
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Tên template</Label>
                <Input value={editName} onChange={event => setEditName(event.target.value)} className="h-10" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Ngành</Label>
                  <Select value={editCategory} onValueChange={setEditCategory}>
                    <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>{categoryOptions.map(category => <SelectItem key={category} value={category}>{category}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Loại</Label>
                  <Select value={editType} onValueChange={setEditType}>
                    <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>{TYPE_OPTIONS.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Mô tả</Label>
                <Textarea value={editDesc} onChange={event => setEditDesc(event.target.value)} rows={3} className="resize-none" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">System prompt</Label>
                <Textarea value={editPrompt} onChange={event => setEditPrompt(event.target.value)} rows={5} className="resize-none font-mono text-sm" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Trạng thái</Label>
                <Select value={editActive ? 'true' : 'false'} onValueChange={value => setEditActive(value === 'true')}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Hoạt động</SelectItem>
                    <SelectItem value="false">Tắt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setEditItem(null)} className="flex-1 h-10 border border-border rounded-xl text-sm font-semibold text-foreground/70 hover:bg-surface-muted transition-colors">Hủy</button>
                <button onClick={() => void handleSaveEdit()} disabled={updateTemplate.isPending} className="flex-1 h-10 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center">
                  {updateTemplate.isPending ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : 'Lưu thay đổi'}
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => void handleSoftDelete()}
        title={`Xóa template "${confirmDelete?.name}"?`}
        description="Template sẽ vào thùng rác và có thể khôi phục."
        confirmLabel="Chuyển vào thùng rác"
        loading={removeTemplate.isPending}
      />

      <TrashBin
        open={trashOpen}
        onClose={() => setTrashOpen(false)}
        items={deletedTemplates.map(template => ({
          id: template.id,
          label: template.name,
          subLabel: template.category,
          deletedAt: formatDate(template.deletedAt),
        }))}
        onRestore={handleRestore}
        onPermanentDelete={handlePermanentDelete}
        entityName="template"
        loading={trashLoading}
      />
    </Layout>
  );
}
