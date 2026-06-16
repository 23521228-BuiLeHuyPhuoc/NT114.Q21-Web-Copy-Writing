const mongoose = require('mongoose');

function countWords(text) {
  return String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

const contentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AccountUser',
      required: true,
      index: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
      index: true,
    },
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    prompt: {
      type: String,
      required: true,
      trim: true,
      maxlength: 14000,
    },
    outputText: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60000,
    },
    type: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
      index: true,
    },
    tone: {
      type: String,
      trim: true,
      maxlength: 60,
      default: '',
    },
    language: {
      type: String,
      trim: true,
      maxlength: 40,
      default: 'vi',
    },
    modelUsed: {
      type: String,
      trim: true,
      maxlength: 600,
      default: 'fallback-mvp',
    },
    tags: {
      type: [String],
      default: [],
    },
    isFavorite: {
      type: Boolean,
      default: false,
      index: true,
    },
    isProjectCompleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    wordCount: {
      type: Number,
      min: 0,
      default: 0,
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

contentSchema.index({ userId: 1, createdAt: -1 });
contentSchema.index({ userId: 1, isDeleted: 1 });

contentSchema.pre('validate', function setWordCount(next) {
  if (this.isModified('outputText') || !this.wordCount) {
    this.wordCount = countWords(this.outputText);
  }
  next();
});

module.exports = mongoose.model('Content', contentSchema, 'Content');
