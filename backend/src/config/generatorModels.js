const FINE_TUNED_MODEL_ACCESS = 'fine-tuned';

const BASE_GENERATOR_MODELS = [
  'gemini-flash',
  'gemini-3-5-flash-lite',
  'gemini-3-flash-preview',
  'gemini-3-6-flash',
  'groq-gpt-oss-120b',
  'groq-gpt-oss-20b',
  'groq-qwen-3-8-27b',
];

const ALL_GENERATOR_MODEL_ACCESS = [
  ...BASE_GENERATOR_MODELS,
  FINE_TUNED_MODEL_ACCESS,
];

function isGenerateModelAccessDisabled(value) {
  const model = String(value || '').trim().toLowerCase();
  return model.startsWith('openrouter-') || model.startsWith('openrouter/') || model.endsWith(':free');
}

function normalizeAllowedModels(value) {
  if (!Array.isArray(value)) return [];

  return Array.from(new Set(
    value
      .map((item) => String(item || '').trim())
      .filter((item) => item && !isGenerateModelAccessDisabled(item)),
  ));
}

function getGenerateModelAccessId(payload = {}) {
  const model = String(payload.model || '').trim();
  if (payload.modelMode === FINE_TUNED_MODEL_ACCESS || model.startsWith(`${FINE_TUNED_MODEL_ACCESS}:`)) {
    return FINE_TUNED_MODEL_ACCESS;
  }

  return model;
}

module.exports = {
  ALL_GENERATOR_MODEL_ACCESS,
  BASE_GENERATOR_MODELS,
  FINE_TUNED_MODEL_ACCESS,
  getGenerateModelAccessId,
  isGenerateModelAccessDisabled,
  normalizeAllowedModels,
};
