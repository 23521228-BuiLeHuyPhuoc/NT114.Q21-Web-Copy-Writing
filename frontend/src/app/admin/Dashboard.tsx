import { useEffect, useMemo, useState } from 'react';
import { Layout } from '@/app/components/Layout';
import { Card } from '@/app/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Activity, Database, FileText, Gauge, UserRound, Users, Zap } from 'lucide-react';
import { BarChart, LineChart } from '@/app/components/charts';
import { adminDashboardService, type AdminDashboardData, type AdminUsageTimeStat } from '@/services/adminDashboardService';
import toast from 'react-hot-toast';

function formatNumber(value: number) {
  return value.toLocaleString('vi-VN');
}

function formatDate(value?: string) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function getInitial(value?: string) {
  return (value || '?').trim().charAt(0).toUpperCase() || '?';
}

function getUsageChart(data: AdminUsageTimeStat[]) {
  return data.map((item) => ({
    ...item,
    generates: item.count,
    quota: item.quotaUnits,
  }));
}

export function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadStats() {
      setLoading(true);
      try {
        const nextData = await adminDashboardService.getStats();
        if (mounted) setData(nextData);
      } catch (error) {
        const err = error as { response?: { data?: { message?: string } }; message?: string };
        toast.error(err.response?.data?.message || err.message || 'Không tải được thống kê admin');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadStats();
    return () => { mounted = false; };
  }, []);

  const stats = data?.stats;
  const monthlyData = data?.monthlyData || [];
  const contentTypeData = data?.contentTypeData || [];
  const usageReport = data?.usageReport;
  const usageTotals = usageReport?.totals;
  const usageByDay = getUsageChart(usageReport?.byDay || []);
  const usageByMonth = getUsageChart(usageReport?.byMonth || []);
  const usageByYear = getUsageChart(usageReport?.byYear || []);

  const statCards = useMemo(() => [
    { label: 'Tổng người dùng', value: formatNumber(stats?.totalUsers || 0), sub: `${formatNumber(stats?.activeUsers || 0)} đang hoạt động`, icon: Users, color: 'bg-primary/10 text-primary' },
    { label: 'Nội dung đã tạo', value: formatNumber(stats?.totalContents || 0), sub: `${formatNumber(stats?.deletedContents || 0)} trong thùng rác`, icon: FileText, color: 'bg-emerald-100 text-emerald-700' },
    { label: 'Lượt generate', value: formatNumber(usageTotals?.count || stats?.totalUsage || 0), sub: `${formatNumber(usageTotals?.totalTokens || stats?.totalTokens || 0)} tokens`, icon: Zap, color: 'bg-amber-100 text-amber-700' },
    { label: 'Audit hôm nay', value: formatNumber(stats?.auditEventsToday || 0), sub: `${formatNumber(stats?.warningsToday || 0)} warning, ${formatNumber(stats?.errorsToday || 0)} error`, icon: Activity, color: 'bg-teal-100 text-teal-700' },
  ], [stats, usageTotals]);

  return (
    <Layout>
      <div className="mx-auto max-w-[1500px] p-4 md:p-7 lg:p-9">
        <div className="mb-6 border-b-2 border-foreground pb-5">
          <p className="editorial-kicker mb-3 text-primary">Editorial Operations</p>
          <h1 className="studio-page-title text-foreground">Tổng quan hệ thống</h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">Dữ liệu vận hành, sử dụng model và nội dung gần đây từ hệ thống CopyPro.</p>
        </div>

        {loading ? (
          <Card className="paper-noise border-2 border-foreground p-16 text-center text-sm text-muted-foreground">Đang tải dữ liệu vận hành...</Card>
        ) : (
          <>
            <div className="mb-8 grid border-l border-t border-foreground md:grid-cols-2 lg:grid-cols-4">
              {statCards.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="border-b border-r border-foreground bg-card p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`${stat.color} border border-foreground p-2.5`}>
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                    <p className="text-sm text-foreground/70 mb-1">{stat.label}</p>
                    <p className="font-display text-3xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-2">{stat.sub}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="border-2 border-foreground p-6">
                <h3 className="font-bold text-lg mb-4">Tăng trưởng theo tháng</h3>
                {monthlyData.length > 0 ? (
                  <LineChart
                    data={monthlyData}
                    xKey="name"
                    height={300}
                    series={[
                      { key: 'users', label: 'Users', color: '#d64b32' },
                      { key: 'copies', label: 'Contents', color: '#1f6f78' },
                    ]}
                  />
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">Chưa có dữ liệu theo tháng.</div>
                )}
              </Card>

              <Card className="border-2 border-foreground p-6">
                <h3 className="font-bold text-lg mb-4">Content theo loại</h3>
                {contentTypeData.length > 0 ? (
                  <BarChart
                    data={contentTypeData}
                    xKey="name"
                    height={300}
                    series={[{ key: 'value', label: 'Contents', color: '#d64b32' }]}
                  />
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">Chưa có dữ liệu content.</div>
                )}
              </Card>
            </div>

            <Card className="mb-8 border-2 border-foreground p-6">
              <div className="flex items-center justify-between mb-5 gap-4">
                <div>
                  <h3 className="font-bold text-lg">Báo cáo sử dụng</h3>
                  <p className="text-sm text-muted-foreground">Theo dõi lượt generate, token và quota theo model, người dùng, ngày, tháng, năm.</p>
                </div>
                <span className="text-xs text-muted-foreground">Cập nhật cuối: {formatDate(usageTotals?.lastUsedAt || undefined)}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 min-[1100px]:grid-cols-4">
                {[
                  { label: 'Tổng lượt generate', value: formatNumber(usageTotals?.count || 0), icon: Zap, color: 'bg-amber-100 text-amber-700' },
                  { label: 'Tổng token', value: formatNumber(usageTotals?.totalTokens || 0), icon: Database, color: 'bg-primary/10 text-primary' },
                  { label: 'Quota units', value: formatNumber(usageTotals?.quotaUnits || 0), icon: Gauge, color: 'bg-emerald-100 text-emerald-700' },
                  { label: 'Người dùng phát sinh', value: formatNumber(usageTotals?.activeUsers || 0), icon: UserRound, color: 'bg-teal-100 text-teal-700' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-lg border border-border bg-surface-muted p-4">
                      <div className={'mb-3 inline-flex rounded-lg p-2 ' + item.color}><Icon className="h-4 w-4" /></div>
                      <p className="text-2xl font-bold text-foreground">{item.value}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{item.label}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div className="min-w-0 rounded-lg border border-border">
                  <div className="border-b border-border px-4 py-3">
                    <h4 className="text-sm font-semibold text-foreground">Theo model</h4>
                  </div>
                  <div className="divide-y divide-border">
                    {(usageReport?.byModel || []).map((item) => (
                      <div key={item.model} className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 px-4 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground" title={item.modelDisplayName || item.model}>{item.modelDisplayName || item.model}</p>
                          <p className="truncate text-xs text-muted-foreground">{item.model} · {formatNumber(item.users)} người dùng</p>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          <p className="font-semibold text-foreground">{formatNumber(item.count)} lượt</p>
                          <p>{formatNumber(item.totalTokens)} tokens</p>
                        </div>
                      </div>
                    ))}
                    {(usageReport?.byModel || []).length === 0 && (
                      <div className="px-4 py-10 text-center text-sm text-muted-foreground">Chưa có dữ liệu model.</div>
                    )}
                  </div>
                </div>

                <div className="min-w-0 rounded-lg border border-border">
                  <div className="border-b border-border px-4 py-3">
                    <h4 className="text-sm font-semibold text-foreground">Theo người dùng</h4>
                  </div>
                  <div className="divide-y divide-border">
                    {(usageReport?.byUser || []).map((item) => (
                      <div key={item.userId} className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 px-4 py-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar className="h-9 w-9 rounded-lg">
                            <AvatarImage src={item.avatar || undefined} alt={item.name} className="object-cover" />
                            <AvatarFallback className="rounded-lg bg-primary/10 text-xs font-bold text-primary">{getInitial(item.name || item.email)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{item.email || 'Không có email'}</p>
                          </div>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          <p className="font-semibold text-foreground">{formatNumber(item.count)} lượt</p>
                          <p>{formatNumber(item.totalTokens)} tokens</p>
                        </div>
                      </div>
                    ))}
                    {(usageReport?.byUser || []).length === 0 && (
                      <div className="px-4 py-10 text-center text-sm text-muted-foreground">Chưa có dữ liệu người dùng.</div>
                    )}
                  </div>
                </div>
              </div>

              <Tabs defaultValue="day" className="mt-6">
                <TabsList className="mb-4 flex-wrap h-auto gap-1">
                  <TabsTrigger value="day">Theo ngày</TabsTrigger>
                  <TabsTrigger value="month">Theo tháng</TabsTrigger>
                  <TabsTrigger value="year">Theo năm</TabsTrigger>
                </TabsList>
                <TabsContent value="day">
                  <BarChart
                    data={usageByDay}
                    xKey="label"
                    height={260}
                    series={[
                      { key: 'generates', label: 'Generate', color: '#d64b32' },
                      { key: 'quota', label: 'Quota units', color: '#1f6f78' },
                    ]}
                  />
                </TabsContent>
                <TabsContent value="month">
                  <BarChart
                    data={usageByMonth}
                    xKey="label"
                    height={260}
                    series={[
                      { key: 'generates', label: 'Generate', color: '#d64b32' },
                      { key: 'quota', label: 'Quota units', color: '#1f6f78' },
                    ]}
                  />
                </TabsContent>
                <TabsContent value="year">
                  <BarChart
                    data={usageByYear}
                    xKey="label"
                    height={260}
                    series={[
                      { key: 'generates', label: 'Generate', color: '#d64b32' },
                      { key: 'quota', label: 'Quota units', color: '#1f6f78' },
                    ]}
                  />
                </TabsContent>
              </Tabs>
            </Card>

            <Card className="border-2 border-foreground p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Nội dung gần đây</h3>
                <span className="text-xs text-muted-foreground">{data?.recentContents?.length || 0} bản mới nhất</span>
              </div>
              <div className="space-y-3">
                {(data?.recentContents || []).map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4 border-b border-border last:border-0 pb-3 last:pb-0">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.user?.email || '-'} · {item.type} · {item.modelDisplayName || item.modelUsed}</p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground flex-shrink-0">
                      <p>{formatNumber(item.wordCount || 0)} từ</p>
                      <p>{formatDate(item.createdAt)}</p>
                    </div>
                  </div>
                ))}
                {(data?.recentContents || []).length === 0 && (
                  <div className="py-10 text-center text-sm text-muted-foreground">Chưa có nội dung nào.</div>
                )}
              </div>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
}
