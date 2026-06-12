const mongoose = require('mongoose');

const DATASET_STATUSES = ['draft', 'validated', 'submitted', 'archived'];
const DATASET_SOURCE_TYPES = ['manual', 'csv', 'excel', 'jsonl', 'content-history'];

const fineTuneDatasetSchema = new mongoose.Schema(
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
    industry: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 80,
      default: 'general',
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1200,
      default: '',
    },
    sourceType: {
      type: String,
      enum: DATASET_SOURCE_TYPES,
      default: 'manual',
      index: true,
    },
    status: {
      type: String,
      enum: DATASET_STATUSES,
      default: 'draft',
      index: true,
    },
    exampleCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    validExampleCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    qualityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    language: {
      type: String,
      trim: true,
      maxlength: 40,
      default: 'vi',
    },
    tags: {
      type: [String],
      default: [],
    },
    lastValidatedAt: {
      type: Date,
      default: null,
    },
    archivedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

fineTuneDatasetSchema.index({ userId: 1, createdAt: -1 });
fineTuneDatasetSchema.index({ userId: 1, status: 1, createdAt: -1 });
fineTuneDatasetSchema.index({ userId: 1, industry: 1, createdAt: -1 });

module.exports = mongoose.model('FineTuneDataset', fineTuneDatasetSchema, 'FineTuneDataset');
module.exports.statuses = DATASET_STATUSES;
module.exports.sourceTypes = DATASET_SOURCE_TYPES;
