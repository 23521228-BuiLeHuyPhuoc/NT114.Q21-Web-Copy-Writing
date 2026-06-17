import { useMemo, useState } from 'react';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { AdminFilterBar } from '@/app/components/admin/AdminFilterBar';
import { ConfirmDialog } from '@/app/components/admin/ConfirmDialog';
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
import { DataPagination } from '@/app/components/common/DataPagination';
import { usePagination } from '@/hooks/usePagination';
import {
  useAdminGenerateOptions,
  useCreateGenerateOption,
  useRemoveGenerateOption,
  useUpdateGenerateOption,
} from '@/hooks/queries/useGenerateOptions';
import type { GenerateOption, GenerateOptionGroup } from '@/services/generateOptionService';

interface Props {
  group: GenerateOptionGroup;
  title: string;
  description: string;
  noun: string;
  iconHint: string;
  colorHint?: string;
}

interface FormState {
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  order: string;
  isActive: boolean;
}

const emptyForm: FormState = {
  name: '',
  slug: '',
  description: '',
  icon: '',
  color: '',
  order: '0',
  isActive: true,
};

function getErrorMessage(error: unknown, fallback: string) {
  const err = error as { response?: { data?: { message?: string } }; message?: string };
  return err.response?.data?.message || err.message || fallback;
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

function formFromOption(option: GenerateOption): FormState {
  return {
    name: option.name,
    slug: option.slug,
    description: option.description,
    icon: option.icon,
    color: option.color,
    order: String(option.order || 0),
    isActive: option.isActive,
  };
}

function payloadFromForm(form: FormState) {
  return {
    name: form.name.trim(),
    slug: form.slug.trim() || slugify(form.name),
    description: form.description.trim(),
    icon: form.icon.trim(),
    color: form.color.trim(),
    order: Number(form.order) || 0,
    isActive: form.isActive,
  };
}

function OptionForm({ form, setForm, iconHint, colorHint }: {
  form: FormState;
  setForm: (form: FormState) => void;
  iconHint: string;
  colorHint?: string;
}) {
  const setField = <K extends keyof FormState>(field: K, value: FormState[K]) => setForm({ ...form, [field]: value });

  return (
    <div className="space-y-3 pt-1">
      <Input value={form.name} onChange={event => setForm({ ...form, name: event.target.value, slug: slugify(event.target.value) })} placeholder="Tên hiển thị" />
      <div className="grid grid-cols-2 gap-3">
        <Input value={form.slug} onChange={event => setField('slug', slugify(event.target.value))} placeholder="slug" className="font-mono text-sm" />
        <Input value={form.order} onChange={event => setField('order', event.target.value)} type="number" min={0} placeholder="Thứ tự" />
      </div>
      <Textarea value={form.description} onChange={event => setField('description', event.target.value)} placeholder="Mô tả" rows={3} className="resize-none" />
      <div className="grid grid-cols-2 gap-3">
        <Input value={form.icon} onChange={event => setField('icon', event.target.value)} placeholder={iconHint} />
        <Input value={form.color} onChange={event => setField('color', event.target.value)} placeholder={colorHint || 'bg-emerald-500'} />
      </div>
      <div className="flex items-center justify-between rounded-xl border border-border p-3">
        <span className="text-sm font-semibold text-foreground">Hiển thị trong Generate</span>
        <Switch checked={form.isActive} onCheckedChange={checked => setField('isActive', checked)} />
      </div>
    </div>
  );
}

export function GenerateOptionsManager({ group, title, description, noun, iconHint, colorHint }: Props) {
  const { data: options = [], isLoading, isError } = useAdminGenerateOptions(group);
  const createOption = useCreateGenerateOption(group);
  const updateOption = useUpdateGenerateOption(group);
  const removeOption = useRemoveGenerateOption(group);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortOptions, setSortOptions] = useState('order-asc');
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<FormState>(emptyForm);
  const [editItem, setEditItem] = useState<GenerateOption | null>(null);
  const [editForm, setEditForm] = useState<FormState>(emptyForm);
  const [deleteItem, setDeleteItem] = useState<GenerateOption | null>(null);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const filteredOptions = options.filter((option) => {
      const matchSearch = !keyword || [option.name, option.slug, option.description, option.icon]
        .join(' ')
        .toLowerCase()
        .includes(keyword);
      const matchStatus = filterStatus === 'all'
        || (filterStatus === 'active' && option.isActive)
        || (filterStatus === 'inactive' && !option.isActive);
      return matchSearch && matchStatus;
    });

    return [...filteredOptions].sort((a, b) => {
      switch (sortOptions) {
        case 'order-desc':
          return b.order - a.order;
        case 'name-asc':
          return a.name.localeCompare(b.name, 'vi');
        case 'name-desc':
          return b.name.localeCompare(a.name, 'vi');
        case 'created-desc':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'created-asc':
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case 'order-asc':
        default:
          return a.order - b.order;
      }
    });
  }, [filterStatus, options, search, sortOptions]);

  const pagination = usePagination(filtered, {
    initialPageSize: 10,
    resetKey: `${search}|${filterStatus}|${sortOptions}`,
  });

  const openEdit = (option: GenerateOption) => {
    setEditItem(option);
    setEditForm(formFromOption(option));
  };

  const saveAdd = async () => {
    if (!addForm.name.trim()) return toast.error(`Vui lòng nhập tên ${noun}`);
    try {
      await createOption.mutateAsync(payloadFromForm(addForm));
      setAddForm(emptyForm);
      setAddOpen(false);
      toast.success(`Đã thêm ${noun}`);
    } catch (error) {
      toast.error(getErrorMessage(error, `Không thêm được ${noun}`));
    }
  };

  const saveEdit = async () => {
    if (!editItem) return;
    if (!editForm.name.trim()) return toast.error(`Vui lòng nhập tên ${noun}`);
    try {
      await updateOption.mutateAsync({ id: editItem.id, payload: payloadFromForm(editForm) });
      setEditItem(null);
      toast.success(`Đã cập nhật ${noun}`);
    } catch (error) {
      toast.error(getErrorMessage(error, `Không cập nhật được ${noun}`));
    }
  };

  const toggleActive = async (option: GenerateOption) => {
    try {
      await updateOption.mutateAsync({ id: option.id, payload: { isActive: !option.isActive } });
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không cập nhật được trạng thái'));
    }
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;
    try {
      await removeOption.mutateAsync(deleteItem.id);
      toast.success(`Đã xóa ${noun}`);
    } catch (error) {
      toast.error(getErrorMessage(error, `Không xóa được ${noun}`));
    } finally {
      setDeleteItem(null);
    }
  };

  const activeCount = options.filter(option => option.isActive).length;
  const dialogSaving = createOption.isPending || updateOption.isPending;

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">{title}</h1>
            <p className="text-muted-foreground text-sm">{description}</p>
          </div>
          <Button onClick={() => setAddOpen(true)} className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl gap-2">
            <Plus className="w-4 h-4" /> Thêm {noun}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <Card className="p-4"><p className="text-xs text-muted-foreground uppercase font-semibold">Tổng số</p><p className="text-2xl font-bold mt-1">{options.length}</p></Card>
          <Card className="p-4"><p className="text-xs text-muted-foreground uppercase font-semibold">Đang hiển thị</p><p className="text-2xl font-bold text-primary mt-1">{activeCount}</p></Card>
        </div>

        <AdminFilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder={`Tìm ${noun}...`}
          className="mb-5"
          rightSlot={
            <div className="flex flex-wrap gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="active">Đang hiển thị</SelectItem>
                  <SelectItem value="inactive">Tạm tắt</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortOptions} onValueChange={setSortOptions}>
                <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="order-asc">Thứ tự tăng dần</SelectItem>
                  <SelectItem value="order-desc">Thứ tự giảm dần</SelectItem>
                  <SelectItem value="created-desc">Mới nhất</SelectItem>
                  <SelectItem value="created-asc">Cũ nhất</SelectItem>
                  <SelectItem value="name-asc">Tên A-Z</SelectItem>
                  <SelectItem value="name-desc">Tên Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          }
        />

        {isLoading ? <Card className="p-12 text-center text-sm text-muted-foreground">Đang tải dữ liệu...</Card> : null}
        {isError ? <Card className="p-12 text-center text-sm text-destructive">Không tải được dữ liệu cấu hình Generate.</Card> : null}
        {!isLoading && !isError ? (
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Tên</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Icon</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagination.pageItems.map(option => (
                    <TableRow key={option.id} className={!option.isActive ? 'opacity-60' : ''}>
                      <TableCell className="text-sm text-muted-foreground">{option.order || '-'}</TableCell>
                      <TableCell><p className="font-semibold text-sm">{option.name}</p><p className="text-xs text-muted-foreground line-clamp-1">{option.description}</p></TableCell>
                      <TableCell><code className="text-xs bg-muted px-2 py-0.5 rounded-md">{option.slug}</code></TableCell>
                      <TableCell><span className="text-xs font-mono">{option.icon || '-'}</span>{option.color ? <span className={`inline-block ml-2 w-3 h-3 rounded ${option.color}`} /> : null}</TableCell>
                      <TableCell><div className="flex items-center gap-2"><Switch checked={option.isActive} onCheckedChange={() => void toggleActive(option)} /><Badge variant="outline">{option.isActive ? 'Hiển thị' : 'Tạm tắt'}</Badge></div></TableCell>
                      <TableCell><div className="flex justify-end gap-1"><button onClick={() => openEdit(option)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary/5 text-primary"><Edit2 className="w-3.5 h-3.5" /></button><button onClick={() => setDeleteItem(option)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-destructive/10 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button></div></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {filtered.length === 0 ? <div className="text-center py-12 text-muted-foreground/80 text-sm">Không tìm thấy dữ liệu.</div> : null}
          </Card>
        ) : null}
        {!isLoading && !isError ? (
          <DataPagination
            page={pagination.page}
            pageSize={pagination.pageSize}
            totalItems={pagination.totalItems}
            totalPages={pagination.totalPages}
            startIndex={pagination.startIndex}
            endIndex={pagination.endIndex}
            onPageChange={pagination.setPage}
            onPageSizeChange={pagination.setPageSize}
            itemLabel={noun}
          />
        ) : null}
      </div>

      <Dialog open={addOpen} onOpenChange={(open) => { setAddOpen(open); if (!open) setAddForm(emptyForm); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Thêm {noun}</DialogTitle></DialogHeader>
          <OptionForm form={addForm} setForm={setAddForm} iconHint={iconHint} colorHint={colorHint} />
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setAddOpen(false)}>Hủy</Button>
            <Button className="flex-1" onClick={() => void saveAdd()} disabled={dialogSaving || !addForm.name.trim()}>{createOption.isPending ? 'Đang lưu...' : 'Thêm'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editItem)} onOpenChange={(open) => { if (!open) setEditItem(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Chỉnh sửa {noun}</DialogTitle></DialogHeader>
          <OptionForm form={editForm} setForm={setEditForm} iconHint={iconHint} colorHint={colorHint} />
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setEditItem(null)}>Hủy</Button>
            <Button className="flex-1" onClick={() => void saveEdit()} disabled={dialogSaving || !editForm.name.trim()}>{updateOption.isPending ? 'Đang lưu...' : 'Lưu'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteItem)}
        onClose={() => setDeleteItem(null)}
        onConfirm={confirmDelete}
        loading={removeOption.isPending}
        title={`Xóa ${deleteItem?.name || noun}?`}
        description="Mục này sẽ bị ẩn khỏi trang Generate và chuyển vào thùng rác backend."
        confirmLabel="Xóa"
      />
    </Layout>
  );
}
