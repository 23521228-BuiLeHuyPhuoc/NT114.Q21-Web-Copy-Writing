import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
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
import * as XLSX from 'xlsx';

import {
  useCreateFineTuneJob,
  useFineTuneJobs,
  useFineTuneMetrics,
  useFineTuneProviders,
  useFineTuneQuotas,
  useFineTuningModels,
  usePromoteFineTuneJob,
  useSetFineTunedModelActive,
  useTrainingLog,
  useExamplePairs,
} from '@/hooks/queries/useFineTuning';
import { DataPagination } from '@/app/components/common/DataPagination';
import { usePagination } from '@/hooks/usePagination';

type ImportedFineTuneExample = {
  id: string;
  input: string;
  output: string;
  industry: string;
  tone: string;
  type: string;
  product: string;
};

type TrainingMetric = {
  epoch: number;
  trainLoss: number;
  validationLoss: number;
  accuracy: number;
  tokenUsage: number;
};

type MetricTrend = 'down' | 'up' | 'flat' | 'pending' | 'estimated';

type MetricCard = {
  label: string;
  value: string;
  prev: string;
  trend: MetricTrend;
  good?: boolean;
};

const FINE_TUNE_PROVIDER_PRIORITY = ['vertex-claude', 'vertex-qwen', 'vertex-gemini', 'vertex-llama', 'openai'];
const TRAINING_IMPORT_ACCEPT = '.csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel';
const TRAINING_IMPORT_FILE_TYPES = 'CSV hoac Excel (.xlsx, .xls)';

function clampProgressValue(value?: number | null) {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) return 0;
  return Math.min(100, Math.max(0, Math.round(numeric)));
}

function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  const quote = String.fromCharCode(34);
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === quote) {
      if (inQuotes && next === quote) {
        cell += quote;
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(cell.trim());
      cell = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') index += 1;
      row.push(cell.trim());
      if (row.some(value => value.length > 0)) rows.push(row);
      row = [];
      cell = '';
      continue;
    }

    cell += char;
  }

  row.push(cell.trim());
  if (row.some(value => value.length > 0)) rows.push(row);
  return rows;
}

function parseFineTuneCsv(text: string): ImportedFineTuneExample[] {
  const rows = parseCsvRows(text.replace(/^\uFEFF/, ''));
  return parseFineTuneTableRows(rows, 'csv');
}

function normalizeHeader(value: string) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0111/g, 'd')
    .replace(/\u0110/g, 'd')
    .replace(/[^a-z0-9]+/g, '');
}

function findHeaderIndex(headers: string[], candidates: string[]) {
  const normalizedCandidates = candidates.map(normalizeHeader);
  return headers.findIndex(header => normalizedCandidates.includes(normalizeHeader(header)));
}

function parseFineTuneTableRows(rows: Array<Array<unknown>>, idPrefix: string): ImportedFineTuneExample[] {
  if (rows.length < 2) return [];

  const headers = rows[0].map(header => String(header ?? '').trim());
  const inputIndex = findHeaderIndex(headers, ['input', 'inputText', 'prompt', 'user', 'userPrompt', 'noi dung dau vao', 'cau hoi']);
  const outputIndex = findHeaderIndex(headers, ['output', 'outputText', 'completion', 'assistant', 'response', 'noi dung dau ra', 'cau tra loi']);
  const industryIndex = findHeaderIndex(headers, ['industry', 'nganh', 'nganh nghe', 'linh vuc']);
  const toneIndex = findHeaderIndex(headers, ['tone', 'voice', 'brandVoice', 'giong van', 'tone giong']);
  const typeIndex = findHeaderIndex(headers, ['type', 'contentType', 'copyType', 'loai noi dung', 'loai', 'dinh dang']);
  const productIndex = findHeaderIndex(headers, ['product', 'productName', 'san pham', 'san pham dich vu', 'dich vu']);
  if (inputIndex < 0 || outputIndex < 0) return [];

  return rows.slice(1).map((cells, index) => {
    const input = String(cells[inputIndex] ?? '').trim();
    const output = String(cells[outputIndex] ?? '').trim();
    return {
      id: `${idPrefix}-${Date.now()}-${index}`,
      input,
      output,
      industry: industryIndex >= 0 ? String(cells[industryIndex] ?? '').trim() || 'general' : 'general',
      tone: toneIndex >= 0 ? String(cells[toneIndex] ?? '').trim() || '' : '',
      type: typeIndex >= 0 ? String(cells[typeIndex] ?? '').trim() || '' : '',
      product: productIndex >= 0 ? String(cells[productIndex] ?? '').trim() || '' : '',
    };
  }).filter(item => item.input.length >= 10 && item.output.length >= 20);
}

async function parseFineTuneExcel(file: File): Promise<ImportedFineTuneExample[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) return [];

  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<Array<string | number | boolean | null>>(sheet, {
    header: 1,
    blankrows: false,
    defval: '',
    raw: false,
  });
  return parseFineTuneTableRows(rows, 'excel');
}

function isExcelFile(file: File) {
  const name = file.name.toLowerCase();
  return name.endsWith('.xlsx') || name.endsWith('.xls')
    || file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    || file.type === 'application/vnd.ms-excel';
}

function isCloseNumber(value: number, expected: number) {
  return Math.abs(Number(value || 0) - expected) < 0.0005;
}

function isSeedMetric(metric: TrainingMetric) {
  const isEpochZero = Number(metric.epoch || 0) === 0;
  const isLegacySeed = isCloseNumber(metric.trainLoss, 1.25)
    && isCloseNumber(metric.validationLoss, 1.32)
    && isCloseNumber(metric.accuracy, 45);
  const isTokenOnlySeed = isCloseNumber(metric.trainLoss, 0)
    && isCloseNumber(metric.validationLoss, 0)
    && isCloseNumber(metric.accuracy, 0);

  return isEpochZero && (isLegacySeed || isTokenOnlySeed);
}

function formatMetricValue(value: number, decimals = 3, suffix = '') {
  return `${Number(value || 0).toFixed(decimals)}${suffix}`;
}

function formatTokenCount(value: number) {
  return new Intl.NumberFormat('vi-VN').format(Math.max(0, Math.round(Number(value || 0))));
}

function buildMetricCard(label: string, current: number, previous: number | undefined, lowerIsBetter: boolean, decimals = 3, suffix = ''): MetricCard {
  const currentValue = Number(current || 0);
  const previousValue = Number(previous ?? currentValue);
  const trend: MetricTrend = isCloseNumber(currentValue, previousValue)
    ? 'flat'
    : currentValue < previousValue
      ? 'down'
      : 'up';
  const good = trend === 'flat' ? undefined : (trend === 'down' ? lowerIsBetter : !lowerIsBetter);

  return {
    label,
    value: formatMetricValue(currentValue, decimals, suffix),
    prev: formatMetricValue(previousValue, decimals, suffix),
    trend,
    good,
  };
}

function getMetricTrendLabel(trend: MetricTrend) {
  return {
    down: '\u2193 gi\u1ea3m',
    up: '\u2191 t\u0103ng',
    flat: 'ch\u01b0a \u0111\u1ed5i',
    pending: 'ch\u1edd d\u1eef li\u1ec7u',
    estimated: '\u01b0\u1edbc t\u00ednh',
  }[trend];
}

function getMetricBadgeClass(metric: MetricCard) {
  if (metric.trend === 'estimated') return 'bg-warning/15 text-amber-800';
  if (metric.trend === 'pending' || metric.trend === 'flat') return 'bg-muted text-foreground/70';
  return metric.good ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive';
}

function isReadyFineTuneProvider(provider: { status?: string; supportsFineTuning?: boolean }) {
  return provider.status === 'active' && Boolean(provider.supportsFineTuning);
}

function isFineTuneProviderOption(provider: { id: string; supportsFineTuning?: boolean }) {
  if (provider.id === 'openai') return Boolean(provider.supportsFineTuning);
  return Boolean(provider.supportsFineTuning) || FINE_TUNE_PROVIDER_PRIORITY.includes(provider.id);
}

function fineTuneProviderRank(providerId: string) {
  const index = FINE_TUNE_PROVIDER_PRIORITY.indexOf(providerId);
  return index === -1 ? FINE_TUNE_PROVIDER_PRIORITY.length : index;
}

function getProviderOptionSuffix(provider: { mode?: string; supportsFineTuning?: boolean; apiConfigured?: boolean; status?: string }) {
  const capability = provider.mode === 'brand_voice'
    ? ' (brand voice)'
    : provider.supportsFineTuning
      ? ' (fine-tune thật)'
      : provider.apiConfigured
        ? ' (API)'
        : '';
  return `${capability}${provider.status !== 'active' ? ` - ${provider.status}` : ''}`;
}

export function CustomerFineTuningStudio() {
  const navigate = useNavigate();
  const { data: modelsData } = useFineTuningModels();
  const { data: jobsData = [] } = useFineTuneJobs();
  const { data: examplesData } = useExamplePairs();
  const { data: providers = [] } = useFineTuneProviders();
  const { data: quotas } = useFineTuneQuotas();
  const createFineTuneJob = useCreateFineTuneJob();
  const promoteFineTuneJob = usePromoteFineTuneJob();
  const setFineTunedModelActive = useSetFineTunedModelActive();
  const [selectedTrainingJobId, setSelectedTrainingJobId] = useState<string>('');
  const [models, setModels] = useState<NonNullable<typeof modelsData>>([] as any);
  const [examples, setExamples] = useState<NonNullable<typeof examplesData>>([] as any);
  const [selectedExampleIds, setSelectedExampleIds] = useState<string[]>([]);
  const preferredTrainingJob = jobsData.find(job => job.status === 'training') || jobsData.find(job => job.status === 'pending') || jobsData[0];
  const activeTrainingJob = jobsData.find(job => job.id === selectedTrainingJobId) || preferredTrainingJob;
  const { data: trainingLog = [] } = useTrainingLog(activeTrainingJob?.id);
  const { data: metrics = [] } = useFineTuneMetrics(activeTrainingJob?.id);
  useEffect(() => { if (modelsData) setModels(modelsData); }, [modelsData]);
  useEffect(() => { if (examplesData) setExamples(examplesData); }, [examplesData]);
  useEffect(() => {
    if (jobsData.length === 0) {
      if (selectedTrainingJobId) setSelectedTrainingJobId('');
      return;
    }
    if (selectedTrainingJobId && jobsData.some(job => job.id === selectedTrainingJobId)) return;
    if (preferredTrainingJob?.id) setSelectedTrainingJobId(preferredTrainingJob.id);
  }, [jobsData, preferredTrainingJob?.id, selectedTrainingJobId]);
  const [newInput, setNewInput] = useState('');
  const [newOutput, setNewOutput] = useState('');
  const [newModelName, setNewModelName] = useState('');
  const [newModelIndustry, setNewModelIndustry] = useState('ecommerce');
  const [newModelBase, setNewModelBase] = useState('');
  const [newModelProvider, setNewModelProvider] = useState('');
  const [newModelDesc, setNewModelDesc] = useState('');
  const [activeTab, setActiveTab] = useState('models');
  const trainingFileInputRef = useRef<HTMLInputElement | null>(null);
  const fineTuneProviders = useMemo(
    () => providers
      .filter(isFineTuneProviderOption)
      .sort((a, b) => fineTuneProviderRank(a.id) - fineTuneProviderRank(b.id)),
    [providers],
  );
  const activeProvider = fineTuneProviders.find(provider => provider.id === newModelProvider);
  const baseModelOptions = activeProvider?.baseModels || [];
  const selectedProviderCanCreateTrainingJob = isReadyFineTuneProvider(activeProvider || {});
  const providerHint = activeProvider
    ? activeProvider.message || (activeProvider.mode === 'brand_voice'
      ? 'Provider này tạo model brand-voice từ dataset và generate bằng Claude, không train trọng số model.'
      : activeProvider.supportsFineTuning
      ? 'Provider n\u00e0y upload JSONL v\u00e0 t\u1ea1o job fine-tuning th\u1eadt qua provider.'
      : activeProvider.status === 'active'
        ? 'Provider API n\u00e0y \u0111ang d\u00f9ng cho generate, ch\u01b0a c\u00f3 adapter fine-tuning th\u1eadt trong backend.'
        : 'Provider n\u00e0y ch\u01b0a c\u00f3 API key trong backend.')
    : providers.length > 0
      ? 'Chua co provider fine-tuning that trong cau hinh backend.'
      : '';
  useEffect(() => {
    if (fineTuneProviders.length === 0) {
      if (newModelProvider) setNewModelProvider('');
      return;
    }

    const currentProvider = fineTuneProviders.find(provider => provider.id === newModelProvider);
    if (currentProvider && isReadyFineTuneProvider(currentProvider)) return;

    const readyProviders = fineTuneProviders.filter(isReadyFineTuneProvider);

    const preferredProvider = readyProviders.find(provider => provider.isDefault)
      || readyProviders.find(provider => provider.productionReady)
      || readyProviders[0]
      || fineTuneProviders.find(provider => provider.status === 'active' && provider.isDefault)
      || fineTuneProviders.find(provider => provider.status === 'active')
      || fineTuneProviders[0];
    if (preferredProvider) setNewModelProvider(preferredProvider.id);
  }, [fineTuneProviders, newModelProvider]);
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
  const selectedExampleIdSet = useMemo(() => new Set(selectedExampleIds), [selectedExampleIds]);
  const pageExampleIds = useMemo(() => examplePagination.pageItems.map(ex => String(ex.id)), [examplePagination.pageItems]);
  const allPageExamplesSelected = pageExampleIds.length > 0 && pageExampleIds.every(id => selectedExampleIdSet.has(id));
  const registryModelByJobId = useMemo(() => {
    const map = new Map<string, NonNullable<typeof modelsData>[number]>();
    (modelsData || []).forEach(modelItem => {
      map.set(String(modelItem.id), modelItem);
    });
    return map;
  }, [modelsData]);

  useEffect(() => {
    setSelectedExampleIds(prev => prev.filter(id => examples.some(ex => String(ex.id) === id)));
  }, [examples]);

  const toggleExampleSelection = (exampleId: number | string, checked: boolean) => {
    const id = String(exampleId);
    setSelectedExampleIds(prev => {
      if (checked) return prev.includes(id) ? prev : [...prev, id];
      return prev.filter(item => item !== id);
    });
  };

  const toggleCurrentPageExamples = (checked: boolean) => {
    setSelectedExampleIds(prev => {
      const next = new Set(prev);
      pageExampleIds.forEach(id => {
        if (checked) next.add(id);
        else next.delete(id);
      });
      return Array.from(next);
    });
  };

  const deleteSelectedExamples = () => {
    if (selectedExampleIds.length === 0) return;
    const idsToDelete = new Set(selectedExampleIds);
    setExamples(prev => prev.filter(ex => !idsToDelete.has(String(ex.id))));
    setSelectedExampleIds([]);
    toast.success(`Da xoa ${idsToDelete.size} vi du da chon`);
  };

  const deleteAllExamples = () => {
    if (examples.length === 0) return;
    const count = examples.length;
    setExamples([]);
    setSelectedExampleIds([]);
    toast.success(`Da xoa ${count} vi du training`);
  };

  const addExample = () => {
    if (!newInput || !newOutput) { toast.error('Điền đầy đủ input và output'); return; }
    setExamples(prev => [...prev, { id: Date.now(), input: newInput, output: newOutput, industry: newModelIndustry, tone: '', type: '', product: '' }]);
    setNewInput('');
    setNewOutput('');
    toast.success('Đã thêm cặp ví dụ!');
  };

  const importTrainingExamples = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const imported = isExcelFile(file)
        ? await parseFineTuneExcel(file)
        : parseFineTuneCsv(await file.text());
      event.target.value = '';

      if (imported.length === 0) {
        toast.error(`${TRAINING_IMPORT_FILE_TYPES} can co cot input va output hop le`);
        return;
      }

      setExamples(prev => [...prev, ...imported]);
      toast.success(`Da import ${imported.length} vi du tu ${isExcelFile(file) ? 'Excel' : 'CSV'}`);
    } catch (error) {
      event.target.value = '';
      toast.error(error instanceof Error ? error.message : `Khong the doc file ${TRAINING_IMPORT_FILE_TYPES}`);
    }
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
          tone: ex.tone || '',
          type: ex.type || '',
          product: ex.product || '',
        })),
      });
      setNewModelName('');
      setNewModelDesc('');
      setSelectedTrainingJobId(job.id);
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

    if (modelItem.generatorReady === false) {
      toast.error(modelItem.generatorMessage || 'Provider của model này chưa có endpoint Generate trong app');
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
  const useCompletedJobInGenerator = async (job: NonNullable<typeof jobsData>[number]) => {
    if (job.status !== 'ready') return;

    const registeredModel = registryModelByJobId.get(String(job.id));
    if (registeredModel) {
      await applyModel(registeredModel);
      return;
    }

    try {
      const promotedModel = await promoteFineTuneJob.mutateAsync(job.id);
      if (promotedModel.generatorReady === false) {
        toast.error(promotedModel.generatorMessage || 'Model đã được đăng ký nhưng provider này chưa dùng được trong Generator');
        setActiveTab('models');
        return;
      }
      await applyModel(promotedModel);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể đăng ký model để dùng trong Generator';
      toast.error(message);
    }
  };
  const isApplyingFineTunedModel = setFineTunedModelActive.isPending || promoteFineTuneJob.isPending;
  const statusColor = (s: string) => ({ ready: 'bg-primary/10 text-primary', training: 'bg-primary/10 text-primary', failed: 'bg-destructive/10 text-destructive', pending: 'bg-muted text-foreground/70' }[s] ?? 'bg-muted text-foreground/70');
  const statusLabel = (s: string) => ({ ready: 'Sẵn sàng', training: 'Đang training', failed: 'Thất bại', pending: 'Chờ xử lý' }[s] ?? s);

  const seedMetric = metrics.find(isSeedMetric);
  const realMetrics = metrics.filter(metric => !isSeedMetric(metric));
  const latestMetric = realMetrics[realMetrics.length - 1];
  const firstMetric = realMetrics[0];
  const waitingValue = '\u0110ang ch\u1edd';
  const noProviderMetricText = 'Provider ch\u01b0a tr\u1ea3 metric th\u1eadt';
  const metricCards: MetricCard[] = latestMetric ? [
    buildMetricCard('Training Loss', latestMetric.trainLoss, firstMetric?.trainLoss, true),
    buildMetricCard('Validation Loss', latestMetric.validationLoss, firstMetric?.validationLoss, true),
    buildMetricCard('Accuracy', latestMetric.accuracy, firstMetric?.accuracy, false, 1, '%'),
    buildMetricCard('Token Usage', latestMetric.tokenUsage, firstMetric?.tokenUsage, false, 0),
  ] : [
    { label: 'Training Loss', value: waitingValue, prev: noProviderMetricText, trend: 'pending' },
    { label: 'Validation Loss', value: waitingValue, prev: noProviderMetricText, trend: 'pending' },
    { label: 'Accuracy', value: waitingValue, prev: noProviderMetricText, trend: 'pending' },
    seedMetric?.tokenUsage
      ? { label: 'Token Usage', value: formatTokenCount(seedMetric.tokenUsage), prev: 'Token dataset \u01b0\u1edbc t\u00ednh', trend: 'estimated' }
      : { label: 'Token Usage', value: waitingValue, prev: noProviderMetricText, trend: 'pending' },
  ];
  const metricHelpText = latestMetric
    ? 'Loss th\u1ea5p h\u01a1n v\u00e0 Accuracy cao h\u01a1n th\u01b0\u1eddng l\u00e0 d\u1ea5u hi\u1ec7u model \u0111ang h\u1ecdc t\u1ed1t. Ch\u1ec9 so s\u00e1nh khi provider \u0111\u00e3 tr\u1ea3 metric th\u1eadt.'
    : 'Ch\u01b0a c\u00f3 loss/accuracy th\u1eadt t\u1eeb provider cho job n\u00e0y. UI kh\u00f4ng hi\u1ec3n th\u1ecb metric seed nh\u01b0 k\u1ebft qu\u1ea3 training.';

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
                      <Button size="sm" className="bg-primary hover:bg-green-700 text-white" onClick={() => applyModel(m)} disabled={isApplyingFineTunedModel}>
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
                  <Select value={newModelProvider} onValueChange={setNewModelProvider} disabled={fineTuneProviders.length === 0}>
                    <SelectTrigger className="mt-2"><SelectValue placeholder={'Ch\u1ecdn provider'} /></SelectTrigger>
                    <SelectContent>
                      {fineTuneProviders.map(provider => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {provider.name}{getProviderOptionSuffix(provider)}
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
                <div className="flex flex-col gap-3 mb-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-bold text-foreground">Dữ liệu training</h3>
                    <Badge className={`border-0 ${examples.length >= 50 ? 'bg-primary/10 text-primary' : examples.length >= 10 ? 'bg-primary/10 text-primary' : 'bg-warning/15 text-amber-800'}`}>
                      {examples.length} ví dụ
                    </Badge>
                  </div>
                  {examples.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="flex items-center gap-2 text-xs text-foreground/70">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-border"
                          checked={allPageExamplesSelected}
                          onChange={event => toggleCurrentPageExamples(event.target.checked)}
                        />
                        Chọn trang hiện tại
                      </label>
                      <Button size="sm" variant="outline" onClick={deleteSelectedExamples} disabled={selectedExampleIds.length === 0}>
                        <Trash2 className="w-4 h-4 mr-1" /> Xóa đã chọn ({selectedExampleIds.length})
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-500" onClick={deleteAllExamples}>
                        <Trash2 className="w-4 h-4 mr-1" /> Xóa tất cả
                      </Button>
                    </div>
                  )}
                </div>

                {examples.length < 10 && (
                  <div className="flex items-start gap-2 p-3 bg-warning/10 border border-amber-200 rounded-lg mb-4">
                    <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800">Cần ít nhất <strong>10 cặp ví dụ</strong> để bắt đầu training. Hiện có {examples.length}.</p>
                  </div>
                )}

                <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                  {examplePagination.pageItems.map(ex => (
                    <div key={ex.id} className="border rounded-lg p-3 bg-surface-muted">
                      <div className="flex justify-between items-start gap-3 mb-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-border"
                            checked={selectedExampleIdSet.has(String(ex.id))}
                            onChange={event => toggleExampleSelection(ex.id, event.target.checked)}
                          />
                          <Badge className="bg-primary/10 text-primary border-0 text-xs">Input</Badge>
                          {ex.industry && <Badge className="bg-muted text-foreground/70 border-0 text-[10px]">{ex.industry}</Badge>}
                          {ex.tone && <Badge className="bg-muted text-foreground/70 border-0 text-[10px]">{ex.tone}</Badge>}
                          {ex.type && <Badge className="bg-muted text-foreground/70 border-0 text-[10px]">{ex.type}</Badge>}
                          {ex.product && <Badge className="bg-muted text-foreground/70 border-0 text-[10px]">{ex.product}</Badge>}
                        </div>
                        <button onClick={() => { setExamples(prev => prev.filter(e => e.id !== ex.id)); setSelectedExampleIds(prev => prev.filter(id => id !== String(ex.id))); }} className="text-muted-foreground/80 hover:text-red-500">
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
                    <input ref={trainingFileInputRef} type="file" accept={TRAINING_IMPORT_ACCEPT} className="hidden" onChange={importTrainingExamples} />
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => trainingFileInputRef.current?.click()}>
                      <Upload className="w-4 h-4 mr-1" /> Import CSV/Excel
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
                <Play className="w-5 h-5 mr-2" /> {activeProvider?.mode === 'brand_voice' ? 'Tạo model brand voice' : activeProvider?.supportsFineTuning ? 'Bắt đầu Fine-tuning' : 'Provider chưa hỗ trợ fine-tuning'}
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
                        <p className="text-xs text-muted-foreground/80">
                          {m.trend === 'pending' || m.trend === 'estimated' ? m.prev : 'tr\u01b0\u1edbc: ' + m.prev}
                        </p>
                      </div>
                      <Badge className={`ml-3 border-0 text-xs ${getMetricBadgeClass(m)}`}>
                        {getMetricTrendLabel(m.trend)}
                      </Badge>
                    </div>
                  ))}
                </div>

                <div className="mt-5 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-xs text-primary flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    {metricHelpText}
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
                    <div key={job.id} className={`border rounded-lg p-3 ${activeTrainingJob?.id === job.id ? 'bg-primary/5 border-primary/30' : 'bg-surface-muted'}`}>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h4 className="font-semibold text-foreground truncate">{job.name}</h4>
                            <Badge className={`${statusColor(job.status)} border-0 text-xs`}>{statusLabel(job.status)}</Badge>
                            {activeTrainingJob?.id === job.id && <Badge className="bg-primary/10 text-primary border-0 text-xs">Đang xem</Badge>}
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
                        {job.status === 'ready' && (
                          <Button
                            size="sm"
                            className="bg-primary hover:bg-green-700 text-white"
                            onClick={() => useCompletedJobInGenerator(job)}
                            disabled={isApplyingFineTunedModel}
                          >
                            <Zap className="w-4 h-4 mr-1" /> {registryModelByJobId.has(String(job.id)) ? 'Dùng trong Generator' : 'Đăng ký model'}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant={activeTrainingJob?.id === job.id ? 'default' : 'outline'}
                          className={activeTrainingJob?.id === job.id ? 'bg-primary hover:bg-green-700 text-white' : ''}
                          onClick={() => setSelectedTrainingJobId(job.id)}
                        >
                          <BarChart3 className="w-4 h-4 mr-1" /> Xem tiến trình
                        </Button>
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
