import { api } from '@/lib/axios';

export interface SystemSettings {
  siteName: string;
  supportEmail: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  registrationEnabled: boolean;
  emailVerificationRequired: boolean;
  updatedAt?: string | null;
}

export type UpdateSystemSettingsPayload = Partial<Pick<
  SystemSettings,
  'siteName' | 'supportEmail' | 'maintenanceMode' | 'maintenanceMessage' | 'registrationEnabled' | 'emailVerificationRequired'
>>;

interface AdminSettingsResponse {
  data?: {
    settings?: Partial<SystemSettings>;
  };
}

interface PublicStatusResponse {
  data?: {
    status?: Partial<SystemSettings>;
  };
}

const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  siteName: 'CopyPro',
  supportEmail: 'support@copypro.vn',
  maintenanceMode: false,
  maintenanceMessage: 'Hệ thống đang bảo trì. Vui lòng quay lại sau.',
  registrationEnabled: true,
  emailVerificationRequired: false,
  updatedAt: null,
};

function normalizeSettings(item?: Partial<SystemSettings>): SystemSettings {
  return {
    ...DEFAULT_SYSTEM_SETTINGS,
    ...item,
    maintenanceMode: Boolean(item?.maintenanceMode),
    registrationEnabled: item?.registrationEnabled !== false,
    emailVerificationRequired: Boolean(item?.emailVerificationRequired),
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

  async getPublicStatus() {
    const response = await api.get<PublicStatusResponse>('/system/status');
    return normalizeSettings(response.data.data?.status);
  },
};

export { DEFAULT_SYSTEM_SETTINGS };
