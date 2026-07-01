const FINE_TUNED_MODEL_ACCESS = 'fine-tuned';

const BASE_GENERATOR_MODELS = [
  'gemini-flash',
  'gemini-flash-lite',
  'groq-llama-3-3-70b',
  'groq-llama-3-1-8b',
  'gemini-3-flash-preview',
  'gemma-4-26b',
  'freegpt4-gpt-4',
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
