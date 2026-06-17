const Template = require('../models/Template');
const createError = require('../utils/createError');

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toId(value) {
  return value ? value.toString() : null;
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 140);
}

function serializeTemplate(template) {
  return {
    id: template._id.toString(),
    _id: template._id.toString(),
    name: template.name,
    slug: template.slug,
    description: template.description,
    category: template.category,
    type: template.type,
    systemPrompt: template.systemPrompt,
    variables: template.variables || [],
    isSystem: Boolean(template.isSystem),
    authorId: toId(template.authorId),
    status: template.status,
    usageCount: template.usageCount || 0,
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
  };
}

function templateAccessFilter(userId) {
  return {
    status: 'active',
    $or: [
      { isSystem: true },
      { authorId: userId },
    ],
  };
}

function buildSearchFilter(search) {
  if (!search) return {};

  const regex = new RegExp(escapeRegExp(search), 'i');
  return {
    $or: [
      { name: regex },
      { description: regex },
      { category: regex },
      { type: regex },
    ],
  };
}

async function listTemplates(userId, query = {}) {
  const filter = {
    status: 'active',
    $and: [{ $or: [{ isSystem: true }, { authorId: userId }] }],
  };
  const searchFilter = buildSearchFilter(query.search);

  if (searchFilter.$or) filter.$and.push(searchFilter);

  if (query.category) filter.category = query.category;
  if (query.type) filter.type = query.type;

  const templates = await Template.find(filter).sort({
    isSystem: -1,
    usageCount: -1,
    createdAt: -1,
  });

  return {
    items: templates.map(serializeTemplate),
  };
}

async function findTemplateForUser(userId, id) {
  const template = await Template.findOne({
    _id: id,
    ...templateAccessFilter(userId),
  });

  if (!template) {
    throw createError(404, 'Template not found');
  }

  return template;
}

async function getTemplate(userId, id) {
  const template = await findTemplateForUser(userId, id);
  return serializeTemplate(template);
}

async function createTemplate(userId, payload) {
  const template = await Template.create({
    ...payload,
    slug: slugify(`${payload.name}-${Date.now()}`),
    isSystem: false,
    authorId: userId,
    status: 'active',
    usageCount: 0,
  });

  return serializeTemplate(template);
}

async function getTemplateForGenerate(userId, id) {
  if (!id) return null;
  return findTemplateForUser(userId, id);
}

async function incrementTemplateUsage(id) {
  if (!id) return;
  await Template.updateOne({ _id: id }, { $inc: { usageCount: 1 } });
}

module.exports = {
  serializeTemplate,
  listTemplates,
  getTemplate,
  createTemplate,
  getTemplateForGenerate,
  incrementTemplateUsage,
  slugify,
};
