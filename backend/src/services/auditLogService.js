const AuditLog = require('../models/AuditLog');

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toId(value) {
  if (!value) return null;
  if (value._id) return value._id.toString();
  return value.toString();
}

function toTargetId(value) {
  if (value === null || value === undefined) return '';
  if (value._id) return value._id.toString();
  return String(value);
}

function getIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return String(forwarded).split(',')[0].trim();
  return req.ip || req.socket?.remoteAddress || '';
}

function actorFromRequest(req) {
  const account = req.auth?.account;
  return {
    actorId: account?._id || null,
    actorType: req.auth?.accountType || 'system',
    actorEmail: account?.email || '',
    actorRole: account?.adminRole || req.auth?.role || '',
    ip: getIp(req),
  };
}

function getDetails(log) {
  if (log.metadata?.details) return log.metadata.details;
  if (log.metadata?.message) return log.metadata.message;
  if (log.targetType) return `${log.action} ${log.targetType}`;
  return log.action;
}

function serializeAuditLog(log) {
  return {
    id: log._id.toString(),
    actorId: toId(log.actorId),
    actorType: log.actorType,
    actorEmail: log.actorEmail,
    actorRole: log.actorRole,
    action: log.action,
    targetType: log.targetType,
    targetId: toId(log.targetId),
    level: log.level,
    metadata: log.metadata || {},
    details: getDetails(log),
    user: log.actorEmail || log.actorType,
    role: log.actorRole || log.actorType,
    ip: log.ip,
    timestamp: log.createdAt,
    createdAt: log.createdAt,
    updatedAt: log.updatedAt,
  };
}

function buildFilter(query = {}) {
  const filter = {};

  if (query.level && query.level !== 'all') {
    filter.level = query.level;
  }

  if (query.search) {
    const regex = new RegExp(escapeRegExp(query.search), 'i');
    filter.$or = [
      { action: regex },
      { actorEmail: regex },
      { actorRole: regex },
      { targetType: regex },
      { targetId: regex },
      { ip: regex },
      { 'metadata.details': regex },
      { 'metadata.message': regex },
    ];
  }

  return filter;
}

async function listAuditLogs(query = {}) {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 100);
  const filter = buildFilter(query);

  const [totalItems, logs] = await Promise.all([
    AuditLog.countDocuments(filter),
    AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
  ]);

  return {
    items: logs.map(serializeAuditLog),
    pagination: {
      page,
      limit,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / limit)),
    },
  };
}

async function createAuditLog(payload) {
  const log = await AuditLog.create({
    ...payload,
    targetId: toTargetId(payload.targetId),
  });
  return serializeAuditLog(log);
}

async function createAdminAuditLog(req, payload) {
  try {
    return await createAuditLog({
      ...actorFromRequest(req),
      ...payload,
    });
  } catch (error) {
    console.warn(`Failed to create audit log: ${error.message}`);
    return null;
  }
}

async function getAuditSummary() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [today, warnings, errors] = await Promise.all([
    AuditLog.countDocuments({ createdAt: { $gte: startOfToday } }),
    AuditLog.countDocuments({ level: 'warning', createdAt: { $gte: startOfToday } }),
    AuditLog.countDocuments({ level: 'error', createdAt: { $gte: startOfToday } }),
  ]);

  return { today, warnings, errors };
}

module.exports = {
  serializeAuditLog,
  listAuditLogs,
  createAuditLog,
  createAdminAuditLog,
  getAuditSummary,
};
