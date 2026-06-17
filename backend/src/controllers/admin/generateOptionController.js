const auditLogService = require('../../services/auditLogService');
const generateOptionService = require('../../services/generateOptionService');
const asyncHandler = require('../../utils/asyncHandler');

async function logOptionAction(req, action, option, level = 'info') {
  await auditLogService.createAdminAuditLog(req, {
    action,
    targetType: 'generate_option',
    targetId: option?.id || req.params.id,
    level,
    metadata: {
      details: `${action} ${option?.name || req.params.id}`,
      group: req.params.group,
      option: option?.name,
      slug: option?.slug,
    },
  });
}

const listOptions = asyncHandler(async (req, res) => {
  const items = await generateOptionService.listOptions(req.params.group);

  return res.status(200).json({
    success: true,
    message: 'OK',
    data: { items },
  });
});

const listTrash = asyncHandler(async (req, res) => {
  const items = await generateOptionService.listOptions(req.params.group, { deleted: true });

  return res.status(200).json({
    success: true,
    message: 'OK',
    data: { items },
  });
});

const createOption = asyncHandler(async (req, res) => {
  const option = await generateOptionService.createOption(req.params.group, req.body);
  await logOptionAction(req, 'admin.generate_option.created', option);

  return res.status(201).json({
    success: true,
    message: 'Generate option created',
    data: { option },
  });
});

const updateOption = asyncHandler(async (req, res) => {
  const option = await generateOptionService.updateOption(req.params.group, req.params.id, req.body);
  await logOptionAction(req, 'admin.generate_option.updated', option);

  return res.status(200).json({
    success: true,
    message: 'Generate option updated',
    data: { option },
  });
});

const softDeleteOption = asyncHandler(async (req, res) => {
  const option = await generateOptionService.softDeleteOption(req.params.group, req.params.id);
  await logOptionAction(req, 'admin.generate_option.deleted', option, 'warning');

  return res.status(200).json({
    success: true,
    message: 'Generate option moved to trash',
    data: { option },
  });
});

const restoreOption = asyncHandler(async (req, res) => {
  const option = await generateOptionService.restoreOption(req.params.group, req.params.id);
  await logOptionAction(req, 'admin.generate_option.restored', option);

  return res.status(200).json({
    success: true,
    message: 'Generate option restored',
    data: { option },
  });
});

const permanentDeleteOption = asyncHandler(async (req, res) => {
  const targetId = req.params.id;
  await generateOptionService.permanentDeleteOption(req.params.group, targetId);
  await auditLogService.createAdminAuditLog(req, {
    action: 'admin.generate_option.permanent_delete',
    targetType: 'generate_option',
    targetId,
    level: 'error',
    metadata: { details: `Permanently deleted generate option ${targetId}`, group: req.params.group },
  });

  return res.status(200).json({
    success: true,
    message: 'Generate option permanently deleted',
  });
});

module.exports = {
  listOptions,
  listTrash,
  createOption,
  updateOption,
  softDeleteOption,
  restoreOption,
  permanentDeleteOption,
};
