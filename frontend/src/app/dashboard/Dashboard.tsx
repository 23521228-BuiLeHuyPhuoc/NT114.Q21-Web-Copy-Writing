import { Layout } from '@/app/components/Layout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/contexts/AuthContext';
import {
  Wand2, FileText, TrendingUp, Clock, Sparkles, ArrowRight,
  Brain, Key, Crown, BarChart3, Star, Zap, History
} from 'lucide-react';
import { AreaChart } from '@/app/components/charts';

const WEEKLY_DATA = [
  { day: 'T2', copies: 4 }, { day: 'T3', copies: 7 }, { day: 'T4', copies: 3 },
  { day: 'T5', copies: 9 }, { day: 'T6', copies: 12 }, { day: 'T7', copies: 6 }, { day: 'CN', copies: 8 },
];

const RECENT_COPIES = [
  { title: 'Facebook Ad – Flash Sale Hè 2026', time: '2 giờ trước', industry: 'Thương Mại Điện Tử', model: 'GPT-4o', quality: 92 },
  { title: 'Landing Page – Căn Hộ The Grand', time: '5 giờ trước', industry: 'Bất Động Sản', model: 'Llama 3.1', quality: 95 },
  { title: 'Email Marketing – Ra Mắt SaaS V2', time: '1 ngày trước', industry: 'Công Nghệ', model: 'Fine-tuned', quality: 91 },
  { title: 'Social Media – Khai Trương Nhà Hàng', time: '2 ngày trước', industry: 'Ẩm Thực', model: 'GPT-3.5', quality: 87 },
];

export function CustomerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const stats = [
    { label: 'Copy đã tạo', value: '312', icon: FileText, color: 'bg-green-500', change: '+8 tuần này' },
    { label: 'Quota còn lại', value: '188', icon: Zap, color: 'bg-amber-500', change: '/ 500 tháng này' },
    { label: 'Model đang dùng', value: 'GPT-4o', icon: Brain, color: 'bg-stone-500', change: 'Fine-tuned sẵn sàng' },
    { label: 'Chất lượng TB', value: '91%', icon: Star, color: 'bg-amber-500', change: 'Top 15%' },
  ];

  const quickActions = [
    { title: 'AI Generator', desc: 'Tạo copy với GPT-4o, Llama 3.1 hoặc model fine-tuned của bạn', icon: Wand2, path: '/generate', color: 'from-green-500 to-emerald-600', cta: 'Tạo ngay' },
    { title: 'Fine-tuning Studio', desc: 'Huấn luyện AI theo giọng văn thương hiệu riêng', icon: Brain, path: '/fine-tune', color: 'from-stone-500 to-stone-600', cta: 'Khám phá' },
    { title: 'Thư Viện Template', desc: '100+ mẫu copy được tối ưu theo từng ngành nghề', icon: FileText, path: '/templates', color: 'from-amber-500 to-amber-600', cta: 'Xem mẫu' },
    { title: 'Kiểm Tra Đạo Văn', desc: 'Kiểm tra tính độc đáo nội dung AI trước khi xuất bản', icon: Key, path: '/plagiarism-check', color: 'from-stone-500 to-stone-600', cta: 'Kiểm tra' },
  ];

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Welcome */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Chào {user?.name?.split(' ').pop()} 👋</h1>
            <p className="text-gray-600">Sẵn sàng tạo copy marketing đỉnh cao hôm nay?</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-amber-100 text-amber-700 border-0 px-4 py-2">
              <Crown className="w-4 h-4 mr-1.5" /> Gói Pro
            </Badge>
            <Button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white" onClick={() => navigate('/generate')}>
              <Wand2 className="w-4 h-4 mr-2" /> Tạo Copy Ngay
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card key={i} className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`${stat.color} p-2.5 rounded-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                <p className="text-xs text-slate-500 mt-1">{stat.change}</p>
              </Card>
            );
          })}
        </div>

        {/* Quota usage */}
        <Card className="p-5 mb-8 bg-gradient-to-r from-amber-50 to-stone-50 border-amber-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-semibold text-gray-900">Quota tháng 3/2026</p>
              <p className="text-xs text-gray-600">312 / 500 copy đã dùng</p>
            </div>
            <Badge className="bg-amber-100 text-amber-700 border-0">62.4%</Badge>
          </div>
          <Progress value={62.4} className="h-2.5" />
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Còn 188 copy</span>
            <span>Reset: 01/04/2026</span>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <Card key={i} className="p-5 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(action.path)}>
                <div className={`bg-gradient-to-r ${action.color} p-3 rounded-xl w-fit mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-4">{action.desc}</p>
                <Button variant="link" className="p-0 h-auto text-stone-600 text-xs">
                  {action.cta} <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Card>
            );
          })}
        </div>

        {/* Charts + Recent */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Weekly chart */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Copy tạo trong tuần</h3>
              <Badge className="bg-stone-100 text-stone-700 border-0">+12% so với tuần trước</Badge>
            </div>
            <AreaChart
              data={WEEKLY_DATA}
              xKey="day"
              height={180}
              series={[{ key: 'copies', label: 'Copy tạo', color: '#78716c', fill: true }]}
            />
          </Card>

          {/* Recent copies */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Copy gần đây</h3>
              <Button variant="link" className="text-stone-600 text-xs p-0" onClick={() => navigate('/contents')}>
                Xem tất cả <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
            <div className="space-y-3">
              {RECENT_COPIES.map((copy, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="bg-stone-100 p-2 rounded-lg flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-stone-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{copy.title}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">{copy.time}</span>
                      <Badge className="bg-gray-100 text-gray-600 border-0 text-xs">{copy.model}</Badge>
                      <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">⭐{copy.quality}%</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* AI Models status */}
        <Card className="p-5 mt-6">
          <h3 className="font-semibold text-gray-900 mb-4">Model AI khả dụng</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: 'GPT-4o', status: 'online', latency: '~2s', color: 'bg-green-500', badge: 'Mặc định' },
              { name: 'GPT-3.5', status: 'online', latency: '~0.8s', color: 'bg-stone-500', badge: 'Nhanh' },
              { name: 'Llama 3.1 70B', status: 'online', latency: '~3s', color: 'bg-amber-500', badge: 'Open-source' },
              { name: 'Fine-tuned E-com', status: 'ready', latency: '~1.5s', color: 'bg-stone-500', badge: 'Custom' },
            ].map(m => (
              <div key={m.name} className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-lg border">
                <div className={`w-2 h-2 rounded-full ${m.color} flex-shrink-0`} />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">{m.name}</p>
                  <p className="text-xs text-gray-500">{m.latency}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Layout>
  );
}
