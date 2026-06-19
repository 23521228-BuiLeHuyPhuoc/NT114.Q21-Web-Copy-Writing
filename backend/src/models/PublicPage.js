const mongoose = require('mongoose');

const publicPageSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 80,
      index: true,
    },
    type: {
      type: String,
      enum: ['page', 'blog', 'settings'],
      default: 'page',
      index: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 200,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
    seo: {
      metaTitle: { type: String, trim: true, maxlength: 200, default: '' },
      metaDescription: { type: String, trim: true, maxlength: 500, default: '' },
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  { timestamps: true },
);

publicPageSchema.index({ type: 1, sortOrder: 1, key: 1 });

module.exports = mongoose.model('PublicPage', publicPageSchema, 'PublicPage');
