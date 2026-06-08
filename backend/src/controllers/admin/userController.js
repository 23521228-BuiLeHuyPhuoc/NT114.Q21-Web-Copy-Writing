const adminUserService = require('../../services/adminUserService');
const auditLogService = require('../../services/auditLogService');
const asyncHandler = require('../../utils/asyncHandler');

const listUsers = asyncHandler(async (req, res) => {
  const items = await adminUserService.listUsers();
  return res.status(200).json({
    success: true,
    message: 'OK',
    data: { items },
  });
});

const listTrash = asyncHandler(async (req, res) => {
  const items = await adminUserService.listUsers({ deleted: true });
  return res.status(200).json({
    success: true,
    message: 'OK',
    data: { items },
  });
});

const createUser = asyncHandler(async (req, res) => {
  const user = await adminUserService.createUser(req.body);
  await auditLogService.createAdminAuditLog(req, {
    action: 'admin.account.created',
    targetType: user.role === 'admin' ? 'account_admin' : 'account_user',
    targetId: user.id,
    level: 'info',
    metadata: {
      details: `Created ${user.role} account ${user.email}`,
      email: user.email,
      role: user.role,
    },
  });

  return res.status(201).json({
    success: true,
    message: 'Account created',
    data: { user },
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await adminUserService.updateUser(req.params.accountType, req.params.id, req.body);
  await auditLogService.createAdminAuditLog(req, {
    action: 'admin.account.updated',
    targetType: req.params.accountType === 'admin' ? 'account_admin' : 'account_user',
    targetId: user.id,
    level: 'info',
    metadata: {
      details: `Updated ${user.role} account ${user.email}`,
      email: user.email,
      role: user.role,
    },
  });

  return res.status(200).json({
    success: true,
    message: 'Account updated',
    data: { user },
  });
});

const softDelete = asyncHandler(async (req, res) => {
  const user = await adminUserService.softDelete(req.params.accountType, req.params.id);
  await auditLogService.createAdminAuditLog(req, {
    action: 'admin.account.deleted',
    targetType: req.params.accountType === 'admin' ? 'account_admin' : 'account_user',
    targetId: user.id,
    level: 'warning',
    metadata: {
      details: `Moved account ${user.email} to trash`,
      email: user.email,
      role: user.role,
    },
  });

  return res.status(200).json({
    success: true,
    message: 'Account moved to trash',
    data: { user },
  });
});

const restore = asyncHandler(async (req, res) => {
  const user = await adminUserService.restore(req.params.accountType, req.params.id);
  await auditLogService.createAdminAuditLog(req, {
    action: 'admin.account.restored',
    targetType: req.params.accountType === 'admin' ? 'account_admin' : 'account_user',
    targetId: user.id,
    level: 'info',
    metadata: {
      details: `Restored account ${user.email}`,
      email: user.email,
      role: user.role,
    },
  });

  return res.status(200).json({
    success: true,
    message: 'Account restored',
    data: { user },
  });
});

const permanentDelete = asyncHandler(async (req, res) => {
  const targetId = req.params.id;
  await adminUserService.permanentDelete(req.params.accountType, req.params.id);
  await auditLogService.createAdminAuditLog(req, {
    action: 'admin.account.permanent_delete',
    targetType: req.params.accountType === 'admin' ? 'account_admin' : 'account_user',
    targetId,
    level: 'error',
    metadata: {
      details: `Permanently deleted ${req.params.accountType} account`,
      accountType: req.params.accountType,
    },
  });

  return res.status(200).json({
    success: true,
    message: 'Account permanently deleted',
  });
});

module.exports = {
  listUsers,
  listTrash,
  createUser,
  updateUser,
  softDelete,
  restore,
  permanentDelete,
};
