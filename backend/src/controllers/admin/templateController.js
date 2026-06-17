const adminTemplateService = require('../../services/adminTemplateService');
const auditLogService = require('../../services/auditLogService');
const asyncHandler = require('../../utils/asyncHandler');

async function logTemplateAction(req, action, template, level = 'info') {
  await auditLogService.createAdminAuditLog(req, {
    action,
    targetType: 'template',
    targetId: template?.id || req.params.id,
    level,
    metadata: {
      details: `${action} ${template?.name || req.params.id}`,
      template: template?.name,
      slug: template?.slug,
      category: template?.category,
    },
  });
}

const listTemplates = asyncHandler(async (req, res) => {
  const items = await adminTemplateService.listTemplates(req.query);

  return res.status(200).json({
    success: true,
    message: 'OK',
    data: { items },
  });
});

const listTrash = asyncHandler(async (req, res) => {
  const items = await adminTemplateService.listTemplates(req.query, { archived: true });

  return res.status(200).json({
    success: true,
    message: 'OK',
    data: { items },
  });
});

const createTemplate = asyncHandler(async (req, res) => {
  const template = await adminTemplateService.createTemplate(req.body);
  await logTemplateAction(req, 'admin.template.created', template);

  return res.status(201).json({
    success: true,
    message: 'Template created',
    data: { template },
  });
});

const updateTemplate = asyncHandler(async (req, res) => {
  const template = await adminTemplateService.updateTemplate(req.params.id, req.body);
  await logTemplateAction(req, 'admin.template.updated', template);

  return res.status(200).json({
    success: true,
    message: 'Template updated',
    data: { template },
  });
});

const archiveTemplate = asyncHandler(async (req, res) => {
  const template = await adminTemplateService.archiveTemplate(req.params.id);
  await logTemplateAction(req, 'admin.template.deleted', template, 'warning');

  return res.status(200).json({
    success: true,
    message: 'Template moved to trash',
    data: { template },
  });
});

const restoreTemplate = asyncHandler(async (req, res) => {
  const template = await adminTemplateService.restoreTemplate(req.params.id);
  await logTemplateAction(req, 'admin.template.restored', template);

  return res.status(200).json({
    success: true,
    message: 'Template restored',
    data: { template },
  });
});

const permanentDeleteTemplate = asyncHandler(async (req, res) => {
  const targetId = req.params.id;
  await adminTemplateService.permanentDeleteTemplate(targetId);
  await auditLogService.createAdminAuditLog(req, {
    action: 'admin.template.permanent_delete',
    targetType: 'template',
    targetId,
    level: 'error',
    metadata: { details: `Permanently deleted template ${targetId}` },
  });

  return res.status(200).json({
    success: true,
    message: 'Template permanently deleted',
  });
});

module.exports = {
  listTemplates,
  listTrash,
  createTemplate,
  updateTemplate,
  archiveTemplate,
  restoreTemplate,
  permanentDeleteTemplate,
};
