const auditLogService = require('../../services/auditLogService');
const systemSettingsService = require('../../services/systemSettingsService');
const asyncHandler = require('../../utils/asyncHandler');

const getSettings = asyncHandler(async (req, res) => {
  const settings = await systemSettingsService.getSystemSettings();

  return res.status(200).json({
    success: true,
    message: 'OK',
    data: { settings },
  });
});

const getEnvSettings = asyncHandler(async (req, res) => {
  const envSettings = await systemSettingsService.getEnvSettings();

  return res.status(200).json({
    success: true,
    message: 'OK',
    data: { envSettings },
  });
});

const updateEnvSettings = asyncHandler(async (req, res) => {
  const envSettings = await systemSettingsService.updateEnvSettings(req.body);

  await auditLogService.createAdminAuditLog(req, {
    action: 'admin.settings.env.update',
    targetType: 'system_settings',
    targetId: 'env',
    level: 'warning',
    metadata: {
      details: 'Updated runtime .env settings',
      keys: Object.keys(req.body.values || req.body || {}),
    },
  });

  return res.status(200).json({
    success: true,
    message: 'Environment settings updated',
    data: { envSettings },
  });
});

const updateSettings = asyncHandler(async (req, res) => {
  const settings = await systemSettingsService.updateSystemSettings(req.body, req.auth.account._id);

  await auditLogService.createAdminAuditLog(req, {
    action: 'admin.settings.update',
    targetType: 'system_settings',
    targetId: 'default',
    level: settings.maintenanceMode ? 'warning' : 'info',
    metadata: {
      details: 'Updated system settings',
      maintenanceMode: settings.maintenanceMode,
      registrationEnabled: settings.registrationEnabled,
      emailVerificationRequired: settings.emailVerificationRequired,
    },
  });

  return res.status(200).json({
    success: true,
    message: 'Settings updated',
    data: { settings },
  });
});

const resetQuotas = asyncHandler(async (req, res) => {
  const settings = await systemSettingsService.resetAllUserQuotas(req.auth.account._id);

  await auditLogService.createAdminAuditLog(req, {
    action: 'admin.settings.reset_quotas',
    targetType: 'system_settings',
    targetId: 'default',
    level: 'warning',
    metadata: {
      details: 'Reset all user quota usage counters',
      quotaResetAt: settings.quotaResetAt,
    },
  });

  return res.status(200).json({
    success: true,
    message: 'User quotas reset',
    data: { settings },
  });
});

module.exports = {
  getEnvSettings,
  getSettings,
  resetQuotas,
  updateEnvSettings,
  updateSettings,
};
