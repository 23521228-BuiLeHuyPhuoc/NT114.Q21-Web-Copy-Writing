import { useState } from 'react';
import { Layout } from '@/app/components/Layout';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Slider } from '@/app/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Switch } from '@/app/components/ui/switch';
import {
  Cpu, Settings, Play, Pause, BarChart3, Zap,
  CheckCircle2, Clock, AlertCircle, RefreshCw,
  Globe, Lock, TrendingUp, Eye, Edit2, Save, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { BarChart } from '@/app/components/charts';
import { ConfirmDialog } from '@/app/components/admin/ConfirmDialog';
import { TrashBin } from '@/app/components/admin/TrashBin';
import { StatTile } from '@/app/components/admin/StatTile';

const MODELS = [
  {
    id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', type: 'cloud', status: 'active',
    contextWindow: '128K', latency: 2.1, cost: 0.015, accuracy: 96.4, usage: 68,
    config: { temperature: 0.7, maxTokens: 2000, topP: 0.9, frequencyPenalty: 0.3 },
    systemPrompt: 'Bạn là chuyên gia copywriting hàng đầu Việt Nam với 10 năm kinh nghiệm. Tạo copy marketing chuyên nghiệp, sáng tạo và hiệu quả cho từng ngành nghề cụ thể.',
    features: ['Function calling', 'Vision', 'JSON mode', '128K context'],
    icon: '🌐',
  },
  {
    id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI', type: 'cloud', status: 'active',
    contextWindow: '16K', latency: 0.8, cost: 0.002, accuracy: 88.2, usage: 22,
    config: { temperature: 0.8, maxTokens: 1500, topP: 0.95, frequencyPenalty: 0.2 },
    systemPrompt: 'Bạn là chuyên gia copywriting. Tạo nội dung marketing ngắn gọn, súc tích và thu hút cho doanh nghiệp Việt Nam.',
    features: ['Fast response', '16K context', 'Cost-effective'],
    icon: '⚡',
  },
  {
    id: 'llama-3.1-70b', name: 'Llama 3.1 70B', provider: 'Meta (Self-hosted)', type: 'local', status: 'active',
    contextWindow: '128K', latency: 3.2, cost: 0, accuracy: 92.1, usage: 8,
    config: { temperature: 0.75, maxTokens: 2000, topP: 0.85, frequencyPenalty: 0.25 },
    systemPrompt: 'Bạn là AI copywriter chuyên nghiệp. Viết nội dung marketing sáng tạo, phù hợp văn hóa Việt Nam.',
    features: ['Open-source', 'No data leakage', '128K context', 'Self-hosted'],
    icon: '🦙',
  },
  {
    id: 'llama-3.1-8b', name: 'Llama 3.1 8B', provider: 'Meta (Self-hosted)', type: 'local', status: 'inactive',
    contextWindow: '128K', latency: 1.2, cost: 0, accuracy: 82.5, usage: 2,
    config: { temperature: 0.8, maxTokens: 1000, topP: 0.9, frequencyPenalty: 0.2 },
    systemPrompt: 'Bạn là AI copywriter. Tạo nội dung marketing ngắn, hiệu quả.',
    features: ['Lightweight', 'Fast', 'Open-source'],
    icon: '🦙',
  },
];

const PERF_DATA = [
  { model: 'GPT-4o', accuracy: 96.4, speed: 90, cost: 60, creativity: 95, vietnamese: 98 },
  { model: 'GPT-3.5', accuracy: 88.2, speed: 98, cost: 98, creativity: 82, vietnamese: 90 },
  { model: 'Llama 70B', accuracy: 92.1, speed: 75, cost: 100, creativity: 88, vietnamese: 85 },
  { model: 'Llama 8B', accuracy: 82.5, speed: 92, cost: 100, creativity: 75, vietnamese: 80 },
];

const RADAR_DATA = [
  { subject: 'Độ chính xác', GPT4o: 96, Llama70B: 92, GPT35: 88 },
  { subject: 'Tốc độ', GPT4o: 85, Llama70B: 72, GPT35: 97 },
  { subject: 'Chi phí', GPT4o: 60, Llama70B: 100, GPT35: 95 },
  { subject: 'Sáng tạo', GPT4o: 95, Llama70B: 88, GPT35: 82 },
  { subject: 'Tiếng Việt', GPT4o: 98, Llama70B: 85, GPT35: 90 },
];

export function AdminModelManagement() {
  const [models, setModels] = useState(MODELS);
  const [editing, setEditing] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [editConfig, setEditConfig] = useState<any>({});

  // Soft delete
  const [deletedModels, setDeletedModels] = useState<{id:string;name:string;provider:string;deletedAt:string}[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<typeof MODELS[0] | null>(null);
  const [trashOpen, setTrashOpen] = useState(false);
  const [trashLoading, setTrashLoading] = useState<string | null>(null);

  const visibleModels = models.filter(m => !deletedModels.find(d => d.id === m.id));

  const startEdit = (m: typeof MODELS[0]) => {
    setEditing(m.id);
    setEditPrompt(m.systemPrompt);
    setEditConfig({ ...m.config });
  };

  const saveEdit = (id: string) => {
    setModels(prev => prev.map(m => m.id === id ? { ...m, systemPrompt: editPrompt, config: editConfig } : m));
    setEditing(null);
    toast.success('Đã lưu cấu hình model!');
  };

  const toggleStatus = (id: string) => {
    setModels(prev => prev.map(m => m.id === id ? { ...m, status: m.status === 'active' ? 'inactive' : 'active' } : m));
    toast.success('Đã cập nhật trạng thái model!');
  };

  const handleSoftDelete = async () => {
    if (!confirmDelete) return;
    await new Promise(r => setTimeout(r, 400));
    setDeletedModels(prev => [...prev, { id: confirmDelete.id, name: confirmDelete.name, provider: confirmDelete.provider, deletedAt: new Date().toLocaleString('vi-VN') }]);
    setConfirmDelete(null);
    toast.success('Đã chuyển model vào thùng rác');
  };

  const handleRestore = async (id: string | number) => {
    setTrashLoading(String(id)); await new Promise(r => setTimeout(r, 500));
    setDeletedModels(prev => prev.filter(m => m.id !== String(id)));
    setTrashLoading(null); toast.success('Đã khôi phục model');
  };

  const handlePermanentDelete = async (id: string | number) => {
    setTrashLoading(String(id)); await new Promise(r => setTimeout(r, 500));
    setDeletedModels(prev => prev.filter(m => m.id !== String(id)));
    setModels(prev => prev.filter(m => m.id !== String(id)));
    setTrashLoading(null); toast.error('Đã xoá vĩnh viễn model');
  };

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Quản Lý Model AI</h1>
            <p className="text-gray-500 text-sm">Cấu hình, monitor và tối ưu GPT-4o, Llama 3.1 và các model fine-tuned</p>
          </div>
          <button
            onClick={() => setTrashOpen(true)}
            className="relative flex items-center gap-1.5 border border-gray-200 hover:border-red-300 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-xl px-3 py-2 text-sm font-semibold transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Thùng rác
            {deletedModels.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{deletedModels.length}</span>
            )}
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Tổng models', value: visibleModels.length, icon: Cpu, color: 'bg-stone-50 text-stone-700' },
            { label: 'Đang hoạt động', value: visibleModels.filter(m => m.status === 'active').length, icon: CheckCircle2, color: 'bg-green-50 text-green-700' },
            { label: 'Cloud models', value: visibleModels.filter(m => m.type === 'cloud').length, icon: Globe, color: 'bg-stone-50 text-stone-700' },
            { label: 'Local models', value: visibleModels.filter(m => m.type === 'local').length, icon: Lock, color: 'bg-amber-50 text-amber-700' },
          ].map(s => (
            <StatTile key={s.label} icon={s.icon} label={s.label} value={s.value} color={s.color} iconClassName="w-5 h-5" valueClassName="text-2xl" />
          ))}
        </div>

        <Tabs defaultValue="models">
          <TabsList className="mb-6">
            <TabsTrigger value="models"><Cpu className="w-4 h-4 mr-2" />Models</TabsTrigger>
            <TabsTrigger value="benchmark"><BarChart3 className="w-4 h-4 mr-2" />Benchmark</TabsTrigger>
            <TabsTrigger value="routing"><Settings className="w-4 h-4 mr-2" />Smart Routing</TabsTrigger>
          </TabsList>

          {/* Models tab */}
          <TabsContent value="models" className="space-y-4">
            {visibleModels.map(m => (
              <Card key={m.id} className={`p-5 ${m.status === 'inactive' ? 'opacity-60' : ''}`}>
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="text-xl">{m.icon}</span>
                      <h3 className="font-bold text-gray-900">{m.name}</h3>
                      <Badge className={m.status === 'active' ? 'bg-green-100 text-green-700 border-0' : 'bg-gray-100 text-gray-500 border-0'}>
                        {m.status === 'active' ? 'Hoạt động' : 'Tắt'}
                      </Badge>
                      <Badge className={m.type === 'cloud' ? 'bg-stone-100 text-stone-700 border-0' : 'bg-amber-100 text-amber-700 border-0'}>
                        {m.type === 'cloud' ? '☁️ Cloud' : '🖥️ Local'}
                      </Badge>
                      <span className="text-sm text-gray-500">{m.provider}</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      {[
                        { label: 'Độ chính xác', value: `${m.accuracy}%`, color: 'text-green-600' },
                        { label: 'Latency', value: `${m.latency}s`, color: 'text-stone-600' },
                        { label: 'Context', value: m.contextWindow, color: 'text-stone-600' },
                        { label: 'Chi phí/1K tokens', value: m.cost === 0 ? 'Miễn phí' : `$${m.cost}`, color: m.cost === 0 ? 'text-green-600' : 'text-amber-600' },
                      ].map(stat => (
                        <div key={stat.label} className="bg-gray-50 rounded-lg p-2.5 text-center">
                          <p className={`font-bold ${stat.color}`}>{stat.value}</p>
                          <p className="text-xs text-gray-500">{stat.label}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {m.features.map(f => <Badge key={f} className="bg-stone-100 text-stone-700 border-0 text-xs">{f}</Badge>)}
                    </div>

                    {editing === m.id ? (
                      <div className="space-y-4 border-t pt-4 mt-4">
                        <div>
                          <Label className="text-xs font-semibold text-gray-600 mb-1 block">System Prompt</Label>
                          <Textarea value={editPrompt} onChange={e => setEditPrompt(e.target.value)} className="text-sm min-h-20" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs text-gray-600">Temperature: {editConfig.temperature}</Label>
                            <Slider value={[editConfig.temperature]} onValueChange={v => setEditConfig({...editConfig, temperature: v[0]})} min={0} max={1} step={0.1} className="mt-2" />
                          </div>
                          <div>
                            <Label className="text-xs text-gray-600">Max Tokens: {editConfig.maxTokens}</Label>
                            <Slider value={[editConfig.maxTokens]} onValueChange={v => setEditConfig({...editConfig, maxTokens: v[0]})} min={256} max={4096} step={128} className="mt-2" />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-stone-600 text-white" onClick={() => saveEdit(m.id)}>
                            <Save className="w-4 h-4 mr-1" /> Lưu
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditing(null)}>Hủy</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-3 border text-xs text-gray-600 font-mono">
                        <span className="text-stone-600">System:</span> "{m.systemPrompt.slice(0, 100)}..."
                      </div>
                    )}
                  </div>

                  <div className="flex lg:flex-col gap-2 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <Switch checked={m.status === 'active'} onCheckedChange={() => toggleStatus(m.id)} />
                      <span className="text-xs text-gray-600">{m.status === 'active' ? 'Bật' : 'Tắt'}</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => startEdit(m)}>
                      <Edit2 className="w-4 h-4 mr-1" /> Cấu hình
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => toast.success('Đang test model...')}>
                      <Play className="w-4 h-4 mr-1" /> Test
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => setConfirmDelete(m)}>
                      <Trash2 className="w-4 h-4 mr-1" /> Xoá
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            {visibleModels.length === 0 && (
              <Card className="p-16 text-center">
                <Cpu className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Tất cả model đã bị xoá. Khôi phục từ thùng rác.</p>
              </Card>
            )}
          </TabsContent>

          {/* Benchmark */}
          <TabsContent value="benchmark" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="p-5">
                <h3 className="font-semibold text-gray-900 mb-4">So sánh hiệu suất</h3>
                <BarChart
                  data={PERF_DATA}
                  xKey="model"
                  height={280}
                  yMin={0}
                  yMax={100}
                  series={[
                    { key: 'accuracy', label: 'Độ chính xác', color: '#78716c' },
                    { key: 'speed', label: 'Tốc độ', color: '#059669' },
                    { key: 'vietnamese', label: 'Tiếng Việt', color: '#f59e0b' },
                  ]}
                />
              </Card>
              <Card className="p-5">
                <h3 className="font-semibold text-gray-900 mb-4">So sánh Top 3 (theo tiêu chí)</h3>
                <BarChart
                  data={RADAR_DATA}
                  xKey="subject"
                  height={280}
                  yMin={0}
                  yMax={100}
                  series={[
                    { key: 'GPT4o', label: 'GPT-4o', color: '#78716c' },
                    { key: 'Llama70B', label: 'Llama 70B', color: '#059669' },
                    { key: 'GPT35', label: 'GPT-3.5', color: '#f59e0b' },
                  ]}
                />
              </Card>
            </div>
            <Card className="p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Tóm tắt đề xuất</h3>
              <div className="space-y-3">
                {[
                  { model: 'GPT-4o', use: 'Dùng cho landing page, email phức tạp, copy cao cấp', recommend: 'Mặc định', color: 'bg-stone-100 text-stone-800' },
                  { model: 'GPT-3.5 Turbo', use: 'Dùng cho social media, tiêu đề ngắn, CTA đơn giản', recommend: 'Tiết kiệm', color: 'bg-stone-100 text-stone-800' },
                  { model: 'Llama 3.1 70B', use: 'Dùng khi cần bảo mật dữ liệu hoàn toàn', recommend: 'Bảo mật', color: 'bg-amber-100 text-amber-800' },
                ].map(r => (
                  <div key={r.model} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                    <Badge className={`${r.color} border-0 flex-shrink-0`}>{r.recommend}</Badge>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{r.model}</p>
                      <p className="text-xs text-gray-600">{r.use}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Smart Routing */}
          <TabsContent value="routing">
            <Card className="p-6">
              <h3 className="font-bold text-gray-900 mb-2">Smart Model Routing</h3>
              <p className="text-sm text-gray-600 mb-6">Tự động chọn model phù hợp nhất dựa trên loại nội dung và ngành nghề.</p>
              <div className="space-y-4">
                {[
                  { condition: 'Landing Page + Sang trọng', model: 'GPT-4o', reason: 'Cần sáng tạo cao, chất lượng premium' },
                  { condition: 'Social Media + Khẩn cấp', model: 'GPT-3.5 Turbo', reason: 'Nội dung ngắn, cần tốc độ cao' },
                  { condition: 'Email Marketing (dài)', model: 'GPT-4o', reason: 'Cần logic phức tạp, lập luận chặt chẽ' },
                  { condition: 'Bảo mật (local mode)', model: 'Llama 3.1 70B', reason: 'Dữ liệu nhạy cảm, không cloud' },
                  { condition: 'Default (mọi trường hợp)', model: 'GPT-4o', reason: 'Hiệu suất tốt nhất tổng thể' },
                ].map((rule, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border rounded-xl hover:shadow-sm transition-shadow">
                    <div className="text-xs font-mono text-stone-700 bg-stone-50 px-3 py-2 rounded-lg flex-shrink-0 min-w-48">{rule.condition}</div>
                    <div className="flex-1 flex items-center gap-2">
                      <span className="text-gray-400">→</span>
                      <Badge className="bg-green-100 text-green-700 border-0">{rule.model}</Badge>
                    </div>
                    <p className="text-xs text-gray-500 flex-1 hidden md:block">{rule.reason}</p>
                    <Button variant="ghost" size="sm" onClick={() => toast.success('Chỉnh sửa routing rule...')}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex gap-3">
                <Button className="bg-stone-600 text-white" onClick={() => toast.success('Đã lưu cấu hình routing!')}>
                  <Save className="w-4 h-4 mr-2" /> Lưu cấu hình
                </Button>
                <Button variant="outline" onClick={() => toast.success('Đặt về mặc định...')}>Reset mặc định</Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── CONFIRM DELETE ── */}
      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleSoftDelete}
        title={`Xoá model "${confirmDelete?.name}"?`}
        description="Model sẽ vào thùng rác. Các request đang dùng model này sẽ fallback về model mặc định."
        confirmLabel="Chuyển vào thùng rác"
        confirmVariant="warning"
      />

      {/* ── TRASH BIN ── */}
      <TrashBin
        open={trashOpen}
        onClose={() => setTrashOpen(false)}
        items={deletedModels.map(m => ({ id: m.id, label: m.name, subLabel: m.provider, deletedAt: m.deletedAt }))}
        onRestore={handleRestore}
        onPermanentDelete={handlePermanentDelete}
        entityName="model"
        loading={trashLoading}
      />
    </Layout>
  );
}