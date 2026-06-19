const billingService = require('../../services/billingService');
const asyncHandler = require('../../utils/asyncHandler');

const listPlans = asyncHandler(async (req, res) => {
  const items = await billingService.listPlans({ activeOnly: true });

  return res.status(200).json({
    success: true,
    message: 'OK',
    data: { items },
  });
});

const me = asyncHandler(async (req, res) => {
  const billing = await billingService.getMyBilling(req.auth.account._id);

  return res.status(200).json({
    success: true,
    message: 'OK',
    data: billing,
  });
});

const checkout = asyncHandler(async (req, res) => {
  const result = await billingService.createCheckout(req.auth.account._id, req.body, req);

  return res.status(201).json({
    success: true,
    message: result.message,
    data: result,
  });
});

const vnpayReturn = asyncHandler(async (req, res) => {
  const result = await billingService.handleVnpayReturn(req.query);
  return res.redirect(billingService.buildPaymentRedirectUrl(result));
});

const vnpayIpn = asyncHandler(async (req, res) => {
  const { response } = await billingService.handleVnpayIpn(req.query);
  return res.status(200).json(response);
});

const zalopayReturn = asyncHandler(async (req, res) => {
  const result = await billingService.handleZalopayReturn(req.query);
  return res.redirect(billingService.buildPaymentRedirectUrl(result));
});

const zalopayCallback = asyncHandler(async (req, res) => {
  const { response } = await billingService.handleZalopayCallback(req.body);
  return res.status(200).json(response);
});

module.exports = {
  listPlans,
  me,
  checkout,
  vnpayReturn,
  vnpayIpn,
  zalopayReturn,
  zalopayCallback,
};
