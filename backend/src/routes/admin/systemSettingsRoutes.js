const express = require('express');

const systemSettingsController = require('../../controllers/admin/systemSettingsController');
const { protect } = require('../../middlewares/auth/authMiddleware');
const validate = require('../../middlewares/validation/validate');
const { envSettingsSchema, resetUserQuotaParams, systemSettingsSchema } = require('../../validations/systemSettingsValidation');

const router = express.Router();

router.use(protect('admin'));

router.get('/system', systemSettingsController.getSettings);
router.patch('/system', validate(systemSettingsSchema), systemSettingsController.updateSettings);
router.get('/env', systemSettingsController.getEnvSettings);
router.patch('/env', validate(envSettingsSchema), systemSettingsController.updateEnvSettings);
router.post('/reset-quotas', systemSettingsController.resetQuotas);
router.post('/reset-quotas/:userId', validate(resetUserQuotaParams, 'params'), systemSettingsController.resetUserQuota);

module.exports = router;
