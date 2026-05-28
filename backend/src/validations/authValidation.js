const Joi = require('joi');

const adminRoles = [
  'super_admin',
  'content_manager',
  'user_manager',
  'finance_manager',
  'ai_engineer',
  'analyst',
];

const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

const email = Joi.string()
  .trim()
  .lowercase()
  .email({ tlds: { allow: false } })
  .max(254)
  .required()
  .messages({
    'any.required': 'Email is required',
    'string.empty': 'Email is required',
    'string.email': 'Email is invalid',
    'string.max': 'Email must be at most 254 characters',
  });

const name = Joi.string()
  .trim()
  .min(2)
  .max(120)
  .required()
  .messages({
    'any.required': 'Name is required',
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name must be at most 120 characters',
  });

const loginPassword = Joi.string()
  .min(1)
  .max(128)
  .required()
  .messages({
    'any.required': 'Password is required',
    'string.empty': 'Password is required',
    'string.max': 'Password must be at most 128 characters',
  });

const strongPassword = Joi.string()
  .min(8)
  .max(128)
  .pattern(strongPasswordPattern)
  .required()
  .messages({
    'any.required': 'Password is required',
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 8 characters',
    'string.max': 'Password must be at most 128 characters',
    'string.pattern.base': 'Password must include uppercase, lowercase and number',
  });

const otp = Joi.string().pattern(/^\d{6}$/).required().messages({
  'any.required': 'OTP is required',
  'string.empty': 'OTP is required',
  'string.pattern.base': 'OTP must be exactly 6 digits',
});

const userRegisterSchema = Joi.object({
  name,
  email,
  password: strongPassword,
});

const loginSchema = Joi.object({
  email,
  password: loginPassword,
});

const forgotPasswordSchema = Joi.object({
  email,
});

const verifyOtpSchema = Joi.object({
  email,
  otp,
});

const resetPasswordSchema = Joi.object({
  email,
  otp,
  newPassword: strongPassword,
});

module.exports = {
  userRegisterSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  adminRoles,
};
