const Joi = require('joi');

const objectId = Joi.string().hex().length(24);
const generateTypes = ['headline', 'description', 'social', 'email', 'cta', 'landing', 'seo', 'review'];

const paramsWithId = Joi.object({
  id: objectId.required(),
});

const listTemplatesSchema = Joi.object({
  category: Joi.string().trim().lowercase().max(80).allow('').default(''),
  type: Joi.string().valid(...generateTypes).allow('').default(''),
  search: Joi.string().trim().max(120).allow('').default(''),
});

const templateVariableSchema = Joi.object({
  key: Joi.string().trim().min(1).max(60).required(),
  label: Joi.string().trim().min(1).max(120).required(),
  required: Joi.boolean().default(false),
  defaultValue: Joi.string().trim().max(500).allow('').default(''),
});

const createTemplateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  description: Joi.string().trim().max(1000).allow('').default(''),
  category: Joi.string().trim().lowercase().min(1).max(80).required(),
  type: Joi.string().valid(...generateTypes).required(),
  systemPrompt: Joi.string().trim().min(10).max(6000).required(),
  variables: Joi.array().items(templateVariableSchema).max(20).default([]),
});

module.exports = {
  paramsWithId,
  listTemplatesSchema,
  createTemplateSchema,
};
