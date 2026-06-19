const apiKeyService = require('../../services/apiKeyService');
const asyncHandler = require('../../utils/asyncHandler');

const listKeys = asyncHandler(async (req, res) => {
  const data = await apiKeyService.listKeys(req.user._id);

  return res.status(200).json({
    success: true,
    message: 'OK',
    data,
  });
});

const createKey = asyncHandler(async (req, res) => {
  const item = await apiKeyService.createKey(req.user._id, req.body);

  return res.status(201).json({
    success: true,
    message: 'API key created',
    data: { item },
  });
});

const revokeKey = asyncHandler(async (req, res) => {
  const item = await apiKeyService.revokeKey(req.user._id, req.params.id);

  return res.status(200).json({
    success: true,
    message: 'API key revoked',
    data: { item },
  });
});

const listLogs = asyncHandler(async (req, res) => {
  const data = await apiKeyService.listLogs(req.user._id, req.query);

  return res.status(200).json({
    success: true,
    message: 'OK',
    data,
  });
});

module.exports = {
  listKeys,
  createKey,
  revokeKey,
  listLogs,
};
