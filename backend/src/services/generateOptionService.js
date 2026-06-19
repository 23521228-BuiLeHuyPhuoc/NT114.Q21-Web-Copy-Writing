const GenerateOption = require('../models/GenerateOption');
const createError = require('../utils/createError');

const GROUP_PARAM_MAP = {
  industries: 'industry',
  'copy-types': 'copy_type',
  tones: 'tone',
};

const DEFAULT_OPTIONS = {
  industry: [
    { name: 'Thương mại điện tử', slug: 'ecommerce', description: 'Sản phẩm, shop online và sàn thương mại điện tử.', icon: 'ShoppingBag', color: 'bg-emerald-500', order: 1 },
    { name: 'Bất động sản', slug: 'realestate', description: 'Căn hộ, dự án, nhà phố và bất động sản đầu tư.', icon: 'Building2', color: 'bg-green-500', order: 2 },
    { name: 'Công nghệ', slug: 'technology', description: 'SaaS, ứng dụng, thiết bị và giải pháp công nghệ.', icon: 'Laptop', color: 'bg-teal-500', order: 3 },
    { name: 'Ẩm thực F&B', slug: 'fnb', description: 'Nhà hàng, quán cafe, đồ ăn và đồ uống.', icon: 'Utensils', color: 'bg-orange-500', order: 4 },
    { name: 'Y tế & Sức khỏe', slug: 'healthcare', description: 'Phòng khám, sản phẩm sức khỏe và chăm sóc cá nhân.', icon: 'Heart', color: 'bg-red-500', order: 5 },
    { name: 'Giáo dục', slug: 'education', description: 'Khóa học, trung tâm và chương trình đào tạo.', icon: 'GraduationCap', color: 'bg-green-500', order: 6 },
    { name: 'Tài chính', slug: 'finance', description: 'Ngân hàng, bảo hiểm, đầu tư và fintech.', icon: 'DollarSign', color: 'bg-emerald-500', order: 7 },
    { name: 'Thời trang', slug: 'fashion', description: 'Quần áo, phụ kiện, làm đẹp và phong cách.', icon: 'Shirt', color: 'bg-pink-500', order: 8 },
    { name: 'Doanh nghiệp', slug: 'business', description: 'Dịch vụ B2B, tư vấn và vận hành doanh nghiệp.', icon: 'Briefcase', color: 'bg-slate-500', order: 9 },
    { name: 'Du lịch', slug: 'travel', description: 'Tour, khách sạn, điểm đến và dịch vụ du lịch.', icon: 'Luggage', color: 'bg-cyan-500', order: 10 },
  ],
  copy_type: [
    { name: 'Tiêu đề quảng cáo', slug: 'headline', description: 'Headline ngắn gọn, thu hút click.', icon: 'Megaphone', order: 1 },
    { name: 'Mô tả sản phẩm', slug: 'description', description: 'Mô tả chi tiết, thuyết phục và có lợi ích rõ.', icon: 'FileText', order: 2 },
    { name: 'Social Media Post', slug: 'social', description: 'Caption cho Facebook, Instagram, TikTok.', icon: 'MessageSquare', order: 3 },
    { name: 'Email Marketing', slug: 'email', description: 'Subject, preview text va noi dung email.', icon: 'Mail', order: 4 },
    { name: 'Lời kêu gọi hành động', slug: 'cta', description: 'Nút bấm và microcopy kêu gọi hành động.', icon: 'Target', order: 5 },
    { name: 'Landing page', slug: 'landing', description: 'Hero, lợi ích, bằng chứng, offer và CTA.', icon: 'Globe', order: 6 },
    { name: 'Nội dung SEO', slug: 'seo', description: 'SEO title, meta description, outline và slug.', icon: 'BarChart3', order: 7 },
    { name: 'Review/Testimonial', slug: 'review', description: 'Đánh giá, testimonial và social proof.', icon: 'Star', order: 8 },
  ],
  tone: [
    { name: 'Khẩn cấp', slug: 'urgent', description: 'FOMO, ưu đãi giới hạn thời gian, flash sale.', icon: 'fire', order: 1 },
    { name: 'Chuyên nghiệp', slug: 'professional', description: 'Trang trọng, B2B và tạo cảm giác uy tín.', icon: 'briefcase', order: 2 },
    { name: 'Thân thiện', slug: 'friendly', description: 'Gần gũi, trò chuyện và dễ tiếp cận.', icon: 'smile', order: 3 },
    { name: 'Sang trọng', slug: 'luxury', description: 'Premium, cao cấp và tạo cảm giác đẳng cấp.', icon: 'sparkles', order: 4 },
    { name: 'Hài hước', slug: 'humorous', description: 'Vui vẻ, bắt trend và dễ chia sẻ.', icon: 'laugh', order: 5 },
    { name: 'Cảm xúc', slug: 'emotional', description: 'Storytelling, chạm vào insight và cảm xúc.', icon: 'heart', order: 6 },
  ],
};

const LEGACY_DEFAULT_NAMES = {
  industry: {
    ecommerce: 'Thuong Mai Dien Tu',
    realestate: 'Bat Dong San',
    technology: 'Cong Nghe',
    fnb: 'Am Thuc F&B',
    healthcare: 'Y Te & Suc Khoe',
    education: 'Giao Duc',
    finance: 'Tai Chinh',
    fashion: 'Thoi Trang',
    business: 'Doanh Nghiep',
    travel: 'Du Lich',
  },
  copy_type: {
    headline: 'Tieu De Quang Cao',
    description: 'Mo Ta San Pham',
    cta: 'Loi Keu Goi Hanh Dong',
    landing: 'Landing Page',
    seo: 'SEO Content',
  },
  tone: {
    urgent: 'Khan cap',
    professional: 'Chuyen nghiep',
    friendly: 'Than thien',
    luxury: 'Sang trong',
    humorous: 'Hai huoc',
    emotional: 'Cam xuc',
  },
};

function resolveGroup(groupParam) {
  const group = GROUP_PARAM_MAP[groupParam] || groupParam;
  if (!Object.values(GROUP_PARAM_MAP).includes(group)) {
    throw createError(400, 'Nhóm cấu hình Generate không hợp lệ');
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
  if (existingCount > 0) {
    await migrateLegacyDefaultLabels(group);
    return;
  }

  const defaults = DEFAULT_OPTIONS[group] || [];
  await GenerateOption.insertMany(defaults.map((item) => ({
    ...item,
    group,
    isActive: true,
    isDeleted: false,
  })));
}

async function migrateLegacyDefaultLabels(group) {
  const legacyNames = LEGACY_DEFAULT_NAMES[group] || {};
  const defaults = DEFAULT_OPTIONS[group] || [];

  const labelUpdates = defaults.map((item) => {
    const legacyName = legacyNames[item.slug];
    if (!legacyName) return null;

    return GenerateOption.updateOne(
      { group, slug: item.slug, name: legacyName },
      { $set: { name: item.name, description: item.description } },
    );
  }).filter(Boolean);

  const metadataUpdates = [];
  if (group === 'industry') {
    const travelDefault = defaults.find((item) => item.slug === 'travel');
    if (travelDefault) {
      metadataUpdates.push(GenerateOption.updateOne(
        { group, slug: 'travel', icon: { $in: ['Plane', 'plane', 'Transplant', 'transplant', ''] } },
        { $set: { icon: travelDefault.icon, color: travelDefault.color } },
      ));
    }
  }

  await Promise.all([...labelUpdates, ...metadataUpdates]);
}

async function ensureSlugAvailable(group, slug, exceptId) {
  const existing = await GenerateOption.findOne({ group, slug });
  if (existing && existing._id.toString() !== String(exceptId || '')) {
    throw createError(409, 'Slug cấu hình Generate đã tồn tại trong nhóm này');
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
  if (!slug) throw createError(400, 'Slug cấu hình Generate không hợp lệ');
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
  if (!option) throw createError(404, 'Không tìm thấy cấu hình Generate');
  return option;
}

async function updateOption(groupParam, id, payload) {
  const option = await findOptionOrThrow(groupParam, id);

  if (payload.slug || payload.name) {
    const slug = normalizeSlug({ slug: payload.slug || option.slug, name: payload.name || option.name });
    if (!slug) throw createError(400, 'Slug cấu hình Generate không hợp lệ');
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
