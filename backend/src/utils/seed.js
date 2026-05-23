require('dotenv').config();

const mongoose = require('mongoose');
const { connectDB } = require('../config/database');
const AccountAdmin = require('../models/AccountAdmin');
const AccountUser = require('../models/AccountUser');
const Content = require('../models/Content');
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

function getDemoProjectId() {
  const value = process.env.DEMO_PROJECT_ID;
  if (!value || !mongoose.Types.ObjectId.isValid(value)) return null;
  return new mongoose.Types.ObjectId(value);
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

async function seedDemoContents(user) {
  const projectId = getDemoProjectId();
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
      title: 'Facebook Ad - Flash Sale He 2026',
      prompt: 'Viet headline quang cao cho chien dich flash sale mua he, tap trung vao FOMO va freeship.',
      outputText: [
        '# FLASH SALE HE 2026',
        '',
        'Giam den 70% cho bo suu tap mua he. Chi trong 24 gio, dat hang ngay de nhan freeship va qua tang gioi han.',
        '',
        'CTA: Mua ngay truoc khi uu dai ket thuc.',
      ].join('\n'),
      type: 'headline',
      tone: 'urgent',
      modelUsed: 'fallback-mvp',
      tags: ['sale', 'ecommerce'],
    },
    {
      ...shared,
      title: 'SEO Content - Khoa Hoc Online',
      prompt: 'Tao title va meta description SEO cho khoa hoc online ve AI copywriting.',
      outputText: [
        '# Khoa hoc AI Copywriting cho nguoi moi bat dau',
        '',
        'Meta description: Hoc cach viet noi dung marketing bang AI, toi uu headline, email va social post trong thoi gian ngan.',
        '',
        'CTA: Dang ky hoc thu mien phi hom nay.',
      ].join('\n'),
      type: 'seo',
      tone: 'professional',
      modelUsed: 'fallback-mvp',
      tags: ['seo', 'education'],
    },
    {
      ...shared,
      title: 'Email Marketing - Ra Mat SaaS V2',
      prompt: 'Viet email marketing thong bao ra mat phien ban SaaS V2 cho khach hang hien tai.',
      outputText: [
        '# SaaS V2 da san sang cho ban trai nghiem',
        '',
        'Chao ban, phien ban moi giup tu dong hoa quy trinh nhanh hon, bao cao ro hon va tiet kiem thoi gian cho ca doi ngu.',
        '',
        'CTA: Dat lich demo 15 phut de xem cac tinh nang moi.',
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

async function seed() {
  await connectDB();
  const [user, admin] = await Promise.all([upsertUser(), upsertAdmin()]);
  const contents = await seedDemoContents(user);

  console.log(`Seeded AccountUser: ${user.email}`);
  console.log(`Seeded AccountAdmin: ${admin.email}`);
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
