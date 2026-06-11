const mongoose = require('mongoose');

const usageLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AccountUser',
      required: true,
      index: true,
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Content',
      required: true,
      index: true,
    },
    model: {
      type: String,
      required: true,
      trim: true,
      maxlength: 600,
    },
    promptTokens: {
      type: Number,
      min: 0,
      default: 0,
    },
    completionTokens: {
      type: Number,
      min: 0,
      default: 0,
    },
    totalTokens: {
      type: Number,
      min: 0,
      default: 0,
    },
    action: {
      type: String,
      enum: ['generate'],
      default: 'generate',
      index: true,
    },
    status: {
      type: String,
      enum: ['success', 'fallback'],
      default: 'fallback',
      index: true,
    },
  },
  { timestamps: true },
);

usageLogSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('UsageLog', usageLogSchema, 'UsageLog');
