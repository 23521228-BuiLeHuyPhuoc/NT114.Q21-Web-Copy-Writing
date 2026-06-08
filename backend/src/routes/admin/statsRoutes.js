const express = require('express');

const statsController = require('../../controllers/admin/statsController');
const { protect } = require('../../middlewares/auth/authMiddleware');

const router = express.Router();

router.use(protect('admin'));

router.get('/', statsController.getStats);

module.exports = router;
