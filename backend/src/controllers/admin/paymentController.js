const billingService = require('../../services/billingService');
const auditLogService = require('../../services/auditLogService');
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

const confirmPayment = asyncHandler(async (req, res) => {
  const payment = await billingService.confirmPaymentSuccess(req.params.id, req.auth.account._id);
  await auditLogService.createAdminAuditLog(req, {
    action: 'admin.payment.confirmed',
    targetType: 'payment',
    targetId: payment.paymentId || payment._id || req.params.id,
    level: 'warning',
    metadata: {
      details: `Confirmed payment ${payment.invoiceNo || req.params.id}`,
      invoiceNo: payment.invoiceNo,
      email: payment.email,
      plan: payment.plan,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
    },
  });

  return res.status(200).json({
    success: true,
    message: 'Đã xác nhận thanh toán và kích hoạt gói',
    data: { payment },
  });
});

module.exports = {
  listPayments,
  getRevenue,
  confirmPayment,
};
