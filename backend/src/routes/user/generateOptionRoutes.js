const express = require('express');

const generateOptionController = require('../../controllers/user/generateOptionController');
const { protect } = require('../../middlewares/auth/authMiddleware');

const router = express.Router();

router.use(protect('user'));

router.get('/', generateOptionController.listGenerateOptions);

module.exports = router;
