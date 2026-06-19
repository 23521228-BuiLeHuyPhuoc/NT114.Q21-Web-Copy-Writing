const Joi = require('joi');

const objectId = Joi.string().hex().length(24);
const optionalObjectId = objectId.allow(null).empty('').optional();

const paramsWithId = Joi.object({
  id: objectId.required(),
});

const checkPlagiarismSchema = Joi.object({
  text: Joi.string().trim().min(20).max(60000).empty('').optional(),
  contentId: optionalObjectId,
  threshold: Joi.number().integer().min(10).max(95).default(35),
  includeReferences: Joi.boolean().default(true),
  sensitivity: Joi.string().valid('lenient', 'balanced', 'strict').default('balanced'),
  ignoreCommonPhrases: Joi.boolean().default(true),
  ignoredPhrases: Joi.array().items(Joi.string().trim().min(2).max(10000)).max(30).default([]),
  sources: Joi.object({
    database: Joi.boolean().default(true),
    references: Joi.boolean().default(true),
    web: Joi.boolean().default(false),
    uploads: Joi.boolean().default(false),
  }).default(),
  uploadedSources: Joi.array().items(Joi.object({
    source: Joi.string().trim().max(500).required(),
    sourceTitle: Joi.string().trim().max(200).required(),
    sourceUrl: Joi.string().trim().max(500).allow('').default(''),
    sourceType: Joi.string().valid('uploads').default('uploads'),
    text: Joi.string().trim().min(20).max(60000).required(),
    mimeType: Joi.string().trim().max(120).allow('').default(''),
    size: Joi.number().integer().min(0).default(0),
  })).max(5).default([]),
}).or('text', 'contentId');

const debugCommonCrawlSchema = Joi.object({
  text: Joi.string().trim().min(20).max(60000).required(),
  allowLiveFallback: Joi.boolean().default(false),
  budgetMs: Joi.number().integer().min(5000).max(120000).optional(),
});

const listReportsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  riskLevel: Joi.string().valid('safe', 'review', 'high', 'critical').optional(),
});

module.exports = {
  paramsWithId,
  checkPlagiarismSchema,
  debugCommonCrawlSchema,
  listReportsSchema,
};
