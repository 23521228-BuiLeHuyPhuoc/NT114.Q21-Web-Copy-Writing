const notificationService = require('../../services/notificationService');
const asyncHandler = require('../../utils/asyncHandler');

const listNotifications = asyncHandler(async (req, res) => {
  const data = await notificationService.listNotifications(req.user._id, req.query);

  return res.status(200).json({
    success: true,
    message: 'OK',
    data,
  });
});

const getPreferences = asyncHandler(async (req, res) => {
  const preferences = await notificationService.getNotificationPreferences(req.user._id);

  return res.status(200).json({
    success: true,
    message: 'OK',
    data: { preferences },
  });
});

const updatePreferences = asyncHandler(async (req, res) => {
  const preferences = await notificationService.updateNotificationPreferences(req.user._id, req.body);

  return res.status(200).json({
    success: true,
    message: 'Notification preferences updated',
    data: { preferences },
  });
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const item = await notificationService.markNotificationRead(req.user._id, req.params.id);

  return res.status(200).json({
    success: true,
    message: 'Notification marked as read',
    data: { item },
  });
});

const markAllNotificationsRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllNotificationsRead(req.user._id);

  return res.status(200).json({
    success: true,
    message: 'All notifications marked as read',
    data: result,
  });
});

module.exports = {
  listNotifications,
  getPreferences,
  updatePreferences,
  markNotificationRead,
  markAllNotificationsRead,
};
