import { useEffect, useRef, useState, type ChangeEvent } from 'react';
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
import { useNavigate } from '@/lib/next-router-compat';

import {
  useCreateFineTuneJob,
  useFineTuneJobs,
  useFineTuneMetrics,
  useFineTuneProviders,
  useFineTuneQuotas,
  useFineTuningModels,
  useSetFineTunedModelActive,
  useTrainingLog,
  useExamplePairs,
} from '@/hooks/queries/useFineTuning';
import { DataPagination } from '@/app/components/common/DataPagination';
import { usePagination } from '@/hooks/usePagination';
import { MODELS as GENERATOR_MODELS } from '@/mocks/generator';

type ImportedFineTuneExample = {
  id: string;
  input: string;
  output: string;
  industry: string;
  tone: string;
};

type BaseModelOption = {
  id: string;
  name: string;
  description?: string;
  default?: boolean;
};

const BASE_MODEL_OPTIONS: BaseModelOption[] = GENERATOR_MODELS.map((model, index) => ({
  id: model.id,
  name: model.name,
  description: model.desc,
  default: index === 0,
}));

function clampProgressValue(value?: number | null) {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) return 0;
  return Math.min(100, Math.max(0, Math.round(numeric)));
}

function parseFineTuneCsv(text: string): ImportedFineTuneExample[] {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
  const inputIndex = headers.indexOf('input');
  const outputIndex = headers.indexOf('output');
  const industryIndex = headers.indexOf('industry');
  const toneIndex = headers.indexOf('tone');
  if (inputIndex < 0 || outputIndex < 0) return [];

  return lines.slice(1).map((line, index) => {
    const cells = line.split(',').map(cell => cell.trim());
    return {
      id: `csv-${Date.now()}-${index}`,
      input: cells[inputIndex] || '',
      output: cells[outputIndex] || '',
      industry: industryIndex >= 0 ? cells[industryIndex] || 'general' : 'general',
      tone: toneIndex >= 0 ? cells[toneIndex] || '' : '',
    };
  }).filter(item => item.input.length >= 10 && item.output.length >= 20);
}

export function CustomerFineTuningStudio() {
  const navigate = useNavigate();
  const { data: modelsData } = useFineTuningModels();
  const { data: jobsData = [] } = useFineTuneJobs();
  const { data: examplesData } = useExamplePairs();
  const { data: providers = [] } = useFineTuneProviders();
  const { data: quotas } = useFineTuneQuotas();
  const activeTrainingJob = jobsData.find(job => job.status === 'training') || jobsData.find(job => job.status === 'pending') || jobsData[0];
  const { data: trainingLog = [] } = useTrainingLog(activeTrainingJob?.id);
  const { data: metrics = [] } = useFineTuneMetrics(activeTrainingJob?.id);
  const createFineTuneJob = useCreateFineTuneJob();
  const setFineTunedModelActive = useSetFineTunedModelActive();
  const [models, setModels] = useState<NonNullable<typeof modelsData>>([] as any);
  const [examples, setExamples] = useState<NonNullable<typeof examplesData>>([] as any);
  useEffect(() => { if (modelsData) setModels(modelsData); }, [modelsData]);
  useEffect(() => { if (examplesData) setExamples(examplesData); }, [examplesData]);
  const [newInput, setNewInput] = useState('');
  const [newOutput, setNewOutput] = useState('');
  const [newModelName, setNewModelName] = useState('');
  const [newModelIndustry, setNewModelIndustry] = useState('ecommerce');
  const [newModelBase, setNewModelBase] = useState('');
  const [newModelProvider, setNewModelProvider] = useState('');
  const [newModelDesc, setNewModelDesc] = useState('');
  const [activeTab, setActiveTab] = useState('models');
  const csvInputRef = useRef<HTMLInputElement | null>(null);
  const activeProvider = providers.find(provider => provider.id === newModelProvider);
  const providerBaseModelOptions = activeProvider?.baseModels?.length
    ? activeProvider.baseModels
    : BASE_MODEL_OPTIONS;
  const baseModelOptions = providerBaseModelOptions.length > 0 ? providerBaseModelOptions : BASE_MODEL_OPTIONS;
  const selectedProviderCanCreateTrainingJob = Boolean(activeProvider?.supportsFineTuning);
  const providerHint = activeProvider
    ? activeProvider.message || (activeProvider.supportsFineTuning
      ? 'Provider n\u00e0y upload JSONL v\u00e0 t\u1ea1o job fine-tuning th\u1eadt qua provider.'
      : activeProvider.status === 'active'
        ? 'Provider API n\u00e0y \u0111ang d\u00f9ng cho generate, ch\u01b0a c\u00f3 adapter fine-tuning th\u1eadt trong backend.'
        : 'Provider n\u00e0y ch\u01b0a c\u00f3 API key trong backend.')
    : '';
  useEffect(() => {
    if (providers.length === 0) return;
    const currentProvider = providers.find(provider => provider.id === newModelProvider);
    if (currentProvider?.status === 'active') return;

    const preferredProvider = providers.find(provider => provider.status === 'active' && provider.isDefault)
      || providers.find(provider => provider.status === 'active' && provider.productionReady)
      || providers.find(provider => provider.status === 'active')
      || providers[0];
    if (preferredProvider) setNewModelProvider(preferredProvider.id);
  }, [providers, newModelProvider]);
  useEffect(() => {
    if (baseModelOptions.length === 0) return;
    if (baseModelOptions.some(model => model.id === newModelBase)) return;
    const defaultModel = baseModelOptions.find(model => model.default) || baseModelOptions[0];
    setNewModelBase(defaultModel.id);
  }, [baseModelOptions, newModelBase]);
  const trainProgress = clampProgressValue(activeTrainingJob?.progress);
  const modelPagination = usePagination(models, {
    initialPageSize: 5,
    resetKey: models.length,
  });
  const jobPagination = usePagination(jobsData, {
    initialPageSize: 5,
    resetKey: jobsData.length,
  });
  const examplePagination = usePagination(examples, {
    initialPageSize: 5,
    resetKey: examples.length,
  });
  const trainingLogPagination = usePagination(trainingLog, {
    initialPageSize: 6,
    resetKey: trainingLog.length,
  });

  const addExample = () => {
    if (!newInput || !newOutput) { toast.error('Điền đầy đủ input và output'); return; }
    setExamples(prev => [...prev, { id: Date.now(), input: newInput, output: newOutput, industry: newModelIndustry }]);
    setNewInput('');
    setNewOutput('');
    toast.success('Đã thêm cặp ví dụ!');
  };

  const importCsvExamples = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const imported = parseFineTuneCsv(await file.text());
    event.target.value = '';

    if (imported.length === 0) {
      toast.error('CSV cần có cột input và output hợp lệ');
      return;
    }

    setExamples(prev => [...prev, ...imported]);
    toast.success(`Đã import ${imported.length} ví dụ từ CSV`);
  };

  const startTraining = async () => {
    if (!newModelName) { toast.error('Nhập tên model'); return; }
    if (!newModelProvider) { toast.error('Chưa có provider training khả dụng'); return; }
    if (!newModelBase) { toast.error('Chưa có model nền khả dụng'); return; }
    if (activeProvider?.status && activeProvider.status !== 'active') { toast.error('Provider training chưa sẵn sàng'); return; }
    if (!selectedProviderCanCreateTrainingJob) { toast.error('Provider này chưa hỗ trợ fine-tuning thật trong backend'); return; }
    if (examples.length < 10) { toast.error(`Cần ít nhất 10 ví dụ (hiện có ${examples.length})`); return; }

    try {
      const job = await createFineTuneJob.mutateAsync({
        name: newModelName,
        industry: newModelIndustry,
        baseModel: newModelBase,
        provider: newModelProvider,
        description: newModelDesc,
        samples: examples.length,
        epochs: 5,
        examples: examples.map(ex => ({
          input: ex.input,
          output: ex.output,
          industry: ex.industry || newModelIndustry,
          tone: newModelProvider === 'openai' ? 'professional' : '',
        })),
      });
      setNewModelName('');
      setNewModelDesc('');
      setActiveTab('training');
      toast.success(`Đã tạo job fine-tuning "${job.name}"`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể tạo job fine-tuning';
      toast.error(message);
    }
  };

  const applyModel = async (modelItem: NonNullable<typeof modelsData>[number]) => {
    const registryModelId = modelItem.registryModelId;
    if (!registryModelId) {
      toast.error('Model này chưa được đăng ký để sử dụng trong AI Generator');
      return;
    }

    try {
      await setFineTunedModelActive.mutateAsync({ modelId: registryModelId, isActive: true });
      navigate(`/generate?model=${encodeURIComponent(`fine-tuned:${registryModelId}`)}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể áp dụng model';
      toast.error(message);
    }
  };
  const statusColor = (s: string) => ({ ready: 'bg-primary/10 text-primary', training: 'bg-primary/10 text-primary', failed: 'bg-destructive/10 text-destructive', pending: 'bg-muted text-foreground/70' }[s] ?? 'bg-muted text-foreground/70');
  const statusLabel = (s: string) => ({ ready: 'Sẵn sàng', training: 'Đang training', failed: 'Thất bại', pending: 'Chờ xử lý' }[s] ?? s);

  const latestMetric = metrics[metrics.length - 1];
  const firstMetric = metrics[0];
  const metricCards = latestMetric ? [
    { label: 'Training Loss', value: latestMetric.trainLoss.toFixed(3), prev: (firstMetric?.trainLoss ?? latestMetric.trainLoss).toFixed(3), trend: 'down', good: true },
    { label: 'Validation Loss', value: latestMetric.validationLoss.toFixed(3), prev: (firstMetric?.validationLoss ?? latestMetric.validationLoss).toFixed(3), trend: 'down', good: true },
    { label: 'Accuracy', value: `${latestMetric.accuracy.toFixed(1)}%`, prev: `${(firstMetric?.accuracy ?? latestMetric.accuracy).toFixed(1)}%`, trend: 'up', good: true },
    { label: 'Token Usage', value: `${latestMetric.tokenUsage}`, prev: `${firstMetric?.tokenUsage ?? latestMetric.tokenUsage}`, trend: 'up', good: true },
  ] : [
    { label: 'Training Loss', value: '0.342', prev: '1.245', trend: 'down', good: true },
    { label: 'Validation Loss', value: '0.389', prev: '1.312', trend: 'down', good: true },
    { label: 'Accuracy', value: '78.3%', prev: '45.2%', trend: 'up', good: true },
    { label: 'Token Usage', value: '0', prev: '0', trend: 'up', good: true },
  ];

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-1">Fine-tuning Studio</h1>
          <p className="text-foreground/70">Huấn luyện model AI theo giọng văn thương hiệu và ngành nghề của bạn</p>
        </div>

        {/* Info banner */}
        <Card className="p-4 mb-6 bg-gradient-to-r from-green-50 to-green-50 border-primary/20">
          <div className="flex gap-3">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1591453089816-0fbb971b454c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=80"
              alt="Fine-tuning" className="w-16 h-16 rounded-lg object-cover flex-shrink-0 hidden sm:block"
            />
            <div>
              <h3 className="font-semibold text-green-900 mb-1">Fine-tuning là gì?</h3>
              <p className="text-sm text-primary">
                Fine-tuning cho phép bạn tinh chỉnh model AI đang cấu hình để viết copy đúng phong cách, tone giọng 
                và đặc thù ngành nghề của thương hiệu bạn. Cung cấp càng nhiều ví dụ tốt, model càng chính xác.
              </p>
            </div>
          </div>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="models"><Brain className="w-4 h-4 mr-2" />Models của tôi</TabsTrigger>
            <TabsTrigger value="create"><Plus className="w-4 h-4 mr-2" />Tạo Model Mới</TabsTrigger>
            <TabsTrigger value="training"><BarChart3 className="w-4 h-4 mr-2" />Tiến Trình Training</TabsTrigger>
          </TabsList>

          {/* Models list */}
          <TabsContent value="models" className="space-y-4">
            {modelPagination.pageItems.map(m => (
              <Card key={m.id} className="p-5">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-bold text-foreground">{m.name}</h3>
                      <Badge className={`${statusColor(m.status)} border-0`}>{statusLabel(m.status)}</Badge>
                      <Badge className="bg-primary/10 text-primary border-0 text-xs">{m.baseModel}</Badge>
                    </div>
                    <p className="text-sm text-foreground/70 mb-3">{m.desc}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <span><FileText className="w-3 h-3 inline mr-1" />{m.trainedOn} ví dụ training</span>
                      <span><Clock className="w-3 h-3 inline mr-1" />Tạo: {m.createdAt}</span>
                      {m.status === 'ready' && <span><Star className="w-3 h-3 inline mr-1 text-amber-500" />Độ chính xác: {m.accuracy}%</span>}
                    </div>
                    {m.status === 'training' && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-foreground/70 mb-1">
                          <span>Đang training...</span>
                          <span>{clampProgressValue(m.progress)}%</span>
                        </div>
                        <Progress value={clampProgressValue(m.progress)} className="h-2" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {m.status === 'ready' && (
                      <Button size="sm" className="bg-primary hover:bg-green-700 text-white" onClick={() => applyModel(m)} disabled={setFineTunedModelActive.isPending}>
                        <Zap className="w-4 h-4 mr-1" /> Dùng trong Generator
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
              <div className="text-center py-16 text-muted-foreground/80">
                <Brain className="w-16 h-16 mx-auto mb-3 opacity-30" />
                <p>Chưa có model nào. Tạo model đầu tiên của bạn!</p>
              </div>
            )}
            <DataPagination
              page={modelPagination.page}
              pageSize={modelPagination.pageSize}
              totalItems={modelPagination.totalItems}
              totalPages={modelPagination.totalPages}
              startIndex={modelPagination.startIndex}
              endIndex={modelPagination.endIndex}
              onPageChange={modelPagination.setPage}
              onPageSizeChange={modelPagination.setPageSize}
              itemLabel="model"
            />
          </TabsContent>

          {/* Create model */}
          <TabsContent value="create" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Left: Config */}
              <Card className="p-6 space-y-4">
                <h3 className="font-bold text-foreground">Cấu hình model</h3>
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
                  <Label>Provider training</Label>
                  <Select value={newModelProvider} onValueChange={setNewModelProvider} disabled={providers.length === 0}>
                    <SelectTrigger className="mt-2"><SelectValue placeholder={'Ch\u1ecdn provider'} /></SelectTrigger>
                    <SelectContent>
                      {providers.map(provider => (
                        <SelectItem key={provider.id} value={provider.id} disabled={provider.status !== 'active'}>
                          {provider.name}{provider.supportsFineTuning ? ' (fine-tune th\u1eadt)' : provider.apiConfigured ? ' (API)' : ''}{provider.status !== 'active' ? ` - ${provider.status}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {providerHint && (
                    <p className={`mt-2 text-xs ${activeProvider?.status === 'active' ? 'text-muted-foreground' : 'text-amber-700'}`}>
                      {providerHint}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Model nền (Base model)</Label>
                  <Select value={newModelBase} onValueChange={setNewModelBase} disabled={baseModelOptions.length === 0}>
                    <SelectTrigger className="mt-2"><SelectValue placeholder={'Ch\u1ecdn model n\u1ec1n'} /></SelectTrigger>
                    <SelectContent>
                      {baseModelOptions.map(model => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}{model.default ? ' (default)' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Mô tả mục tiêu training</Label>
                  <Textarea placeholder="VD: Model này cần viết copy theo phong cách cấp bách, sử dụng emoji, nhấn mạnh giá và ưu đãi..." value={newModelDesc} onChange={e => setNewModelDesc(e.target.value)} className="mt-2 min-h-20" />
                </div>

                {/* Training tips */}
                <div className="bg-warning/10 border border-amber-200 rounded-lg p-3">
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
                  <h3 className="font-bold text-foreground">Dữ liệu training</h3>
                  <Badge className={`border-0 ${examples.length >= 50 ? 'bg-primary/10 text-primary' : examples.length >= 10 ? 'bg-primary/10 text-primary' : 'bg-warning/15 text-amber-800'}`}>
                    {examples.length} ví dụ
                  </Badge>
                </div>

                {examples.length < 10 && (
                  <div className="flex items-start gap-2 p-3 bg-warning/10 border border-amber-200 rounded-lg mb-4">
                    <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800">Cần ít nhất <strong>10 cặp ví dụ</strong> để bắt đầu training. Hiện có {examples.length}.</p>
                  </div>
                )}

                <div className="space-y-3 max-h-48 overflow-y-auto mb-4">
                  {examplePagination.pageItems.map(ex => (
                    <div key={ex.id} className="border rounded-lg p-3 bg-surface-muted">
                      <div className="flex justify-between items-start mb-1">
                        <Badge className="bg-primary/10 text-primary border-0 text-xs">Input</Badge>
                        <button onClick={() => setExamples(prev => prev.filter(e => e.id !== ex.id))} className="text-muted-foreground/80 hover:text-red-500">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-foreground/70 mb-2">{ex.input}</p>
                      <Badge className="bg-primary/10 text-primary border-0 text-xs mb-1">Output</Badge>
                      <p className="text-xs text-foreground">{ex.output}</p>
                    </div>
                  ))}
                </div>
                <DataPagination
                  page={examplePagination.page}
                  pageSize={examplePagination.pageSize}
                  totalItems={examplePagination.totalItems}
                  totalPages={examplePagination.totalPages}
                  startIndex={examplePagination.startIndex}
                  endIndex={examplePagination.endIndex}
                  onPageChange={examplePagination.setPage}
                  onPageSizeChange={examplePagination.setPageSize}
                  itemLabel="ví dụ"
                  pageSizeOptions={[5, 10, 20]}
                />

                {/* Add example */}
                <div className="border-t pt-4 space-y-2">
                  <p className="text-xs font-semibold text-foreground/70 mb-2">Thêm cặp ví dụ:</p>
                  <Input placeholder="Input: Thông tin sản phẩm, ngữ cảnh..." value={newInput} onChange={e => setNewInput(e.target.value)} className="text-sm" />
                  <Textarea placeholder="Output: Copy lý tưởng bạn muốn AI học theo..." value={newOutput} onChange={e => setNewOutput(e.target.value)} className="text-sm min-h-16" />
                  <div className="flex gap-2">
                    <input ref={csvInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={importCsvExamples} />
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => csvInputRef.current?.click()}>
                      <Upload className="w-4 h-4 mr-1" /> Import CSV
                    </Button>
                    <Button size="sm" className="flex-1 bg-primary hover:bg-green-700 text-white" onClick={addExample}>
                      <Plus className="w-4 h-4 mr-1" /> Thêm ví dụ
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Start training */}
            <div className="flex justify-end">
              <Button size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-10" onClick={startTraining} disabled={createFineTuneJob.isPending || !activeProvider || activeProvider.status !== 'active' || !selectedProviderCanCreateTrainingJob}>
                <Play className="w-5 h-5 mr-2" /> {activeProvider?.supportsFineTuning ? 'Bắt đầu Fine-tuning' : 'Provider chưa hỗ trợ fine-tuning'}
              </Button>
            </div>
          </TabsContent>

          {/* Training progress */}
          <TabsContent value="training">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-foreground">{activeTrainingJob?.name || 'Chưa có job training'}</h3>
                  {activeTrainingJob && (
                    <Badge className={`${statusColor(activeTrainingJob.status)} border-0`}>
                      {statusLabel(activeTrainingJob.status)}
                    </Badge>
                  )}
                </div>
                {activeTrainingJob && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className="bg-muted text-foreground/70 border-0 text-xs">{activeTrainingJob.provider}</Badge>
                    <Badge className="bg-primary/10 text-primary border-0 text-xs">{activeTrainingJob.baseModel}</Badge>
                    <Badge className="bg-muted text-foreground/70 border-0 text-xs">{activeTrainingJob.trainedOn} ví dụ</Badge>
                  </div>
                )}

                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-foreground/70">Tiến trình tổng thể</span>
                    <span className="font-bold text-primary">{trainProgress}%</span>
                  </div>
                  <Progress value={trainProgress} className="h-3" />
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {activeTrainingJob ? `Tạo: ${activeTrainingJob.createdAt}` : 'Tạo job mới để xem tiến trình'}
                  </p>
                </div>

                {/* Log */}
                <div className="space-y-2">
                  {trainingLogPagination.pageItems.map((log, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      {log.status === 'done' ? (
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      ) : log.status === 'running' ? (
                        <RefreshCw className="w-4 h-4 text-primary animate-spin flex-shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-border flex-shrink-0" />
                      )}
                      <span className={`flex-1 ${log.status === 'done' ? 'text-foreground/80' : log.status === 'running' ? 'text-primary font-medium' : 'text-muted-foreground/80'}`}>{log.step}</span>
                      <span className="text-xs text-muted-foreground/80 font-mono">{log.time}</span>
                    </div>
                  ))}
                </div>
                <DataPagination
                  page={trainingLogPagination.page}
                  pageSize={trainingLogPagination.pageSize}
                  totalItems={trainingLogPagination.totalItems}
                  totalPages={trainingLogPagination.totalPages}
                  startIndex={trainingLogPagination.startIndex}
                  endIndex={trainingLogPagination.endIndex}
                  onPageChange={trainingLogPagination.setPage}
                  onPageSizeChange={trainingLogPagination.setPageSize}
                  itemLabel="log"
                  pageSizeOptions={[6, 10, 20]}
                />
              </Card>

              {/* Metrics */}
              <Card className="p-6">
                <h3 className="font-bold text-foreground mb-4">Chỉ số training</h3>
                <div className="space-y-4">
                  {metricCards.map(m => (
                    <div key={m.label} className="flex items-center justify-between p-3 bg-surface-muted rounded-lg">
                      <span className="text-sm text-foreground/80">{m.label}</span>
                      <div className="text-right">
                        <span className="font-bold text-foreground">{m.value}</span>
                        <p className="text-xs text-muted-foreground/80">trước: {m.prev}</p>
                      </div>
                      <Badge className={`ml-3 border-0 text-xs ${m.good ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                        {m.trend === 'down' ? '↓ giảm' : '↑ tăng'}
                      </Badge>
                    </div>
                  ))}
                </div>

                <div className="mt-5 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-xs text-primary flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    Loss thấp hơn và Accuracy cao hơn cho thấy model đang học tốt. BLEU Score đo mức độ tương đồng với output mẫu.
                  </p>
                </div>
              </Card>
            </div>
            <Card className="p-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-foreground">Danh sách job fine-tuning</h3>
                <Badge className="bg-muted text-foreground/70 border-0">{jobsData.length} job</Badge>
              </div>

              {jobPagination.pageItems.length > 0 ? (
                <div className="space-y-3">
                  {jobPagination.pageItems.map(job => (
                    <div key={job.id} className="border rounded-lg p-3 bg-surface-muted">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h4 className="font-semibold text-foreground truncate">{job.name}</h4>
                            <Badge className={`${statusColor(job.status)} border-0 text-xs`}>{statusLabel(job.status)}</Badge>
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <span>Provider: {job.provider}</span>
                            <span>Model: {job.baseModel}</span>
                            <span>Ví dụ: {job.trainedOn}</span>
                            <span>Tạo: {job.createdAt}</span>
                          </div>
                        </div>
                        <div className="w-full md:w-40">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Tiến trình</span>
                            <span>{clampProgressValue(job.progress)}%</span>
                          </div>
                          <Progress value={clampProgressValue(job.progress)} className="h-2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Chưa có job fine-tuning nào.</p>
              )}

              <DataPagination
                page={jobPagination.page}
                pageSize={jobPagination.pageSize}
                totalItems={jobPagination.totalItems}
                totalPages={jobPagination.totalPages}
                startIndex={jobPagination.startIndex}
                endIndex={jobPagination.endIndex}
                onPageChange={jobPagination.setPage}
                onPageSizeChange={jobPagination.setPageSize}
                itemLabel="job"
                pageSizeOptions={[5, 10, 20]}
              />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
