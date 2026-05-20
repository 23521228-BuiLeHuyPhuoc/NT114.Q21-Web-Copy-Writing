import { Layout } from '@/app/components/Layout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, FileText, Calendar, Wand2, Copy,
  Eye, Download, Trash2, BarChart3, Star, Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';

const PROJECT = {
  id: '1', name: 'Campaign Hè 2026', desc: 'Toàn bộ copy cho chiến dịch sale mùa hè 2026, bao gồm Facebook Ads, Email marketing, Landing page và Social media posts.',
  industry: 'E-commerce', status: 'active', createdAt: '01/03/2026',
  stats: { total: 24, published: 18, draft: 6, avgQuality: 91 },
};

const PROJECT_CONTENTS = [
  { id: '1', title: 'Facebook Ad – Flash Sale Chính', type: 'Headline', quality: 94, model: 'GPT-4o', date: '23/03/2026', status: 'published' },
  { id: '2', title: 'Email Sequence – Ngày 1', type: 'Email', quality: 92, model: 'GPT-4o', date: '22/03/2026', status: 'published' },
  { id: '3', title: 'Landing Page Hero', type: 'Landing Page', quality: 96, model: 'Llama 3.1', date: '21/03/2026', status: 'published' },
  { id: '4', title: 'Social Post – Countdown', type: 'Social', quality: 88, model: 'GPT-4o', date: '20/03/2026', status: 'draft' },
  { id: '5', title: 'Mô tả SP Best Seller', type: 'Description', quality: 90, model: 'Fine-tuned', date: '19/03/2026', status: 'published' },
  { id: '6', title: 'Banner CTA', type: 'CTA', quality: 87, model: 'GPT-4o', date: '18/03/2026', status: 'draft' },
];

export function CustomerProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">
        <Button variant="ghost" className="mb-4 text-gray-600" onClick={() => navigate('/projects')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại dự án
        </Button>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-green-100 text-green-700 border-0">Đang hoạt động</Badge>
              <Badge className="bg-gray-100 text-gray-600 border-0">{PROJECT.industry}</Badge>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{PROJECT.name}</h1>
            <p className="text-sm text-gray-500 mt-1">{PROJECT.desc}</p>
          </div>
          <Button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white" onClick={() => navigate('/generate')}>
            <Plus className="w-4 h-4 mr-2" /> Thêm nội dung
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Tổng nội dung', value: PROJECT.stats.total, icon: FileText, color: 'text-green-600 bg-green-50' },
            { label: 'Đã xuất bản', value: PROJECT.stats.published, icon: Star, color: 'text-stone-600 bg-stone-50' },
            { label: 'Bản nháp', value: PROJECT.stats.draft, icon: Clock, color: 'text-amber-600 bg-amber-50' },
            { label: 'Chất lượng TB', value: PROJECT.stats.avgQuality + '%', icon: BarChart3, color: 'text-emerald-600 bg-emerald-50' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <Card key={i} className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${s.color}`}><Icon className="w-4 h-4" /></div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Progress */}
        <Card className="p-5 mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-900">Tiến độ dự án</span>
            <span className="text-sm text-green-700 font-semibold">75%</span>
          </div>
          <Progress value={75} className="h-2" />
          <p className="text-xs text-gray-500 mt-2">18/24 nội dung đã hoàn thành</p>
        </Card>

        {/* Contents */}
        <h2 className="text-lg font-bold text-gray-900 mb-4">Nội dung trong dự án</h2>
        <div className="space-y-3">
          {PROJECT_CONTENTS.map(item => (
            <Card key={item.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/contents/${item.id}`)}>
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
                  <FileText className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-gray-900 truncate">{item.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-gray-100 text-gray-600 border-0 text-xs">{item.type}</Badge>
                    <Badge className="bg-green-100 text-green-700 border-0 text-xs">{item.model}</Badge>
                    <span className="text-xs text-gray-400">{item.date}</span>
                  </div>
                </div>
                <Badge className={`border-0 text-xs ${item.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {item.status === 'published' ? 'Xuất bản' : 'Nháp'}
                </Badge>
                <span className="text-sm font-semibold text-green-600">⭐ {item.quality}%</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
