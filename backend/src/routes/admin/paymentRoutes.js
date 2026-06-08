const express = require('express');

const paymentController = require('../../controllers/admin/paymentController');
const { protect } = require('../../middlewares/auth/authMiddleware');

const router = express.Router();

router.use(protect('admin'));

router.get('/', paymentController.listPayments);
router.get('/revenue', paymentController.getRevenue);

module.exports = router;
