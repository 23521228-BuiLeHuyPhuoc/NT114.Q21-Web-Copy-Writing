const express = require('express');

const billingController = require('../../controllers/user/billingController');
const { protect } = require('../../middlewares/auth/authMiddleware');
const validate = require('../../middlewares/validation/validate');
const { checkoutSchema } = require('../../validations/billingValidation');

const router = express.Router();

router.get('/plans', billingController.listPlans);
router.get('/vnpay/return', billingController.vnpayReturn);
router.get('/vnpay/ipn', billingController.vnpayIpn);
router.get('/zalopay/return', billingController.zalopayReturn);
router.post('/zalopay/callback', express.json({ limit: '1mb' }), billingController.zalopayCallback);

router.use(protect('user'));
router.get('/me', billingController.me);
router.post('/checkout', validate(checkoutSchema), billingController.checkout);

module.exports = router;
