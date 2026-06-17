const jwt = require('jsonwebtoken');

function getJwtSecret() {
  return process.env.JWT_SECRET || 'dev_change_me';
}

function toRole(accountType) {
  return accountType === 'admin' ? 'admin' : 'customer';
}

function getTokenExpiresIn(options = {}) {
  if (options.rememberLogin) {
    return process.env.JWT_REMEMBER_EXPIRES_IN || '30d';
  }

  return process.env.JWT_EXPIRES_IN || '7d';
}

function signToken(account, accountType, options = {}) {
  return jwt.sign(
    {
      sub: account._id.toString(),
      accountType,
      role: toRole(accountType),
    },
    getJwtSecret(),
    { expiresIn: getTokenExpiresIn(options) },
  );
}

function verifyToken(token) {
  return jwt.verify(token, getJwtSecret());
}

module.exports = {
  signToken,
  verifyToken,
  toRole,
};
