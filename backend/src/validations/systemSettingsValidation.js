const Joi = require('joi');

const systemSettingsSchema = Joi.object({
  siteName: Joi.string().trim().min(2).max(120),
  supportEmail: Joi.string().trim().email().max(160),
  maintenanceMode: Joi.boolean(),
  maintenanceMessage: Joi.string().trim().max(500).allow(''),
  registrationEnabled: Joi.boolean(),
  emailVerificationRequired: Joi.boolean(),
}).min(1);

module.exports = {
  systemSettingsSchema,
};
