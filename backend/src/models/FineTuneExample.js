const mongoose = require('mongoose');

const fineTuneExampleSchema = new mongoose.Schema(
  {
    datasetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FineTuneDataset',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AccountUser',
      required: true,
      index: true,
    },
    inputText: {
      type: String,
      required: true,
      trim: true,
      maxlength: 8000,
    },
    outputText: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20000,
    },
    industry: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 80,
      default: 'general',
      index: true,
    },
    tone: {
      type: String,
      trim: true,
      maxlength: 80,
      default: '',
    },
    qualityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    isValid: {
      type: Boolean,
      default: false,
      index: true,
    },
    validationErrors: {
      type: [String],
      default: [],
    },
    sourceContentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Content',
      default: null,
      index: true,
    },
  },
  { timestamps: true },
);

fineTuneExampleSchema.index({ datasetId: 1, createdAt: -1 });
fineTuneExampleSchema.index({ datasetId: 1, isValid: 1 });
fineTuneExampleSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('FineTuneExample', fineTuneExampleSchema, 'FineTuneExample');
