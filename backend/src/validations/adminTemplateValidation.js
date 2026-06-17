const Joi = require('joi');

const objectId = Joi.string().hex().length(24).required();
const generateTypes = ['headline', 'description', 'social', 'email', 'cta', 'landing', 'seo', 'review', 'ads'];
const templateStatuses = ['active', 'inactive', 'archived'];

const paramsWithId = Joi.object({
  id: objectId,
});

const templateVariableSchema = Joi.object({
  key: Joi.string().trim().min(1).max(60).required(),
  label: Joi.string().trim().min(1).max(120).required(),
  required: Joi.boolean().default(false),
  defaultValue: Joi.string().trim().max(500).allow('').default(''),
});

const listAdminTemplatesSchema = Joi.object({
  category: Joi.string().trim().lowercase().max(80).allow('').default(''),
  type: Joi.string().valid(...generateTypes).allow('').default(''),
  status: Joi.string().valid('all', ...templateStatuses).allow('').default('all'),
  search: Joi.string().trim().max(120).allow('').default(''),
});

const createAdminTemplateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  slug: Joi.string().trim().lowercase().max(140).allow(''),
  description: Joi.string().trim().max(1000).allow('').default(''),
  category: Joi.string().trim().lowercase().min(1).max(80).required(),
  type: Joi.string().valid(...generateTypes).required(),
  systemPrompt: Joi.string().trim().min(10).max(6000).required(),
  variables: Joi.array().items(templateVariableSchema).max(20).default([]),
  isSystem: Joi.boolean().default(true),
  status: Joi.string().valid(...templateStatuses).default('active'),
});

const updateAdminTemplateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120),
  slug: Joi.string().trim().lowercase().max(140).allow(''),
  description: Joi.string().trim().max(1000).allow(''),
  category: Joi.string().trim().lowercase().min(1).max(80),
  type: Joi.string().valid(...generateTypes),
  systemPrompt: Joi.string().trim().min(10).max(6000),
  variables: Joi.array().items(templateVariableSchema).max(20),
  isSystem: Joi.boolean(),
  status: Joi.string().valid(...templateStatuses),
}).min(1);

module.exports = {
  paramsWithId,
  listAdminTemplatesSchema,
  createAdminTemplateSchema,
  updateAdminTemplateSchema,
};
