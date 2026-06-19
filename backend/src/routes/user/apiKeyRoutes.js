const express = require('express');

const apiKeyController = require('../../controllers/user/apiKeyController');
const { protect } = require('../../middlewares/auth/authMiddleware');
const validate = require('../../middlewares/validation/validate');
const {
  createApiKeySchema,
  listApiKeyLogsSchema,
  paramsWithId,
} = require('../../validations/apiKeyValidation');

const router = express.Router();

router.use(protect('user'));

router.get('/', apiKeyController.listKeys);
router.post('/', validate(createApiKeySchema), apiKeyController.createKey);
router.get('/logs', validate(listApiKeyLogsSchema, 'query'), apiKeyController.listLogs);
router.delete('/:id', validate(paramsWithId, 'params'), apiKeyController.revokeKey);

module.exports = router;
