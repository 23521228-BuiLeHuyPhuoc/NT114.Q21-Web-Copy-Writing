import { Layout } from '@/app/components/Layout';
import { Card } from '@/app/components/ui/card';
import { TrendingUp, Users, FileText, Eye } from 'lucide-react';
import { AreaChart, PieChart } from '@/app/components/charts';

export function AdminAnalytics() {
  const dailyData = [
    { date: '1/1', views: 120, users: 45, copies: 78 },
    { date: '2/1', views: 150, users: 52, copies: 85 },
    { date: '3/1', views: 180, users: 61, copies: 92 },
    { date: '4/1', views: 200, users: 68, copies: 105 },
    { date: '5/1', views: 170, users: 59, copies: 88 },
    { date: '6/1', views: 220, users: 75, copies: 115 },
    { date: '7/1', views: 250, users: 82, copies: 125 },
  ];

  const industryPieData = [
    { name: 'E-commerce', value: 450, color: '#78716c' },
    { name: 'Bất động sản', value: 380, color: '#059669' },
    { name: 'Công nghệ', value: 320, color: '#f59e0b' },
    { name: 'Ẩm thực', value: 280, color: '#10b981' },
    { name: 'Khác', value: 270, color: '#6b7280' },
  ];

  const stats = [
    { label: 'Lượt truy cập', value: '12,345', icon: Eye, change: '+15%' },
    { label: 'Users hoạt động', value: '1,234', icon: Users, change: '+12%' },
    { label: 'Copy mới', value: '567', icon: FileText, change: '+8%' },
    { label: 'Tăng trưởng', value: '23%', icon: TrendingUp, change: '+5%' },
  ];

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thống Kê & Phân Tích</h1>
          <p className="text-gray-600">Dữ liệu chi tiết về hoạt động hệ thống</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Icon className="w-5 h-5 text-stone-600" />
                  <span className="text-sm font-semibold text-green-600">{stat.change}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </Card>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">Hoạt động 7 ngày qua</h3>
            <AreaChart
              data={dailyData}
              xKey="date"
              height={300}
              series={[{ key: 'views', label: 'Views', color: '#78716c', fill: true }]}
            />
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">Phân bố theo ngành</h3>
            <PieChart data={industryPieData} height={300} />
          </Card>
        </div>

        {/* Top Performing */}
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4">Templates phổ biến nhất</h3>
          <div className="space-y-4">
            {[
              { name: 'Facebook Ad - E-commerce', uses: 234, trend: '+12%' },
              { name: 'Email Marketing - Tech', uses: 189, trend: '+8%' },
              { name: 'Landing Page - Real Estate', uses: 156, trend: '+15%' },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-600">{item.uses} lượt sử dụng</p>
                </div>
                <span className="text-sm font-semibold text-green-600">{item.trend}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Layout>
  );
}
