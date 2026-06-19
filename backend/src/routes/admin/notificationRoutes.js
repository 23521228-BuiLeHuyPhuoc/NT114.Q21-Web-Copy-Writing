const express = require('express');

const notificationController = require('../../controllers/admin/notificationController');
const { protect } = require('../../middlewares/auth/authMiddleware');
const validate = require('../../middlewares/validation/validate');
const {
  adminListNotificationsSchema,
  paramsWithId,
  sendAdminNotificationSchema,
} = require('../../validations/notificationValidation');

const router = express.Router();

router.use(protect('admin'));

router.get('/', validate(adminListNotificationsSchema, 'query'), notificationController.listNotifications);
router.post('/send', validate(sendAdminNotificationSchema), notificationController.sendNotification);
router.patch('/read-all', notificationController.markAllNotificationsRead);
router.patch('/:id/read', validate(paramsWithId, 'params'), notificationController.markNotificationRead);

module.exports = router;
