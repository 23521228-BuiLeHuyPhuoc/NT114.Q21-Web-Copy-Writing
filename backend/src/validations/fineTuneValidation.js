const Joi = require('joi');
const FineTuneDataset = require('../models/FineTuneDataset');
const FineTuneJob = require('../models/FineTuneJob');

const objectId = Joi.string().hex().length(24);
const defaultBaseModel = process.env.FINE_TUNE_BASE_MODELS?.split(',')[0]?.trim() || 'gemini-flash';

const paramsWithId = Joi.object({
  id: objectId.required(),
});

const tags = Joi.array()
  .items(Joi.string().trim().min(1).max(40))
  .max(12)
  .default([]);

const optionalTags = Joi.array()
  .items(Joi.string().trim().min(1).max(40))
  .max(12);

const baseListSchema = {
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(120).allow('').default(''),
};

const examplePayloadSchema = Joi.object({
  input: Joi.string().trim().min(1).max(8000),
  inputText: Joi.string().trim().min(1).max(8000),
  output: Joi.string().trim().min(1).max(20000),
  outputText: Joi.string().trim().min(1).max(20000),
  industry: Joi.string().trim().lowercase().max(80).allow('').optional(),
  tone: Joi.string().trim().max(80).allow('').default(''),
  sourceContentId: objectId.allow(null).empty('').optional(),
})
  .or('input', 'inputText')
  .or('output', 'outputText');

const listDatasetsSchema = Joi.object({
  ...baseListSchema,
  status: Joi.string().valid(...FineTuneDataset.statuses).allow('').default(''),
  industry: Joi.string().trim().lowercase().max(80).allow('').default(''),
});

const createDatasetSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  industry: Joi.string().trim().lowercase().max(80).allow('').default('general'),
  description: Joi.string().trim().max(1200).allow('').default(''),
  sourceType: Joi.string().valid(...FineTuneDataset.sourceTypes).default('manual'),
  language: Joi.string().trim().max(40).allow('').default('vi'),
  tags,
  examples: Joi.array().items(examplePayloadSchema).max(500).optional(),
});

const updateDatasetSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120),
  industry: Joi.string().trim().lowercase().max(80).allow(''),
  description: Joi.string().trim().max(1200).allow(''),
  language: Joi.string().trim().max(40).allow(''),
  tags: optionalTags,
}).min(1);

const addExamplesSchema = Joi.object({
  examples: Joi.array().items(examplePayloadSchema).min(1).max(500).required(),
});

const listExamplesSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  validOnly: Joi.boolean().default(false),
});

const listFineTuneJobsSchema = Joi.object({
  ...baseListSchema,
  limit: Joi.number().integer().min(1).max(50).default(10),
  status: Joi.string().valid(...FineTuneJob.statuses).allow('').default(''),
  industry: Joi.string().trim().lowercase().max(80).allow('').default(''),
  datasetId: objectId.optional(),
  provider: Joi.string().trim().lowercase().max(80).allow('').default(''),
});

const createFineTuneJobSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  industry: Joi.string().trim().lowercase().max(80).allow('').default('general'),
  baseModel: Joi.string().trim().min(1).max(80).default(defaultBaseModel),
  provider: Joi.string().valid('gemini', 'groq', 'openrouter', 'openai', 'vertex-gemini', 'vertex-llama', 'freegpt4', 'huggingface').default('vertex-gemini'),
  description: Joi.string().trim().max(1200).allow('').default(''),
  datasetId: objectId.optional(),
  datasetUrl: Joi.string().trim().max(500).allow('').default(''),
  samples: Joi.number().integer().min(0).max(100000).default(0),
  epochs: Joi.number().integer().min(1).max(20).default(5),
  language: Joi.string().trim().max(40).allow('').default('vi'),
  examples: Joi.array().items(examplePayloadSchema).min(1).max(500).optional(),
}).or('datasetId', 'examples');

const listFineTunedModelsSchema = Joi.object({
  ...baseListSchema,
  industry: Joi.string().trim().lowercase().max(80).allow('').default(''),
  activeOnly: Joi.boolean().default(false),
});

const setFineTunedModelActiveSchema = Joi.object({
  isActive: Joi.boolean().required(),
});

module.exports = {
  paramsWithId,
  listDatasetsSchema,
  createDatasetSchema,
  updateDatasetSchema,
  addExamplesSchema,
  listExamplesSchema,
  listFineTuneJobsSchema,
  createFineTuneJobSchema,
  listFineTunedModelsSchema,
  setFineTunedModelActiveSchema,
};
