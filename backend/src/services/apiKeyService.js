const crypto = require('crypto');

const ApiKey = require('../models/ApiKey');
const UsageLog = require('../models/UsageLog');
const createError = require('../utils/createError');

function hashKey(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function generatePlainKey() {
  return `cpk_live_${crypto.randomBytes(24).toString('base64url')}`;
}

function maskKey(apiKey) {
  return `${apiKey.keyPrefix}${'*'.repeat(20)}${apiKey.keySuffix}`;
}

function serializeApiKey(apiKey, plainKey = '') {
  return {
    id: apiKey._id.toString(),
    name: apiKey.name,
    key: plainKey || maskKey(apiKey),
    keyPrefix: apiKey.keyPrefix,
    keySuffix: apiKey.keySuffix,
    created: apiKey.createdAt,
    createdAt: apiKey.createdAt,
    lastUsed: apiKey.lastUsedAt || null,
    lastUsedAt: apiKey.lastUsedAt || null,
    calls: apiKey.calls || 0,
    status: apiKey.status,
    permissions: apiKey.permissions || [],
  };
}

function uniquePermissions(value) {
  const allowed = new Set(ApiKey.permissions);
  const permissions = Array.isArray(value) ? value : [];
  const normalized = permissions
    .map(item => String(item || '').trim())
    .filter(item => allowed.has(item));
  return Array.from(new Set(normalized.length ? normalized : ['generate']));
}

async function listKeys(userId) {
  const items = await ApiKey.find({ userId }).sort({ createdAt: -1 });
  return { items: items.map(item => serializeApiKey(item)) };
}

async function createKey(userId, payload) {
  const plainKey = generatePlainKey();
  const item = await ApiKey.create({
    userId,
    name: payload.name,
    keyHash: hashKey(plainKey),
    keyPrefix: plainKey.slice(0, 13),
    keySuffix: plainKey.slice(-6),
    permissions: uniquePermissions(payload.permissions),
  });

  return serializeApiKey(item, plainKey);
}

async function revokeKey(userId, id) {
  const item = await ApiKey.findOne({ _id: id, userId });
  if (!item) throw createError(404, 'API key not found');

  item.status = 'revoked';
  item.revokedAt = new Date();
  await item.save();

  return serializeApiKey(item);
}

function serializeUsageLog(log) {
  const content = log.contentId && typeof log.contentId === 'object' ? log.contentId : null;

  return {
    id: log._id.toString(),
    endpoint: log.action === 'generate' ? 'POST /api/contents/generate' : log.action,
    model: log.model || '-',
    status: log.status === 'success' ? 200 : 202,
    latency: '-',
    time: log.createdAt,
    tokens: log.totalTokens || 0,
    industry: content?.tags?.[0] || '-',
  };
}

async function listLogs(userId, query = {}) {
  const limit = Math.min(Math.max(Number(query.limit || 50), 1), 100);
  const items = await UsageLog.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('contentId');

  return { items: items.map(serializeUsageLog) };
}

module.exports = {
  listKeys,
  createKey,
  revokeKey,
  listLogs,
};
