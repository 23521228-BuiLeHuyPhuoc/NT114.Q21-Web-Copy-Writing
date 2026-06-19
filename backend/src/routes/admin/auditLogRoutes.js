const express = require('express');

const auditLogController = require('../../controllers/admin/auditLogController');
const { protect } = require('../../middlewares/auth/authMiddleware');
const validate = require('../../middlewares/validation/validate');
const { createAuditLogSchema, listAuditLogsSchema } = require('../../validations/auditLogValidation');

const router = express.Router();

router.use(protect('admin'));

router.get('/', validate(listAuditLogsSchema, 'query'), auditLogController.listAuditLogs);
router.post('/', validate(createAuditLogSchema), auditLogController.createAuditLog);

module.exports = router;
