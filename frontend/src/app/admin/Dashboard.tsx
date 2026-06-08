import { useEffect, useMemo, useState } from 'react';
import { Layout } from '@/app/components/Layout';
import { Card } from '@/app/components/ui/card';
import { Activity, FileText, Users, Zap } from 'lucide-react';
import { BarChart, LineChart } from '@/app/components/charts';
import { adminDashboardService, type AdminDashboardData } from '@/services/adminDashboardService';
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

  const statCards = useMemo(() => [
    { label: 'Tổng người dùng', value: formatNumber(stats?.totalUsers || 0), sub: `${formatNumber(stats?.activeUsers || 0)} đang hoạt động`, icon: Users, color: 'bg-primary/10 text-primary' },
    { label: 'Nội dung đã tạo', value: formatNumber(stats?.totalContents || 0), sub: `${formatNumber(stats?.deletedContents || 0)} trong thùng rác`, icon: FileText, color: 'bg-emerald-100 text-emerald-700' },
    { label: 'Lượt generate', value: formatNumber(stats?.totalUsage || 0), sub: `${formatNumber(stats?.totalTokens || 0)} tokens`, icon: Zap, color: 'bg-amber-100 text-amber-700' },
    { label: 'Audit hôm nay', value: formatNumber(stats?.auditEventsToday || 0), sub: `${formatNumber(stats?.warningsToday || 0)} warning, ${formatNumber(stats?.errorsToday || 0)} error`, icon: Activity, color: 'bg-teal-100 text-teal-700' },
  ], [stats]);

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
                      <p className="text-xs text-muted-foreground truncate">{item.user?.email || '-'} · {item.type} · {item.modelUsed}</p>
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
