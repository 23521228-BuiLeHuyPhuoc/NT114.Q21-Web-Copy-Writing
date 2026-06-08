const billingService = require('../../services/billingService');
const asyncHandler = require('../../utils/asyncHandler');

const listPayments = asyncHandler(async (req, res) => {
  const items = await billingService.listPayments(req.query);

  return res.status(200).json({
    success: true,
    message: 'OK',
    data: { items },
  });
});

const getRevenue = asyncHandler(async (req, res) => {
  const [items, stats] = await Promise.all([
    billingService.getRevenueData(),
    billingService.getPaymentStats(),
  ]);

  return res.status(200).json({
    success: true,
    message: 'OK',
    data: { items, stats },
  });
});

module.exports = {
  listPayments,
  getRevenue,
};
