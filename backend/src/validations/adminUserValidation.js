const Joi = require('joi');
const { adminRoles } = require('./authValidation');

const objectId = Joi.string().hex().length(24).required();
const accountType = Joi.string().valid('user', 'admin').required();
const status = Joi.string().valid('active', 'locked');

const paramsWithAccountType = Joi.object({
  accountType,
  id: objectId,
});

const createAdminUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(8).max(128).required(),
  role: Joi.string().valid('customer', 'admin').required(),
  adminRole: Joi.when('role', {
    is: 'admin',
    then: Joi.string().valid(...adminRoles).default('analyst'),
    otherwise: Joi.forbidden(),
  }),
  status,
});

const updateAdminUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120),
  email: Joi.string().trim().lowercase().email(),
  adminRole: Joi.string().valid(...adminRoles),
  status,
}).min(1);

module.exports = {
  paramsWithAccountType,
  createAdminUserSchema,
  updateAdminUserSchema,
};
