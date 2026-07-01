const mongoose = require('mongoose');
const FineTunedModel = require('../models/FineTunedModel');

const FINE_TUNED_PREFIX = 'fine-tuned:';

const BASE_MODEL_LABELS = {
  'claude-haiku-4-5': 'Claude Haiku 4.5',
  'claude-haiku-4-5@20251001': 'Claude Haiku 4.5',
  'claude-haiku-4-5-20251001': 'Claude Haiku 4.5',
  'demo-seed': 'Demo seed',
  'fallback-mvp': 'Fallback MVP',
  'freegpt4:gpt-4': 'GPT-4 Free Local API',
  'freegpt4-gpt-4': 'GPT-4 Free Local API',
  'freegpt4:gpt-4o': 'GPT-4o Free Local API',
  'freegpt4-gpt-4o': 'GPT-4o Free Local API',
  'gemini-2-5-pro': 'Gemini 2.5 Pro',
  'gemini-2.5-flash': 'Gemini 2.5 Flash',
  'gemini-2.5-flash-lite': 'Gemini 2.5 Flash Lite',
  'gemini-3-1-flash-lite': 'Gemini 3.1 Flash Lite',
  'gemini-3-flash-preview': 'Gemini 3 Flash Preview',
  'gemini-3-pro-preview': 'Gemini 3 Pro Preview',
  'gemini-flash': 'Gemini 2.5 Flash',
  'gemini-flash-lite': 'Gemini 2.5 Flash Lite',
  'gemini-pro-latest': 'Gemini Pro Latest',
  'gemini-3.1-flash-lite': 'Gemini 3.1 Flash Lite',
  'gemma-4-26b': 'Gemma 4 26B',
  'gemma-4-26b-a4b-it': 'Gemma 4 26B A4B IT',
  'gemma-4-31b': 'Gemma 4 31B',
  'gemma-4-31b-it': 'Gemma 4 31B IT',
  'gpt-4o': 'GPT-4o',
  gpt4o: 'GPT-4o',
  'gpt-3.5-turbo': 'GPT-3.5 Turbo',
  gpt35: 'GPT-3.5 Turbo',
  'gpt-5.5': 'GPT-5.5',
  'groq-llama-3-1-8b': 'Llama 3.1 8B Instant (Groq)',
  'groq-llama-3-3-70b': 'Llama 3.3 70B (Groq)',
  'llama-3.1-8b-instant': 'Llama 3.1 8B Instant (Groq)',
  'llama-3.3-70b-versatile': 'Llama 3.3 70B Versatile (Groq)',
  llama3: 'Llama 3.1 70B',
  'meta/llama-3.3-70b-instruct-maas': 'Llama 3.3 70B Instruct (Vertex MaaS)',
  'meta/llama3-3@llama-3.3-70b-instruct': 'Llama 3.3 70B Instruct (Vertex)',
  'meta-llama/llama-3.1-8b-instruct': 'Llama 3.1 8B Instruct',
  'meta-llama/llama-3.2-1b-instruct': 'Llama 3.2 1B Instruct',
  'meta-llama/llama-3.2-3b-instruct': 'Llama 3.2 3B Instruct',
  'nvidia/nemotron-3-super-120b-a12b:free': 'NVIDIA Nemotron 3 Super 120B (OpenRouter Free)',
  'openai/gpt-oss-20b-maas': 'GPT-OSS 20B (Vertex MaaS)',
  'openai/gpt-oss-120b-maas': 'GPT-OSS 120B (Vertex MaaS)',
  'openrouter/free': 'OpenRouter Free Router',
  'openrouter-deepseek-free': 'OpenRouter Free Router',
  'openrouter-free': 'OpenRouter Free Router',
  'openrouter-gemma-free': 'Gemma Free (OpenRouter)',
  'openrouter-nemotron-free': 'Nemotron Free (OpenRouter)',
  'openrouter-qwen-free': 'Qwen Free (OpenRouter)',
  'qwen/qwen3-next-80b-a3b-instruct:free': 'Qwen Free (OpenRouter)',
  'qwen/qwen3@qwen3-14b': 'Qwen 3 14B (Vertex)',
  'qwen/qwen3-14b': 'Qwen 3 14B',
  'qwen3-14b': 'Qwen 3 14B',
  'qwen_qwen3-14b': 'Qwen 3 14B',
  'qwen/qwen3@qwen3-0.6b': 'Qwen 3 0.6B',
  'qwen/qwen3-0.6b': 'Qwen 3 0.6B',
  'qwen/qwen3-0_6b': 'Qwen 3 0.6B',
  'qwen3-0.6b': 'Qwen 3 0.6B',
  'qwen3-0_6b': 'Qwen 3 0.6B',
  'qwen_qwen3-0_6b': 'Qwen 3 0.6B',
  'projects/167488791850/locations/us-central1/endpoints/mg-endpoint-2586ea99-6b17-4460-aa86-1e2c1aa12ae7': 'Llama 3.3 70B Endpoint (Vertex)',
  'projects/167488791850/locations/us-central1/endpoints/mg-endpoint-a9c832c8-717e-4f12-8229-3ba0c89304eb': 'Qwen 3 0.6B Endpoint (Vertex)',
  'projects/copy-writing-499306/locations/us-central1/publishers/google/models/gemini-2.5-flash': 'Gemini 2.5 Flash (Vertex)',
  'projects/copy-writing-499306/locations/us-central1/publishers/google/models/gemini-2.5-flash-lite': 'Gemini 2.5 Flash Lite (Vertex)',
};

function formatBaseModelDisplayName(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';

  const normalized = raw.toLowerCase();
  if (BASE_MODEL_LABELS[raw]) return BASE_MODEL_LABELS[raw];
  if (BASE_MODEL_LABELS[normalized]) return BASE_MODEL_LABELS[normalized];

  const resourceModel = raw.match(/\/models\/([^/:]+)$/i)?.[1];
  if (resourceModel) {
    return BASE_MODEL_LABELS[resourceModel]
      || BASE_MODEL_LABELS[resourceModel.toLowerCase()]
      || resourceModel;
  }

  return raw;
}

function getFineTunedRegistryId(value) {
  const text = String(value || '').trim();
  if (!text.startsWith(FINE_TUNED_PREFIX)) return '';

  const id = text.slice(FINE_TUNED_PREFIX.length).trim();
  return mongoose.Types.ObjectId.isValid(id) ? id : '';
}

function getFineTunedDisplayName(model) {
  const fineTunedName = String(
    model?.name
    || model?.alias
    || model?.providerModelId
    || '',
  ).trim();
  const baseModelName = formatBaseModelDisplayName(model?.baseModel);

  if (fineTunedName && baseModelName && fineTunedName !== baseModelName) {
    return `${fineTunedName} · base ${baseModelName}`;
  }

  return fineTunedName || baseModelName;
}

function getFallbackDisplayName(modelUsed) {
  const value = String(modelUsed || '').trim();
  return getFineTunedRegistryId(value) ? 'Fine-tuned model' : (formatBaseModelDisplayName(value) || 'Fallback MVP');
}

async function buildModelDisplayNameMap(modelValues = [], options = {}) {
  const ids = Array.from(new Set(
    modelValues
      .map(getFineTunedRegistryId)
      .filter(Boolean),
  ));

  if (ids.length === 0) return new Map();

  const filter = { _id: { $in: ids } };
  if (options.userId) filter.userId = options.userId;

  const models = await FineTunedModel.find(filter)
    .select('name alias baseModel providerModelId')
    .lean();

  const names = new Map();
  models.forEach((model) => {
    const id = model._id.toString();
    const displayName = getFineTunedDisplayName(model);
    if (!displayName) return;

    names.set(id, displayName);
    names.set(`${FINE_TUNED_PREFIX}${id}`, displayName);
  });

  return names;
}

function resolveModelDisplayName(modelUsed, displayNameMap = new Map()) {
  const value = String(modelUsed || '').trim();
  const registryId = getFineTunedRegistryId(value);

  if (!registryId) return getFallbackDisplayName(value);
  return displayNameMap.get(value)
    || displayNameMap.get(registryId)
    || getFallbackDisplayName(value);
}

module.exports = {
  FINE_TUNED_PREFIX,
  buildModelDisplayNameMap,
  formatBaseModelDisplayName,
  getFineTunedRegistryId,
  resolveModelDisplayName,
};
