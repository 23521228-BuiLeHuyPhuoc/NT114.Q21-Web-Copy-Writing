const Content = require('../models/Content');
const FineTunedModel = require('../models/FineTunedModel');
const FineTuneJob = require('../models/FineTuneJob');
const UsageLog = require('../models/UsageLog');
const aiService = require('./aiService');
const notificationService = require('./notificationService');
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

function getFineTunedRegistryId(model) {
  const value = String(model || '').trim();
  return value.startsWith('fine-tuned:') ? value.slice('fine-tuned:'.length) : '';
}

function getFineTunedRegistryIdFromPayload(payload) {
  const explicitId = payload.modelMode === 'fine-tuned' ? String(payload.fineTunedModelId || '').trim() : '';
  return explicitId || getFineTunedRegistryId(payload.model);
}

async function resolveFineTunedModelForGenerate(userId, payload) {
  const registryId = getFineTunedRegistryIdFromPayload(payload);
  if (!registryId) return { payload, model: null, modelUsed: payload.model };

  const model = await FineTunedModel.findOne({ _id: registryId, userId, isDeprecated: { $ne: true } });
  if (!model) throw createError(404, 'Fine-tuned model not found');
  if (!model.isActive) throw createError(409, 'Fine-tuned model is not active');

  const job = await FineTuneJob.findOne({ _id: model.jobId, userId });
  if (!job || job.provider === 'mock') throw createError(404, 'Fine-tuned model not found');
  const provider = job?.provider || '';
  const modelUsed = `fine-tuned:${model._id.toString()}`;
  const fineTunedPrompt = [
    `Fine-tuned model selected: ${model.name}.`,
    `Industry: ${model.industry || payload.industry || 'general'}.`,
    `Brand voice source: ${model.performance?.sampleCount || 0} curated training examples.`,
    'Apply this model voice consistently: keep wording, rhythm, tone, and domain vocabulary close to the training examples where relevant.',
    '',
    payload.prompt,
  ].join('\n');

  if (provider === 'openai') {
    return {
      model,
      modelUsed,
      payload: {
        ...payload,
        prompt: fineTunedPrompt,
        model: model.providerModelId,
        forceProvider: 'openai',
        requireProviderSuccess: true,
      },
    };
  }

  if (provider === 'vertex-gemini') {
    if (!model.providerModelId) {
      throw createError(409, 'Vertex fine-tuned model has no tuned endpoint id yet');
    }

    return {
      model,
      modelUsed,
      payload: {
        ...payload,
        prompt: fineTunedPrompt,
        model: model.providerModelId,
        forceProvider: 'vertex-gemini',
        requireProviderSuccess: true,
      },
    };
  }

  if (provider === 'huggingface') {
    throw createError(409, 'Hugging Face fine-tuning created a LoRA adapter repo. Deploy it with a Hugging Face Inference Endpoint or serving Space before using it in AI Generator.');
  }

  throw createError(409, `Provider ${provider || 'unknown'} does not expose a real fine-tuned inference endpoint in this app yet`);
}

async function generateContent(userId, payload) {
  await projectService.ensureProjectBelongsToUser(userId, payload.projectId);

  const template = await templateService.getTemplateForGenerate(userId, payload.templateId);
  const resolvedFineTune = await resolveFineTunedModelForGenerate(userId, payload);
  const effectivePrompt = buildPromptWithTemplate(resolvedFineTune.payload.prompt, template);
  const aiPayload = {
    ...resolvedFineTune.payload,
    prompt: effectivePrompt,
    type: resolvedFineTune.payload.type || template?.type,
  };
  const aiResult = await aiService.generateCopy(aiPayload);
  const modelUsed = resolvedFineTune.modelUsed || aiResult.modelUsed;
  const generatedTags = [
    ...(payload.industry ? [payload.industry] : []),
    ...(resolvedFineTune.model ? ['fine-tuned'] : []),
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
    modelUsed,
    tags: generatedTags,
  });

  const usage = await UsageLog.create({
    userId,
    contentId: content._id,
    model: modelUsed,
    promptTokens: aiResult.usage.promptTokens,
    completionTokens: aiResult.usage.completionTokens,
    totalTokens: aiResult.usage.totalTokens,
    action: 'generate',
    status: aiResult.status,
  });

  await templateService.incrementTemplateUsage(template?._id);
  try {
    await notificationService.createGenerateSuccessNotification(userId, content);
  } catch (error) {
    console.warn(`Failed to create generate notification: ${error.message}`);
  }

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
