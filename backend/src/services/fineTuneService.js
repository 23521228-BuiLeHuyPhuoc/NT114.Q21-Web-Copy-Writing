const FineTuneDataset = require('../models/FineTuneDataset');
const FineTuneExample = require('../models/FineTuneExample');
const FineTuneJob = require('../models/FineTuneJob');
const FineTuneMetric = require('../models/FineTuneMetric');
const FineTunedModel = require('../models/FineTunedModel');
const createError = require('../utils/createError');
const { GoogleAuth } = require('google-auth-library');

const MIN_VALID_EXAMPLES = 10;
const GOOGLE_CLOUD_SCOPE = 'https://www.googleapis.com/auth/cloud-platform';
const DEFAULT_VERTEX_LOCATION = 'us-central1';
const VERTEX_FINE_TUNE_PROVIDER = {
  id: 'vertex-gemini',
  name: 'Vertex AI Gemini Fine-tuning',
};
let googleAuth;

const GENERATOR_MODEL_OPTIONS = [
  { id: 'gemini-flash', name: 'Gemini 2.5 Flash', provider: 'gemini' },
  { id: 'gemini-flash-lite', name: 'Gemini 2.5 Flash Lite', provider: 'gemini' },
  { id: 'groq-llama-3-3-70b', name: 'Llama 3.3 70B (Groq)', provider: 'groq' },
  { id: 'groq-llama-3-1-8b', name: 'Llama 3.1 8B Instant', provider: 'groq' },
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash Preview', provider: 'gemini' },
  { id: 'gemini-3-1-flash-lite', name: 'Gemini 3.1 Flash Lite', provider: 'gemini' },
  { id: 'gemma-4-26b', name: 'Gemma 4 26B', provider: 'gemini' },
  { id: 'openrouter-free', name: 'OpenRouter Free Router', provider: 'openrouter' },
  { id: 'freegpt4-gpt-4', name: 'GPT-4 Free Local API', provider: 'freegpt4' },
  { id: 'freegpt4-gpt-4o', name: 'GPT-4o Free Local API', provider: 'freegpt4' },
];

const VERTEX_GEMINI_MODEL_OPTIONS = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', default: true },
  { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite' },
];

const VERTEX_MODEL_ALIASES = {
  'gemini-flash': 'gemini-2.5-flash',
  'gemini-flash-lite': 'gemini-2.5-flash-lite',
};

const API_TRAINING_PROVIDERS = [
  { id: 'gemini', name: 'Gemini API', key: 'GEMINI_API_KEY' },
  { id: 'groq', name: 'Groq API', key: 'GROQ_API_KEY' },
  { id: 'openrouter', name: 'OpenRouter API', key: 'OPENROUTER_API_KEY' },
  { id: 'openai', name: 'OpenAI-compatible API', key: 'OPENAI_API_KEY' },
  { id: 'freegpt4', name: 'FreeGPT4 Local API', key: 'FREEGPT4_BASE_URL' },
];

function getConfiguredFineTuneBaseModels() {
  const configured = process.env.FINE_TUNE_BASE_MODELS;
  if (configured) {
    return parseModelList(configured);
  }

  return GENERATOR_MODEL_OPTIONS.map((model) => model.id);
}

function parseModelList(value) {
  return Array.from(new Set(
    String(value || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
  ));
}

function getConfiguredOpenAIFineTuneBaseModels() {
  const configured = process.env.OPENAI_FINE_TUNE_BASE_MODELS || process.env.FINE_TUNE_BASE_MODELS;
  const models = parseModelList(configured);
  const singleModel = String(process.env.OPENAI_FINE_TUNE_MODEL || '').trim();

  if (singleModel) models.unshift(singleModel);
  return Array.from(new Set(models));
}

function getDefaultFineTuneBaseModel() {
  return getConfiguredFineTuneBaseModels()[0] || GENERATOR_MODEL_OPTIONS[0].id;
}

function getFineTuneBaseModelOptions() {
  const configuredModels = getConfiguredFineTuneBaseModels();
  return configuredModels.map((id, index) => {
    const generatorModel = GENERATOR_MODEL_OPTIONS.find((model) => model.id === id);
    return {
      id,
      name: generatorModel?.name || id,
      default: index === 0,
    };
  });
}

function getGeneratorBaseModelOptions(providerId) {
  return GENERATOR_MODEL_OPTIONS
    .filter((model) => !providerId || model.provider === providerId)
    .map((model, index) => ({
      id: model.id,
      name: model.name,
      default: index === 0,
    }));
}

function getOpenAIInferenceBaseModelOptions() {
  const configured = parseModelList(process.env.OPENAI_MODEL);
  return configured.map((id, index) => ({
    id,
    name: id,
    default: index === 0,
  }));
}

function getOpenAIFineTuneBaseModelOptions() {
  return getConfiguredOpenAIFineTuneBaseModels().map((id, index) => ({
    id,
    name: id,
    default: index === 0,
  }));
}

function getConfiguredVertexFineTuneBaseModels() {
  const configured = process.env.VERTEX_TUNING_BASE_MODELS || process.env.VERTEX_FINE_TUNE_BASE_MODELS;
  const models = parseModelList(configured);
  const singleModel = String(process.env.VERTEX_TUNING_MODEL || process.env.VERTEX_FINE_TUNE_MODEL || '').trim();

  if (singleModel) models.unshift(singleModel);
  return Array.from(new Set(models.length > 0 ? models : VERTEX_GEMINI_MODEL_OPTIONS.map((model) => model.id)));
}

function getVertexFineTuneBaseModelOptions() {
  const models = getConfiguredVertexFineTuneBaseModels();
  return models.map((id, index) => {
    const option = VERTEX_GEMINI_MODEL_OPTIONS.find((model) => model.id === id);
    return {
      id,
      name: option?.name || id,
      default: index === 0 || option?.default === true,
    };
  });
}

function getVertexProject() {
  return String(process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || '').trim();
}

function getVertexLocation() {
  return String(process.env.GOOGLE_CLOUD_LOCATION || process.env.VERTEX_LOCATION || DEFAULT_VERTEX_LOCATION).trim();
}

function getVertexBucket() {
  return String(process.env.VERTEX_TUNING_BUCKET || process.env.GOOGLE_CLOUD_STORAGE_BUCKET || '')
    .trim()
    .replace(/^gs:\/\//, '')
    .replace(/\/+$/, '');
}

function isVertexFineTuneProviderReady() {
  return Boolean(getVertexProject() && getVertexLocation() && getVertexBucket() && typeof fetch === 'function');
}

function hasOpenAIFineTuneModelConfig() {
  return getConfiguredOpenAIFineTuneBaseModels().length > 0;
}

function isOpenAIFineTuneProviderReady() {
  return Boolean(process.env.OPENAI_API_KEY && typeof fetch === 'function' && hasOpenAIFineTuneModelConfig());
}

function getConfiguredAIProvider() {
  const provider = String(process.env.AI_PROVIDER || '').trim().toLowerCase();
  if (provider === VERTEX_FINE_TUNE_PROVIDER.id) return provider;
  return API_TRAINING_PROVIDERS.some((item) => item.id === provider) ? provider : '';
}

function getSupportedTrainingProviderIds() {
  return [VERTEX_FINE_TUNE_PROVIDER.id, ...API_TRAINING_PROVIDERS.map((provider) => provider.id)];
}

function getDefaultTrainingProvider() {
  const configuredProvider = getConfiguredAIProvider();
  if (configuredProvider === VERTEX_FINE_TUNE_PROVIDER.id && isVertexFineTuneProviderReady()) return configuredProvider;
  if (configuredProvider === 'openai' && isOpenAIFineTuneProviderReady()) return configuredProvider;
  if (isVertexFineTuneProviderReady()) return VERTEX_FINE_TUNE_PROVIDER.id;
  if (isOpenAIFineTuneProviderReady()) return 'openai';
  return VERTEX_FINE_TUNE_PROVIDER.id;
}

function shouldSubmitOpenAIFineTune(baseModel) {
  return isOpenAIFineTuneProviderReady() && getConfiguredOpenAIFineTuneBaseModels().includes(baseModel);
}

function isRemoteOpenAIJob(job) {
  return job.provider === 'openai'
    && Boolean(job.providerJobId);
}

function shouldSubmitVertexFineTune(baseModel) {
  return isVertexFineTuneProviderReady() && getConfiguredVertexFineTuneBaseModels().includes(resolveVertexBaseModelId(baseModel));
}

function isRemoteVertexJob(job) {
  return job.provider === VERTEX_FINE_TUNE_PROVIDER.id
    && Boolean(job.providerJobId);
}

function buildRunningJobQuotaFilter(userId) {
  return {
    userId,
    $or: [
      { status: { $in: ['pending', 'running'] } },
      {
        status: 'queued',
        provider: { $in: ['openai', VERTEX_FINE_TUNE_PROVIDER.id] },
        providerJobId: { $exists: true, $ne: '' },
      },
    ],
  };
}

function summarizeProviderResponse(data) {
  const directMessage = data?.error?.message || data?.message || data?.detail || data?.error;
  if (directMessage) {
    return typeof directMessage === 'string' ? directMessage : JSON.stringify(directMessage);
  }

  const serialized = JSON.stringify(data || {});
  return serialized && serialized !== '{}' ? serialized : '';
}

async function readProviderResponse(response) {
  const text = await response.text().catch(() => '');
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { message: text.slice(0, 500) };
  }
}

function providerRequestError(response, data, fallbackMessage) {
  const detail = summarizeProviderResponse(data);
  const message = detail
    ? `${fallbackMessage} (${response.status}): ${detail.slice(0, 500)}`
    : `${fallbackMessage} (${response.status})`;
  return createError(response.status, message, undefined, data);
}

function ensureVertexFineTuneConfigured() {
  if (!getVertexProject()) {
    throw createError(503, 'Vertex fine-tuning needs GOOGLE_CLOUD_PROJECT.');
  }
  if (!getVertexLocation()) {
    throw createError(503, 'Vertex fine-tuning needs GOOGLE_CLOUD_LOCATION, for example us-central1.');
  }
  if (!getVertexBucket()) {
    throw createError(503, 'Vertex fine-tuning needs VERTEX_TUNING_BUCKET for the JSONL training file.');
  }
  if (typeof fetch !== 'function') {
    throw createError(500, 'Current Node.js runtime does not support fetch.');
  }
}

function resolveVertexBaseModelId(baseModel) {
  const normalized = String(baseModel || '').trim();
  if (!normalized) return getConfiguredVertexFineTuneBaseModels()[0] || VERTEX_GEMINI_MODEL_OPTIONS[0].id;
  const withoutPublisher = normalized.replace(/^publishers\/google\/models\//, '');
  return VERTEX_MODEL_ALIASES[withoutPublisher] || withoutPublisher;
}

function toVertexPublisherModel(baseModel) {
  const modelId = resolveVertexBaseModelId(baseModel);
  if (String(baseModel || '').startsWith('publishers/google/models/')) return baseModel;
  return `publishers/google/models/${modelId}`;
}

function ensureVertexBaseModelAllowed(baseModel) {
  const modelId = resolveVertexBaseModelId(baseModel);
  const configuredModels = getConfiguredVertexFineTuneBaseModels();
  if (!configuredModels.includes(modelId)) {
    throw createError(
      400,
      `Base model ${baseModel} is not configured for Vertex Gemini fine-tuning. Use one of: ${configuredModels.join(', ')}.`,
      undefined,
      { configuredModels },
    );
  }
}

async function ensureVertexFineTuneEndpointReady(baseModel) {
  ensureVertexFineTuneConfigured();
  ensureVertexBaseModelAllowed(baseModel);
  await vertexAIRequest(
    `/projects/${getVertexProject()}/locations/${getVertexLocation()}/tuningJobs?pageSize=1`,
    {},
    'Vertex Gemini tuning preflight failed',
  );
}

async function getGoogleAccessToken() {
  ensureVertexFineTuneConfigured();
  googleAuth = googleAuth || new GoogleAuth({ scopes: [GOOGLE_CLOUD_SCOPE] });
  const client = await googleAuth.getClient();
  const tokenResponse = await client.getAccessToken();
  const token = typeof tokenResponse === 'string' ? tokenResponse : tokenResponse?.token;
  if (!token) throw createError(503, 'Could not read Google ADC access token. Run gcloud auth application-default login.');
  return token;
}

async function googleJsonRequest(url, options = {}, fallbackMessage = 'Google request failed') {
  const token = await getGoogleAccessToken();
  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await readProviderResponse(response);
  if (!response.ok) {
    throw providerRequestError(response, data, fallbackMessage);
  }
  return data;
}

async function vertexAIRequest(path, options = {}, fallbackMessage = 'Vertex AI request failed') {
  const location = getVertexLocation();
  const normalizedPath = String(path || '').replace(/^\/+/, '');
  return googleJsonRequest(
    `https://${location}-aiplatform.googleapis.com/v1/${normalizedPath}`,
    options,
    fallbackMessage,
  );
}

async function uploadVertexTrainingFile(job, examples) {
  const bucket = getVertexBucket();
  const objectName = `fine-tuning/${slugify(job.name)}-${job._id.toString()}.jsonl`;
  const token = await getGoogleAccessToken();
  const response = await fetch(
    `https://storage.googleapis.com/upload/storage/v1/b/${encodeURIComponent(bucket)}/o?uploadType=media&name=${encodeURIComponent(objectName)}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/jsonl; charset=utf-8',
      },
      body: buildVertexTrainingJsonl(examples),
    },
  );

  const data = await readProviderResponse(response);
  if (!response.ok) {
    throw providerRequestError(response, data, 'Vertex training file upload to Cloud Storage failed');
  }

  return `gs://${bucket}/${objectName}`;
}

function buildVertexTrainingJsonl(examples) {
  const systemPrefix = 'You are a senior Vietnamese marketing copywriter. Follow the user brief and write clear, conversion-focused copy.';
  return `${examples
    .map((example) => JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrefix}\n\nBrief:\n${example.inputText}` }],
        },
        {
          role: 'model',
          parts: [{ text: example.outputText }],
        },
      ],
    }))
    .join('\n')}\n`;
}

function getVertexJobState(providerJob) {
  return providerJob.state || providerJob.status || providerJob.jobState || '';
}

function getVertexTunedModelId(providerJob) {
  return providerJob.tunedModel?.endpoint
    || providerJob.tuned_model?.endpoint
    || providerJob.tunedModel?.model
    || providerJob.tuned_model?.model
    || '';
}

function mapVertexStatus(providerJob) {
  const normalized = String(getVertexJobState(providerJob)).toLowerCase();
  if (normalized.includes('succeed') || normalized.includes('complete')) return 'completed';
  if (normalized.includes('fail') || normalized.includes('error') || normalized.includes('expired')) return 'failed';
  if (normalized.includes('cancel')) return 'cancelled';
  if (normalized.includes('running')) return 'running';
  if (normalized.includes('queued')) return 'queued';
  if (normalized.includes('pending')) return 'pending';
  return providerJob.name ? 'queued' : 'pending';
}

function getVertexErrorMessage(providerJob) {
  const error = providerJob.error;
  if (!error) return '';
  if (typeof error === 'string') return error;
  return error.message || JSON.stringify(error).slice(0, 1000);
}

function getVertexBillableTokens(providerJob) {
  return Number(
    providerJob.tuningDataStats?.supervisedTuningDataStats?.totalBillableTokenCount
    || providerJob.tuning_data_stats?.supervised_tuning_data_stats?.total_billable_token_count
    || providerJob.tuningDataStats?.totalBillableTokenCount
    || providerJob.tuning_data_stats?.total_billable_token_count
    || 0,
  );
}
function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toId(value) {
  if (!value) return null;
  if (value._id) return value._id.toString();
  return value.toString();
}

function normalizePage(query = {}) {
  return Math.max(1, Number(query.page || 1));
}

function normalizeLimit(query = {}) {
  return Math.min(100, Math.max(1, Number(query.limit || 10)));
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120) || 'fine-tuned-model';
}

function estimateTokens(text) {
  return Math.max(1, Math.ceil(String(text || '').length / 4));
}

function estimateCost(exampleCount, baseModel) {
  const modelRate = baseModel === 'gpt-4o' ? 0.006 : 0.002;
  return Number((Math.max(1, exampleCount) * modelRate).toFixed(4));
}

function estimateTrainingCostFromTokens(tokens, baseModel) {
  if (!tokens) return 0;
  const modelRatePerThousand = baseModel === 'gpt-4o' ? 0.006 : 0.002;
  return Number(((Number(tokens) / 1000) * modelRatePerThousand).toFixed(4));
}

function dateFromUnixSeconds(value) {
  if (!value) return null;
  return new Date(Number(value) * 1000);
}

function toFiniteNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function clampProgress(value, fallback = 0) {
  const numeric = toFiniteNumber(value);
  if (numeric === null) return fallback;
  return Math.min(100, Math.max(0, Math.round(numeric)));
}

function progressFromFraction(done, total, start = 0, end = 100) {
  const doneNumber = toFiniteNumber(done);
  const totalNumber = toFiniteNumber(total);
  if (doneNumber === null || totalNumber === null || totalNumber <= 0) return null;
  const fraction = Math.min(1, Math.max(0, doneNumber / totalNumber));
  return clampProgress(start + fraction * (end - start));
}

function readPath(source, path) {
  if (!source || typeof source !== 'object') return undefined;
  return String(path).split('.').reduce((current, key) => (
    current && typeof current === 'object' ? current[key] : undefined
  ), source);
}

function pickNumber(source, paths) {
  for (const path of paths) {
    const numeric = toFiniteNumber(readPath(source, path));
    if (numeric !== null) return numeric;
  }
  return null;
}

function parseMessageProgress(message) {
  const text = String(message || '');
  const percentMatch = text.match(/\b(?:progress|complete|completed|done)\D{0,24}(\d+(?:\.\d+)?)\s*%/i)
    || text.match(/(\d+(?:\.\d+)?)\s*%\s*(?:progress|complete|completed|done)\b/i);
  if (percentMatch) return clampProgress(percentMatch[1]);

  const stepMatch = text.match(/\b(?:step|steps|epoch|epochs)\s+(\d+(?:\.\d+)?)\s*(?:\/|of)\s*(\d+(?:\.\d+)?)/i);
  if (stepMatch) return progressFromFraction(stepMatch[1], stepMatch[2], 10, 95);

  return null;
}

function getTrainingEpochCount(job, providerJob = {}) {
  return pickNumber(providerJob, [
    'hyperparameters.n_epochs',
    'method.supervised.hyperparameters.n_epochs',
    'supervisedTuningSpec.hyperParameters.epochCount',
    'supervised_tuning_spec.hyper_parameters.epoch_count',
  ]) || Math.max(1, Number(job.epochs || 1));
}

function getStatusFallbackProgress(job, status) {
  if (status === 'completed') return 100;
  if (['failed', 'cancelled'].includes(status)) return clampProgress(job.progress || 0);

  const createdAt = new Date(job.createdAt || Date.now()).getTime();
  const startedAt = new Date(job.startedAt || job.createdAt || Date.now()).getTime();
  const now = Date.now();

  if (['pending', 'queued'].includes(status)) {
    return progressFromFraction(now - createdAt, 60 * 1000, 0, 10) || 0;
  }

  if (status === 'running') {
    const samples = Math.max(1, Number(job.samples || 1));
    const epochs = Math.max(1, Number(job.epochs || 1));
    const estimatedDurationMs = Math.min(60 * 60 * 1000, Math.max(2 * 60 * 1000, samples * epochs * 3000));
    return progressFromFraction(now - startedAt, estimatedDurationMs, 15, 95) || 15;
  }

  return clampProgress(job.progress || 0);
}

function collectProgressFromSources(job, providerJob, sources) {
  const totalSteps = pickNumber(providerJob, [
    'total_steps',
    'training_steps',
    'estimated_total_steps',
    'method.supervised.training_steps',
  ]);
  const totalEpochs = getTrainingEpochCount(job, providerJob);
  const candidates = [];

  for (const source of sources) {
    if (!source || typeof source !== 'object') continue;

    const step = pickNumber(source, [
      'step',
      'train_step',
      'training_step',
      'current_step',
      'step_number',
      'data.step',
      'data.train_step',
      'data.current_step',
      'data.step_number',
      'metrics.step',
    ]);
    const sourceTotalSteps = pickNumber(source, [
      'total_steps',
      'num_steps',
      'training_steps',
      'step_count',
      'data.total_steps',
      'data.num_steps',
      'data.training_steps',
      'metrics.total_steps',
    ]) || totalSteps;
    const stepProgress = progressFromFraction(step, sourceTotalSteps, 10, 95);
    if (stepProgress !== null) candidates.push(stepProgress);

    const epoch = pickNumber(source, [
      'epoch',
      'current_epoch',
      'data.epoch',
      'data.current_epoch',
      'metrics.epoch',
    ]);
    const sourceTotalEpochs = pickNumber(source, [
      'total_epochs',
      'num_epochs',
      'data.total_epochs',
      'data.num_epochs',
      'metrics.total_epochs',
    ]) || totalEpochs;
    const epochProgress = progressFromFraction(epoch, sourceTotalEpochs, 10, 95);
    if (epochProgress !== null) candidates.push(epochProgress);

    const messageProgress = parseMessageProgress(source.message || source.type || source.name);
    if (messageProgress !== null) candidates.push(messageProgress);
  }

  return candidates.length > 0 ? Math.max(...candidates) : null;
}

async function getSeedTokenUsage(userId, jobId) {
  const metric = await FineTuneMetric.findOne({ userId, jobId, epoch: 0 }).sort({ createdAt: 1 });
  return Number(metric?.tokenUsage || 0);
}

async function getOpenAITrainedTokenProgress(job, providerJob) {
  const trainedTokens = pickNumber(providerJob, ['trained_tokens']);
  if (!trainedTokens || trainedTokens <= 0) return null;

  const seedTokenUsage = await getSeedTokenUsage(job.userId?._id || job.userId, job._id);
  const totalTokens = seedTokenUsage * getTrainingEpochCount(job, providerJob);
  return progressFromFraction(trainedTokens, totalTokens, 10, 95);
}

function estimateOpenAITotalSteps(job, providerJob) {
  const explicitSteps = pickNumber(providerJob, [
    'total_steps',
    'training_steps',
    'estimated_total_steps',
    'method.supervised.training_steps',
  ]);
  if (explicitSteps) return explicitSteps;

  const batchSize = pickNumber(providerJob, [
    'hyperparameters.batch_size',
    'method.supervised.hyperparameters.batch_size',
  ]);
  if (!batchSize || batchSize <= 0) return null;

  return Math.ceil(Math.max(1, Number(job.samples || 1)) / batchSize) * getTrainingEpochCount(job, providerJob);
}

function getOpenAICheckpointProgress(job, providerJob, checkpoints) {
  const totalSteps = estimateOpenAITotalSteps(job, providerJob);
  const sources = checkpoints.map((checkpoint) => ({ ...checkpoint, total_steps: totalSteps }));
  return collectProgressFromSources(job, providerJob, sources);
}

async function calculateOpenAIProgress(job, providerJob, mappedStatus, events = [], checkpoints = []) {
  if (mappedStatus === 'completed') return 100;
  if (['failed', 'cancelled'].includes(mappedStatus)) return clampProgress(job.progress || 0);

  const eventSources = events.flatMap((event) => [event, event.data, event.metrics].filter(Boolean));
  const candidates = [
    collectProgressFromSources(job, providerJob, [providerJob, ...eventSources]),
    getOpenAICheckpointProgress(job, providerJob, checkpoints),
    await getOpenAITrainedTokenProgress(job, providerJob),
  ].filter((value) => value !== null);

  if (candidates.length > 0) return clampProgress(Math.max(...candidates));
  return getStatusFallbackProgress(job, mappedStatus);
}

function getVertexCheckpoints(providerJob) {
  const checkpoints = providerJob.tunedModel?.checkpoints
    || providerJob.tuned_model?.checkpoints
    || [];
  return Array.isArray(checkpoints) ? checkpoints : [];
}

function getVertexTotalSteps(providerJob) {
  return pickNumber(providerJob, [
    'tuningDataStats.supervisedTuningDataStats.tuningStepCount',
    'tuning_data_stats.supervised_tuning_data_stats.tuning_step_count',
    'tuningDataStats.tuningStepCount',
    'tuning_data_stats.tuning_step_count',
  ]);
}

function calculateVertexProgress(job, providerJob, mappedStatus) {
  if (mappedStatus === 'completed') return 100;
  if (['failed', 'cancelled'].includes(mappedStatus)) return clampProgress(job.progress || 0);

  const explicitProgress = pickNumber(providerJob, [
    'progressPercent',
    'progress_percentage',
    'metadata.progressPercent',
    'metadata.progress_percentage',
  ]);
  if (explicitProgress !== null) return clampProgress(explicitProgress <= 1 ? explicitProgress * 100 : explicitProgress);

  const totalSteps = getVertexTotalSteps(providerJob);
  const checkpoints = getVertexCheckpoints(providerJob).map((checkpoint) => ({ ...checkpoint, total_steps: totalSteps }));
  const checkpointProgress = collectProgressFromSources(job, providerJob, checkpoints);
  if (checkpointProgress !== null) return checkpointProgress;

  return getStatusFallbackProgress(job, mappedStatus);
}

function mapProviderStatus(status) {
  const normalized = String(status || '').toLowerCase();
  if (['succeeded', 'completed'].includes(normalized)) return 'completed';
  if (['failed'].includes(normalized)) return 'failed';
  if (['cancelled', 'canceled'].includes(normalized)) return 'cancelled';
  if (['running'].includes(normalized)) return 'running';
  if (['queued', 'validating_files'].includes(normalized)) return 'queued';
  return 'pending';
}

function ensureOpenAIConfigured() {
  if (!process.env.OPENAI_API_KEY || typeof fetch !== 'function') {
    throw createError(503, 'OpenAI fine-tuning is not configured');
  }
}

function getOpenAIBaseUrl() {
  return (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
}

async function openAIRequest(path, options = {}) {
  ensureOpenAIConfigured();
  const response = await fetch(`${getOpenAIBaseUrl()}${path}`, {
    method: options.method || 'GET',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await readProviderResponse(response);
  if (!response.ok) {
    throw providerRequestError(response, data, 'OpenAI fine-tuning request failed');
  }

  return data;
}

function ensureOpenAIFineTuneConfigured() {
  ensureOpenAIConfigured();
  if (!hasOpenAIFineTuneModelConfig()) {
    throw createError(
      503,
      'OpenAI fine-tuning needs OPENAI_FINE_TUNE_MODEL or OPENAI_FINE_TUNE_BASE_MODELS. AI Generator models are not automatically fine-tunable.',
    );
  }
}

function ensureOpenAIBaseModelAllowed(baseModel) {
  const configuredModels = getConfiguredOpenAIFineTuneBaseModels();
  if (!configuredModels.includes(baseModel)) {
    throw createError(
      400,
      `Base model ${baseModel} is not configured for real OpenAI fine-tuning. Add it to OPENAI_FINE_TUNE_BASE_MODELS or choose a configured real fine-tuning provider.`,
      undefined,
      { configuredModels },
    );
  }
}

async function ensureOpenAIFineTuneEndpointReady() {
  ensureOpenAIFineTuneConfigured();

  const endpoints = [
    { path: '/files', label: 'file upload' },
    { path: '/fine_tuning/jobs', label: 'fine-tuning jobs' },
  ];

  for (const endpoint of endpoints) {
    const response = await fetch(`${getOpenAIBaseUrl()}${endpoint.path}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    });
    const data = await readProviderResponse(response);

    if (response.status === 404) {
      throw createError(
        503,
        `OPENAI_BASE_URL does not support ${endpoint.path}; cannot run real ${endpoint.label} fine-tuning.`,
        undefined,
        data,
      );
    }

    if (!response.ok) {
      throw providerRequestError(response, data, `OpenAI ${endpoint.label} preflight failed`);
    }
  }
}

function getUnsupportedRealFineTuneMessage(provider) {
  if (provider === VERTEX_FINE_TUNE_PROVIDER.id) {
    return 'Vertex Gemini fine-tuning needs GOOGLE_CLOUD_PROJECT, GOOGLE_CLOUD_LOCATION, VERTEX_TUNING_BUCKET, and working Application Default Credentials.';
  }

  if (provider === 'openai') {
    return 'OpenAI-compatible API is configured for generation only. Set OPENAI_FINE_TUNE_MODEL or OPENAI_FINE_TUNE_BASE_MODELS and use an endpoint that supports /files and /fine_tuning/jobs.';
  }

  if (provider === 'freegpt4') {
    return 'FreeGPT4 Local API only exposes text generation in this app. It does not provide /files or /fine_tuning/jobs, so real fine-tuning cannot be submitted through this provider.';
  }

  return `${provider} API is configured for generation, but this app does not have a real fine-tuning adapter for that provider.`;
}

function buildTrainingJsonl(examples) {
  return examples
    .map((example) => JSON.stringify({
      messages: [
        {
          role: 'system',
          content: 'You are a senior Vietnamese marketing copywriter. Follow the user brief and write clear, conversion-focused copy.',
        },
        { role: 'user', content: example.inputText },
        { role: 'assistant', content: example.outputText },
      ],
    }))
    .join('\n');
}

async function uploadOpenAITrainingFile(job, examples) {
  ensureOpenAIConfigured();
  if (typeof FormData !== 'function' || typeof Blob !== 'function') {
    throw createError(500, 'Current Node.js runtime does not support FormData upload');
  }

  const form = new FormData();
  const fileName = `${slugify(job.name)}-${job._id.toString()}.jsonl`;
  form.append('purpose', 'fine-tune');
  form.append('file', new Blob([buildTrainingJsonl(examples)], { type: 'application/jsonl' }), fileName);

  const response = await fetch(`${getOpenAIBaseUrl()}/files`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: form,
  });

  const data = await readProviderResponse(response);
  if (!response.ok) {
    throw providerRequestError(response, data, 'OpenAI file upload failed');
  }

  return data;
}

async function submitOpenAIFineTuneJob(job) {
  ensureOpenAIFineTuneConfigured();
  ensureOpenAIBaseModelAllowed(job.baseModel);

  const examples = await FineTuneExample.find({
    datasetId: job.datasetId,
    userId: job.userId,
    isValid: true,
  }).sort({ createdAt: 1 });

  const file = await uploadOpenAITrainingFile(job, examples);
  const providerJob = await openAIRequest('/fine_tuning/jobs', {
    method: 'POST',
    body: {
      model: job.baseModel,
      training_file: file.id,
      suffix: slugify(job.name).slice(0, 40),
      method: {
        type: 'supervised',
        supervised: {
          hyperparameters: {
            n_epochs: job.epochs,
          },
        },
      },
      metadata: {
        local_job_id: job._id.toString(),
        user_id: toId(job.userId),
        dataset_id: toId(job.datasetId),
      },
    },
  });

  job.providerJobId = providerJob.id || '';
  job.status = mapProviderStatus(providerJob.status);
  job.progress = await calculateOpenAIProgress(job, providerJob, job.status);
  job.startedAt = dateFromUnixSeconds(providerJob.created_at) || job.startedAt;
  job.finishedAt = dateFromUnixSeconds(providerJob.finished_at) || job.finishedAt;
  job.fineTunedModelId = providerJob.fine_tuned_model || '';
  job.errorMessage = providerJob.error?.message || '';
  await job.save();
  return job;
}

async function syncOpenAIFineTuneJob(job) {
  if (!isRemoteOpenAIJob(job)) return job;

  const providerJob = await openAIRequest(`/fine_tuning/jobs/${job.providerJobId}`);
  const mappedStatus = mapProviderStatus(providerJob.status);
  const [events, checkpoints] = ['pending', 'queued', 'running'].includes(mappedStatus)
    ? await Promise.all([
      listOpenAIEvents(job).catch(() => []),
      listOpenAICheckpoints(job).catch(() => []),
    ])
    : [[], []];

  job.status = mappedStatus;
  job.progress = await calculateOpenAIProgress(job, providerJob, mappedStatus, events, checkpoints);
  job.startedAt = dateFromUnixSeconds(providerJob.created_at) || job.startedAt;
  job.finishedAt = dateFromUnixSeconds(providerJob.finished_at) || job.finishedAt;
  job.fineTunedModelId = providerJob.fine_tuned_model || job.fineTunedModelId || '';
  job.errorMessage = providerJob.error?.message || '';
  job.actualCost = estimateTrainingCostFromTokens(providerJob.trained_tokens, job.baseModel) || job.actualCost || 0;

  await job.save();
  if (job.status === 'completed') {
    await createFineTunedModelFromJob(job).catch((error) => {
      console.warn(`OpenAI fine-tuned model registration failed: ${error.message}`);
    });
  }
  return job;
}

async function cancelOpenAIFineTuneJob(job) {
  if (!isRemoteOpenAIJob(job)) return null;
  return openAIRequest(`/fine_tuning/jobs/${job.providerJobId}/cancel`, { method: 'POST' });
}

async function listOpenAIEvents(job) {
  if (!isRemoteOpenAIJob(job)) return [];
  const data = await openAIRequest(`/fine_tuning/jobs/${job.providerJobId}/events?limit=50`);
  return Array.isArray(data.data) ? data.data : [];
}

async function listOpenAICheckpoints(job) {
  if (!isRemoteOpenAIJob(job)) return [];
  const data = await openAIRequest(`/fine_tuning/jobs/${job.providerJobId}/checkpoints?limit=20`);
  return Array.isArray(data.data) ? data.data : [];
}

async function submitVertexGeminiFineTuneJob(job) {
  ensureVertexFineTuneConfigured();
  ensureVertexBaseModelAllowed(job.baseModel);

  const examples = await FineTuneExample.find({
    datasetId: job.datasetId,
    userId: job.userId,
    isValid: true,
  }).sort({ createdAt: 1 });

  const trainingDatasetUri = await uploadVertexTrainingFile(job, examples);
  job.datasetUrl = trainingDatasetUri;
  job.status = 'pending';
  job.progress = Math.max(job.progress || 0, 5);
  await job.save();

  const providerJob = await vertexAIRequest(
    `/projects/${getVertexProject()}/locations/${getVertexLocation()}/tuningJobs`,
    {
      method: 'POST',
      body: {
        baseModel: toVertexPublisherModel(job.baseModel),
        tunedModelDisplayName: slugify(job.name).slice(0, 63),
        supervisedTuningSpec: {
          trainingDatasetUri,
          exportLastCheckpointOnly: false,
          hyperParameters: {
            epochCount: job.epochs,
          },
        },
      },
    },
    'Vertex Gemini tuning job creation failed',
  );

  job.providerJobId = providerJob.name || '';
  job.status = mapVertexStatus(providerJob);
  job.progress = calculateVertexProgress(job, providerJob, job.status);
  job.startedAt = job.startedAt || new Date();
  job.fineTunedModelId = getVertexTunedModelId(providerJob) || '';
  job.errorMessage = getVertexErrorMessage(providerJob);
  await job.save();
  return job;
}

async function syncVertexGeminiFineTuneJob(job) {
  if (!isRemoteVertexJob(job)) return job;

  const providerJob = await vertexAIRequest(job.providerJobId, {}, 'Vertex Gemini tuning job sync failed');
  const mappedStatus = mapVertexStatus(providerJob);
  const billableTokens = getVertexBillableTokens(providerJob);

  job.status = mappedStatus;
  job.progress = calculateVertexProgress(job, providerJob, mappedStatus);
  job.fineTunedModelId = getVertexTunedModelId(providerJob) || job.fineTunedModelId || '';
  job.errorMessage = getVertexErrorMessage(providerJob);
  job.actualCost = estimateTrainingCostFromTokens(billableTokens, job.baseModel) || job.actualCost || 0;
  if (['completed', 'failed', 'cancelled'].includes(mappedStatus)) job.finishedAt = job.finishedAt || new Date();
  if (['running', 'completed'].includes(mappedStatus)) job.startedAt = job.startedAt || job.createdAt || new Date();

  await job.save();
  if (job.status === 'completed') {
    await createFineTunedModelFromJob(job).catch((error) => {
      console.warn(`Vertex fine-tuned model registration failed: ${error.message}`);
    });
  }
  return job;
}

async function cancelVertexGeminiFineTuneJob(job) {
  if (!isRemoteVertexJob(job)) return null;
  return vertexAIRequest(`${job.providerJobId}:cancel`, { method: 'POST', body: {} }, 'Vertex Gemini tuning job cancel failed');
}

function serializeDataset(dataset) {
  return {
    id: dataset._id.toString(),
    _id: dataset._id.toString(),
    userId: toId(dataset.userId),
    name: dataset.name,
    industry: dataset.industry || 'general',
    description: dataset.description || '',
    sourceType: dataset.sourceType,
    status: dataset.status,
    exampleCount: dataset.exampleCount || 0,
    validExampleCount: dataset.validExampleCount || 0,
    qualityScore: dataset.qualityScore || 0,
    language: dataset.language || 'vi',
    tags: dataset.tags || [],
    lastValidatedAt: dataset.lastValidatedAt,
    archivedAt: dataset.archivedAt,
    createdAt: dataset.createdAt,
    updatedAt: dataset.updatedAt,
  };
}

function serializeExample(example) {
  return {
    id: example._id.toString(),
    _id: example._id.toString(),
    datasetId: toId(example.datasetId),
    userId: toId(example.userId),
    input: example.inputText,
    output: example.outputText,
    inputText: example.inputText,
    outputText: example.outputText,
    industry: example.industry || 'general',
    tone: example.tone || '',
    qualityScore: example.qualityScore || 0,
    isValid: Boolean(example.isValid),
    validationErrors: example.validationErrors || [],
    sourceContentId: toId(example.sourceContentId),
    createdAt: example.createdAt,
    updatedAt: example.updatedAt,
  };
}

function serializeFineTuneJob(job) {
  const owner = job.userId && typeof job.userId === 'object' ? job.userId : null;

  return {
    id: job._id.toString(),
    _id: job._id.toString(),
    userId: toId(job.userId),
    userName: owner?.name || '',
    userEmail: owner?.email || '',
    datasetId: toId(job.datasetId),
    name: job.name,
    industry: job.industry || 'general',
    baseModel: job.baseModel,
    provider: job.provider || '',
    description: job.description || '',
    desc: job.description || '',
    datasetUrl: job.datasetUrl || '',
    status: job.status,
    progress: job.progress || 0,
    samples: job.samples || 0,
    trainedOn: job.samples || 0,
    epochs: job.epochs || 5,
    accuracy: job.accuracy || 0,
    loss: job.loss || 0,
    estimatedCost: job.estimatedCost || 0,
    actualCost: job.actualCost || 0,
    errorMessage: job.errorMessage || '',
    providerJobId: job.providerJobId || '',
    fineTunedModelId: job.fineTunedModelId || '',
    startedAt: job.startedAt,
    finishedAt: job.finishedAt,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  };
}

function serializeMetric(metric) {
  return {
    id: metric._id.toString(),
    jobId: toId(metric.jobId),
    userId: toId(metric.userId),
    epoch: metric.epoch,
    trainLoss: metric.trainLoss,
    validationLoss: metric.validationLoss,
    accuracy: metric.accuracy,
    tokenUsage: metric.tokenUsage,
    timestamp: metric.timestamp,
  };
}

function serializeModel(model) {
  return {
    id: model._id.toString(),
    _id: model._id.toString(),
    jobId: toId(model.jobId),
    userId: toId(model.userId),
    name: model.name,
    alias: model.alias,
    providerModelId: model.providerModelId,
    baseModel: model.baseModel,
    industry: model.industry || 'general',
    version: model.version || 1,
    isActive: Boolean(model.isActive),
    isDeprecated: Boolean(model.isDeprecated),
    performance: model.performance || {},
    deployedAt: model.deployedAt,
    deactivatedAt: model.deactivatedAt,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  };
}

function buildSearchFilter(search, fields) {
  if (!search) return {};
  const regex = new RegExp(escapeRegExp(search), 'i');
  return { $or: fields.map((field) => ({ [field]: regex })) };
}

function validateExamplePayload(payload) {
  const inputText = String(payload.inputText || payload.input || '').trim();
  const outputText = String(payload.outputText || payload.output || '').trim();
  const errors = [];

  if (inputText.length < 10) errors.push('Input must contain at least 10 characters');
  if (outputText.length < 20) errors.push('Output must contain at least 20 characters');
  if (inputText.length > 8000) errors.push('Input is too long');
  if (outputText.length > 20000) errors.push('Output is too long');
  if (/\b(password|secret|api[_-]?key|token)\b/i.test(`${inputText} ${outputText}`)) {
    errors.push('Potential sensitive credential detected');
  }

  const lengthScore = Math.min(60, Math.floor((inputText.length + outputText.length) / 20));
  const structureScore = /[.!?\n]/.test(outputText) ? 20 : 10;
  const contextScore = inputText.split(/\s+/).length >= 5 ? 20 : 10;
  const qualityScore = errors.length > 0 ? Math.min(50, lengthScore) : Math.min(100, lengthScore + structureScore + contextScore);

  return {
    inputText,
    outputText,
    qualityScore,
    isValid: errors.length === 0,
    validationErrors: errors,
  };
}

async function refreshDatasetStats(datasetId) {
  const rows = await FineTuneExample.aggregate([
    { $match: { datasetId } },
    {
      $group: {
        _id: '$datasetId',
        exampleCount: { $sum: 1 },
        validExampleCount: { $sum: { $cond: ['$isValid', 1, 0] } },
        qualityScore: { $avg: '$qualityScore' },
      },
    },
  ]);

  const stats = rows[0] || { exampleCount: 0, validExampleCount: 0, qualityScore: 0 };
  const dataset = await FineTuneDataset.findById(datasetId);
  if (!dataset) return null;

  dataset.exampleCount = stats.exampleCount || 0;
  dataset.validExampleCount = stats.validExampleCount || 0;
  dataset.qualityScore = Math.round(stats.qualityScore || 0);
  if (dataset.status !== 'submitted' && dataset.status !== 'archived') {
    dataset.status = dataset.validExampleCount >= MIN_VALID_EXAMPLES ? 'validated' : 'draft';
  }
  dataset.lastValidatedAt = new Date();
  await dataset.save();
  return dataset;
}

async function findDatasetOrThrow(userId, id) {
  const dataset = await FineTuneDataset.findOne({ _id: id, userId });
  if (!dataset) throw createError(404, 'Fine-tune dataset not found');
  return dataset;
}

async function listDatasets(userId, query = {}) {
  const page = normalizePage(query);
  const limit = normalizeLimit(query);
  const filter = {
    userId,
    ...buildSearchFilter(query.search, ['name', 'description', 'industry']),
  };

  if (query.status) filter.status = query.status;
  if (query.industry) filter.industry = query.industry;

  const [totalItems, datasets] = await Promise.all([
    FineTuneDataset.countDocuments(filter),
    FineTuneDataset.find(filter).sort({ updatedAt: -1, createdAt: -1 }).skip((page - 1) * limit).limit(limit),
  ]);

  return {
    items: datasets.map(serializeDataset),
    pagination: { page, limit, totalItems, totalPages: Math.max(1, Math.ceil(totalItems / limit)) },
  };
}

async function getDataset(userId, id, query = {}) {
  const dataset = await findDatasetOrThrow(userId, id);
  const examples = await listExamples(userId, id, query);
  return { item: serializeDataset(dataset), examples };
}

async function createDataset(userId, payload) {
  const dataset = await FineTuneDataset.create({
    userId,
    name: payload.name,
    industry: payload.industry || 'general',
    description: payload.description || '',
    sourceType: payload.sourceType || 'manual',
    language: payload.language || 'vi',
    tags: payload.tags || [],
  });

  if (payload.examples?.length) {
    await addExamples(userId, dataset._id, { examples: payload.examples });
    const refreshed = await FineTuneDataset.findById(dataset._id);
    return serializeDataset(refreshed || dataset);
  }

  return serializeDataset(dataset);
}

async function updateDataset(userId, id, payload) {
  const dataset = await findDatasetOrThrow(userId, id);
  if (dataset.status === 'submitted') throw createError(409, 'Submitted dataset cannot be edited');

  if (payload.name !== undefined) dataset.name = payload.name;
  if (payload.industry !== undefined) dataset.industry = payload.industry || 'general';
  if (payload.description !== undefined) dataset.description = payload.description || '';
  if (payload.language !== undefined) dataset.language = payload.language || 'vi';
  if (payload.tags !== undefined) dataset.tags = payload.tags || [];
  await dataset.save();
  return serializeDataset(dataset);
}

async function addExamples(userId, datasetId, payload) {
  const dataset = await findDatasetOrThrow(userId, datasetId);
  if (dataset.status === 'submitted') throw createError(409, 'Submitted dataset cannot be edited');

  const examples = (payload.examples || []).map((item) => {
    const validated = validateExamplePayload(item);
    return {
      datasetId: dataset._id,
      userId,
      inputText: validated.inputText,
      outputText: validated.outputText,
      industry: item.industry || dataset.industry,
      tone: item.tone || '',
      qualityScore: validated.qualityScore,
      isValid: validated.isValid,
      validationErrors: validated.validationErrors,
      sourceContentId: item.sourceContentId || null,
    };
  });

  if (examples.length === 0) throw createError(400, 'At least one example is required');

  const inserted = await FineTuneExample.insertMany(examples, { ordered: false });
  const refreshed = await refreshDatasetStats(dataset._id);

  return {
    dataset: serializeDataset(refreshed || dataset),
    items: inserted.map(serializeExample),
  };
}

async function listExamples(userId, datasetId, query = {}) {
  await findDatasetOrThrow(userId, datasetId);
  const page = normalizePage(query);
  const limit = normalizeLimit(query);
  const filter = { datasetId, userId };
  if (query.validOnly === true || query.validOnly === 'true') filter.isValid = true;

  const [totalItems, examples] = await Promise.all([
    FineTuneExample.countDocuments(filter),
    FineTuneExample.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
  ]);

  return {
    items: examples.map(serializeExample),
    pagination: { page, limit, totalItems, totalPages: Math.max(1, Math.ceil(totalItems / limit)) },
  };
}

async function validateDataset(userId, id) {
  const dataset = await findDatasetOrThrow(userId, id);
  const examples = await FineTuneExample.find({ datasetId: dataset._id, userId });

  for (const example of examples) {
    const validated = validateExamplePayload(example);
    example.qualityScore = validated.qualityScore;
    example.isValid = validated.isValid;
    example.validationErrors = validated.validationErrors;
    await example.save();
  }

  const refreshed = await refreshDatasetStats(dataset._id);
  return serializeDataset(refreshed || dataset);
}

async function archiveDataset(userId, id) {
  const dataset = await findDatasetOrThrow(userId, id);
  dataset.status = 'archived';
  dataset.archivedAt = new Date();
  await dataset.save();
  return serializeDataset(dataset);
}

async function findFineTuneJobOrThrow(userId, id) {
  const job = await FineTuneJob.findOne({ _id: id, userId }).populate('userId', 'name email');
  if (!job || job.provider === 'mock') throw createError(404, 'Fine-tune job not found');
  return job;
}

async function listFineTuneJobs(userId, query = {}) {
  const page = normalizePage(query);
  const limit = normalizeLimit(query);
  const filter = {
    userId,
    provider: { $ne: 'mock' },
    ...buildSearchFilter(query.search, ['name', 'description', 'industry', 'baseModel', 'providerJobId', 'fineTunedModelId']),
  };

  if (query.status) filter.status = query.status;
  if (query.industry) filter.industry = query.industry;
  if (query.datasetId) filter.datasetId = query.datasetId;
  if (query.provider) {
    if (query.provider === 'mock') {
      return { items: [], pagination: { page, limit, totalItems: 0, totalPages: 1 } };
    }
    filter.provider = query.provider;
  }

  const [totalItems, jobs] = await Promise.all([
    FineTuneJob.countDocuments(filter),
    FineTuneJob.find(filter)
      .populate('userId', 'name email')
      .sort({ updatedAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
  ]);

  await Promise.all(jobs.map(async (job) => {
    if (!['pending', 'queued', 'running'].includes(job.status)) return;

    if (job.provider === 'openai') {
      await syncOpenAIFineTuneJob(job).catch((error) => {
        console.warn(`OpenAI fine-tune list sync failed: ${error.message}`);
      });
    }

    if (job.provider === VERTEX_FINE_TUNE_PROVIDER.id) {
      await syncVertexGeminiFineTuneJob(job).catch((error) => {
        console.warn(`Vertex Gemini fine-tune list sync failed: ${error.message}`);
      });
    }
  }));

  return {
    items: jobs.map(serializeFineTuneJob),
    pagination: { page, limit, totalItems, totalPages: Math.max(1, Math.ceil(totalItems / limit)) },
  };
}

async function getFineTuneJob(userId, id) {
  const job = await findFineTuneJobOrThrow(userId, id);
  if (job.provider === 'openai' && ['pending', 'queued', 'running'].includes(job.status)) {
    await syncOpenAIFineTuneJob(job).catch((error) => {
      console.warn(`OpenAI fine-tune sync failed: ${error.message}`);
    });
  }
  if (job.provider === VERTEX_FINE_TUNE_PROVIDER.id && ['pending', 'queued', 'running'].includes(job.status)) {
    await syncVertexGeminiFineTuneJob(job).catch((error) => {
      console.warn(`Vertex Gemini fine-tune sync failed: ${error.message}`);
    });
  }
  return serializeFineTuneJob(job);
}

async function createDatasetFromInlineExamples(userId, payload) {
  const dataset = await createDataset(userId, {
    name: `${payload.name} Dataset`,
    industry: payload.industry,
    description: payload.description,
    sourceType: 'manual',
    language: payload.language || 'vi',
    examples: payload.examples,
  });
  return FineTuneDataset.findById(dataset.id);
}

async function createFineTuneJob(userId, payload) {
  const provider = payload.provider || getDefaultTrainingProvider();
  const requestedBaseModel = payload.baseModel || getDefaultFineTuneBaseModel();
  const baseModel = provider === VERTEX_FINE_TUNE_PROVIDER.id ? resolveVertexBaseModelId(requestedBaseModel) : requestedBaseModel;
  if (!getSupportedTrainingProviderIds().includes(provider)) throw createError(400, 'Unsupported fine-tune provider');
  if (provider === 'openai' && hasOpenAIFineTuneModelConfig()) {
    ensureOpenAIBaseModelAllowed(baseModel);
  }
  if (provider === VERTEX_FINE_TUNE_PROVIDER.id && isVertexFineTuneProviderReady()) {
    ensureVertexBaseModelAllowed(baseModel);
  }
  const submitToOpenAI = provider === 'openai' && shouldSubmitOpenAIFineTune(baseModel);
  const submitToVertex = provider === VERTEX_FINE_TUNE_PROVIDER.id && shouldSubmitVertexFineTune(baseModel);
  if (!submitToOpenAI && !submitToVertex) {
    throw createError(409, getUnsupportedRealFineTuneMessage(provider));
  }
  if (submitToOpenAI) {
    await ensureOpenAIFineTuneEndpointReady();
  }
  if (submitToVertex) {
    await ensureVertexFineTuneEndpointReady(baseModel);
  }

  const dataset = payload.datasetId
    ? await findDatasetOrThrow(userId, payload.datasetId)
    : await createDatasetFromInlineExamples(userId, payload);

  if (!dataset) throw createError(400, 'Dataset is required');
  const refreshed = await refreshDatasetStats(dataset._id);
  const validCount = refreshed?.validExampleCount || dataset.validExampleCount || 0;
  if (validCount < MIN_VALID_EXAMPLES) {
    throw createError(400, `Dataset must have at least ${MIN_VALID_EXAMPLES} valid examples`, undefined, {
      validExampleCount: validCount,
      minRequired: MIN_VALID_EXAMPLES,
    });
  }

  const runningJobs = await FineTuneJob.countDocuments(buildRunningJobQuotaFilter(userId));
  if (runningJobs >= 2) {
    throw createError(429, 'Fine-tune running job quota exceeded', undefined, { limit: 2 });
  }

  const job = await FineTuneJob.create({
    userId,
    datasetId: dataset._id,
    name: payload.name,
    industry: payload.industry || dataset.industry || 'general',
    baseModel,
    provider,
    description: payload.description || dataset.description || '',
    datasetUrl: payload.datasetUrl || `dataset:${dataset._id.toString()}`,
    samples: validCount,
    epochs: payload.epochs || 5,
    estimatedCost: estimateCost(validCount, baseModel),
    status: 'pending',
    progress: 0,
    providerJobId: '',
  });

  dataset.status = 'submitted';
  await dataset.save();
  await seedInitialMetrics(userId, job);

  if (submitToOpenAI) {
    try {
      await submitOpenAIFineTuneJob(job);
    } catch (error) {
      job.status = 'failed';
      job.errorMessage = error.message;
      job.finishedAt = new Date();
      await job.save();
      throw error;
    }
  }

  if (submitToVertex) {
    try {
      await submitVertexGeminiFineTuneJob(job);
    } catch (error) {
      job.status = 'failed';
      job.errorMessage = error.message;
      job.finishedAt = new Date();
      await job.save();
      throw error;
    }
  }

  return serializeFineTuneJob(job);
}

async function seedInitialMetrics(userId, job) {
  const tokenUsage = await FineTuneExample.find({ datasetId: job.datasetId, userId })
    .limit(200)
    .then((examples) => examples.reduce((sum, item) => sum + estimateTokens(item.inputText) + estimateTokens(item.outputText), 0));

  return FineTuneMetric.create({
    userId,
    jobId: job._id,
    epoch: 0,
    trainLoss: 1.25,
    validationLoss: 1.32,
    accuracy: 45,
    tokenUsage,
    timestamp: new Date(),
  });
}

async function cancelFineTuneJob(userId, id) {
  const job = await findFineTuneJobOrThrow(userId, id);
  if (!['pending', 'queued', 'running'].includes(job.status)) {
    throw createError(409, 'Only pending, queued or running jobs can be cancelled');
  }

  if (job.provider === 'openai') {
    await cancelOpenAIFineTuneJob(job).catch((error) => {
      console.warn(`OpenAI fine-tune cancel failed: ${error.message}`);
    });
  }

  if (job.provider === VERTEX_FINE_TUNE_PROVIDER.id) {
    await cancelVertexGeminiFineTuneJob(job).catch((error) => {
      console.warn(`Vertex Gemini fine-tune cancel failed: ${error.message}`);
    });
  }

  job.status = 'cancelled';
  job.errorMessage = 'Cancelled by user';
  job.finishedAt = new Date();
  await job.save();
  return serializeFineTuneJob(job);
}

async function retryFineTuneJob(userId, id) {
  const job = await findFineTuneJobOrThrow(userId, id);
  if (!['failed', 'cancelled'].includes(job.status)) {
    throw createError(409, 'Only failed or cancelled jobs can be retried');
  }

  if (job.provider === 'openai' && hasOpenAIFineTuneModelConfig()) {
    ensureOpenAIBaseModelAllowed(job.baseModel);
  }
  if (job.provider === VERTEX_FINE_TUNE_PROVIDER.id && isVertexFineTuneProviderReady()) {
    ensureVertexBaseModelAllowed(job.baseModel);
  }
  const submitToOpenAI = job.provider === 'openai' && shouldSubmitOpenAIFineTune(job.baseModel);
  const submitToVertex = job.provider === VERTEX_FINE_TUNE_PROVIDER.id && shouldSubmitVertexFineTune(job.baseModel);
  if (!submitToOpenAI && !submitToVertex) {
    throw createError(409, getUnsupportedRealFineTuneMessage(job.provider));
  }
  if (submitToOpenAI) {
    await ensureOpenAIFineTuneEndpointReady();
  }
  if (submitToVertex) {
    await ensureVertexFineTuneEndpointReady(job.baseModel);
  }

  job.status = 'pending';
  job.progress = 0;
  job.errorMessage = '';
  job.startedAt = null;
  job.finishedAt = null;
  job.providerJobId = '';
  job.fineTunedModelId = '';
  await job.save();
  await seedInitialMetrics(userId, job);

  if (submitToOpenAI) {
    try {
      await submitOpenAIFineTuneJob(job);
    } catch (error) {
      job.status = 'failed';
      job.errorMessage = error.message;
      job.finishedAt = new Date();
      await job.save();
      throw error;
    }
  }

  if (submitToVertex) {
    try {
      await submitVertexGeminiFineTuneJob(job);
    } catch (error) {
      job.status = 'failed';
      job.errorMessage = error.message;
      job.finishedAt = new Date();
      await job.save();
      throw error;
    }
  }

  return serializeFineTuneJob(job);
}

async function listJobMetrics(userId, jobId) {
  const job = await findFineTuneJobOrThrow(userId, jobId);
  if (job.provider === 'openai') {
    await listOpenAIEvents(job)
      .then((events) => Promise.all(events.map(async (event) => {
        const data = event.data || {};
        const trainLoss = Number(data.train_loss ?? data.training_loss);
        const validationLoss = Number(data.valid_loss ?? data.validation_loss);
        if (!Number.isFinite(trainLoss) && !Number.isFinite(validationLoss)) return null;

        const epoch = Number(data.epoch ?? data.step ?? data.train_step ?? 0);
        return FineTuneMetric.findOneAndUpdate(
          { userId, jobId, epoch: Number.isFinite(epoch) ? epoch : 0 },
          {
            userId,
            jobId,
            epoch: Number.isFinite(epoch) ? epoch : 0,
            trainLoss: Number.isFinite(trainLoss) ? trainLoss : 0,
            validationLoss: Number.isFinite(validationLoss) ? validationLoss : 0,
            accuracy: Number(data.accuracy || 0),
            tokenUsage: Number(data.trained_tokens || 0),
            timestamp: dateFromUnixSeconds(event.created_at) || new Date(),
          },
          { upsert: true, new: true, setDefaultsOnInsert: true },
        );
      })))
      .catch((error) => {
        console.warn(`OpenAI fine-tune metrics sync failed: ${error.message}`);
      });
  }

  if (job.provider === VERTEX_FINE_TUNE_PROVIDER.id) {
    await syncVertexGeminiFineTuneJob(job).catch((error) => {
      console.warn(`Vertex Gemini fine-tune metrics sync failed: ${error.message}`);
    });
  }

  const metrics = await FineTuneMetric.find({ userId, jobId }).sort({ epoch: 1, createdAt: 1 });
  return { items: metrics.map(serializeMetric) };
}

async function listJobLogs(userId, jobId) {
  const job = await findFineTuneJobOrThrow(userId, jobId);
  if (job.provider === 'openai') {
    const events = await listOpenAIEvents(job).catch((error) => {
      console.warn(`OpenAI fine-tune events fetch failed: ${error.message}`);
      return [];
    });

    if (events.length > 0) {
      return {
        items: events.map((event) => ({
          step: event.message || event.type || 'OpenAI fine-tune event',
          status: event.level === 'error' ? 'failed' : 'done',
          time: dateFromUnixSeconds(event.created_at) || job.createdAt,
        })),
      };
    }
  }

  if (job.provider === VERTEX_FINE_TUNE_PROVIDER.id) {
    await syncVertexGeminiFineTuneJob(job).catch((error) => {
      console.warn(`Vertex Gemini fine-tune logs sync failed: ${error.message}`);
    });
  }

  const logs = [
    { step: 'Dataset snapshot created', status: 'done', time: job.createdAt },
    { step: 'Provider job queued', status: ['pending', 'queued', 'running', 'completed'].includes(job.status) ? 'done' : 'pending', time: job.createdAt },
    { step: 'Training started', status: ['running', 'completed'].includes(job.status) ? 'done' : job.status === 'queued' ? 'pending' : 'pending', time: job.startedAt },
    { step: 'Evaluation', status: job.status === 'completed' ? 'done' : job.status === 'running' ? 'running' : 'pending', time: job.finishedAt },
    { step: job.status === 'failed' ? `Failed: ${job.errorMessage}` : 'Model registration', status: job.status === 'completed' ? 'done' : 'pending', time: job.finishedAt },
  ];
  return { items: logs };
}

async function createFineTunedModelFromJob(job) {
  if (!job || job.status !== 'completed') return null;
  if (job.provider === 'mock') return null;

  const userId = job.userId?._id || job.userId;
  if (!userId) return null;

  if ((isRemoteOpenAIJob(job) || isRemoteVertexJob(job)) && !job.fineTunedModelId) {
    return null;
  }

  const existingModel = await FineTunedModel.findOne({ userId, jobId: job._id });
  if (existingModel) return existingModel;

  const alias = slugify(job.name);
  const existingVersions = await FineTunedModel.countDocuments({ userId, alias });
  await FineTunedModel.updateMany(
    { userId, industry: job.industry, isActive: true },
    { $set: { isActive: false, deactivatedAt: new Date() } },
  );

  return FineTunedModel.create({
    userId,
    jobId: job._id,
    name: job.name,
    alias,
    providerModelId: job.fineTunedModelId || `ft:${job.baseModel}:copypro:${alias}:${Date.now()}`,
    baseModel: job.baseModel,
    industry: job.industry,
    version: existingVersions + 1,
    isActive: true,
    performance: {
      accuracy: job.accuracy || 0,
      loss: job.loss || 0,
      sampleCount: job.samples || 0,
    },
    deployedAt: new Date(),
  });
}

async function registerCompletedFineTuneJobs(userId) {
  const registeredJobIds = await FineTunedModel.find({ userId }).distinct('jobId');
  const jobs = await FineTuneJob.find({
    userId,
    provider: { $ne: 'mock' },
    status: 'completed',
    _id: { $nin: registeredJobIds },
  }).sort({ finishedAt: 1, updatedAt: 1 });

  await Promise.all(jobs.map(async (job) => {
    await createFineTunedModelFromJob(job).catch((error) => {
      console.warn(`Fine-tuned model backfill failed: ${error.message}`);
    });
  }));
}

async function listFineTunedModels(userId, query = {}) {
  await registerCompletedFineTuneJobs(userId);

  const page = normalizePage(query);
  const limit = normalizeLimit(query);
  const mockJobIds = await FineTuneJob.find({ userId, provider: 'mock' }).distinct('_id');
  const filter = {
    userId,
    jobId: { $nin: mockJobIds },
    ...buildSearchFilter(query.search, ['name', 'alias', 'industry', 'providerModelId']),
  };
  if (query.industry) filter.industry = query.industry;
  if (query.activeOnly === true || query.activeOnly === 'true') filter.isActive = true;

  const [totalItems, models] = await Promise.all([
    FineTunedModel.countDocuments(filter),
    FineTunedModel.find(filter).sort({ isActive: -1, updatedAt: -1 }).skip((page - 1) * limit).limit(limit),
  ]);
  return {
    items: models.map(serializeModel),
    pagination: { page, limit, totalItems, totalPages: Math.max(1, Math.ceil(totalItems / limit)) },
  };
}

async function promoteFineTuneJob(userId, id) {
  const job = await findFineTuneJobOrThrow(userId, id);
  if (isRemoteOpenAIJob(job) && job.status !== 'completed') {
    await syncOpenAIFineTuneJob(job);
  }
  if (isRemoteVertexJob(job) && job.status !== 'completed') {
    await syncVertexGeminiFineTuneJob(job);
  }

  if (job.status !== 'completed') {
    throw createError(409, 'Only completed real fine-tune jobs can be promoted');
  }

  if (isRemoteOpenAIJob(job) && !job.fineTunedModelId) {
    throw createError(409, 'Provider has not returned a fine-tuned model id yet');
  }

  if (isRemoteVertexJob(job) && !job.fineTunedModelId) {
    throw createError(409, 'Vertex has not returned a tuned model id yet');
  }

  const model = await createFineTunedModelFromJob(job);
  if (!model) throw createError(409, 'Fine-tuned model could not be registered');

  return serializeModel(model);
}

async function setFineTunedModelActive(userId, id, payload) {
  const model = await FineTunedModel.findOne({ _id: id, userId });
  if (!model) throw createError(404, 'Fine-tuned model not found');
  const job = await FineTuneJob.findOne({ _id: model.jobId, userId });
  if (!job || job.provider === 'mock') throw createError(404, 'Fine-tuned model not found');

  if (payload.isActive) {
    await FineTunedModel.updateMany({ userId, industry: model.industry, isActive: true }, { $set: { isActive: false, deactivatedAt: new Date() } });
    model.isActive = true;
    model.deployedAt = model.deployedAt || new Date();
    model.deactivatedAt = null;
  } else {
    model.isActive = false;
    model.deactivatedAt = new Date();
  }
  await model.save();
  return serializeModel(model);
}

function listProviders() {
  const currentProvider = getConfiguredAIProvider();
  const openAIReady = isOpenAIFineTuneProviderReady();
  const vertexReady = isVertexFineTuneProviderReady();
  const vertexMissing = [];
  if (!getVertexProject()) vertexMissing.push('GOOGLE_CLOUD_PROJECT');
  if (!getVertexLocation()) vertexMissing.push('GOOGLE_CLOUD_LOCATION');
  if (!getVertexBucket()) vertexMissing.push('VERTEX_TUNING_BUCKET');
  const apiProviders = API_TRAINING_PROVIDERS.map((provider) => {
    const apiConfigured = Boolean(process.env[provider.key]);
    const supportsFineTuning = provider.id === 'openai' && openAIReady;
    const openAIModels = getOpenAIFineTuneBaseModelOptions();
    const baseModels = provider.id === 'openai'
      ? (openAIModels.length > 0 ? openAIModels : getOpenAIInferenceBaseModelOptions())
      : getGeneratorBaseModelOptions(provider.id);

    return {
      id: provider.id,
      name: provider.name,
      status: apiConfigured ? 'active' : 'needs_config',
      productionReady: apiConfigured,
      apiConfigured,
      supportsFineTuning,
      mode: supportsFineTuning ? 'real' : 'api',
      isDefault: currentProvider === provider.id,
      message: !apiConfigured
        ? `Missing ${provider.key}.`
        : supportsFineTuning
          ? 'Uploads JSONL to /files and creates a real fine-tuning job.'
          : provider.id === 'freegpt4'
            ? 'FreeGPT4 endpoint is configured for generation only; it does not expose real fine-tuning endpoints.'
            : 'API key is configured for generation only; real fine-tuning is not submitted for this provider.',
      baseModels,
    };
  });

  return {
    items: [
      {
        id: VERTEX_FINE_TUNE_PROVIDER.id,
        name: VERTEX_FINE_TUNE_PROVIDER.name,
        status: vertexReady ? 'active' : 'needs_config',
        productionReady: vertexReady,
        apiConfigured: vertexReady,
        supportsFineTuning: vertexReady,
        mode: vertexReady ? 'real' : 'api',
        isDefault: currentProvider === VERTEX_FINE_TUNE_PROVIDER.id || (!currentProvider && vertexReady),
        message: vertexReady
          ? `Uses Google ADC, uploads JSONL to gs://${getVertexBucket()}, and creates a real Vertex tuning job in ${getVertexLocation()}.`
          : `Missing ${vertexMissing.join(', ') || 'Google ADC'} for Vertex Gemini fine-tuning.`,
        baseModels: getVertexFineTuneBaseModelOptions(),
      },
      ...apiProviders,
    ],
  };
}

async function getQuotas(userId) {
  const mockJobIds = await FineTuneJob.find({ userId, provider: 'mock' }).distinct('_id');
  const [datasetCount, runningJobs, modelCount] = await Promise.all([
    FineTuneDataset.countDocuments({ userId, status: { $ne: 'archived' } }),
    FineTuneJob.countDocuments(buildRunningJobQuotaFilter(userId)),
    FineTunedModel.countDocuments({ userId, isDeprecated: false, jobId: { $nin: mockJobIds } }),
  ]);
  return {
    datasetCount,
    runningJobs,
    modelCount,
    limits: { datasets: 20, runningJobs: 2, models: 5, minValidExamples: MIN_VALID_EXAMPLES },
  };
}

module.exports = {
  MIN_VALID_EXAMPLES,
  serializeDataset,
  serializeExample,
  serializeFineTuneJob,
  serializeMetric,
  serializeModel,
  listDatasets,
  getDataset,
  createDataset,
  updateDataset,
  addExamples,
  listExamples,
  validateDataset,
  archiveDataset,
  listFineTuneJobs,
  getFineTuneJob,
  createFineTuneJob,
  cancelFineTuneJob,
  retryFineTuneJob,
  listJobMetrics,
  listJobLogs,
  promoteFineTuneJob,
  listFineTunedModels,
  setFineTunedModelActive,
  listProviders,
  getQuotas,
};
