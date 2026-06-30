const mongoose = require('mongoose');

const emailTemplateSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    name: {
      type: String,
      trim: true,
      maxlength: 120,
      default: '',
    },
    subject: {
      type: String,
      trim: true,
      maxlength: 200,
      default: '',
    },
    text: {
      type: String,
      trim: true,
      maxlength: 6000,
      default: '',
    },
    html: {
      type: String,
      trim: true,
      maxlength: 12000,
      default: '',
    },
  },
  { _id: false },
);

const systemSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'default',
      index: true,
    },
    siteName: {
      type: String,
      trim: true,
      maxlength: 120,
      default: 'CopyPro',
    },
    supportEmail: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 160,
      default: () => process.env.SUPPORT_EMAIL || process.env.SMTP_FROM || 'support@example.com',
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
      index: true,
    },
    maintenanceMessage: {
      type: String,
      trim: true,
      maxlength: 500,
      default: 'He thong dang bao tri. Vui long quay lai sau.',
    },
    registrationEnabled: {
      type: Boolean,
      default: true,
    },
    emailVerificationRequired: {
      type: Boolean,
      default: false,
    },
    emailTemplates: {
      type: [emailTemplateSchema],
      default: [],
    },
    quotaResetAt: {
      type: Date,
      default: null,
      index: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AccountAdmin',
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('SystemSetting', systemSettingSchema, 'SystemSetting');
