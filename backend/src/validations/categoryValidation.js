const Joi = require('joi');

const objectId = Joi.string().hex().length(24).required();
const slug = Joi.string()
  .trim()
  .lowercase()
  .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .max(80)
  .messages({
    'string.pattern.base': 'Slug chỉ được chứa chữ thường, số và dấu gạch ngang',
  });

const paramsWithId = Joi.object({
  id: objectId,
});

const createCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  slug: slug.allow('').default(''),
  description: Joi.string().trim().max(500).allow('').default(''),
  icon: Joi.string().trim().max(16).allow('').default(''),
  isActive: Joi.boolean().default(true),
  order: Joi.number().integer().min(0).default(0),
});

const updateCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(120),
  slug,
  description: Joi.string().trim().max(500).allow(''),
  icon: Joi.string().trim().max(16).allow(''),
  isActive: Joi.boolean(),
  order: Joi.number().integer().min(0),
}).min(1);

module.exports = {
  paramsWithId,
  createCategorySchema,
  updateCategorySchema,
};
