import { useMemo, useState } from 'react';
import { Layout } from '@/app/components/Layout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';
import { Label } from '@/app/components/ui/label';
import { Switch } from '@/app/components/ui/switch';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Cpu, Crown, DollarSign, Edit2, Plus, Trash2, Users, Zap } from 'lucide-react';
import { ConfirmDialog } from '@/app/components/admin/ConfirmDialog';
import { TrashBin } from '@/app/components/admin/TrashBin';
import { StatTile } from '@/app/components/admin/StatTile';
import { AdminFilterBar } from '@/app/components/admin/AdminFilterBar';
import { AdminTable } from '@/app/components/admin/AdminTable';
import { DataPagination } from '@/app/components/common/DataPagination';
import { usePagination } from '@/hooks/usePagination';
import {
  useAdminPlans,
  useAdminPlanTrash,
  useCreateAdminPlan,
  usePermanentDeleteAdminPlan,
  useRemoveAdminPlan,
  useRestoreAdminPlan,
  useUpdateAdminPlan,
} from '@/hooks/queries/useAdminPlans';
import type { AdminPlan } from '@/services/adminPlanService';
import { MODELS } from '@/mocks/generator';
import toast from 'react-hot-toast';

function getErrorMessage(error: unknown, fallback: string) {
  const err = error as { response?: { data?: { message?: string } }; message?: string };
  return err.response?.data?.message || err.message || fallback;
}

function parseBlankNumber(value: string, blankValue = -1) {
  if (value.trim() === '') return blankValue;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : blankValue;
}

function parseOptionalNumber(value: string) {
  if (value.trim() === '') return undefined;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
}

function splitLines(value: string) {
  return value.split('\n').map(line => line.trim()).filter(Boolean);
}

const FINE_TUNED_MODEL_ACCESS = 'fine-tuned';
const DEFAULT_LIMITED_MODELS = ['gemini-flash', 'gemini-flash-lite'];

const MODEL_ACCESS_OPTIONS = [
  ...MODELS.map(model => ({ id: model.id, name: model.name, badge: model.badge })),
  { id: FINE_TUNED_MODEL_ACCESS, name: 'Fine-tuned models', badge: 'Custom' },
];

const MODEL_ACCESS_LABELS = new Map(MODEL_ACCESS_OPTIONS.map(model => [model.id, model.name]));

function uniqueModels(models: string[]) {
  return Array.from(new Set(models.map(model => model.trim()).filter(Boolean)));
}

function formatAllowedModels(models: string[]) {
  const allowed = uniqueModels(models);
  if (allowed.length === 0) return 'Tất cả model';

  const labels = allowed.map(model => MODEL_ACCESS_LABELS.get(model) || model);
  if (labels.length <= 2) return labels.join(', ');
  return `${labels.slice(0, 2).join(', ')} +${labels.length - 2}`;
}

function formatLimit(value: number, label = '') {
  if (value === -1) return 'Unlimited';
  if (value === 0) return '-';
  return `${value.toLocaleString('vi-VN')}${label}`;
}

function formatPrice(value: number, currency = 'VND') {
  if (value === -1) return 'Liên hệ';
  if (value === 0) return 'Miễn phí';

  try {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${value.toLocaleString('vi-VN')} ${currency}`;
  }
}

function formatDate(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('vi-VN');
}

function ModelAccessSelector({
  allowedModels,
  onChange,
}: {
  allowedModels: string[];
  onChange: (models: string[]) => void;
}) {
  const allModels = allowedModels.length === 0;
  const selected = new Set(allowedModels);

  const toggleModel = (modelId: string) => {
    if (selected.has(modelId)) {
      onChange(allowedModels.filter(item => item !== modelId));
      return;
    }

    onChange(uniqueModels([...allowedModels, modelId]));
  };

  return (
    <div className="rounded-xl border border-border p-3 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Label className="text-xs text-muted-foreground uppercase tracking-wider block">Model được phép generate</Label>
          <p className="text-xs text-muted-foreground mt-1">Bật tất cả hoặc chọn model cụ thể cho gói này.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-foreground/70">Tất cả</span>
          <Switch
            checked={allModels}
            onCheckedChange={(checked) => onChange(checked ? [] : DEFAULT_LIMITED_MODELS)}
          />
        </div>
      </div>

      {!allModels && (
        <div className="grid gap-2 sm:grid-cols-2 max-h-56 overflow-y-auto pr-1">
          {MODEL_ACCESS_OPTIONS.map((modelOption) => (
            <label
              key={modelOption.id}
              className="flex items-start gap-2 rounded-lg border border-border p-2 text-left hover:bg-surface-muted cursor-pointer"
            >
              <Checkbox
                checked={selected.has(modelOption.id)}
                onCheckedChange={() => toggleModel(modelOption.id)}
                className="mt-0.5"
              />
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold text-foreground truncate">{modelOption.name}</span>
                <span className="block text-[11px] text-muted-foreground">{modelOption.badge}</span>
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminPlans() {
  const { data: plans = [], isLoading: plansLoading, isError: plansError } = useAdminPlans();
  const { data: trashPlans = [], isLoading: trashLoading } = useAdminPlanTrash();
  const createPlan = useCreateAdminPlan();
  const updatePlan = useUpdateAdminPlan();
  const removePlan = useRemoveAdminPlan();
  const restorePlan = useRestoreAdminPlan();
  const permanentDeletePlan = usePermanentDeleteAdminPlan();

  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState('');
  const [addPrice, setAddPrice] = useState('');
  const [addYearlyPrice, setAddYearlyPrice] = useState('');
  const [addCopy, setAddCopy] = useState('');
  const [addApi, setAddApi] = useState('');
  const [addApiFiveHours, setAddApiFiveHours] = useState('');
  const [addApiWeekly, setAddApiWeekly] = useState('');
  const [addFine, setAddFine] = useState('');
  const [addPlagiarism, setAddPlagiarism] = useState('');
  const [addSeats, setAddSeats] = useState('');
  const [addHistoryDays, setAddHistoryDays] = useState('');
  const [addDesc, setAddDesc] = useState('');
  const [addFeatures, setAddFeatures] = useState('');
  const [addExcludedFeatures, setAddExcludedFeatures] = useState('');
  const [addAllowedModels, setAddAllowedModels] = useState<string[]>([]);

  const [editItem, setEditItem] = useState<AdminPlan | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editYearlyPrice, setEditYearlyPrice] = useState('');
  const [editCopy, setEditCopy] = useState('');
  const [editApi, setEditApi] = useState('');
  const [editApiFiveHours, setEditApiFiveHours] = useState('');
  const [editApiWeekly, setEditApiWeekly] = useState('');
  const [editFine, setEditFine] = useState('');
  const [editPlagiarism, setEditPlagiarism] = useState('');
  const [editSeats, setEditSeats] = useState('');
  const [editHistoryDays, setEditHistoryDays] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editFeatures, setEditFeatures] = useState('');
  const [editExcludedFeatures, setEditExcludedFeatures] = useState('');
  const [editPopular, setEditPopular] = useState(false);
  const [editAllowedModels, setEditAllowedModels] = useState<string[]>([]);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterModel, setFilterModel] = useState('all');
  const [sortPlans, setSortPlans] = useState('sort-order');

  const [confirmDelete, setConfirmDelete] = useState<AdminPlan | null>(null);
  const [trashOpen, setTrashOpen] = useState(false);
  const [processingTrashId, setProcessingTrashId] = useState<string | null>(null);

  const totalRevenue = useMemo(() => (
    plans.reduce((total, plan) => total + (plan.monthlyPrice > 0 ? plan.monthlyPrice * plan.users : 0), 0)
  ), [plans]);

  const paidUsers = useMemo(() => (
    plans.filter(plan => plan.monthlyPrice > 0).reduce((total, plan) => total + plan.users, 0)
  ), [plans]);

  const planModelOptions = useMemo(() => {
    const ids = new Set(MODEL_ACCESS_OPTIONS.map(model => model.id));
    plans.forEach(plan => plan.allowedModels.forEach(model => ids.add(model)));
    return Array.from(ids).map(id => ({ id, name: MODEL_ACCESS_LABELS.get(id) || id }));
  }, [plans]);

  const filteredPlans = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const filtered = plans.filter((plan) => {
      const allowedModelText = plan.allowedModels.map(model => MODEL_ACCESS_LABELS.get(model) || model).join(' ');
      const matchSearch = !keyword || [
        plan.name,
        plan.slug,
        plan.description,
        allowedModelText,
      ].join(' ').toLowerCase().includes(keyword);
      const matchStatus = filterStatus === 'all'
        || (filterStatus === 'active' && plan.active)
        || (filterStatus === 'inactive' && !plan.active)
        || (filterStatus === 'popular' && plan.popular);
      const matchModel = filterModel === 'all'
        || (filterModel === 'unrestricted' && plan.allowedModels.length === 0)
        || plan.allowedModels.includes(filterModel);
      return matchSearch && matchStatus && matchModel;
    });

    return [...filtered].sort((a, b) => {
      switch (sortPlans) {
        case 'price-desc':
          return b.monthlyPrice - a.monthlyPrice;
        case 'price-asc':
          return a.monthlyPrice - b.monthlyPrice;
        case 'users-desc':
          return b.users - a.users;
        case 'users-asc':
          return a.users - b.users;
        case 'name-asc':
          return a.name.localeCompare(b.name, 'vi');
        case 'name-desc':
          return b.name.localeCompare(a.name, 'vi');
        case 'created-desc':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'created-asc':
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case 'sort-order':
        default:
          return a.sortOrder - b.sortOrder || a.monthlyPrice - b.monthlyPrice;
      }
    });
  }, [filterModel, filterStatus, plans, search, sortPlans]);

  const pagination = usePagination(filteredPlans, {
    initialPageSize: 10,
    resetKey: `${search}|${filterStatus}|${filterModel}|${sortPlans}|${plans.length}`,
  });

  const resetAddForm = () => {
    setAddName('');
    setAddPrice('');
    setAddYearlyPrice('');
    setAddCopy('');
    setAddApi('');
    setAddApiFiveHours('');
    setAddApiWeekly('');
    setAddFine('');
    setAddPlagiarism('');
    setAddSeats('');
    setAddHistoryDays('');
    setAddDesc('');
    setAddFeatures('');
    setAddExcludedFeatures('');
    setAddAllowedModels([]);
  };

  const openEdit = (plan: AdminPlan) => {
    setEditItem(plan);
    setEditName(plan.name);
    setEditPrice(plan.monthlyPrice === -1 ? '' : String(plan.monthlyPrice));
    setEditYearlyPrice(plan.yearlyPrice === -1 ? '' : String(plan.yearlyPrice));
    setEditCopy(plan.copyLimit === -1 ? '' : String(plan.copyLimit));
    setEditApi(plan.apiLimit === -1 ? '' : String(plan.apiLimit));
    setEditApiFiveHours(plan.apiLimitFiveHours === -1 ? '' : String(plan.apiLimitFiveHours));
    setEditApiWeekly(plan.apiLimitWeekly === -1 ? '' : String(plan.apiLimitWeekly));
    setEditFine(plan.fineTune === -1 ? '' : String(plan.fineTune));
    setEditPlagiarism(plan.plagiarismChecks === -1 ? '' : String(plan.plagiarismChecks));
    setEditSeats(plan.seats === -1 ? '' : String(plan.seats));
    setEditHistoryDays(plan.historyDays === -1 ? '' : String(plan.historyDays));
    setEditDesc(plan.description);
    setEditFeatures(plan.features.join('\n'));
    setEditExcludedFeatures(plan.excludedFeatures.join('\n'));
    setEditPopular(plan.popular);
    setEditAllowedModels(plan.allowedModels || []);
  };

  const handleAdd = async () => {
    if (!addName.trim()) return;

    try {
      await createPlan.mutateAsync({
        name: addName.trim(),
        description: addDesc.trim(),
        price: parseBlankNumber(addPrice, -1),
        yearlyPrice: parseOptionalNumber(addYearlyPrice),
        copyLimit: parseBlankNumber(addCopy, -1),
        apiLimit: parseBlankNumber(addApi, -1),
        apiLimitFiveHours: parseBlankNumber(addApiFiveHours, -1),
        apiLimitWeekly: parseBlankNumber(addApiWeekly, -1),
        fineTune: parseBlankNumber(addFine, -1),
        plagiarismChecks: parseBlankNumber(addPlagiarism, -1),
        seats: parseBlankNumber(addSeats, -1),
        historyDays: parseBlankNumber(addHistoryDays, -1),
        features: splitLines(addFeatures),
        excludedFeatures: splitLines(addExcludedFeatures),
        allowedModels: addAllowedModels,
        isActive: true,
      });
      const createdName = addName.trim();
      resetAddForm();
      setShowAdd(false);
      toast.success(`Đã tạo gói "${createdName}"`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không tạo được gói dịch vụ'));
    }
  };

  const handleSaveEdit = async () => {
    if (!editItem) return;

    try {
      await updatePlan.mutateAsync({
        id: editItem.id,
        payload: {
          name: editName.trim(),
          description: editDesc.trim(),
          price: parseBlankNumber(editPrice, -1),
          yearlyPrice: parseOptionalNumber(editYearlyPrice),
          copyLimit: parseBlankNumber(editCopy, -1),
          apiLimit: parseBlankNumber(editApi, -1),
          apiLimitFiveHours: parseBlankNumber(editApiFiveHours, -1),
          apiLimitWeekly: parseBlankNumber(editApiWeekly, -1),
          fineTune: parseBlankNumber(editFine, -1),
          plagiarismChecks: parseBlankNumber(editPlagiarism, -1),
          seats: parseBlankNumber(editSeats, -1),
          historyDays: parseBlankNumber(editHistoryDays, -1),
          features: splitLines(editFeatures),
          excludedFeatures: splitLines(editExcludedFeatures),
          allowedModels: editAllowedModels,
          isPopular: editPopular,
        },
      });
      setEditItem(null);
      toast.success('Đã cập nhật gói dịch vụ');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không cập nhật được gói dịch vụ'));
    }
  };

  const toggleActive = async (plan: AdminPlan) => {
    try {
      await updatePlan.mutateAsync({
        id: plan.id,
        payload: { isActive: !plan.active },
      });
      toast.success('Đã cập nhật trạng thái gói');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không cập nhật được trạng thái gói'));
    }
  };

  const handleSoftDelete = async () => {
    if (!confirmDelete) return;

    try {
      await removePlan.mutateAsync(confirmDelete.id);
      toast.success('Đã chuyển gói vào thùng rác');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không xóa được gói dịch vụ'));
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleRestore = async (id: string | number) => {
    setProcessingTrashId(String(id));
    try {
      await restorePlan.mutateAsync(String(id));
      toast.success('Đã khôi phục gói dịch vụ');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không khôi phục được gói dịch vụ'));
    } finally {
      setProcessingTrashId(null);
    }
  };

  const handlePermanentDelete = async (id: string | number) => {
    setProcessingTrashId(String(id));
    try {
      await permanentDeletePlan.mutateAsync(String(id));
      toast.success('Đã xóa vĩnh viễn gói dịch vụ');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không xóa vĩnh viễn được gói dịch vụ'));
    } finally {
      setProcessingTrashId(null);
    }
  };

  const isLoading = plansLoading || trashLoading;

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Quản lý gói dịch vụ</h1>
            <p className="text-muted-foreground text-sm">Dữ liệu được đọc trực tiếp từ MongoDB qua API admin.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTrashOpen(true)}
              className="relative flex items-center gap-1.5 border border-border hover:border-red-300 hover:bg-destructive/10 text-muted-foreground hover:text-red-600 rounded-xl px-3 py-2 text-sm font-semibold transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Thùng rác
              {trashPlans.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive/100 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{trashPlans.length}</span>
              )}
            </button>
            <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl" onClick={() => setShowAdd(true)}>
              <Plus className="w-4 h-4 mr-2" /> Tạo gói mới
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Tổng gói', value: plans.length, icon: Crown, color: 'text-primary bg-primary/5' },
            { label: 'Tổng subscribers', value: plans.reduce((total, plan) => total + plan.users, 0).toLocaleString('vi-VN'), icon: Users, color: 'text-primary bg-primary/5' },
            { label: 'Doanh thu ước tính', value: `${(totalRevenue / 1000000).toFixed(1)}M VND`, icon: DollarSign, color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Paid users', value: paidUsers.toLocaleString('vi-VN'), icon: Zap, color: 'text-primary bg-primary/5' },
          ].map((item) => (
            <StatTile key={item.label} icon={item.icon} label={item.label} value={item.value} color={item.color} />
          ))}
        </div>

        {isLoading ? (
          <Card className="p-16 text-center text-sm text-muted-foreground">Đang tải gói dịch vụ...</Card>
        ) : plansError ? (
          <Card className="p-16 text-center text-sm text-destructive">Không tải được danh sách gói dịch vụ.</Card>
        ) : (
          <>
            <AdminFilterBar
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder="Tìm gói, mô tả hoặc model..."
              rightSlot={
                <div className="flex flex-wrap gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
                      <SelectItem value="active">Đang bật</SelectItem>
                      <SelectItem value="inactive">Tạm tắt</SelectItem>
                      <SelectItem value="popular">Phổ biến</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterModel} onValueChange={setFilterModel}>
                    <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả model</SelectItem>
                      <SelectItem value="unrestricted">Tất cả model được phép</SelectItem>
                      {planModelOptions.map(model => (
                        <SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={sortPlans} onValueChange={setSortPlans}>
                    <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sort-order">Thứ tự hiển thị</SelectItem>
                      <SelectItem value="price-asc">Giá thấp đến cao</SelectItem>
                      <SelectItem value="price-desc">Giá cao đến thấp</SelectItem>
                      <SelectItem value="users-desc">Nhiều subscribers</SelectItem>
                      <SelectItem value="users-asc">Ít subscribers</SelectItem>
                      <SelectItem value="created-desc">Mới nhất</SelectItem>
                      <SelectItem value="created-asc">Cũ nhất</SelectItem>
                      <SelectItem value="name-asc">Tên A-Z</SelectItem>
                      <SelectItem value="name-desc">Tên Z-A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              }
            />
            <AdminTable
              empty={filteredPlans.length === 0 ? <div className="text-center py-12 text-muted-foreground/80 text-sm">Không tìm thấy gói dịch vụ phù hợp.</div> : undefined}
            >
              <TableHeader>
                <TableRow>
                  <TableHead>Gói</TableHead>
                  <TableHead>Giá</TableHead>
                  <TableHead>Giới hạn</TableHead>
                  <TableHead>Model generate</TableHead>
                  <TableHead>Subscribers</TableHead>
                  <TableHead className="text-right">Quản lý</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagination.pageItems.map((plan) => (
                  <TableRow key={plan.id} className={!plan.active ? 'opacity-60' : ''}>
                    <TableCell className="min-w-64">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{plan.name}</span>
                          {plan.popular && <Badge className="bg-warning/15 text-amber-800 border-0 text-xs">Phổ biến</Badge>}
                          {!plan.active && <Badge className="bg-muted text-muted-foreground border-0 text-xs">Tạm tắt</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground/80 mt-0.5">{plan.description || plan.slug}</p>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-36 whitespace-nowrap">
                      <div className="font-semibold text-foreground">{formatPrice(plan.monthlyPrice, plan.currency)}</div>
                      <div className="text-xs text-muted-foreground">Năm: {formatPrice(plan.yearlyPrice, plan.currency)}</div>
                    </TableCell>
                    <TableCell className="min-w-80 text-xs text-foreground/75">
                      <div className="grid gap-x-4 gap-y-1 sm:grid-cols-2">
                        <span>Copy/tháng: <strong className="font-semibold text-foreground">{formatLimit(plan.copyLimit)}</strong></span>
                        <span>Generate/tháng: <strong className="font-semibold text-foreground">{formatLimit(plan.apiLimit)}</strong></span>
                        <span>Generate/5h: <strong className="font-semibold text-foreground">{formatLimit(plan.apiLimitFiveHours)}</strong></span>
                        <span>Generate/tuần: <strong className="font-semibold text-foreground">{formatLimit(plan.apiLimitWeekly)}</strong></span>
                        <span>Fine-tune: <strong className="font-semibold text-foreground">{formatLimit(plan.fineTune)}</strong></span>
                        <span>Đạo văn: <strong className="font-semibold text-foreground">{formatLimit(plan.plagiarismChecks)}</strong></span>
                        <span>Seats: <strong className="font-semibold text-foreground">{formatLimit(plan.seats)}</strong></span>
                        <span>Lịch sử: <strong className="font-semibold text-foreground">{formatLimit(plan.historyDays, ' ngày')}</strong></span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-56 text-xs text-foreground/70" title={formatAllowedModels(plan.allowedModels)}>{formatAllowedModels(plan.allowedModels)}</TableCell>
                    <TableCell><Badge className="bg-primary/10 text-primary border-0">{plan.users}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Switch checked={plan.active} onCheckedChange={() => void toggleActive(plan)} />
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
            <DataPagination
              page={pagination.page}
              pageSize={pagination.pageSize}
              totalItems={pagination.totalItems}
              totalPages={pagination.totalPages}
              startIndex={pagination.startIndex}
              endIndex={pagination.endIndex}
              onPageChange={pagination.setPage}
              onPageSizeChange={pagination.setPageSize}
              itemLabel="gói"
            />
          </>
        )}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-2xl max-h-[calc(100vh-2rem)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Plus className="w-4 h-4 text-primary" />
              </div>
              Tạo gói mới
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Tên gói</Label>
              <Input value={addName} onChange={event => setAddName(event.target.value)} placeholder="VD: Team" className="h-10" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Mô tả</Label>
              <Input value={addDesc} onChange={event => setAddDesc(event.target.value)} placeholder="Dành cho..." className="h-10" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Giá/tháng</Label>
                <Input value={addPrice} onChange={event => setAddPrice(event.target.value)} placeholder="Trống = Liên hệ" className="h-10" type="number" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Giá/năm</Label>
                <Input value={addYearlyPrice} onChange={event => setAddYearlyPrice(event.target.value)} placeholder="Trống = tự tính" className="h-10" type="number" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Copy/tháng</Label>
                <Input value={addCopy} onChange={event => setAddCopy(event.target.value)} placeholder="Trống = Unlimited" className="h-10" type="number" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Quota generate/tháng</Label>
                <Input value={addApi} onChange={event => setAddApi(event.target.value)} placeholder="Trống = Unlimited" className="h-10" type="number" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Quota generate/5h</Label>
                <Input value={addApiFiveHours} onChange={event => setAddApiFiveHours(event.target.value)} placeholder="Trống = Unlimited" className="h-10" type="number" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Quota generate/tuần</Label>
                <Input value={addApiWeekly} onChange={event => setAddApiWeekly(event.target.value)} placeholder="Trống = Unlimited" className="h-10" type="number" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Fine-tune models</Label>
                <Input value={addFine} onChange={event => setAddFine(event.target.value)} placeholder="Trống = Unlimited" className="h-10" type="number" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Kiểm tra đạo văn/tháng</Label>
                <Input value={addPlagiarism} onChange={event => setAddPlagiarism(event.target.value)} placeholder="Trống = Unlimited" className="h-10" type="number" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Số ghế</Label>
                <Input value={addSeats} onChange={event => setAddSeats(event.target.value)} placeholder="Trống = Unlimited" className="h-10" type="number" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Lưu lịch sử (ngày)</Label>
                <Input value={addHistoryDays} onChange={event => setAddHistoryDays(event.target.value)} placeholder="Trống = Unlimited" className="h-10" type="number" />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Feature hiá»ƒn trÃªn pricing</Label>
                <Textarea value={addFeatures} onChange={event => setAddFeatures(event.target.value)} placeholder="Má»—i dÃ²ng lÃ  má»™t feature" className="min-h-28" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Feature khÃ´ng bao gá»“m</Label>
                <Textarea value={addExcludedFeatures} onChange={event => setAddExcludedFeatures(event.target.value)} placeholder="Má»—i dÃ²ng lÃ  má»™t feature bá»‹ táº¯t" className="min-h-28" />
              </div>
            </div>
            <ModelAccessSelector allowedModels={addAllowedModels} onChange={setAddAllowedModels} />
            <div className="flex gap-2 pt-1">
              <button onClick={() => setShowAdd(false)} className="flex-1 h-10 border border-border rounded-xl text-sm font-semibold text-foreground/70 hover:bg-surface-muted transition-colors">Hủy</button>
              <button onClick={() => void handleAdd()} disabled={!addName.trim() || createPlan.isPending} className="flex-1 h-10 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-40 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center">
                {createPlan.isPending ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : 'Tạo gói'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="max-w-2xl max-h-[calc(100vh-2rem)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Edit2 className="w-4 h-4 text-primary" />
              </div>
              Chỉnh sửa gói: {editItem?.name}
            </DialogTitle>
          </DialogHeader>
          {editItem && (
            <div className="space-y-4 pt-1">
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Tên gói</Label>
                <Input value={editName} onChange={event => setEditName(event.target.value)} className="h-10" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Mô tả</Label>
                <Input value={editDesc} onChange={event => setEditDesc(event.target.value)} className="h-10" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Giá/tháng</Label>
                  <Input value={editPrice} onChange={event => setEditPrice(event.target.value)} placeholder="Trống = Liên hệ" className="h-10" type="number" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Giá/năm</Label>
                  <Input value={editYearlyPrice} onChange={event => setEditYearlyPrice(event.target.value)} placeholder="Trống = giữ nguyên" className="h-10" type="number" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Copy/tháng</Label>
                  <Input value={editCopy} onChange={event => setEditCopy(event.target.value)} placeholder="Trống = Unlimited" className="h-10" type="number" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Quota generate/tháng</Label>
                  <Input value={editApi} onChange={event => setEditApi(event.target.value)} placeholder="Trống = Unlimited" className="h-10" type="number" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Quota generate/5h</Label>
                  <Input value={editApiFiveHours} onChange={event => setEditApiFiveHours(event.target.value)} placeholder="Trống = Unlimited" className="h-10" type="number" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Quota generate/tuần</Label>
                  <Input value={editApiWeekly} onChange={event => setEditApiWeekly(event.target.value)} placeholder="Trống = Unlimited" className="h-10" type="number" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Fine-tune</Label>
                  <Input value={editFine} onChange={event => setEditFine(event.target.value)} placeholder="Trống = Unlimited" className="h-10" type="number" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Kiểm tra đạo văn/tháng</Label>
                  <Input value={editPlagiarism} onChange={event => setEditPlagiarism(event.target.value)} placeholder="Trống = Unlimited" className="h-10" type="number" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Số ghế</Label>
                  <Input value={editSeats} onChange={event => setEditSeats(event.target.value)} placeholder="Trống = Unlimited" className="h-10" type="number" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Lưu lịch sử (ngày)</Label>
                  <Input value={editHistoryDays} onChange={event => setEditHistoryDays(event.target.value)} placeholder="Trống = Unlimited" className="h-10" type="number" />
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Feature hiá»ƒn trÃªn pricing</Label>
                  <Textarea value={editFeatures} onChange={event => setEditFeatures(event.target.value)} placeholder="Má»—i dÃ²ng lÃ  má»™t feature" className="min-h-28" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Feature khÃ´ng bao gá»“m</Label>
                  <Textarea value={editExcludedFeatures} onChange={event => setEditExcludedFeatures(event.target.value)} placeholder="Má»—i dÃ²ng lÃ  má»™t feature bá»‹ táº¯t" className="min-h-28" />
                </div>
              </div>
              <ModelAccessSelector allowedModels={editAllowedModels} onChange={setEditAllowedModels} />
              <div className="flex items-center justify-between bg-surface-muted rounded-xl p-3">
                <Label className="text-sm font-medium text-foreground/80">Đánh dấu phổ biến</Label>
                <Switch checked={editPopular} onCheckedChange={setEditPopular} />
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setEditItem(null)} className="flex-1 h-10 border border-border rounded-xl text-sm font-semibold text-foreground/70 hover:bg-surface-muted transition-colors">Hủy</button>
                <button onClick={() => void handleSaveEdit()} disabled={updatePlan.isPending} className="flex-1 h-10 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center">
                  {updatePlan.isPending ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : 'Lưu thay đổi'}
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
        title={`Xóa gói "${confirmDelete?.name}"?`}
        description={`Gói có ${confirmDelete?.users || 0} subscribers. Gói sẽ được chuyển vào thùng rác và có thể khôi phục.`}
        confirmLabel="Chuyển vào thùng rác"
        confirmVariant="warning"
        loading={removePlan.isPending}
      />

      <TrashBin
        open={trashOpen}
        onClose={() => setTrashOpen(false)}
        items={trashPlans.map(plan => ({
          id: plan.id,
          label: plan.name,
          subLabel: formatPrice(plan.monthlyPrice, plan.currency),
          deletedAt: formatDate(plan.deletedAt),
        }))}
        onRestore={handleRestore}
        onPermanentDelete={handlePermanentDelete}
        entityName="gói dịch vụ"
        loading={processingTrashId}
      />
    </Layout>
  );
}
