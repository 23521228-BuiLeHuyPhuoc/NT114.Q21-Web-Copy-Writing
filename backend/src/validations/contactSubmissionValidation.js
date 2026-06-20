const Joi = require('joi');

const objectId = Joi.string().hex().length(24);
const topic = Joi.string().valid('product', 'support', 'partner', 'business', 'billing', 'other');
const status = Joi.string().valid('new', 'in_progress', 'resolved', 'spam', 'archived');

const paramsWithId = Joi.object({
  id: objectId.required(),
});

const createContactSubmissionSchema = Joi.object({
  name: Joi.string().trim().min(1).max(120).required().messages({
    'any.required': 'Vui lòng nhập họ tên',
    'string.empty': 'Vui lòng nhập họ tên',
    'string.max': 'Họ tên không được vượt quá 120 ký tự',
  }),
  email: Joi.string().trim().email().max(160).required().messages({
    'any.required': 'Vui lòng nhập email',
    'string.empty': 'Vui lòng nhập email',
    'string.email': 'Email không đúng định dạng',
    'string.max': 'Email không được vượt quá 160 ký tự',
  }),
  company: Joi.string().trim().max(160).allow('').default('').messages({
    'string.max': 'Tên công ty không được vượt quá 160 ký tự',
  }),
  topic: topic.default('other').messages({
    'any.only': 'Chủ đề liên hệ không hợp lệ',
  }),
  message: Joi.string().trim().min(1).max(4000).required().messages({
    'any.required': 'Vui lòng nhập nội dung liên hệ',
    'string.empty': 'Vui lòng nhập nội dung liên hệ',
    'string.max': 'Nội dung liên hệ không được vượt quá 4000 ký tự',
  }),
});

const listContactSubmissionsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  status: status.allow('all').default('all'),
  topic: topic.allow('all').default('all'),
  search: Joi.string().trim().max(160).allow('').default(''),
  dateFrom: Joi.date().iso().optional(),
  dateTo: Joi.date().iso().optional(),
});

const updateContactSubmissionSchema = Joi.object({
  status,
  adminNote: Joi.string().trim().max(2000).allow(''),
}).min(1);

module.exports = {
  createContactSubmissionSchema,
  listContactSubmissionsSchema,
  paramsWithId,
  updateContactSubmissionSchema,
};
