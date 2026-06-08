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

module.exports = {
  listAuditLogs,
};
