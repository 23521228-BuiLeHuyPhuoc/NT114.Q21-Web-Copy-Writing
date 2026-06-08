const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    invoiceNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 80,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AccountUser',
      required: true,
      index: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      required: true,
      index: true,
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      default: null,
      index: true,
    },
    amount: {
      type: Number,
      min: 0,
      required: true,
    },
    currency: {
      type: String,
      uppercase: true,
      trim: true,
      maxlength: 8,
      default: 'VND',
    },
    method: {
      type: String,
      enum: ['cash', 'bank', 'momo', 'zalo', 'vnpay', 'visa', 'manual'],
      default: 'manual',
      index: true,
    },
    provider: {
      type: String,
      enum: ['mock', 'manual', 'stripe', 'vnpay', 'zalopay'],
      default: 'mock',
    },
    status: {
      type: String,
      enum: ['success', 'pending', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    paidAt: {
      type: Date,
      default: null,
      index: true,
    },
    periodStart: {
      type: Date,
      default: null,
    },
    periodEnd: {
      type: Date,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ planId: 1, status: 1 });
paymentSchema.index({ status: 1, paidAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema, 'Payment');
