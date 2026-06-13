const mongoose = require('mongoose');

const FINE_TUNE_STATUSES = [
  'pending',
  'queued',
  'running',
  'completed',
  'failed',
  'cancelled',
];

const fineTuneJobSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AccountUser',
      required: true,
      index: true,
    },
    datasetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FineTuneDataset',
      default: null,
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
    baseModel: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
      default: () => process.env.FINE_TUNE_BASE_MODELS?.split(',')[0]?.trim() || 'gemini-flash',
    },
    provider: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 80,
      default: 'mock',
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1200,
      default: '',
    },
    datasetUrl: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    status: {
      type: String,
      enum: FINE_TUNE_STATUSES,
      default: 'pending',
      index: true,
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    samples: {
      type: Number,
      min: 0,
      default: 0,
    },
    epochs: {
      type: Number,
      min: 1,
      max: 20,
      default: 5,
    },
    accuracy: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    loss: {
      type: Number,
      min: 0,
      default: 0,
    },
    estimatedCost: {
      type: Number,
      min: 0,
      default: 0,
    },
    actualCost: {
      type: Number,
      min: 0,
      default: 0,
    },
    errorMessage: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
    providerJobId: {
      type: String,
      trim: true,
      maxlength: 600,
      default: '',
    },
    tuningLocation: {
      type: String,
      trim: true,
      maxlength: 80,
      default: '',
    },
    tuningEndpoint: {
      type: String,
      trim: true,
      maxlength: 600,
      default: '',
    },
    fineTunedModelId: {
      type: String,
      trim: true,
      maxlength: 600,
      default: '',
    },
    tunedModelResourceId: {
      type: String,
      trim: true,
      maxlength: 600,
      default: '',
    },
    deploymentOperationId: {
      type: String,
      trim: true,
      maxlength: 700,
      default: '',
    },
    deploymentStatus: {
      type: String,
      trim: true,
      maxlength: 40,
      default: '',
      index: true,
    },
    deploymentErrorMessage: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
    deployedModelId: {
      type: String,
      trim: true,
      maxlength: 120,
      default: '',
    },
    startedAt: {
      type: Date,
      default: null,
    },
    finishedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

fineTuneJobSchema.index({ userId: 1, createdAt: -1 });
fineTuneJobSchema.index({ userId: 1, status: 1, createdAt: -1 });
fineTuneJobSchema.index({ userId: 1, industry: 1, createdAt: -1 });
fineTuneJobSchema.index({ userId: 1, datasetId: 1, createdAt: -1 });

module.exports = mongoose.model('FineTuneJob', fineTuneJobSchema, 'FineTuneJob');
module.exports.statuses = FINE_TUNE_STATUSES;
