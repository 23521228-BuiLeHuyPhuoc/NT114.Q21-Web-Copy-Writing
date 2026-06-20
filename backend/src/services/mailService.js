const nodemailer = require('nodemailer');
const createError = require('../utils/createError');
const systemSettingsService = require('./systemSettingsService');

function parseBoolean(value) {
  if (value === undefined || value === null || value === '') return undefined;
  return String(value).toLowerCase() === 'true';
}

function isGmailSmtpHost(host) {
  const normalizedHost = String(host || '').trim().toLowerCase();
  return normalizedHost === 'smtp.gmail.com' || normalizedHost === 'smtp.googlemail.com';
}

function normalizeSmtpPassword(password, host) {
  const value = password === undefined || password === null ? '' : String(password);

  if (isGmailSmtpHost(host)) {
    const compactValue = value.replace(/\s+/g, '');

    // Gmail displays app passwords as 4 groups. SMTP auth expects the 16 characters only.
    if (compactValue.length === 16) {
      return compactValue;
    }
  }

  return value;
}

function getSmtpConfig() {
  const host = String(process.env.SMTP_HOST || '').trim() || 'smtp.gmail.com';
  const user = String(process.env.SMTP_USER || '').trim();
  const pass = normalizeSmtpPassword(process.env.SMTP_PASS, host);

  if (!user || !pass) {
    throw createError(503, 'Email service is not configured');
  }

  const port = Number(process.env.SMTP_PORT || 587);

  return {
    host,
    port,
    secure: parseBoolean(process.env.SMTP_SECURE) ?? port === 465,
    auth: {
      user,
      pass,
    },
  };
}

function getMailFrom() {
  return String(process.env.SMTP_FROM || process.env.SMTP_USER || '').trim();
}

function getMailerErrorData(error) {
  if (process.env.NODE_ENV === 'production') return undefined;

  return {
    code: error?.code,
    command: error?.command,
    responseCode: error?.responseCode,
  };
}

function toMailDeliveryError(error) {
  if (error?.statusCode) return error;

  const errorData = getMailerErrorData(error);

  if (error?.code === 'EAUTH' || error?.responseCode === 535) {
    return createError(
      503,
      'SMTP authentication failed. Check SMTP_USER and SMTP_PASS. Gmail requires a valid App Password.',
      null,
      errorData,
    );
  }

  if (['ECONNECTION', 'ETIMEDOUT', 'ESOCKET'].includes(error?.code)) {
    return createError(
      503,
      'Could not connect to the SMTP server. Check SMTP_HOST, SMTP_PORT, and SMTP_SECURE.',
      null,
      errorData,
    );
  }

  return createError(502, 'Could not send email', null, errorData);
}

async function sendMail(mailOptions) {
  try {
    const transporter = nodemailer.createTransport(getSmtpConfig());
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw toMailDeliveryError(error);
  }
}

function getOtpMinutes() {
  return Number(process.env.OTP_EXPIRES_MINUTES || 5);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderTemplate(template, variables = {}) {
  const rawValues = Object.entries(variables).reduce((acc, [key, value]) => {
    acc[key] = value === undefined || value === null ? '' : String(value);
    return acc;
  }, {});
  const htmlValues = Object.entries(rawValues).reduce((acc, [key, value]) => {
    acc[key] = escapeHtml(value);
    return acc;
  }, {});
  const replace = (source, values) => String(source || '').replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (match, key) => (
    Object.prototype.hasOwnProperty.call(values, key) ? values[key] : match
  ));

  return {
    subject: replace(template.subject, rawValues),
    text: replace(template.text, rawValues),
    html: replace(template.html, htmlValues),
  };
}

async function getMailTemplateContext(templateKey, variables = {}) {
  const settings = await systemSettingsService.getSystemSettings();
  const template = settings.emailTemplates.find((item) => item.key === templateKey)
    || await systemSettingsService.getEmailTemplate(templateKey);

  return renderTemplate(template, {
    siteName: settings.siteName,
    supportEmail: settings.supportEmail,
    ...variables,
  });
}

async function sendPasswordResetOtpEmail({ to, otp, accountType, name }) {
  const accountLabel = accountType === 'admin' ? 'admin account' : 'customer account';
  const minutes = getOtpMinutes();
  const displayName = name || 'there';
  const rendered = await getMailTemplateContext('passwordResetOtp', {
    name: displayName,
    otp,
    accountLabel,
    minutes,
  });

  await sendMail({
    from: getMailFrom(),
    to,
    subject: rendered.subject,
    text: rendered.text,
    html: rendered.html,
  });
}

async function sendEmailVerificationOtpEmail({ to, otp, name }) {
  const minutes = getOtpMinutes();
  const displayName = name || 'there';
  const rendered = await getMailTemplateContext('emailVerificationOtp', {
    name: displayName,
    otp,
    minutes,
  });

  await sendMail({
    from: getMailFrom(),
    to,
    subject: rendered.subject,
    text: rendered.text,
    html: rendered.html,
  });
}

module.exports = {
  sendPasswordResetOtpEmail,
  sendEmailVerificationOtpEmail,
};
