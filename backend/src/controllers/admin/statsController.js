const adminDashboardService = require('../../services/adminDashboardService');
const asyncHandler = require('../../utils/asyncHandler');

const getStats = asyncHandler(async (req, res) => {
  const data = await adminDashboardService.getStats();

  return res.status(200).json({
    success: true,
    message: 'OK',
    data,
  });
});

module.exports = {
  getStats,
};
