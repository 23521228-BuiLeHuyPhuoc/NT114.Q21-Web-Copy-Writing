const Joi = require('joi');

const objectId = Joi.string().hex().length(24);

const paramsWithId = Joi.object({
  id: objectId.required(),
});

const listNotificationsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  unreadOnly: Joi.boolean().truthy('true').falsy('false').optional(),
});

module.exports = {
  paramsWithId,
  listNotificationsSchema,
};
