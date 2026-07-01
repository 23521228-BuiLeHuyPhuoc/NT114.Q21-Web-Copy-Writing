require('dotenv').config();

const { connectDB } = require('../config/database');
const AccountAdmin = require('../models/AccountAdmin');
const AccountUser = require('../models/AccountUser');
const Content = require('../models/Content');
const FineTuneDataset = require('../models/FineTuneDataset');
const FineTuneExample = require('../models/FineTuneExample');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const Payment = require('../models/Payment');
const Plan = require('../models/Plan');
const Project = require('../models/Project');
const Subscription = require('../models/Subscription');
const Template = require('../models/Template');
const UsageLog = require('../models/UsageLog');
const { ALL_GENERATOR_MODEL_ACCESS } = require('../config/generatorModels');

async function upsertUser() {
  const email = process.env.DEMO_CUSTOMER_EMAIL || 'customer@example.com';
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
  const email = process.env.DEMO_ADMIN_EMAIL || 'admin@example.com';
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

function buildFineTuneExamples(profile) {
  return Array.from({ length: 12 }, (_, index) => {
    const number = index + 1;
    return {
      inputText: [
        `Brief ${number} for ${profile.industry}: write ${profile.contentType} for ${profile.product}.`,
        `Audience: ${profile.audience}. Tone: ${profile.tone}.`,
        'Goal: make the copy specific, useful, and ready for a marketing campaign.',
      ].join(' '),
      outputText: [
        `${profile.hook} ${profile.product} helps ${profile.audience} see the value quickly and act with confidence.`,
        `Main benefit: ${profile.benefit}. Keep the message concrete, avoid vague promises, and close with a clear next step.`,
        `CTA: ${profile.cta}.`,
      ].join(' '),
      industry: profile.industry,
      tone: profile.tone,
      qualityScore: 88 + (index % 8),
      isValid: true,
      validationErrors: [],
    };
  });
}

async function upsertFineTuneDataset(user, profile) {
  return FineTuneDataset.findOneAndUpdate(
    { userId: user._id, name: profile.datasetName },
    {
      $set: {
        userId: user._id,
        name: profile.datasetName,
        industry: profile.industry,
        description: profile.datasetDescription,
        sourceType: 'manual',
        status: 'submitted',
        exampleCount: 12,
        validExampleCount: 12,
        qualityScore: 91,
        language: 'vi',
        tags: [profile.industry, 'demo', 'fine-tune'],
        lastValidatedAt: new Date(),
        archivedAt: null,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}

async function replaceFineTuneExamples(user, dataset, profile) {
  await FineTuneExample.deleteMany({ userId: user._id, datasetId: dataset._id });
  return FineTuneExample.insertMany(buildFineTuneExamples(profile).map((example) => ({
    ...example,
    userId: user._id,
    datasetId: dataset._id,
  })));
}

async function seedFineTunePipelines(user) {
  const profiles = [
    {
      datasetName: 'E-commerce Brand Voice Dataset',
      datasetDescription: 'Demo dataset for urgent ecommerce copy, offer framing, and CTA consistency.',
      name: 'Brand Voice - E-commerce',
      industry: 'ecommerce',
      product: 'summer fashion sale',
      audience: 'online shoppers who care about price and fast delivery',
      contentType: 'ad headline and short landing copy',
      tone: 'urgent',
      hook: 'Limited-time deals should feel clear, useful, and easy to act on.',
      benefit: 'customers understand the discount, delivery condition, and product value in one scan',
      cta: 'Shop the offer before the best sizes run out',
      description: 'Demo fine-tune for ecommerce copy with urgent offers and strong CTA patterns.',
      status: 'completed',
      progress: 100,
      samples: 120,
      epochs: 5,
      accuracy: 94.2,
      loss: 0.142,
      providerJobId: 'ftjob_demo_ecommerce',
      startedAt: new Date('2026-03-20T02:00:00.000Z'),
      finishedAt: new Date('2026-03-20T04:23:00.000Z'),
      isActive: true,
    },
    {
      datasetName: 'Luxury Real Estate Dataset',
      datasetDescription: 'Demo dataset for premium real estate copy with advisory positioning.',
      name: 'Luxury Real Estate Voice',
      industry: 'realestate',
      product: 'riverside apartment project',
      audience: 'high-intent buyers comparing premium apartments',
      contentType: 'lead ad and consultation copy',
      tone: 'luxury',
      hook: 'Premium property copy should sound calm, credible, and specific.',
      benefit: 'buyers see location, lifestyle value, and consultation path without exaggerated claims',
      cta: 'Book a private consultation for the latest availability',
      description: 'Running demo job for luxury real estate voice and lead conversion copy.',
      status: 'running',
      progress: 55,
      samples: 85,
      epochs: 5,
      accuracy: 78.3,
      loss: 0.342,
      providerJobId: 'ftjob_demo_realestate',
      fineTunedModelId: '',
      startedAt: new Date('2026-03-23T01:00:00.000Z'),
      finishedAt: null,
    },
    {
      datasetName: 'Healthcare Compassionate Dataset',
      datasetDescription: 'Demo dataset for healthcare copy with safe claims and patient-friendly wording.',
      name: 'Healthcare Compassionate',
      industry: 'healthcare',
      product: 'clinic consultation service',
      audience: 'patients who need clear and reassuring medical service information',
      contentType: 'service description and appointment CTA',
      tone: 'professional',
      hook: 'Healthcare copy must be careful, reassuring, and easy to understand.',
      benefit: 'patients know the service scope, process, and when to ask a professional',
      cta: 'Schedule a consultation with the clinic team',
      description: 'Completed demo job for safe healthcare copy and compassionate service explanations.',
      status: 'completed',
      progress: 100,
      samples: 95,
      epochs: 5,
      accuracy: 91,
      loss: 0.189,
      providerJobId: 'ftjob_demo_healthcare',
      startedAt: new Date('2026-03-10T07:00:00.000Z'),
      finishedAt: new Date('2026-03-10T09:45:00.000Z'),
      isActive: false,
    },
    {
      datasetName: 'FNB Promotion Dataset',
      datasetDescription: 'Demo dataset for restaurant promotions, menu captions, and combo offer copy.',
      name: 'F&B Promotion Voice',
      industry: 'fnb',
      product: 'healthy lunch combo',
      audience: 'office workers looking for fast and balanced lunch options',
      contentType: 'social caption and menu offer copy',
      tone: 'friendly',
      hook: 'Food promotion copy should make the offer vivid without sounding generic.',
      benefit: 'customers understand the menu, price value, and ordering action quickly',
      cta: 'Order the lunch combo before the peak hour',
      description: 'Queued demo job for F&B promotions and menu launch captions.',
      status: 'queued',
      progress: 0,
      samples: 60,
      epochs: 3,
      accuracy: 0,
      loss: 0,
      providerJobId: 'ftjob_demo_fnb',
      fineTunedModelId: '',
      startedAt: null,
      finishedAt: null,
    },
  ];

  const datasets = [];
  for (const profile of profiles) {
    const dataset = await upsertFineTuneDataset(user, profile);
    await replaceFineTuneExamples(user, dataset, profile);
    datasets.push(dataset);
  }

  return datasets;
}
async function cleanupAdminRegistrationData() {
  const result = await AccountAdmin.deleteMany({
    status: { $in: ['pending', 'rejected'] },
  });

  return result.deletedCount || 0;
}

async function upsertDemoProject(user, data) {
  const project = await Project.findOneAndUpdate(
    {
      userId: user._id,
      name: { $in: data.aliases || [data.name] },
    },
    {
      userId: user._id,
      name: data.name,
      description: data.description,
      industry: data.industry,
      isArchived: Boolean(data.isArchived),
      color: data.color,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  return project;
}

async function seedDemoProjects(user) {
  const projectData = [
    {
      key: 'summer',
      name: 'Campaign Hè 2026',
      aliases: ['Campaign Hè 2026', 'Campaign He 2026'],
      industry: 'Thương mại điện tử',
      description: 'Bộ nội dung cho chiến dịch flash sale mùa hè của một sàn thời trang online: quảng cáo, landing page, email và social post.',
      color: 'from-green-500 to-emerald-600',
    },
    {
      key: 'saas',
      name: 'Ra mắt SaaS OmniCRM',
      industry: 'Công nghệ B2B',
      description: 'Nội dung launch phiên bản V2 cho nền tảng CRM: landing page, email giới thiệu tính năng, case study và CTA đặt lịch demo.',
      color: 'from-teal-500 to-cyan-600',
    },
    {
      key: 'realEstate',
      name: 'The Grand Riverside Q2',
      industry: 'Bất động sản',
      description: 'Copy marketing cho dự án căn hộ ven sông trong quý 2: lead ads, bài giới thiệu vị trí, email tư vấn và landing page thu lead.',
      color: 'from-indigo-500 to-sky-600',
    },
    {
      key: 'education',
      name: 'Khóa học AI Copywriting',
      industry: 'Giáo dục trực tuyến',
      description: 'Chiến dịch tuyển sinh khóa học AI copywriting cho người mới: SEO article, landing page, email nurturing và social proof.',
      color: 'from-orange-500 to-amber-600',
    },
    {
      key: 'fnb',
      name: 'Menu mùa hè Nhà Bếp Lá',
      industry: 'F&B',
      description: 'Nội dung ra mắt menu mùa hè cho nhà hàng healthy casual: mô tả món, combo trưa văn phòng, caption social và email khách thân thiết.',
      color: 'from-lime-500 to-green-600',
    },
    {
      key: 'beauty',
      name: 'Serum Trà Xanh An Nhiên',
      industry: 'Mỹ phẩm',
      description: 'Copy cho sản phẩm serum trà xanh: PDP tuân thủ claim, bài social launch, email giới thiệu và FAQ chăm sóc da.',
      color: 'from-pink-500 to-rose-600',
    },
  ];

  const entries = await Promise.all(projectData.map(async (item) => {
    const project = await upsertDemoProject(user, item);
    return [item.key, project];
  }));

  return Object.fromEntries(entries);
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
      quotaUnits: Math.max(1, Math.ceil((120 + Math.max(20, Math.ceil(content.outputText.length / 4))) / 1000)),
      action: 'generate',
      status: 'success',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  return content;
}

async function seedDemoContents(user, projects) {
  const shared = {
    userId: user._id,
    templateId: null,
    language: 'vi',
    isFavorite: false,
    isDeleted: false,
    deletedAt: null,
  };

  const contents = [
    {
      ...shared,
      projectId: projects.summer?._id || null,
      title: 'Facebook Ad - Flash Sale Hè 2026',
      prompt: 'Viết headline quảng cáo cho chiến dịch flash sale mùa hè của shop thời trang online, tập trung vào FOMO và freeship.',
      outputText: [
        '# FLASH SALE HÈ 2026',
        '',
        'Giảm đến 70% cho váy linen, áo thun basic và phụ kiện đi biển. Chỉ trong 24 giờ, đơn từ 499K được freeship toàn quốc và nhận thêm voucher 80K cho lần mua kế tiếp.',
        '',
        'CTA: Chốt outfit hè ngay trước khi size đẹp hết hàng.',
      ].join('\n'),
      type: 'headline',
      tone: 'urgent',
      modelUsed: 'demo-seed',
      tags: ['sale', 'ecommerce'],
    },
    {
      ...shared,
      projectId: projects.summer?._id || null,
      title: 'Landing Page - Bộ Sưu Tập Đi Biển',
      prompt: 'Viết hero landing page cho bộ sưu tập đi biển trong chiến dịch hè 2026.',
      outputText: [
        '# Outfit đi biển nhẹ tênh cho mùa hè rực rỡ',
        '',
        'Bộ sưu tập Hè 2026 được thiết kế cho những chuyến đi nhiều nắng: chất vải thoáng, form dễ mặc, màu sắc nổi bật khi lên ảnh và vẫn đủ gọn để xếp vào vali cuối tuần.',
        '',
        'Lợi ích chính:',
        '- Phối sẵn theo set để tiết kiệm thời gian chọn đồ.',
        '- Chất liệu linen, cotton và rayon giúp da dễ chịu cả ngày.',
        '- Nhiều size, nhiều dáng cho đi biển, dạo phố và cafe sau chuyến đi.',
        '',
        'CTA: Khám phá bộ sưu tập hè.',
      ].join('\n'),
      type: 'landing',
      tone: 'friendly',
      modelUsed: 'demo-seed',
      tags: ['ecommerce', 'fashion', 'summer'],
    },
    {
      ...shared,
      projectId: projects.summer?._id || null,
      title: 'Email - Nhắc Ưu Đãi Flash Sale Hè',
      prompt: 'Viết email nhắc khách hàng quay lại mua trước khi flash sale hè kết thúc.',
      outputText: [
        '# Subject: Còn vài giờ để giữ outfit hè giá tốt',
        '',
        'Chào bạn, flash sale Hè 2026 đang bước vào những giờ cuối. Các mẫu váy linen, áo chống nắng mỏng nhẹ và set đi biển bán chạy đang giảm đến 70%.',
        '',
        'Nếu bạn đã để vài món trong giỏ hàng, đây là thời điểm tốt để hoàn tất đơn trước khi size đẹp hết hàng. Đơn từ 499K vẫn được freeship toàn quốc.',
        '',
        'CTA: Quay lại giỏ hàng.',
      ].join('\n'),
      type: 'email',
      tone: 'urgent',
      modelUsed: 'demo-seed',
      tags: ['ecommerce', 'email', 'sale'],
    },
    {
      ...shared,
      projectId: projects.education?._id || null,
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
      modelUsed: 'demo-seed',
      tags: ['seo', 'education'],
    },
    {
      ...shared,
      projectId: projects.education?._id || null,
      title: 'Landing Page - Khóa Học AI Copywriting 6 Tuần',
      prompt: 'Viết landing page cho khóa học AI copywriting 6 tuần dành cho marketer mới.',
      outputText: [
        '# Làm chủ AI Copywriting trong 6 tuần',
        '',
        'Khóa học giúp marketer, chủ shop và freelancer biết cách biến brief thành nội dung bán hàng rõ ràng: từ headline, email, caption đến landing page.',
        '',
        'Bạn sẽ học cách viết prompt có cấu trúc, kiểm tra chất lượng đầu ra và chỉnh sửa copy để phù hợp thương hiệu thay vì phụ thuộc hoàn toàn vào AI.',
        '',
        'Sau khóa học, học viên hoàn thành 4 dự án thực hành: một landing page, một chuỗi email, một bộ social post và một bài SEO ngắn.',
        '',
        'CTA: Nhận lộ trình học thử.',
      ].join('\n'),
      type: 'landing',
      tone: 'professional',
      modelUsed: 'demo-seed',
      tags: ['education', 'landing', 'ai-copywriting'],
    },
    {
      ...shared,
      projectId: projects.education?._id || null,
      title: 'Email Nurturing - Bài Học AI Copywriting Đầu Tiên',
      prompt: 'Viết email nuôi dưỡng lead cho người đã tải checklist AI copywriting.',
      outputText: [
        '# Subject: Một lỗi phổ biến khi dùng AI viết nội dung',
        '',
        'Chào bạn, nhiều người bắt đầu dùng AI bằng một câu lệnh rất ngắn như “viết giúp tôi caption bán hàng”. Kết quả thường chung chung vì AI chưa có đủ bối cảnh về khách hàng, offer và giọng thương hiệu.',
        '',
        'Trong khóa AI Copywriting 6 tuần, bạn sẽ học cách xây prompt theo 5 lớp: mục tiêu, đối tượng, insight, cấu trúc đầu ra và tiêu chí đánh giá.',
        '',
        'CTA: Xem buổi học mẫu 12 phút.',
      ].join('\n'),
      type: 'email',
      tone: 'friendly',
      modelUsed: 'demo-seed',
      tags: ['education', 'email', 'lead-nurturing'],
    },
    {
      ...shared,
      projectId: projects.saas?._id || null,
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
      modelUsed: 'demo-seed',
      tags: ['saas', 'email'],
    },
    {
      ...shared,
      projectId: projects.saas?._id || null,
      title: 'Landing Page - OmniCRM V2',
      prompt: 'Viết landing page cho sản phẩm OmniCRM V2 dành cho đội sales B2B.',
      outputText: [
        '# CRM gọn hơn cho đội sales đang tăng trưởng',
        '',
        'OmniCRM V2 giúp đội sales gom lead từ website, form quảng cáo và inbox về một pipeline duy nhất. Mỗi cơ hội bán hàng có lịch sử tương tác, nhắc việc tự động và báo cáo trạng thái rõ ràng cho quản lý.',
        '',
        'Lợi ích chính:',
        '- Không bỏ sót lead nóng vì dữ liệu phân tán.',
        '- Theo dõi từng deal theo giai đoạn và người phụ trách.',
        '- Tạo báo cáo tuần trong vài phút thay vì tổng hợp thủ công.',
        '',
        'CTA: Đặt lịch demo 15 phút.',
      ].join('\n'),
      type: 'landing',
      tone: 'professional',
      modelUsed: 'demo-seed',
      tags: ['saas', 'b2b', 'crm'],
    },
    {
      ...shared,
      projectId: projects.saas?._id || null,
      title: 'Case Study - Đội Sales Tăng Tỷ Lệ Follow-up',
      prompt: 'Viết case study ngắn cho OmniCRM V2 về cải thiện follow-up lead.',
      outputText: [
        '# Case study: Từ bảng tính rời rạc đến pipeline sales rõ ràng',
        '',
        'Một công ty tư vấn B2B có 12 nhân sự sales từng quản lý lead bằng nhiều file Google Sheet. Sau khi chuyển sang OmniCRM V2, toàn bộ lead mới được tự động phân người phụ trách và nhắc follow-up theo SLA.',
        '',
        'Kết quả sau 8 tuần thử nghiệm nội bộ: thời gian tổng hợp báo cáo giảm từ 3 giờ xuống dưới 30 phút mỗi tuần, tỷ lệ lead được follow-up trong 24 giờ tăng rõ rệt.',
        '',
        'CTA: Xem quy trình triển khai CRM mẫu.',
      ].join('\n'),
      type: 'review',
      tone: 'professional',
      modelUsed: 'demo-seed',
      tags: ['saas', 'case-study', 'sales'],
    },
    {
      ...shared,
      projectId: projects.realEstate?._id || null,
      title: 'Facebook Lead Ads - The Grand Riverside',
      prompt: 'Viết bộ copy Facebook Lead Ads cho dự án căn hộ The Grand Riverside.',
      outputText: [
        '# Primary text',
        'The Grand Riverside dành cho khách hàng muốn sống gần trung tâm nhưng vẫn có không gian ven sông yên tĩnh. Dự án có căn hộ 1-3 phòng ngủ, tiện ích nội khu đầy đủ và chính sách thanh toán linh hoạt theo từng giai đoạn.',
        '',
        'Headline: Nhận bảng giá The Grand Riverside Q2',
        'Description: Cập nhật mặt bằng, chính sách thanh toán và lịch tham quan nhà mẫu.',
        '',
        'CTA: Đăng ký nhận tư vấn.',
      ].join('\n'),
      type: 'headline',
      tone: 'professional',
      modelUsed: 'demo-seed',
      tags: ['realestate', 'lead-ads', 'riverside'],
    },
    {
      ...shared,
      projectId: projects.realEstate?._id || null,
      title: 'Landing Page - Nhận Bảng Giá The Grand Riverside',
      prompt: 'Viết landing page thu lead cho người quan tâm căn hộ The Grand Riverside.',
      outputText: [
        '# Nhận bảng giá và lịch tham quan The Grand Riverside',
        '',
        'The Grand Riverside là lựa chọn cho gia đình trẻ và nhà đầu tư đang tìm căn hộ ven sông có kết nối thuận tiện đến trung tâm. Landing page cần giúp khách hàng hiểu nhanh vị trí, loại căn, tiện ích và bước tiếp theo để được tư vấn.',
        '',
        'Thông tin nổi bật:',
        '- Căn hộ 1-3 phòng ngủ, phù hợp ở thật hoặc cho thuê.',
        '- Tiện ích nội khu gồm hồ bơi, khu trẻ em, lounge cư dân và shophouse.',
        '- Chính sách thanh toán theo tiến độ, cần tư vấn cụ thể theo từng căn.',
        '',
        'CTA: Nhận bảng giá mới nhất.',
      ].join('\n'),
      type: 'landing',
      tone: 'professional',
      modelUsed: 'demo-seed',
      tags: ['realestate', 'landing', 'lead'],
    },
    {
      ...shared,
      projectId: projects.realEstate?._id || null,
      title: 'Email Tư Vấn - Lịch Tham Quan Nhà Mẫu',
      prompt: 'Viết email gửi lead bất động sản đã đăng ký nhận bảng giá.',
      outputText: [
        '# Subject: Lịch tham quan nhà mẫu The Grand Riverside tuần này',
        '',
        'Chào anh/chị, cảm ơn anh/chị đã quan tâm The Grand Riverside. Đội ngũ tư vấn có thể hỗ trợ anh/chị xem mặt bằng căn 1-3 phòng ngủ, chính sách thanh toán và lịch tham quan nhà mẫu trong tuần này.',
        '',
        'Nếu anh/chị đang so sánh để ở thật, chúng tôi sẽ ưu tiên thông tin về hướng căn, tiện ích gia đình và kết nối di chuyển. Nếu anh/chị quan tâm đầu tư, đội ngũ sẽ gửi thêm dữ liệu tham khảo về nguồn cung khu vực và tiềm năng cho thuê.',
        '',
        'CTA: Chọn khung giờ tư vấn.',
      ].join('\n'),
      type: 'email',
      tone: 'professional',
      modelUsed: 'demo-seed',
      tags: ['realestate', 'email', 'consulting'],
    },
    {
      ...shared,
      projectId: projects.fnb?._id || null,
      title: 'Menu Copy - Salad Gà Áp Chảo Sốt Chanh Dây',
      prompt: 'Viết mô tả menu cho món salad gà áp chảo sốt chanh dây của nhà hàng healthy.',
      outputText: [
        '# Salad gà áp chảo sốt chanh dây',
        '',
        'Ức gà áp chảo mềm, rau xanh giòn, cà chua bi và hạt điều rang được trộn cùng sốt chanh dây chua ngọt nhẹ. Món ăn đủ no cho bữa trưa văn phòng nhưng vẫn giữ cảm giác thanh, không nặng bụng.',
        '',
        'Gợi ý dùng kèm: trà ô long lạnh hoặc nước ép táo cần tây.',
        'CTA: Thêm vào combo trưa healthy.',
      ].join('\n'),
      type: 'description',
      tone: 'friendly',
      modelUsed: 'demo-seed',
      tags: ['fnb', 'menu', 'healthy'],
    },
    {
      ...shared,
      projectId: projects.fnb?._id || null,
      title: 'Caption - Combo Trưa Văn Phòng Nhà Bếp Lá',
      prompt: 'Viết caption Facebook cho combo trưa văn phòng của Nhà Bếp Lá.',
      outputText: [
        '# Trưa nay ăn gọn mà vẫn đủ chất',
        '',
        'Combo trưa Nhà Bếp Lá có salad/protein, một phần tinh bột vừa đủ và đồ uống ít đường. Phù hợp cho ngày bận họp liên tục nhưng bạn vẫn muốn ăn tử tế.',
        '',
        'Đặt trước 10:30 để bếp chuẩn bị đúng giờ giao trưa.',
        '',
        '#NhaBepLa #ComboTrua #HealthyLunch',
      ].join('\n'),
      type: 'social',
      tone: 'friendly',
      modelUsed: 'demo-seed',
      tags: ['fnb', 'social', 'lunch'],
    },
    {
      ...shared,
      projectId: projects.fnb?._id || null,
      title: 'Email - Mời Khách Thân Thiết Thử Menu Hè',
      prompt: 'Viết email mời khách thân thiết thử menu hè mới.',
      outputText: [
        '# Subject: Mời bạn thử menu hè mới tại Nhà Bếp Lá',
        '',
        'Chào bạn, menu hè của Nhà Bếp Lá đã có mặt với các món nhẹ, nhiều rau xanh và sốt trái cây tươi. Tuần này, khách thân thiết được tặng một phần nước ép khi đặt combo trưa bất kỳ.',
        '',
        'Một vài món mới: salad gà sốt chanh dây, cơm gạo lứt cá hồi áp chảo và bowl đậu hũ mè rang.',
        '',
        'CTA: Xem menu hè.',
      ].join('\n'),
      type: 'email',
      tone: 'friendly',
      modelUsed: 'demo-seed',
      tags: ['fnb', 'email', 'loyalty'],
    },
    {
      ...shared,
      projectId: projects.beauty?._id || null,
      title: 'PDP - Serum Trà Xanh An Nhiên',
      prompt: 'Viết mô tả sản phẩm serum trà xanh theo hướng an toàn claim mỹ phẩm.',
      outputText: [
        '# Serum Trà Xanh An Nhiên',
        '',
        'Serum Trà Xanh An Nhiên phù hợp với làn da dầu, da dễ bóng nhờn hoặc da cần cảm giác dịu nhẹ sau một ngày dài. Công thức tập trung vào chiết xuất trà xanh, niacinamide nồng độ vừa phải và panthenol để hỗ trợ da trông cân bằng, mịn hơn.',
        '',
        'Lợi ích:',
        '- Hỗ trợ làm dịu cảm giác khó chịu trên da.',
        '- Giúp bề mặt da trông ít bóng dầu hơn khi dùng đều đặn.',
        '- Kết cấu mỏng nhẹ, dễ dùng trước kem dưỡng.',
        '',
        'Lưu ý: Đây là sản phẩm mỹ phẩm, không thay thế tư vấn da liễu.',
      ].join('\n'),
      type: 'description',
      tone: 'professional',
      modelUsed: 'demo-seed',
      tags: ['beauty', 'skincare', 'pdp'],
    },
    {
      ...shared,
      projectId: projects.beauty?._id || null,
      title: 'Social Launch - Serum Trà Xanh',
      prompt: 'Viết bài social launch cho serum trà xanh dành cho da dầu.',
      outputText: [
        '# Da dầu cũng cần được chăm sóc dịu nhẹ',
        '',
        'Serum Trà Xanh An Nhiên ra đời cho những ngày da dễ bóng, bí và cần một bước chăm sóc mỏng nhẹ. Công thức có trà xanh, niacinamide và panthenol giúp da trông cân bằng hơn mà không tạo cảm giác nặng mặt.',
        '',
        'Phù hợp dùng buổi sáng trước kem chống nắng hoặc buổi tối trước kem dưỡng.',
        '',
        'CTA: Xem bảng thành phần đầy đủ.',
      ].join('\n'),
      type: 'social',
      tone: 'friendly',
      modelUsed: 'demo-seed',
      tags: ['beauty', 'social', 'launch'],
    },
    {
      ...shared,
      projectId: projects.beauty?._id || null,
      title: 'FAQ - Cách Dùng Serum Trà Xanh',
      prompt: 'Viết FAQ ngắn cho trang sản phẩm serum trà xanh.',
      outputText: [
        '# Câu hỏi thường gặp',
        '',
        'Serum phù hợp với loại da nào?',
        'Sản phẩm phù hợp với da dầu, da hỗn hợp thiên dầu hoặc da muốn routine mỏng nhẹ.',
        '',
        'Dùng serum vào bước nào?',
        'Sau toner và trước kem dưỡng. Ban ngày nên dùng thêm kem chống nắng.',
        '',
        'Có dùng chung với BHA/AHA được không?',
        'Có thể dùng trong cùng routine nếu da đã quen hoạt chất, nhưng nên bắt đầu chậm và theo dõi phản ứng của da.',
      ].join('\n'),
      type: 'review',
      tone: 'professional',
      modelUsed: 'demo-seed',
      tags: ['beauty', 'faq', 'skincare'],
    },
  ];

  const seeded = [];
  for (const item of contents) {
    seeded.push(await upsertDemoContent(user, item));
  }

  return seeded;
}

async function upsertDemoNotification(user, data) {
  const notification = await Notification.findOneAndUpdate(
    {
      userId: user._id,
      title: data.title,
    },
    {
      userId: user._id,
      title: data.title,
      message: data.message,
      type: data.type,
      isRead: Boolean(data.isRead),
      readAt: data.isRead ? (data.readAt || new Date()) : null,
      actionUrl: data.actionUrl || '',
      createdAt: data.createdAt || new Date(),
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    },
  );

  return notification;
}

async function seedDemoNotifications(user) {
  const now = Date.now();
  const notifications = [
    {
      title: 'Chào mừng bạn đến với CopyPro',
      message: 'Tài khoản demo đã sẵn sàng. Bạn có thể tạo nội dung, lưu vào dự án và theo dõi kết quả ngay trong dashboard.',
      type: 'account',
      isRead: false,
      actionUrl: '/dashboard',
      createdAt: new Date(now - 10 * 60 * 1000),
    },
    {
      title: 'Thư viện template đã được cập nhật',
      message: 'CopyPro đã bổ sung thêm template theo ngành để bạn tạo headline, email, landing page và social post chuyên nghiệp hơn.',
      type: 'system',
      isRead: false,
      actionUrl: '/templates',
      createdAt: new Date(now - 2 * 60 * 60 * 1000),
    },
    {
      title: 'Nội dung mẫu đã được tạo thành công',
      message: 'Một bản copy demo đã được lưu trong thư viện nội dung để bạn dùng thử luồng xem chi tiết và quản lý dự án.',
      type: 'ai',
      isRead: true,
      actionUrl: '/contents',
      createdAt: new Date(now - 24 * 60 * 60 * 1000),
    },
  ];

  return Promise.all(notifications.map((notification) => upsertDemoNotification(user, notification)));
}

async function seedDemoAuditLogs(user, admin, contents) {
  const entries = [
    ['admin.account.created', 'account_user', user._id, 'info', 'Created account "' + user.email + '"'],
    ['admin.content.updated', 'content', contents[0]?._id || null, 'info', 'Updated content "' + (contents[0]?.title || 'demo') + '"'],
    ['admin.content.deleted', 'content', contents[1]?._id || null, 'warning', 'Moved content "' + (contents[1]?.title || 'demo') + '" to trash'],
    ['system.seed.completed', 'system', null, 'info', 'Seed completed for demo admin logs'],
  ].map(([action, targetType, targetId, level, details]) => ({
    actorId: admin._id,
    actorType: 'admin',
    actorEmail: admin.email,
    actorRole: admin.adminRole,
    action,
    targetType,
    targetId,
    level,
    metadata: { details },
    ip: '127.0.0.1',
  }));

  await AuditLog.deleteMany({ actorEmail: admin.email, action: { $in: entries.map((entry) => entry.action) } });
  return AuditLog.insertMany(entries, { ordered: false });
}

async function upsertPlan(data) {
  return Plan.findOneAndUpdate(
    { slug: data.slug },
    { $set: data },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}

async function seedBillingPlans() {
  const plans = [
    {
      slug: 'free',
      name: 'Miễn Phí',
      description: 'Dành cho cá nhân mới bắt đầu khám phá AI copywriting.',
      priceMonthly: 0,
      priceYearly: 0,
      currency: 'VND',
      limits: { copyMonthly: 30, apiCallsMonthly: 200, apiCallsFiveHours: 25, apiCallsWeekly: 80, fineTuneModels: 0, plagiarismChecks: 0, seats: 1, historyDays: 7 },
      features: ['30 copy/tháng', '5 ngành nghề cơ bản', '20 template', 'GPT-3.5 Turbo'],
      excludedFeatures: ['GPT-4o', 'Fine-tuning Studio', 'API Access', 'Xuất file (.docx, .pdf)'],
      allowedModels: ['openrouter-free', 'openrouter-qwen-free'],
      isPopular: false,
      isActive: true,
      sortOrder: 1,
    },
    {
      slug: 'pro',
      name: 'Pro',
      description: 'Dành cho freelancer và marketer chuyên nghiệp.',
      priceMonthly: 299000,
      priceYearly: 2990000,
      currency: 'VND',
      limits: { copyMonthly: 500, apiCallsMonthly: 5000, apiCallsFiveHours: 800, apiCallsWeekly: 2000, fineTuneModels: 3, plagiarismChecks: 100, seats: 3, historyDays: 30 },
      features: ['500 copy/tháng', '100+ template', 'GPT-4o + GPT-3.5 + Llama 3.1', 'Fine-tuning Studio (3 models)', 'API Access (5.000 calls/tháng)'],
      excludedFeatures: ['Dedicated CSM'],
      allowedModels: ALL_GENERATOR_MODEL_ACCESS,
      isPopular: true,
      isActive: true,
      sortOrder: 2,
    },
    {
      slug: 'business',
      name: 'Business',
      description: 'Giải pháp cho team và doanh nghiệp muốn scale nhanh.',
      priceMonthly: 799000,
      priceYearly: 7990000,
      currency: 'VND',
      limits: { copyMonthly: 3000, apiCallsMonthly: 50000, apiCallsFiveHours: 8000, apiCallsWeekly: 20000, fineTuneModels: 10, plagiarismChecks: 500, seats: 10, historyDays: 90 },
      features: ['3.000 copy/tháng', 'Tất cả template', 'Tất cả model AI', 'API Access (50.000 calls/tháng)', 'Fine-tuning Studio (10 models)', '500 lượt kiểm tra đạo văn', 'Dedicated support'],
      excludedFeatures: [],
      allowedModels: [],
      isPopular: false,
      isActive: true,
      sortOrder: 3,
    },
  ];

  const seededPlans = await Promise.all(plans.map((plan) => upsertPlan(plan)));
  await Plan.updateOne(
    { slug: 'enterprise', isDeleted: { $ne: true } },
    { $set: { isActive: false, isDeleted: true, deletedAt: new Date() } },
  );

  return seededPlans;
}

async function upsertSubscription(user, plan, data) {
  return Subscription.findOneAndUpdate(
    { userId: user._id },
    {
      $set: {
        userId: user._id,
        planId: plan._id,
        status: data.status || 'active',
        billingCycle: data.billingCycle || 'monthly',
        currentPeriodStart: data.currentPeriodStart,
        currentPeriodEnd: data.currentPeriodEnd,
        cancelAtPeriodEnd: Boolean(data.cancelAtPeriodEnd),
        provider: data.provider || 'manual',
        providerSubscriptionId: data.providerSubscriptionId || '',
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}

async function upsertPayment(data) {
  return Payment.findOneAndUpdate(
    { invoiceNo: data.invoiceNo },
    {
      $set: {
        invoiceNo: data.invoiceNo,
        userId: data.userId,
        planId: data.planId,
        subscriptionId: data.subscriptionId || null,
        amount: data.amount,
        currency: data.currency || 'VND',
        method: data.method || 'manual',
        provider: data.provider || 'manual',
        status: data.status || 'pending',
        paidAt: data.paidAt || null,
        periodStart: data.periodStart || null,
        periodEnd: data.periodEnd || null,
        metadata: data.metadata || {},
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}

async function seedBilling(user) {
  const [free, pro, business] = await seedBillingPlans();

  const subscription = await upsertSubscription(user, pro, {
    status: 'active',
    billingCycle: 'monthly',
    currentPeriodStart: new Date('2026-05-23T00:00:00.000Z'),
    currentPeriodEnd: new Date('2026-06-23T00:00:00.000Z'),
    provider: 'manual',
  });

  const payments = await Promise.all([
    upsertPayment({
      invoiceNo: 'PAY-001',
      userId: user._id,
      planId: pro._id,
      subscriptionId: subscription._id,
      amount: 299000,
      currency: 'VND',
      method: 'visa',
      provider: 'manual',
      status: 'success',
      paidAt: new Date('2026-03-23T14:30:00.000Z'),
      periodStart: new Date('2026-03-23T00:00:00.000Z'),
      periodEnd: new Date('2026-04-23T00:00:00.000Z'),
      metadata: { note: 'Demo payment for Pro plan' },
    }),
    upsertPayment({
      invoiceNo: 'PAY-002',
      userId: user._id,
      planId: business._id,
      subscriptionId: null,
      amount: 799000,
      currency: 'VND',
      method: 'momo',
      provider: 'manual',
      status: 'success',
      paidAt: new Date('2026-03-23T11:15:00.000Z'),
      periodStart: new Date('2026-03-23T00:00:00.000Z'),
      periodEnd: new Date('2026-04-23T00:00:00.000Z'),
      metadata: { note: 'Business plan payment demo' },
    }),
    upsertPayment({
      invoiceNo: 'PAY-003',
      userId: user._id,
      planId: pro._id,
      subscriptionId: subscription._id,
      amount: 299000,
      currency: 'VND',
      method: 'vnpay',
      provider: 'vnpay',
      status: 'pending',
      paidAt: null,
      periodStart: null,
      periodEnd: null,
      metadata: { note: 'Pending payment demo' },
    }),
    upsertPayment({
      invoiceNo: 'PAY-004',
      userId: user._id,
      planId: pro._id,
      subscriptionId: subscription._id,
      amount: 299000,
      currency: 'VND',
      method: 'visa',
      provider: 'manual',
      status: 'failed',
      paidAt: new Date('2026-03-22T09:20:00.000Z'),
      periodStart: null,
      periodEnd: null,
      metadata: { note: 'Failed payment demo' },
    }),
    upsertPayment({
      invoiceNo: 'PAY-005',
      userId: user._id,
      planId: business._id,
      subscriptionId: null,
      amount: 799000,
      currency: 'VND',
      method: 'bank',
      provider: 'manual',
      status: 'success',
      paidAt: new Date('2026-03-21T18:00:00.000Z'),
      periodStart: new Date('2026-03-21T00:00:00.000Z'),
      periodEnd: new Date('2026-04-21T00:00:00.000Z'),
      metadata: { note: 'Bank transfer demo' },
    }),
    upsertPayment({
      invoiceNo: 'PAY-006',
      userId: user._id,
      planId: pro._id,
      subscriptionId: subscription._id,
      amount: 299000,
      currency: 'VND',
      method: 'momo',
      provider: 'manual',
      status: 'success',
      paidAt: new Date('2026-03-20T10:30:00.000Z'),
      periodStart: new Date('2026-03-20T00:00:00.000Z'),
      periodEnd: new Date('2026-04-20T00:00:00.000Z'),
      metadata: { note: 'MoMo demo' },
    }),
  ]);

  return { plans: [free, pro, business], subscription, payments };
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
  const deletedPendingAdmins = await cleanupAdminRegistrationData();
  const [user, admin] = await Promise.all([upsertUser(), upsertAdmin()]);
  const projects = await seedDemoProjects(user);
  const [templates, contents] = await Promise.all([
    seedTemplates(),
    seedDemoContents(user, projects),
  ]);
  const notifications = await seedDemoNotifications(user);
  const fineTuneDatasets = await seedFineTunePipelines(user);
  const auditLogs = await seedDemoAuditLogs(user, admin, contents);
  const billing = await seedBilling(user);

  console.log(`Seeded AccountUser: ${user.email}`);
  console.log(`Seeded AccountAdmin: ${admin.email}`);
  console.log(`Deleted PendingAdmin: ${deletedPendingAdmins}`);
  console.log(`Seeded Project: ${Object.keys(projects).length}`);
  console.log(`Seeded Template: ${templates.length}`);
  console.log(`Seeded Content: ${contents.length}`);
  console.log(`Seeded Notification: ${notifications.length}`);
  console.log(`Seeded FineTuneDataset: ${fineTuneDatasets.length}`);
  console.log(`Seeded AuditLog: ${auditLogs.length}`);
  console.log(`Seeded Plan: ${billing.plans.length}`);
  console.log(`Seeded Payment: ${billing.payments.length}`);
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
