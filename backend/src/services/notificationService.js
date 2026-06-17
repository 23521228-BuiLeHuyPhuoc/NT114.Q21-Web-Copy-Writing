const AccountUser = require('../models/AccountUser');
const Notification = require('../models/Notification');
const Plan = require('../models/Plan');
const Subscription = require('../models/Subscription');
const UsageLog = require('../models/UsageLog');
const createError = require('../utils/createError');

const QUOTA_LOW_THRESHOLD_PERCENT = 20;
const QUOTA_LOW_USED_RATIO = (100 - QUOTA_LOW_THRESHOLD_PERCENT) / 100;

function toId(value) {
  return value ? value.toString() : null;
}

function normalizePage(query = {}) {
  return Math.max(1, Number(query.page || 1));
}

function normalizeLimit(query = {}) {
  return Math.min(50, Math.max(1, Number(query.limit || 10)));
}

function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

function serializeNotificationPreferences(user) {
  return {
    quotaLow: user?.notificationPreferences?.quotaLow !== false,
  };
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

async function findUserOrThrow(userId) {
  const user = await AccountUser.findById(userId);
  if (!user) {
    throw createError(404, 'Account not found');
  }

  return user;
}

async function getNotificationPreferences(userId) {
  const user = await findUserOrThrow(userId);
  return serializeNotificationPreferences(user);
}

async function updateNotificationPreferences(userId, payload) {
  const user = await findUserOrThrow(userId);
  user.notificationPreferences = {
    ...(user.notificationPreferences?.toObject?.() || user.notificationPreferences || {}),
    quotaLow: payload.quotaLow,
  };
  await user.save();

  return serializeNotificationPreferences(user);
}

async function getCurrentPlan(userId) {
  const subscription = await Subscription.findOne({
    userId,
    status: { $in: ['active', 'trialing', 'past_due'] },
  })
    .sort({ createdAt: -1 })
    .populate('planId');

  if (subscription?.planId) return subscription.planId;

  const freePlan = await Plan.findOne({ slug: 'free', isDeleted: { $ne: true } });
  if (freePlan) return freePlan;

  return Plan.findOne({ isDeleted: { $ne: true } }).sort({ sortOrder: 1, priceMonthly: 1 });
}

async function getCurrentMonthCopyUsed(userId, now = new Date()) {
  return UsageLog.countDocuments({
    userId,
    action: 'generate',
    createdAt: {
      $gte: startOfMonth(now),
      $lt: endOfMonth(now),
    },
  });
}

async function createQuotaLowNotification(userId, quota) {
  const now = new Date();
  const existing = await Notification.findOne({
    userId,
    type: 'billing',
    title: 'Quota copy còn 20%',
    actionUrl: '/billing',
    createdAt: {
      $gte: startOfMonth(now),
      $lt: endOfMonth(now),
    },
  });

  if (existing) return serializeNotification(existing);

  return createNotification(userId, {
    title: 'Quota copy còn 20%',
    message: `Bạn đã dùng ${quota.used}/${quota.limit} copy trong tháng này. Quota còn ${quota.remaining} copy (${quota.remainingPercent}%).`,
    type: 'billing',
    actionUrl: '/billing',
  });
}

async function maybeCreateQuotaLowNotification(userId, options = {}) {
  const user = await findUserOrThrow(userId);
  if (user.notificationPreferences?.quotaLow === false) return null;

  const plan = await getCurrentPlan(userId);
  const copyLimit = Number(plan?.limits?.copyMonthly || 0);
  if (copyLimit <= 0) return null;

  const used = await getCurrentMonthCopyUsed(userId);
  const previousUsed = Math.max(0, used - Number(options.usedDelta || 1));
  const usedThreshold = Math.ceil(copyLimit * QUOTA_LOW_USED_RATIO);

  if (used < usedThreshold || previousUsed >= usedThreshold) {
    return null;
  }

  const remaining = Math.max(0, copyLimit - used);
  const remainingPercent = Math.max(0, Math.round((remaining / copyLimit) * 100));

  return createQuotaLowNotification(userId, {
    used,
    limit: copyLimit,
    remaining,
    remainingPercent,
  });
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
  serializeNotificationPreferences,
  getNotificationPreferences,
  updateNotificationPreferences,
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  createNotification,
  createGenerateSuccessNotification,
  maybeCreateQuotaLowNotification,
};
