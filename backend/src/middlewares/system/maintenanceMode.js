const createError = require('../../utils/createError');
const systemSettingsService = require('../../services/systemSettingsService');

function isMaintenanceBypassed(path) {
  return path === '/api/health'
    || path.startsWith('/api/system')
    || path.startsWith('/api/auth/admin')
    || path.startsWith('/api/admin');
}

async function maintenanceMode(req, res, next) {
  if (isMaintenanceBypassed(req.path)) {
    return next();
  }

  try {
    const settings = await systemSettingsService.getSystemSettings();
    if (!settings.maintenanceMode) {
      return next();
    }

    return next(createError(503, settings.maintenanceMessage || 'System is under maintenance', null, {
      maintenanceMode: true,
    }));
  } catch (error) {
    return next(error);
  }
}

module.exports = maintenanceMode;
