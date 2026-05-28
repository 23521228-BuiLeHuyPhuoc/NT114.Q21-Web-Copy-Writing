require('dotenv').config();

const { connectDB } = require('../config/database');
const AccountAdmin = require('../models/AccountAdmin');
const AccountUser = require('../models/AccountUser');
const Category = require('../models/Category');
const Content = require('../models/Content');
const Project = require('../models/Project');
const Template = require('../models/Template');
const UsageLog = require('../models/UsageLog');

async function upsertUser() {
  const email = 'customer@copypro.vn';
  let account = await AccountUser.findOne({ email }).select('+password');

  if (!account) {
    account = new AccountUser({
      name: 'Demo Customer',
      email,
      password: 'customer123',
      status: 'active',
      isVerified: true,
    });
  } else {
    account.name = 'Demo Customer';
    account.password = 'customer123';
    account.status = 'active';
    account.isVerified = true;
  }

  await account.save();
  return account;
}

async function upsertAdmin() {
  const email = 'admin@copypro.vn';
  let account = await AccountAdmin.findOne({ email }).select('+password');

  if (!account) {
    account = new AccountAdmin({
      name: 'Demo Admin',
      email,
      password: 'admin123',
      adminRole: 'super_admin',
      status: 'active',
    });
  } else {
    account.name = 'Demo Admin';
    account.password = 'admin123';
    account.adminRole = 'super_admin';
    account.status = 'active';
  }

  await account.save();
  return account;
}

async function upsertDemoProject(user) {
  const project = await Project.findOneAndUpdate(
    {
      userId: user._id,
      name: { $in: ['Campaign Hè 2026', 'Campaign He 2026'] },
    },
    {
      userId: user._id,
      name: 'Campaign Hè 2026',
      description: 'Demo project for the summer 2026 marketing campaign.',
      isArchived: false,
      color: 'from-green-500 to-emerald-600',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  return project;
}

async function upsertDemoContent(user, data) {
  let content = await Content.findOne({
    userId: user._id,
    title: data.title,
  });

  if (!content) {
    content = new Content({
      userId: user._id,
      ...data,
    });
  } else {
    Object.assign(content, data, {
      userId: user._id,
      isDeleted: false,
      deletedAt: null,
    });
  }

  await content.save();

  await UsageLog.findOneAndUpdate(
    {
      userId: user._id,
      contentId: content._id,
      action: 'generate',
    },
    {
      userId: user._id,
      contentId: content._id,
      model: content.modelUsed,
      promptTokens: 120,
      completionTokens: Math.max(20, Math.ceil(content.outputText.length / 4)),
      totalTokens: 120 + Math.max(20, Math.ceil(content.outputText.length / 4)),
      action: 'generate',
      status: 'fallback',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  return content;
}

async function seedDemoContents(user, project) {
  const projectId = project?._id || null;
  const shared = {
    userId: user._id,
    projectId,
    templateId: null,
    language: 'vi',
    isFavorite: false,
    isDeleted: false,
    deletedAt: null,
  };

  const contents = [
    {
      ...shared,
      title: 'Facebook Ad - Flash Sale Hè 2026',
      prompt: 'Viết headline quảng cáo cho chiến dịch flash sale mùa hè, tập trung vào FOMO và freeship.',
      outputText: [
        '# FLASH SALE HÈ 2026',
        '',
        'Giảm đến 70% cho bộ sưu tập mùa hè. Chỉ trong 24 giờ, đặt hàng ngay để nhận freeship và quà tặng giới hạn.',
        '',
        'CTA: Mua ngay trước khi ưu đãi kết thúc.',
      ].join('\n'),
      type: 'headline',
      tone: 'urgent',
      modelUsed: 'fallback-mvp',
      tags: ['sale', 'ecommerce'],
    },
    {
      ...shared,
      title: 'SEO Content - Khóa Học Online',
      prompt: 'Tạo title và meta description SEO cho khóa học online về AI copywriting.',
      outputText: [
        '# Khóa học AI Copywriting cho người mới bắt đầu',
        '',
        'Meta description: Học cách viết nội dung marketing bằng AI, tối ưu headline, email và social post trong thời gian ngắn.',
        '',
        'CTA: Đăng ký học thử miễn phí hôm nay.',
      ].join('\n'),
      type: 'seo',
      tone: 'professional',
      modelUsed: 'fallback-mvp',
      tags: ['seo', 'education'],
    },
    {
      ...shared,
      title: 'Email Marketing - Ra Mắt SaaS V2',
      prompt: 'Viết email marketing thông báo ra mắt phiên bản SaaS V2 cho khách hàng hiện tại.',
      outputText: [
        '# SaaS V2 đã sẵn sàng cho bạn trải nghiệm',
        '',
        'Chào bạn, phiên bản mới giúp tự động hóa quy trình nhanh hơn, báo cáo rõ hơn và tiết kiệm thời gian cho cả đội ngũ.',
        '',
        'CTA: Đặt lịch demo 15 phút để xem các tính năng mới.',
      ].join('\n'),
      type: 'email',
      tone: 'friendly',
      modelUsed: 'fallback-mvp',
      tags: ['saas', 'email'],
    },
  ];

  const seeded = [];
  for (const item of contents) {
    seeded.push(await upsertDemoContent(user, item));
  }

  return seeded;
}

async function upsertCategory(data) {
  return Category.findOneAndUpdate(
    { slug: data.slug },
    data,
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}

async function seedCategories() {
  const categories = [
    {
      name: 'Blog SEO',
      slug: 'seo',
      description: 'Template cho SEO title, meta description, outline và nội dung tìm kiếm.',
      order: 1,
      isActive: true,
    },
    {
      name: 'Product Copy',
      slug: 'product',
      description: 'Template cho mô tả sản phẩm, PDP và nội dung thương mại điện tử.',
      order: 2,
      isActive: true,
    },
    {
      name: 'Social Media',
      slug: 'social',
      description: 'Template cho caption, launch post, short video script và community post.',
      order: 3,
      isActive: true,
    },
    {
      name: 'Email Marketing',
      slug: 'email',
      description: 'Template cho email bán hàng, nuôi dưỡng lead, onboarding và win-back.',
      order: 4,
      isActive: true,
    },
    {
      name: 'Advertising',
      slug: 'ads',
      description: 'Template cho paid ads, headline, hook, CTA và creative brief.',
      order: 5,
      isActive: true,
    },
    {
      name: 'Landing Page',
      slug: 'landing',
      description: 'Template cho hero, landing page, offer, proof và conversion section.',
      order: 6,
      isActive: true,
    },
    {
      name: 'Review & Proof',
      slug: 'review',
      description: 'Template cho testimonial, case study, social proof và phản hồi khách hàng.',
      order: 7,
      isActive: true,
    },
    {
      name: 'B2B Sales',
      slug: 'b2b',
      description: 'Template cho cold email, proposal, case study và dịch vụ doanh nghiệp.',
      order: 8,
      isActive: true,
    },
    {
      name: 'Industry Specific',
      slug: 'industry',
      description: 'Template chuyên ngành cho bất động sản, y tế, giáo dục, tài chính, F&B và du lịch.',
      order: 9,
      isActive: true,
    },
  ];

  const seeded = [];
  for (const category of categories) {
    seeded.push(await upsertCategory(category));
  }
  return seeded;
}

async function upsertTemplate(data) {
  return Template.findOneAndUpdate(
    { slug: data.slug, isSystem: true },
    {
      ...data,
      isSystem: true,
      authorId: null,
      status: 'active',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}

async function seedTemplates() {
  const templates = [
    {
      name: 'Blog SEO tiếng Việt',
      slug: 'blog-seo-tieng-viet',
      description: 'Tạo SEO title, meta description, slug, outline và mở bài theo search intent.',
      category: 'seo',
      type: 'seo',
      systemPrompt: [
        'Bạn là SEO copywriter tiếng Việt có kinh nghiệm viết nội dung thương mại.',
        'Kết quả phải gồm: SEO title dưới 60 ký tự, meta description dưới 155 ký tự, slug không dấu, search intent, outline H2/H3 và đoạn mở bài 100-140 từ.',
        'Ưu tiên từ khóa chính, nhu cầu thật của người tìm kiếm, lợi ích rõ ràng và giọng văn tự nhiên. Không nhồi từ khóa, không viết lan sang email hay social caption.',
        'Luôn viết tiếng Việt tự nhiên và đầy đủ dấu tiếng Việt, trừ trường slug bắt buộc không dấu.',
      ].join('\n'),
      variables: [
        { key: 'keyword', label: 'Từ khóa chính', required: true },
        { key: 'audience', label: 'Đối tượng đọc', required: false },
        { key: 'intent', label: 'Search intent', required: false },
      ],
    },
    {
      name: 'Mô tả sản phẩm e-commerce',
      slug: 'mo-ta-san-pham',
      description: 'Viết mô tả sản phẩm theo lợi ích, tính năng, proof và CTA mua hàng.',
      category: 'product',
      type: 'description',
      systemPrompt: [
        'Bạn là copywriter thương mại điện tử chuyên viết trang sản phẩm có khả năng chuyển đổi.',
        'Kết quả phải gồm: mô tả ngắn, chân dung người mua, lợi ích chính, tính năng nổi bật, bằng chứng tin cậy, hướng dẫn chọn/mua và CTA.',
        'Luôn chuyển tính năng thành lợi ích cụ thể, tránh hứa hẹn quá mức, không dùng những câu rỗng như "chất lượng hàng đầu" nếu không có bằng chứng.',
        'Luôn viết tiếng Việt tự nhiên và đầy đủ dấu tiếng Việt.',
      ].join('\n'),
      variables: [
        { key: 'product', label: 'Sản phẩm', required: true },
        { key: 'benefit', label: 'Lợi ích chính', required: false },
        { key: 'proof', label: 'Bằng chứng tin cậy', required: false },
      ],
    },
    {
      name: 'Caption mạng xã hội',
      slug: 'caption-mang-xa-hoi',
      description: 'Caption có hook, insight, nội dung chính, CTA và hashtag vừa đủ.',
      category: 'social',
      type: 'social',
      systemPrompt: [
        'Bạn là social media copywriter cho thương hiệu Việt Nam.',
        'Mỗi phiên bản cần có: hook, insight hoặc bối cảnh, nội dung chính dễ đọc, CTA rõ và 3-6 hashtag liên quan.',
        'Giữ câu ngắn, tự nhiên, có thể dùng emoji nếu phù hợp nhưng không lạm dụng.',
        'Luôn viết tiếng Việt tự nhiên và đầy đủ dấu tiếng Việt; hashtag có thể không dấu nếu phù hợp nền tảng.',
      ].join('\n'),
      variables: [
        { key: 'topic', label: 'Chủ đề bài đăng', required: true },
        { key: 'platform', label: 'Kênh đăng bài', required: false, defaultValue: 'Facebook' },
        { key: 'audience', label: 'Đối tượng xem', required: false },
      ],
    },
    {
      name: 'Email marketing',
      slug: 'email-marketing',
      description: 'Email bán hàng gồm subject, preview, body rõ lợi ích và CTA duy nhất.',
      category: 'email',
      type: 'email',
      systemPrompt: [
        'Bạn là email marketing copywriter có kinh nghiệm tối ưu chuyển đổi.',
        'Kết quả phải có: subject, preview text, lời chào, bối cảnh, lợi ích chính, bằng chứng/offer, CTA duy nhất và P.S. nếu phù hợp.',
        'Viết rõ, gọn, không dùng spam words quá đà, không viết như social post. CTA phải khớp mục tiêu email.',
        'Luôn viết tiếng Việt tự nhiên và đầy đủ dấu tiếng Việt.',
      ].join('\n'),
      variables: [
        { key: 'offer', label: 'Ưu đãi/thông điệp', required: true },
        { key: 'segment', label: 'Nhóm khách hàng', required: false },
        { key: 'goal', label: 'Mục tiêu email', required: false },
      ],
    },
    {
      name: 'Headline quảng cáo',
      slug: 'headline-quang-cao',
      description: 'Headline quảng cáo ngắn, rõ lợi ích, có angle và CTA.',
      category: 'ads',
      type: 'headline',
      systemPrompt: [
        'Bạn là performance marketing copywriter.',
        'Tạo nhiều headline ngắn, rõ lợi ích, có angle khác nhau và có thể thêm subheadline nếu cần.',
        'Mỗi headline phải đọc nhanh, tránh chung chung, không bịa số liệu và có hướng hành động rõ.',
        'Luôn viết tiếng Việt tự nhiên và đầy đủ dấu tiếng Việt.',
      ].join('\n'),
      variables: [
        { key: 'offer', label: 'Offer chính', required: true },
        { key: 'pain_point', label: 'Nỗi đau khách hàng', required: false },
        { key: 'platform', label: 'Nền tảng quảng cáo', required: false },
      ],
    },
    {
      name: 'Pillar blog chuyên sâu',
      slug: 'pillar-blog-chuyen-sau',
      description: 'Lập khung bài blog dài có luận điểm, FAQ và liên kết nội bộ.',
      category: 'seo',
      type: 'seo',
      systemPrompt: [
        'Bạn là content strategist chuyên xây pillar content tiếng Việt.',
        'Hãy tạo cấu trúc bài viết chuyên sâu gồm: SEO title, meta description, slug, góc nhìn chính, outline H2/H3, FAQ, gợi ý internal link và đoạn mở bài.',
        'Mỗi heading phải có mục đích rõ, tránh outline chung chung kiểu liệt kê. Nội dung cần phục vụ người đọc đang so sánh, học hỏi hoặc chuẩn bị mua.',
        'Luôn viết tiếng Việt tự nhiên và đầy đủ dấu tiếng Việt.',
      ].join('\n'),
      variables: [
        { key: 'keyword', label: 'Từ khóa chính', required: true },
        { key: 'topic_cluster', label: 'Cụm chủ đề', required: false },
        { key: 'stage', label: 'Giai đoạn khách hàng', required: false },
      ],
    },
    {
      name: 'PDP mỹ phẩm tuân thủ claim',
      slug: 'pdp-my-pham-tuan-thu-claim',
      description: 'Mô tả mỹ phẩm/skincare thuyết phục nhưng tránh claim điều trị quá mức.',
      category: 'industry',
      type: 'description',
      systemPrompt: [
        'Bạn là beauty copywriter hiểu quy định claim mỹ phẩm.',
        'Viết mô tả PDP gồm: vấn đề của da, cơ chế lợi ích ở mức mỹ phẩm, thành phần nổi bật, cách dùng, đối tượng phù hợp, lưu ý an toàn và CTA.',
        'Không dùng claim điều trị bệnh, không hứa kết quả tuyệt đối, không nói "chữa khỏi". Dùng ngôn ngữ như "hỗ trợ", "giúp da trông", "cảm giác".',
        'Luôn viết tiếng Việt tự nhiên và đầy đủ dấu tiếng Việt.',
      ].join('\n'),
      variables: [
        { key: 'product', label: 'Tên sản phẩm', required: true },
        { key: 'skin_type', label: 'Loại da', required: false },
        { key: 'ingredients', label: 'Thành phần nổi bật', required: false },
      ],
    },
    {
      name: 'Menu copy F&B',
      slug: 'menu-copy-fnb',
      description: 'Viết mô tả món ăn, combo hoặc set menu có cảm giác ngon và bán được.',
      category: 'industry',
      type: 'description',
      systemPrompt: [
        'Bạn là copywriter F&B chuyên viết menu và mô tả món ăn.',
        'Kết quả cần có: tên món, mô tả cảm quan, nguyên liệu chính, điểm khác biệt, gợi ý dùng kèm/upsell và CTA ngắn.',
        'Viết cụ thể về hương vị, kết cấu, cách chế biến. Tránh dùng quá nhiều tính từ chung chung như "ngon tuyệt", "đỉnh cao" nếu không làm rõ vì sao.',
        'Luôn viết tiếng Việt tự nhiên và đầy đủ dấu tiếng Việt.',
      ].join('\n'),
      variables: [
        { key: 'dish', label: 'Món ăn/combo', required: true },
        { key: 'style', label: 'Phong cách nhà hàng', required: false },
        { key: 'upsell', label: 'Gợi ý upsell', required: false },
      ],
    },
    {
      name: 'Kịch bản TikTok/Reels 30 giây',
      slug: 'kich-ban-tiktok-reels-30-giay',
      description: 'Tạo short video script có hook, cảnh quay, lời thoại và CTA.',
      category: 'social',
      type: 'social',
      systemPrompt: [
        'Bạn là short-form video copywriter.',
        'Viết kịch bản 30 giây gồm: hook 3 giây đầu, phân cảnh, lời thoại/on-screen text, gợi ý visual, CTA và caption đăng kèm.',
        'Tập trung vào một insight duy nhất, tránh nhồi quá nhiều thông điệp. Gợi ý nhịp dựng rõ để team quay có thể thực hiện.',
        'Luôn viết tiếng Việt tự nhiên và đầy đủ dấu tiếng Việt.',
      ].join('\n'),
      variables: [
        { key: 'product', label: 'Sản phẩm/dịch vụ', required: true },
        { key: 'audience', label: 'Khán giả mục tiêu', required: false },
        { key: 'platform', label: 'Nền tảng', required: false, defaultValue: 'TikTok' },
      ],
    },
    {
      name: 'Launch post sản phẩm mới',
      slug: 'launch-post-san-pham-moi',
      description: 'Bài ra mắt sản phẩm mới có lý do tin tưởng và CTA đặt mua/đăng ký.',
      category: 'social',
      type: 'social',
      systemPrompt: [
        'Bạn là brand copywriter viết bài ra mắt sản phẩm mới.',
        'Kết quả cần có: hook ra mắt, bối cảnh ra đời, điểm khác biệt, lợi ích chính, proof nếu có, offer mở bán và CTA.',
        'Giọng văn chuyên nghiệp, không thổi phồng. Nếu thiếu thông tin proof, hãy dùng placeholder rõ ràng thay vì tự bịa số liệu.',
        'Luôn viết tiếng Việt tự nhiên và đầy đủ dấu tiếng Việt.',
      ].join('\n'),
      variables: [
        { key: 'product', label: 'Sản phẩm mới', required: true },
        { key: 'differentiator', label: 'Điểm khác biệt', required: false },
        { key: 'offer', label: 'Ưu đãi mở bán', required: false },
      ],
    },
    {
      name: 'Email bỏ giỏ hàng',
      slug: 'email-bo-gio-hang',
      description: 'Email nhắc giỏ hàng bỏ quên có lý do quay lại và CTA hoàn tất đơn.',
      category: 'email',
      type: 'email',
      systemPrompt: [
        'Bạn là lifecycle email copywriter cho e-commerce.',
        'Viết email bỏ giỏ hàng gồm: subject, preview text, nhắc sản phẩm, xử lý lý do phân vân, lợi ích/ưu đãi nếu có, CTA hoàn tất đơn và P.S. hỗ trợ.',
        'Không tạo áp lực giả. Nếu dùng khan hiếm hoặc mã giảm giá, phải thể hiện như thông tin có điều kiện hoặc placeholder.',
        'Luôn viết tiếng Việt tự nhiên và đầy đủ dấu tiếng Việt.',
      ].join('\n'),
      variables: [
        { key: 'product', label: 'Sản phẩm trong giỏ', required: true },
        { key: 'objection', label: 'Lý do khách phân vân', required: false },
        { key: 'incentive', label: 'Ưu đãi nhắc lại', required: false },
      ],
    },
    {
      name: 'Email nuôi dưỡng lead B2B',
      slug: 'email-nuoi-duong-lead-b2b',
      description: 'Email giáo dục và nuôi dưỡng lead B2B trước khi mời demo/tư vấn.',
      category: 'b2b',
      type: 'email',
      systemPrompt: [
        'Bạn là B2B lifecycle copywriter.',
        'Viết email nuôi dưỡng lead gồm: subject, preview, insight chuyên môn, vấn đề kinh doanh, lời khuyên thực tế, proof nhẹ và CTA mềm như xem checklist, đặt lịch tư vấn hoặc xem demo.',
        'Không bán quá sớm. Ưu tiên giúp người đọc hiểu vấn đề và thấy thương hiệu có năng lực chuyên môn.',
        'Luôn viết tiếng Việt tự nhiên và đầy đủ dấu tiếng Việt.',
      ].join('\n'),
      variables: [
        { key: 'solution', label: 'Giải pháp/dịch vụ', required: true },
        { key: 'buyer_role', label: 'Vai trò người mua', required: false },
        { key: 'pain_point', label: 'Vấn đề chính', required: false },
      ],
    },
    {
      name: 'Google Search Ads',
      slug: 'google-search-ads',
      description: 'Tạo bộ headline và description cho Google Search Ads.',
      category: 'ads',
      type: 'headline',
      systemPrompt: [
        'Bạn là Google Ads copywriter.',
        'Kết quả cần có: 10 headline ngắn, 4 description, 4 sitelink gợi ý và lưu ý compliance nếu ngành nhạy cảm.',
        'Headline phải cụ thể, khớp intent tìm kiếm, tránh claim không kiểm chứng. Description cần có lợi ích, proof và CTA rõ.',
        'Luôn viết tiếng Việt tự nhiên và đầy đủ dấu tiếng Việt.',
      ].join('\n'),
      variables: [
        { key: 'keyword', label: 'Nhóm từ khóa', required: true },
        { key: 'offer', label: 'Offer', required: false },
        { key: 'landing_page', label: 'Trang đích', required: false },
      ],
    },
    {
      name: 'Facebook Lead Ads bất động sản',
      slug: 'facebook-lead-ads-bat-dong-san',
      description: 'Bộ copy thu lead bất động sản có câu hỏi form và lưu ý pháp lý.',
      category: 'industry',
      type: 'headline',
      systemPrompt: [
        'Bạn là real estate performance copywriter.',
        'Tạo copy Facebook Lead Ads gồm: primary text, headline, description, CTA, 3-5 câu hỏi form và lưu ý triển khai.',
        'Không cam kết lợi nhuận, không thổi phồng pháp lý/tiến độ/giá. Nếu thiếu dữ liệu, dùng placeholder rõ ràng như [giá cập nhật], [pháp lý].',
        'Luôn viết tiếng Việt tự nhiên và đầy đủ dấu tiếng Việt.',
      ].join('\n'),
      variables: [
        { key: 'project', label: 'Tên dự án', required: true },
        { key: 'buyer', label: 'Nhóm khách mua', required: false },
        { key: 'location', label: 'Vị trí', required: false },
      ],
    },
    {
      name: 'Landing page SaaS B2B',
      slug: 'landing-page-saas-b2b',
      description: 'Landing page cho SaaS B2B có pain point, proof và CTA demo.',
      category: 'landing',
      type: 'landing',
      systemPrompt: [
        'Bạn là senior B2B SaaS copywriter.',
        'Kết quả phải gồm: hero headline, subheadline, pain point, 3 lợi ích chính, cách hoạt động, proof/case study, objection handling, CTA chính và CTA phụ.',
        'Viết cho người ra quyết định bận rộn. Tránh buzzword, ưu tiên tác động kinh doanh, quy trình triển khai và bằng chứng cụ thể.',
        'Luôn viết tiếng Việt tự nhiên và đầy đủ dấu tiếng Việt.',
      ].join('\n'),
      variables: [
        { key: 'product', label: 'Tên SaaS', required: true },
        { key: 'buyer_role', label: 'Vai trò người mua', required: false },
        { key: 'business_outcome', label: 'Kết quả kinh doanh mong muốn', required: false },
      ],
    },
    {
      name: 'Landing page khóa học',
      slug: 'landing-page-khoa-hoc',
      description: 'Landing page bán khóa học có outcome, curriculum, mentor và proof.',
      category: 'landing',
      type: 'landing',
      systemPrompt: [
        'Bạn là education copywriter.',
        'Viết landing page khóa học gồm: headline outcome, đối tượng phù hợp, vấn đề trước khi học, lộ trình module, dự án/thực hành, mentor, kết quả kỳ vọng, học phí/offer và CTA.',
        'Không hứa chắc chắn có việc hoặc tăng lương. Dùng ngôn ngữ thực tế, cho thấy điều kiện để đạt kết quả.',
        'Luôn viết tiếng Việt tự nhiên và đầy đủ dấu tiếng Việt.',
      ].join('\n'),
      variables: [
        { key: 'course', label: 'Tên khóa học', required: true },
        { key: 'learner', label: 'Học viên mục tiêu', required: false },
        { key: 'outcome', label: 'Kết quả học tập', required: false },
      ],
    },
    {
      name: 'Landing page dịch vụ tư vấn',
      slug: 'landing-page-dich-vu-tu-van',
      description: 'Landing page cho dịch vụ tư vấn có quy trình, deliverables và CTA đặt lịch.',
      category: 'landing',
      type: 'landing',
      systemPrompt: [
        'Bạn là B2B service copywriter.',
        'Kết quả phải gồm: headline, subheadline, vấn đề khách hàng, dịch vụ bao gồm, quy trình làm việc, deliverables, case proof, FAQ ngắn và CTA đặt lịch.',
        'Làm rõ phạm vi dịch vụ và kết quả bàn giao. Không cam kết outcome không kiểm soát được như doanh thu tăng chắc chắn.',
        'Luôn viết tiếng Việt tự nhiên và đầy đủ dấu tiếng Việt.',
      ].join('\n'),
      variables: [
        { key: 'service', label: 'Dịch vụ', required: true },
        { key: 'client_type', label: 'Khách hàng mục tiêu', required: false },
        { key: 'deliverables', label: 'Bàn giao chính', required: false },
      ],
    },
    {
      name: 'Bộ CTA chuyển đổi',
      slug: 'bo-cta-chuyen-doi',
      description: 'Tạo CTA chính, phụ và microcopy cho website hoặc landing page.',
      category: 'ads',
      type: 'cta',
      systemPrompt: [
        'Bạn là conversion copywriter.',
        'Tạo bộ CTA gồm: CTA chính, CTA phụ, microcopy dưới nút, CTA cho sticky bar, CTA cuối trang và lưu ý dùng trong từng vị trí.',
        'CTA phải cụ thể về hành động và giá trị nhận được. Tránh câu chung chung như "Tìm hiểu thêm" nếu có thể viết rõ hơn.',
        'Luôn viết tiếng Việt tự nhiên và đầy đủ dấu tiếng Việt.',
      ].join('\n'),
      variables: [
        { key: 'goal', label: 'Mục tiêu chuyển đổi', required: true },
        { key: 'offer', label: 'Offer', required: false },
        { key: 'page_context', label: 'Vị trí/ngữ cảnh trang', required: false },
      ],
    },
    {
      name: 'Testimonial có bối cảnh',
      slug: 'testimonial-co-boi-canh',
      description: 'Viết testimonial tự nhiên có bối cảnh, vấn đề, trải nghiệm và kết quả.',
      category: 'review',
      type: 'review',
      systemPrompt: [
        'Bạn là copywriter chuyên viết social proof đáng tin.',
        'Kết quả cần có: quote tự nhiên ở ngôi thứ nhất, chân dung người đánh giá, bối cảnh trước khi dùng, trải nghiệm cụ thể, kết quả và CTA mềm.',
        'Không bịa tên công ty hoặc số liệu nếu chưa được cung cấp. Nếu cần, dùng placeholder rõ ràng. Review phải nghe như người thật, không như quảng cáo.',
        'Luôn viết tiếng Việt tự nhiên và đầy đủ dấu tiếng Việt.',
      ].join('\n'),
      variables: [
        { key: 'customer', label: 'Chân dung khách hàng', required: false },
        { key: 'product', label: 'Sản phẩm/dịch vụ', required: true },
        { key: 'result', label: 'Kết quả đạt được', required: false },
      ],
    },
    {
      name: 'Case study B2B ngắn',
      slug: 'case-study-b2b-ngan',
      description: 'Tạo case study B2B theo cấu trúc thách thức, giải pháp, kết quả.',
      category: 'b2b',
      type: 'review',
      systemPrompt: [
        'Bạn là B2B case study writer.',
        'Viết case study ngắn gồm: khách hàng, bối cảnh, thách thức, giải pháp triển khai, kết quả đo được, quote và CTA xem demo/tư vấn.',
        'Chỉ dùng số liệu được cung cấp. Nếu thiếu số liệu, ghi placeholder [số liệu cần xác nhận] thay vì tự tạo.',
        'Luôn viết tiếng Việt tự nhiên và đầy đủ dấu tiếng Việt.',
      ].join('\n'),
      variables: [
        { key: 'client', label: 'Khách hàng/ngành', required: true },
        { key: 'challenge', label: 'Thách thức', required: false },
        { key: 'result', label: 'Kết quả', required: false },
      ],
    },
    {
      name: 'Copy dịch vụ y tế an toàn',
      slug: 'copy-dich-vu-y-te-an-toan',
      description: 'Viết copy dịch vụ y tế/sức khỏe chuyên nghiệp, tránh claim quá mức.',
      category: 'industry',
      type: 'description',
      systemPrompt: [
        'Bạn là healthcare copywriter viết nội dung an toàn và dễ hiểu.',
        'Kết quả cần có: mô tả dịch vụ, đối tượng phù hợp, quy trình, lợi ích ở mức thông tin, đội ngũ/trang thiết bị nếu có, CTA đặt lịch và lưu ý y khoa.',
        'Không chẩn đoán, không hứa chữa khỏi, không thay thế tư vấn bác sĩ. Luôn thêm nhắc nhở tham khảo chuyên môn khi có triệu chứng.',
        'Luôn viết tiếng Việt tự nhiên và đầy đủ dấu tiếng Việt.',
      ].join('\n'),
      variables: [
        { key: 'service', label: 'Dịch vụ y tế', required: true },
        { key: 'audience', label: 'Đối tượng phù hợp', required: false },
        { key: 'clinic', label: 'Cơ sở/phòng khám', required: false },
      ],
    },
    {
      name: 'Copy tài chính có disclaimer',
      slug: 'copy-tai-chinh-co-disclaimer',
      description: 'Viết nội dung tài chính rõ ràng, có cảnh báo rủi ro và tránh cam kết lợi nhuận.',
      category: 'industry',
      type: 'description',
      systemPrompt: [
        'Bạn là financial copywriter có tư duy compliance.',
        'Kết quả cần có: mô tả sản phẩm/dịch vụ, đối tượng phù hợp, lợi ích, rủi ro/lưu ý, điều kiện quan trọng, CTA và disclaimer.',
        'Không cam kết lợi nhuận, không tạo cảm giác đảm bảo an toàn tuyệt đối. Với đầu tư, luôn nhắc người đọc cân nhắc khẩu vị rủi ro và tham khảo tư vấn phù hợp.',
        'Luôn viết tiếng Việt tự nhiên và đầy đủ dấu tiếng Việt.',
      ].join('\n'),
      variables: [
        { key: 'product', label: 'Sản phẩm/dịch vụ tài chính', required: true },
        { key: 'audience', label: 'Đối tượng mục tiêu', required: false },
        { key: 'risk_note', label: 'Lưu ý rủi ro', required: false },
      ],
    },
    {
      name: 'Copy tour du lịch',
      slug: 'copy-tour-du-lich',
      description: 'Viết trang tour du lịch có lịch trình, điểm nổi bật, bao gồm và CTA.',
      category: 'industry',
      type: 'landing',
      systemPrompt: [
        'Bạn là travel copywriter.',
        'Viết copy tour gồm: hero headline, subheadline, điểm nổi bật, lịch trình ngắn, bao gồm/không bao gồm, đối tượng phù hợp, lưu ý mùa vụ và CTA nhận báo giá.',
        'Không mô tả mơ hồ như "thiên đường". Ưu tiên trải nghiệm cụ thể, thông tin thực tế và điều kiện cần xác nhận.',
        'Luôn viết tiếng Việt tự nhiên và đầy đủ dấu tiếng Việt.',
      ].join('\n'),
      variables: [
        { key: 'tour', label: 'Tên tour', required: true },
        { key: 'duration', label: 'Thời lượng', required: false },
        { key: 'traveler', label: 'Nhóm khách phù hợp', required: false },
      ],
    },
  ];

  const seeded = [];
  for (const template of templates) {
    seeded.push(await upsertTemplate(template));
  }
  return seeded;
}

async function seed() {
  await connectDB();
  const [user, admin] = await Promise.all([upsertUser(), upsertAdmin()]);
  const project = await upsertDemoProject(user);
  const [categories, templates, contents] = await Promise.all([
    seedCategories(),
    seedTemplates(),
    seedDemoContents(user, project),
  ]);

  console.log(`Seeded AccountUser: ${user.email}`);
  console.log(`Seeded AccountAdmin: ${admin.email}`);
  console.log(`Seeded Project: ${project.name}`);
  console.log(`Seeded Category: ${categories.length}`);
  console.log(`Seeded Template: ${templates.length}`);
  console.log(`Seeded Content: ${contents.length}`);
}

seed()
  .then(() => {
    console.log('Seed completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed failed:', error.message);
    process.exit(1);
  });
