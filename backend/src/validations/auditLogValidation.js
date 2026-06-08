const Joi = require('joi');

const listAuditLogsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(100),
  search: Joi.string().trim().max(120).allow('').default(''),
  level: Joi.string().valid('all', 'info', 'warning', 'error').default('all'),
});

module.exports = {
  listAuditLogsSchema,
};
