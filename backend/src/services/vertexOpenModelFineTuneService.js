const fs = require('fs');
const fsp = require('fs/promises');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');
const { GoogleAuth } = require('google-auth-library');

const FineTuneExample = require('../models/FineTuneExample');
const createError = require('../utils/createError');

const PROVIDER_ID = 'vertex-llama';
const PROVIDER_NAME = 'Vertex AI Llama Fine-tuning';
const GOOGLE_CLOUD_SCOPE = 'https://www.googleapis.com/auth/cloud-platform';
const DEFAULT_LOCATION = 'us-central1';
const DEFAULT_TUNING_MODE = 'PEFT_ADAPTER';
const DEFAULT_MODEL_ID = 'meta/llama3-3@llama-3.3-70b-instruct';
const BASE_MODEL_OPTIONS = [
  { id: DEFAULT_MODEL_ID, name: 'Llama 3.3 70B Instruct', default: true },
];

let googleAuth;

function parseModelList(value) {
  return Array.from(new Set(String(value || '').split(',').map((item) => item.trim()).filter(Boolean)));
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'fine-tune';
}

function getRepoRoot() {
  return path.resolve(__dirname, '..', '..', '..');
}

function getProject() {
  return String(process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || '').trim();
}

function getLocation() {
  return String(process.env.VERTEX_LLAMA_TUNING_LOCATION || process.env.GOOGLE_CLOUD_LOCATION || process.env.VERTEX_LOCATION || DEFAULT_LOCATION).trim();
}

function getBucket() {
  return String(process.env.VERTEX_LLAMA_TUNING_BUCKET || process.env.VERTEX_TUNING_BUCKET || process.env.GOOGLE_CLOUD_STORAGE_BUCKET || '')
    .trim()
    .replace(/^gs:\/\//, '')
    .replace(/\/+$/, '');
}

function getOutputGcsUri() {
  const configured = String(process.env.VERTEX_LLAMA_TUNING_OUTPUT_GCS_URI || process.env.VERTEX_OPEN_MODEL_TUNING_OUTPUT_GCS_URI || '').trim();
  if (configured) return configured.replace(/\/+$/, '');
  const bucket = getBucket();
  return bucket ? `gs://${bucket}/open-model-tuning/outputs` : '';
}

function getPythonCommand() {
  const configured = String(process.env.VERTEX_LLAMA_TUNING_PYTHON || process.env.VERTEX_OPEN_MODEL_TUNING_PYTHON || '').trim();
  if (configured) return configured;

  const localVenvPython = process.platform === 'win32'
    ? path.join(getRepoRoot(), '.venv', 'Scripts', 'python.exe')
    : path.join(getRepoRoot(), '.venv', 'bin', 'python');

  return fs.existsSync(localVenvPython) ? localVenvPython : 'python';
}

function getSubmitScriptPath() {
  const configured = String(process.env.VERTEX_LLAMA_TUNING_SCRIPT || '').trim();
  return configured || path.join(getRepoRoot(), 'training', 'vertex_open_model_tuning', 'submit_open_model_tuning.py');
}

function getTuningMode() {
  return String(process.env.VERTEX_LLAMA_TUNING_MODE || process.env.VERTEX_OPEN_MODEL_TUNING_MODE || DEFAULT_TUNING_MODE).trim();
}

function getAdapterSize() {
  return String(process.env.VERTEX_LLAMA_TUNING_ADAPTER_SIZE || process.env.VERTEX_OPEN_MODEL_TUNING_ADAPTER_SIZE || '').trim();
}

function getConfiguredBaseModels() {
  const configured = parseModelList(process.env.VERTEX_LLAMA_TUNING_BASE_MODELS || process.env.VERTEX_OPEN_MODEL_TUNING_BASE_MODELS);
  return configured.length > 0 ? configured : BASE_MODEL_OPTIONS.map((model) => model.id);
}

function getBaseModelOptions() {
  const configured = getConfiguredBaseModels();
  return configured.map((id, index) => {
    const option = BASE_MODEL_OPTIONS.find((model) => model.id === id);
    return { id, name: option?.name || id, default: index === 0 || option?.default === true };
  });
}

function isReady() {
  return Boolean(getProject() && getLocation() && getBucket() && getOutputGcsUri() && fs.existsSync(getSubmitScriptPath()) && typeof fetch === 'function');
}

function ensureConfigured() {
  if (!getProject()) throw createError(503, 'Vertex Llama fine-tuning needs GOOGLE_CLOUD_PROJECT.');
  if (!getLocation()) throw createError(503, 'Vertex Llama fine-tuning needs GOOGLE_CLOUD_LOCATION, for example us-central1.');
  if (!getBucket()) throw createError(503, 'Vertex Llama fine-tuning needs VERTEX_TUNING_BUCKET or VERTEX_LLAMA_TUNING_BUCKET.');
  if (!getOutputGcsUri()) throw createError(503, 'Vertex Llama fine-tuning needs a GCS output URI.');
  if (!fs.existsSync(getSubmitScriptPath())) throw createError(503, `Vertex Llama tuning submit script was not found: ${getSubmitScriptPath()}`);
  if (typeof fetch !== 'function') throw createError(500, 'Current Node.js runtime does not support fetch.');
}

function ensureBaseModelAllowed(baseModel) {
  const configuredModels = getConfiguredBaseModels();
  if (!configuredModels.includes(baseModel)) {
    throw createError(
      400,
      `Base model ${baseModel} is not configured for Vertex Llama fine-tuning. Use one of: ${configuredModels.join(', ')}.`,
      undefined,
      { configuredModels },
    );
  }
}

async function getGoogleAccessToken() {
  googleAuth = googleAuth || new GoogleAuth({ scopes: [GOOGLE_CLOUD_SCOPE] });
  const client = await googleAuth.getClient();
  const tokenResponse = await client.getAccessToken();
  const token = typeof tokenResponse === 'string' ? tokenResponse : tokenResponse?.token;
  if (!token) throw createError(503, 'Could not read Google ADC access token. Run gcloud auth application-default login.');
  return token;
}

async function readResponse(response) {
  const text = await response.text().catch(() => '');
  if (!text) return {};
  try { return JSON.parse(text); } catch { return { message: text.slice(0, 500) }; }
}

function summarizeResponse(data) {
  const message = data?.error?.message || data?.message || data?.detail || data?.error;
  return typeof message === 'string' ? message : JSON.stringify(message || data || {}).slice(0, 500);
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

  const data = await readResponse(response);
  if (!response.ok) {
    const detail = summarizeResponse(data);
    throw createError(response.status, detail ? `${fallbackMessage} (${response.status}): ${detail}` : `${fallbackMessage} (${response.status})`, undefined, data);
  }
  return data;
}

function vertexUrl(pathname) {
  const normalizedPath = String(pathname || '').replace(/^\/+/, '');
  return `https://${getLocation()}-aiplatform.googleapis.com/v1/${normalizedPath}`;
}

async function vertexAIRequest(pathname, options = {}, fallbackMessage = 'Vertex AI request failed') {
  return googleJsonRequest(vertexUrl(pathname), options, fallbackMessage);
}

function buildChatJsonl(examples) {
  return `${examples.map((example) => JSON.stringify({
    messages: [
      { role: 'system', content: 'You are a senior Vietnamese marketing copywriter. Follow the user brief and write clear, conversion-focused copy.' },
      { role: 'user', content: example.inputText },
      { role: 'assistant', content: example.outputText },
    ],
  })).join('\n')}\n`;
}

function splitTrainValidationExamples(examples) {
  if (examples.length < 20) return { trainExamples: examples, validationExamples: [] };
  const validationCount = Math.max(1, Math.floor(examples.length * 0.1));
  return {
    trainExamples: examples.slice(0, examples.length - validationCount),
    validationExamples: examples.slice(examples.length - validationCount),
  };
}

async function uploadGcsObject(objectName, content) {
  const bucket = getBucket();
  const token = await getGoogleAccessToken();
  const response = await fetch(
    `https://storage.googleapis.com/upload/storage/v1/b/${encodeURIComponent(bucket)}/o?uploadType=media&name=${encodeURIComponent(objectName)}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/jsonl; charset=utf-8',
      },
      body: content,
    },
  );

  const data = await readResponse(response);
  if (!response.ok) {
    const detail = summarizeResponse(data);
    throw createError(response.status, detail ? `Vertex Llama training file upload failed (${response.status}): ${detail}` : `Vertex Llama training file upload failed (${response.status})`, undefined, data);
  }

  return `gs://${bucket}/${objectName}`;
}

async function uploadTrainingFiles(job, examples) {
  const alias = `${slugify(job.name)}-${job._id.toString()}`;
  const { trainExamples, validationExamples } = splitTrainValidationExamples(examples);
  const trainDatasetUri = await uploadGcsObject(`open-model-tuning/${alias}/train.jsonl`, buildChatJsonl(trainExamples));
  const validationDatasetUri = validationExamples.length > 0
    ? await uploadGcsObject(`open-model-tuning/${alias}/validation.jsonl`, buildChatJsonl(validationExamples))
    : '';
  return { trainDatasetUri, validationDatasetUri };
}

function execFileAsync(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    execFile(command, args, { ...options, windowsHide: true, timeout: options.timeout || 300000 }, (error, stdout, stderr) => {
      if (error) {
        error.message = `${error.message}\n${stderr || stdout || ''}`.trim();
        reject(error);
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

function parseJsonFromStdout(stdout) {
  const lines = String(stdout || '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    try { return JSON.parse(lines[index]); } catch { /* keep scanning */ }
  }
  throw createError(502, `Vertex Llama tuning submit script did not return JSON. Output: ${String(stdout || '').slice(0, 500)}`);
}

async function submitWithPython(config) {
  const tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'copypro-vertex-llama-'));
  const configPath = path.join(tempDir, 'config.json');
  try {
    await fsp.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');
    const { stdout } = await execFileAsync(getPythonCommand(), [getSubmitScriptPath(), '--config', configPath], {
      cwd: getRepoRoot(),
      env: process.env,
      timeout: Number(process.env.VERTEX_LLAMA_TUNING_SUBMIT_TIMEOUT_MS || 300000),
    });
    const parsed = parseJsonFromStdout(stdout);
    if (parsed.error) throw createError(502, `Vertex Llama tuning submit failed: ${parsed.error}`);
    return parsed;
  } finally {
    await fsp.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
}

function mapStatus(providerJob) {
  const normalized = String(providerJob?.state || providerJob?.status || providerJob?.job_state || '').toLowerCase();
  if (normalized.includes('succeed') || normalized.includes('complete')) return 'completed';
  if (normalized.includes('fail')) return 'failed';
  if (normalized.includes('cancel')) return 'cancelled';
  if (normalized.includes('running')) return 'running';
  if (normalized.includes('pending') || normalized.includes('queued')) return 'queued';
  return 'queued';
}

function getTunedModelId(providerJob) {
  return providerJob?.tuned_model_endpoint
    || providerJob?.tunedModel?.endpoint
    || providerJob?.tuned_model?.endpoint
    || providerJob?.tuned_model_name
    || providerJob?.tunedModel?.model
    || providerJob?.tuned_model?.model
    || providerJob?.model
    || '';
}

function getErrorMessage(providerJob) {
  const error = providerJob?.error || providerJob?.failure_reason || providerJob?.failureMessage || '';
  if (!error) return '';
  return typeof error === 'string' ? error : (error.message || JSON.stringify(error).slice(0, 500));
}

function fallbackProgress(job, status) {
  if (status === 'completed') return 100;
  if (['failed', 'cancelled'].includes(status)) return Math.max(0, Math.min(100, Number(job.progress || 0)));
  if (status === 'running') return Math.max(20, Math.min(95, Number(job.progress || 20)));
  return Math.max(10, Math.min(30, Number(job.progress || 10)));
}

async function preflight() {
  ensureConfigured();
  ensureBaseModelAllowed(getConfiguredBaseModels()[0]);
  await vertexAIRequest(`/projects/${getProject()}/locations/${getLocation()}/tuningJobs?pageSize=1`, {}, 'Vertex Llama tuning preflight failed');
  await submitWithPython({ preflight: true });
}

async function submitJob(job) {
  ensureConfigured();
  ensureBaseModelAllowed(job.baseModel);

  const examples = await FineTuneExample.find({ datasetId: job.datasetId, userId: job.userId, isValid: true }).sort({ createdAt: 1 });
  const { trainDatasetUri, validationDatasetUri } = await uploadTrainingFiles(job, examples);
  job.datasetUrl = trainDatasetUri;
  job.status = 'pending';
  job.progress = Math.max(job.progress || 0, 5);
  await job.save();

  const config = {
    project: getProject(),
    location: getLocation(),
    staging_bucket: `gs://${getBucket()}`,
    base_model: job.baseModel,
    tuning_mode: getTuningMode(),
    adapter_size: getAdapterSize(),
    train_dataset_uri: trainDatasetUri,
    validation_dataset_uri: validationDatasetUri,
    output_gcs_uri: `${getOutputGcsUri()}/${slugify(job.name)}-${job._id.toString()}`,
    display_name: slugify(job.name).slice(0, 63),
    epochs: Math.max(1, Number(job.epochs || 3)),
    labels: {
      copypro_job_id: job._id.toString().slice(-63),
      provider: PROVIDER_ID,
    },
  };

  const providerJob = await submitWithPython(config);
  job.providerJobId = providerJob.resource_name || providerJob.name || providerJob.job_name || providerJob.provider_job_id || '';
  if (!job.providerJobId) throw createError(502, 'Vertex Llama tuning job was created but no provider job id was returned.');

  job.status = mapStatus(providerJob);
  job.progress = fallbackProgress(job, job.status);
  job.startedAt = job.startedAt || new Date();
  job.fineTunedModelId = getTunedModelId(providerJob) || '';
  job.errorMessage = getErrorMessage(providerJob);
  await job.save();
  return job;
}

async function syncJob(job) {
  if (job.provider !== PROVIDER_ID || !job.providerJobId) return job;
  const providerJob = await vertexAIRequest(job.providerJobId, {}, 'Vertex Llama tuning job sync failed');
  const mappedStatus = mapStatus(providerJob);
  job.status = mappedStatus;
  job.progress = fallbackProgress(job, mappedStatus);
  job.fineTunedModelId = getTunedModelId(providerJob) || job.fineTunedModelId || '';
  job.errorMessage = getErrorMessage(providerJob);
  if (['completed', 'failed', 'cancelled'].includes(mappedStatus)) job.finishedAt = job.finishedAt || new Date();
  if (['running', 'completed'].includes(mappedStatus)) job.startedAt = job.startedAt || job.createdAt || new Date();
  await job.save();
  return job;
}

async function cancelJob(job) {
  if (job.provider !== PROVIDER_ID || !job.providerJobId) return null;
  return vertexAIRequest(`${job.providerJobId}:cancel`, { method: 'POST', body: {} }, 'Vertex Llama tuning job cancel failed');
}

async function getLogs(job) {
  return [
    { step: 'Uploaded chat JSONL to Cloud Storage', status: job.datasetUrl ? 'done' : 'pending', time: job.createdAt },
    { step: 'Submitted Vertex open-model tuning job', status: job.providerJobId ? 'done' : 'pending', time: job.startedAt || job.createdAt },
    { step: 'Training on Vertex AI', status: job.status === 'running' ? 'running' : job.status === 'completed' ? 'done' : 'pending', time: job.updatedAt || job.createdAt },
    { step: job.status === 'failed' ? `Failed: ${job.errorMessage}` : 'Tuned model or adapter output', status: job.status === 'completed' ? 'done' : 'pending', time: job.finishedAt },
  ];
}

module.exports = {
  PROVIDER_ID,
  PROVIDER_NAME,
  getProject,
  getLocation,
  getBucket,
  getPythonCommand,
  getSubmitScriptPath,
  getOutputGcsUri,
  isReady,
  getBaseModelOptions,
  ensureConfigured,
  ensureBaseModelAllowed,
  preflight,
  submitJob,
  syncJob,
  cancelJob,
  getLogs,
};
