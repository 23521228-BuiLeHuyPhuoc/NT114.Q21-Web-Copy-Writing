const Joi = require('joi');

const listAuditLogsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(100),
  search: Joi.string().trim().max(120).allow('').default(''),
  level: Joi.string().valid('all', 'info', 'warning', 'error').default('all'),
});

const createAuditLogSchema = Joi.object({
  action: Joi.string().trim().max(120).required(),
  targetType: Joi.string().trim().max(80).allow('').default(''),
  targetId: Joi.string().trim().max(200).allow('').default(''),
  level: Joi.string().valid('info', 'warning', 'error').default('info'),
  metadata: Joi.object().unknown(true).default({}),
});

module.exports = {
  listAuditLogsSchema,
  createAuditLogSchema,
};
