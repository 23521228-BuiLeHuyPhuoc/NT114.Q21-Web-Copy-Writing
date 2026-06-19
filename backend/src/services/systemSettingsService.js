const SystemSetting = require('../models/SystemSetting');
const { BASE_GENERATOR_MODELS } = require('../config/generatorModels');
const { formatBaseModelDisplayName } = require('../utils/modelDisplayName');

const EMAIL_TEMPLATE_DEFINITIONS = [
  {
    key: 'welcome',
    name: 'Welcome email',
    subject: 'Welcome to {{siteName}}',
    text: [
      'Hi {{name}},',
      '',
      'Welcome to {{siteName}}. Your account is ready to use.',
      '',
      'If you need help, contact {{supportEmail}}.',
    ].join('\n'),
    html: [
      '<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">',
      '<p>Hi {{name}},</p>',
      '<p>Welcome to <strong>{{siteName}}</strong>. Your account is ready to use.</p>',
      '<p style="color: #6b7280;">If you need help, contact {{supportEmail}}.</p>',
      '</div>',
    ].join(''),
  },
  {
    key: 'emailVerificationOtp',
    name: 'Email verification OTP',
    subject: 'Verify your {{siteName}} email',
    text: [
      'Hi {{name}},',
      '',
      'Your {{siteName}} email verification OTP is: {{otp}}',
      'This code expires in {{minutes}} minutes.',
      '',
      'If you did not create this account, please ignore this email.',
    ].join('\n'),
    html: [
      '<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">',
      '<p>Hi {{name}},</p>',
      '<p>Your {{siteName}} email verification OTP is:</p>',
      '<p style="font-size: 28px; font-weight: 700; letter-spacing: 6px; margin: 16px 0;">{{otp}}</p>',
      '<p>This code expires in {{minutes}} minutes.</p>',
      '<p style="color: #6b7280;">If you did not create this account, please ignore this email.</p>',
      '</div>',
    ].join(''),
  },
  {
    key: 'passwordResetOtp',
    name: 'Password reset OTP',
    subject: 'Your {{siteName}} password reset OTP',
    text: [
      'Hi {{name}},',
      '',
      'Your OTP for resetting your {{accountLabel}} is: {{otp}}',
      'This code expires in {{minutes}} minutes.',
      '',
      'If you did not request this, please ignore this email.',
    ].join('\n'),
    html: [
      '<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">',
      '<p>Hi {{name}},</p>',
      '<p>Your OTP for resetting your {{accountLabel}} is:</p>',
      '<p style="font-size: 28px; font-weight: 700; letter-spacing: 6px; margin: 16px 0;">{{otp}}</p>',
      '<p>This code expires in {{minutes}} minutes.</p>',
      '<p style="color: #6b7280;">If you did not request this, please ignore this email.</p>',
      '</div>',
    ].join(''),
  },
  {
    key: 'renewalReminder',
    name: 'Renewal reminder',
    subject: 'Your {{planName}} plan renews soon',
    text: [
      'Hi {{name}},',
      '',
      'Your {{planName}} plan renews on {{renewDate}}.',
      'No action is needed if your payment method is still valid.',
    ].join('\n'),
    html: [
      '<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">',
      '<p>Hi {{name}},</p>',
      '<p>Your <strong>{{planName}}</strong> plan renews on {{renewDate}}.</p>',
      '<p style="color: #6b7280;">No action is needed if your payment method is still valid.</p>',
      '</div>',
    ].join(''),
  },
  {
    key: 'quotaWarning',
    name: 'Quota warning',
    subject: 'Your {{siteName}} quota is almost used',
    text: [
      'Hi {{name}},',
      '',
      'You have used {{quotaUsed}} of {{quotaLimit}} quota in your {{planName}} plan.',
      'Upgrade your plan or wait for the quota window to refresh.',
    ].join('\n'),
    html: [
      '<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">',
      '<p>Hi {{name}},</p>',
      '<p>You have used <strong>{{quotaUsed}}</strong> of <strong>{{quotaLimit}}</strong> quota in your {{planName}} plan.</p>',
      '<p style="color: #6b7280;">Upgrade your plan or wait for the quota window to refresh.</p>',
      '</div>',
    ].join(''),
  },
];

const EMAIL_TEMPLATE_KEYS = new Set(EMAIL_TEMPLATE_DEFINITIONS.map((template) => template.key));

function getDefaultEmailTemplates() {
  return EMAIL_TEMPLATE_DEFINITIONS.map((template) => ({ ...template }));
}

const DEFAULT_SETTINGS = {
  key: 'default',
  siteName: 'CopyPro',
  supportEmail: 'support@copypro.vn',
  maintenanceMode: false,
  maintenanceMessage: 'He thong dang bao tri. Vui long quay lai sau.',
  registrationEnabled: true,
  emailVerificationRequired: false,
  emailTemplates: getDefaultEmailTemplates(),
  quotaResetAt: null,
};

function parseBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  return String(value).toLowerCase() === 'true';
}

function envValue(name, fallback = '') {
  const value = process.env[name];
  if (value === undefined || value === null || value === '') return fallback;
  return String(value).trim();
}

function envConfigured(name) {
  return Boolean(envValue(name));
}

function anyEnvConfigured(names) {
  return names.some(envConfigured);
}

function splitEnvList(name, fallback = '') {
  return Array.from(new Set(
    envValue(name, fallback)
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
  ));
}

function mergeEmailTemplates(sourceTemplates = []) {
  const sourceMap = new Map(
    sourceTemplates
      .filter((template) => template && EMAIL_TEMPLATE_KEYS.has(template.key))
      .map((template) => [template.key, template]),
  );

  return getDefaultEmailTemplates().map((defaults) => {
    const source = sourceMap.get(defaults.key) || {};
    return {
      ...defaults,
      subject: source.subject || defaults.subject,
      text: source.text || defaults.text,
      html: source.html || defaults.html,
    };
  });
}

function normalizeEmailTemplatesPayload(templates = []) {
  return mergeEmailTemplates(templates.map((template) => ({
    key: String(template.key || '').trim(),
    subject: String(template.subject || '').trim(),
    text: String(template.text || '').trim(),
    html: String(template.html || '').trim(),
  })));
}

function modelOption(id) {
  return {
    id,
    name: formatBaseModelDisplayName(id) || id,
  };
}

function providerStatus({ id, name, modelEnv, fallbackModel, keyEnv = [], extraConfigured = false }) {
  const configuredModel = envValue(modelEnv);
  const keyConfigured = anyEnvConfigured(keyEnv);

  return {
    id,
    name,
    modelEnv,
    model: configuredModel || fallbackModel,
    usesSelectedModel: !configuredModel,
    keyEnv,
    keyConfigured,
    configured: keyConfigured || Boolean(extraConfigured),
  };
}

function getRuntimeAiConfig() {
  const provider = envValue('AI_PROVIDER', 'gemini').toLowerCase();
  const googleProjectConfigured = anyEnvConfigured(['GOOGLE_CLOUD_PROJECT', 'GCLOUD_PROJECT', 'GCP_PROJECT']);
  const googleCredentialsConfigured = anyEnvConfigured(['GOOGLE_APPLICATION_CREDENTIALS', 'VERTEX_API_KEY', 'GOOGLE_API_KEY']);

  const providers = [
    providerStatus({
      id: 'gemini',
      name: 'Gemini API',
      modelEnv: 'GEMINI_MODEL',
      fallbackModel: 'UI selected model or gemini-2.5-flash',
      keyEnv: ['GOOGLE_API_KEY', 'GEMINI_API_KEY'],
    }),
    providerStatus({
      id: 'vertex-gemini',
      name: 'Vertex AI Gemini',
      modelEnv: 'GEMINI_MODEL',
      fallbackModel: 'UI selected Gemini model',
      keyEnv: ['GOOGLE_APPLICATION_CREDENTIALS', 'VERTEX_API_KEY', 'GOOGLE_API_KEY'],
      extraConfigured: googleProjectConfigured && googleCredentialsConfigured,
    }),
    providerStatus({
      id: 'vertex-maas',
      name: 'Vertex AI MaaS',
      modelEnv: 'VERTEX_MAAS_MODEL',
      fallbackModel: 'meta/llama-3.3-70b-instruct-maas',
      keyEnv: ['GOOGLE_APPLICATION_CREDENTIALS', 'VERTEX_API_KEY'],
      extraConfigured: googleProjectConfigured && googleCredentialsConfigured,
    }),
    providerStatus({
      id: 'vertex-claude',
      name: 'Vertex AI Claude',
      modelEnv: 'VERTEX_CLAUDE_MODEL',
      fallbackModel: 'claude-haiku-4-5@20251001',
      keyEnv: ['GOOGLE_APPLICATION_CREDENTIALS'],
      extraConfigured: googleProjectConfigured,
    }),
    providerStatus({
      id: 'groq',
      name: 'Groq',
      modelEnv: 'GROQ_MODEL',
      fallbackModel: 'UI selected model or llama-3.3-70b-versatile',
      keyEnv: ['GROQ_API_KEY'],
    }),
    providerStatus({
      id: 'openrouter',
      name: 'OpenRouter',
      modelEnv: 'OPENROUTER_MODEL',
      fallbackModel: 'UI selected model or openrouter/free',
      keyEnv: ['OPENROUTER_API_KEY'],
    }),
    providerStatus({
      id: 'openai',
      name: 'OpenAI-compatible API',
      modelEnv: 'OPENAI_MODEL',
      fallbackModel: 'gpt-4o-mini',
      keyEnv: ['OPENAI_API_KEY'],
    }),
    providerStatus({
      id: 'freegpt4',
      name: 'Free-GPT4 local API',
      modelEnv: 'FREEGPT4_MODEL',
      fallbackModel: 'gpt-4',
      keyEnv: ['FREEGPT4_BASE_URL'],
      extraConfigured: true,
    }),
  ].map((item) => ({
    ...item,
    active: item.id === provider,
  }));

  return {
    provider,
    googleCloudProject: envValue('GOOGLE_CLOUD_PROJECT') || envValue('GCLOUD_PROJECT') || envValue('GCP_PROJECT'),
    googleCloudLocation: envValue('GOOGLE_CLOUD_LOCATION', 'us-central1'),
    openAiBaseUrl: envValue('OPENAI_BASE_URL', 'https://api.openai.com/v1'),
    freeGpt4BaseUrl: envValue('FREEGPT4_BASE_URL', 'http://127.0.0.1:5500'),
    vertexClaudeLocations: splitEnvList('VERTEX_CLAUDE_LOCATIONS', 'us-east5,europe-west1,asia-east1,global'),
    generatorModels: BASE_GENERATOR_MODELS.map(modelOption),
    fineTuneBaseModels: splitEnvList('VERTEX_TUNING_BASE_MODELS', 'gemini-2.5-flash,gemini-2.5-flash-lite').map(modelOption),
    openModelTuningBaseModels: splitEnvList('VERTEX_OPEN_MODEL_TUNING_BASE_MODELS', 'meta/llama3-3@llama-3.3-70b-instruct,qwen/qwen3@qwen3-14b').map(modelOption),
    providers,
  };
}

function getRuntimeSmtpConfig() {
  const port = Number(envValue('SMTP_PORT', '587'));
  return {
    host: envValue('SMTP_HOST', 'smtp.gmail.com'),
    port: Number.isFinite(port) ? port : 587,
    secure: parseBoolean(process.env.SMTP_SECURE, port === 465),
    user: envValue('SMTP_USER'),
    from: envValue('SMTP_FROM') || envValue('SMTP_USER'),
    userConfigured: envConfigured('SMTP_USER'),
    passwordConfigured: envConfigured('SMTP_PASS'),
    configured: envConfigured('SMTP_USER') && envConfigured('SMTP_PASS'),
  };
}

function getRuntimeConfig() {
  return {
    ai: getRuntimeAiConfig(),
    smtp: getRuntimeSmtpConfig(),
  };
}

function serializeSettings(settings) {
  const source = settings?.toObject?.() || settings || DEFAULT_SETTINGS;

  return {
    siteName: source.siteName || DEFAULT_SETTINGS.siteName,
    supportEmail: source.supportEmail || DEFAULT_SETTINGS.supportEmail,
    maintenanceMode: Boolean(source.maintenanceMode),
    maintenanceMessage: source.maintenanceMessage || DEFAULT_SETTINGS.maintenanceMessage,
    registrationEnabled: source.registrationEnabled !== false,
    emailVerificationRequired: Boolean(source.emailVerificationRequired),
    emailTemplates: mergeEmailTemplates(source.emailTemplates || []),
    quotaResetAt: source.quotaResetAt || null,
    runtimeConfig: getRuntimeConfig(),
    updatedAt: source.updatedAt || null,
  };
}

async function getSystemSettings() {
  let settings = await SystemSetting.findOne({ key: 'default' });
  if (!settings) {
    settings = await SystemSetting.create(DEFAULT_SETTINGS);
  }

  return serializeSettings(settings);
}

async function getQuotaResetAt() {
  const settings = await SystemSetting.findOne({ key: 'default' }).select('quotaResetAt').lean();
  return settings?.quotaResetAt || null;
}

async function getEmailTemplate(key) {
  const settings = await getSystemSettings();
  return settings.emailTemplates.find((template) => template.key === key)
    || getDefaultEmailTemplates().find((template) => template.key === key);
}

function normalizeSettingsPayload(payload = {}) {
  const normalized = {};

  if (payload.siteName !== undefined) normalized.siteName = payload.siteName;
  if (payload.supportEmail !== undefined) normalized.supportEmail = payload.supportEmail;
  if (payload.maintenanceMode !== undefined) normalized.maintenanceMode = payload.maintenanceMode;
  if (payload.maintenanceMessage !== undefined) normalized.maintenanceMessage = payload.maintenanceMessage;
  if (payload.registrationEnabled !== undefined) normalized.registrationEnabled = payload.registrationEnabled;
  if (payload.emailVerificationRequired !== undefined) {
    normalized.emailVerificationRequired = payload.emailVerificationRequired;
  }
  if (payload.emailTemplates !== undefined) {
    normalized.emailTemplates = normalizeEmailTemplatesPayload(payload.emailTemplates);
  }

  return normalized;
}

async function updateSystemSettings(payload = {}, adminId = null) {
  const normalized = normalizeSettingsPayload(payload);
  if (adminId) normalized.updatedBy = adminId;

  const settings = await SystemSetting.findOneAndUpdate(
    { key: 'default' },
    { $set: normalized, $setOnInsert: { key: 'default' } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );

  return serializeSettings(settings);
}

async function resetAllUserQuotas(adminId = null) {
  const quotaResetAt = new Date();
  const set = { quotaResetAt };
  if (adminId) set.updatedBy = adminId;

  const settings = await SystemSetting.findOneAndUpdate(
    { key: 'default' },
    { $set: set, $setOnInsert: { key: 'default' } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );

  return serializeSettings(settings);
}

function getPublicSystemStatus(settings) {
  const serialized = serializeSettings(settings);
  return {
    siteName: serialized.siteName,
    supportEmail: serialized.supportEmail,
    maintenanceMode: serialized.maintenanceMode,
    maintenanceMessage: serialized.maintenanceMessage,
    registrationEnabled: serialized.registrationEnabled,
    emailVerificationRequired: serialized.emailVerificationRequired,
  };
}

module.exports = {
  EMAIL_TEMPLATE_DEFINITIONS,
  getEmailTemplate,
  getPublicSystemStatus,
  getQuotaResetAt,
  getSystemSettings,
  resetAllUserQuotas,
  updateSystemSettings,
};
