const DEFAULT_GEMINI_MODEL = 'gemini-embedding-001';
const DEFAULT_OPENAI_MODEL = 'text-embedding-3-small';
const DEFAULT_TIMEOUT_MS = 20000;
const DEFAULT_MAX_TEXT_CHARS = 12000;
const LOCAL_EMBEDDING_DIMENSIONS = 768;

function normalizeProvider(value) {
  const provider = String(value || 'auto').trim().toLowerCase();
  if (['none', 'disabled', 'off'].includes(provider)) return 'none';
  if (['gemini', 'google'].includes(provider)) return 'gemini';
  if (['openai', 'openai-compatible'].includes(provider)) return 'openai';
  if (provider === 'local') return 'local';
  return 'auto';
}

function getGeminiApiKey() {
  return String(process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || '').trim();
}

function getOpenAiApiKey() {
  return String(process.env.OPENAI_API_KEY || '').trim();
}

function resolveProvider() {
  const requested = normalizeProvider(process.env.PLAGIARISM_EMBEDDING_PROVIDER);
  if (requested !== 'auto') return requested;
  if (getGeminiApiKey()) return 'gemini';
  if (getOpenAiApiKey()) return 'openai';
  return 'local';
}

function getProviderModel(provider) {
  if (provider === 'gemini') {
    return String(process.env.PLAGIARISM_GEMINI_EMBEDDING_MODEL || DEFAULT_GEMINI_MODEL).trim();
  }
  if (provider === 'openai') {
    return String(process.env.PLAGIARISM_OPENAI_EMBEDDING_MODEL || DEFAULT_OPENAI_MODEL).trim();
  }
  if (provider === 'local') return 'local-feature-hash-v1';
  return 'none';
}

function getTimeoutMs() {
  const configured = Number(process.env.PLAGIARISM_EMBEDDING_TIMEOUT_MS || DEFAULT_TIMEOUT_MS);
  return Number.isFinite(configured) ? Math.max(1000, configured) : DEFAULT_TIMEOUT_MS;
}

function getMaxTextChars() {
  const configured = Number(process.env.PLAGIARISM_EMBEDDING_MAX_TEXT_CHARS || DEFAULT_MAX_TEXT_CHARS);
  return Number.isFinite(configured) ? Math.max(1000, configured) : DEFAULT_MAX_TEXT_CHARS;
}

function prepareText(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, getMaxTextChars());
}

function normalizeVector(vector) {
  if (!Array.isArray(vector) || vector.length === 0) return [];
  const values = vector.map((value) => Number(value) || 0);
  const magnitude = Math.sqrt(values.reduce((sum, value) => sum + value * value, 0));
  if (!magnitude) return values.map(() => 0);
  return values.map((value) => value / magnitude);
}

function cosineSimilarity(left, right) {
  if (!Array.isArray(left) || !Array.isArray(right) || left.length === 0 || left.length !== right.length) {
    return 0;
  }

  let dotProduct = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  for (let index = 0; index < left.length; index += 1) {
    const leftValue = Number(left[index]) || 0;
    const rightValue = Number(right[index]) || 0;
    dotProduct += leftValue * rightValue;
    leftMagnitude += leftValue * leftValue;
    rightMagnitude += rightValue * rightValue;
  }

  if (!leftMagnitude || !rightMagnitude) return 0;
  return Math.max(-1, Math.min(1, dotProduct / Math.sqrt(leftMagnitude * rightMagnitude)));
}

function hashFeature(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function addLocalFeature(vector, feature, weight) {
  const hash = hashFeature(feature);
  const index = hash % vector.length;
  const sign = (hash & 0x80000000) === 0 ? 1 : -1;
  vector[index] += sign * weight;
}

function buildLocalEmbedding(text) {
  const normalized = prepareText(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u0111\u0110]/g, 'd')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const vector = Array(LOCAL_EMBEDDING_DIMENSIONS).fill(0);
  if (!normalized) return vector;

  const tokens = normalized.split(' ').filter((token) => token.length > 1);
  tokens.forEach((token) => addLocalFeature(vector, `w:${token}`, 1));
  for (let index = 0; index < tokens.length - 1; index += 1) {
    addLocalFeature(vector, `b:${tokens[index]} ${tokens[index + 1]}`, 1.35);
  }
  for (let index = 0; index < tokens.length - 2; index += 1) {
    addLocalFeature(vector, `t:${tokens[index]} ${tokens[index + 1]} ${tokens[index + 2]}`, 1.65);
  }

  return normalizeVector(vector);
}

function createAbortController() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), getTimeoutMs());
  return { controller, timeout };
}

async function embedWithGemini(texts, model) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) throw new Error('Gemini embedding API key is not configured');
  if (typeof fetch !== 'function') throw new Error('Global fetch is not available');

  const vectors = [];
  const batchSize = 50;

  for (let offset = 0; offset < texts.length; offset += batchSize) {
    const batch = texts.slice(offset, offset + batchSize);
    const { controller, timeout } = createAbortController();
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:batchEmbedContents?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requests: batch.map((text) => ({
              model: `models/${model}`,
              content: { parts: [{ text }] },
              taskType: 'SEMANTIC_SIMILARITY',
            })),
          }),
          signal: controller.signal,
        },
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error?.message || `Gemini embeddings returned HTTP ${response.status}`);
      }
      const batchVectors = (data.embeddings || []).map((item) => normalizeVector(item.values || []));
      if (batchVectors.length !== batch.length || batchVectors.some((vector) => vector.length === 0)) {
        throw new Error('Gemini embeddings returned an incomplete batch');
      }
      vectors.push(...batchVectors);
    } finally {
      clearTimeout(timeout);
    }
  }

  return vectors;
}

async function embedWithOpenAi(texts, model) {
  const apiKey = getOpenAiApiKey();
  if (!apiKey) throw new Error('OpenAI embedding API key is not configured');
  if (typeof fetch !== 'function') throw new Error('Global fetch is not available');

  const baseUrl = String(process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
  const vectors = [];
  const batchSize = 100;

  for (let offset = 0; offset < texts.length; offset += batchSize) {
    const batch = texts.slice(offset, offset + batchSize);
    const { controller, timeout } = createAbortController();
    try {
      const response = await fetch(`${baseUrl}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ model, input: batch }),
        signal: controller.signal,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error?.message || `OpenAI embeddings returned HTTP ${response.status}`);
      }
      const batchVectors = (data.data || [])
        .slice()
        .sort((left, right) => Number(left.index || 0) - Number(right.index || 0))
        .map((item) => normalizeVector(item.embedding || []));
      if (batchVectors.length !== batch.length || batchVectors.some((vector) => vector.length === 0)) {
        throw new Error('OpenAI embeddings returned an incomplete batch');
      }
      vectors.push(...batchVectors);
    } finally {
      clearTimeout(timeout);
    }
  }

  return vectors;
}

function embedLocally(texts) {
  return texts.map(buildLocalEmbedding);
}

async function embedTexts(values, options = {}) {
  const texts = (Array.isArray(values) ? values : []).map(prepareText);
  const provider = normalizeProvider(options.provider || resolveProvider());
  const model = String(options.model || getProviderModel(provider)).trim();

  if (provider === 'none' || texts.length === 0) {
    return {
      vectors: texts.map(() => []),
      provider: 'none',
      model: 'none',
      status: provider === 'none' ? 'disabled' : 'empty',
      error: '',
    };
  }

  try {
    const vectors = provider === 'gemini'
      ? await embedWithGemini(texts, model)
      : provider === 'openai'
        ? await embedWithOpenAi(texts, model)
        : embedLocally(texts);

    return { vectors, provider, model, status: 'ok', error: '' };
  } catch (error) {
    if (options.allowLocalFallback === false || provider === 'local') throw error;
    return {
      vectors: embedLocally(texts),
      provider: 'local',
      model: getProviderModel('local'),
      status: 'fallback',
      error: error instanceof Error ? error.message : String(error || 'Embedding provider failed'),
      requestedProvider: provider,
      requestedModel: model,
    };
  }
}

module.exports = {
  embedTexts,
  cosineSimilarity,
  __test: {
    buildLocalEmbedding,
    normalizeVector,
    prepareText,
    resolveProvider,
  },
};
