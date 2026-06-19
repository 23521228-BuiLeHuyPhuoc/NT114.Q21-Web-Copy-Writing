const crypto = require('node:crypto');
const createError = require('../utils/createError');

function getEnv(name, fallback = '') {
  return String(process.env[name] ?? fallback).trim();
}

function trimSlash(value) {
  return String(value || '').replace(/\/$/, '');
}

function getApiBaseUrl() {
  return trimSlash(getEnv('NGROK') || getEnv('PUBLIC_API_URL') || `http://localhost:${getEnv('PORT', '4000')}`);
}

function getFrontendBaseUrl() {
  return trimSlash(getEnv('FRONTEND_URL') || 'http://localhost:3000');
}

function getTimeoutMs() {
  const value = Number(getEnv('PAYMENT_GATEWAY_TIMEOUT_MS', '15000'));
  return Number.isFinite(value) && value > 0 ? value : 15000;
}

function safeEqual(left, right) {
  const a = Buffer.from(String(left || ''), 'utf8');
  const b = Buffer.from(String(right || ''), 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function encodeValue(value) {
  return encodeURIComponent(String(value ?? '')).replace(/%20/g, '+');
}

function buildSignedQuery(params) {
  return Object.keys(params)
    .sort()
    .map((key) => `${key}=${encodeValue(params[key])}`)
    .join('&');
}

function hmacSha512(secret, data) {
  return crypto.createHmac('sha512', secret).update(data, 'utf8').digest('hex');
}

function hmacSha256(secret, data) {
  return crypto.createHmac('sha256', secret).update(data, 'utf8').digest('hex');
}

function formatVnpayDate(date = new Date()) {
  const pad = (value) => String(value).padStart(2, '0');
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join('');
}

function formatZaloDate(date = new Date()) {
  const pad = (value) => String(value).padStart(2, '0');
  return `${pad(date.getFullYear() % 100)}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
}

function buildVnpayReturnUrl() {
  return getEnv('VNPAY_RETURN_URL') || `${getApiBaseUrl()}/api/billing/vnpay/return`;
}

function buildVnpayIpnUrl() {
  return getEnv('VNPAY_IPN_URL') || `${getApiBaseUrl()}/api/billing/vnpay/ipn`;
}

function buildZalopayReturnUrl() {
  return getEnv('ZALOPAY_RETURN_URL') || `${getFrontendBaseUrl()}/billing?payment=zalopay-return`;
}

function buildZalopayCallbackUrl() {
  return getEnv('ZALOPAY_CALLBACK_URL') || `${getApiBaseUrl()}/api/billing/zalopay/callback`;
}

function buildVnpayDescription(invoiceNo, planName) {
  return `CopyPro ${planName} ${invoiceNo}`;
}

function buildZalopayDescription(invoiceNo, planName) {
  return `CopyPro ${planName} ${invoiceNo}`;
}

function getZalopayPreferredPaymentMethods() {
  return getEnv('ZALOPAY_PREFERRED_PAYMENT_METHODS')
    .split(',')
    .map((method) => method.trim())
    .filter(Boolean);
}

function buildVietQrTransferContent(invoiceNo) {
  const prefix = getEnv('VIETQR_ADD_INFO_PREFIX', 'COPYPRO')
    .replace(/[^0-9A-Za-z ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 8) || 'COPYPRO';
  const invoiceRef = String(invoiceNo || '')
    .replace(/[^0-9A-Za-z]/g, '')
    .replace(/^INV/i, '')
    .slice(-16);
  return `${prefix} ${invoiceRef}`.trim().slice(0, 25);
}

function buildVietQrPaymentData({ invoiceNo, amount }) {
  const bankId = getEnv('VIETQR_BANK_ID');
  const accountNo = getEnv('VIETQR_ACCOUNT_NO');
  const accountName = getEnv('VIETQR_ACCOUNT_NAME');

  if (!bankId || !accountNo || !accountName) {
    const missingKeys = [
      ['VIETQR_BANK_ID', bankId],
      ['VIETQR_ACCOUNT_NO', accountNo],
      ['VIETQR_ACCOUNT_NAME', accountName],
    ].filter(([, value]) => !value).map(([key]) => key);

    throw createError(500, `VietQR configuration is missing: ${missingKeys.join(', ')}`, null, { missingKeys });
  }

  const template = getEnv('VIETQR_TEMPLATE', 'compact2');
  const baseUrl = trimSlash(getEnv('VIETQR_IMAGE_BASE_URL', 'https://img.vietqr.io/image'));
  const roundedAmount = Math.round(Number(amount) || 0);
  const transferContent = buildVietQrTransferContent(invoiceNo);
  const query = new URLSearchParams({
    amount: String(roundedAmount),
    addInfo: transferContent,
    accountName,
  });
  const qrImageUrl = `${baseUrl}/${encodeURIComponent(bankId)}-${encodeURIComponent(accountNo)}-${encodeURIComponent(template)}.png?${query.toString()}`;

  return {
    bankId,
    bankName: getEnv('VIETQR_BANK_NAME', bankId.toUpperCase()),
    accountNo,
    accountName,
    amount: roundedAmount,
    currency: 'VND',
    transferContent,
    qrImageUrl,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  };
}

function buildVnpayPaymentUrl({ invoiceNo, amount, ipAddress, planName }) {
  const paymentUrl = getEnv('VNPAY_PAYMENT_URL', 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html');
  const tmnCode = getEnv('VNPAY_TMN_CODE');
  const secret = getEnv('VNPAY_HASH_SECRET');

  if (!tmnCode || !secret) {
    throw createError(500, 'VNPAY configuration is missing');
  }

  const params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: tmnCode,
    vnp_Amount: Math.round(amount) * 100,
    vnp_CurrCode: 'VND',
    vnp_TxnRef: invoiceNo,
    vnp_OrderInfo: buildVnpayDescription(invoiceNo, planName),
    vnp_OrderType: 'billpayment',
    vnp_Locale: 'vn',
    vnp_ReturnUrl: buildVnpayReturnUrl(),
    vnp_IpAddr: ipAddress || '127.0.0.1',
    vnp_CreateDate: formatVnpayDate(),
    vnp_ExpireDate: formatVnpayDate(new Date(Date.now() + 15 * 60 * 1000)),
  };

  const signData = buildSignedQuery(params);
  const secureHash = hmacSha512(secret, signData);
  return `${paymentUrl}?${signData}&vnp_SecureHash=${secureHash}`;
}

function verifyVnpayReturn(query = {}) {
  const secret = getEnv('VNPAY_HASH_SECRET');
  if (!secret) {
    throw createError(500, 'VNPAY configuration is missing');
  }

  const params = { ...query };
  const receivedHash = params.vnp_SecureHash;
  delete params.vnp_SecureHash;
  delete params.vnp_SecureHashType;

  const signData = buildSignedQuery(params);
  const expectedHash = hmacSha512(secret, signData);
  return {
    valid: safeEqual(expectedHash.toLowerCase(), String(receivedHash || '').toLowerCase()),
    params,
  };
}

function buildZalopayTransId(invoiceNo) {
  const stamp = formatZaloDate();
  const suffix = String(invoiceNo || Date.now()).replace(/[^0-9A-Za-z]/g, '').slice(-16);
  return `${stamp}_${suffix}`;
}

async function fetchJson(url, options) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), getTimeoutMs());

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    const text = await response.text();
    let data = {};
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }
    }

    if (!response.ok) {
      throw createError(response.status, data?.message || data?.return_message || 'Payment gateway request failed', null, data);
    }

    return data;
  } finally {
    clearTimeout(timeout);
  }
}

async function createZalopayPaymentUrl({ invoiceNo, amount, planName, billingCycle, paymentId, userEmail }) {
  const endpoint = getEnv('ZALOPAY_ENDPOINT', 'https://sb-openapi.zalopay.vn/v2/create');
  const appId = getEnv('ZALOPAY_APP_ID');
  const key1 = getEnv('ZALOPAY_KEY1');
  const bankCode = getEnv('ZALOPAY_BANK_CODE');

  if (!appId || !key1) {
    throw createError(500, 'ZaloPay configuration is missing');
  }

  const appTransId = buildZalopayTransId(invoiceNo);
  const appTime = Date.now();
  const callbackUrl = buildZalopayCallbackUrl();
  const returnUrl = buildZalopayReturnUrl();
  const embedData = JSON.stringify({
    preferred_payment_method: getZalopayPreferredPaymentMethods(),
    redirecturl: returnUrl,
    callback_url: callbackUrl,
    invoiceNo,
    paymentId,
    billingCycle,
  });
  const item = JSON.stringify([
    {
      itemid: planName,
      itemname: planName,
      itemprice: Math.round(amount),
      itemquantity: 1,
    },
  ]);
  const appUser = userEmail || invoiceNo;
  const description = buildZalopayDescription(invoiceNo, planName);
  const macData = [appId, appTransId, appUser, Math.round(amount), appTime, embedData, item].join('|');
  const mac = hmacSha256(key1, macData);

  const body = new URLSearchParams({
    app_id: appId,
    app_trans_id: appTransId,
    app_user: appUser,
    app_time: String(appTime),
    amount: String(Math.round(amount)),
    item,
    embed_data: embedData,
    bank_code: bankCode,
    callback_url: callbackUrl,
    description,
    mac,
  });

  const response = await fetchJson(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (Number(response?.return_code) !== 1) {
    throw createError(502, response?.return_message || 'ZaloPay payment creation failed', null, response);
  }

  return {
    paymentUrl: response.order_url || response.orderUrl || response.orderurl || '',
    gatewayTransactionId: appTransId,
    gatewayResponse: response,
    callbackUrl,
    returnUrl,
  };
}

function verifyZalopayCallback(body = {}) {
  const key2 = getEnv('ZALOPAY_KEY2');
  if (!key2) {
    throw createError(500, 'ZaloPay configuration is missing');
  }

  const data = typeof body.data === 'string' ? body.data : JSON.stringify(body.data || {});
  const mac = String(body.mac || '');
  const expected = hmacSha256(key2, data);

  return {
    valid: safeEqual(expected.toLowerCase(), mac.toLowerCase()),
    data: data ? JSON.parse(data) : {},
  };
}

async function queryZalopayOrder(appTransId) {
  const endpoint = getEnv('ZALOPAY_QUERY_ENDPOINT', 'https://sb-openapi.zalopay.vn/v2/query');
  const appId = getEnv('ZALOPAY_APP_ID');
  const key1 = getEnv('ZALOPAY_KEY1');

  if (!appId || !key1) {
    throw createError(500, 'ZaloPay configuration is missing');
  }

  const mac = hmacSha256(key1, `${appId}|${appTransId}|${key1}`);
  const body = new URLSearchParams({
    app_id: appId,
    app_trans_id: appTransId,
    mac,
  });

  return fetchJson(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
}

function buildFrontendPaymentResultUrl({ gateway, outcome, invoiceNo }) {
  const params = new URLSearchParams({ payment: `${gateway}-${outcome}` });
  if (invoiceNo) params.set('invoice', invoiceNo);
  return `${getFrontendBaseUrl()}/billing?${params.toString()}`;
}

module.exports = {
  buildVnpayPaymentUrl,
  buildVietQrPaymentData,
  verifyVnpayReturn,
  createZalopayPaymentUrl,
  verifyZalopayCallback,
  queryZalopayOrder,
  buildFrontendPaymentResultUrl,
};
