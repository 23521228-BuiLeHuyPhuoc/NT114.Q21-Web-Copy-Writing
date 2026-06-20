const Joi = require('joi');

const emailTemplateSchema = Joi.object({
  key: Joi.string().trim().max(80).required(),
  name: Joi.string().trim().max(120).allow(''),
  subject: Joi.string().trim().max(200).allow(''),
  text: Joi.string().trim().max(6000).allow(''),
  html: Joi.string().trim().max(12000).allow(''),
});

const systemSettingsSchema = Joi.object({
  siteName: Joi.string().trim().min(2).max(120),
  supportEmail: Joi.string().trim().email().max(160),
  maintenanceMode: Joi.boolean(),
  maintenanceMessage: Joi.string().trim().max(500).allow(''),
  registrationEnabled: Joi.boolean(),
  emailVerificationRequired: Joi.boolean(),
  emailTemplates: Joi.array().items(emailTemplateSchema).max(20),
}).min(1);

const envSettingsSchema = Joi.object({
  values: Joi.object()
    .pattern(
      Joi.string().trim().regex(/^[A-Z][A-Z0-9_]*$/),
      Joi.alternatives().try(
        Joi.string().max(20000).allow(''),
        Joi.number(),
        Joi.boolean(),
      ),
    )
    .min(1)
    .required(),
}).required();

const resetUserQuotaParams = Joi.object({
  userId: Joi.string().trim().hex().length(24).required(),
}).required();

module.exports = {
  envSettingsSchema,
  resetUserQuotaParams,
  systemSettingsSchema,
};
