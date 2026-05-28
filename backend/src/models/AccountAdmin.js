const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const ADMIN_ROLES = [
  'super_admin',
  'content_manager',
  'user_manager',
  'finance_manager',
  'ai_engineer',
  'analyst',
];

const accountAdminSchema = new mongoose.Schema(
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
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
      minlength: 8,
    },
    adminRole: {
      type: String,
      enum: ADMIN_ROLES,
      default: 'analyst',
    },
    status: {
      type: String,
      enum: ['active', 'locked'],
      default: 'active',
      index: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    lastLoginAt: {
      type: Date,
      default: null,
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

accountAdminSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  return next();
});

accountAdminSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

accountAdminSchema.statics.adminRoles = ADMIN_ROLES;

module.exports = mongoose.model('AccountAdmin', accountAdminSchema, 'AccountAdmin');
