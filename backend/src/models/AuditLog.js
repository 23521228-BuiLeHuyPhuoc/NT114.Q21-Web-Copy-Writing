const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },
    actorType: {
      type: String,
      enum: ['user', 'admin', 'system'],
      default: 'system',
      index: true,
    },
    actorEmail: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 160,
      default: '',
    },
    actorRole: {
      type: String,
      trim: true,
      maxlength: 80,
      default: '',
    },
    action: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
      index: true,
    },
    targetType: {
      type: String,
      trim: true,
      maxlength: 80,
      default: '',
      index: true,
    },
    targetId: {
      type: String,
      trim: true,
      maxlength: 200,
      default: '',
      index: true,
    },
    level: {
      type: String,
      enum: ['info', 'warning', 'error'],
      default: 'info',
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ip: {
      type: String,
      trim: true,
      maxlength: 80,
      default: '',
    },
  },
  { timestamps: true },
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ actorEmail: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema, 'AuditLog');
