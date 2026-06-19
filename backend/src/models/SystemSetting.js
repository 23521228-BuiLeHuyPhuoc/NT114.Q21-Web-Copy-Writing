const mongoose = require('mongoose');

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
      default: 'support@copypro.vn',
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
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AccountAdmin',
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('SystemSetting', systemSettingSchema, 'SystemSetting');
