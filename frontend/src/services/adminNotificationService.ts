import { api } from '@/lib/axios';

export type AdminNotificationType = 'system' | 'billing' | 'ai' | 'account';
export type AdminNotificationRecipientMode = 'all_users' | 'all_admins' | 'selected';
export type AdminNotificationAccountType = 'user' | 'admin';
export type AdminNotificationSource = 'all' | 'sent_by_me' | 'received_by_me';

export interface AdminNotificationRecipientInput {
  accountType: AdminNotificationAccountType;
  id: string;
}

export interface SendAdminNotificationPayload {
  title: string;
  message: string;
  type: AdminNotificationType;
  actionUrl?: string;
  recipientMode: AdminNotificationRecipientMode;
  recipients?: AdminNotificationRecipientInput[];
}

export interface AdminNotificationAccount {
  id: string;
  name: string;
  email: string;
  role?: 'customer' | 'admin';
  adminRole?: string;
  status?: string;
  avatar?: string;
}

export interface AdminNotification {
  id: string;
  recipientType: AdminNotificationAccountType;
  userId?: string | null;
  adminId?: string | null;
  senderAdminId?: string | null;
  recipient?: AdminNotificationAccount | null;
  sender?: AdminNotificationAccount | null;
  title: string;
  message: string;
  type: AdminNotificationType;
  isRead: boolean;
  readAt?: string | null;
  actionUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminNotificationListParams {
  page?: number;
  limit?: number;
  recipientType?: 'all' | AdminNotificationAccountType;
  type?: 'all' | AdminNotificationType;
  source?: AdminNotificationSource;
  search?: string;
}

interface ListResponse {
  data?: {
    items?: AdminNotification[];
    unreadCount?: number;
    pagination?: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
    };
  };
}

interface SendResponse {
  data?: {
    createdCount?: number;
    recipients?: AdminNotificationAccount[];
    items?: AdminNotification[];
  };
}

export const adminNotificationService = {
  async list(params?: AdminNotificationListParams) {
    const response = await api.get<ListResponse>('/admin/notifications', { params });
    return {
      items: response.data.data?.items || [],
      unreadCount: response.data.data?.unreadCount || 0,
      pagination: response.data.data?.pagination || {
        page: params?.page || 1,
        limit: params?.limit || 20,
        totalItems: 0,
        totalPages: 1,
      },
    };
  },

  async send(payload: SendAdminNotificationPayload) {
    const response = await api.post<SendResponse>('/admin/notifications/send', payload);
    return {
      createdCount: response.data.data?.createdCount || 0,
      recipients: response.data.data?.recipients || [],
      items: response.data.data?.items || [],
    };
  },

  async markRead(id: string) {
    const response = await api.patch<{ data?: { item?: AdminNotification } }>(`/admin/notifications/${id}/read`);
    return response.data.data?.item;
  },
};
