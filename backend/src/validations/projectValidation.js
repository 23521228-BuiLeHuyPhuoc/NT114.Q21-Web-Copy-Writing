const Joi = require('joi');

const objectId = Joi.string().hex().length(24);
const projectColor = Joi.string()
  .trim()
  .pattern(/^from-[a-z]+-\d{3}\s+to-[a-z]+-\d{3}$/)
  .message('color must be a supported gradient class')
  .max(80);

const paramsWithId = Joi.object({
  id: objectId.required(),
});

const listProjectsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  search: Joi.string().trim().max(120).allow('').default(''),
  includeArchived: Joi.boolean().truthy('true').falsy('false').default(false),
});

const createProjectSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  description: Joi.string().trim().max(1000).allow('').default(''),
  industry: Joi.string().trim().max(120).allow('').default('General'),
  color: projectColor.allow('').optional(),
});

const updateProjectSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120),
  description: Joi.string().trim().max(1000).allow(''),
  industry: Joi.string().trim().max(120).allow(''),
  isArchived: Joi.boolean(),
  color: projectColor.allow(''),
}).min(1);

module.exports = {
  paramsWithId,
  listProjectsSchema,
  createProjectSchema,
  updateProjectSchema,
};
