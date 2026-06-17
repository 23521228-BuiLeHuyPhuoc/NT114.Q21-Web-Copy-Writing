const Joi = require('joi');

const objectId = Joi.string().hex().length(24).required();
const modelId = Joi.string().trim().min(1).max(600);

const paramsWithId = Joi.object({
  id: objectId,
});

const limitValue = Joi.number().integer().min(-1);

const planPayload = {
  name: Joi.string().trim().min(2).max(120),
  slug: Joi.string().trim().lowercase().max(80).allow(''),
  description: Joi.string().trim().max(1000).allow(''),
  price: Joi.number().integer().min(-1),
  priceMonthly: Joi.number().integer().min(-1),
  monthlyPrice: Joi.number().integer().min(-1),
  priceYearly: Joi.number().integer().min(-1),
  yearlyPrice: Joi.number().integer().min(-1),
  currency: Joi.string().trim().uppercase().max(8),
  copyLimit: limitValue,
  apiLimit: limitValue,
  fineTune: limitValue,
  plagiarismChecks: limitValue,
  seats: limitValue,
  historyDays: limitValue,
  limits: Joi.object({
    copyMonthly: limitValue,
    apiCallsMonthly: limitValue,
    fineTuneModels: limitValue,
    plagiarismChecks: limitValue,
    seats: limitValue,
    historyDays: limitValue,
  }),
  features: Joi.array().items(Joi.string().trim().max(200)),
  excludedFeatures: Joi.array().items(Joi.string().trim().max(200)),
  allowedModels: Joi.array().items(modelId).max(50),
  isPopular: Joi.boolean(),
  popular: Joi.boolean(),
  isActive: Joi.boolean(),
  active: Joi.boolean(),
  sortOrder: Joi.number().integer().min(0),
};

const createPlanSchema = Joi.object({
  ...planPayload,
  name: planPayload.name.required(),
}).or('price', 'priceMonthly', 'monthlyPrice');

const updatePlanSchema = Joi.object(planPayload).min(1);

const checkoutSchema = Joi.object({
  planId: Joi.string().hex().length(24),
  planSlug: Joi.string().trim().lowercase().max(80),
  billingCycle: Joi.string().valid('monthly', 'yearly').default('monthly'),
  method: Joi.string().valid('cash', 'bank', 'momo', 'zalo', 'zalopay', 'vnpay', 'visa', 'manual').default('manual'),
}).xor('planId', 'planSlug');

module.exports = {
  paramsWithId,
  createPlanSchema,
  updatePlanSchema,
  checkoutSchema,
};
