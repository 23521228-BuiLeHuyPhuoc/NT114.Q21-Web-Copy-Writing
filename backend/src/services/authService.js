const AccountAdmin = require('../models/AccountAdmin');
const AccountUser = require('../models/AccountUser');
const ForgotPassword = require('../models/ForgotPassword');
const createError = require('../utils/createError');
const { signToken } = require('../utils/jwt');
const { sendPasswordResetOtpEmail } = require('./mailService');
const {
  compareOtp,
  generateOtp,
  getOtpExpiresAt,
  hashOtp,
} = require('../utils/otp');

const MAX_OTP_ATTEMPTS = 5;

function getRemainingSeconds(date) {
  return Math.max(0, Math.ceil((new Date(date).getTime() - Date.now()) / 1000));
}

function getAccountModel(accountType) {
  if (accountType === 'admin') return AccountAdmin;
  return AccountUser;
}

function serializeAccount(account, accountType) {
  const role = accountType === 'admin' ? 'admin' : 'customer';
  const data = {
    id: account._id.toString(),
    name: account.name,
    email: account.email,
    role,
    status: account.status,
    avatar: account.avatar,
    createdAt: account.createdAt,
  };

  if (accountType === 'admin') {
    data.adminRole = account.adminRole;
  } else {
    data.isVerified = account.isVerified;
  }

  return data;
}

function createAuthData(account, accountType) {
  return {
    token: signToken(account, accountType),
    user: serializeAccount(account, accountType),
  };
}

async function findAccountByEmail(accountType, email) {
  return getAccountModel(accountType).findOne({ email: email.toLowerCase() });
}

async function findAccountForLogin(accountType, email) {
  return getAccountModel(accountType).findOne({ email: email.toLowerCase() }).select('+password');
}

async function ensureEmailAvailable(accountType, email) {
  const existing = await findAccountByEmail(accountType, email);
  if (existing) {
    throw createError(409, 'Email is already in use');
  }
}

async function registerUser(payload) {
  await ensureEmailAvailable('user', payload.email);

  const account = await AccountUser.create({
    name: payload.name,
    email: payload.email,
    password: payload.password,
    status: 'active',
    isVerified: true,
  });

  return serializeAccount(account, 'user');
}

async function loginUser(email, password) {
  const account = await findAccountForLogin('user', email);
  if (!account || !(await account.comparePassword(password))) {
    throw createError(401, 'Email or password is incorrect');
  }

  if (account.status === 'locked') {
    throw createError(403, 'Account is locked');
  }

  account.lastLoginAt = new Date();
  await account.save();

  return createAuthData(account, 'user');
}

async function loginAdmin(email, password) {
  const account = await findAccountForLogin('admin', email);
  if (!account || !(await account.comparePassword(password))) {
    throw createError(401, 'Email or password is incorrect');
  }

  if (account.status === 'locked') {
    throw createError(403, 'Admin account is locked');
  }

  account.lastLoginAt = new Date();
  await account.save();

  return createAuthData(account, 'admin');
}

async function createPasswordReset(account, accountType) {
  const email = account.email.toLowerCase();
  const activeOtp = await findActiveOtp(email, accountType);

  if (activeOtp) {
    const retryAfterSeconds = getRemainingSeconds(activeOtp.expiresAt);

    throw createError(
      429,
      `OTP is still valid. Please wait ${retryAfterSeconds} seconds before requesting a new code.`,
      null,
      { retryAfterSeconds },
    );
  }

  const otp = generateOtp();
  const expiresAt = getOtpExpiresAt();

  await ForgotPassword.updateMany(
    {
      email,
      accountType,
      usedAt: null,
      expiresAt: { $lte: new Date() },
    },
    { $set: { usedAt: new Date() } },
  );

  const record = await ForgotPassword.create({
    email,
    accountType,
    accountId: account._id,
    otpHash: await hashOtp(otp),
    expiresAt,
  });

  return {
    otp,
    record,
    expiresInSeconds: getRemainingSeconds(expiresAt),
  };
}

async function forgotPassword(accountType, email) {
  const account = await findAccountByEmail(accountType, email);
  if (!account) {
    return { exists: false };
  }

  const { otp, record, expiresInSeconds } = await createPasswordReset(account, accountType);

  try {
    await sendPasswordResetOtpEmail({
      to: account.email,
      otp,
      accountType,
      name: account.name,
    });
  } catch (error) {
    record.usedAt = new Date();
    await record.save();

    if (error.statusCode) {
      throw error;
    }

    throw createError(502, 'Could not send OTP email');
  }

  return { exists: true, expiresInSeconds };
}

async function findActiveOtp(email, accountType) {
  return ForgotPassword.findOne({
    email: email.toLowerCase(),
    accountType,
    usedAt: null,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });
}

async function verifyOtpOrThrow(email, accountType, otp) {
  const record = await findActiveOtp(email, accountType);
  if (!record) {
    throw createError(400, 'OTP is invalid or expired');
  }

  if (record.attempts >= MAX_OTP_ATTEMPTS) {
    throw createError(429, 'Too many OTP attempts');
  }

  const matched = await compareOtp(otp, record.otpHash);
  if (!matched) {
    record.attempts += 1;
    await record.save();
    throw createError(400, 'OTP is invalid or expired');
  }

  return record;
}

async function verifyOtp(accountType, email, otp) {
  await verifyOtpOrThrow(email, accountType, otp);
}

async function resetPassword(accountType, email, otp, newPassword) {
  const record = await verifyOtpOrThrow(email, accountType, otp);
  const Model = getAccountModel(accountType);
  const account = await Model.findById(record.accountId).select('+password');

  if (!account) {
    throw createError(404, 'Account not found');
  }

  if (await account.comparePassword(newPassword)) {
    throw createError(400, 'Mật khẩu mới phải khác mật khẩu hiện tại');
  }

  account.password = newPassword;
  await account.save();

  record.usedAt = new Date();
  await record.save();
}

module.exports = {
  serializeAccount,
  registerUser,
  loginUser,
  loginAdmin,
  forgotPassword,
  verifyOtp,
  resetPassword,
};
