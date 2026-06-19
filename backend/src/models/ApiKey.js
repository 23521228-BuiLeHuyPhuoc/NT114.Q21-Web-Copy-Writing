const mongoose = require('mongoose');

const API_KEY_PERMISSIONS = ['generate', 'templates', 'history', 'fine-tune'];

const apiKeySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AccountUser',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    keyHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    keyPrefix: {
      type: String,
      required: true,
      trim: true,
      maxlength: 24,
    },
    keySuffix: {
      type: String,
      required: true,
      trim: true,
      maxlength: 12,
    },
    permissions: {
      type: [String],
      enum: API_KEY_PERMISSIONS,
      default: ['generate'],
    },
    status: {
      type: String,
      enum: ['active', 'revoked'],
      default: 'active',
      index: true,
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
    calls: {
      type: Number,
      min: 0,
      default: 0,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

apiKeySchema.index({ userId: 1, createdAt: -1 });
apiKeySchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('ApiKey', apiKeySchema, 'ApiKey');
module.exports.permissions = API_KEY_PERMISSIONS;
