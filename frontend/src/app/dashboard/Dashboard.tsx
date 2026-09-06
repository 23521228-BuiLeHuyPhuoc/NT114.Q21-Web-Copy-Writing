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
import { EditorialEmptyState } from '@/app/components/EditorialArtwork';

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
      <div className="mx-auto max-w-[1450px] p-4 md:p-7 lg:p-9">
        <header className="mb-8 grid gap-5 border-b-2 border-foreground pb-7 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="editorial-kicker mb-4 text-primary">Bàn làm việc hôm nay</p>
            <h1 className="studio-page-title text-foreground">Chào {user?.name?.split(' ').pop() || user?.name || 'bạn'}.</h1>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">Nội dung gần đây, quota và các công cụ đang dùng được đặt theo đúng thứ tự công việc.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="border border-warning/50 bg-warning/15 px-4 py-2 text-warning-foreground"><Crown className="mr-1.5 h-4 w-4" /> Gói {planName}</Badge>
            <Button size="lg" onClick={() => navigate('/generate')}><Wand2 className="h-4 w-4" /> Tạo bản thảo</Button>
          </div>
        </header>

        {(contentsError) && (
          <Card className="mb-6 border-destructive/30 bg-destructive/5 p-4">
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" /> Không tải được dữ liệu nội dung. Kiểm tra đăng nhập hoặc backend.
            </div>
          </Card>
        )}

        <div className="mb-7 grid border-l border-t border-foreground sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="min-w-0 border-b border-r border-foreground bg-card p-5">
                <div className="mb-5 flex items-center justify-between">
                  <Icon className="h-5 w-5 text-primary" />
                  {(contentsLoading || billingLoading) && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                </div>
                <p className="truncate font-display text-3xl font-bold text-foreground" title={stat.value}>{stat.value}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-wide text-foreground/75">{stat.label}</p>
                <p className="mt-2 truncate text-xs text-muted-foreground" title={stat.change}>{stat.change}</p>
              </div>
            );
          })}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(330px,.65fr)]">
          <div className="space-y-6">
            <Card className="overflow-hidden border-2 border-foreground">
              <div className="flex items-center justify-between border-b-2 border-foreground bg-foreground px-5 py-3 text-background">
                <h3 className="font-sans text-sm font-bold tracking-normal">Bản thảo gần đây</h3>
                <Button variant="ghost" className="h-auto p-0 text-xs text-background hover:bg-transparent hover:text-accent" onClick={() => navigate('/contents')}>Mở thư viện <ArrowRight className="h-3 w-3" /></Button>
              </div>
              <div className="divide-y divide-border">
              {recentContents.length === 0 ? (
                <EditorialEmptyState compact title="Chưa có bản thảo" description="Tạo nội dung đầu tiên để bắt đầu xây thư viện và theo dõi hoạt động tại dashboard." action={<Button size="sm" onClick={() => navigate('/generate')}>Tạo nội dung</Button>} />
              ) : recentContents.map((copy) => (
                <button key={copy.id} className="grid w-full gap-3 bg-card p-4 text-left transition-colors hover:bg-accent/15 md:grid-cols-[36px_minmax(0,1fr)_auto] md:items-center" onClick={() => navigate(`/contents/${copy.id}`)}>
                  <span className="flex h-9 w-9 items-center justify-center border border-foreground bg-accent"><Sparkles className="h-4 w-4 text-foreground" /></span>
                  <div className="min-w-0"><p className="truncate text-sm font-bold text-foreground">{copy.title}</p><div className="mt-1 flex flex-wrap items-center gap-2"><span className="text-xs text-muted-foreground">{formatRelativeTime(copy.createdAtRaw) || copy.createdAt}</span><Badge variant="outline" className="text-[10px]">{copy.model}</Badge></div></div>
                  <div className="text-left md:text-right"><p className="font-display text-xl font-bold text-primary">{copy.quality}%</p><p className="text-[10px] uppercase tracking-wide text-muted-foreground">chất lượng</p></div>
                </button>
              ))}
              </div>
            </Card>

            <Card className="border-2 border-foreground p-5">
              <div className="mb-4 flex items-center justify-between"><div><p className="editorial-kicker text-primary">Nhịp xuất bản</p><h3 className="mt-2 text-xl text-foreground">Nội dung tạo trong 7 ngày</h3></div><Badge variant="outline">{formatNumber(copiesThisWeek)} copy</Badge></div>
              <AreaChart data={weeklyData} xKey="day" height={190} series={[{ key: 'copies', label: 'Copy tạo', color: '#d64b32', fill: true }]} />
            </Card>
          </div>

          <aside className="space-y-6">
            <Card className="border-2 border-foreground bg-accent/35 p-5">
              <div className="mb-4 flex items-start justify-between gap-4"><div><p className="text-sm font-bold text-foreground">Quota gói {planName}</p><p className="mt-1 text-xs text-muted-foreground">{copyLimit < 0 ? `${formatNumber(copyUsed)} copy đã dùng` : `${formatNumber(copyUsed)} / ${quotaLimitLabel} copy đã dùng`}</p></div><span className="font-display text-2xl font-bold text-primary">{copyLimit < 0 ? '∞' : `${quotaPercent}%`}</span></div>
              <Progress value={copyLimit < 0 ? 100 : quotaPercent} className="h-3 border border-foreground" />
              <div className="mt-3 flex justify-between text-xs text-muted-foreground"><span>Còn {quotaRemaining}</span><span>{planPrice}</span></div>
              <p className="mt-4 border-t border-foreground/20 pt-3 text-[10px] uppercase tracking-wide text-muted-foreground">Hết hạn: {expiresLabel}</p>
            </Card>

            <div className="border-2 border-foreground bg-card">
              <div className="border-b-2 border-foreground px-5 py-3"><p className="text-sm font-bold text-foreground">Mở nhanh công cụ</p></div>
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button key={action.title} className="group flex w-full items-center gap-3 border-b border-border p-4 text-left last:border-b-0 hover:bg-accent/20" onClick={() => navigate(action.path)}>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-foreground bg-background group-hover:bg-accent"><Icon className="h-4 w-4 text-primary" /></span>
                    <span className="min-w-0 flex-1"><span className="block text-sm font-bold text-foreground">{action.title}</span><span className="mt-0.5 block truncate text-xs text-muted-foreground">{action.desc}</span></span>
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </button>
                );
              })}
            </div>

            <Card className="border-2 border-foreground p-5">
              <div className="mb-4 flex items-center justify-between"><h3 className="font-sans text-sm font-bold tracking-normal text-foreground">Model fine-tuned</h3>{modelsLoading ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : <Badge variant="outline">{formatNumber(activeFineTunedModels.length)} active</Badge>}</div>
              <div className="space-y-2">
                {activeFineTunedModels.slice(0, 4).map((model) => (
                  <button key={model.registryModelId || model.id} type="button" className="flex w-full items-center gap-2.5 border-l-2 border-success bg-success/5 p-3 text-left hover:bg-success/10" onClick={() => navigate('/fine-tune')}><span className="h-2 w-2 shrink-0 rounded-full bg-success" /><span className="min-w-0"><span className="block truncate text-xs font-bold text-foreground">{model.name}</span><span className="block truncate text-xs text-muted-foreground">{model.baseModel || model.provider || 'Ready'}</span></span></button>
                ))}
                {activeFineTunedModels.length === 0 && <p className="border border-dashed border-border p-4 text-xs leading-6 text-muted-foreground">Chưa có model active. Có {formatNumber(liveFineTuneJobs.length)} job đang chạy và {formatNumber(fineTuneQuotas?.datasetCount || 0)} dataset.</p>}
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </Layout>
  );
}
