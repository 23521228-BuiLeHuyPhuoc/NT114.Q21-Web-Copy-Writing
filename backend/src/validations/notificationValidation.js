const Joi = require('joi');

const objectId = Joi.string().hex().length(24);
const notificationType = Joi.string().valid('system', 'billing', 'ai', 'account');

const paramsWithId = Joi.object({
  id: objectId.required(),
});

const listNotificationsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  unreadOnly: Joi.boolean().truthy('true').falsy('false').optional(),
});

const notificationPreferencesSchema = Joi.object({
  quotaLow: Joi.boolean().required(),
});

const adminListNotificationsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  recipientType: Joi.string().valid('all', 'user', 'admin').default('all'),
  type: Joi.string().valid('all', 'system', 'billing', 'ai', 'account').default('all'),
  source: Joi.string().valid('all', 'sent_by_me', 'received_by_me').default('all'),
  search: Joi.string().trim().max(120).allow('').optional(),
});

const notificationRecipientSchema = Joi.object({
  accountType: Joi.string().valid('user', 'admin').required(),
  id: objectId.required(),
});

const sendAdminNotificationSchema = Joi.object({
  title: Joi.string().trim().min(2).max(160).required(),
  message: Joi.string().trim().min(2).max(1000).required(),
  type: notificationType.default('system'),
  actionUrl: Joi.string().trim().max(500).allow('').default(''),
  recipientMode: Joi.string().valid('all_users', 'all_admins', 'selected').required(),
  recipients: Joi.when('recipientMode', {
    is: 'selected',
    then: Joi.array().items(notificationRecipientSchema).min(1).required(),
    otherwise: Joi.array().items(notificationRecipientSchema).default([]),
  }),
});

module.exports = {
  paramsWithId,
  listNotificationsSchema,
  adminListNotificationsSchema,
  notificationPreferencesSchema,
  sendAdminNotificationSchema,
};
