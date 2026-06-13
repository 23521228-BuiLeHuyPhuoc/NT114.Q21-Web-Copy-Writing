import { api } from '@/lib/axios';

export type FineTuneUiStatus = 'ready' | 'training' | 'failed' | 'pending';
export type FineTuneProvider = 'openai' | 'vertex-gemini' | 'vertex-llama' | 'gpt-oss';

export interface TrainingLogItem {
  step: string;
  status: 'done' | 'running' | 'pending' | 'failed';
  time: string;
}

export interface FineTuneMetric {
  id: string;
  epoch: number;
  trainLoss: number;
  validationLoss: number;
  accuracy: number;
  tokenUsage: number;
  timestamp: string;
}

export interface ExamplePair {
  id: number | string;
  input: string;
  output: string;
  industry: string;
  tone?: string;
  type?: string;
  product?: string;
  qualityScore?: number;
  isValid?: boolean;
  validationErrors?: string[];
}

export interface FineTuneDataset {
  id: string;
  name: string;
  industry: string;
  description: string;
  sourceType: string;
  status: 'draft' | 'validated' | 'submitted' | 'archived';
  exampleCount: number;
  validExampleCount: number;
  qualityScore: number;
  language: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FineTuneModel {
  id: string;
  name: string;
  industry: string;
  status: FineTuneUiStatus;
  accuracy: number;
  trainedOn: number;
  samples: number;
  createdAt: string;
  baseModel: string;
  desc: string;
  description: string;
  progress: number;
  loss: number;
  epochs: number;
  datasetUrl: string;
  datasetId?: string;
  provider: FineTuneProvider | string;
  providerJobId: string;
  fineTunedModelId: string;
  started: string;
  finished: string | null;
  startedAt?: string | null;
  finishedAt?: string | null;
  user: string;
  isActive?: boolean;
  registryModelId?: string;
  trainingLog?: TrainingLogItem[];
}

export interface CreateFineTuneExamplePayload {
  input?: string;
  inputText?: string;
  output?: string;
  outputText?: string;
  industry?: string;
  tone?: string;
  type?: string;
  contentType?: string;
  product?: string;
  sourceContentId?: string | null;
}

export interface CreateFineTuneDatasetPayload {
  name: string;
  industry: string;
  description?: string;
  sourceType?: 'manual' | 'csv' | 'excel' | 'jsonl' | 'content-history';
  language?: string;
  tags?: string[];
  examples?: CreateFineTuneExamplePayload[];
}

export interface CreateFineTuneJobPayload {
  name: string;
  industry: string;
  baseModel: string;
  provider?: FineTuneProvider | string;
  description?: string;
  datasetId?: string;
  datasetUrl?: string;
  samples?: number;
  epochs?: number;
  language?: string;
  examples?: CreateFineTuneExamplePayload[];
}

export interface FineTuneBaseModelInfo {
  id: string;
  name: string;
  description?: string;
  default?: boolean;
}

export interface FineTuneProviderInfo {
  id: FineTuneProvider | string;
  name: string;
  status: 'active' | 'needs_config' | string;
  productionReady: boolean;
  apiConfigured?: boolean;
  supportsFineTuning?: boolean;
  mode?: 'real' | 'api' | string;
  isDefault?: boolean;
  message?: string;
  baseModels?: FineTuneBaseModelInfo[];
}

export interface FineTuneQuotas {
  datasetCount: number;
  runningJobs: number;
  modelCount: number;
  limits: {
    datasets: number;
    runningJobs: number;
    models: number;
    minValidExamples: number;
  };
}

interface ApiList<T> {
  items?: T[];
}

interface ApiItem<T> {
  item?: T;
}

interface ApiResponse<T> {
  data?: T;
}

interface BackendDataset {
  id?: string;
  _id?: string;
  name?: string;
  industry?: string;
  description?: string;
  sourceType?: string;
  status?: FineTuneDataset['status'];
  exampleCount?: number;
  validExampleCount?: number;
  qualityScore?: number;
  language?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface BackendExample {
  id?: string;
  _id?: string;
  input?: string;
  output?: string;
  inputText?: string;
  outputText?: string;
  industry?: string;
  tone?: string;
  type?: string;
  contentType?: string;
  product?: string;
  qualityScore?: number;
  isValid?: boolean;
  validationErrors?: string[];
}

interface BackendFineTuneJob {
  id?: string;
  _id?: string;
  userName?: string;
  userEmail?: string;
  user?: string;
  datasetId?: string;
  name?: string;
  industry?: string;
  baseModel?: string;
  provider?: string;
  description?: string;
  desc?: string;
  datasetUrl?: string;
  status?: string;
  progress?: number;
  accuracy?: number;
  loss?: number;
  samples?: number;
  trainedOn?: number;
  epochs?: number;
  providerJobId?: string;
  fineTunedModelId?: string;
  startedAt?: string | null;
  finishedAt?: string | null;
  createdAt?: string;
  trainingLog?: TrainingLogItem[];
}

interface BackendFineTunedModel {
  id?: string;
  _id?: string;
  jobId?: string;
  name?: string;
  alias?: string;
  providerModelId?: string;
  baseModel?: string;
  industry?: string;
  version?: number;
  isActive?: boolean;
  performance?: {
    accuracy?: number;
    loss?: number;
    sampleCount?: number;
  };
  deployedAt?: string;
  createdAt?: string;
}

interface BackendMetric {
  id?: string;
  _id?: string;
  epoch?: number;
  trainLoss?: number;
  validationLoss?: number;
  accuracy?: number;
  tokenUsage?: number;
  timestamp?: string;
}

const MODEL_LABELS: Record<string, string> = {
  gpt4o: 'GPT-4o',
  'gpt-4o': 'GPT-4o',
  gpt35: 'GPT-3.5 Turbo',
  'gpt-3.5-turbo': 'GPT-3.5 Turbo',
  llama3: 'Llama 3.1 70B',
  'llama-3.1-70b': 'Llama 3.1 70B',
  'llama3-8b': 'Llama 3.1 8B',
  'llama-3.1-8b': 'Llama 3.1 8B',
  'meta-llama/Llama-3.2-3B-Instruct': 'Llama 3.2 3B Instruct',
  'meta-llama/Llama-3.1-8B-Instruct': 'Llama 3.1 8B Instruct',
  'meta-llama/Llama-3.2-1B-Instruct': 'Llama 3.2 1B Instruct',
  'meta/llama3-3@llama-3.3-70b-instruct': 'Llama 3.3 70B Instruct (Vertex)',
  'openai/gpt-oss-20b': 'GPT-OSS 20B',
  'openai/gpt-oss-120b': 'GPT-OSS 120B',
};

const FINE_TUNE_JOB_REQUEST_TIMEOUT_MS = 300000;

function getStatusCode(error: unknown) {
  return (error as { response?: { status?: number } }).response?.status;
}

function shouldUseFallback(error: unknown) {
  const status = getStatusCode(error);
  return !status || status === 404;
}

function getErrorMessage(error: unknown, fallback: string) {
  const err = error as { response?: { data?: { message?: string } }; message?: string };
  return err.response?.data?.message || err.message || fallback;
}

function normalizeBaseModelForApi(value: string) {
  return value || '';
}

function formatDate(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function formatDateTime(value?: string | null) {
  if (!value) return null;
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

function normalizeStatus(status?: string): FineTuneUiStatus {
  if (status === 'completed' || status === 'ready') return 'ready';
  if (status === 'running' || status === 'training') return 'training';
  if (status === 'failed' || status === 'cancelled') return 'failed';
  return 'pending';
}

function normalizeProgress(progress: unknown, status: FineTuneUiStatus) {
  const value = Number(progress);
  if (Number.isFinite(value)) return Math.min(100, Math.max(0, Math.round(value)));
  return status === 'ready' ? 100 : 0;
}

function normalizeDataset(item: BackendDataset): FineTuneDataset {
  return {
    id: item.id || item._id || '',
    name: item.name || 'Fine-tune dataset',
    industry: item.industry || 'general',
    description: item.description || '',
    sourceType: item.sourceType || 'manual',
    status: item.status || 'draft',
    exampleCount: Number(item.exampleCount || 0),
    validExampleCount: Number(item.validExampleCount || 0),
    qualityScore: Number(item.qualityScore || 0),
    language: item.language || 'vi',
    tags: item.tags || [],
    createdAt: item.createdAt || '',
    updatedAt: item.updatedAt || '',
  };
}

function normalizeExample(item: BackendExample): ExamplePair {
  return {
    id: item.id || item._id || `ex-${Date.now()}`,
    input: item.input || item.inputText || '',
    output: item.output || item.outputText || '',
    industry: item.industry || 'general',
    tone: item.tone || '',
    type: item.type || item.contentType || '',
    product: item.product || '',
    qualityScore: Number(item.qualityScore || 0),
    isValid: Boolean(item.isValid),
    validationErrors: item.validationErrors || [],
  };
}

function normalizeJob(item: BackendFineTuneJob): FineTuneModel {
  const status = normalizeStatus(item.status);
  const samples = item.samples ?? item.trainedOn ?? 0;
  const description = item.description || item.desc || '';
  const baseModel = item.baseModel || 'Configured model';

  return {
    id: item.id || item._id || `ft-local-${Date.now()}`,
    name: item.name || 'Fine-tune job',
    industry: item.industry || 'general',
    status,
    accuracy: Number(item.accuracy || 0),
    trainedOn: samples,
    samples,
    createdAt: formatDate(item.createdAt) || formatDate(new Date().toISOString()),
    baseModel: MODEL_LABELS[baseModel] || baseModel,
    desc: description,
    description,
    progress: normalizeProgress(item.progress, status),
    loss: Number(item.loss || 0),
    epochs: item.epochs || 5,
    datasetUrl: item.datasetUrl || '',
    datasetId: item.datasetId,
    provider: item.provider || '',
    providerJobId: item.providerJobId || '',
    fineTunedModelId: item.fineTunedModelId || '',
    started: formatDateTime(item.startedAt) || '-',
    finished: formatDateTime(item.finishedAt),
    startedAt: item.startedAt,
    finishedAt: item.finishedAt,
    user: item.user || item.userName || item.userEmail || '',
    trainingLog: item.trainingLog,
  };
}

function normalizeRegistryModel(item: BackendFineTunedModel): FineTuneModel {
  const performance = item.performance || {};
  const sampleCount = Number(performance.sampleCount || 0);
  const baseModel = item.baseModel || 'Configured model';

  return {
    id: item.jobId || item.id || item._id || `model-${Date.now()}`,
    registryModelId: item.id || item._id || '',
    name: item.name || item.alias || 'Fine-tuned model',
    industry: item.industry || 'general',
    status: 'ready',
    accuracy: Number(performance.accuracy || 0),
    trainedOn: sampleCount,
    samples: sampleCount,
    createdAt: formatDate(item.createdAt || item.deployedAt) || '',
    baseModel: MODEL_LABELS[baseModel] || baseModel,
    desc: `${item.providerModelId || ''}${item.version ? ` - v${item.version}` : ''}`.trim(),
    description: item.providerModelId || '',
    progress: 100,
    loss: Number(performance.loss || 0),
    epochs: 0,
    datasetUrl: '',
    provider: item.providerModelId?.startsWith('ft:') ? 'openai' : '',
    providerJobId: '',
    fineTunedModelId: item.providerModelId || '',
    started: '-',
    finished: formatDateTime(item.deployedAt),
    user: '',
    isActive: Boolean(item.isActive),
  };
}

function normalizeMetric(item: BackendMetric): FineTuneMetric {
  return {
    id: item.id || item._id || `metric-${item.epoch ?? 0}`,
    epoch: Number(item.epoch || 0),
    trainLoss: Number(item.trainLoss || 0),
    validationLoss: Number(item.validationLoss || 0),
    accuracy: Number(item.accuracy || 0),
    tokenUsage: Number(item.tokenUsage || 0),
    timestamp: item.timestamp || '',
  };
}

function normalizeExamplesForApi(examples?: CreateFineTuneExamplePayload[]) {
  return examples?.map((example) => ({
    input: example.input || example.inputText || '',
    output: example.output || example.outputText || '',
    industry: example.industry,
    tone: example.tone || '',
    type: example.type || example.contentType || '',
    contentType: example.contentType || example.type || '',
    product: example.product || '',
    sourceContentId: example.sourceContentId || null,
  }));
}

export const fineTuningService = {
  async listDatasets(params?: { page?: number; limit?: number; search?: string; status?: string; industry?: string }) {
    const response = await api.get<ApiResponse<ApiList<BackendDataset>>>('/fine-tune/datasets', { params });
    return (response.data.data?.items || []).map(normalizeDataset);
  },

  async getDataset(id: string) {
    const response = await api.get<ApiResponse<ApiItem<BackendDataset> & { examples?: ApiList<BackendExample> }>>(`/fine-tune/datasets/${id}`);
    return {
      item: normalizeDataset(response.data.data?.item || {}),
      examples: (response.data.data?.examples?.items || []).map(normalizeExample),
    };
  },

  async createDataset(payload: CreateFineTuneDatasetPayload) {
    const response = await api.post<ApiResponse<ApiItem<BackendDataset>>>('/fine-tune/datasets', {
      ...payload,
      examples: normalizeExamplesForApi(payload.examples),
    });
    return normalizeDataset(response.data.data?.item || {});
  },

  async addExamples(datasetId: string, examples: CreateFineTuneExamplePayload[]) {
    const response = await api.post<ApiResponse<{ dataset?: BackendDataset; items?: BackendExample[] }>>(
      `/fine-tune/datasets/${datasetId}/examples`,
      { examples: normalizeExamplesForApi(examples) },
    );

    return {
      dataset: normalizeDataset(response.data.data?.dataset || {}),
      items: (response.data.data?.items || []).map(normalizeExample),
    };
  },

  async validateDataset(datasetId: string) {
    const response = await api.post<ApiResponse<ApiItem<BackendDataset>>>(`/fine-tune/datasets/${datasetId}/validate`);
    return normalizeDataset(response.data.data?.item || {});
  },

  async archiveDataset(datasetId: string) {
    const response = await api.post<ApiResponse<ApiItem<BackendDataset>>>(`/fine-tune/datasets/${datasetId}/archive`);
    return normalizeDataset(response.data.data?.item || {});
  },

  async archiveDatasets(datasetIds: string[]) {
    const response = await api.post<ApiResponse<{ archivedCount?: number; items?: BackendDataset[] }>>('/fine-tune/datasets/archive-bulk', {
      ids: datasetIds,
    });
    return {
      archivedCount: Number(response.data.data?.archivedCount || 0),
      items: (response.data.data?.items || []).map(normalizeDataset),
    };
  },

  async listJobs(params?: { page?: number; limit?: number; status?: string; industry?: string; datasetId?: string; provider?: string }) {
    try {
      const response = await api.get<ApiResponse<ApiList<BackendFineTuneJob>>>('/fine-tune/jobs', { params });
      return (response.data.data?.items || []).map(normalizeJob);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Khong the tai danh sach fine-tune jobs'));
    }
  },

  async listModels() {
    try {
      const response = await api.get<ApiResponse<ApiList<BackendFineTunedModel>>>('/fine-tune/models');
      return (response.data.data?.items || []).map(normalizeRegistryModel);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Khong the tai danh sach fine-tuned models'));
    }
  },

  async createJob(payload: CreateFineTuneJobPayload) {
    const apiPayload = {
      ...payload,
      provider: payload.provider,
      baseModel: normalizeBaseModelForApi(payload.baseModel) || undefined,
      samples: payload.samples || payload.examples?.length || 0,
      epochs: payload.epochs || 5,
      language: payload.language || 'vi',
      examples: normalizeExamplesForApi(payload.examples),
    };

    try {
      const response = await api.post<ApiResponse<ApiItem<BackendFineTuneJob>>>('/fine-tune/jobs', apiPayload, {
        timeout: FINE_TUNE_JOB_REQUEST_TIMEOUT_MS,
      });
      const item = response.data.data?.item;
      if (!item) throw new Error('Invalid fine-tune job response');
      return normalizeJob(item);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Khong the tao fine-tune job'));
    }
  },

  async cancelJob(jobId: string) {
    const response = await api.post<ApiResponse<ApiItem<BackendFineTuneJob>>>(`/fine-tune/jobs/${jobId}/cancel`);
    return normalizeJob(response.data.data?.item || {});
  },

  async retryJob(jobId: string) {
    const response = await api.post<ApiResponse<ApiItem<BackendFineTuneJob>>>(`/fine-tune/jobs/${jobId}/retry`);
    return normalizeJob(response.data.data?.item || {});
  },

  async promoteJob(jobId: string) {
    const response = await api.post<ApiResponse<ApiItem<BackendFineTunedModel>>>(`/fine-tune/jobs/${jobId}/promote`);
    return normalizeRegistryModel(response.data.data?.item || {});
  },

  async getTrainingLog(jobId?: string) {
    if (!jobId) return [] as TrainingLogItem[];

    try {
      const response = await api.get<ApiResponse<ApiList<TrainingLogItem>>>(`/fine-tune/jobs/${jobId}/logs`);
      return response.data.data?.items || [];
    } catch {
      return [] as TrainingLogItem[];
    }
  },

  async getMetrics(jobId?: string) {
    if (!jobId) return [] as FineTuneMetric[];
    const response = await api.get<ApiResponse<ApiList<BackendMetric>>>(`/fine-tune/jobs/${jobId}/metrics`);
    return (response.data.data?.items || []).map(normalizeMetric);
  },

  async getExamplePairs() {
    try {
      const datasets = await fineTuningService.listDatasets({ limit: 1 });
      const dataset = datasets[0];
      if (!dataset) return [] as ExamplePair[];
      const detail = await fineTuningService.getDataset(dataset.id);
      return detail.examples;
    } catch {
      return [] as ExamplePair[];
    }
  },

  async setModelActive(modelId: string, isActive: boolean) {
    const response = await api.patch<ApiResponse<ApiItem<BackendFineTunedModel>>>(`/fine-tune/models/${modelId}/active`, { isActive });
    return normalizeRegistryModel(response.data.data?.item || {});
  },

  async listProviders() {
    const response = await api.get<ApiResponse<ApiList<FineTuneProviderInfo>>>('/fine-tune/providers');
    return response.data.data?.items || [];
  },

  async getQuotas() {
    const response = await api.get<ApiResponse<FineTuneQuotas>>('/fine-tune/quotas');
    return response.data.data;
  },
};
