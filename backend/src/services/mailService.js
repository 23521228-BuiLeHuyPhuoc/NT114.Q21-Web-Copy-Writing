const nodemailer = require('nodemailer');
const createError = require('../utils/createError');
const systemSettingsService = require('./systemSettingsService');

function parseBoolean(value) {
  if (value === undefined || value === null || value === '') return undefined;
  return String(value).toLowerCase() === 'true';
}

function getSmtpConfig() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    throw createError(503, 'Email service is not configured');
  }

  const port = Number(process.env.SMTP_PORT || 587);

  return {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port,
    secure: parseBoolean(process.env.SMTP_SECURE) ?? port === 465,
    auth: {
      user,
      pass,
    },
  };
}

function getMailFrom() {
  return process.env.SMTP_FROM || process.env.SMTP_USER;
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
  const transporter = nodemailer.createTransport(getSmtpConfig());
  const accountLabel = accountType === 'admin' ? 'admin account' : 'customer account';
  const minutes = getOtpMinutes();
  const displayName = name || 'there';
  const rendered = await getMailTemplateContext('passwordResetOtp', {
    name: displayName,
    otp,
    accountLabel,
    minutes,
  });

  await transporter.sendMail({
    from: getMailFrom(),
    to,
    subject: rendered.subject,
    text: rendered.text,
    html: rendered.html,
  });
}

async function sendEmailVerificationOtpEmail({ to, otp, name }) {
  const transporter = nodemailer.createTransport(getSmtpConfig());
  const minutes = getOtpMinutes();
  const displayName = name || 'there';
  const rendered = await getMailTemplateContext('emailVerificationOtp', {
    name: displayName,
    otp,
    minutes,
  });

  await transporter.sendMail({
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
