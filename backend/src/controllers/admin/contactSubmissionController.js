const auditLogService = require('../../services/auditLogService');
const contactSubmissionService = require('../../services/contactSubmissionService');
const asyncHandler = require('../../utils/asyncHandler');

const listSubmissions = asyncHandler(async (req, res) => {
  const data = await contactSubmissionService.listSubmissions(req.query);

  return res.status(200).json({
    success: true,
    message: 'OK',
    data,
  });
});

const getSubmission = asyncHandler(async (req, res) => {
  const item = await contactSubmissionService.getSubmission(req.params.id);

  return res.status(200).json({
    success: true,
    message: 'OK',
    data: { item },
  });
});

const updateSubmission = asyncHandler(async (req, res) => {
  const item = await contactSubmissionService.updateSubmission(req.params.id, req.body, req.auth.account._id);

  await auditLogService.createAdminAuditLog(req, {
    action: 'admin.contact.updated',
    targetType: 'contact_submission',
    targetId: item.id,
    level: 'info',
    metadata: {
      details: `Updated contact submission from ${item.email}`,
      email: item.email,
      status: item.status,
      topic: item.topic,
    },
  });

  return res.status(200).json({
    success: true,
    message: 'Contact submission updated',
    data: { item },
  });
});

const deleteSubmission = asyncHandler(async (req, res) => {
  const item = await contactSubmissionService.deleteSubmission(req.params.id);

  await auditLogService.createAdminAuditLog(req, {
    action: 'admin.contact.deleted',
    targetType: 'contact_submission',
    targetId: item.id,
    level: 'warning',
    metadata: {
      details: `Deleted contact submission from ${item.email}`,
      email: item.email,
      status: item.status,
      topic: item.topic,
    },
  });

  return res.status(200).json({
    success: true,
    message: 'Contact submission deleted',
    data: { item },
  });
});

module.exports = {
  deleteSubmission,
  getSubmission,
  listSubmissions,
  updateSubmission,
};
