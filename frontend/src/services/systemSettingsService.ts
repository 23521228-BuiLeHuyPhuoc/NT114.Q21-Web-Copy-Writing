import { api } from '@/lib/axios';
import { PUBLIC_FREEGPT4_BASE_URL, PUBLIC_OPENAI_BASE_URL, PUBLIC_SUPPORT_EMAIL } from '@/lib/publicEnv';

export interface EmailTemplate {
  key: string;
  name: string;
  subject: string;
  text: string;
  html: string;
}

export interface RuntimeModelOption {
  id: string;
  name: string;
}

export interface RuntimeAiProvider {
  id: string;
  name: string;
  modelEnv: string;
  model: string;
  usesSelectedModel: boolean;
  keyEnv: string[];
  keyConfigured: boolean;
  configured: boolean;
  active: boolean;
}

export interface RuntimeConfig {
  ai: {
    provider: string;
    googleCloudProject: string;
    googleCloudLocation: string;
    openAiBaseUrl: string;
    freeGpt4BaseUrl: string;
    vertexClaudeLocations: string[];
    generatorModels: RuntimeModelOption[];
    fineTuneBaseModels: RuntimeModelOption[];
    openModelTuningBaseModels: RuntimeModelOption[];
    providers: RuntimeAiProvider[];
  };
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    from: string;
    userConfigured: boolean;
    passwordConfigured: boolean;
    configured: boolean;
  };
}

export interface EnvSettingKey {
  key: string;
  label: string;
  secret: boolean;
  placeholder?: string;
  value: string;
  configured: boolean;
}

export interface EnvSettingSection {
  id: 'ai' | 'email' | string;
  title: string;
  description: string;
  keys: EnvSettingKey[];
}

export interface EnvSettings {
  updatedAt: string;
  sections: EnvSettingSection[];
}

export interface UpdateEnvSettingsPayload {
  values: Record<string, string>;
}

export interface SystemSettings {
  siteName: string;
  supportEmail: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  registrationEnabled: boolean;
  emailVerificationRequired: boolean;
  emailTemplates: EmailTemplate[];
  quotaResetAt?: string | null;
  runtimeConfig: RuntimeConfig;
  updatedAt?: string | null;
}

export interface QuotaResetUser {
  id: string;
  name: string;
  email: string;
  quotaResetAt?: string | null;
}

export type UpdateSystemSettingsPayload = Partial<Pick<
  SystemSettings,
  | 'siteName'
  | 'supportEmail'
  | 'maintenanceMode'
  | 'maintenanceMessage'
  | 'registrationEnabled'
  | 'emailVerificationRequired'
  | 'emailTemplates'
>>;

interface AdminSettingsResponse {
  data?: {
    settings?: Partial<SystemSettings>;
  };
}

interface AdminEnvSettingsResponse {
  data?: {
    envSettings?: Partial<EnvSettings>;
  };
}

interface PublicStatusResponse {
  data?: {
    status?: Partial<SystemSettings>;
  };
}

interface ResetUserQuotaResponse {
  data?: {
    user?: Partial<QuotaResetUser>;
  };
}

const DEFAULT_RUNTIME_CONFIG: RuntimeConfig = {
  ai: {
    provider: 'gemini',
    googleCloudProject: '',
    googleCloudLocation: 'us-central1',
    openAiBaseUrl: PUBLIC_OPENAI_BASE_URL,
    freeGpt4BaseUrl: PUBLIC_FREEGPT4_BASE_URL,
    vertexClaudeLocations: [],
    generatorModels: [],
    fineTuneBaseModels: [],
    openModelTuningBaseModels: [],
    providers: [],
  },
  smtp: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    user: '',
    from: '',
    userConfigured: false,
    passwordConfigured: false,
    configured: false,
  },
};

const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  siteName: 'CopyPro',
  supportEmail: PUBLIC_SUPPORT_EMAIL,
  maintenanceMode: false,
  maintenanceMessage: 'He thong dang bao tri. Vui long quay lai sau.',
  registrationEnabled: true,
  emailVerificationRequired: false,
  emailTemplates: [],
  quotaResetAt: null,
  runtimeConfig: DEFAULT_RUNTIME_CONFIG,
  updatedAt: null,
};

const DEFAULT_ENV_SETTINGS: EnvSettings = {
  updatedAt: '',
  sections: [],
};

function normalizeTemplate(item?: Partial<EmailTemplate>): EmailTemplate {
  return {
    key: item?.key || '',
    name: item?.name || item?.key || 'Email template',
    subject: item?.subject || '',
    text: item?.text || '',
    html: item?.html || '',
  };
}

function normalizeRuntimeConfig(item?: Partial<RuntimeConfig>): RuntimeConfig {
  const ai = item?.ai || DEFAULT_RUNTIME_CONFIG.ai;
  const smtp = item?.smtp || DEFAULT_RUNTIME_CONFIG.smtp;

  return {
    ai: {
      ...DEFAULT_RUNTIME_CONFIG.ai,
      ...ai,
      vertexClaudeLocations: Array.isArray(ai.vertexClaudeLocations) ? ai.vertexClaudeLocations : [],
      generatorModels: Array.isArray(ai.generatorModels) ? ai.generatorModels : [],
      fineTuneBaseModels: Array.isArray(ai.fineTuneBaseModels) ? ai.fineTuneBaseModels : [],
      openModelTuningBaseModels: Array.isArray(ai.openModelTuningBaseModels) ? ai.openModelTuningBaseModels : [],
      providers: Array.isArray(ai.providers) ? ai.providers : [],
    },
    smtp: {
      ...DEFAULT_RUNTIME_CONFIG.smtp,
      ...smtp,
      port: Number(smtp.port || DEFAULT_RUNTIME_CONFIG.smtp.port),
      secure: Boolean(smtp.secure),
      userConfigured: Boolean(smtp.userConfigured),
      passwordConfigured: Boolean(smtp.passwordConfigured),
      configured: Boolean(smtp.configured),
    },
  };
}

function normalizeSettings(item?: Partial<SystemSettings>): SystemSettings {
  return {
    ...DEFAULT_SYSTEM_SETTINGS,
    ...item,
    maintenanceMode: Boolean(item?.maintenanceMode),
    registrationEnabled: item?.registrationEnabled !== false,
    emailVerificationRequired: Boolean(item?.emailVerificationRequired),
    emailTemplates: Array.isArray(item?.emailTemplates) ? item.emailTemplates.map(normalizeTemplate) : [],
    quotaResetAt: item?.quotaResetAt || null,
    runtimeConfig: normalizeRuntimeConfig(item?.runtimeConfig),
  };
}

function normalizeEnvSettings(item?: Partial<EnvSettings>): EnvSettings {
  return {
    updatedAt: item?.updatedAt || '',
    sections: Array.isArray(item?.sections)
      ? item.sections.map((section) => ({
        id: section.id || '',
        title: section.title || '',
        description: section.description || '',
        keys: Array.isArray(section.keys)
          ? section.keys.map((envKey) => ({
            key: envKey.key || '',
            label: envKey.label || envKey.key || '',
            secret: Boolean(envKey.secret),
            placeholder: envKey.placeholder || '',
            value: envKey.value || '',
            configured: Boolean(envKey.configured),
          }))
          : [],
      }))
      : [],
  };
}

function normalizeQuotaResetUser(item?: Partial<QuotaResetUser>): QuotaResetUser {
  return {
    id: item?.id || '',
    name: item?.name || '',
    email: item?.email || '',
    quotaResetAt: item?.quotaResetAt || null,
  };
}

export const systemSettingsService = {
  async getAdminSettings() {
    const response = await api.get<AdminSettingsResponse>('/admin/settings/system');
    return normalizeSettings(response.data.data?.settings);
  },

  async updateAdminSettings(payload: UpdateSystemSettingsPayload) {
    const response = await api.patch<AdminSettingsResponse>('/admin/settings/system', payload);
    return normalizeSettings(response.data.data?.settings);
  },

  async getAdminEnvSettings() {
    const response = await api.get<AdminEnvSettingsResponse>('/admin/settings/env');
    return normalizeEnvSettings(response.data.data?.envSettings || DEFAULT_ENV_SETTINGS);
  },

  async updateAdminEnvSettings(payload: UpdateEnvSettingsPayload) {
    const response = await api.patch<AdminEnvSettingsResponse>('/admin/settings/env', payload);
    return normalizeEnvSettings(response.data.data?.envSettings || DEFAULT_ENV_SETTINGS);
  },

  async resetQuotas() {
    const response = await api.post<AdminSettingsResponse>('/admin/settings/reset-quotas');
    return normalizeSettings(response.data.data?.settings);
  },

  async resetUserQuota(userId: string) {
    const response = await api.post<ResetUserQuotaResponse>(`/admin/settings/reset-quotas/${userId}`);
    return normalizeQuotaResetUser(response.data.data?.user);
  },

  async getPublicStatus() {
    const response = await api.get<PublicStatusResponse>('/system/status');
    return normalizeSettings(response.data.data?.status);
  },
};

export { DEFAULT_SYSTEM_SETTINGS };
