const auditLogService = require('../../services/auditLogService');
const asyncHandler = require('../../utils/asyncHandler');

const listAuditLogs = asyncHandler(async (req, res) => {
  const data = await auditLogService.listAuditLogs(req.query);

  return res.status(200).json({
    success: true,
    message: 'OK',
    data,
  });
});

const createAuditLog = asyncHandler(async (req, res) => {
  const item = await auditLogService.createAdminAuditLog(req, {
    action: req.body.action,
    targetType: req.body.targetType || '',
    targetId: req.body.targetId || '',
    level: req.body.level || 'info',
    metadata: req.body.metadata || {},
  });

  return res.status(201).json({
    success: true,
    message: 'Audit log created',
    data: { item },
  });
});

module.exports = {
  listAuditLogs,
  createAuditLog,
};
