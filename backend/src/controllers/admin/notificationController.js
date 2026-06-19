const auditLogService = require('../../services/auditLogService');
const notificationService = require('../../services/notificationService');
const asyncHandler = require('../../utils/asyncHandler');

const listNotifications = asyncHandler(async (req, res) => {
  const data = await notificationService.listAdminNotifications(req.user._id, req.query);

  return res.status(200).json({
    success: true,
    message: 'OK',
    data,
  });
});

const sendNotification = asyncHandler(async (req, res) => {
  const result = await notificationService.sendAdminNotification(req.user._id, req.body);

  await auditLogService.createAdminAuditLog(req, {
    action: 'admin.notification.sent',
    targetType: 'notification',
    level: 'info',
    metadata: {
      details: `Sent notification "${req.body.title}" to ${result.createdCount} recipient(s)`,
      title: req.body.title,
      recipientMode: req.body.recipientMode,
      recipientCount: result.createdCount,
      type: req.body.type || 'system',
    },
  });

  return res.status(201).json({
    success: true,
    message: 'Notification sent',
    data: result,
  });
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const item = await notificationService.markAdminNotificationRead(req.user._id, req.params.id);

  return res.status(200).json({
    success: true,
    message: 'Notification marked as read',
    data: { item },
  });
});

const markAllNotificationsRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllAdminNotificationsRead(req.user._id);

  return res.status(200).json({
    success: true,
    message: 'Notifications marked as read',
    data: result,
  });
});

module.exports = {
  listNotifications,
  sendNotification,
  markNotificationRead,
  markAllNotificationsRead,
};
