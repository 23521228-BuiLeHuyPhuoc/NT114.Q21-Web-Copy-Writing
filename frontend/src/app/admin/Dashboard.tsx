import { Layout } from '@/app/components/Layout';
import { Card } from '@/app/components/ui/card';
import { Users, FileText, TrendingUp, DollarSign } from 'lucide-react';
import { BarChart, LineChart } from '@/app/components/charts';

export function AdminDashboard() {
  const stats = [
    { label: 'Tổng Users', value: '1,234', change: '+12%', icon: Users, color: 'bg-stone-500' },
    { label: 'Copy đã tạo', value: '5,678', change: '+8%', icon: FileText, color: 'bg-green-500' },
    { label: 'Lượt truy cập', value: '12,345', change: '+15%', icon: TrendingUp, color: 'bg-stone-500' },
    { label: 'Doanh thu', value: '45.2M', change: '+23%', icon: DollarSign, color: 'bg-amber-500' },
  ];

  const monthlyData = [
    { name: 'T1', users: 120, copies: 450 },
    { name: 'T2', users: 180, copies: 620 },
    { name: 'T3', users: 250, copies: 890 },
    { name: 'T4', users: 320, copies: 1100 },
    { name: 'T5', users: 280, copies: 950 },
    { name: 'T6', users: 400, copies: 1234 },
  ];

  const industryData = [
    { name: 'E-commerce', value: 450 },
    { name: 'Bất động sản', value: 380 },
    { name: 'Công nghệ', value: 320 },
    { name: 'Ẩm thực', value: 280 },
    { name: 'Khác', value: 270 },
  ];

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Tổng quan hệ thống CopyPro</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-emerald-600">{stat.change}</span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </Card>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">Tăng trưởng theo tháng</h3>
            <LineChart
              data={monthlyData}
              xKey="name"
              height={300}
              series={[
                { key: 'users', label: 'Users', color: '#78716c' },
                { key: 'copies', label: 'Copies', color: '#059669' },
              ]}
            />
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">Copy theo ngành nghề</h3>
            <BarChart
              data={industryData}
              xKey="name"
              height={300}
              series={[{ key: 'value', label: 'Copies', color: '#f59e0b' }]}
            />
          </Card>
        </div>
      </div>
    </Layout>
  );
}
