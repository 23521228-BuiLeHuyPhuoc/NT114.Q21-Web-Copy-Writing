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
}).or('text', 'contentId');

const listReportsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  riskLevel: Joi.string().valid('safe', 'review', 'high', 'critical').optional(),
});

module.exports = {
  paramsWithId,
  checkPlagiarismSchema,
  listReportsSchema,
};
