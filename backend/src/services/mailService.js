const nodemailer = require('nodemailer');
const createError = require('../utils/createError');

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

async function sendPasswordResetOtpEmail({ to, otp, accountType, name }) {
  const transporter = nodemailer.createTransport(getSmtpConfig());
  const accountLabel = accountType === 'admin' ? 'admin account' : 'customer account';
  const minutes = getOtpMinutes();
  const displayName = name || 'there';
  const safeDisplayName = escapeHtml(displayName);

  await transporter.sendMail({
    from: getMailFrom(),
    to,
    subject: 'Your CopyPro password reset OTP',
    text: [
      `Hi ${displayName},`,
      '',
      `Your OTP for resetting your ${accountLabel} password is: ${otp}`,
      `This code expires in ${minutes} minutes.`,
      '',
      'If you did not request this, please ignore this email.',
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <p>Hi ${safeDisplayName},</p>
        <p>Your OTP for resetting your ${accountLabel} password is:</p>
        <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px; margin: 16px 0;">${otp}</p>
        <p>This code expires in ${minutes} minutes.</p>
        <p style="color: #6b7280;">If you did not request this, please ignore this email.</p>
      </div>
    `,
  });
}

async function sendEmailVerificationOtpEmail({ to, otp, name }) {
  const transporter = nodemailer.createTransport(getSmtpConfig());
  const minutes = getOtpMinutes();
  const displayName = name || 'there';
  const safeDisplayName = escapeHtml(displayName);

  await transporter.sendMail({
    from: getMailFrom(),
    to,
    subject: 'Verify your CopyPro email',
    text: [
      `Hi ${displayName},`,
      '',
      `Your CopyPro email verification OTP is: ${otp}`,
      `This code expires in ${minutes} minutes.`,
      '',
      'If you did not create this account, please ignore this email.',
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <p>Hi ${safeDisplayName},</p>
        <p>Your CopyPro email verification OTP is:</p>
        <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px; margin: 16px 0;">${otp}</p>
        <p>This code expires in ${minutes} minutes.</p>
        <p style="color: #6b7280;">If you did not create this account, please ignore this email.</p>
      </div>
    `,
  });
}

module.exports = {
  sendPasswordResetOtpEmail,
  sendEmailVerificationOtpEmail,
};
