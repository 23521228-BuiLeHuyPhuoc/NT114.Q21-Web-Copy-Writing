const mongoose = require('mongoose');

const fineTunedModelSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FineTuneJob',
      required: true,
      index: true,
    },
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
    alias: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 140,
      index: true,
    },
    providerModelId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180,
    },
    baseModel: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    industry: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 80,
      default: 'general',
      index: true,
    },
    version: {
      type: Number,
      min: 1,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: false,
      index: true,
    },
    isDeprecated: {
      type: Boolean,
      default: false,
      index: true,
    },
    performance: {
      accuracy: { type: Number, min: 0, max: 100, default: 0 },
      loss: { type: Number, min: 0, default: 0 },
      sampleCount: { type: Number, min: 0, default: 0 },
    },
    deployedAt: {
      type: Date,
      default: null,
    },
    deactivatedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

fineTunedModelSchema.index({ userId: 1, createdAt: -1 });
fineTunedModelSchema.index({ userId: 1, industry: 1, isActive: 1 });
fineTunedModelSchema.index({ userId: 1, alias: 1, version: 1 }, { unique: true });

module.exports = mongoose.model('FineTunedModel', fineTunedModelSchema, 'FineTunedModel');
