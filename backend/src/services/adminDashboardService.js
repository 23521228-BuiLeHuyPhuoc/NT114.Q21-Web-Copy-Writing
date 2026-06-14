const AccountUser = require('../models/AccountUser');
const Content = require('../models/Content');
const UsageLog = require('../models/UsageLog');
const adminContentService = require('./adminContentService');
const auditLogService = require('./auditLogService');

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
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
  };
}

module.exports = {
  getStats,
};
