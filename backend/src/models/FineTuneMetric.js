const mongoose = require('mongoose');

const fineTuneMetricSchema = new mongoose.Schema(
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
    epoch: {
      type: Number,
      min: 0,
      default: 0,
    },
    trainLoss: {
      type: Number,
      min: 0,
      default: 0,
    },
    validationLoss: {
      type: Number,
      min: 0,
      default: 0,
    },
    accuracy: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    tokenUsage: {
      type: Number,
      min: 0,
      default: 0,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

fineTuneMetricSchema.index({ jobId: 1, epoch: 1 });
fineTuneMetricSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('FineTuneMetric', fineTuneMetricSchema, 'FineTuneMetric');
