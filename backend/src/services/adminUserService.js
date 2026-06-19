const AccountAdmin = require('../models/AccountAdmin');
const AccountUser = require('../models/AccountUser');
const createError = require('../utils/createError');

function toAccountType(value) {
  if (value === 'admin') return 'admin';
  if (value === 'user' || value === 'customer') return 'user';
  throw createError(400, 'Invalid account type');
}

function getModel(accountType) {
  return toAccountType(accountType) === 'admin' ? AccountAdmin : AccountUser;
}

function serializeUser(account) {
  return {
    id: account._id.toString(),
    name: account.name,
    email: account.email,
    role: 'customer',
    customerRole: account.customerRole || 'pro_customer',
    status: account.status,
    avatar: account.avatar,
    isVerified: account.isVerified,
    createdAt: account.createdAt,
    deletedAt: account.deletedAt,
  };
}

function serializeAdmin(account) {
  return {
    id: account._id.toString(),
    name: account.name,
    email: account.email,
    role: 'admin',
    adminRole: account.adminRole,
    status: account.status,
    avatar: account.avatar,
    createdAt: account.createdAt,
    deletedAt: account.deletedAt,
  };
}

function serializeAccount(account, accountType) {
  return toAccountType(accountType) === 'admin'
    ? serializeAdmin(account)
    : serializeUser(account);
}

function sortNewestFirst(items) {
  return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

async function listUsers({ deleted = false } = {}) {
  const filter = deleted ? { isDeleted: true } : { isDeleted: { $ne: true } };
  const adminFilter = {
    ...filter,
    status: { $in: ['active', 'locked'] },
  };
  const [users, admins] = await Promise.all([
    AccountUser.find(filter).sort({ createdAt: -1 }),
    AccountAdmin.find(adminFilter).sort({ createdAt: -1 }),
  ]);

  return sortNewestFirst([
    ...users.map((account) => serializeUser(account)),
    ...admins.map((account) => serializeAdmin(account)),
  ]);
}

async function ensureEmailAvailable(Model, email, exceptId) {
  const existing = await Model.findOne({ email: email.toLowerCase() });
  if (existing && existing._id.toString() !== String(exceptId || '')) {
    throw createError(409, 'Email is already in use');
  }
}

function normalizeUserStatus(status) {
  if (!status) return 'active';
  if (!['active', 'locked'].includes(status)) {
    throw createError(400, 'Customer status must be active or locked');
  }
  return status;
}

function normalizeAdminStatus(status) {
  if (!status) return 'active';
  if (!['active', 'locked'].includes(status)) {
    throw createError(400, 'Admin status must be active or locked');
  }
  return status;
}

async function createUser(payload) {
  if (payload.role === 'admin') {
    await ensureEmailAvailable(AccountAdmin, payload.email);
    const account = await AccountAdmin.create({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      adminRole: payload.adminRole || 'analyst',
      status: normalizeAdminStatus(payload.status),
    });
    return serializeAdmin(account);
  }

  await ensureEmailAvailable(AccountUser, payload.email);
  const account = await AccountUser.create({
    name: payload.name,
    email: payload.email,
    password: payload.password,
    customerRole: payload.customerRole || 'pro_customer',
    status: normalizeUserStatus(payload.status),
    isVerified: true,
  });
  return serializeUser(account);
}

async function findAccountOrThrow(accountType, id, includeDeleted = false) {
  const Model = getModel(accountType);
  const query = includeDeleted ? { _id: id } : { _id: id, isDeleted: { $ne: true } };
  const account = await Model.findOne(query);
  if (!account) throw createError(404, 'Account not found');
  return account;
}

async function updateUser(accountType, id, payload) {
  const type = toAccountType(accountType);
  const account = await findAccountOrThrow(type, id);
  const Model = getModel(type);

  if (payload.email) {
    await ensureEmailAvailable(Model, payload.email, id);
    account.email = payload.email;
  }
  if (payload.name) account.name = payload.name;

  if (type === 'admin') {
    if (payload.adminRole) account.adminRole = payload.adminRole;
    if (payload.status) account.status = normalizeAdminStatus(payload.status);
  } else {
    if (payload.customerRole) account.customerRole = payload.customerRole;
    if (payload.status) account.status = normalizeUserStatus(payload.status);
  }

  await account.save();
  return serializeAccount(account, type);
}

async function softDelete(accountType, id) {
  const type = toAccountType(accountType);
  const account = await findAccountOrThrow(type, id);
  account.isDeleted = true;
  account.deletedAt = new Date();
  await account.save();
  return serializeAccount(account, type);
}

async function restore(accountType, id) {
  const type = toAccountType(accountType);
  const account = await findAccountOrThrow(type, id, true);
  account.isDeleted = false;
  account.deletedAt = null;
  await account.save();
  return serializeAccount(account, type);
}

async function permanentDelete(accountType, id) {
  const type = toAccountType(accountType);
  const Model = getModel(type);
  const deleted = await Model.findByIdAndDelete(id);
  if (!deleted) throw createError(404, 'Account not found');
}

module.exports = {
  listUsers,
  createUser,
  updateUser,
  softDelete,
  restore,
  permanentDelete,
};
