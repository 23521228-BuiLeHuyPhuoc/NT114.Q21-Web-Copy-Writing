import { useMemo } from 'react';
import { Layout } from '@/app/components/Layout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { useNavigate } from '@/lib/next-router-compat';
import { useAuth } from '@/app/contexts/AuthContext';
import { useContents } from '@/hooks/queries/useContents';
import { useMyBilling } from '@/hooks/queries/useBilling';
import { useFineTuneJobs, useFineTuneQuotas, useFineTuningModels } from '@/hooks/queries/useFineTuning';
import {
  Wand2, FileText, Sparkles, ArrowRight,
  Brain, Key, Crown, Star, Zap, Loader2, AlertCircle,
} from 'lucide-react';
import { AreaChart } from '@/app/components/charts';
import type { UiContent } from '@/services/contentService';

const WEEKDAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function formatNumber(value: number) {
  return Number(value || 0).toLocaleString('vi-VN');
}

function formatCurrency(value?: number) {
  const amount = Number(value || 0);
  if (amount <= 0) return 'Miễn phí';
  return `${amount.toLocaleString('vi-VN')}đ/tháng`;
}

function parseDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function getLastSevenDays() {
  const today = startOfDay(new Date());
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    return date;
  });
}

function isSameDay(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();
}

function formatRelativeTime(value?: string) {
  const date = parseDate(value);
  if (!date) return '';

  const diffMs = date.getTime() - Date.now();
  const absMs = Math.abs(diffMs);
  const formatter = new Intl.RelativeTimeFormat('vi-VN', { numeric: 'auto' });
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (absMs < minute) return 'vừa xong';
  if (absMs < hour) return formatter.format(Math.round(diffMs / minute), 'minute');
  if (absMs < day) return formatter.format(Math.round(diffMs / hour), 'hour');
  return formatter.format(Math.round(diffMs / day), 'day');
}

function getMostUsedModel(contents: UiContent[]) {
  const realContents = contents.filter((content) => !isSeedDemoModel(content.model));
  if (realContents.length === 0) return 'Chưa có dữ liệu thật';

  const modelCounts = new Map<string, number>();
  realContents.forEach((content) => {
    const model = content.model || 'Không rõ';
    modelCounts.set(model, (modelCounts.get(model) || 0) + 1);
  });

  return [...modelCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || 'Chưa có dữ liệu thật';
}

function isSeedDemoModel(value?: string) {
  const normalized = String(value || '').trim().toLowerCase();
  return normalized === 'demo seed' || normalized === 'demo-seed' || normalized.includes('demo seed');
}

function getBillingRatio(used: number, limit: number) {
  if (limit <= 0) return 0;
  return Math.min(100, Math.round((used / limit) * 1000) / 10);
}

function getRemainingQuota(used: number, limit: number) {
  if (limit < 0) return 'Chưa đặt';
  return formatNumber(Math.max(0, limit - used));
}

function getQualityAverage(contents: UiContent[]) {
  if (contents.length === 0) return 0;
  return Math.round(contents.reduce((sum, content) => sum + Number(content.quality || 0), 0) / contents.length);
}

function getRecentContents(contents: UiContent[]) {
  return [...contents]
    .sort((a, b) => (parseDate(b.createdAtRaw)?.getTime() || 0) - (parseDate(a.createdAtRaw)?.getTime() || 0))
    .slice(0, 5);
}

export function CustomerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: contents = [], isLoading: contentsLoading, isError: contentsError } = useContents({ fetchAll: true, limit: 100 });
  const { data: billingData, isLoading: billingLoading } = useMyBilling();
  const { data: fineTunedModels = [], isLoading: modelsLoading } = useFineTuningModels();
  const { data: fineTuneJobs = [] } = useFineTuneJobs();
  const { data: fineTuneQuotas } = useFineTuneQuotas();

  const weeklyData = useMemo(() => {
    const days = getLastSevenDays();
    return days.map((date) => ({
      day: WEEKDAY_LABELS[date.getDay()],
      copies: contents.filter((content) => {
        const createdAt = parseDate(content.createdAtRaw);
        return createdAt ? isSameDay(createdAt, date) : false;
      }).length,
    }));
  }, [contents]);

  const recentContents = useMemo(() => getRecentContents(contents), [contents]);
  const averageQuality = useMemo(() => getQualityAverage(contents), [contents]);
  const mostUsedModel = useMemo(() => getMostUsedModel(contents), [contents]);
  const copiesThisWeek = useMemo(() => weeklyData.reduce((sum, item) => sum + item.copies, 0), [weeklyData]);
  const productionFineTunedModels = fineTunedModels.filter(model => !isSeedDemoModel(`${model.name} ${model.baseModel} ${model.providerModelId || ''}`));
  const activeFineTunedModels = productionFineTunedModels.filter(model => model.isActive !== false);
  const readyFineTunedModels = productionFineTunedModels.filter(model => model.status === 'ready');
  const liveFineTuneJobs = fineTuneJobs.filter(job => job.status === 'training' || job.status === 'pending');

  const billing = billingData?.currentPlan;
  const copyUsed = Number(billing?.copyUsed || 0);
  const copyLimit = Number(billing?.copyLimit || 0);
  const quotaPercent = getBillingRatio(copyUsed, copyLimit);
  const planName = billing?.name || 'Free';
  const planPrice = formatCurrency(billing?.price);
  const expiresLabel = billing?.expiresAtLabel || billing?.renewDate || 'Chưa có ngày hết hạn';
  const quotaRemaining = getRemainingQuota(copyUsed, copyLimit);
  const quotaLimitLabel = copyLimit < 0 ? 'chưa đặt giới hạn' : formatNumber(copyLimit);

  const stats = [
    {
      label: 'Copy đã tạo',
      value: formatNumber(contents.length),
      icon: FileText,
      color: 'bg-primary/50',
      change: `${formatNumber(copiesThisWeek)} trong 7 ngày gần nhất`,
    },
    {
      label: 'Quota còn lại',
      value: quotaRemaining,
      icon: Zap,
      color: 'bg-warning/100',
      change: copyLimit < 0 ? 'Chưa đặt giới hạn copy' : `/ ${quotaLimitLabel} copy tháng này`,
    },
    {
      label: 'Model dùng nhiều nhất',
      value: mostUsedModel,
      icon: Brain,
      color: 'bg-primary/50',
      change: `${formatNumber(readyFineTunedModels.length)} fine-tuned sẵn sàng`,
    },
    {
      label: 'Chất lượng TB',
      value: contents.length ? `${averageQuality}%` : '0%',
      icon: Star,
      color: 'bg-warning/100',
      change: contents.length ? `Tính trên ${formatNumber(contents.length)} nội dung` : 'Chưa có dữ liệu',
    },
  ];

  const quickActions = [
    { title: 'AI Generator', desc: 'Tạo copy mới và lưu trực tiếp vào thư viện nội dung.', icon: Wand2, path: '/generate', color: 'from-green-500 to-emerald-600', cta: 'Tạo ngay' },
    { title: 'Fine-tuning Studio', desc: 'Theo dõi dataset, job huấn luyện và model tùy chỉnh của bạn.', icon: Brain, path: '/fine-tune', color: 'from-green-500 to-green-600', cta: 'Mở studio' },
    { title: 'Thư viện nội dung', desc: 'Xem, lọc và chỉnh sửa toàn bộ nội dung đã tạo.', icon: FileText, path: '/contents', color: 'from-amber-500 to-amber-600', cta: 'Xem nội dung' },
    { title: 'Kiểm tra đạo văn', desc: 'Kiểm tra tính độc đáo trước khi xuất bản nội dung.', icon: Key, path: '/plagiarism-check', color: 'from-green-500 to-green-600', cta: 'Kiểm tra' },
  ];

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Chào {user?.name?.split(' ').pop() || user?.name || 'bạn'}</h1>
            <p className="text-foreground/70">Tổng quan nội dung, quota và fine-tuning của tài khoản hiện tại.</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-warning/15 text-amber-800 border-0 px-4 py-2">
              <Crown className="w-4 h-4 mr-1.5" /> Gói {planName}
            </Badge>
            <Button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white" onClick={() => navigate('/generate')}>
              <Wand2 className="w-4 h-4 mr-2" /> Tạo Copy Ngay
            </Button>
          </div>
        </div>

        {(contentsError) && (
          <Card className="mb-6 border-destructive/30 bg-destructive/5 p-4">
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" /> Không tải được dữ liệu nội dung. Kiểm tra đăng nhập hoặc backend.
            </div>
          </Card>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`${stat.color} p-2.5 rounded-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  {(contentsLoading || billingLoading) && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                </div>
                <p className="text-2xl font-bold text-foreground truncate" title={stat.value}>{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                <p className="text-xs text-primary mt-1 truncate" title={stat.change}>{stat.change}</p>
              </Card>
            );
          })}
        </div>

        <Card className="p-5 mb-8 bg-gradient-to-r from-amber-50 to-green-50 border-amber-200">
          <div className="flex items-center justify-between mb-3 gap-4">
            <div>
              <p className="font-semibold text-foreground">Quota gói {planName}</p>
              <p className="text-xs text-foreground/70">
                {copyLimit < 0 ? `${formatNumber(copyUsed)} copy đã dùng - chưa đặt giới hạn` : `${formatNumber(copyUsed)} / ${quotaLimitLabel} copy đã dùng`}
              </p>
            </div>
            <div className="text-right">
              <Badge className="bg-warning/15 text-amber-800 border-0">{copyLimit < 0 ? 'Chưa đặt' : `${quotaPercent}%`}</Badge>
              <p className="mt-1 text-xs text-muted-foreground">{planPrice}</p>
            </div>
          </div>
          <Progress value={copyLimit < 0 ? 100 : quotaPercent} className="h-2.5" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Còn {quotaRemaining} copy</span>
            <span>Hết hạn: {expiresLabel}</span>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card key={action.title} className="p-5 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(action.path)}>
                <div className={`bg-gradient-to-r ${action.color} p-3 rounded-xl w-fit mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{action.title}</h3>
                <p className="text-xs text-foreground/70 leading-relaxed mb-4">{action.desc}</p>
                <Button variant="link" className="p-0 h-auto text-primary text-xs">
                  {action.cta} <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Card>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Copy tạo trong 7 ngày</h3>
              <Badge className="bg-primary/10 text-primary border-0">{formatNumber(copiesThisWeek)} copy</Badge>
            </div>
            <AreaChart
              data={weeklyData}
              xKey="day"
              height={180}
              series={[{ key: 'copies', label: 'Copy tạo', color: '#16723a', fill: true }]}
            />
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Copy gần đây</h3>
              <Button variant="link" className="text-primary text-xs p-0" onClick={() => navigate('/contents')}>
                Xem tất cả <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
            <div className="space-y-3">
              {recentContents.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Chưa có nội dung nào. Tạo copy đầu tiên để dashboard có dữ liệu.
                </div>
              ) : recentContents.map((copy) => (
                <div key={copy.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-muted transition-colors cursor-pointer" onClick={() => navigate(`/contents/${copy.id}`)}>
                  <div className="bg-primary/10 p-2 rounded-lg flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{copy.title}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground/80">{formatRelativeTime(copy.createdAtRaw) || copy.createdAt}</span>
                      <Badge className="bg-muted text-foreground/70 border-0 text-xs">{copy.model}</Badge>
                      <Badge className="bg-warning/15 text-amber-800 border-0 text-xs">{copy.quality}%</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-5 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Model fine-tuned</h3>
            {modelsLoading ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : (
              <Badge className="bg-primary/10 text-primary border-0">{formatNumber(activeFineTunedModels.length)} active</Badge>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {activeFineTunedModels.slice(0, 4).map((model) => (
              <button
                key={model.registryModelId || model.id}
                type="button"
                className="flex items-center gap-2.5 p-3 bg-surface-muted rounded-lg border text-left hover:border-primary/30 hover:bg-primary/5 transition-colors"
                onClick={() => navigate('/fine-tune')}
              >
                <div className="w-2 h-2 rounded-full bg-primary/50 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{model.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{model.baseModel || model.provider || 'Ready'}</p>
                </div>
              </button>
            ))}
            {activeFineTunedModels.length === 0 && (
              <div className="col-span-2 md:col-span-4 rounded-lg border border-dashed p-5 text-sm text-muted-foreground">
                Chưa có fine-tuned model active. Hiện có {formatNumber(liveFineTuneJobs.length)} job đang chạy và {formatNumber(fineTuneQuotas?.datasetCount || 0)} dataset.
              </div>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
}
