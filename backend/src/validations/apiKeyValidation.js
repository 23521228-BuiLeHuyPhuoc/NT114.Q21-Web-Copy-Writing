const Joi = require('joi');
const ApiKey = require('../models/ApiKey');

const objectId = Joi.string().hex().length(24).required();

const paramsWithId = Joi.object({
  id: objectId,
});

const createApiKeySchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  permissions: Joi.array().items(Joi.string().valid(...ApiKey.permissions)).min(1).max(ApiKey.permissions.length).default(['generate']),
});

const listApiKeyLogsSchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(50),
});

module.exports = {
  paramsWithId,
  createApiKeySchema,
  listApiKeyLogsSchema,
};
