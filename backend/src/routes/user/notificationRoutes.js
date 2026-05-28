const express = require('express');

const notificationController = require('../../controllers/user/notificationController');
const { protect } = require('../../middlewares/auth/authMiddleware');
const validate = require('../../middlewares/validation/validate');
const {
  listNotificationsSchema,
  paramsWithId,
} = require('../../validations/notificationValidation');

const router = express.Router();

router.use(protect('user'));

router.get('/', validate(listNotificationsSchema, 'query'), notificationController.listNotifications);
router.patch('/read-all', notificationController.markAllNotificationsRead);
router.patch('/:id/read', validate(paramsWithId, 'params'), notificationController.markNotificationRead);

module.exports = router;
