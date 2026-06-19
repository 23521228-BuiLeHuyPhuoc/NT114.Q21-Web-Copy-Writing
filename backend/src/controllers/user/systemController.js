const systemSettingsService = require('../../services/systemSettingsService');
const asyncHandler = require('../../utils/asyncHandler');

const getStatus = asyncHandler(async (req, res) => {
  const settings = await systemSettingsService.getSystemSettings();

  return res.status(200).json({
    success: true,
    message: 'OK',
    data: {
      status: systemSettingsService.getPublicSystemStatus(settings),
    },
  });
});

module.exports = {
  getStatus,
};
