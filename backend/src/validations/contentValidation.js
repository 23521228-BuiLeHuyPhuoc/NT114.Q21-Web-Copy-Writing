const Joi = require('joi');

const objectId = Joi.string().hex().length(24);
const optionalObjectId = objectId.allow(null).empty('').optional();

const paramsWithId = Joi.object({
  id: objectId.required(),
});

const listContentsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  search: Joi.string().trim().max(120).allow('').default(''),
  projectId: objectId.optional(),
});

const tags = Joi.array()
  .items(Joi.string().trim().min(1).max(40))
  .max(10)
  .default([]);

const optionalTags = Joi.array()
  .items(Joi.string().trim().min(1).max(40))
  .max(10);

const createContentSchema = Joi.object({
  title: Joi.string().trim().min(1).max(160).required(),
  prompt: Joi.string().trim().min(1).max(6000).required(),
  outputText: Joi.string().trim().min(1).max(20000).required(),
  type: Joi.string().trim().min(1).max(60).required(),
  tone: Joi.string().trim().max(60).allow('').default(''),
  language: Joi.string().trim().max(40).allow('').default('vi'),
  model: Joi.string().trim().max(80).allow('').optional(),
  modelUsed: Joi.string().trim().max(80).allow('').optional(),
  tags,
  projectId: optionalObjectId,
  templateId: optionalObjectId,
});

const updateContentSchema = Joi.object({
  title: Joi.string().trim().min(1).max(160),
  tags: optionalTags,
  isFavorite: Joi.boolean(),
  projectId: optionalObjectId,
}).min(1);

const generateContentSchema = Joi.object({
  prompt: Joi.string().trim().min(1).max(6000).required(),
  type: Joi.string().trim().min(1).max(60).required(),
  tone: Joi.string().trim().min(1).max(60).required(),
  language: Joi.string().trim().min(1).max(40).required(),
  model: Joi.string().trim().min(1).max(80).required(),
  templateId: optionalObjectId,
  projectId: optionalObjectId,
});

module.exports = {
  paramsWithId,
  listContentsSchema,
  createContentSchema,
  updateContentSchema,
  generateContentSchema,
};
