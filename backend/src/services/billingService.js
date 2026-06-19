const mongoose = require('mongoose');

const AccountUser = require('../models/AccountUser');
const Payment = require('../models/Payment');
const Plan = require('../models/Plan');
const Subscription = require('../models/Subscription');
const UsageLog = require('../models/UsageLog');
const {
  getGenerateModelAccessId,
  normalizeAllowedModels,
} = require('../config/generatorModels');
const createError = require('../utils/createError');
const paymentGatewayService = require('./paymentGatewayService');

const METHOD_LABELS = {
  cash: 'Tiền mặt',
  bank: 'Chuyển khoản ngân hàng',
  momo: 'MoMo',
  zalo: 'ZaloPay',
  vnpay: 'VNPAY',
  vietqr: 'VietQR',
  visa: 'Visa',
  manual: 'Ghi nhận thủ công',
};

function toId(value) {
  if (!value) return null;
  if (value._id) return value._id.toString();
  return value.toString();
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function formatDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

function formatDateTime(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value));
}

function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

function addMonths(date, count) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + count);
  return next;
}

function subtractHours(date, count) {
  return new Date(date.getTime() - count * 60 * 60 * 1000);
}

function subtractDays(date, count) {
  return new Date(date.getTime() - count * 24 * 60 * 60 * 1000);
}

function estimateTokens(text) {
  return Math.max(1, Math.ceil(String(text || '').length / 4));
}

function getRequestedMaxOutputTokens(payload = {}) {
  const requested = Number(payload.maxOutputTokens);
  if (Number.isFinite(requested)) return Math.min(6000, Math.max(500, Math.round(requested)));

  const length = String(payload.length || 'medium');
  if (length === 'short') return 900;
  if (length === 'long') return 3200;
  return 1800;
}

function calculateGenerateQuotaUnits(totalTokens) {
  const tokens = Number(totalTokens || 0);
  if (!Number.isFinite(tokens) || tokens <= 0) return 1;
  return Math.max(1, Math.ceil(tokens / 1000));
}

function estimateGenerateQuotaUnits(payload = {}) {
  return calculateGenerateQuotaUnits(estimateTokens(payload.prompt) + getRequestedMaxOutputTokens(payload));
}

function isPositiveLimit(limit) {
  return Number(limit || 0) > 0;
}

function remainingForLimit(limit, used) {
  if (!isPositiveLimit(limit)) return null;
  return Math.max(0, Number(limit) - Number(used || 0));
}

function normalizeLimitValue(value, fallback = 0) {
  if (value === '' || value === null || value === undefined) return fallback;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function normalizePlanPayload(payload = {}, existing = null) {
  const priceMonthly = normalizeLimitValue(
    payload.priceMonthly ?? payload.monthlyPrice ?? payload.price,
    existing?.priceMonthly ?? 0,
  );
  const priceYearly = normalizeLimitValue(
    payload.priceYearly ?? payload.yearlyPrice,
    existing?.priceYearly ?? (priceMonthly > 0 ? Math.round(priceMonthly * 10) : priceMonthly),
  );
  const limits = { ...(existing?.limits?.toObject?.() || existing?.limits || {}) };
  const incomingLimits = payload.limits || {};

  limits.copyMonthly = normalizeLimitValue(
    incomingLimits.copyMonthly ?? payload.copyLimit,
    limits.copyMonthly ?? 0,
  );
  limits.apiCallsMonthly = normalizeLimitValue(
    incomingLimits.apiCallsMonthly ?? payload.apiLimit,
    limits.apiCallsMonthly ?? 0,
  );
  limits.apiCallsFiveHours = normalizeLimitValue(
    incomingLimits.apiCallsFiveHours ?? payload.apiLimitFiveHours,
    limits.apiCallsFiveHours ?? 0,
  );
  limits.apiCallsWeekly = normalizeLimitValue(
    incomingLimits.apiCallsWeekly ?? payload.apiLimitWeekly,
    limits.apiCallsWeekly ?? 0,
  );
  limits.fineTuneModels = normalizeLimitValue(
    incomingLimits.fineTuneModels ?? payload.fineTune,
    limits.fineTuneModels ?? 0,
  );
  limits.plagiarismChecks = normalizeLimitValue(
    incomingLimits.plagiarismChecks ?? payload.plagiarismChecks,
    limits.plagiarismChecks ?? 0,
  );
  limits.seats = normalizeLimitValue(incomingLimits.seats ?? payload.seats, limits.seats ?? 1);
  limits.historyDays = normalizeLimitValue(
    incomingLimits.historyDays ?? payload.historyDays,
    limits.historyDays ?? 7,
  );

  return {
    name: payload.name ?? existing?.name,
    slug: slugify(payload.slug || payload.name || existing?.slug),
    description: payload.description ?? existing?.description ?? '',
    priceMonthly,
    priceYearly,
    currency: payload.currency || existing?.currency || 'VND',
    limits,
    features: payload.features ?? existing?.features ?? [],
    excludedFeatures: payload.excludedFeatures ?? existing?.excludedFeatures ?? [],
    allowedModels: normalizeAllowedModels(payload.allowedModels ?? existing?.allowedModels ?? []),
    isPopular: payload.isPopular ?? payload.popular ?? existing?.isPopular ?? false,
    isActive: payload.isActive ?? payload.active ?? existing?.isActive ?? true,
    sortOrder: normalizeLimitValue(payload.sortOrder, existing?.sortOrder ?? 0),
  };
}

async function getSubscriberCountMap() {
  const counts = await Subscription.aggregate([
    { $match: { status: { $in: ['active', 'trialing'] } } },
    { $group: { _id: '$planId', count: { $sum: 1 } } },
  ]);

  return new Map(counts.map((item) => [item._id.toString(), item.count]));
}

function serializePlan(plan, subscriberCount = 0) {
  const limits = plan.limits || {};
  return {
    id: plan._id.toString(),
    _id: plan._id.toString(),
    name: plan.name,
    slug: plan.slug,
    description: plan.description || '',
    price: plan.priceMonthly,
    monthlyPrice: plan.priceMonthly,
    yearlyPrice: plan.priceYearly,
    currency: plan.currency,
    limits: {
      copyMonthly: limits.copyMonthly ?? 0,
      apiCallsMonthly: limits.apiCallsMonthly ?? 0,
      apiCallsFiveHours: limits.apiCallsFiveHours ?? 0,
      apiCallsWeekly: limits.apiCallsWeekly ?? 0,
      fineTuneModels: limits.fineTuneModels ?? 0,
      plagiarismChecks: limits.plagiarismChecks ?? 0,
      seats: limits.seats ?? 1,
      historyDays: limits.historyDays ?? 7,
    },
    features: plan.features || [],
    excludedFeatures: plan.excludedFeatures || [],
    allowedModels: normalizeAllowedModels(plan.allowedModels || []),
    isPopular: Boolean(plan.isPopular),
    popular: Boolean(plan.isPopular),
    isActive: Boolean(plan.isActive),
    active: Boolean(plan.isActive),
    sortOrder: plan.sortOrder || 0,
    users: subscriberCount,
    copyLimit: limits.copyMonthly ?? 0,
    apiLimit: limits.apiCallsMonthly ?? 0,
    apiLimitFiveHours: limits.apiCallsFiveHours ?? 0,
    apiLimitWeekly: limits.apiCallsWeekly ?? 0,
    fineTune: limits.fineTuneModels ?? 0,
    isDeleted: Boolean(plan.isDeleted),
    deletedAt: plan.deletedAt,
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
  };
}

function serializeSubscription(subscription, plan) {
  if (!subscription) return null;
  return {
    id: subscription._id.toString(),
    _id: subscription._id.toString(),
    userId: toId(subscription.userId),
    planId: toId(subscription.planId),
    plan: plan ? serializePlan(plan) : undefined,
    status: subscription.status,
    billingCycle: subscription.billingCycle,
    currentPeriodStart: subscription.currentPeriodStart,
    currentPeriodEnd: subscription.currentPeriodEnd,
    renewDate: formatDate(subscription.currentPeriodEnd),
    cancelAtPeriodEnd: Boolean(subscription.cancelAtPeriodEnd),
    provider: subscription.provider,
  };
}

function serializePayment(payment) {
  const user = payment.userId && payment.userId.email ? payment.userId : null;
  const plan = payment.planId && payment.planId.name ? payment.planId : null;
  const displayDate = payment.paidAt || payment.createdAt;

  return {
    id: payment.invoiceNo,
    _id: payment._id.toString(),
    paymentId: payment._id.toString(),
    invoiceNo: payment.invoiceNo,
    userId: toId(payment.userId),
    planId: toId(payment.planId),
    subscriptionId: toId(payment.subscriptionId),
    user: user?.name || 'Demo Customer',
    email: user?.email || '',
    amount: payment.amount,
    currency: payment.currency,
    plan: plan?.name || 'Unknown plan',
    method: METHOD_LABELS[payment.method] || payment.method,
    methodCode: payment.method,
    provider: payment.provider,
    status: payment.status,
    date: formatDateTime(displayDate),
    invoiceDate: formatDate(displayDate),
    paidAt: payment.paidAt,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
  };
}

async function ensureSlugAvailable(slug, exceptId) {
  const existing = await Plan.findOne({ slug });
  if (existing && existing._id.toString() !== String(exceptId || '')) {
    throw createError(409, 'Slug gói dịch vụ đã tồn tại');
  }
}

async function findPlanOrThrow(id, includeDeleted = false) {
  const query = mongoose.Types.ObjectId.isValid(id)
    ? { _id: id }
    : { slug: String(id || '').toLowerCase() };
  if (!includeDeleted) query.isDeleted = { $ne: true };

  const plan = await Plan.findOne(query);
  if (!plan) throw createError(404, 'Plan not found');
  return plan;
}

async function listPlans({ activeOnly = true, deleted = false } = {}) {
  const filter = deleted ? { isDeleted: true } : { isDeleted: { $ne: true } };
  if (activeOnly) filter.isActive = true;

  const [plans, subscriberCountMap] = await Promise.all([
    Plan.find(filter).sort({ sortOrder: 1, priceMonthly: 1, name: 1 }),
    getSubscriberCountMap(),
  ]);

  return plans.map((plan) => serializePlan(plan, subscriberCountMap.get(plan._id.toString()) || 0));
}

async function createPlan(payload) {
  const normalized = normalizePlanPayload(payload);
  if (!normalized.name) throw createError(400, 'Tên gói dịch vụ là bắt buộc');
  if (!normalized.slug) throw createError(400, 'Slug gói dịch vụ không hợp lệ');
  await ensureSlugAvailable(normalized.slug);

  const plan = await Plan.create(normalized);
  return serializePlan(plan, 0);
}

async function updatePlan(id, payload) {
  const plan = await findPlanOrThrow(id);
  const normalized = normalizePlanPayload(payload, plan);

  if (!normalized.name) throw createError(400, 'Tên gói dịch vụ là bắt buộc');
  if (!normalized.slug) throw createError(400, 'Slug gói dịch vụ không hợp lệ');
  await ensureSlugAvailable(normalized.slug, id);

  Object.assign(plan, normalized);
  await plan.save();
  const subscriberCountMap = await getSubscriberCountMap();
  return serializePlan(plan, subscriberCountMap.get(plan._id.toString()) || 0);
}

async function softDeletePlan(id) {
  const plan = await findPlanOrThrow(id);
  plan.isDeleted = true;
  plan.deletedAt = new Date();
  await plan.save();
  const subscriberCountMap = await getSubscriberCountMap();
  return serializePlan(plan, subscriberCountMap.get(plan._id.toString()) || 0);
}

async function restorePlan(id) {
  const plan = await findPlanOrThrow(id, true);
  plan.isDeleted = false;
  plan.deletedAt = null;
  await plan.save();
  const subscriberCountMap = await getSubscriberCountMap();
  return serializePlan(plan, subscriberCountMap.get(plan._id.toString()) || 0);
}

async function permanentDeletePlan(id) {
  const subscriptionCount = await Subscription.countDocuments({ planId: id });
  if (subscriptionCount > 0) {
    throw createError(409, 'Không thể xoá vĩnh viễn gói đang có subscription');
  }

  const deleted = await Plan.findByIdAndDelete(id);
  if (!deleted) throw createError(404, 'Plan not found');
}

async function getCurrentSubscription(userId) {
  return Subscription.findOne({
    userId,
    status: { $in: ['active', 'trialing', 'past_due'] },
  })
    .sort({ createdAt: -1 })
    .populate('planId');
}

async function getFallbackPlan() {
  return Plan.findOne({ slug: 'free', isDeleted: { $ne: true } })
    || Plan.findOne({ isDeleted: { $ne: true } }).sort({ sortOrder: 1, priceMonthly: 1 });
}

async function getEffectivePlanForUser(userId) {
  const subscription = await getCurrentSubscription(userId);
  return subscription?.planId || await getFallbackPlan();
}

async function ensureGenerateModelAllowed(userId, payload = {}) {
  const plan = await getEffectivePlanForUser(userId);
  if (!plan) return null;

  const allowedModels = normalizeAllowedModels(plan.allowedModels || []);
  if (allowedModels.length === 0) return plan;

  const requestedAccess = getGenerateModelAccessId(payload);
  if (requestedAccess && allowedModels.includes(requestedAccess)) return plan;

  throw createError(403, 'Model nay khong nam trong goi dich vu hien tai', undefined, {
    code: 'MODEL_NOT_INCLUDED_IN_PLAN',
    requestedModel: String(payload.model || ''),
    requestedAccess,
    allowedModels,
    plan: serializePlan(plan),
  });
}

async function getUsageForWindow(userId, start, end) {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const match = {
    userId: userObjectId,
    action: 'generate',
    createdAt: { $gte: start, $lt: end },
  };

  const rows = await UsageLog.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        copyUsed: { $sum: 1 },
        totalTokens: { $sum: '$totalTokens' },
        quotaUnits: {
          $sum: {
            $cond: [
              { $gt: ['$quotaUnits', 0] },
              '$quotaUnits',
              { $max: [1, { $ceil: { $divide: ['$totalTokens', 1000] } }] },
            ],
          },
        },
      },
    },
  ]);

  return rows[0] || { copyUsed: 0, totalTokens: 0, quotaUnits: 0 };
}

async function getGenerateUsageSummary(userId, now = new Date()) {
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const fiveHoursStart = subtractHours(now, 5);
  const weekStart = subtractDays(now, 7);

  const [monthly, fiveHours, weekly] = await Promise.all([
    getUsageForWindow(userId, monthStart, monthEnd),
    getUsageForWindow(userId, fiveHoursStart, now),
    getUsageForWindow(userId, weekStart, now),
  ]);

  return {
    monthly,
    fiveHours,
    weekly,
    windows: {
      monthly: { start: monthStart, end: monthEnd },
      fiveHours: { start: fiveHoursStart, end: now },
      weekly: { start: weekStart, end: now },
    },
  };
}

function checkQuotaLimit({ limit, used, requested, code, label, window }) {
  if (!isPositiveLimit(limit)) return;
  const nextUsed = Number(used || 0) + Number(requested || 0);
  if (nextUsed <= Number(limit)) return;

  throw createError(429, `${label} da vuot gioi han goi dich vu`, undefined, {
    code,
    window,
    used: Number(used || 0),
    requested: Number(requested || 0),
    limit: Number(limit),
    remaining: Math.max(0, Number(limit) - Number(used || 0)),
  });
}

async function ensureGenerateQuotaAvailable(userId, payload = {}) {
  const plan = await getEffectivePlanForUser(userId);
  if (!plan) return null;

  const usage = await getGenerateUsageSummary(userId);
  const limits = plan.limits || {};
  const requestedQuotaUnits = estimateGenerateQuotaUnits(payload);
  const requestedCopyUnits = 1;

  checkQuotaLimit({
    limit: limits.copyMonthly,
    used: usage.monthly.copyUsed,
    requested: requestedCopyUnits,
    code: 'COPY_MONTHLY_QUOTA_EXCEEDED',
    label: 'Quota copy thang',
    window: 'monthly',
  });
  checkQuotaLimit({
    limit: limits.apiCallsMonthly,
    used: usage.monthly.quotaUnits,
    requested: requestedQuotaUnits,
    code: 'GENERATE_MONTHLY_QUOTA_EXCEEDED',
    label: 'Quota generate thang',
    window: 'monthly',
  });
  checkQuotaLimit({
    limit: limits.apiCallsFiveHours,
    used: usage.fiveHours.quotaUnits,
    requested: requestedQuotaUnits,
    code: 'GENERATE_5H_QUOTA_EXCEEDED',
    label: 'Quota generate 5 gio',
    window: 'fiveHours',
  });
  checkQuotaLimit({
    limit: limits.apiCallsWeekly,
    used: usage.weekly.quotaUnits,
    requested: requestedQuotaUnits,
    code: 'GENERATE_WEEKLY_QUOTA_EXCEEDED',
    label: 'Quota generate tuan',
    window: 'weekly',
  });

  return {
    plan,
    usage,
    requestedCopyUnits,
    requestedQuotaUnits,
  };
}

async function listUserPayments(userId, limit = 10) {
  const payments = await Payment.find({ userId })
    .populate('userId')
    .populate('planId')
    .sort({ createdAt: -1 })
    .limit(limit);
  return payments.map(serializePayment);
}

async function getMyBilling(userId) {
  const [subscription, usage, invoices] = await Promise.all([
    getCurrentSubscription(userId),
    getGenerateUsageSummary(userId),
    listUserPayments(userId, 10),
  ]);

  const plan = subscription?.planId || await getFallbackPlan();
  const serializedPlan = plan ? serializePlan(plan) : null;
  const renewDate = subscription?.currentPeriodEnd || addMonths(new Date(), 1);
  const limits = serializedPlan?.limits || {};

  return {
    currentPlan: {
      name: serializedPlan?.name || 'Free',
      slug: serializedPlan?.slug || 'free',
      price: serializedPlan?.monthlyPrice ?? 0,
      renewDate: formatDate(renewDate),
      copyUsed: usage.monthly.copyUsed,
      copyLimit: limits.copyMonthly ?? 0,
      apiCalls: usage.monthly.quotaUnits,
      apiLimit: limits.apiCallsMonthly ?? 0,
      quotaUsed: usage.monthly.quotaUnits,
      quotaLimit: limits.apiCallsMonthly ?? 0,
      quotaUsedFiveHours: usage.fiveHours.quotaUnits,
      quotaLimitFiveHours: limits.apiCallsFiveHours ?? 0,
      quotaUsedWeekly: usage.weekly.quotaUnits,
      quotaLimitWeekly: limits.apiCallsWeekly ?? 0,
    },
    usage: {
      monthly: {
        copyUsed: usage.monthly.copyUsed,
        copyLimit: limits.copyMonthly ?? 0,
        quotaUsed: usage.monthly.quotaUnits,
        quotaLimit: limits.apiCallsMonthly ?? 0,
        quotaRemaining: remainingForLimit(limits.apiCallsMonthly, usage.monthly.quotaUnits),
        totalTokens: usage.monthly.totalTokens,
      },
      fiveHours: {
        quotaUsed: usage.fiveHours.quotaUnits,
        quotaLimit: limits.apiCallsFiveHours ?? 0,
        quotaRemaining: remainingForLimit(limits.apiCallsFiveHours, usage.fiveHours.quotaUnits),
        totalTokens: usage.fiveHours.totalTokens,
        windowStart: usage.windows.fiveHours.start,
        windowEnd: usage.windows.fiveHours.end,
      },
      weekly: {
        quotaUsed: usage.weekly.quotaUnits,
        quotaLimit: limits.apiCallsWeekly ?? 0,
        quotaRemaining: remainingForLimit(limits.apiCallsWeekly, usage.weekly.quotaUnits),
        totalTokens: usage.weekly.totalTokens,
        windowStart: usage.windows.weekly.start,
        windowEnd: usage.windows.weekly.end,
      },
    },
    plan: serializedPlan,
    subscription: serializeSubscription(subscription, plan),
    invoices,
  };
}

function normalizePaymentMethod(method) {
  const value = String(method || 'manual').toLowerCase();
  if (value === 'zalopay') return 'zalo';
  return METHOD_LABELS[value] ? value : 'manual';
}

function generateInvoiceNo() {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `INV-${stamp}-${Date.now().toString().slice(-6)}`;
}

function getBillingCycleMonths(billingCycle) {
  return billingCycle === 'yearly' ? 12 : 1;
}

function getPaymentProvider(method) {
  if (method === 'vnpay') return 'vnpay';
  if (method === 'zalo') return 'zalopay';
  if (method === 'vietqr') return 'vietqr';
  return 'mock';
}

async function createPaymentRecord({
  userId,
  plan,
  amount,
  method,
  provider,
  billingCycle,
  subscriptionId = null,
  status = 'pending',
  paidAt = null,
  periodStart = null,
  periodEnd = null,
  metadata = {},
}) {
  return Payment.create({
    invoiceNo: generateInvoiceNo(),
    userId,
    planId: plan._id,
    subscriptionId,
    amount,
    currency: plan.currency,
    method,
    provider,
    status,
    paidAt,
    periodStart,
    periodEnd,
    metadata: {
      billingCycle,
      ...metadata,
    },
  });
}

async function activatePayment(payment, { provider, providerTransactionId, providerPayload } = {}) {
  if (payment.status === 'success') {
    await payment.populate(['userId', 'planId', 'subscriptionId']);
    return payment;
  }

  const plan = await Plan.findById(payment.planId);
  if (!plan) {
    throw createError(404, 'Plan not found');
  }

  const billingCycle = payment.metadata?.billingCycle || 'monthly';
  const now = new Date();
  const periodEnd = addMonths(now, getBillingCycleMonths(billingCycle));
  let subscription = payment.subscriptionId
    ? await Subscription.findById(payment.subscriptionId)
    : await getCurrentSubscription(payment.userId);

  if (!subscription) {
    subscription = await Subscription.create({
      userId: payment.userId,
      planId: plan._id,
      status: 'active',
      billingCycle,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      provider,
      providerSubscriptionId: providerTransactionId || '',
    });
  } else {
    subscription.planId = plan._id;
    subscription.status = 'active';
    subscription.billingCycle = billingCycle;
    subscription.currentPeriodStart = now;
    subscription.currentPeriodEnd = periodEnd;
    subscription.provider = provider;
    subscription.providerSubscriptionId = providerTransactionId || subscription.providerSubscriptionId || '';
    await subscription.save();
  }

  payment.subscriptionId = subscription._id;
  payment.provider = provider;
  payment.status = 'success';
  payment.paidAt = now;
  payment.periodStart = now;
  payment.periodEnd = periodEnd;
  payment.metadata = {
    ...(payment.metadata || {}),
    ...providerPayload,
    provider,
    providerTransactionId,
  };
  payment.markModified('metadata');
  await payment.save();
  await payment.populate(['userId', 'planId', 'subscriptionId']);

  return payment;
}

async function markPaymentFailed(payment, reason, providerPayload = {}) {
  if (payment.status === 'success') {
    await payment.populate(['userId', 'planId', 'subscriptionId']);
    return payment;
  }

  payment.status = 'failed';
  payment.metadata = {
    ...(payment.metadata || {}),
    failureReason: reason,
    ...providerPayload,
  };
  payment.markModified('metadata');
  await payment.save();
  await payment.populate(['userId', 'planId', 'subscriptionId']);
  return payment;
}

function buildCheckoutResponse(payment, extras = {}) {
  return {
    payment: serializePayment(payment),
    status: payment.status,
    paymentUrl: extras.paymentUrl || null,
    gateway: extras.gateway || null,
    vietqr: extras.vietqr || null,
    message: extras.message || (payment.status === 'success'
      ? 'Thanh toán thành công và gói đã được kích hoạt'
      : 'Đã tạo hóa đơn thanh toán'),
  };
}

async function createMockCheckout(userId, payload, req = {}) {
  const user = await ensureUserExists(userId);
  const plan = await findPlanOrThrow(payload.planId || payload.planSlug);
  const billingCycle = payload.billingCycle === 'yearly' ? 'yearly' : 'monthly';
  const amount = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;

  if (amount < 0) {
    throw createError(400, 'Gói này cần liên hệ tư vấn để kích hoạt');
  }

  const method = normalizePaymentMethod(payload.method);
  const provider = getPaymentProvider(method);
  const isGateway = method === 'vnpay' || method === 'zalo';
  const now = new Date();
  const periodEnd = addMonths(now, getBillingCycleMonths(billingCycle));

  if (amount > 0 && method === 'zalo') {
    const minAmount = Number(process.env.ZALOPAY_MIN_AMOUNT || 1000);
    if (amount < minAmount) {
      throw createError(400, `ZaloPay yêu cầu số tiền tối thiểu là ${minAmount.toLocaleString('vi-VN')}₫`);
    }
  }

  if (amount === 0) {
    const payment = await createPaymentRecord({
      userId,
      plan,
      amount: 0,
      method: 'manual',
      provider: 'manual',
      billingCycle,
      status: 'pending',
      metadata: {
        note: 'Free plan auto-activated',
      },
    });
    await activatePayment(payment, {
      provider: 'manual',
      providerTransactionId: '',
      providerPayload: { note: 'Free plan auto-activated' },
    });

    return buildCheckoutResponse(payment, {
      gateway: 'manual',
      message: 'Gói miễn phí đã được kích hoạt',
    });
  }

  if (method === 'vietqr') {
    const payment = await createPaymentRecord({
      userId,
      plan,
      amount,
      method,
      provider,
      billingCycle,
      status: 'pending',
      metadata: {
        gateway: provider,
        gatewayMethod: method,
        userEmail: user.email,
      },
    });

    try {
      const vietqr = paymentGatewayService.buildVietQrPaymentData({
        invoiceNo: payment.invoiceNo,
        amount,
      });

      payment.metadata = {
        ...(payment.metadata || {}),
        gateway: provider,
        gatewayMethod: method,
        vietqr: {
          bankId: vietqr.bankId,
          bankName: vietqr.bankName,
          accountNo: vietqr.accountNo,
          accountName: vietqr.accountName,
          amount: vietqr.amount,
          currency: vietqr.currency,
          transferContent: vietqr.transferContent,
          expiresAt: vietqr.expiresAt,
        },
      };
      payment.markModified('metadata');
      await payment.save();
      await payment.populate(['userId', 'planId']);

      return buildCheckoutResponse(payment, {
        gateway: provider,
        vietqr,
        message: 'Đã tạo mã VietQR, vui lòng quét mã và chuyển đúng nội dung',
      });
    } catch (error) {
      await markPaymentFailed(payment, error.message, {
        gateway: provider,
      });
      throw error;
    }
  }

  if (isGateway) {
    const payment = await createPaymentRecord({
      userId,
      plan,
      amount,
      method,
      provider,
      billingCycle,
      metadata: {
        gateway: provider,
        gatewayMethod: method,
        userEmail: user.email,
      },
    });

    try {
      let gatewayResult;
      if (method === 'vnpay') {
        gatewayResult = {
          paymentUrl: paymentGatewayService.buildVnpayPaymentUrl({
            invoiceNo: payment.invoiceNo,
            amount,
            ipAddress: req.ip || req.socket?.remoteAddress || '127.0.0.1',
            planName: plan.name,
          }),
        };
      } else {
        gatewayResult = await paymentGatewayService.createZalopayPaymentUrl({
          invoiceNo: payment.invoiceNo,
          amount,
          planName: plan.name,
          billingCycle,
          paymentId: payment._id.toString(),
          userEmail: user.email,
        });
      }

      payment.metadata = {
        ...(payment.metadata || {}),
        gateway: provider,
        gatewayMethod: method,
        gatewayTransactionId: gatewayResult.gatewayTransactionId || null,
        gatewayResponse: gatewayResult.gatewayResponse || null,
        returnUrl: gatewayResult.returnUrl || null,
        callbackUrl: gatewayResult.callbackUrl || null,
      };
      payment.markModified('metadata');
      await payment.save();
      await payment.populate(['userId', 'planId']);

      return buildCheckoutResponse(payment, {
        gateway: provider,
        paymentUrl: gatewayResult.paymentUrl,
        message: provider === 'vnpay'
          ? 'Đã tạo link thanh toán VNPAY'
          : 'Đã tạo link thanh toán ZaloPay',
      });
    } catch (error) {
      await markPaymentFailed(payment, error.message, {
        gateway: provider,
      });
      throw error;
    }
  }

  if (['momo', 'visa'].includes(method)) {
    const payment = await createPaymentRecord({
      userId,
      plan,
      amount,
      method,
      provider: 'mock',
      billingCycle,
      status: 'pending',
      metadata: {
        note: `Mock immediate payment for ${method}`,
      },
    });

    await activatePayment(payment, {
      provider: 'mock',
      providerTransactionId: '',
      providerPayload: {
        note: `Mock immediate payment for ${method}`,
      },
    });

    return buildCheckoutResponse(payment, {
      gateway: 'mock',
      message: `Thanh toán demo thành công qua ${METHOD_LABELS[method] || method}`,
    });
  }

  const payment = await createPaymentRecord({
    userId,
    plan,
    amount,
    method,
    provider: 'manual',
    billingCycle,
    metadata: {
      note: 'Pending manual payment',
    },
  });

  await payment.populate(['userId', 'planId']);

  return buildCheckoutResponse(payment, {
    gateway: 'manual',
    message: 'Đã tạo hóa đơn, chờ xác nhận thanh toán',
  });
}

async function findPaymentByInvoiceNo(invoiceNo) {
  if (!invoiceNo) return null;
  return Payment.findOne({ invoiceNo })
    .populate('userId')
    .populate('planId')
    .populate('subscriptionId');
}

async function findPaymentByGatewayTransaction(gatewayTransactionId) {
  if (!gatewayTransactionId) return null;
  return Payment.findOne({ 'metadata.gatewayTransactionId': gatewayTransactionId })
    .populate('userId')
    .populate('planId')
    .populate('subscriptionId');
}

function isVnpayPaymentSuccessful(params) {
  return params.vnp_ResponseCode === '00'
    && (!params.vnp_TransactionStatus || params.vnp_TransactionStatus === '00');
}

async function handleVnpayGatewayResponse(query = {}) {
  const verification = paymentGatewayService.verifyVnpayReturn(query);
  const params = verification.params;
  const invoiceNo = params.vnp_TxnRef;
  const payment = await findPaymentByInvoiceNo(invoiceNo);

  if (!payment) {
    return {
      gateway: 'vnpay',
      invoiceNo,
      valid: verification.valid,
      found: false,
      success: false,
      ipnCode: '01',
      message: 'Order not found',
    };
  }

  if (!verification.valid) {
    return {
      gateway: 'vnpay',
      invoiceNo,
      valid: false,
      found: true,
      success: false,
      payment: serializePayment(payment),
      ipnCode: '97',
      message: 'Invalid checksum',
    };
  }

  if (Number(params.vnp_Amount) !== Math.round(payment.amount) * 100) {
    return {
      gateway: 'vnpay',
      invoiceNo,
      valid: true,
      found: true,
      success: false,
      payment: serializePayment(payment),
      ipnCode: '04',
      message: 'Invalid amount',
    };
  }

  const providerPayload = {
    vnpay: params,
    gatewayResponseCode: params.vnp_ResponseCode,
  };

  if (isVnpayPaymentSuccessful(params)) {
    const updatedPayment = await activatePayment(payment, {
      provider: 'vnpay',
      providerTransactionId: params.vnp_TransactionNo || params.vnp_BankTranNo || params.vnp_TxnRef,
      providerPayload,
    });

    return {
      gateway: 'vnpay',
      invoiceNo,
      valid: true,
      found: true,
      success: true,
      payment: serializePayment(updatedPayment),
      ipnCode: '00',
      message: 'Confirm success',
    };
  }

  const failedPayment = await markPaymentFailed(payment, `VNPAY response ${params.vnp_ResponseCode}`, providerPayload);
  return {
    gateway: 'vnpay',
    invoiceNo,
    valid: true,
    found: true,
    success: false,
    payment: serializePayment(failedPayment),
    ipnCode: '00',
    message: 'Confirm failed payment',
  };
}

async function handleVnpayReturn(query) {
  return handleVnpayGatewayResponse(query);
}

async function handleVnpayIpn(query) {
  const result = await handleVnpayGatewayResponse(query);
  return {
    result,
    response: {
      RspCode: result.ipnCode || '99',
      Message: result.message || 'Unknown error',
    },
  };
}

async function handleZalopayCallback(body = {}) {
  const verification = paymentGatewayService.verifyZalopayCallback(body);
  if (!verification.valid) {
    return {
      gateway: 'zalopay',
      success: false,
      response: { return_code: -1, return_message: 'Invalid MAC' },
    };
  }

  const data = verification.data;
  const appTransId = data.app_trans_id;
  const payment = await findPaymentByGatewayTransaction(appTransId);

  if (!payment) {
    return {
      gateway: 'zalopay',
      invoiceNo: data.app_trans_id,
      success: false,
      response: { return_code: 0, return_message: 'Payment not found' },
    };
  }

  if (Number(data.amount) !== Math.round(payment.amount)) {
    return {
      gateway: 'zalopay',
      invoiceNo: payment.invoiceNo,
      success: false,
      payment: serializePayment(payment),
      response: { return_code: 0, return_message: 'Invalid amount' },
    };
  }

  const updatedPayment = await activatePayment(payment, {
    provider: 'zalopay',
    providerTransactionId: String(data.zp_trans_id || appTransId),
    providerPayload: {
      zalopayCallback: data,
    },
  });

  return {
    gateway: 'zalopay',
    invoiceNo: updatedPayment.invoiceNo,
    success: true,
    payment: serializePayment(updatedPayment),
    response: { return_code: 1, return_message: 'success' },
  };
}

async function handleZalopayReturn(query = {}) {
  const appTransId = query.app_trans_id || query.apptransid || query.appTransId;
  const payment = await findPaymentByGatewayTransaction(appTransId);

  if (!payment) {
    return {
      gateway: 'zalopay',
      invoiceNo: null,
      success: false,
      pending: true,
      message: 'Waiting for ZaloPay callback',
    };
  }

  if (payment.status === 'pending') {
    try {
      const gatewayResult = await paymentGatewayService.queryZalopayOrder(appTransId);
      if (Number(gatewayResult.return_code) === 1) {
        const updatedPayment = await activatePayment(payment, {
          provider: 'zalopay',
          providerTransactionId: String(gatewayResult.zp_trans_id || appTransId),
          providerPayload: { zalopayQuery: gatewayResult },
        });
        return {
          gateway: 'zalopay',
          invoiceNo: updatedPayment.invoiceNo,
          success: true,
          payment: serializePayment(updatedPayment),
        };
      }
    } catch (error) {
      return {
        gateway: 'zalopay',
        invoiceNo: payment.invoiceNo,
        success: false,
        pending: true,
        payment: serializePayment(payment),
        message: error.message,
      };
    }
  }

  return {
    gateway: 'zalopay',
    invoiceNo: payment.invoiceNo,
    success: payment.status === 'success',
    pending: payment.status === 'pending',
    payment: serializePayment(payment),
  };
}

function buildPaymentRedirectUrl(result) {
  let outcome = 'failed';
  if (result.success) outcome = 'success';
  if (result.pending) outcome = 'pending';

  return paymentGatewayService.buildFrontendPaymentResultUrl({
    gateway: result.gateway || 'payment',
    outcome,
    invoiceNo: result.invoiceNo,
  });
}

async function listPayments(query = {}) {
  const filter = {};
  if (query.status && query.status !== 'all') filter.status = query.status;

  const payments = await Payment.find(filter)
    .populate('userId')
    .populate('planId')
    .sort({ createdAt: -1 })
    .limit(200);

  return payments.map(serializePayment);
}

async function getRevenueData() {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, index) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return {
      key: `${d.getFullYear()}-${d.getMonth() + 1}`,
      month: `T${d.getMonth() + 1}`,
      year: d.getFullYear(),
      monthNumber: d.getMonth() + 1,
    };
  });
  const first = new Date(months[0].year, months[0].monthNumber - 1, 1);

  const rows = await Payment.aggregate([
    { $match: { status: 'success', paidAt: { $gte: first } } },
    {
      $group: {
        _id: { year: { $year: '$paidAt' }, month: { $month: '$paidAt' } },
        amount: { $sum: '$amount' },
      },
    },
  ]);
  const amountMap = new Map(rows.map((row) => [`${row._id.year}-${row._id.month}`, row.amount]));

  return months.map((item) => ({
    month: item.month,
    revenue: Number(((amountMap.get(item.key) || 0) / 1000000).toFixed(1)),
  }));
}

async function getPaymentStats() {
  const monthStart = startOfMonth();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [monthlyRevenueRows, todayTransactions, totalTransactions, successTransactions] = await Promise.all([
    Payment.aggregate([
      { $match: { status: 'success', paidAt: { $gte: monthStart } } },
      { $group: { _id: null, amount: { $sum: '$amount' } } },
    ]),
    Payment.countDocuments({ createdAt: { $gte: todayStart } }),
    Payment.countDocuments(),
    Payment.countDocuments({ status: 'success' }),
  ]);

  return {
    monthlyRevenue: monthlyRevenueRows[0]?.amount || 0,
    todayTransactions,
    successRate: totalTransactions ? Math.round((successTransactions / totalTransactions) * 1000) / 10 : 0,
    totalTransactions,
  };
}

async function ensureUserExists(userId) {
  const user = await AccountUser.findById(userId);
  if (!user) throw createError(404, 'User not found');
  return user;
}

module.exports = {
  METHOD_LABELS,
  serializePlan,
  serializePayment,
  listPlans,
  createPlan,
  updatePlan,
  softDeletePlan,
  restorePlan,
  permanentDeletePlan,
  ensureGenerateModelAllowed,
  ensureGenerateQuotaAvailable,
  calculateGenerateQuotaUnits,
  estimateGenerateQuotaUnits,
  getGenerateUsageSummary,
  getMyBilling,
  createMockCheckout,
  handleVnpayReturn,
  handleVnpayIpn,
  handleZalopayCallback,
  handleZalopayReturn,
  buildPaymentRedirectUrl,
  listPayments,
  getRevenueData,
  getPaymentStats,
  ensureUserExists,
  slugify,
};
