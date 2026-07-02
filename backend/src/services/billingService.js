const mongoose = require('mongoose');

const AccountUser = require('../models/AccountUser');
const Payment = require('../models/Payment');
const Plan = require('../models/Plan');
const Subscription = require('../models/Subscription');
const UsageLog = require('../models/UsageLog');
const {
  ALL_GENERATOR_MODEL_ACCESS,
  getGenerateModelAccessId,
  isGenerateModelAccessDisabled,
  normalizeAllowedModels,
} = require('../config/generatorModels');
const createError = require('../utils/createError');
const paymentGatewayService = require('./paymentGatewayService');
const systemSettingsService = require('./systemSettingsService');

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

const CUSTOMER_PLAN_SLUGS = ['free', 'pro', 'business'];
const CHECKOUT_PLAN_SLUGS = ['free', 'pro', 'business'];
const CUSTOMER_ROLE_BY_PLAN_SLUG = {
  free: 'free_customer',
  pro: 'pro_customer',
  business: 'business_customer',
};
const PLAN_SLUG_BY_CUSTOMER_ROLE = Object.fromEntries(
  Object.entries(CUSTOMER_ROLE_BY_PLAN_SLUG).map(([slug, role]) => [role, slug]),
);

function getPlanRank(plan) {
  const slug = String(plan?.slug || '').toLowerCase();
  const index = CUSTOMER_PLAN_SLUGS.indexOf(slug);
  if (index !== -1) return index;

  const sortOrder = Number(plan?.sortOrder);
  if (Number.isFinite(sortOrder) && sortOrder > 0) return sortOrder;

  const price = Number(plan?.priceMonthly ?? plan?.price ?? 0);
  return Number.isFinite(price) ? price : 0;
}

function isSubscriptionCurrentlyUsable(subscription) {
  if (!subscription || !['active', 'trialing', 'past_due'].includes(subscription.status)) return false;
  if (!subscription.currentPeriodEnd) return true;
  return new Date(subscription.currentPeriodEnd).getTime() > Date.now();
}

function getPlanChangeDirection(currentPlan, targetPlan) {
  const currentRank = getPlanRank(currentPlan);
  const targetRank = getPlanRank(targetPlan);

  if (targetRank > currentRank) return 'upgrade';
  if (targetRank < currentRank) return 'downgrade';
  return 'same';
}

function getCustomerRoleForPlan(plan) {
  return CUSTOMER_ROLE_BY_PLAN_SLUG[String(plan?.slug || '').toLowerCase()] || null;
}

function getPlanSlugForCustomerRole(customerRole) {
  return PLAN_SLUG_BY_CUSTOMER_ROLE[String(customerRole || '').trim().toLowerCase()] || null;
}

async function syncCustomerRoleForPlan(userId, plan) {
  const customerRole = getCustomerRoleForPlan(plan);
  if (!customerRole) return;

  await AccountUser.updateOne(
    { _id: userId },
    { $set: { customerRole } },
  );
}

async function syncSubscriptionForCustomerRole(userId, customerRole, options = {}) {
  const planSlug = getPlanSlugForCustomerRole(customerRole);
  if (!planSlug) return null;

  const plan = await Plan.findOne({
    slug: planSlug,
    isDeleted: { $ne: true },
    isActive: true,
  });
  if (!plan) throw createError(404, `Plan for customer role ${customerRole} not found`);

  const normalizedCustomerRole = CUSTOMER_ROLE_BY_PLAN_SLUG[planSlug];
  let subscription = await getCurrentSubscription(userId);
  const alreadyOnPlan = subscription && toId(subscription.planId) === plan._id.toString();

  if (alreadyOnPlan && isSubscriptionCurrentlyUsable(subscription)) {
    if (options.updateAccountRole !== false) {
      await AccountUser.updateOne(
        { _id: userId },
        { $set: { customerRole: normalizedCustomerRole } },
      );
    }
    return subscription;
  }

  const now = new Date();
  const currentPeriodEnd = Object.prototype.hasOwnProperty.call(options, 'currentPeriodEnd')
    ? options.currentPeriodEnd
    : null;
  const billingCycle = options.billingCycle || 'monthly';
  const providerSubscriptionId = options.providerSubscriptionId || '';

  if (!subscription) {
    subscription = await Subscription.create({
      userId,
      planId: plan._id,
      status: 'active',
      billingCycle,
      currentPeriodStart: now,
      currentPeriodEnd,
      cancelAtPeriodEnd: false,
      provider: 'manual',
      providerSubscriptionId,
    });
  } else {
    subscription.planId = plan._id;
    subscription.status = 'active';
    subscription.billingCycle = billingCycle;
    subscription.currentPeriodStart = now;
    subscription.currentPeriodEnd = currentPeriodEnd;
    subscription.cancelAtPeriodEnd = false;
    subscription.provider = 'manual';
    subscription.providerSubscriptionId = providerSubscriptionId;
    await subscription.save();
  }

  if (options.updateAccountRole !== false) {
    await AccountUser.updateOne(
      { _id: userId },
      { $set: { customerRole: normalizedCustomerRole } },
    );
  }

  await subscription.populate('planId');
  return subscription;
}

async function assertCheckoutPlanChangeAllowed(userId, targetPlan) {
  const subscription = await getCurrentSubscription(userId);
  if (!isSubscriptionCurrentlyUsable(subscription)) return null;

  const currentPlan = subscription.planId;
  if (!currentPlan) return null;

  const direction = getPlanChangeDirection(currentPlan, targetPlan);
  if (direction === 'upgrade') return { subscription, currentPlan, direction };

  if (direction === 'same') {
    throw createError(409, 'Gói này đang được áp dụng cho tài khoản của bạn', undefined, {
      code: 'PLAN_ALREADY_ACTIVE',
      currentPlan: serializePlan(currentPlan),
      requestedPlan: serializePlan(targetPlan),
    });
  }

  throw createError(409, 'Không thể thanh toán gói thấp hơn gói hiện tại. Vui lòng dùng chức năng đổi gói/hạ gói riêng nếu cần.', undefined, {
    code: 'PLAN_DOWNGRADE_NOT_ALLOWED',
    currentPlan: serializePlan(currentPlan),
    requestedPlan: serializePlan(targetPlan),
  });
}

function toId(value) {
  if (!value) return null;
  if (value._id) return value._id.toString();
  return value.toString();
}

const DEFAULT_PLAN_MODEL_ACCESS = {
  free: ['gemini-flash-lite'],
  pro: ALL_GENERATOR_MODEL_ACCESS,
  business: ALL_GENERATOR_MODEL_ACCESS,
};

function getPlanAllowedModels(plan) {
  const allowedModels = normalizeAllowedModels(plan?.allowedModels || []);
  if (allowedModels.length > 0) return allowedModels;

  const slug = String(plan?.slug || '').trim().toLowerCase();
  return normalizeAllowedModels(DEFAULT_PLAN_MODEL_ACCESS[slug] || []);
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

function calculateYearlyPrice(priceMonthly) {
  const numeric = Number(priceMonthly);
  if (!Number.isFinite(numeric)) return 0;
  if (numeric <= 0) return numeric;
  return Math.round(numeric * 10);
}

function calculateWeeklyQuota(apiCallsFiveHours) {
  const numeric = Number(apiCallsFiveHours);
  if (!Number.isFinite(numeric)) return 0;
  if (numeric <= 0) return numeric;
  return Math.floor(numeric * 24 * 7 / 5);
}

function normalizePlanPayload(payload = {}, existing = null) {
  const hasMonthlyPriceInput = payload.priceMonthly !== undefined
    || payload.monthlyPrice !== undefined
    || payload.price !== undefined;
  const hasYearlyPriceInput = payload.priceYearly !== undefined || payload.yearlyPrice !== undefined;
  const priceMonthly = normalizeLimitValue(
    payload.priceMonthly ?? payload.monthlyPrice ?? payload.price,
    existing?.priceMonthly ?? 0,
  );
  const priceYearly = normalizeLimitValue(
    payload.priceYearly ?? payload.yearlyPrice,
    hasYearlyPriceInput || !hasMonthlyPriceInput
      ? existing?.priceYearly ?? calculateYearlyPrice(priceMonthly)
      : calculateYearlyPrice(priceMonthly),
  );
  const limits = { ...(existing?.limits?.toObject?.() || existing?.limits || {}) };
  const incomingLimits = payload.limits || {};
  const hasFiveHourQuotaInput = incomingLimits.apiCallsFiveHours !== undefined || payload.apiLimitFiveHours !== undefined;
  const hasWeeklyQuotaInput = incomingLimits.apiCallsWeekly !== undefined || payload.apiLimitWeekly !== undefined;

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
    hasWeeklyQuotaInput || !hasFiveHourQuotaInput
      ? limits.apiCallsWeekly ?? 0
      : calculateWeeklyQuota(limits.apiCallsFiveHours),
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
    allowedModels: getPlanAllowedModels(plan),
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
  const currentPeriodEnd = subscription.currentPeriodEnd || null;
  return {
    id: subscription._id.toString(),
    _id: subscription._id.toString(),
    userId: toId(subscription.userId),
    planId: toId(subscription.planId),
    plan: plan ? serializePlan(plan) : undefined,
    status: subscription.status,
    billingCycle: subscription.billingCycle,
    currentPeriodStart: subscription.currentPeriodStart,
    currentPeriodEnd,
    expiresAt: currentPeriodEnd,
    expiresAtLabel: formatDate(currentPeriodEnd),
    renewDate: formatDate(currentPeriodEnd),
    hasExpirationDate: Boolean(currentPeriodEnd),
    isExpired: currentPeriodEnd ? new Date(currentPeriodEnd).getTime() < Date.now() : false,
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
  filter.slug = { $in: CUSTOMER_PLAN_SLUGS };

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
  const freePlan = await Plan.findOne({ slug: 'free', isDeleted: { $ne: true } });
  if (freePlan) return freePlan;

  return Plan.findOne({ slug: { $in: CUSTOMER_PLAN_SLUGS }, isDeleted: { $ne: true } })
    .sort({ sortOrder: 1, priceMonthly: 1 });
}

async function ensureFreeSubscriptionForUser(userId) {
  const freePlan = await Plan.findOne({ slug: 'free', isDeleted: { $ne: true }, isActive: true });

  await AccountUser.updateOne(
    { _id: userId },
    { $set: { customerRole: CUSTOMER_ROLE_BY_PLAN_SLUG.free } },
  );

  if (!freePlan) return null;

  return syncSubscriptionForCustomerRole(userId, CUSTOMER_ROLE_BY_PLAN_SLUG.free, {
    billingCycle: 'monthly',
    currentPeriodEnd: null,
    updateAccountRole: false,
  });
}

async function getEffectivePlanForUser(userId) {
  const user = await AccountUser.findById(userId).select('customerRole');
  const planSlug = getPlanSlugForCustomerRole(user?.customerRole);
  if (planSlug) {
    const rolePlan = await Plan.findOne({
      slug: planSlug,
      isDeleted: { $ne: true },
      isActive: true,
    });
    if (rolePlan) return rolePlan;
  }

  const subscription = await getCurrentSubscription(userId);
  return subscription?.planId || await getFallbackPlan();
}

async function ensureGenerateModelAllowed(userId, payload = {}) {
  const plan = await getEffectivePlanForUser(userId);
  if (!plan) return null;

  const allowedModels = getPlanAllowedModels(plan);
  const requestedAccess = getGenerateModelAccessId(payload);
  if (isGenerateModelAccessDisabled(requestedAccess)) {
    throw createError(403, 'Model nay da bi tat va khong con nam trong cac goi dich vu', undefined, {
      code: 'MODEL_DISABLED',
      requestedModel: String(payload.model || ''),
      requestedAccess,
      allowedModels,
      plan: serializePlan(plan),
    });
  }

  if (allowedModels.length === 0) return plan;

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

function toValidDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function latestDate(...values) {
  return values.reduce((latest, value) => {
    const date = toValidDate(value);
    if (!date) return latest;
    return !latest || date > latest ? date : latest;
  }, null);
}

async function getEffectiveQuotaResetAt(userId) {
  const [quotaResetAt, user] = await Promise.all([
    systemSettingsService.getQuotaResetAt(),
    AccountUser.findById(userId).select('quotaResetAt').lean(),
  ]);

  return latestDate(quotaResetAt, user?.quotaResetAt);
}

async function getGenerateUsageSummary(userId, now = new Date()) {
  const quotaResetAt = await getEffectiveQuotaResetAt(userId);
  const resetDate = quotaResetAt ? new Date(quotaResetAt) : null;
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const fiveHoursStart = subtractHours(now, 5);
  const weekStart = subtractDays(now, 7);
  const effectiveMonthStart = resetDate && resetDate > monthStart ? resetDate : monthStart;
  const effectiveFiveHoursStart = resetDate && resetDate > fiveHoursStart ? resetDate : fiveHoursStart;
  const effectiveWeekStart = resetDate && resetDate > weekStart ? resetDate : weekStart;

  const [monthly, fiveHours, weekly] = await Promise.all([
    getUsageForWindow(userId, effectiveMonthStart, monthEnd),
    getUsageForWindow(userId, effectiveFiveHoursStart, now),
    getUsageForWindow(userId, effectiveWeekStart, now),
  ]);

  return {
    monthly,
    fiveHours,
    weekly,
    quotaResetAt,
    windows: {
      monthly: { start: effectiveMonthStart, end: monthEnd },
      fiveHours: { start: effectiveFiveHoursStart, end: now },
      weekly: { start: effectiveWeekStart, end: now },
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
  const user = await AccountUser.findById(userId).select('customerRole');
  const subscriptionPromise = getPlanSlugForCustomerRole(user?.customerRole)
    ? syncSubscriptionForCustomerRole(userId, user.customerRole, { updateAccountRole: false })
    : getCurrentSubscription(userId);
  const [subscription, usage, invoices] = await Promise.all([
    subscriptionPromise,
    getGenerateUsageSummary(userId),
    listUserPayments(userId, 10),
  ]);

  const plan = subscription?.planId || await getFallbackPlan();
  const serializedPlan = plan ? serializePlan(plan) : null;
  const expiresAt = subscription?.currentPeriodEnd || null;
  const limits = serializedPlan?.limits || {};

  return {
    customerRole: user?.customerRole || getCustomerRoleForPlan(plan) || CUSTOMER_ROLE_BY_PLAN_SLUG.free,
    currentPlan: {
      name: serializedPlan?.name || 'Free',
      slug: serializedPlan?.slug || 'free',
      price: serializedPlan?.monthlyPrice ?? 0,
      expiresAt,
      expiresAtLabel: formatDate(expiresAt),
      renewDate: formatDate(expiresAt),
      hasExpirationDate: Boolean(expiresAt),
      isExpired: expiresAt ? new Date(expiresAt).getTime() < Date.now() : false,
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
  return 'manual';
}

function getVietQrCheckoutAmount(defaultAmount) {
  const rawValue = process.env.VIETQR_TEST_AMOUNT;
  if (!rawValue) return defaultAmount;

  const value = Number(String(rawValue).replace(/[,_\s]/g, ''));
  if (!Number.isFinite(value) || value <= 0) return defaultAmount;

  return Math.round(value);
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
    await syncCustomerRoleForPlan(payment.userId, payment.planId);
    return payment;
  }

  const plan = await Plan.findById(payment.planId);
  if (!plan) {
    throw createError(404, 'Plan not found');
  }
  if (plan.isDeleted || !plan.isActive) {
    throw createError(409, 'Gói của hóa đơn này không còn khả dụng để kích hoạt', undefined, {
      code: 'PAYMENT_PLAN_NOT_AVAILABLE',
      requestedPlan: serializePlan(plan),
    });
  }

  await assertCheckoutPlanChangeAllowed(toId(payment.userId), plan);

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
  await syncCustomerRoleForPlan(payment.userId, plan);
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

async function confirmPaymentSuccess(id, adminId = null) {
  const lookup = mongoose.Types.ObjectId.isValid(id)
    ? { _id: id }
    : { invoiceNo: String(id || '').trim() };
  const payment = await Payment.findOne(lookup);

  if (!payment) {
    throw createError(404, 'Payment not found');
  }

  if (payment.status === 'success') {
    await payment.populate(['userId', 'planId', 'subscriptionId']);
    return serializePayment(payment);
  }

  if (payment.status !== 'pending') {
    throw createError(409, 'Chỉ có thể xác nhận giao dịch đang chờ xử lý');
  }

  if (payment.method !== 'vietqr' && payment.provider !== 'vietqr') {
    throw createError(400, 'Chỉ hỗ trợ xác nhận thủ công giao dịch VietQR');
  }

  const updatedPayment = await activatePayment(payment, {
    provider: 'vietqr',
    providerTransactionId: `admin-confirm-${Date.now()}`,
    providerPayload: {
      adminConfirmation: {
        confirmedBy: adminId ? String(adminId) : null,
        confirmedAt: new Date().toISOString(),
        note: 'Manual payment confirmation from admin dashboard',
      },
    },
  });

  return serializePayment(updatedPayment);
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

async function createCheckout(userId, payload, req = {}) {
  const user = await ensureUserExists(userId);
  const plan = await findPlanOrThrow(payload.planId || payload.planSlug);
  if (!CHECKOUT_PLAN_SLUGS.includes(plan.slug)) {
    throw createError(404, 'Plan not found');
  }
  if (!plan.isActive) {
    throw createError(409, 'Gói này hiện không khả dụng để thanh toán', undefined, {
      code: 'PLAN_NOT_AVAILABLE',
      requestedPlan: serializePlan(plan),
    });
  }

  await assertCheckoutPlanChangeAllowed(userId, plan);

  const billingCycle = payload.billingCycle === 'yearly' ? 'yearly' : 'monthly';
  const planAmount = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
  let amount = planAmount;

  if (planAmount < 0) {
    throw createError(400, 'Gói này cần liên hệ tư vấn để kích hoạt');
  }

  const method = normalizePaymentMethod(payload.method);
  const provider = getPaymentProvider(method);
  const isGateway = method === 'vnpay' || method === 'zalo';
  const now = new Date();
  const periodEnd = addMonths(now, getBillingCycleMonths(billingCycle));

  if (method === 'vietqr' && planAmount > 0) {
    amount = getVietQrCheckoutAmount(planAmount);
  }

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
        ...(amount !== planAmount ? {
          originalPlanAmount: planAmount,
          vietqrTestAmount: amount,
        } : {}),
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
      provider: 'manual',
      billingCycle,
      status: 'pending',
      metadata: {
        note: `${METHOD_LABELS[method] || method} gateway is not configured; awaiting manual confirmation`,
      },
    });

    await payment.populate(['userId', 'planId']);

    return buildCheckoutResponse(payment, {
      gateway: 'manual',
      message: 'Da tao hoa don, cho xac nhan thanh toan thu cong',
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

function getZalopayGatewayFailureMessage(gatewayResult = {}) {
  return gatewayResult.sub_return_message
    || gatewayResult.return_message
    || `ZaloPay response ${gatewayResult.return_code ?? 'unknown'}`;
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
  const invoiceNo = query.invoice || query.invoiceNo || query.invoice_no;
  const payment = await findPaymentByGatewayTransaction(appTransId) || await findPaymentByInvoiceNo(invoiceNo);

  if (!payment) {
    return {
      gateway: 'zalopay',
      invoiceNo: invoiceNo || null,
      success: false,
      pending: true,
      message: 'Waiting for ZaloPay callback',
    };
  }

  const resolvedAppTransId = appTransId || payment.metadata?.gatewayTransactionId;

  if (payment.status === 'pending') {
    try {
      const gatewayResult = await paymentGatewayService.queryZalopayOrder(resolvedAppTransId);
      if (Number(gatewayResult.return_code) === 1) {
        if (Number(gatewayResult.amount) !== Math.round(payment.amount)) {
          const failedPayment = await markPaymentFailed(payment, 'Invalid ZaloPay amount', {
            zalopayQuery: gatewayResult,
          });
          return {
            gateway: 'zalopay',
            invoiceNo: failedPayment.invoiceNo,
            success: false,
            payment: serializePayment(failedPayment),
            message: 'Invalid amount',
          };
        }

        const updatedPayment = await activatePayment(payment, {
          provider: 'zalopay',
          providerTransactionId: String(gatewayResult.zp_trans_id || resolvedAppTransId),
          providerPayload: { zalopayQuery: gatewayResult },
        });
        return {
          gateway: 'zalopay',
          invoiceNo: updatedPayment.invoiceNo,
          success: true,
          payment: serializePayment(updatedPayment),
        };
      }

      if (Number(gatewayResult.return_code) === 2) {
        const failedPayment = await markPaymentFailed(payment, getZalopayGatewayFailureMessage(gatewayResult), {
          zalopayQuery: gatewayResult,
        });
        return {
          gateway: 'zalopay',
          invoiceNo: failedPayment.invoiceNo,
          success: false,
          payment: serializePayment(failedPayment),
          message: getZalopayGatewayFailureMessage(gatewayResult),
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
  getEffectivePlanForUser,
  ensureFreeSubscriptionForUser,
  syncSubscriptionForCustomerRole,
  getGenerateUsageSummary,
  getMyBilling,
  createCheckout,
  handleVnpayReturn,
  handleVnpayIpn,
  handleZalopayCallback,
  handleZalopayReturn,
  buildPaymentRedirectUrl,
  confirmPaymentSuccess,
  listPayments,
  getRevenueData,
  getPaymentStats,
  ensureUserExists,
  slugify,
};
