const AccountUser = require('../models/AccountUser');
const Content = require('../models/Content');
const UsageLog = require('../models/UsageLog');
const adminContentService = require('./adminContentService');
const auditLogService = require('./auditLogService');
const {
  buildModelDisplayNameMap,
  resolveModelDisplayName,
} = require('../utils/modelDisplayName');

const USAGE_TIMEZONE = 'Asia/Ho_Chi_Minh';

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfDay(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function startOfYear(date) {
  return new Date(date.getFullYear(), 0, 1);
}

function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function addYears(date, amount) {
  return new Date(date.getFullYear() + amount, 0, 1);
}

function getLastSixMonths() {
  const current = startOfMonth(new Date());
  return Array.from({ length: 6 }, (_, index) => addMonths(current, index - 5));
}

async function countByMonth(Model, filter, monthStart) {
  return Model.countDocuments({
    ...filter,
    createdAt: {
      $gte: monthStart,
      $lt: addMonths(monthStart, 1),
    },
  });
}

async function buildMonthlyData() {
  const months = getLastSixMonths();
  const rows = await Promise.all(months.map(async (month) => {
    const [users, copies] = await Promise.all([
      countByMonth(AccountUser, { isDeleted: { $ne: true } }, month),
      countByMonth(Content, { isDeleted: { $ne: true } }, month),
    ]);

    return {
      name: `T${month.getMonth() + 1}`,
      month: month.toISOString(),
      users,
      copies,
    };
  }));

  return rows;
}

async function buildContentTypeData() {
  const rows = await Content.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    { $group: { _id: '$type', value: { $sum: 1 } } },
    { $sort: { value: -1 } },
    { $limit: 6 },
  ]);

  return rows.map((row) => ({
    name: row._id || 'content',
    value: row.value,
  }));
}

async function getTokenSummary() {
  const rows = await UsageLog.aggregate([
    {
      $group: {
        _id: null,
        totalTokens: { $sum: '$totalTokens' },
        promptTokens: { $sum: '$promptTokens' },
        completionTokens: { $sum: '$completionTokens' },
      },
    },
  ]);

  return rows[0] || { totalTokens: 0, promptTokens: 0, completionTokens: 0 };
}

function quotaUnitsExpression() {
  return {
    $cond: [
      { $gt: ['$quotaUnits', 0] },
      '$quotaUnits',
      { $max: [1, { $ceil: { $divide: ['$totalTokens', 1000] } }] },
    ],
  };
}

function usageGroupFields(extra = {}) {
  return {
    ...extra,
    count: { $sum: 1 },
    promptTokens: { $sum: '$promptTokens' },
    completionTokens: { $sum: '$completionTokens' },
    totalTokens: { $sum: '$totalTokens' },
    quotaUnits: { $sum: quotaUnitsExpression() },
    lastUsedAt: { $max: '$createdAt' },
  };
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatMonthKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function formatDayLabel(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}

function formatMonthLabel(date) {
  return `T${date.getMonth() + 1}/${date.getFullYear()}`;
}

function emptyUsagePoint(point) {
  return {
    ...point,
    count: 0,
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    quotaUnits: 0,
  };
}

async function aggregateUsageTimeSeries({ points, firstDate, mongoFormat }) {
  const rows = await UsageLog.aggregate([
    { $match: { action: 'generate', createdAt: { $gte: firstDate } } },
    {
      $group: usageGroupFields({
        _id: {
          $dateToString: {
            format: mongoFormat,
            date: '$createdAt',
            timezone: USAGE_TIMEZONE,
          },
        },
      }),
    },
  ]);
  const rowMap = new Map(rows.map((row) => [row._id, row]));

  return points.map((point) => {
    const row = rowMap.get(point.key);
    if (!row) return emptyUsagePoint(point);
    return {
      ...point,
      count: row.count || 0,
      promptTokens: row.promptTokens || 0,
      completionTokens: row.completionTokens || 0,
      totalTokens: row.totalTokens || 0,
      quotaUnits: row.quotaUnits || 0,
    };
  });
}

async function getUsageTotals() {
  const rows = await UsageLog.aggregate([
    { $match: { action: 'generate' } },
    {
      $group: usageGroupFields({
        _id: null,
        users: { $addToSet: '$userId' },
      }),
    },
  ]);
  const row = rows[0];

  return {
    count: row?.count || 0,
    promptTokens: row?.promptTokens || 0,
    completionTokens: row?.completionTokens || 0,
    totalTokens: row?.totalTokens || 0,
    quotaUnits: row?.quotaUnits || 0,
    activeUsers: row?.users?.length || 0,
    lastUsedAt: row?.lastUsedAt || null,
  };
}

async function getUsageByModel() {
  const rows = await UsageLog.aggregate([
    { $match: { action: 'generate' } },
    {
      $group: usageGroupFields({
        _id: { $ifNull: ['$model', 'unknown'] },
        users: { $addToSet: '$userId' },
      }),
    },
    { $sort: { count: -1, totalTokens: -1 } },
    { $limit: 12 },
  ]);
  const modelDisplayNames = await buildModelDisplayNameMap(rows.map(row => row._id));

  return rows.map((row) => ({
    model: row._id || 'unknown',
    modelDisplayName: resolveModelDisplayName(row._id, modelDisplayNames),
    count: row.count || 0,
    promptTokens: row.promptTokens || 0,
    completionTokens: row.completionTokens || 0,
    totalTokens: row.totalTokens || 0,
    quotaUnits: row.quotaUnits || 0,
    users: row.users?.length || 0,
    lastUsedAt: row.lastUsedAt || null,
  }));
}

async function getUsageByUser() {
  const rows = await UsageLog.aggregate([
    { $match: { action: 'generate' } },
    {
      $group: usageGroupFields({
        _id: '$userId',
      }),
    },
    { $sort: { count: -1, totalTokens: -1 } },
    { $limit: 12 },
  ]);
  const userIds = rows.map(row => row._id).filter(Boolean);
  const accounts = await AccountUser.find({ _id: { $in: userIds } }).select('name email avatar status');
  const accountMap = new Map(accounts.map(account => [account._id.toString(), account]));

  return rows.map((row) => {
    const userId = row._id?.toString?.() || '';
    const account = accountMap.get(userId);

    return {
      userId,
      name: account?.name || 'Deleted user',
      email: account?.email || '',
      avatar: account?.avatar || '',
      status: account?.status || '',
      count: row.count || 0,
      promptTokens: row.promptTokens || 0,
      completionTokens: row.completionTokens || 0,
      totalTokens: row.totalTokens || 0,
      quotaUnits: row.quotaUnits || 0,
      lastUsedAt: row.lastUsedAt || null,
    };
  });
}

async function getUsageByDay() {
  const today = startOfDay(new Date());
  const firstDate = addDays(today, -13);
  const points = Array.from({ length: 14 }, (_, index) => {
    const date = addDays(firstDate, index);
    const key = formatDateKey(date);
    return { key, date: key, label: formatDayLabel(date) };
  });

  return aggregateUsageTimeSeries({ points, firstDate, mongoFormat: '%Y-%m-%d' });
}

async function getUsageByMonth() {
  const current = startOfMonth(new Date());
  const firstDate = addMonths(current, -11);
  const points = Array.from({ length: 12 }, (_, index) => {
    const date = addMonths(firstDate, index);
    const key = formatMonthKey(date);
    return { key, month: key, label: formatMonthLabel(date) };
  });

  return aggregateUsageTimeSeries({ points, firstDate, mongoFormat: '%Y-%m' });
}

async function getUsageByYear() {
  const current = startOfYear(new Date());
  const firstDate = addYears(current, -4);
  const points = Array.from({ length: 5 }, (_, index) => {
    const date = addYears(firstDate, index);
    const key = String(date.getFullYear());
    return { key, year: key, label: key };
  });

  return aggregateUsageTimeSeries({ points, firstDate, mongoFormat: '%Y' });
}

async function buildUsageReport() {
  const [totals, byModel, byUser, byDay, byMonth, byYear] = await Promise.all([
    getUsageTotals(),
    getUsageByModel(),
    getUsageByUser(),
    getUsageByDay(),
    getUsageByMonth(),
    getUsageByYear(),
  ]);

  return {
    totals,
    byModel,
    byUser,
    byDay,
    byMonth,
    byYear,
  };
}

async function getStats() {
  const [
    totalUsers,
    activeUsers,
    lockedUsers,
    totalContents,
    deletedContents,
    totalUsage,
    tokenSummary,
    monthlyData,
    contentTypeData,
    recentContents,
    auditSummary,
    usageReport,
  ] = await Promise.all([
    AccountUser.countDocuments({ isDeleted: { $ne: true } }),
    AccountUser.countDocuments({ status: 'active', isDeleted: { $ne: true } }),
    AccountUser.countDocuments({ status: 'locked', isDeleted: { $ne: true } }),
    Content.countDocuments({ isDeleted: { $ne: true } }),
    Content.countDocuments({ isDeleted: true }),
    UsageLog.countDocuments({}),
    getTokenSummary(),
    buildMonthlyData(),
    buildContentTypeData(),
    Content.find({ isDeleted: { $ne: true } })
      .populate('userId', 'name email status avatar')
      .sort({ createdAt: -1 })
      .limit(5),
    auditLogService.getAuditSummary(),
    buildUsageReport(),
  ]);

  const serializedRecentContents = await adminContentService.serializeContents(recentContents);

  return {
    stats: {
      totalUsers,
      activeUsers,
      lockedUsers,
      totalContents,
      deletedContents,
      totalUsage,
      totalTokens: tokenSummary.totalTokens || 0,
      promptTokens: tokenSummary.promptTokens || 0,
      completionTokens: tokenSummary.completionTokens || 0,
      auditEventsToday: auditSummary.today,
      warningsToday: auditSummary.warnings,
      errorsToday: auditSummary.errors,
    },
    monthlyData,
    contentTypeData,
    recentContents: serializedRecentContents,
    usageReport,
  };
}

module.exports = {
  getStats,
};
