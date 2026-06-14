const Content = require('../models/Content');
const createError = require('../utils/createError');
const auditLogService = require('./auditLogService');
const {
  buildModelDisplayNameMap,
  resolveModelDisplayName,
} = require('../utils/modelDisplayName');

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toId(value) {
  if (!value) return null;
  if (value._id) return value._id.toString();
  return value.toString();
}

function buildSearchFilter(search) {
  if (!search) return {};

  const regex = new RegExp(escapeRegExp(search), 'i');
  return {
    $or: [
      { title: regex },
      { prompt: regex },
      { outputText: regex },
      { type: regex },
      { tone: regex },
      { language: regex },
      { modelUsed: regex },
      { tags: regex },
    ],
  };
}

function serializeAdminUser(user) {
  if (!user) return null;
  return {
    id: toId(user._id),
    name: user.name,
    email: user.email,
    status: user.status,
    avatar: user.avatar,
  };
}

function serializeContent(content, modelDisplayNames = new Map()) {
  const modelUsed = content.modelUsed;

  return {
    id: toId(content._id),
    _id: toId(content._id),
    userId: toId(content.userId),
    user: serializeAdminUser(content.userId),
    projectId: toId(content.projectId),
    templateId: toId(content.templateId),
    title: content.title,
    prompt: content.prompt,
    outputText: content.outputText,
    type: content.type,
    tone: content.tone,
    language: content.language,
    modelUsed,
    modelDisplayName: resolveModelDisplayName(modelUsed, modelDisplayNames),
    tags: content.tags || [],
    isFavorite: Boolean(content.isFavorite),
    wordCount: content.wordCount || 0,
    isDeleted: Boolean(content.isDeleted),
    deletedAt: content.deletedAt,
    createdAt: content.createdAt,
    updatedAt: content.updatedAt,
  };
}

async function serializeContents(contents) {
  const modelDisplayNames = await buildModelDisplayNameMap(contents.map(content => content.modelUsed));
  return contents.map(content => serializeContent(content, modelDisplayNames));
}

async function serializeContentWithModelDisplayName(content) {
  const items = await serializeContents([content]);
  return items[0];
}

function buildFilter(query = {}) {
  const filter = {};

  if (query.deleted === true || query.deleted === 'true') {
    filter.isDeleted = true;
  } else {
    filter.isDeleted = { $ne: true };
  }

  Object.assign(filter, buildSearchFilter(query.search));

  if (query.userId) {
    filter.userId = query.userId;
  }

  return filter;
}

async function listContents(query = {}) {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 20);
  const filter = buildFilter(query);

  const [totalItems, contents] = await Promise.all([
    Content.countDocuments(filter),
    Content.find(filter)
      .populate('userId', 'name email status avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
  ]);

  return {
    items: await serializeContents(contents),
    pagination: {
      page,
      limit,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / limit)),
    },
  };
}

async function findContentOrThrow(id, includeDeleted = false) {
  const query = includeDeleted ? { _id: id } : { _id: id, isDeleted: { $ne: true } };
  const content = await Content.findOne(query).populate('userId', 'name email status avatar');

  if (!content) {
    throw createError(404, 'Content not found');
  }

  return content;
}

async function getContent(id) {
  const content = await findContentOrThrow(id, true);
  return serializeContentWithModelDisplayName(content);
}

async function updateContent(id, payload, req) {
  const content = await findContentOrThrow(id, true);

  if (payload.title !== undefined) content.title = payload.title.trim();
  if (payload.outputText !== undefined) content.outputText = payload.outputText;
  if (payload.type !== undefined) content.type = payload.type.trim();
  if (payload.tone !== undefined) content.tone = payload.tone;
  if (payload.language !== undefined) content.language = payload.language;
  if (payload.tags !== undefined) content.tags = payload.tags;
  if (payload.isFavorite !== undefined) content.isFavorite = payload.isFavorite;

  await content.save();

  await auditLogService.createAdminAuditLog(req, {
    action: 'admin.content.updated',
    targetType: 'content',
    targetId: content._id,
    level: 'info',
    metadata: {
      details: `Updated content ${content.title}`,
      title: content.title,
    },
  });

  return serializeContentWithModelDisplayName(content);
}

async function softDeleteContent(id, req) {
  const content = await findContentOrThrow(id);
  content.isDeleted = true;
  content.deletedAt = new Date();
  await content.save();

  await auditLogService.createAdminAuditLog(req, {
    action: 'admin.content.deleted',
    targetType: 'content',
    targetId: content._id,
    level: 'warning',
    metadata: {
      details: `Moved content ${content.title} to trash`,
      title: content.title,
    },
  });

  return serializeContentWithModelDisplayName(content);
}

async function restoreContent(id, req) {
  const content = await findContentOrThrow(id, true);
  content.isDeleted = false;
  content.deletedAt = null;
  await content.save();

  await auditLogService.createAdminAuditLog(req, {
    action: 'admin.content.restored',
    targetType: 'content',
    targetId: content._id,
    level: 'info',
    metadata: {
      details: `Restored content ${content.title}`,
      title: content.title,
    },
  });

  return serializeContentWithModelDisplayName(content);
}

async function permanentDeleteContent(id, req) {
  const content = await findContentOrThrow(id, true);
  await Content.deleteOne({ _id: content._id });

  await auditLogService.createAdminAuditLog(req, {
    action: 'admin.content.permanent_delete',
    targetType: 'content',
    targetId: content._id,
    level: 'error',
    metadata: {
      details: `Permanently deleted content ${content.title}`,
      title: content.title,
    },
  });
}

module.exports = {
  serializeContent,
  serializeContents,
  listContents,
  getContent,
  updateContent,
  softDeleteContent,
  restoreContent,
  permanentDeleteContent,
};
