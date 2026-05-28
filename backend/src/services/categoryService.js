const Category = require('../models/Category');
const Template = require('../models/Template');
const createError = require('../utils/createError');

const DEFAULT_ICONS = {
  seo: '🔎',
  product: '🛍️',
  social: '📱',
  email: '✉️',
  ads: '📣',
  ecommerce: '🛒',
  realestate: '🏠',
  technology: '💻',
  fnb: '🍜',
  healthcare: '🏥',
  education: '📚',
  finance: '💰',
  fashion: '👗',
  travel: '✈️',
  logistics: '🚚',
};

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function normalizeSlug(payload) {
  return slugify(payload.slug || payload.name);
}

async function getTemplateCountMap() {
  const counts = await Template.aggregate([
    { $match: { status: 'active' } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);

  return new Map(counts.map((item) => [item._id, item.count]));
}

function serializeCategory(category, templateCount = 0) {
  const icon = category.icon || DEFAULT_ICONS[category.slug] || '🏷️';

  return {
    id: category._id.toString(),
    _id: category._id.toString(),
    name: category.name,
    slug: category.slug,
    description: category.description || '',
    icon,
    parentId: category.parentId ? category.parentId.toString() : null,
    isActive: Boolean(category.isActive),
    active: Boolean(category.isActive),
    order: category.order || 0,
    templateCount,
    templates: templateCount,
    usersCount: 0,
    users: 0,
    isDeleted: Boolean(category.isDeleted),
    deletedAt: category.deletedAt,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

async function ensureSlugAvailable(slug, exceptId) {
  const existing = await Category.findOne({ slug });
  if (existing && existing._id.toString() !== String(exceptId || '')) {
    throw createError(409, 'Slug danh mục đã tồn tại');
  }
}

async function listCategories({ deleted = false } = {}) {
  const filter = deleted ? { isDeleted: true } : { isDeleted: { $ne: true } };
  const [categories, countMap] = await Promise.all([
    Category.find(filter).sort({ order: 1, name: 1 }),
    getTemplateCountMap(),
  ]);

  return categories.map((category) => serializeCategory(category, countMap.get(category.slug) || 0));
}

async function createCategory(payload) {
  const slug = normalizeSlug(payload);
  if (!slug) throw createError(400, 'Slug danh mục không hợp lệ');
  await ensureSlugAvailable(slug);

  const category = await Category.create({
    name: payload.name,
    slug,
    description: payload.description || '',
    icon: payload.icon || '',
    isActive: payload.isActive ?? true,
    order: payload.order || 0,
  });

  return serializeCategory(category, 0);
}

async function findCategoryOrThrow(id, includeDeleted = false) {
  const query = includeDeleted ? { _id: id } : { _id: id, isDeleted: { $ne: true } };
  const category = await Category.findOne(query);
  if (!category) throw createError(404, 'Category not found');
  return category;
}

async function updateCategory(id, payload) {
  const category = await findCategoryOrThrow(id);

  if (payload.slug || payload.name) {
    const slug = normalizeSlug({
      slug: payload.slug || category.slug,
      name: payload.name || category.name,
    });
    if (!slug) throw createError(400, 'Slug danh mục không hợp lệ');
    await ensureSlugAvailable(slug, id);
    category.slug = slug;
  }

  if (payload.name !== undefined) category.name = payload.name;
  if (payload.description !== undefined) category.description = payload.description;
  if (payload.icon !== undefined) category.icon = payload.icon;
  if (payload.isActive !== undefined) category.isActive = payload.isActive;
  if (payload.order !== undefined) category.order = payload.order;

  await category.save();
  const countMap = await getTemplateCountMap();
  return serializeCategory(category, countMap.get(category.slug) || 0);
}

async function softDeleteCategory(id) {
  const category = await findCategoryOrThrow(id);
  category.isDeleted = true;
  category.deletedAt = new Date();
  await category.save();
  const countMap = await getTemplateCountMap();
  return serializeCategory(category, countMap.get(category.slug) || 0);
}

async function restoreCategory(id) {
  const category = await findCategoryOrThrow(id, true);
  category.isDeleted = false;
  category.deletedAt = null;
  await category.save();
  const countMap = await getTemplateCountMap();
  return serializeCategory(category, countMap.get(category.slug) || 0);
}

async function permanentDeleteCategory(id) {
  const deleted = await Category.findByIdAndDelete(id);
  if (!deleted) throw createError(404, 'Category not found');
}

module.exports = {
  serializeCategory,
  listCategories,
  createCategory,
  updateCategory,
  softDeleteCategory,
  restoreCategory,
  permanentDeleteCategory,
  slugify,
};
