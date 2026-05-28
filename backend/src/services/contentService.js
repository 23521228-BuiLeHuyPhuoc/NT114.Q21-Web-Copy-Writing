const Content = require('../models/Content');
const UsageLog = require('../models/UsageLog');
const aiService = require('./aiService');
const projectService = require('./projectService');
const templateService = require('./templateService');
const createError = require('../utils/createError');

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toId(value) {
  return value ? value.toString() : null;
}

function serializeContent(content) {
  return {
    id: content._id.toString(),
    _id: content._id.toString(),
    userId: toId(content.userId),
    projectId: toId(content.projectId),
    templateId: toId(content.templateId),
    title: content.title,
    prompt: content.prompt,
    outputText: content.outputText,
    type: content.type,
    tone: content.tone,
    language: content.language,
    modelUsed: content.modelUsed,
    tags: content.tags || [],
    isFavorite: Boolean(content.isFavorite),
    wordCount: content.wordCount || 0,
    isDeleted: Boolean(content.isDeleted),
    createdAt: content.createdAt,
    updatedAt: content.updatedAt,
  };
}

function serializeUsage(usage) {
  if (!usage) return null;

  return {
    id: usage._id.toString(),
    userId: toId(usage.userId),
    contentId: toId(usage.contentId),
    model: usage.model,
    promptTokens: usage.promptTokens,
    completionTokens: usage.completionTokens,
    totalTokens: usage.totalTokens,
    action: usage.action,
    status: usage.status,
    createdAt: usage.createdAt,
    updatedAt: usage.updatedAt,
  };
}

function baseUserFilter(userId) {
  return {
    userId,
    isDeleted: { $ne: true },
  };
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
      { tags: regex },
    ],
  };
}

async function listContents(userId, query) {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 10);
  const filter = {
    ...baseUserFilter(userId),
    ...buildSearchFilter(query.search),
  };

  if (query.projectId) {
    filter.projectId = query.projectId;
  }

  const [totalItems, contents] = await Promise.all([
    Content.countDocuments(filter),
    Content.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
  ]);

  return {
    items: contents.map(serializeContent),
    pagination: {
      page,
      limit,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / limit)),
    },
  };
}

async function findContentOrThrow(userId, id) {
  const content = await Content.findOne({
    ...baseUserFilter(userId),
    _id: id,
  });

  if (!content) {
    throw createError(404, 'Content not found');
  }

  return content;
}

async function getContent(userId, id) {
  const content = await findContentOrThrow(userId, id);
  return serializeContent(content);
}

async function createContent(userId, payload) {
  await projectService.ensureProjectBelongsToUser(userId, payload.projectId);

  const content = await Content.create({
    userId,
    projectId: payload.projectId || null,
    templateId: payload.templateId || null,
    title: payload.title,
    prompt: payload.prompt,
    outputText: payload.outputText,
    type: payload.type,
    tone: payload.tone || '',
    language: payload.language || 'vi',
    modelUsed: payload.modelUsed || payload.model || 'manual',
    tags: payload.tags || [],
  });

  return serializeContent(content);
}

async function updateContent(userId, id, payload) {
  const content = await findContentOrThrow(userId, id);

  if (payload.projectId !== undefined) {
    await projectService.ensureProjectBelongsToUser(userId, payload.projectId);
  }

  if (payload.title !== undefined) content.title = payload.title;
  if (payload.tags !== undefined) content.tags = payload.tags;
  if (payload.isFavorite !== undefined) content.isFavorite = payload.isFavorite;
  if (payload.projectId !== undefined) content.projectId = payload.projectId || null;

  await content.save();
  return serializeContent(content);
}

async function softDeleteContent(userId, id) {
  const content = await findContentOrThrow(userId, id);
  content.isDeleted = true;
  content.deletedAt = new Date();
  await content.save();
  return serializeContent(content);
}

function buildTitleFromOutput(type, outputText) {
  const firstLine = String(outputText || '')
    .split('\n')
    .map((line) => line.replace(/^#+\s*/, '').replace(/\*\*/g, '').trim())
    .find(Boolean);

  if (firstLine) {
    return firstLine.slice(0, 120);
  }

  return `${type || 'content'} - ${new Date().toLocaleString('vi-VN')}`;
}

function buildPromptWithTemplate(prompt, template) {
  if (!template) return prompt;

  return [
    `Template: ${template.name}`,
    '',
    'System prompt:',
    template.systemPrompt,
    '',
    'User input:',
    prompt,
  ].join('\n');
}

async function generateContent(userId, payload) {
  await projectService.ensureProjectBelongsToUser(userId, payload.projectId);

  const template = await templateService.getTemplateForGenerate(userId, payload.templateId);
  const effectivePrompt = buildPromptWithTemplate(payload.prompt, template);
  const aiPayload = {
    ...payload,
    prompt: effectivePrompt,
    type: payload.type || template?.type,
  };
  const aiResult = await aiService.generateCopy(aiPayload);
  const generatedTags = [
    ...(payload.industry ? [payload.industry] : []),
    ...(template?.category ? [template.category] : []),
    ...(payload.tags || []),
  ].filter((tag, index, list) => tag && list.indexOf(tag) === index);

  const content = await Content.create({
    userId,
    projectId: payload.projectId || null,
    templateId: template?._id || null,
    title: buildTitleFromOutput(aiPayload.type, aiResult.outputText),
    prompt: effectivePrompt,
    outputText: aiResult.outputText,
    type: aiPayload.type,
    tone: payload.tone,
    language: payload.language,
    modelUsed: aiResult.modelUsed,
    tags: generatedTags,
  });

  const usage = await UsageLog.create({
    userId,
    contentId: content._id,
    model: aiResult.modelUsed,
    promptTokens: aiResult.usage.promptTokens,
    completionTokens: aiResult.usage.completionTokens,
    totalTokens: aiResult.usage.totalTokens,
    action: 'generate',
    status: aiResult.status,
  });

  await templateService.incrementTemplateUsage(template?._id);

  return {
    item: serializeContent(content),
    usage: serializeUsage(usage),
    template: template ? templateService.serializeTemplate(template) : null,
    fallback: aiResult.fallback,
  };
}

module.exports = {
  serializeContent,
  serializeUsage,
  listContents,
  getContent,
  createContent,
  updateContent,
  softDeleteContent,
  generateContent,
};
