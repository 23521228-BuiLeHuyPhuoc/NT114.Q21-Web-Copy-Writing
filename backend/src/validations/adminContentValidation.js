const Joi = require('joi');

const objectId = Joi.string().hex().length(24);

const paramsWithId = Joi.object({
  id: objectId.required(),
});

const listAdminContentsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().trim().max(120).allow('').default(''),
  userId: objectId.optional(),
});

const tags = Joi.array()
  .items(Joi.string().trim().min(1).max(40))
  .max(10);

const updateAdminContentSchema = Joi.object({
  title: Joi.string().trim().min(1).max(160),
  type: Joi.string().trim().min(1).max(60),
  tags,
  isFavorite: Joi.boolean(),
}).min(1);

module.exports = {
  paramsWithId,
  listAdminContentsSchema,
  updateAdminContentSchema,
};
