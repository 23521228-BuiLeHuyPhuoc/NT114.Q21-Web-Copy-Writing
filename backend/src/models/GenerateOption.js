const mongoose = require('mongoose');

const generateOptionSchema = new mongoose.Schema(
  {
    group: {
      type: String,
      enum: ['industry', 'copy_type', 'tone'],
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 80,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    icon: {
      type: String,
      trim: true,
      maxlength: 40,
      default: '',
    },
    color: {
      type: String,
      trim: true,
      maxlength: 80,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    order: {
      type: Number,
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

generateOptionSchema.index({ group: 1, slug: 1 }, { unique: true });
generateOptionSchema.index({ group: 1, isDeleted: 1, isActive: 1, order: 1 });

module.exports = mongoose.model('GenerateOption', generateOptionSchema, 'GenerateOption');
