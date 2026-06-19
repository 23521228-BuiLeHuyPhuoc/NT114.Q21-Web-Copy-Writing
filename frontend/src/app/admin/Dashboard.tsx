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
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-foreground/70">Tổng quan hệ thống CopyPro từ dữ liệu MongoDB.</p>
        </div>

        {loading ? (
          <Card className="p-16 text-center text-sm text-muted-foreground">Đang tải thống kê hệ thống...</Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.label} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`${stat.color} p-3 rounded-lg`}>
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                    <p className="text-sm text-foreground/70 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-2">{stat.sub}</p>
                  </Card>
                );
              })}
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4">Tăng trưởng theo tháng</h3>
                {monthlyData.length > 0 ? (
                  <LineChart
                    data={monthlyData}
                    xKey="name"
                    height={300}
                    series={[
                      { key: 'users', label: 'Users', color: '#16723a' },
                      { key: 'copies', label: 'Contents', color: '#d88a0b' },
                    ]}
                  />
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">Chưa có dữ liệu theo tháng.</div>
                )}
              </Card>

              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4">Content theo loại</h3>
                {contentTypeData.length > 0 ? (
                  <BarChart
                    data={contentTypeData}
                    xKey="name"
                    height={300}
                    series={[{ key: 'value', label: 'Contents', color: '#16723a' }]}
                  />
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">Chưa có dữ liệu content.</div>
                )}
              </Card>
            </div>

            <Card className="p-6 mb-8">
              <div className="flex items-center justify-between mb-5 gap-4">
                <div>
                  <h3 className="font-bold text-lg">Báo cáo sử dụng</h3>
                  <p className="text-sm text-muted-foreground">Theo dõi lượt generate, token và quota theo model, người dùng, ngày, tháng, năm.</p>
                </div>
                <span className="text-xs text-muted-foreground">Cập nhật cuối: {formatDate(usageTotals?.lastUsedAt || undefined)}</span>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
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
                      { key: 'generates', label: 'Generate', color: '#16723a' },
                      { key: 'quota', label: 'Quota units', color: '#d88a0b' },
                    ]}
                  />
                </TabsContent>
                <TabsContent value="month">
                  <BarChart
                    data={usageByMonth}
                    xKey="label"
                    height={260}
                    series={[
                      { key: 'generates', label: 'Generate', color: '#16723a' },
                      { key: 'quota', label: 'Quota units', color: '#d88a0b' },
                    ]}
                  />
                </TabsContent>
                <TabsContent value="year">
                  <BarChart
                    data={usageByYear}
                    xKey="label"
                    height={260}
                    series={[
                      { key: 'generates', label: 'Generate', color: '#16723a' },
                      { key: 'quota', label: 'Quota units', color: '#d88a0b' },
                    ]}
                  />
                </TabsContent>
              </Tabs>
            </Card>

            <Card className="p-6">
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
