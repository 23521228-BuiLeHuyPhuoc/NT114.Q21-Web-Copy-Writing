const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'copypro_auth';

const DEFAULT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function getCookieMaxAge() {
  const configuredDays = Number(process.env.AUTH_COOKIE_MAX_AGE_DAYS);
  if (Number.isFinite(configuredDays) && configuredDays > 0) {
    return configuredDays * 24 * 60 * 60 * 1000;
  }

  return DEFAULT_MAX_AGE_MS;
}

function parseBoolean(value, fallback) {
  if (value === undefined) return fallback;
  return value === 'true';
}

function getAuthCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: parseBoolean(process.env.AUTH_COOKIE_SECURE, isProduction),
    sameSite: process.env.AUTH_COOKIE_SAME_SITE || 'lax',
    path: '/',
    maxAge: getCookieMaxAge(),
  };
}

function getClearCookieOptions() {
  const { maxAge, ...options } = getAuthCookieOptions();
  return options;
}

function setAuthCookie(res, token) {
  res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
}

function clearAuthCookie(res) {
  res.clearCookie(AUTH_COOKIE_NAME, getClearCookieOptions());
}

module.exports = {
  AUTH_COOKIE_NAME,
  clearAuthCookie,
  getAuthCookieOptions,
  setAuthCookie,
};
