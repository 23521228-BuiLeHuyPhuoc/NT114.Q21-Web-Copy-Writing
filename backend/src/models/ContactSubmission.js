const mongoose = require('mongoose');

const contactSubmissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 160,
      index: true,
    },
    company: {
      type: String,
      trim: true,
      maxlength: 160,
      default: '',
    },
    topic: {
      type: String,
      enum: ['product', 'support', 'partner', 'business', 'billing', 'other'],
      default: 'other',
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 4000,
    },
    status: {
      type: String,
      enum: ['new', 'in_progress', 'resolved', 'spam', 'archived'],
      default: 'new',
      index: true,
    },
    adminNote: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
    handledByAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AccountAdmin',
      default: null,
      index: true,
    },
    handledAt: {
      type: Date,
      default: null,
    },
    ip: {
      type: String,
      trim: true,
      maxlength: 80,
      default: '',
    },
    userAgent: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
  },
  { timestamps: true },
);

contactSubmissionSchema.index({ createdAt: -1 });
contactSubmissionSchema.index({ status: 1, createdAt: -1 });
contactSubmissionSchema.index({ topic: 1, createdAt: -1 });

module.exports = mongoose.model('ContactSubmission', contactSubmissionSchema, 'ContactSubmission');
