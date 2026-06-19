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

module.exports = {
  getSettings,
  updateSettings,
};
