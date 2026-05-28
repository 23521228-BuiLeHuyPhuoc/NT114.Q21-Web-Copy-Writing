const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
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
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    industry: {
      type: String,
      trim: true,
      maxlength: 120,
      default: 'General',
      index: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    color: {
      type: String,
      trim: true,
      maxlength: 80,
      default: 'from-green-500 to-emerald-600',
    },
  },
  { timestamps: true },
);

projectSchema.index({ userId: 1, createdAt: -1 });
projectSchema.index({ userId: 1, isArchived: 1 });

module.exports = mongoose.model('Project', projectSchema, 'Project');
