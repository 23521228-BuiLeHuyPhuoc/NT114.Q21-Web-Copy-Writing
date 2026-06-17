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
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 140);
}

function serializeTemplate(template) {
  const isArchived = template.status === 'archived';

  return {
    id: template._id.toString(),
    _id: template._id.toString(),
    name: template.name,
    slug: template.slug,
    description: template.description,
    category: template.category,
    industry: template.category,
    type: template.type,
    systemPrompt: template.systemPrompt,
    variables: template.variables || [],
    isSystem: Boolean(template.isSystem),
    authorId: toId(template.authorId),
    status: template.status,
    active: template.status === 'active',
    usageCount: template.usageCount || 0,
    uses: template.usageCount || 0,
    rating: 0,
    isDeleted: isArchived,
    deletedAt: isArchived ? template.updatedAt : null,
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
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

async function listTemplates(query = {}, { archived = false } = {}) {
  const filter = archived ? { status: 'archived' } : { status: { $ne: 'archived' } };
  const searchFilter = buildSearchFilter(query.search);

  if (searchFilter.$or) filter.$and = [searchFilter];
  if (query.category) filter.category = query.category;
  if (query.type) filter.type = query.type;
  if (!archived && query.status && query.status !== 'all') filter.status = query.status;

  const templates = await Template.find(filter).sort({ isSystem: -1, usageCount: -1, createdAt: -1 });
  return templates.map(serializeTemplate);
}

async function findTemplateOrThrow(id, includeArchived = false) {
  const filter = { _id: id };
  if (!includeArchived) filter.status = { $ne: 'archived' };

  const template = await Template.findOne(filter);
  if (!template) throw createError(404, 'Template not found');
  return template;
}

async function createTemplate(payload) {
  const name = payload.name;
  const slug = slugify(payload.slug || `${name}-${Date.now()}`);

  const template = await Template.create({
    name,
    slug,
    description: payload.description || '',
    category: payload.category,
    type: payload.type,
    systemPrompt: payload.systemPrompt,
    variables: payload.variables || [],
    isSystem: payload.isSystem ?? true,
    authorId: null,
    status: payload.status || 'active',
    usageCount: 0,
  });

  return serializeTemplate(template);
}

async function updateTemplate(id, payload) {
  const template = await findTemplateOrThrow(id, true);

  if (payload.name !== undefined) template.name = payload.name;
  if (payload.slug !== undefined) template.slug = slugify(payload.slug || template.name);
  if (payload.description !== undefined) template.description = payload.description;
  if (payload.category !== undefined) template.category = payload.category;
  if (payload.type !== undefined) template.type = payload.type;
  if (payload.systemPrompt !== undefined) template.systemPrompt = payload.systemPrompt;
  if (payload.variables !== undefined) template.variables = payload.variables;
  if (payload.isSystem !== undefined) template.isSystem = payload.isSystem;
  if (payload.status !== undefined) template.status = payload.status;

  await template.save();
  return serializeTemplate(template);
}

async function archiveTemplate(id) {
  const template = await findTemplateOrThrow(id);
  template.status = 'archived';
  await template.save();
  return serializeTemplate(template);
}

async function restoreTemplate(id) {
  const template = await findTemplateOrThrow(id, true);
  template.status = 'active';
  await template.save();
  return serializeTemplate(template);
}

async function permanentDeleteTemplate(id) {
  const deleted = await Template.findByIdAndDelete(id);
  if (!deleted) throw createError(404, 'Template not found');
}

module.exports = {
  serializeTemplate,
  listTemplates,
  createTemplate,
  updateTemplate,
  archiveTemplate,
  restoreTemplate,
  permanentDeleteTemplate,
};
