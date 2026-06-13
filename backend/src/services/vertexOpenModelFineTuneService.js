const fs = require('fs');
const fsp = require('fs/promises');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');
const { GoogleAuth } = require('google-auth-library');

const FineTuneExample = require('../models/FineTuneExample');
const createError = require('../utils/createError');
const { throwGoogleCredentialError } = require('../utils/googleCredentialError');

const PROVIDER_ID = 'vertex-llama';
const PROVIDER_NAME = 'Vertex AI Open-Model Fine-tuning';
const GOOGLE_CLOUD_SCOPE = 'https://www.googleapis.com/auth/cloud-platform';
const DEFAULT_LOCATION = 'us-central1';
const DEFAULT_TUNING_MODE = 'PEFT_ADAPTER';
const DEFAULT_MODEL_ID = 'meta/llama3-3@llama-3.3-70b-instruct';
const DEFAULT_QWEN_MODEL_ID = 'qwen/qwen3@qwen3-14b';
const BASE_MODEL_OPTIONS = [
  { id: DEFAULT_MODEL_ID, name: 'Llama 3.3 70B Instruct', default: true },
  { id: DEFAULT_QWEN_MODEL_ID, name: 'Qwen 3 14B on Vertex AI' },
];

const BASE_MODEL_ALIASES = {
  'qwen3-14b': DEFAULT_QWEN_MODEL_ID,
  'qwen_qwen3-14b': DEFAULT_QWEN_MODEL_ID,
  'qwen/qwen3-14b': DEFAULT_QWEN_MODEL_ID,
  'qwen/qwen3@14b': DEFAULT_QWEN_MODEL_ID,
  'publishers/qwen/models/qwen3@qwen3-14b': DEFAULT_QWEN_MODEL_ID,
};

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

function normalizeEndpointResource(value) {
  const normalized = String(value || '').trim().replace(/^https?:\/\/[^/]+\/v\d+(?:beta\d*)?\//, '').replace(/:predict$/, '');
  const projectPathIndex = normalized.indexOf('projects/');
  return projectPathIndex >= 0 ? normalized.slice(projectPathIndex) : normalized;
}

function getResourceLocation(value) {
  return normalizeEndpointResource(value).match(/\/locations\/([^/]+)/)?.[1] || '';
}

function isEndpointResource(value) {
  return /\/locations\/[^/]+\/endpoints\/[^/:]+$/.test(normalizeEndpointResource(value));
}

function normalizeModelResource(value) {
  return normalizeEndpointResource(value).replace(/@\d+$/, '');
}

function isModelResource(value) {
  return /\/locations\/[^/]+\/models\/[^/]+(?:@\d+)?$/.test(normalizeEndpointResource(value));
}

function sameModelResource(left, right) {
  return Boolean(left && right && normalizeModelResource(left) === normalizeModelResource(right));
}

function getTargetEndpoint(provider, baseModel) {
  const isQwen = provider === 'vertex-qwen' || String(baseModel || '').startsWith('qwen/');
  const endpoint = isQwen
    ? process.env.VERTEX_QWEN_TUNING_ENDPOINT || process.env.VERTEX_OPEN_MODEL_TUNING_ENDPOINT
    : process.env.VERTEX_LLAMA_TUNING_ENDPOINT || process.env.VERTEX_OPEN_MODEL_TUNING_ENDPOINT;

  return normalizeEndpointResource(endpoint);
}

function getLocationForProvider(provider, baseModel) {
  const endpoint = getTargetEndpoint(provider, baseModel);
  if (!endpoint) return getLocation();
  if (!isEndpointResource(endpoint)) {
    throw createError(400, `Vertex tuning endpoint must be a deployed endpoint resource like projects/.../locations/.../endpoints/..., got: ${endpoint}`);
  }

  return getResourceLocation(endpoint) || getLocation();
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

function hasSubmitScript() {
  return fs.existsSync(getSubmitScriptPath());
}

function isQwenBaseModel(baseModel) {
  return String(normalizeBaseModelForVertex(baseModel) || '').startsWith('qwen/');
}

function getTuningMode(provider, baseModel) {
  if (provider === 'vertex-qwen' || isQwenBaseModel(baseModel)) {
    const qwenMode = String(process.env.VERTEX_QWEN_TUNING_MODE || '').trim();
    if (qwenMode) return qwenMode;
    return 'FULL';
  }

  return String(process.env.VERTEX_LLAMA_TUNING_MODE || process.env.VERTEX_OPEN_MODEL_TUNING_MODE || DEFAULT_TUNING_MODE).trim();
}

function getAdapterSize(provider, baseModel, tuningMode = getTuningMode(provider, baseModel)) {
  if (String(tuningMode || '').toUpperCase() === 'FULL') return '';
  if (provider === 'vertex-qwen' || isQwenBaseModel(baseModel)) {
    return String(process.env.VERTEX_QWEN_TUNING_ADAPTER_SIZE || process.env.VERTEX_OPEN_MODEL_TUNING_ADAPTER_SIZE || '').trim();
  }
  return String(process.env.VERTEX_LLAMA_TUNING_ADAPTER_SIZE || process.env.VERTEX_OPEN_MODEL_TUNING_ADAPTER_SIZE || '').trim();
}

function getConfiguredBaseModels() {
  const sharedConfigured = parseModelList(process.env.VERTEX_OPEN_MODEL_TUNING_BASE_MODELS);
  if (sharedConfigured.length > 0) return sharedConfigured;

  const configured = [
    ...parseModelList(process.env.VERTEX_LLAMA_TUNING_BASE_MODELS),
    ...parseModelList(process.env.VERTEX_QWEN_TUNING_BASE_MODELS),
  ];
  return configured.length > 0 ? Array.from(new Set(configured)) : BASE_MODEL_OPTIONS.map((model) => model.id);
}

function normalizeBaseModelForVertex(baseModel) {
  const value = String(baseModel || '').trim();
  return BASE_MODEL_ALIASES[value] || value;
}

function getAllowedBaseModels() {
  const configuredModels = getConfiguredBaseModels();
  const allowed = new Set();
  configuredModels.forEach((model) => {
    allowed.add(model);
    allowed.add(normalizeBaseModelForVertex(model));
  });
  Object.entries(BASE_MODEL_ALIASES).forEach(([alias, canonical]) => {
    if (allowed.has(alias) || allowed.has(canonical)) {
      allowed.add(alias);
      allowed.add(canonical);
    }
  });
  return Array.from(allowed);
}

function supportsProvider(provider) {
  return provider === PROVIDER_ID || provider === 'vertex-qwen';
}

function getBaseModelOptions() {
  const configured = getConfiguredBaseModels();
  return configured.map((id, index) => {
    const canonicalId = normalizeBaseModelForVertex(id);
    const option = BASE_MODEL_OPTIONS.find((model) => model.id === canonicalId || model.id === id);
    return { id, name: option?.name || id, default: index === 0 || option?.default === true };
  });
}

function isReady() {
  return Boolean(getProject() && getLocation() && getBucket() && getOutputGcsUri() && hasSubmitScript() && typeof fetch === 'function');
}

function ensureConfigured() {
  if (!getProject()) throw createError(503, 'Vertex open-model fine-tuning needs GOOGLE_CLOUD_PROJECT.');
  if (!getLocation()) throw createError(503, 'Vertex open-model fine-tuning needs GOOGLE_CLOUD_LOCATION, for example us-central1.');
  if (!getBucket()) throw createError(503, 'Vertex open-model fine-tuning needs VERTEX_TUNING_BUCKET or VERTEX_LLAMA_TUNING_BUCKET.');
  if (!getOutputGcsUri()) throw createError(503, 'Vertex open-model fine-tuning needs a GCS output URI.');
  if (!hasSubmitScript()) throw createError(503, `Vertex open-model tuning submit script was not found: ${getSubmitScriptPath()}`);
  if (typeof fetch !== 'function') throw createError(500, 'Current Node.js runtime does not support fetch.');
}

function ensureBaseModelAllowed(baseModel) {
  const configuredModels = getAllowedBaseModels();
  if (!configuredModels.includes(baseModel) && !configuredModels.includes(normalizeBaseModelForVertex(baseModel))) {
    throw createError(
      400,
      `Base model ${baseModel} is not configured for Vertex open-model fine-tuning. Use one of: ${configuredModels.join(', ')}.`,
      undefined,
      { configuredModels },
    );
  }
}

async function getGoogleAccessToken() {
  try {
    googleAuth = googleAuth || new GoogleAuth({ scopes: [GOOGLE_CLOUD_SCOPE] });
    const client = await googleAuth.getClient();
    const tokenResponse = await client.getAccessToken();
    const token = typeof tokenResponse === 'string' ? tokenResponse : tokenResponse?.token;
    if (!token) throw createError(503, 'Could not read Google ADC access token. Run gcloud auth application-default login.');
    return token;
  } catch (error) {
    throwGoogleCredentialError(error, 'Vertex open-model fine-tuning');
  }
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

function formatBucketIamError(message) {
  const text = String(message || '');
  if (!/gcp-sa-vertex-moss-ft|storage\.objects\.|storage\.buckets\.get/i.test(text)) return text;

  const serviceAccount = text.match(/service-[^`\s]+@gcp-sa-vertex-moss-ft\.iam\.gserviceaccount\.com/)?.[0]
    || 'service-167488791850@gcp-sa-vertex-moss-ft.iam.gserviceaccount.com';
  const bucketToken = text.match(/bucket\s+([^\s]+)/i)?.[1] || getBucket();
  const bucket = String(bucketToken).replace(/^[^A-Za-z0-9_.-]+|[^A-Za-z0-9_.-]+$/g, '');
  const bucketUri = `gs://${bucket}`;

  return [
    text,
    `Fix bucket IAM: gcloud storage buckets add-iam-policy-binding ${bucketUri} --member=serviceAccount:${serviceAccount} --role=roles/storage.objectAdmin`,
    `Fix bucket metadata access: gcloud storage buckets add-iam-policy-binding ${bucketUri} --member=serviceAccount:${serviceAccount} --role=roles/storage.legacyBucketReader`,
    'Or use a Cloud Storage bucket owned by GOOGLE_CLOUD_PROJECT and update VERTEX_TUNING_BUCKET.',
  ].join('\n');
}

function formatPublisherModelError(message, config = {}) {
  const text = String(message || '');
  const match = text.match(/PublisherModel\s+([^\s`"']+)\s+does not exist/i);
  if (!match) return text;

  const location = config.location || getLocation();
  const baseModel = config.base_model || match[1];
  const endpoint = config.target_endpoint || '';
  const endpointLine = endpoint ? ` Target endpoint: ${endpoint}.` : '';
  return [
    `Vertex AI does not expose PublisherModel ${match[1]} for tuning in ${location}.`,
    `Requested base model: ${baseModel}.${endpointLine}`,
    'Use a tuning target endpoint in a region where this publisher model supports managed tuning, or choose a base model supported in the endpoint region.',
    `Original Vertex error: ${text}`,
  ].join(' ');
}

function formatVertexSubmitError(message, config = {}) {
  return formatBucketIamError(formatPublisherModelError(message, config));
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

function vertexUrl(pathname, location = getLocation()) {
  const normalizedPath = String(pathname || '').replace(/^\/+/, '');
  const resourceLocation = getResourceLocation(normalizedPath) || location || getLocation();
  return `https://${resourceLocation}-aiplatform.googleapis.com/v1/${normalizedPath}`;
}

async function vertexAIRequest(pathname, options = {}, fallbackMessage = 'Vertex AI request failed', location = getLocation()) {
  return googleJsonRequest(vertexUrl(pathname, location), options, fallbackMessage);
}

function getAutoDeployEnabled(provider, baseModel) {
  const isQwen = provider === 'vertex-qwen' || String(baseModel || '').startsWith('qwen/');
  const providerSpecific = isQwen ? process.env.VERTEX_QWEN_AUTO_DEPLOY_TUNED_ENDPOINT : process.env.VERTEX_LLAMA_AUTO_DEPLOY_TUNED_ENDPOINT;
  const configured = String(providerSpecific || process.env.VERTEX_OPEN_MODEL_AUTO_DEPLOY_TUNED_ENDPOINT || 'true').trim().toLowerCase();
  return !['0', 'false', 'no', 'off'].includes(configured);
}

function getTunedModelResource(job) {
  const explicit = String(job.tunedModelResourceId || '').trim();
  if (isModelResource(explicit)) return normalizeEndpointResource(explicit);
  const fineTunedModelId = String(job.fineTunedModelId || '').trim();
  return isModelResource(fineTunedModelId) ? normalizeEndpointResource(fineTunedModelId) : '';
}

function applyTunedModelId(job, tunedModelId) {
  const resource = normalizeEndpointResource(tunedModelId);
  if (!resource) return;

  if (isEndpointResource(resource)) {
    job.fineTunedModelId = resource;
    job.tuningEndpoint = job.tuningEndpoint || resource;
    return;
  }

  if (isModelResource(resource)) {
    job.tunedModelResourceId = resource;
    if (!isEndpointResource(job.fineTunedModelId)) job.fineTunedModelId = resource;
    return;
  }

  if (!job.fineTunedModelId) job.fineTunedModelId = resource;
}

function getFallbackDedicatedResources(provider, baseModel) {
  const isQwen = provider === 'vertex-qwen' || String(baseModel || '').startsWith('qwen/');
  const prefix = isQwen ? 'VERTEX_QWEN_DEPLOY' : 'VERTEX_LLAMA_DEPLOY';
  const machineType = String(process.env[`${prefix}_MACHINE_TYPE`] || process.env.VERTEX_OPEN_MODEL_DEPLOY_MACHINE_TYPE || '').trim();
  if (!machineType) return null;

  const acceleratorType = String(process.env[`${prefix}_ACCELERATOR_TYPE`] || process.env.VERTEX_OPEN_MODEL_DEPLOY_ACCELERATOR_TYPE || '').trim();
  const acceleratorCount = Number(process.env[`${prefix}_ACCELERATOR_COUNT`] || process.env.VERTEX_OPEN_MODEL_DEPLOY_ACCELERATOR_COUNT || 0);
  const machineSpec = { machineType };
  if (acceleratorType && Number.isFinite(acceleratorCount) && acceleratorCount > 0) {
    machineSpec.acceleratorType = acceleratorType;
    machineSpec.acceleratorCount = Math.round(acceleratorCount);
  }

  return {
    machineSpec,
    minReplicaCount: Number(process.env[`${prefix}_MIN_REPLICA_COUNT`] || process.env.VERTEX_OPEN_MODEL_DEPLOY_MIN_REPLICA_COUNT || 1),
    maxReplicaCount: Number(process.env[`${prefix}_MAX_REPLICA_COUNT`] || process.env.VERTEX_OPEN_MODEL_DEPLOY_MAX_REPLICA_COUNT || 1),
  };
}

function getDedicatedResourcesForDeployment(endpointData, provider, baseModel) {
  const existing = (endpointData?.deployedModels || []).find((model) => model.dedicatedResources)?.dedicatedResources;
  return existing || getFallbackDedicatedResources(provider, baseModel);
}

function findDeployedModel(endpointData, tunedModelResource) {
  return (endpointData?.deployedModels || []).find((model) => sameModelResource(model.model, tunedModelResource)) || null;
}

async function waitForOperation(operationName, fallbackMessage, timeoutMs = Number(process.env.VERTEX_ENDPOINT_UNDEPLOY_TIMEOUT_MS || 300000)) {
  const started = Date.now();
  const intervalMs = Number(process.env.VERTEX_ENDPOINT_OPERATION_POLL_MS || 5000);
  while (Date.now() - started <= timeoutMs) {
    const operation = await vertexAIRequest(operationName, {}, fallbackMessage);
    if (operation.done) {
      if (operation.error) {
        throw createError(operation.error.code || 502, `${fallbackMessage}: ${operation.error.message || JSON.stringify(operation.error)}`, undefined, operation);
      }
      return operation;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw createError(504, `${fallbackMessage}: operation did not finish within ${timeoutMs}ms`, undefined, { operationName });
}

async function markEndpointDeployed(job, endpoint, endpointData, tunedModelResource) {
  const deployedModel = findDeployedModel(endpointData, tunedModelResource);
  if (!deployedModel) return false;

  job.fineTunedModelId = endpoint;
  job.tunedModelResourceId = job.tunedModelResourceId || tunedModelResource;
  job.tuningEndpoint = endpoint;
  job.deployedModelId = deployedModel.id || job.deployedModelId || '';
  job.deploymentStatus = 'deployed';
  job.deploymentOperationId = '';
  job.deploymentErrorMessage = '';
  await job.save();
  return true;
}

async function refreshDeploymentOperation(job, endpoint, tunedModelResource) {
  if (!job.deploymentOperationId) return false;
  const operation = await vertexAIRequest(job.deploymentOperationId, {}, 'Vertex endpoint deployment operation sync failed');
  if (!operation.done) {
    job.deploymentStatus = 'deploying';
    await job.save();
    return true;
  }

  if (operation.error) {
    job.deploymentStatus = 'failed';
    job.deploymentErrorMessage = operation.error.message || JSON.stringify(operation.error).slice(0, 1500);
    await job.save();
    return true;
  }

  const endpointData = await vertexAIRequest(endpoint, {}, 'Vertex endpoint refresh failed');
  const deployed = await markEndpointDeployed(job, endpoint, endpointData, tunedModelResource);
  if (!deployed) {
    job.deploymentStatus = 'failed';
    job.deploymentErrorMessage = `Deploy operation completed, but endpoint ${endpoint} does not list tuned model ${tunedModelResource}.`;
    await job.save();
  }
  return true;
}

async function ensureTunedModelDeployed(job) {
  if (!supportsProvider(job.provider) || job.status !== 'completed') return job;
  if (!getAutoDeployEnabled(job.provider, job.baseModel)) return job;

  const endpoint = normalizeEndpointResource(job.tuningEndpoint || getTargetEndpoint(job.provider, job.baseModel));
  if (!isEndpointResource(endpoint)) return job;

  const tunedModelResource = getTunedModelResource(job);

  if (isEndpointResource(job.fineTunedModelId) && !tunedModelResource) {
    job.deploymentStatus = job.deploymentStatus || 'deployed';
    job.tuningEndpoint = endpoint;
    await job.save();
    return job;
  }

  if (!tunedModelResource) return job;

  if (job.deploymentOperationId) {
    await refreshDeploymentOperation(job, endpoint, tunedModelResource);
    return job;
  }

  const endpointData = await vertexAIRequest(endpoint, {}, 'Vertex endpoint lookup failed');
  if (await markEndpointDeployed(job, endpoint, endpointData, tunedModelResource)) return job;

  const dedicatedResources = getDedicatedResourcesForDeployment(endpointData, job.provider, job.baseModel);
  if (!dedicatedResources) {
    job.deploymentStatus = 'failed';
    job.deploymentErrorMessage = 'No existing deployed model resources to reuse. Set VERTEX_LLAMA_DEPLOY_MACHINE_TYPE and accelerator env vars, or keep one base model deployed on the endpoint.';
    await job.save();
    return job;
  }

  const deployedModels = endpointData.deployedModels || [];
  for (const deployedModel of deployedModels) {
    if (!deployedModel.id || sameModelResource(deployedModel.model, tunedModelResource)) continue;
    const undeployOperation = await vertexAIRequest(
      `${endpoint}:undeployModel`,
      { method: 'POST', body: { deployedModelId: deployedModel.id, trafficSplit: {} } },
      'Vertex endpoint undeploy before tuned model deploy failed',
    );
    if (undeployOperation?.name) {
      await waitForOperation(undeployOperation.name, 'Vertex endpoint undeploy before tuned model deploy failed');
    }
  }

  const deployOperation = await vertexAIRequest(
    `${endpoint}:deployModel`,
    {
      method: 'POST',
      body: {
        deployedModel: {
          model: tunedModelResource,
          displayName: `${slugify(job.name).slice(0, 45) || 'fine-tuned-open-model'}-${job._id.toString().slice(-8)}`,
          dedicatedResources,
        },
        trafficSplit: { 0: 100 },
      },
    },
    'Vertex endpoint deploy tuned model failed',
  );

  job.tuningEndpoint = endpoint;
  job.tunedModelResourceId = tunedModelResource;
  job.deploymentOperationId = deployOperation?.name || '';
  job.deploymentStatus = job.deploymentOperationId ? 'deploying' : 'started';
  job.deploymentErrorMessage = '';
  await job.save();

  if (deployOperation?.done) await refreshDeploymentOperation(job, endpoint, tunedModelResource);
  return job;
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
    throw createError(response.status, detail ? `Vertex open-model training file upload failed (${response.status}): ${detail}` : `Vertex open-model training file upload failed (${response.status})`, undefined, data);
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
        error.stdout = stdout;
        error.stderr = stderr;
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
  throw createError(502, `Vertex open-model tuning submit script did not return JSON. Output: ${String(stdout || '').slice(0, 500)}`);
}

async function submitWithPython(config) {
  const tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'copypro-vertex-llama-'));
  const configPath = path.join(tempDir, 'config.json');
  try {
    await fsp.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');
    let stdout = '';
    try {
      const result = await execFileAsync(getPythonCommand(), [getSubmitScriptPath(), '--config', configPath], {
        cwd: getRepoRoot(),
        env: process.env,
        timeout: Number(process.env.VERTEX_LLAMA_TUNING_SUBMIT_TIMEOUT_MS || 300000),
      });
      stdout = result.stdout;
    } catch (error) {
      stdout = error.stdout || '';
      if (!stdout) throw createError(502, `Vertex open-model tuning submit failed: ${formatVertexSubmitError(error.message, config)}`);
    }
    const parsed = parseJsonFromStdout(stdout);
    if (parsed.error) throw createError(502, `Vertex open-model tuning submit failed: ${formatVertexSubmitError(parsed.error, config)}`);
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
  const message = typeof error === 'string' ? error : (error.message || JSON.stringify(error).slice(0, 500));
  return formatBucketIamError(message);
}

function fallbackProgress(job, status) {
  if (status === 'completed') return 100;
  if (['failed', 'cancelled'].includes(status)) return Math.max(0, Math.min(100, Number(job.progress || 0)));
  if (status === 'running') return Math.max(20, Math.min(95, Number(job.progress || 20)));
  return Math.max(10, Math.min(30, Number(job.progress || 10)));
}

async function preflight(baseModel = getConfiguredBaseModels()[0], options = {}) {
  ensureConfigured();
  ensureBaseModelAllowed(baseModel);
  const location = getLocationForProvider(options.provider, baseModel);
  await vertexAIRequest(`/projects/${getProject()}/locations/${location}/tuningJobs?pageSize=1`, {}, 'Vertex open-model tuning preflight failed', location);
  await submitWithPython({ preflight: true });
}

async function submitJob(job) {
  ensureConfigured();
  ensureBaseModelAllowed(job.baseModel);
  const location = getLocationForProvider(job.provider, job.baseModel);
  const targetEndpoint = getTargetEndpoint(job.provider, job.baseModel);

  const examples = await FineTuneExample.find({ datasetId: job.datasetId, userId: job.userId, isValid: true }).sort({ createdAt: 1 });
  const { trainDatasetUri, validationDatasetUri } = await uploadTrainingFiles(job, examples);
  job.datasetUrl = trainDatasetUri;
  job.tuningLocation = location;
  job.tuningEndpoint = targetEndpoint;
  job.status = 'pending';
  job.progress = Math.max(job.progress || 0, 5);
  await job.save();

  const config = {
    project: getProject(),
    location,
    target_endpoint: targetEndpoint,
    staging_bucket: `gs://${getBucket()}`,
    base_model: normalizeBaseModelForVertex(job.baseModel),
    tuning_mode: getTuningMode(job.provider, job.baseModel),
    adapter_size: getAdapterSize(job.provider, job.baseModel),
    train_dataset_uri: trainDatasetUri,
    validation_dataset_uri: validationDatasetUri,
    output_gcs_uri: `${getOutputGcsUri()}/${slugify(job.name)}-${job._id.toString()}`,
    display_name: slugify(job.name).slice(0, 63),
    epochs: Math.max(1, Number(job.epochs || 3)),
    labels: {
      copypro_job_id: job._id.toString().slice(-63),
      provider: job.provider || PROVIDER_ID,
    },
  };

  const providerJob = await submitWithPython(config);
  job.providerJobId = providerJob.resource_name || providerJob.name || providerJob.job_name || providerJob.provider_job_id || '';
  if (!job.providerJobId) throw createError(502, 'Vertex open-model tuning job was created but no provider job id was returned.');

  job.status = mapStatus(providerJob);
  job.progress = fallbackProgress(job, job.status);
  job.startedAt = job.startedAt || new Date();
  applyTunedModelId(job, getTunedModelId(providerJob));
  job.errorMessage = getErrorMessage(providerJob);
  await job.save();
  return job;
}

async function syncJob(job) {
  if (!supportsProvider(job.provider) || !job.providerJobId) return job;
  const providerJob = await vertexAIRequest(job.providerJobId, {}, 'Vertex open-model tuning job sync failed');
  const mappedStatus = mapStatus(providerJob);
  job.status = mappedStatus;
  job.progress = fallbackProgress(job, mappedStatus);
  applyTunedModelId(job, getTunedModelId(providerJob));
  job.errorMessage = getErrorMessage(providerJob);
  if (['completed', 'failed', 'cancelled'].includes(mappedStatus)) job.finishedAt = job.finishedAt || new Date();
  if (['running', 'completed'].includes(mappedStatus)) job.startedAt = job.startedAt || job.createdAt || new Date();
  await job.save();
  return job;
}

async function cancelJob(job) {
  if (!supportsProvider(job.provider) || !job.providerJobId) return null;
  return vertexAIRequest(`${job.providerJobId}:cancel`, { method: 'POST', body: {} }, 'Vertex open-model tuning job cancel failed');
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
  getLocationForProvider,
  getTargetEndpoint,
  getBucket,
  getPythonCommand,
  getSubmitScriptPath,
  hasSubmitScript,
  getOutputGcsUri,
  supportsProvider,
  isReady,
  getBaseModelOptions,
  ensureConfigured,
  ensureBaseModelAllowed,
  preflight,
  submitJob,
  syncJob,
  ensureTunedModelDeployed,
  cancelJob,
  getLogs,
};
