const express = require('express');

const systemSettingsController = require('../../controllers/admin/systemSettingsController');
const { protect } = require('../../middlewares/auth/authMiddleware');
const validate = require('../../middlewares/validation/validate');
const { systemSettingsSchema } = require('../../validations/systemSettingsValidation');

const router = express.Router();

router.use(protect('admin'));

router.get('/system', systemSettingsController.getSettings);
router.patch('/system', validate(systemSettingsSchema), systemSettingsController.updateSettings);

module.exports = router;
