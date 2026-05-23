const AccountAdmin = require('../../models/AccountAdmin');
const AccountUser = require('../../models/AccountUser');
const asyncHandler = require('../../utils/asyncHandler');
const { AUTH_COOKIE_NAME } = require('../../utils/authCookie');
const createError = require('../../utils/createError');
const { verifyToken, toRole } = require('../../utils/jwt');

function getToken(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) {
    return header.slice('Bearer '.length).trim();
  }

  return req.cookies?.[AUTH_COOKIE_NAME] || null;
}

async function loadAccount(accountType, id) {
  if (accountType === 'admin') return AccountAdmin.findById(id);
  if (accountType === 'user') return AccountUser.findById(id);
  return null;
}

function protect(requiredAccountType) {
  return asyncHandler(async (req, res, next) => {
    const token = getToken(req);
    if (!token) throw createError(401, 'Authentication token is required');

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      throw createError(401, 'Invalid or expired token');
    }

    if (requiredAccountType && payload.accountType !== requiredAccountType) {
      throw createError(403, 'Forbidden');
    }

    const account = await loadAccount(payload.accountType, payload.sub);
    if (!account) throw createError(401, 'Account not found');

    if (account.status === 'locked') {
      throw createError(403, 'Account is locked');
    }

    req.auth = {
      account,
      accountType: payload.accountType,
      role: payload.role || toRole(payload.accountType),
    };
    req.user = account;
    return next();
  });
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.auth || req.auth.role !== role) {
      return next(createError(403, 'Forbidden'));
    }
    return next();
  };
}

module.exports = {
  protect,
  requireRole,
};
