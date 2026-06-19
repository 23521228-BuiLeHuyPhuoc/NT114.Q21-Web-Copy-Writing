const SystemSetting = require('../models/SystemSetting');

const DEFAULT_SETTINGS = {
  key: 'default',
  siteName: 'CopyPro',
  supportEmail: 'support@copypro.vn',
  maintenanceMode: false,
  maintenanceMessage: 'He thong dang bao tri. Vui long quay lai sau.',
  registrationEnabled: true,
  emailVerificationRequired: false,
};

function serializeSettings(settings) {
  const source = settings?.toObject?.() || settings || DEFAULT_SETTINGS;

  return {
    siteName: source.siteName || DEFAULT_SETTINGS.siteName,
    supportEmail: source.supportEmail || DEFAULT_SETTINGS.supportEmail,
    maintenanceMode: Boolean(source.maintenanceMode),
    maintenanceMessage: source.maintenanceMessage || DEFAULT_SETTINGS.maintenanceMessage,
    registrationEnabled: source.registrationEnabled !== false,
    emailVerificationRequired: Boolean(source.emailVerificationRequired),
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
  getSystemSettings,
  getPublicSystemStatus,
  updateSystemSettings,
};
