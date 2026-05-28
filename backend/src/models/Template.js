const mongoose = require('mongoose');

const templateVariableSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    label: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    required: {
      type: Boolean,
      default: false,
    },
    defaultValue: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
  },
  { _id: false },
);

const templateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 140,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    category: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 80,
      index: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
      index: true,
    },
    systemPrompt: {
      type: String,
      required: true,
      trim: true,
      maxlength: 6000,
    },
    variables: {
      type: [templateVariableSchema],
      default: [],
    },
    isSystem: {
      type: Boolean,
      default: false,
      index: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AccountUser',
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'archived'],
      default: 'active',
      index: true,
    },
    usageCount: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true },
);

templateSchema.index({ status: 1, isSystem: 1, type: 1, category: 1 });
templateSchema.index({ authorId: 1, createdAt: -1 });

module.exports = mongoose.model('Template', templateSchema, 'Template');
