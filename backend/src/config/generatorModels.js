const FINE_TUNED_MODEL_ACCESS = 'fine-tuned';

const BASE_GENERATOR_MODELS = [
  'gemini-flash',
  'gemini-flash-lite',
  'groq-llama-3-3-70b',
  'groq-llama-3-1-8b',
  'gemini-3-flash-preview',
  'gemini-3-1-flash-lite',
  'gemma-4-26b',
  'openrouter-free',
  'freegpt4-gpt-4',
  'freegpt4-gpt-4o',
];

const ALL_GENERATOR_MODEL_ACCESS = [
  ...BASE_GENERATOR_MODELS,
  FINE_TUNED_MODEL_ACCESS,
];

function normalizeAllowedModels(value) {
  if (!Array.isArray(value)) return [];

  return Array.from(new Set(
    value
      .map((item) => String(item || '').trim())
      .filter(Boolean),
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
  normalizeAllowedModels,
};
