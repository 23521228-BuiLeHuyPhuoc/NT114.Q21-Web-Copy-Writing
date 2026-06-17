const GenerateOption = require('../models/GenerateOption');
const createError = require('../utils/createError');

const GROUP_PARAM_MAP = {
  industries: 'industry',
  'copy-types': 'copy_type',
  tones: 'tone',
};

const DEFAULT_OPTIONS = {
  industry: [
    { name: 'Thuong Mai Dien Tu', slug: 'ecommerce', description: 'San pham, shop online, san thuong mai dien tu.', icon: 'ShoppingBag', color: 'bg-emerald-500', order: 1 },
    { name: 'Bat Dong San', slug: 'realestate', description: 'Can ho, du an, nha pho, bat dong san dau tu.', icon: 'Building2', color: 'bg-green-500', order: 2 },
    { name: 'Cong Nghe', slug: 'technology', description: 'SaaS, ung dung, thiet bi, giai phap cong nghe.', icon: 'Laptop', color: 'bg-teal-500', order: 3 },
    { name: 'Am Thuc F&B', slug: 'fnb', description: 'Nha hang, cafe, do an, do uong.', icon: 'Utensils', color: 'bg-orange-500', order: 4 },
    { name: 'Y Te & Suc Khoe', slug: 'healthcare', description: 'Phong kham, san pham suc khoe, cham soc ca nhan.', icon: 'Heart', color: 'bg-red-500', order: 5 },
    { name: 'Giao Duc', slug: 'education', description: 'Khoa hoc, trung tam, chuong trinh dao tao.', icon: 'GraduationCap', color: 'bg-green-500', order: 6 },
    { name: 'Tai Chinh', slug: 'finance', description: 'Ngan hang, bao hiem, dau tu, fintech.', icon: 'DollarSign', color: 'bg-emerald-500', order: 7 },
    { name: 'Thoi Trang', slug: 'fashion', description: 'Quan ao, phu kien, lam dep, phong cach.', icon: 'Shirt', color: 'bg-pink-500', order: 8 },
    { name: 'Doanh Nghiep', slug: 'business', description: 'Dich vu B2B, tu van, van hanh doanh nghiep.', icon: 'Briefcase', color: 'bg-slate-500', order: 9 },
    { name: 'Du Lich', slug: 'travel', description: 'Tour, khach san, diem den, dich vu du lich.', icon: 'Plane', color: 'bg-cyan-500', order: 10 },
  ],
  copy_type: [
    { name: 'Tieu De Quang Cao', slug: 'headline', description: 'Headline ngan gon, thu hut click.', icon: 'Megaphone', order: 1 },
    { name: 'Mo Ta San Pham', slug: 'description', description: 'Mo ta chi tiet, thuyet phuc, co loi ich ro.', icon: 'FileText', order: 2 },
    { name: 'Social Media Post', slug: 'social', description: 'Caption cho Facebook, Instagram, TikTok.', icon: 'MessageSquare', order: 3 },
    { name: 'Email Marketing', slug: 'email', description: 'Subject, preview text va noi dung email.', icon: 'Mail', order: 4 },
    { name: 'Loi Keu Goi Hanh Dong', slug: 'cta', description: 'Nut bam va microcopy keu goi hanh dong.', icon: 'Target', order: 5 },
    { name: 'Landing Page', slug: 'landing', description: 'Hero, loi ich, proof, offer va CTA.', icon: 'Globe', order: 6 },
    { name: 'SEO Content', slug: 'seo', description: 'SEO title, meta description, outline va slug.', icon: 'BarChart3', order: 7 },
    { name: 'Review/Testimonial', slug: 'review', description: 'Danh gia, testimonial, social proof.', icon: 'Star', order: 8 },
  ],
  tone: [
    { name: 'Khan cap', slug: 'urgent', description: 'FOMO, limited time, flash sale.', icon: 'fire', order: 1 },
    { name: 'Chuyen nghiep', slug: 'professional', description: 'Trang trong, B2B, uy tin.', icon: 'briefcase', order: 2 },
    { name: 'Than thien', slug: 'friendly', description: 'Gan gui, tro chuyen, de tiep can.', icon: 'smile', order: 3 },
    { name: 'Sang trong', slug: 'luxury', description: 'Premium, cao cap, dang cap.', icon: 'sparkles', order: 4 },
    { name: 'Hai huoc', slug: 'humorous', description: 'Vui ve, trendy, de chia se.', icon: 'laugh', order: 5 },
    { name: 'Cam xuc', slug: 'emotional', description: 'Storytelling, cham vao insight va cam xuc.', icon: 'heart', order: 6 },
  ],
};

function resolveGroup(groupParam) {
  const group = GROUP_PARAM_MAP[groupParam] || groupParam;
  if (!Object.values(GROUP_PARAM_MAP).includes(group)) {
    throw createError(400, 'Invalid generate option group');
  }
  return group;
}

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

function serializeOption(option) {
  return {
    id: option._id.toString(),
    _id: option._id.toString(),
    group: option.group,
    name: option.name,
    slug: option.slug,
    description: option.description || '',
    icon: option.icon || '',
    color: option.color || '',
    isActive: Boolean(option.isActive),
    active: Boolean(option.isActive),
    order: option.order || 0,
    isDeleted: Boolean(option.isDeleted),
    deletedAt: option.deletedAt,
    createdAt: option.createdAt,
    updatedAt: option.updatedAt,
  };
}

async function ensureDefaultOptions(group) {
  const existingCount = await GenerateOption.countDocuments({ group });
  if (existingCount > 0) return;

  const defaults = DEFAULT_OPTIONS[group] || [];
  await GenerateOption.insertMany(defaults.map((item) => ({
    ...item,
    group,
    isActive: true,
    isDeleted: false,
  })));
}

async function ensureSlugAvailable(group, slug, exceptId) {
  const existing = await GenerateOption.findOne({ group, slug });
  if (existing && existing._id.toString() !== String(exceptId || '')) {
    throw createError(409, 'Slug cau hinh Generate da ton tai trong nhom nay');
  }
}

async function listOptions(groupParam, { activeOnly = false, deleted = false } = {}) {
  const group = resolveGroup(groupParam);
  await ensureDefaultOptions(group);

  const filter = deleted ? { group, isDeleted: true } : { group, isDeleted: { $ne: true } };
  if (activeOnly) filter.isActive = true;

  const items = await GenerateOption.find(filter).sort({ order: 1, name: 1 });
  return items.map(serializeOption);
}

async function listAllActiveOptions() {
  await Promise.all(Object.values(GROUP_PARAM_MAP).map((group) => ensureDefaultOptions(group)));

  const items = await GenerateOption.find({
    isActive: true,
    isDeleted: { $ne: true },
  }).sort({ group: 1, order: 1, name: 1 });

  return items.reduce((groups, item) => {
    const serialized = serializeOption(item);
    if (item.group === 'industry') groups.industries.push(serialized);
    if (item.group === 'copy_type') groups.copyTypes.push(serialized);
    if (item.group === 'tone') groups.tones.push(serialized);
    return groups;
  }, { industries: [], copyTypes: [], tones: [] });
}

async function createOption(groupParam, payload) {
  const group = resolveGroup(groupParam);
  const slug = normalizeSlug(payload);
  if (!slug) throw createError(400, 'Slug cau hinh Generate khong hop le');
  await ensureSlugAvailable(group, slug);

  const option = await GenerateOption.create({
    group,
    name: payload.name,
    slug,
    description: payload.description || '',
    icon: payload.icon || '',
    color: payload.color || '',
    isActive: payload.isActive ?? true,
    order: payload.order || 0,
  });

  return serializeOption(option);
}

async function findOptionOrThrow(groupParam, id, includeDeleted = false) {
  const group = resolveGroup(groupParam);
  const filter = includeDeleted ? { _id: id, group } : { _id: id, group, isDeleted: { $ne: true } };
  const option = await GenerateOption.findOne(filter);
  if (!option) throw createError(404, 'Generate option not found');
  return option;
}

async function updateOption(groupParam, id, payload) {
  const option = await findOptionOrThrow(groupParam, id);

  if (payload.slug || payload.name) {
    const slug = normalizeSlug({ slug: payload.slug || option.slug, name: payload.name || option.name });
    if (!slug) throw createError(400, 'Slug cau hinh Generate khong hop le');
    await ensureSlugAvailable(option.group, slug, id);
    option.slug = slug;
  }

  if (payload.name !== undefined) option.name = payload.name;
  if (payload.description !== undefined) option.description = payload.description;
  if (payload.icon !== undefined) option.icon = payload.icon;
  if (payload.color !== undefined) option.color = payload.color;
  if (payload.isActive !== undefined) option.isActive = payload.isActive;
  if (payload.order !== undefined) option.order = payload.order;

  await option.save();
  return serializeOption(option);
}

async function softDeleteOption(groupParam, id) {
  const option = await findOptionOrThrow(groupParam, id);
  option.isDeleted = true;
  option.deletedAt = new Date();
  await option.save();
  return serializeOption(option);
}

async function restoreOption(groupParam, id) {
  const option = await findOptionOrThrow(groupParam, id, true);
  option.isDeleted = false;
  option.deletedAt = null;
  await option.save();
  return serializeOption(option);
}

async function permanentDeleteOption(groupParam, id) {
  const option = await findOptionOrThrow(groupParam, id, true);
  await option.deleteOne();
}

module.exports = {
  GROUP_PARAM_MAP,
  resolveGroup,
  serializeOption,
  listOptions,
  listAllActiveOptions,
  createOption,
  updateOption,
  softDeleteOption,
  restoreOption,
  permanentDeleteOption,
  slugify,
};
