const adminUserService = require('../../services/adminUserService');
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
  return res.status(201).json({
    success: true,
    message: 'Account created',
    data: { user },
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await adminUserService.updateUser(req.params.accountType, req.params.id, req.body);
  return res.status(200).json({
    success: true,
    message: 'Account updated',
    data: { user },
  });
});

const softDelete = asyncHandler(async (req, res) => {
  const user = await adminUserService.softDelete(req.params.accountType, req.params.id);
  return res.status(200).json({
    success: true,
    message: 'Account moved to trash',
    data: { user },
  });
});

const restore = asyncHandler(async (req, res) => {
  const user = await adminUserService.restore(req.params.accountType, req.params.id);
  return res.status(200).json({
    success: true,
    message: 'Account restored',
    data: { user },
  });
});

const permanentDelete = asyncHandler(async (req, res) => {
  await adminUserService.permanentDelete(req.params.accountType, req.params.id);
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
