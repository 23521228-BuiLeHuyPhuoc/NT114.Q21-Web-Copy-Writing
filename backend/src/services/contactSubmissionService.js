const ContactSubmission = require('../models/ContactSubmission');
const createError = require('../utils/createError');

function toId(value) {
  if (!value) return null;
  if (value._id) return value._id.toString();
  return value.toString();
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return String(forwarded).split(',')[0].trim();
  return req.ip || req.socket?.remoteAddress || '';
}

function normalizePage(query = {}) {
  return Math.max(1, Number(query.page || 1));
}

function normalizeLimit(query = {}) {
  return Math.min(100, Math.max(1, Number(query.limit || 20)));
}

function serializeSubmission(item) {
  const handledBy = item.handledByAdminId;
  return {
    id: item._id.toString(),
    _id: item._id.toString(),
    name: item.name,
    email: item.email,
    company: item.company || '',
    topic: item.topic,
    message: item.message,
    status: item.status,
    adminNote: item.adminNote || '',
    handledByAdminId: toId(item.handledByAdminId),
    handledBy: handledBy && handledBy.email ? {
      id: toId(handledBy),
      name: handledBy.name,
      email: handledBy.email,
      adminRole: handledBy.adminRole,
    } : null,
    handledAt: item.handledAt,
    ip: item.ip || '',
    userAgent: item.userAgent || '',
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function buildFilter(query = {}) {
  const filter = {};

  if (query.status && query.status !== 'all') filter.status = query.status;
  if (query.topic && query.topic !== 'all') filter.topic = query.topic;

  if (query.dateFrom || query.dateTo) {
    filter.createdAt = {};
    if (query.dateFrom) filter.createdAt.$gte = new Date(query.dateFrom);
    if (query.dateTo) {
      const end = new Date(query.dateTo);
      end.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
  }

  if (query.search) {
    const regex = new RegExp(escapeRegExp(query.search), 'i');
    filter.$or = [
      { name: regex },
      { email: regex },
      { company: regex },
      { message: regex },
      { adminNote: regex },
    ];
  }

  return filter;
}

async function createSubmission(payload, req = {}) {
  const item = await ContactSubmission.create({
    name: payload.name,
    email: payload.email,
    company: payload.company || '',
    topic: payload.topic || 'other',
    message: payload.message,
    ip: getIp(req),
    userAgent: String(req.headers?.['user-agent'] || '').slice(0, 500),
  });

  return serializeSubmission(item);
}

async function listSubmissions(query = {}) {
  const page = normalizePage(query);
  const limit = normalizeLimit(query);
  const filter = buildFilter(query);

  const [totalItems, statusCounts, items] = await Promise.all([
    ContactSubmission.countDocuments(filter),
    ContactSubmission.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    ContactSubmission.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('handledByAdminId', 'name email adminRole'),
  ]);

  return {
    items: items.map(serializeSubmission),
    stats: {
      total: statusCounts.reduce((sum, row) => sum + row.count, 0),
      new: statusCounts.find(row => row._id === 'new')?.count || 0,
      inProgress: statusCounts.find(row => row._id === 'in_progress')?.count || 0,
      resolved: statusCounts.find(row => row._id === 'resolved')?.count || 0,
      spam: statusCounts.find(row => row._id === 'spam')?.count || 0,
      archived: statusCounts.find(row => row._id === 'archived')?.count || 0,
    },
    pagination: {
      page,
      limit,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / limit)),
    },
  };
}

async function getSubmission(id) {
  const item = await ContactSubmission.findById(id).populate('handledByAdminId', 'name email adminRole');
  if (!item) throw createError(404, 'Contact submission not found');
  return serializeSubmission(item);
}

async function updateSubmission(id, payload = {}, adminId = null) {
  const item = await ContactSubmission.findById(id);
  if (!item) throw createError(404, 'Contact submission not found');

  if (payload.status !== undefined) {
    item.status = payload.status;
    item.handledByAdminId = adminId || item.handledByAdminId;
    item.handledAt = new Date();
  }

  if (payload.adminNote !== undefined) {
    item.adminNote = payload.adminNote;
  }

  await item.save();
  await item.populate('handledByAdminId', 'name email adminRole');
  return serializeSubmission(item);
}

async function deleteSubmission(id) {
  const item = await ContactSubmission.findByIdAndDelete(id);
  if (!item) throw createError(404, 'Contact submission not found');
  return serializeSubmission(item);
}

module.exports = {
  createSubmission,
  deleteSubmission,
  getSubmission,
  listSubmissions,
  updateSubmission,
};
