const PublicPage = require('../models/PublicPage');
const createError = require('../utils/createError');

const DEFAULT_PUBLIC_PAGES = [
  {
    key: 'home',
    type: 'page',
    title: 'Trang chu',
    description: 'Landing page CopyPro',
    sortOrder: 10,
    content: {},
  },
  {
    key: 'about',
    type: 'page',
    title: 'Gioi thieu',
    description: 'Trang gioi thieu CopyPro',
    sortOrder: 20,
    content: {},
  },
  {
    key: 'contact',
    type: 'page',
    title: 'Lien he',
    description: 'Trang lien he CopyPro',
    sortOrder: 30,
    content: {},
  },
  {
    key: 'footer',
    type: 'settings',
    title: 'Footer public site',
    description: 'Thong tin CTA, lien he va footer',
    sortOrder: 40,
    content: {},
  },
  {
    key: 'blog',
    type: 'blog',
    title: 'Blog',
    description: 'Danh sach bai viet public',
    sortOrder: 50,
    content: { posts: [] },
  },
];

const DEFAULT_PAGE_MAP = new Map(DEFAULT_PUBLIC_PAGES.map(page => [page.key, page]));

function normalizeKey(value) {
  return String(value || '').trim().toLowerCase();
}

function serializePage(page) {
  if (!page) return null;
  return {
    id: page._id?.toString?.() || page.id || '',
    _id: page._id?.toString?.() || page._id,
    key: page.key,
    type: page.type,
    title: page.title || '',
    description: page.description || '',
    content: page.content || {},
    seo: {
      metaTitle: page.seo?.metaTitle || '',
      metaDescription: page.seo?.metaDescription || '',
    },
    isPublished: page.isPublished !== false,
    sortOrder: page.sortOrder || 0,
    createdAt: page.createdAt,
    updatedAt: page.updatedAt,
  };
}

function serializeDefault(key) {
  const page = DEFAULT_PAGE_MAP.get(normalizeKey(key));
  if (!page) return null;
  return serializePage({
    ...page,
    seo: {},
    isPublished: true,
  });
}

async function ensureDefaultPages() {
  await PublicPage.bulkWrite(DEFAULT_PUBLIC_PAGES.map(page => ({
    updateOne: {
      filter: { key: page.key },
      update: { $setOnInsert: page },
      upsert: true,
    },
  })));
}

async function listAdminPages() {
  await ensureDefaultPages();
  const pages = await PublicPage.find().sort({ sortOrder: 1, key: 1 });
  return pages.map(serializePage);
}

async function getAdminPage(key) {
  await ensureDefaultPages();
  const normalizedKey = normalizeKey(key);
  const page = await PublicPage.findOne({ key: normalizedKey });
  if (!page) throw createError(404, 'Public page not found');
  return serializePage(page);
}

async function getPublicPage(key) {
  const normalizedKey = normalizeKey(key);
  const page = await PublicPage.findOne({ key: normalizedKey });
  if (!page) return serializeDefault(normalizedKey);
  if (page.isPublished === false) return null;
  return serializePage(page);
}

function normalizeUpdatePayload(key, payload = {}) {
  const normalizedKey = normalizeKey(key);
  const defaults = DEFAULT_PAGE_MAP.get(normalizedKey) || {};
  const next = {
    key: normalizedKey,
    type: payload.type || defaults.type || 'page',
    title: payload.title ?? defaults.title ?? '',
    description: payload.description ?? defaults.description ?? '',
    content: payload.content && typeof payload.content === 'object' ? payload.content : {},
    seo: payload.seo && typeof payload.seo === 'object' ? payload.seo : {},
    isPublished: payload.isPublished !== false,
    sortOrder: Number.isFinite(Number(payload.sortOrder)) ? Number(payload.sortOrder) : (defaults.sortOrder || 0),
  };

  if (!next.key) throw createError(400, 'Public page key is required');
  return next;
}

async function updatePage(key, payload) {
  const normalized = normalizeUpdatePayload(key, payload);
  const page = await PublicPage.findOneAndUpdate(
    { key: normalized.key },
    { $set: normalized },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  return serializePage(page);
}

module.exports = {
  DEFAULT_PUBLIC_PAGES,
  listAdminPages,
  getAdminPage,
  getPublicPage,
  updatePage,
};
