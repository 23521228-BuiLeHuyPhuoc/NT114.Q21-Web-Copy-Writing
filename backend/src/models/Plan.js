const mongoose = require('mongoose');

const planLimitsSchema = new mongoose.Schema(
  {
    copyMonthly: { type: Number, default: 0 },
    apiCallsMonthly: { type: Number, default: 0 },
    apiCallsFiveHours: { type: Number, default: 0 },
    apiCallsWeekly: { type: Number, default: 0 },
    fineTuneModels: { type: Number, default: 0 },
    plagiarismChecks: { type: Number, default: 0 },
    seats: { type: Number, default: 1 },
    historyDays: { type: Number, default: 7 },
  },
  { _id: false },
);

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 80,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    priceMonthly: {
      type: Number,
      min: -1,
      default: 0,
    },
    priceYearly: {
      type: Number,
      min: -1,
      default: 0,
    },
    currency: {
      type: String,
      uppercase: true,
      trim: true,
      maxlength: 8,
      default: 'VND',
    },
    limits: {
      type: planLimitsSchema,
      default: () => ({}),
    },
    features: {
      type: [String],
      default: [],
    },
    excludedFeatures: {
      type: [String],
      default: [],
    },
    allowedModels: {
      type: [String],
      default: [],
    },
    isPopular: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

planSchema.index({ isDeleted: 1, isActive: 1, sortOrder: 1 });

module.exports = mongoose.model('Plan', planSchema, 'Plan');
