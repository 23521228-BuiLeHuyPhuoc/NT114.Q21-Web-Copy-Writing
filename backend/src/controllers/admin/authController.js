const asyncHandler = require('../../utils/asyncHandler');
const authService = require('../../services/authService');
const auditLogService = require('../../services/auditLogService');
const cloudinaryService = require('../../services/cloudinaryService');
const { clearAuthCookie, setAuthCookie } = require('../../utils/authCookie');
const createError = require('../../utils/createError');

const login = asyncHandler(async (req, res) => {
  const rememberLogin = req.body.rememberLogin === true;
  const data = await authService.loginAdmin(req.body.email, req.body.password, { rememberLogin });
  setAuthCookie(res, data.token, { rememberLogin });

  return res.status(200).json({
    success: true,
    message: 'Login successful',
    data,
  });
});

const refreshSession = asyncHandler(async (req, res) => {
  const rememberLogin = req.body.rememberLogin === true;
  const data = authService.refreshAuthSession(req.auth.account, 'admin', { rememberLogin });
  setAuthCookie(res, data.token, { rememberLogin });

  await auditLogService.createAdminAuditLog(req, {
    action: 'admin.session.updated',
    targetType: 'account_admin',
    targetId: req.user._id,
    level: 'info',
    metadata: {
      details: 'Updated admin session preference',
      rememberLogin,
    },
  });

  return res.status(200).json({
    success: true,
    message: 'Session updated',
    data: {
      ...data,
      rememberLogin,
    },
  });
});

const me = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'OK',
    data: {
      user: authService.serializeAccount(req.auth.account, 'admin'),
    },
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateAdminProfile(req.user._id, req.body);
  await auditLogService.createAdminAuditLog(req, {
    action: 'admin.profile.updated',
    targetType: 'account_admin',
    targetId: user.id || req.user._id,
    level: 'info',
    metadata: {
      details: `Updated admin profile ${user.email}`,
      email: user.email,
      name: user.name,
    },
  });

  return res.status(200).json({
    success: true,
    message: 'Profile updated',
    data: { user },
  });
});

const updatePassword = asyncHandler(async (req, res) => {
  const user = await authService.updateAdminPassword(
    req.user._id,
    req.body.currentPassword,
    req.body.newPassword,
  );
  await auditLogService.createAdminAuditLog(req, {
    action: 'admin.password.updated',
    targetType: 'account_admin',
    targetId: user.id || req.user._id,
    level: 'warning',
    metadata: {
      details: `Updated admin password ${user.email}`,
      email: user.email,
    },
  });

  return res.status(200).json({
    success: true,
    message: 'Password updated',
    data: { user },
  });
});

const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw createError(400, 'Avatar file is required');
  }

  const uploaded = await cloudinaryService.uploadAdminAvatar(req.user._id, req.file);
  const user = await authService.updateAdminAvatar(req.user._id, uploaded.url);
  await auditLogService.createAdminAuditLog(req, {
    action: 'admin.avatar.updated',
    targetType: 'account_admin',
    targetId: user.id || req.user._id,
    level: 'info',
    metadata: {
      details: `Updated admin avatar ${user.email}`,
      email: user.email,
      avatar: uploaded.url,
    },
  });

  return res.status(200).json({
    success: true,
    message: 'Avatar updated',
    data: {
      user,
      avatar: uploaded.url,
    },
  });
});

const removeAvatar = asyncHandler(async (req, res) => {
  const user = await authService.removeAdminAvatar(req.user._id);
  await auditLogService.createAdminAuditLog(req, {
    action: 'admin.avatar.removed',
    targetType: 'account_admin',
    targetId: user.id || req.user._id,
    level: 'info',
    metadata: {
      details: `Removed admin avatar ${user.email}`,
      email: user.email,
    },
  });

  return res.status(200).json({
    success: true,
    message: 'Avatar removed',
    data: {
      user,
      avatar: '',
    },
  });
});

const logout = asyncHandler(async (req, res) => {
  clearAuthCookie(res);

  return res.status(200).json({
    success: true,
    message: 'Logged out',
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const data = await authService.forgotPassword('admin', req.body.email);

  return res.status(200).json({
    success: true,
    message: data.exists ? 'OTP has been sent' : 'If the email exists, an OTP has been sent',
    data: data.expiresInSeconds
      ? { expiresInSeconds: data.expiresInSeconds }
      : undefined,
  });
});

const verifyOtp = asyncHandler(async (req, res) => {
  await authService.verifyOtp('admin', req.body.email, req.body.otp);

  return res.status(200).json({
    success: true,
    message: 'OTP verified',
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword('admin', req.body.email, req.body.otp, req.body.newPassword);

  return res.status(200).json({
    success: true,
    message: 'Password reset successful',
  });
});

module.exports = {
  login,
  me,
  refreshSession,
  updateProfile,
  updatePassword,
  updateAvatar,
  removeAvatar,
  logout,
  forgotPassword,
  verifyOtp,
  resetPassword,
};
