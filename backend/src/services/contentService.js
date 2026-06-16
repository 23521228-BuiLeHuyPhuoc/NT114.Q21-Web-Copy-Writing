const Content = require('../models/Content');
const FineTunedModel = require('../models/FineTunedModel');
const FineTuneExample = require('../models/FineTuneExample');
const FineTuneJob = require('../models/FineTuneJob');
const UsageLog = require('../models/UsageLog');
const aiService = require('./aiService');
const notificationService = require('./notificationService');
const projectService = require('./projectService');
const templateService = require('./templateService');
const createError = require('../utils/createError');
const {
  buildModelDisplayNameMap,
  resolveModelDisplayName,
} = require('../utils/modelDisplayName');

const SUPPORTED_FINE_TUNE_PROVIDERS = new Set(['openai', 'vertex-gemini', 'vertex-llama', 'vertex-qwen', 'vertex-claude', 'anthropic']);
const MARKETING_ICON_RE = /[\u2600-\u27BF\u{1F300}-\u{1FAFF}]/u;

function hasMarketingIcon(value) {
  return MARKETING_ICON_RE.test(String(value || ''));
}

function buildVertexLlamaFineTunedPrompt(currentPrompt) {
  return [
    'You are a Vietnamese ecommerce marketing copywriter.',
    'Write natural Vietnamese with full diacritics and follow the original brief exactly.',
    'Always put emoji/icons at the beginning of each version and each content label.',
    'Icon guide: \u{1F9E9} Phien ban 1, \u{1F9EA} Phien ban 2, \u{1F680} Phien ban 3, \u{1F4E3} Headline, \u2728 Subheadline, \u{1F3AF} Hook, \u{1F4AC} Caption, \u{1F449} CTA, \u{1F4A1} Microcopy.',
    'Return final marketing copy only. Do not explain.',
    '',
    'Original brief:',
    String(currentPrompt || '').trim(),
  ].join('\n');
}

function prefixIcon(line, icon) {
  const match = String(line || '').match(/^(\s*(?:[-*]\s*)?)(.*)$/);
  if (!match) return line;
  if (hasMarketingIcon(match[2].slice(0, 6))) return line;
  return match[1] + icon + ' ' + match[2];
}

function applyMarketingIcons(outputText) {
  const text = String(outputText || '').trim();
  if (!text) return text;

  const rules = [
    { icon: '\u{1F9E9}', pattern: /^(?:phi(?:\u00ea|e|\?)n b(?:\u1ea3|a|\?)n|version)\s*1\s*:/i },
    { icon: '\u{1F9EA}', pattern: /^(?:phi(?:\u00ea|e|\?)n b(?:\u1ea3|a|\?)n|version)\s*2\s*:/i },
    { icon: '\u{1F680}', pattern: /^(?:phi(?:\u00ea|e|\?)n b(?:\u1ea3|a|\?)n|version)\s*3\s*:/i },
    { icon: '\u2B50', pattern: /^(?:phi(?:\u00ea|e|\?)n b(?:\u1ea3|a|\?)n|version)\s*\d+\s*:/i },
    { icon: '\u{1F4E3}', pattern: /^(headline|ti(?:\u00eau|\?)u|ch(?:\u1ee7|\?)\s*(?:\u0111|\?)(?:\u1ec1|\?))\s*:/i },
    { icon: '\u2728', pattern: /^(subheadline|m(?:\u00f4|\?)\s*t(?:\u1ea3|\?)\s*ng(?:\u1eaf|\?)n|m(?:\u00f4|\?)\s*t(?:\u1ea3|\?)\s*ph(?:\u1ee5|\?))\s*:/i },
    { icon: '\u{1F3AF}', pattern: /^(hook|m(?:\u1edf|\?)\s*(?:\u0111|\?)(?:\u1ea7|\?)u)\s*:/i },
    { icon: '\u{1F4AC}', pattern: /^(caption|n(?:\u1ed9|\?)i\s*dung|body)\s*:/i },
    { icon: '\u{1F449}', pattern: /^(l(?:\u1eddi|\?)i\s*k(?:\u00eau|\?)u\s*g(?:\u1ecdi|\?)i\s*h(?:\u00e0nh|\?)\s*(?:\u0111|\?)(?:\u1ed9|\?)ng|cta|call to action)\s*:/i },
    { icon: '\u{1F4A1}', pattern: /^(microcopy|ghi ch(?:\u00fa|\?)|l(?:\u1ee3|\?)i\s*(?:\u00ed|\?)ch\s*ch(?:\u00ed|\?)nh)\s*:/i },
    { icon: '\u{1F6D2}', pattern: /^(m(?:\u00f4|\?)\s*t(?:\u1ea3|\?)\s*s(?:\u1ea3|\?)n\s*ph(?:\u1ea9|\?)m|s(?:\u1ea3|\?)n\s*ph(?:\u1ea9|\?)m|(?:\u01b0|\?)u\s*(?:\u0111|\?)(?:\u00e3|\?)i)\s*:/i },
    { icon: '\u{1F4E9}', pattern: /^(subject|preview text|email)\s*:/i },
  ];

  const lines = text.split(/\r?\n/).map((line) => {
    const body = line.trimStart().replace(/^[-*]\s*/, '');
    const rule = rules.find((item) => item.pattern.test(body));
    return rule ? prefixIcon(line, rule.icon) : line;
  });

  const iconized = lines.join('\n').trim();
  return hasMarketingIcon(iconized) ? iconized : '\u2728 ' + iconized;
}

function looksUnicodeCorrupted(value) {
  const text = String(value || '');
  if (!text) return false;
  const questionCount = (text.match(/\?/g) || []).length;
  const replacementCount = (text.match(/\uFFFD/g) || []).length;
  if (replacementCount > 0) return true;
  if (/(B\?n|Phi\?n|ng\?nh|Th\?\?ng|L\?i|k\?u|h\?nh|d\?ng|s\?n ph\?m|Ti\?u \?\?)/i.test(text)) return true;
  if (questionCount >= 6 && /[A-Za-z]\?[A-Za-z]/.test(text)) return true;
  return questionCount >= 10 && questionCount / Math.max(text.length, 1) > 0.02;
}

function mergeUsage(primary = {}, secondary = {}) {
  return {
    promptTokens: Number(primary.promptTokens || 0) + Number(secondary.promptTokens || 0),
    completionTokens: Number(primary.completionTokens || 0) + Number(secondary.completionTokens || 0),
    totalTokens: Number(primary.totalTokens || 0) + Number(secondary.totalTokens || 0),
  };
}

function getRequiredVersionCount(prompt) {
  const text = String(prompt || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0111/g, 'd');
  const versionWords = '(?:phien\\s*ban|phi.n\\s*b.n|versions?)';
  const match = text.match(new RegExp('(?:tao|t.o|viet|vi.t|write|exactly|dung|d.ng)\\D{0,60}([2-5])\\s*' + versionWords, 'i'))
    || text.match(new RegExp('([2-5])\\s*' + versionWords, 'i'));
  return match ? Number(match[1]) : 0;
}

function countVersionLabels(value) {
  const text = String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0111/g, 'd');
  return (text.match(/(?:phien\s*ban|phi.n\s*b.n)\s*\d+/gi) || []).length;
}

function isUsableRepairedOutput(value, sourcePrompt = '') {
  const text = String(value || '').trim();
  if (text.length < 120) return false;
  if (!hasMarketingIcon(text) || looksUnicodeCorrupted(text)) return false;
  const requiredVersions = getRequiredVersionCount(sourcePrompt);
  if (requiredVersions > 1 && countVersionLabels(text) < requiredVersions) return false;
  return !/^(d\u01b0\u1edbi \u0111\u00e2y|duoi day|here is|below is)/i.test(text);
}

async function stabilizeVertexLlamaFineTunedOutput(aiPayload, aiResult) {
  const iconizedOutput = applyMarketingIcons(aiResult.outputText);
  const requiredVersions = getRequiredVersionCount(aiPayload.prompt);
  const actualVersions = countVersionLabels(iconizedOutput);
  const hasWrongVersionCount = requiredVersions > 0 && actualVersions !== requiredVersions;
  const needsRepair = looksUnicodeCorrupted(iconizedOutput) || !hasMarketingIcon(iconizedOutput) || hasWrongVersionCount;
  if (!needsRepair) return { ...aiResult, outputText: iconizedOutput };

  const repairPrompt = [
    'You are a Vietnamese marketing editor.',
    'The Llama output below may have broken Vietnamese diacritics or missing icons because of the Vertex Llama endpoint.',
    'Rewrite it as final marketing copy in natural Vietnamese with full diacritics, following the original brief.',
    'The original brief is authoritative. If it asks for N versions, output exactly N complete versions.',
    'Do not summarize, do not omit requested versions, and do not stop mid-sentence.',
    'Always add emoji/icons at the beginning of each version and each content label.',
    'Return only the rewritten copy. Start immediately with an emoji/icon and a version or content label.',
    'Do not explain, do not mention the error, and do not mention any model.',
    '',
    'Original brief:',
    aiPayload.prompt,
    '',
    'Llama output to repair:',
    aiResult.outputText,
  ].join('\n');

  const directRepairPrompt = [
    'You are a Vietnamese ecommerce marketing copywriter.',
    'Generate the final answer directly from the original brief below.',
    'Write natural Vietnamese with full diacritics.',
    'If the brief asks for N versions, output exactly N complete versions.',
    'Always add emoji/icons at the beginning of each version and each content label.',
    'Return only the final marketing copy. Do not explain.',
    '',
    'Original brief:',
    aiPayload.prompt,
  ].join('\n');

  try {
    for (const prompt of [repairPrompt, directRepairPrompt]) {
      const repaired = await aiService.generateCopy({
        ...aiPayload,
        prompt,
        useRawPrompt: true,
        forceProvider: 'gemini',
        model: process.env.VERTEX_LLAMA_REPAIR_MODEL || process.env.GEMINI_MODEL || 'gemini-2.5-flash',
        maxOutputTokens: Math.max(1800, Number(aiPayload.maxOutputTokens || 0)),
        requireProviderSuccess: false,
      });

      if (repaired && !repaired.fallback && isUsableRepairedOutput(repaired.outputText, aiPayload.prompt)) {
        return {
          ...aiResult,
          outputText: applyMarketingIcons(repaired.outputText),
          usage: mergeUsage(aiResult.usage, repaired.usage),
          status: repaired.status || aiResult.status,
          fallback: true,
        };
      }
    }
  } catch (error) {
    console.warn('Vertex Llama fine-tuned output repair failed: ' + error.message);
  }

  return { ...aiResult, outputText: iconizedOutput };
}

function isVertexEndpointResource(value) {
  return /\/locations\/[^/]+\/endpoints\/[^/:]+(?:$|:)/.test(String(value || '').trim());
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toId(value) {
  return value ? value.toString() : null;
}

function serializeContent(content, modelDisplayNames = new Map()) {
  const modelUsed = content.modelUsed;

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
    modelUsed,
    modelDisplayName: resolveModelDisplayName(modelUsed, modelDisplayNames),
    tags: content.tags || [],
    isFavorite: Boolean(content.isFavorite),
    isProjectCompleted: Boolean(content.isProjectCompleted),
    wordCount: content.wordCount || 0,
    isDeleted: Boolean(content.isDeleted),
    deletedAt: content.deletedAt,
    createdAt: content.createdAt,
    updatedAt: content.updatedAt,
  };
}

async function serializeContentWithModelDisplayName(content, options = {}) {
  const modelDisplayNames = await buildModelDisplayNameMap([content.modelUsed], options);
  return serializeContent(content, modelDisplayNames);
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

  const modelDisplayNames = await buildModelDisplayNameMap(contents.map(content => content.modelUsed), { userId });

  return {
    items: contents.map(content => serializeContent(content, modelDisplayNames)),
    pagination: {
      page,
      limit,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / limit)),
    },
  };
}

async function listTrashContents(userId, query) {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 10);
  const filter = {
    userId,
    isDeleted: true,
    ...buildSearchFilter(query.search),
  };

  if (query.projectId) {
    filter.projectId = query.projectId;
  }

  const [totalItems, contents] = await Promise.all([
    Content.countDocuments(filter),
    Content.find(filter)
      .sort({ deletedAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
  ]);

  const modelDisplayNames = await buildModelDisplayNameMap(contents.map(content => content.modelUsed), { userId });

  return {
    items: contents.map(content => serializeContent(content, modelDisplayNames)),
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

async function findDeletedContentOrThrow(userId, id) {
  const content = await Content.findOne({
    userId,
    _id: id,
    isDeleted: true,
  });

  if (!content) {
    throw createError(404, 'Deleted content not found');
  }

  return content;
}

async function getContent(userId, id) {
  const content = await findContentOrThrow(userId, id);
  return serializeContentWithModelDisplayName(content, { userId });
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

  return serializeContentWithModelDisplayName(content, { userId });
}

async function updateContent(userId, id, payload) {
  const content = await findContentOrThrow(userId, id);

  if (payload.projectId !== undefined) {
    await projectService.ensureProjectBelongsToUser(userId, payload.projectId);
  }

  if (payload.title !== undefined) content.title = payload.title;
  if (payload.prompt !== undefined) content.prompt = payload.prompt;
  if (payload.outputText !== undefined) content.outputText = payload.outputText;
  if (payload.type !== undefined) content.type = payload.type;
  if (payload.tone !== undefined) content.tone = payload.tone;
  if (payload.language !== undefined) content.language = payload.language;
  if (payload.tags !== undefined) content.tags = payload.tags;
  if (payload.isFavorite !== undefined) content.isFavorite = payload.isFavorite;
  if (payload.projectId !== undefined) {
    const currentProjectId = toId(content.projectId);
    const nextProjectId = payload.projectId || null;
    content.projectId = nextProjectId;

    if (currentProjectId !== toId(nextProjectId)) {
      content.isProjectCompleted = false;
    }
  }
  if (payload.isProjectCompleted !== undefined) {
    content.isProjectCompleted = Boolean(payload.isProjectCompleted) && Boolean(content.projectId);
  }

  await content.save();
  return serializeContentWithModelDisplayName(content, { userId });
}

async function softDeleteContent(userId, id) {
  const content = await findContentOrThrow(userId, id);
  content.isDeleted = true;
  content.deletedAt = new Date();
  await content.save();
  return serializeContentWithModelDisplayName(content, { userId });
}

async function restoreContent(userId, id) {
  const content = await findDeletedContentOrThrow(userId, id);
  content.isDeleted = false;
  content.deletedAt = null;
  await content.save();
  return serializeContentWithModelDisplayName(content, { userId });
}

async function permanentDeleteContent(userId, id) {
  const content = await findDeletedContentOrThrow(userId, id);
  await Content.deleteOne({ _id: content._id, userId });
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

function truncateForBrandVoice(value, maxLength) {
  const text = String(value || '').trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
}

async function buildVertexClaudeBrandVoicePrompt(userId, job, currentPrompt) {
  const examples = await FineTuneExample.find({
    datasetId: job.datasetId,
    userId,
    isValid: true,
  })
    .sort({ createdAt: 1 })
    .limit(Number(process.env.VERTEX_CLAUDE_BRAND_VOICE_EXAMPLE_LIMIT || 8));

  const exampleBlocks = examples.map((example, index) => [
    `Ví dụ ${index + 1}:`,
    `Input: ${truncateForBrandVoice(example.inputText, 900)}`,
    `Output mẫu: ${truncateForBrandVoice(example.outputText, 1800)}`,
  ].join('\n'));

  return [
    'Bạn đang dùng một model brand-voice dựa trên dataset fine-tuning của người dùng.',
    'Hãy học phong cách, cấu trúc, cách chọn từ, nhịp câu và mức độ cảm xúc từ các ví dụ bên dưới.',
    'Không chép nguyên văn ví dụ. Không nhắc rằng bạn đang học từ ví dụ. Chỉ trả về nội dung marketing cuối cùng cho khách hàng.',
    '',
    `Ngành của model: ${job.industry || 'general'}.`,
    `Model Claude nền: ${job.baseModel}.`,
    '',
    'Ví dụ brand voice:',
    exampleBlocks.join('\n\n') || 'Không có ví dụ khả dụng, hãy dùng brief hiện tại.',
    '',
    'Yêu cầu hiện tại:',
    currentPrompt,
  ].join('\n');
}

async function resolveFineTunedModelForGenerate(userId, payload) {
  const registryId = getFineTunedRegistryIdFromPayload(payload);
  if (!registryId) return { payload, model: null, modelUsed: payload.model };

  const model = await FineTunedModel.findOne({ _id: registryId, userId, isDeprecated: { $ne: true } });
  if (!model) throw createError(404, 'Fine-tuned model not found');

  const job = await FineTuneJob.findOne({ _id: model.jobId, userId });
  if (!job || !SUPPORTED_FINE_TUNE_PROVIDERS.has(job.provider)) {
    throw createError(404, 'Fine-tuned model not found');
  }
  const provider = job?.provider || '';
  const modelUsed = `fine-tuned:${model._id.toString()}`;
  const fineTunedPrompt = String(payload.prompt || '').trim();

  if (provider === 'openai') {
    return {
      model,
      modelUsed,
      payload: {
        ...payload,
        prompt: fineTunedPrompt,
        useRawPrompt: true,
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
        useRawPrompt: true,
        model: model.providerModelId,
        forceProvider: 'vertex-gemini',
        requireProviderSuccess: true,
      },
    };
  }

  if (provider === 'vertex-claude' || provider === 'anthropic') {
    const brandVoicePrompt = await buildVertexClaudeBrandVoicePrompt(userId, job, fineTunedPrompt);
    return {
      model,
      modelUsed,
      payload: {
        ...payload,
        prompt: brandVoicePrompt,
        useRawPrompt: true,
        model: model.providerModelId || job.baseModel || 'claude-haiku-4-5',
        forceProvider: 'vertex-claude',
        requireProviderSuccess: true,
      },
    };
  }

  if (provider === 'vertex-llama') {
    if (!isVertexEndpointResource(model.providerModelId)) {
      throw createError(409, 'Vertex Llama fine-tuning completed, but the registered model id is not a deployed Vertex endpoint. Deploy the tuned Llama model to a Vertex endpoint first, then sync or register that endpoint id.');
    }

    return {
      model,
      modelUsed,
      fineTuneProvider: provider,
      payload: {
        ...payload,
        prompt: buildVertexLlamaFineTunedPrompt(fineTunedPrompt),
        useRawPrompt: true,
        model: model.providerModelId,
        forceProvider: 'vertex-endpoint',
        requireProviderSuccess: true,
      },
    };
  }

  if (provider === 'vertex-qwen') {
    if (isVertexEndpointResource(model.providerModelId)) {
      return {
        model,
        modelUsed,
        payload: {
          ...payload,
          prompt: fineTunedPrompt,
          useRawPrompt: true,
          model: model.providerModelId,
          forceProvider: 'vertex-endpoint',
          requireProviderSuccess: true,
        },
      };
    }

    throw createError(409, 'Vertex AI Qwen fine-tuning completed, but the registered model id is not a deployed Vertex endpoint. Deploy the tuned Qwen output to a Vertex endpoint first, then sync or register that endpoint id.');
  }

  throw createError(409, `Provider ${provider || 'unknown'} does not expose a real fine-tuned inference endpoint in this app yet`);
}

async function generateContent(userId, payload) {
  await projectService.ensureProjectBelongsToUser(userId, payload.projectId);

  const template = await templateService.getTemplateForGenerate(userId, payload.templateId);
  const resolvedFineTune = await resolveFineTunedModelForGenerate(userId, payload);
  const effectivePrompt = resolvedFineTune.payload.useRawPrompt
    ? resolvedFineTune.payload.prompt
    : buildPromptWithTemplate(resolvedFineTune.payload.prompt, template);
  const aiPayload = {
    ...resolvedFineTune.payload,
    prompt: effectivePrompt,
    type: resolvedFineTune.payload.type || template?.type,
  };
  let aiResult = await aiService.generateCopy(aiPayload);
  if (resolvedFineTune.fineTuneProvider === 'vertex-llama') {
    aiResult = await stabilizeVertexLlamaFineTunedOutput(aiPayload, aiResult);
  }
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
    item: await serializeContentWithModelDisplayName(content, { userId }),
    usage: serializeUsage(usage),
    template: template ? templateService.serializeTemplate(template) : null,
    fallback: aiResult.fallback,
  };
}

module.exports = {
  serializeContent,
  serializeUsage,
  listContents,
  listTrashContents,
  getContent,
  createContent,
  updateContent,
  softDeleteContent,
  restoreContent,
  permanentDeleteContent,
  generateContent,
};
