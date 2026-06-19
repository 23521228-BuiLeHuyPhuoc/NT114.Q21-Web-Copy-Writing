const Joi = require('joi');

const pageKeyParam = Joi.object({
  key: Joi.string().trim().lowercase().pattern(/^[a-z0-9-]+$/).max(80).required(),
});

const updatePublicPageSchema = Joi.object({
  type: Joi.string().valid('page', 'blog', 'settings'),
  title: Joi.string().trim().max(200).allow(''),
  description: Joi.string().trim().max(1000).allow(''),
  content: Joi.object().unknown(true).default({}),
  seo: Joi.object({
    metaTitle: Joi.string().trim().max(200).allow(''),
    metaDescription: Joi.string().trim().max(500).allow(''),
  }).unknown(false),
  isPublished: Joi.boolean(),
  sortOrder: Joi.number().integer().min(0),
}).min(1);

module.exports = {
  pageKeyParam,
  updatePublicPageSchema,
};
