const Notification = require('../models/Notification');
const createError = require('../utils/createError');

function toId(value) {
  return value ? value.toString() : null;
}

function normalizePage(query = {}) {
  return Math.max(1, Number(query.page || 1));
}

function normalizeLimit(query = {}) {
  return Math.min(50, Math.max(1, Number(query.limit || 10)));
}

function serializeNotification(notification) {
  return {
    id: notification._id.toString(),
    _id: notification._id.toString(),
    userId: toId(notification.userId),
    title: notification.title,
    message: notification.message,
    type: notification.type,
    isRead: Boolean(notification.isRead),
    readAt: notification.readAt,
    actionUrl: notification.actionUrl || '',
    createdAt: notification.createdAt,
    updatedAt: notification.updatedAt,
  };
}

function buildUserFilter(userId, query = {}) {
  const filter = { userId };

  if (query.unreadOnly === true || query.unreadOnly === 'true') {
    filter.isRead = false;
  }

  return filter;
}

async function listNotifications(userId, query = {}) {
  const page = normalizePage(query);
  const limit = normalizeLimit(query);
  const filter = buildUserFilter(userId, query);

  const [totalItems, unreadCount, notifications] = await Promise.all([
    Notification.countDocuments(filter),
    Notification.countDocuments({ userId, isRead: false }),
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
  ]);

  return {
    items: notifications.map(serializeNotification),
    unreadCount,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / limit)),
    },
  };
}

async function findNotificationOrThrow(userId, id) {
  const notification = await Notification.findOne({
    _id: id,
    userId,
  });

  if (!notification) {
    throw createError(404, 'Notification not found');
  }

  return notification;
}

async function markNotificationRead(userId, id) {
  const notification = await findNotificationOrThrow(userId, id);

  if (!notification.isRead) {
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();
  }

  return serializeNotification(notification);
}

async function markAllNotificationsRead(userId) {
  const now = new Date();
  const result = await Notification.updateMany(
    {
      userId,
      isRead: false,
    },
    {
      $set: {
        isRead: true,
        readAt: now,
      },
    },
  );

  return {
    modifiedCount: result.modifiedCount || 0,
    readAt: now,
  };
}

async function createNotification(userId, payload) {
  const notification = await Notification.create({
    userId,
    title: payload.title,
    message: payload.message,
    type: payload.type || 'system',
    actionUrl: payload.actionUrl || '',
    isRead: Boolean(payload.isRead),
    readAt: payload.isRead ? new Date() : null,
  });

  return serializeNotification(notification);
}

async function createGenerateSuccessNotification(userId, content) {
  return createNotification(userId, {
    title: 'Nội dung mới đã được tạo',
    message: `Bản copy "${content.title}" đã được tạo và lưu vào thư viện nội dung của bạn.`,
    type: 'ai',
    actionUrl: `/contents/${content._id.toString()}`,
  });
}

module.exports = {
  serializeNotification,
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  createNotification,
  createGenerateSuccessNotification,
};
