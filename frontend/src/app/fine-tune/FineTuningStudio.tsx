import { useEffect, useState } from 'react';
import { Layout } from '@/app/components/Layout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import {
  Brain, Plus, Upload, Trash2, Play, CheckCircle2,
  Clock, Zap, Star, AlertCircle, Info, Lightbulb,
  FileText, BarChart3, Settings, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

import { useFineTuningModels, useTrainingLog, useExamplePairs } from '@/hooks/queries/useFineTuning';

export function CustomerFineTuningStudio() {
  const { data: modelsData } = useFineTuningModels();
  const { data: examplesData } = useExamplePairs();
  const { data: trainingLog = [] } = useTrainingLog();
  const [models, setModels] = useState<NonNullable<typeof modelsData>>([] as any);
  const [examples, setExamples] = useState<NonNullable<typeof examplesData>>([] as any);
  useEffect(() => { if (modelsData) setModels(modelsData); }, [modelsData]);
  useEffect(() => { if (examplesData) setExamples(examplesData); }, [examplesData]);
  const [newInput, setNewInput] = useState('');
  const [newOutput, setNewOutput] = useState('');
  const [newModelName, setNewModelName] = useState('');
  const [newModelIndustry, setNewModelIndustry] = useState('ecommerce');
  const [newModelBase, setNewModelBase] = useState('gpt4o');
  const [newModelDesc, setNewModelDesc] = useState('');
  const [trainProgress, setTrainProgress] = useState(55); // training epoch 3

  const addExample = () => {
    if (!newInput || !newOutput) { toast.error('Điền đầy đủ input và output'); return; }
    setExamples(prev => [...prev, { id: Date.now(), input: newInput, output: newOutput, industry: newModelIndustry }]);
    setNewInput('');
    setNewOutput('');
    toast.success('Đã thêm cặp ví dụ!');
  };

  const startTraining = () => {
    if (!newModelName) { toast.error('Nhập tên model'); return; }
    if (examples.length < 10) { toast.error(`Cần ít nhất 10 ví dụ (hiện có ${examples.length})`); return; }
    toast.success('Đã bắt đầu training! Quá trình mất khoảng 30-60 phút.');
  };

  const statusColor = (s: string) => ({ ready: 'bg-green-100 text-green-700', training: 'bg-stone-100 text-stone-700', failed: 'bg-red-100 text-red-700', pending: 'bg-gray-100 text-gray-600' }[s] ?? 'bg-gray-100 text-gray-600');
  const statusLabel = (s: string) => ({ ready: 'Sẵn sàng', training: 'Đang training', failed: 'Thất bại', pending: 'Chờ xử lý' }[s] ?? s);

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Fine-tuning Studio</h1>
          <p className="text-gray-600">Huấn luyện model AI theo giọng văn thương hiệu và ngành nghề của bạn</p>
        </div>

        {/* Info banner */}
        <Card className="p-4 mb-6 bg-gradient-to-r from-stone-50 to-stone-50 border-stone-200">
          <div className="flex gap-3">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1591453089816-0fbb971b454c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=80"
              alt="Fine-tuning" className="w-16 h-16 rounded-lg object-cover flex-shrink-0 hidden sm:block"
            />
            <div>
              <h3 className="font-semibold text-stone-900 mb-1">Fine-tuning là gì?</h3>
              <p className="text-sm text-stone-800">
                Fine-tuning cho phép bạn tinh chỉnh model AI (GPT-4o hoặc Llama 3.1) để viết copy đúng phong cách, tone giọng 
                và đặc thù ngành nghề của thương hiệu bạn. Cung cấp càng nhiều ví dụ tốt, model càng chính xác.
              </p>
            </div>
          </div>
        </Card>

        <Tabs defaultValue="models">
          <TabsList className="mb-6">
            <TabsTrigger value="models"><Brain className="w-4 h-4 mr-2" />Models của tôi</TabsTrigger>
            <TabsTrigger value="create"><Plus className="w-4 h-4 mr-2" />Tạo Model Mới</TabsTrigger>
            <TabsTrigger value="training"><BarChart3 className="w-4 h-4 mr-2" />Tiến Trình Training</TabsTrigger>
          </TabsList>

          {/* Models list */}
          <TabsContent value="models" className="space-y-4">
            {models.map(m => (
              <Card key={m.id} className="p-5">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-bold text-gray-900">{m.name}</h3>
                      <Badge className={`${statusColor(m.status)} border-0`}>{statusLabel(m.status)}</Badge>
                      <Badge className="bg-stone-100 text-stone-700 border-0 text-xs">{m.baseModel}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{m.desc}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                      <span><FileText className="w-3 h-3 inline mr-1" />{m.trainedOn} ví dụ training</span>
                      <span><Clock className="w-3 h-3 inline mr-1" />Tạo: {m.createdAt}</span>
                      {m.status === 'ready' && <span><Star className="w-3 h-3 inline mr-1 text-amber-500" />Độ chính xác: {m.accuracy}%</span>}
                    </div>
                    {m.status === 'training' && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Đang training...</span>
                          <span>55%</span>
                        </div>
                        <Progress value={55} className="h-2" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {m.status === 'ready' && (
                      <Button size="sm" className="bg-stone-600 hover:bg-stone-700 text-white" onClick={() => toast.success(`Đang áp dụng ${m.name}!`)}>
                        <Zap className="w-4 h-4 mr-1" /> Áp dụng
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => toast.success('Mở chi tiết model...')}>
                      <Settings className="w-4 h-4 mr-1" /> Chi tiết
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-500" onClick={() => { setModels(prev => prev.filter(x => x.id !== m.id)); toast.success('Đã xóa model'); }}>
                      <Trash2 className="w-4 h-4 mr-1" /> Xóa
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {models.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <Brain className="w-16 h-16 mx-auto mb-3 opacity-30" />
                <p>Chưa có model nào. Tạo model đầu tiên của bạn!</p>
              </div>
            )}
          </TabsContent>

          {/* Create model */}
          <TabsContent value="create" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Left: Config */}
              <Card className="p-6 space-y-4">
                <h3 className="font-bold text-gray-900">Cấu hình model</h3>
                <div>
                  <Label>Tên model</Label>
                  <Input placeholder="VD: Brand Voice E-commerce Q2 2026" value={newModelName} onChange={e => setNewModelName(e.target.value)} className="mt-2" />
                </div>
                <div>
                  <Label>Ngành nghề</Label>
                  <Select value={newModelIndustry} onValueChange={setNewModelIndustry}>
                    <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[['ecommerce','Thương Mại Điện Tử'],['realestate','Bất Động Sản'],['technology','Công Nghệ'],['fnb','Ẩm Thực'],['healthcare','Y Tế'],['education','Giáo Dục'],['finance','Tài Chính'],['fashion','Thời Trang']].map(([v, l]) => (
                        <SelectItem key={v} value={v}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Model nền (Base model)</Label>
                  <Select value={newModelBase} onValueChange={setNewModelBase}>
                    <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt4o">GPT-4o (Khuyên dùng)</SelectItem>
                      <SelectItem value="gpt35">GPT-3.5-turbo (Nhanh hơn)</SelectItem>
                      <SelectItem value="llama3">Llama 3.1 70B (Open source)</SelectItem>
                      <SelectItem value="llama3-8b">Llama 3.1 8B (Nhẹ hơn)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Mô tả mục tiêu training</Label>
                  <Textarea placeholder="VD: Model này cần viết copy theo phong cách cấp bách, sử dụng emoji, nhấn mạnh giá và ưu đãi..." value={newModelDesc} onChange={e => setNewModelDesc(e.target.value)} className="mt-2 min-h-20" />
                </div>

                {/* Training tips */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-sm font-semibold text-amber-800 flex items-center gap-1 mb-2">
                    <Lightbulb className="w-4 h-4" /> Mẹo training hiệu quả
                  </p>
                  <ul className="text-xs text-amber-800 space-y-1">
                    <li>• Tối thiểu 50–100 cặp ví dụ cho kết quả tốt</li>
                    <li>• Ví dụ đa dạng về loại sản phẩm và tone</li>
                    <li>• Output phải là copy tốt nhất của bạn</li>
                    <li>• Nhất quán về phong cách trong tất cả ví dụ</li>
                  </ul>
                </div>
              </Card>

              {/* Right: Training data */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Dữ liệu training</h3>
                  <Badge className={`border-0 ${examples.length >= 50 ? 'bg-green-100 text-green-700' : examples.length >= 10 ? 'bg-stone-100 text-stone-700' : 'bg-amber-100 text-amber-700'}`}>
                    {examples.length} ví dụ
                  </Badge>
                </div>

                {examples.length < 10 && (
                  <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                    <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800">Cần ít nhất <strong>10 cặp ví dụ</strong> để bắt đầu training. Hiện có {examples.length}.</p>
                  </div>
                )}

                <div className="space-y-3 max-h-48 overflow-y-auto mb-4">
                  {examples.map(ex => (
                    <div key={ex.id} className="border rounded-lg p-3 bg-gray-50">
                      <div className="flex justify-between items-start mb-1">
                        <Badge className="bg-stone-100 text-stone-700 border-0 text-xs">Input</Badge>
                        <button onClick={() => setExamples(prev => prev.filter(e => e.id !== ex.id))} className="text-gray-400 hover:text-red-500">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{ex.input}</p>
                      <Badge className="bg-green-100 text-green-700 border-0 text-xs mb-1">Output</Badge>
                      <p className="text-xs text-gray-800">{ex.output}</p>
                    </div>
                  ))}
                </div>

                {/* Add example */}
                <div className="border-t pt-4 space-y-2">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Thêm cặp ví dụ:</p>
                  <Input placeholder="Input: Thông tin sản phẩm, ngữ cảnh..." value={newInput} onChange={e => setNewInput(e.target.value)} className="text-sm" />
                  <Textarea placeholder="Output: Copy lý tưởng bạn muốn AI học theo..." value={newOutput} onChange={e => setNewOutput(e.target.value)} className="text-sm min-h-16" />
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => toast.success('Tính năng import file sẽ sớm có!')}>
                      <Upload className="w-4 h-4 mr-1" /> Import CSV
                    </Button>
                    <Button size="sm" className="flex-1 bg-stone-600 hover:bg-stone-700 text-white" onClick={addExample}>
                      <Plus className="w-4 h-4 mr-1" /> Thêm ví dụ
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Start training */}
            <div className="flex justify-end">
              <Button size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-10" onClick={startTraining}>
                <Play className="w-5 h-5 mr-2" /> Bắt đầu Fine-tuning
              </Button>
            </div>
          </TabsContent>

          {/* Training progress */}
          <TabsContent value="training">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Luxury Real Estate Voice</h3>
                  <Badge className="bg-stone-100 text-stone-700 border-0">Đang training</Badge>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Tiến trình tổng thể</span>
                    <span className="font-bold text-stone-600">{trainProgress}%</span>
                  </div>
                  <Progress value={trainProgress} className="h-3" />
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Ước tính hoàn thành: ~25 phút nữa
                  </p>
                </div>

                {/* Log */}
                <div className="space-y-2">
                  {trainingLog.map((log, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      {log.status === 'done' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      ) : log.status === 'running' ? (
                        <RefreshCw className="w-4 h-4 text-stone-500 animate-spin flex-shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-gray-200 flex-shrink-0" />
                      )}
                      <span className={`flex-1 ${log.status === 'done' ? 'text-gray-700' : log.status === 'running' ? 'text-stone-700 font-medium' : 'text-gray-400'}`}>{log.step}</span>
                      <span className="text-xs text-gray-400 font-mono">{log.time}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Metrics */}
              <Card className="p-6">
                <h3 className="font-bold text-gray-900 mb-4">Chỉ số training</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Training Loss', value: '0.342', prev: '1.245', trend: 'down', good: true },
                    { label: 'Validation Loss', value: '0.389', prev: '1.312', trend: 'down', good: true },
                    { label: 'Accuracy', value: '78.3%', prev: '45.2%', trend: 'up', good: true },
                    { label: 'BLEU Score', value: '0.72', prev: '0.41', trend: 'up', good: true },
                  ].map(m => (
                    <div key={m.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">{m.label}</span>
                      <div className="text-right">
                        <span className="font-bold text-gray-900">{m.value}</span>
                        <p className="text-xs text-gray-400">trước: {m.prev}</p>
                      </div>
                      <Badge className={`ml-3 border-0 text-xs ${m.good ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {m.trend === 'down' ? '↓ giảm' : '↑ tăng'}
                      </Badge>
                    </div>
                  ))}
                </div>

                <div className="mt-5 p-3 bg-stone-50 border border-stone-200 rounded-lg">
                  <p className="text-xs text-stone-800 flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    Loss thấp hơn và Accuracy cao hơn cho thấy model đang học tốt. BLEU Score đo mức độ tương đồng với output mẫu.
                  </p>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}