const AccountAdmin = require('../models/AccountAdmin');
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
  const recipientType = notification.recipientType || (notification.adminId ? 'admin' : 'user');
  const recipientAccount = recipientType === 'admin' ? notification.adminId : notification.userId;
  const senderAdmin = notification.senderAdminId;

  return {
    id: notification._id.toString(),
    _id: notification._id.toString(),
    recipientType,
    userId: toId(notification.userId),
    adminId: toId(notification.adminId),
    senderAdminId: toId(notification.senderAdminId),
    recipient: recipientAccount && recipientAccount.email ? {
      id: toId(recipientAccount),
      name: recipientAccount.name,
      email: recipientAccount.email,
      role: recipientType === 'admin' ? 'admin' : 'customer',
      adminRole: recipientAccount.adminRole,
      status: recipientAccount.status,
      avatar: recipientAccount.avatar || '',
    } : null,
    sender: senderAdmin && senderAdmin.email ? {
      id: toId(senderAdmin),
      name: senderAdmin.name,
      email: senderAdmin.email,
      adminRole: senderAdmin.adminRole,
    } : null,
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
  const filter = { userId, recipientType: { $in: ['user', null] } };

  if (query.unreadOnly === true || query.unreadOnly === 'true') {
    filter.isRead = false;
  }

  return filter;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeAdminLimit(query = {}) {
  return Math.min(100, Math.max(1, Number(query.limit || 20)));
}

function activeAccountFilter(extra = {}) {
  return {
    ...extra,
    status: 'active',
    isDeleted: { $ne: true },
  };
}

function buildAdminNotificationFilter(adminId, query = {}) {
  const filter = {};

  if (query.recipientType && query.recipientType !== 'all') {
    filter.recipientType = query.recipientType;
  }

  if (query.type && query.type !== 'all') {
    filter.type = query.type;
  }

  if (query.source === 'sent_by_me') {
    filter.senderAdminId = adminId;
  }

  if (query.source === 'received_by_me') {
    filter.recipientType = 'admin';
    filter.adminId = adminId;
  }

  if (query.search) {
    const regex = new RegExp(escapeRegExp(query.search), 'i');
    filter.$or = [
      { title: regex },
      { message: regex },
      { actionUrl: regex },
    ];
  }

  return filter;
}

async function listAdminNotifications(adminId, query = {}) {
  const page = normalizePage(query);
  const limit = normalizeAdminLimit(query);
  const filter = buildAdminNotificationFilter(adminId, query);

  const [totalItems, unreadCount, notifications] = await Promise.all([
    Notification.countDocuments(filter),
    Notification.countDocuments({ recipientType: 'admin', adminId, isRead: false }),
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('userId', 'name email avatar status')
      .populate('adminId', 'name email avatar adminRole status')
      .populate('senderAdminId', 'name email adminRole'),
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

async function getRecipientsForAdminNotification(senderAdminId, payload) {
  if (payload.recipientMode === 'all_users') {
    const users = await AccountUser.find(activeAccountFilter()).select('_id name email');
    return users.map((account) => ({ recipientType: 'user', account }));
  }

  if (payload.recipientMode === 'all_admins') {
    const admins = await AccountAdmin.find(activeAccountFilter({ _id: { $ne: senderAdminId } })).select('_id name email');
    return admins.map((account) => ({ recipientType: 'admin', account }));
  }

  const selectedRecipients = Array.isArray(payload.recipients)
    ? Array.from(new Map(payload.recipients.map((recipient) => [`${recipient.accountType}:${recipient.id}`, recipient])).values())
    : [];
  const userIds = selectedRecipients
    .filter((recipient) => recipient.accountType === 'user')
    .map((recipient) => recipient.id);
  const adminIds = selectedRecipients
    .filter((recipient) => recipient.accountType === 'admin' && String(recipient.id) !== String(senderAdminId))
    .map((recipient) => recipient.id);

  const [users, admins] = await Promise.all([
    userIds.length > 0
      ? AccountUser.find(activeAccountFilter({ _id: { $in: userIds } })).select('_id name email')
      : [],
    adminIds.length > 0
      ? AccountAdmin.find(activeAccountFilter({ _id: { $in: adminIds } })).select('_id name email')
      : [],
  ]);

  return [
    ...users.map((account) => ({ recipientType: 'user', account })),
    ...admins.map((account) => ({ recipientType: 'admin', account })),
  ];
}

async function sendAdminNotification(senderAdminId, payload) {
  const recipients = await getRecipientsForAdminNotification(senderAdminId, payload);

  if (recipients.length === 0) {
    throw createError(400, 'No active recipients found');
  }

  const docs = recipients.map(({ recipientType, account }) => ({
    recipientType,
    userId: recipientType === 'user' ? account._id : null,
    adminId: recipientType === 'admin' ? account._id : null,
    senderAdminId,
    title: payload.title,
    message: payload.message,
    type: payload.type || 'system',
    actionUrl: payload.actionUrl || '',
  }));

  const created = await Notification.insertMany(docs, { ordered: false });

  return {
    createdCount: created.length,
    recipients: recipients.map(({ recipientType, account }) => ({
      id: account._id.toString(),
      name: account.name,
      email: account.email,
      role: recipientType === 'admin' ? 'admin' : 'customer',
    })),
    items: created.map(serializeNotification),
  };
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

async function markAdminNotificationRead(adminId, id) {
  const notification = await Notification.findOne({
    _id: id,
    recipientType: 'admin',
    adminId,
  });

  if (!notification) {
    throw createError(404, 'Notification not found');
  }

  if (!notification.isRead) {
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();
  }

  return serializeNotification(notification);
}

async function markAllAdminNotificationsRead(adminId) {
  const now = new Date();
  const result = await Notification.updateMany(
    {
      recipientType: 'admin',
      adminId,
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
    recipientType: 'user',
    userId,
    adminId: null,
    senderAdminId: payload.senderAdminId || null,
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
  listAdminNotifications,
  markNotificationRead,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
  markAllNotificationsRead,
  createNotification,
  sendAdminNotification,
  createGenerateSuccessNotification,
  maybeCreateQuotaLowNotification,
};
