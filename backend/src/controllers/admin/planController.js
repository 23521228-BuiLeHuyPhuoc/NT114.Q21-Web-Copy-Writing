const billingService = require('../../services/billingService');
const auditLogService = require('../../services/auditLogService');
const asyncHandler = require('../../utils/asyncHandler');

async function logPlanAction(req, action, plan, level = 'info') {
  await auditLogService.createAdminAuditLog(req, {
    action,
    targetType: 'plan',
    targetId: plan?.id || req.params.id,
    level,
    metadata: {
      details: `${action} ${plan?.name || req.params.id}`,
      plan: plan?.name,
      slug: plan?.slug,
    },
  });
}

const listPlans = asyncHandler(async (req, res) => {
  const items = await billingService.listPlans({ activeOnly: false });

  return res.status(200).json({
    success: true,
    message: 'OK',
    data: { items },
  });
});

const listTrash = asyncHandler(async (req, res) => {
  const items = await billingService.listPlans({ activeOnly: false, deleted: true });

  return res.status(200).json({
    success: true,
    message: 'OK',
    data: { items },
  });
});

const createPlan = asyncHandler(async (req, res) => {
  const plan = await billingService.createPlan(req.body);
  await logPlanAction(req, 'admin.plan.created', plan);

  return res.status(201).json({
    success: true,
    message: 'Plan created',
    data: { plan },
  });
});

const updatePlan = asyncHandler(async (req, res) => {
  const plan = await billingService.updatePlan(req.params.id, req.body);
  await logPlanAction(req, 'admin.plan.updated', plan);

  return res.status(200).json({
    success: true,
    message: 'Plan updated',
    data: { plan },
  });
});

const softDeletePlan = asyncHandler(async (req, res) => {
  const plan = await billingService.softDeletePlan(req.params.id);
  await logPlanAction(req, 'admin.plan.deleted', plan, 'warning');

  return res.status(200).json({
    success: true,
    message: 'Plan moved to trash',
    data: { plan },
  });
});

const restorePlan = asyncHandler(async (req, res) => {
  const plan = await billingService.restorePlan(req.params.id);
  await logPlanAction(req, 'admin.plan.restored', plan);

  return res.status(200).json({
    success: true,
    message: 'Plan restored',
    data: { plan },
  });
});

const permanentDeletePlan = asyncHandler(async (req, res) => {
  const targetId = req.params.id;
  await billingService.permanentDeletePlan(targetId);
  await auditLogService.createAdminAuditLog(req, {
    action: 'admin.plan.permanent_delete',
    targetType: 'plan',
    targetId,
    level: 'error',
    metadata: { details: `Permanently deleted plan ${targetId}` },
  });

  return res.status(200).json({
    success: true,
    message: 'Plan permanently deleted',
  });
});

module.exports = {
  listPlans,
  listTrash,
  createPlan,
  updatePlan,
  softDeletePlan,
  restorePlan,
  permanentDeletePlan,
};
