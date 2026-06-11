const mongoose = require('mongoose');

function countWords(text) {
  return String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

const matchSchema = new mongoose.Schema(
  {
    start: {
      type: Number,
      min: 0,
      default: 0,
    },
    end: {
      type: Number,
      min: 0,
      default: 0,
    },
    matchedText: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
    sourceText: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
    sourceUrl: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    sourceTitle: {
      type: String,
      trim: true,
      maxlength: 200,
      default: '',
    },
    sourceType: {
      type: String,
      enum: ['database', 'reference', 'web'],
      default: 'database',
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },
  { _id: false },
);

const sourceSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    sourceTitle: {
      type: String,
      trim: true,
      maxlength: 200,
      default: '',
    },
    sourceUrl: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    sourceType: {
      type: String,
      enum: ['database', 'reference', 'web'],
      default: 'database',
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Content',
      default: null,
    },
    similarity: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    snippet: {
      type: String,
      trim: true,
      maxlength: 600,
      default: '',
    },
    matchedWords: {
      type: Number,
      min: 0,
      default: 0,
    },
    totalWords: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { _id: false },
);

const plagiarismReportSchema = new mongoose.Schema(
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
      default: null,
      index: true,
    },
    checkText: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60000,
    },
    wordCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    similarityScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      index: true,
    },
    originalityScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['completed', 'failed', 'processing'],
      default: 'completed',
      index: true,
    },
    riskLevel: {
      type: String,
      enum: ['safe', 'review', 'high', 'critical'],
      default: 'safe',
      index: true,
    },
    matches: {
      type: [matchSchema],
      default: [],
    },
    sources: {
      type: [sourceSchema],
      default: [],
    },
    modelUsed: {
      type: String,
      trim: true,
      maxlength: 80,
      default: 'local-ngram-v1',
    },
    threshold: {
      type: Number,
      min: 0,
      max: 100,
      default: 35,
    },
    summary: {
      type: String,
      trim: true,
      maxlength: 600,
      default: '',
    },
  },
  { timestamps: true },
);

plagiarismReportSchema.index({ userId: 1, createdAt: -1 });

plagiarismReportSchema.pre('validate', function setWordCount(next) {
  if (this.isModified('checkText') || !this.wordCount) {
    this.wordCount = countWords(this.checkText);
  }
  next();
});

module.exports = mongoose.model('PlagiarismReport', plagiarismReportSchema, 'plagiarismReports');
