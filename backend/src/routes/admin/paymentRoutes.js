const express = require('express');

const paymentController = require('../../controllers/admin/paymentController');
const { protect } = require('../../middlewares/auth/authMiddleware');
const validate = require('../../middlewares/validation/validate');
const {
  listPaymentsSchema,
  paramsWithPaymentLookupId,
} = require('../../validations/billingValidation');

const router = express.Router();

router.use(protect('admin'));

router.get('/', validate(listPaymentsSchema, 'query'), paymentController.listPayments);
router.get('/revenue', paymentController.getRevenue);
router.patch('/:id/confirm', validate(paramsWithPaymentLookupId, 'params'), paymentController.confirmPayment);

module.exports = router;
