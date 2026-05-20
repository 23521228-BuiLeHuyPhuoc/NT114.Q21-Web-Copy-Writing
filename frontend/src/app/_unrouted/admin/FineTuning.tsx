import { useState } from 'react';
import { Layout } from '@/app/components/Layout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import {
  Brain, Play, Pause, Trash2, Eye, RefreshCw,
  CheckCircle2, Clock, AlertCircle, Upload, Download,
  BarChart3, Cpu, Database, Settings, Plus, Filter, Search
} from 'lucide-react';
import toast from 'react-hot-toast';
import { LineChart } from '@/app/components/charts';

const JOBS = [
  { id: 'ft-001', name: 'E-commerce Brand Voice v2', user: 'Nguyễn Văn A', baseModel: 'gpt-4o', status: 'completed', progress: 100, accuracy: 94.2, loss: 0.142, samples: 120, epochs: 5, started: '20/03/2026 09:00', finished: '20/03/2026 11:23', industry: 'ecommerce' },
  { id: 'ft-002', name: 'Luxury Real Estate v1', user: 'Trần Thị B', baseModel: 'llama-3.1-70b', status: 'running', progress: 55, accuracy: 78.3, loss: 0.342, samples: 85, epochs: 5, started: '23/03/2026 08:00', finished: null, industry: 'realestate' },
  { id: 'ft-003', name: 'Healthcare Compassionate v1', user: 'Lê Văn C', baseModel: 'gpt-4o', status: 'completed', progress: 100, accuracy: 91.0, loss: 0.189, samples: 95, epochs: 5, started: '10/03/2026 14:00', finished: '10/03/2026 16:45', industry: 'healthcare' },
  { id: 'ft-004', name: 'F&B Promotion Voice', user: 'Phạm Thị D', baseModel: 'gpt-3.5-turbo', status: 'queued', progress: 0, accuracy: 0, loss: 0, samples: 60, epochs: 3, started: '-', finished: null, industry: 'fnb' },
  { id: 'ft-005', name: 'Tech SaaS Copywriter', user: 'Nguyễn Văn A', baseModel: 'llama-3.1-8b', status: 'failed', progress: 34, accuracy: 0, loss: 0, samples: 45, epochs: 5, started: '18/03/2026 10:00', finished: '18/03/2026 10:45', industry: 'technology' },
];

const TRAINING_CHART = [
  { epoch: 'E1', trainLoss: 1.245, valLoss: 1.312, accuracy: 45.2 },
  { epoch: 'E2', trainLoss: 0.876, valLoss: 0.934, accuracy: 62.1 },
  { epoch: 'E3', trainLoss: 0.542, valLoss: 0.598, accuracy: 74.8 },
  { epoch: 'E4', trainLoss: 0.342, valLoss: 0.389, accuracy: 83.6 },
  { epoch: 'E5', trainLoss: 0.142, valLoss: 0.168, accuracy: 94.2 },
];

const DATASETS = [
  { id: 'ds-001', name: 'E-commerce Copy Dataset v2', samples: 1250, industry: 'ecommerce', created: '15/03/2026', size: '2.4 MB', quality: 'high' },
  { id: 'ds-002', name: 'Real Estate Templates Collection', samples: 890, industry: 'realestate', created: '10/03/2026', size: '1.8 MB', quality: 'high' },
  { id: 'ds-003', name: 'Healthcare Approved Copy Set', samples: 650, industry: 'healthcare', created: '05/03/2026', size: '1.2 MB', quality: 'medium' },
  { id: 'ds-004', name: 'Multi-Industry General V1', samples: 3400, industry: 'mixed', created: '01/03/2026', size: '6.1 MB', quality: 'high' },
];

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  completed: { label: 'Hoàn thành', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  running:   { label: 'Đang chạy',  color: 'bg-stone-100 text-stone-700',   icon: RefreshCw },
  queued:    { label: 'Hàng chờ',   color: 'bg-amber-100 text-amber-700', icon: Clock },
  failed:    { label: 'Thất bại',   color: 'bg-red-100 text-red-700',     icon: AlertCircle },
};

export function AdminFineTuning() {
  const [jobs, setJobs] = useState(JOBS);
  const [selectedJob, setSelectedJob] = useState(JOBS[0]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = jobs.filter(j => {
    const matchStatus = filterStatus === 'all' || j.status === filterStatus;
    const matchSearch = j.name.toLowerCase().includes(search.toLowerCase()) || j.user.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const stats = {
    total: jobs.length,
    running: jobs.filter(j => j.status === 'running').length,
    completed: jobs.filter(j => j.status === 'completed').length,
    failed: jobs.filter(j => j.status === 'failed').length,
  };

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Fine-tuning Manager</h1>
            <p className="text-gray-600">Quản lý tất cả jobs fine-tuning, dataset và model của hệ thống</p>
          </div>
          <Button className="bg-stone-600 hover:bg-stone-700 text-white" onClick={() => toast.success('Mở form tạo job mới...')}>
            <Plus className="w-4 h-4 mr-2" /> Tạo Job Mới
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Tổng jobs', value: stats.total, color: 'bg-stone-50 text-stone-700', icon: Brain },
            { label: 'Đang chạy', value: stats.running, color: 'bg-stone-50 text-stone-700', icon: RefreshCw },
            { label: 'Hoàn thành', value: stats.completed, color: 'bg-green-50 text-green-700', icon: CheckCircle2 },
            { label: 'Thất bại', value: stats.failed, color: 'bg-red-50 text-red-700', icon: AlertCircle },
          ].map(s => {
            const Icon = s.icon;
            return (
              <Card key={s.label} className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${s.color}`}><Icon className="w-5 h-5" /></div>
                <div><p className="text-2xl font-bold text-gray-900">{s.value}</p><p className="text-xs text-gray-500">{s.label}</p></div>
              </Card>
            );
          })}
        </div>

        <Tabs defaultValue="jobs">
          <TabsList className="mb-6">
            <TabsTrigger value="jobs"><Brain className="w-4 h-4 mr-2" />Training Jobs</TabsTrigger>
            <TabsTrigger value="monitor"><BarChart3 className="w-4 h-4 mr-2" />Monitor</TabsTrigger>
            <TabsTrigger value="datasets"><Database className="w-4 h-4 mr-2" />Datasets</TabsTrigger>
          </TabsList>

          {/* Jobs */}
          <TabsContent value="jobs">
            <div className="flex gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Tìm theo tên job, user..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="running">Đang chạy</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                  <SelectItem value="queued">Hàng chờ</SelectItem>
                  <SelectItem value="failed">Thất bại</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              {filtered.map(job => {
                const st = statusConfig[job.status];
                const StatusIcon = st.icon;
                return (
                  <Card key={job.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="font-semibold text-gray-900">{job.name}</span>
                          <Badge className={`${st.color} border-0 text-xs`}>
                            <StatusIcon className={`w-3 h-3 mr-1 ${job.status === 'running' ? 'animate-spin' : ''}`} />
                            {st.label}
                          </Badge>
                          <Badge className="bg-gray-100 text-gray-600 border-0 text-xs">{job.baseModel}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-3">
                          <span>User: <strong>{job.user}</strong></span>
                          <span>Ngành: {job.industry}</span>
                          <span>{job.samples} mẫu · {job.epochs} epochs</span>
                          <span>ID: {job.id}</span>
                          {job.started !== '-' && <span>Bắt đầu: {job.started}</span>}
                          {job.finished && <span>Xong: {job.finished}</span>}
                        </div>
                        {(job.status === 'running' || job.status === 'completed') && (
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-600">Tiến trình</span>
                              <span className="font-medium">{job.progress}%</span>
                            </div>
                            <Progress value={job.progress} className="h-2" />
                          </div>
                        )}
                        {job.status === 'completed' && (
                          <div className="flex gap-4 mt-2 text-xs">
                            <span className="text-green-600">Accuracy: <strong>{job.accuracy}%</strong></span>
                            <span className="text-stone-600">Val Loss: <strong>{job.loss}</strong></span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedJob(job); }}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        {job.status === 'running' && (
                          <Button variant="ghost" size="sm" onClick={() => toast.success('Đã tạm dừng job')}>
                            <Pause className="w-4 h-4" />
                          </Button>
                        )}
                        {job.status === 'failed' && (
                          <Button variant="ghost" size="sm" onClick={() => toast.success('Đang chạy lại...')}>
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        )}
                        {job.status === 'completed' && (
                          <Button variant="ghost" size="sm" onClick={() => toast.success('Đang triển khai model...')}>
                            <Play className="w-4 h-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="text-red-500" onClick={() => { setJobs(prev => prev.filter(j => j.id !== job.id)); toast.success('Đã xóa job'); }}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Monitor */}
          <TabsContent value="monitor">
            <div className="grid lg:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Chọn job để xem:</h3>
                <div className="space-y-2">
                  {jobs.filter(j => j.status === 'completed' || j.status === 'running').map(job => (
                    <button
                      key={job.id}
                      onClick={() => setSelectedJob(job)}
                      className={`w-full text-left p-3 rounded-lg border transition-all text-sm ${selectedJob.id === job.id ? 'border-stone-500 bg-stone-50' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <p className="font-medium text-gray-900 truncate">{job.name}</p>
                      <p className="text-xs text-gray-500">{job.user} · {job.baseModel}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <Card className="p-5">
                  <h3 className="font-semibold text-gray-900 mb-4">{selectedJob.name} — Training Curves</h3>
                  <LineChart
                    data={TRAINING_CHART}
                    xKey="epoch"
                    height={280}
                    series={[
                      { key: 'trainLoss', label: 'Train Loss', color: '#78716c' },
                      { key: 'valLoss', label: 'Val Loss', color: '#059669', dashed: true },
                      { key: 'accuracy', label: 'Accuracy %', color: '#f59e0b' },
                    ]}
                  />
                </Card>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Final Loss', value: selectedJob.loss || '—', color: 'bg-stone-50 text-stone-700' },
                    { label: 'Accuracy', value: selectedJob.accuracy ? `${selectedJob.accuracy}%` : '—', color: 'bg-green-50 text-green-700' },
                    { label: 'Samples', value: selectedJob.samples, color: 'bg-stone-50 text-stone-700' },
                  ].map(m => (
                    <Card key={m.label} className="p-4 text-center">
                      <div className={`text-xl font-bold ${m.color} rounded-lg py-2 mb-1`}>{m.value}</div>
                      <p className="text-xs text-gray-500">{m.label}</p>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Datasets */}
          <TabsContent value="datasets">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Dataset Library ({DATASETS.length})</h3>
              <Button size="sm" className="bg-stone-600 hover:bg-stone-700 text-white" onClick={() => toast.success('Upload dataset...')}>
                <Upload className="w-4 h-4 mr-2" /> Upload Dataset
              </Button>
            </div>
            <div className="space-y-3">
              {DATASETS.map(ds => (
                <Card key={ds.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-stone-100 p-2.5 rounded-lg">
                      <Database className="w-5 h-5 text-stone-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{ds.name}</p>
                      <div className="flex gap-3 text-xs text-gray-500 mt-0.5">
                        <span>{ds.samples.toLocaleString()} mẫu</span>
                        <span>{ds.size}</span>
                        <span>Ngành: {ds.industry}</span>
                        <span>Tạo: {ds.created}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={ds.quality === 'high' ? 'bg-green-100 text-green-700 border-0' : 'bg-amber-100 text-amber-700 border-0'}>
                      {ds.quality === 'high' ? '⭐ Cao' : '📊 Trung bình'}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => toast.success('Đang tải dataset...')}><Download className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => toast.success('Đã xóa dataset!')}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
