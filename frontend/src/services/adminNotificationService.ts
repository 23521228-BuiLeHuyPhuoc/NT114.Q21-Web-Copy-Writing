import { api } from '@/lib/axios';
import {
  Bell,
  CheckCircle2,
  CreditCard,
  Sparkles,
  UserCircle,
  type LucideIcon,
} from 'lucide-react';

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

type AdminUiNotificationType = 'success' | 'warning' | 'info' | 'error';

export interface AdminUiNotification {
  id: string;
  type: AdminUiNotificationType;
  sourceType: AdminNotificationType;
  icon: LucideIcon;
  color: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
  actionUrl: string;
  createdAt?: string;
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

const TYPE_META: Record<AdminNotificationType, {
  uiType: AdminUiNotificationType;
  icon: LucideIcon;
  color: string;
}> = {
  ai: {
    uiType: 'success',
    icon: Sparkles,
    color: 'bg-green-100 text-green-700',
  },
  system: {
    uiType: 'info',
    icon: Bell,
    color: 'bg-blue-100 text-blue-700',
  },
  billing: {
    uiType: 'warning',
    icon: CreditCard,
    color: 'bg-amber-100 text-amber-700',
  },
  account: {
    uiType: 'info',
    icon: UserCircle,
    color: 'bg-emerald-100 text-emerald-700',
  },
};

function formatRelativeTime(value?: string) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const diffMs = date.getTime() - Date.now();
  const absMs = Math.abs(diffMs);
  const formatter = new Intl.RelativeTimeFormat('vi-VN', { numeric: 'auto' });

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;

  if (absMs < minute) return 'vừa xong';
  if (absMs < hour) return formatter.format(Math.round(diffMs / minute), 'minute');
  if (absMs < day) return formatter.format(Math.round(diffMs / hour), 'hour');
  if (absMs < week) return formatter.format(Math.round(diffMs / day), 'day');

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function normalizeNotification(item: AdminNotification): AdminUiNotification {
  const sourceType = item.type || 'system';
  const meta = TYPE_META[sourceType] || TYPE_META.system;

  return {
    id: item.id,
    type: meta.uiType,
    sourceType,
    icon: item.isRead ? CheckCircle2 : meta.icon,
    color: meta.color,
    title: item.title || 'Thông báo',
    desc: item.message || '',
    time: formatRelativeTime(item.createdAt),
    read: Boolean(item.isRead),
    actionUrl: item.actionUrl || '',
    createdAt: item.createdAt,
  };
}

function unwrapItem(response: { data: { data?: { item?: AdminNotification } } }) {
  const item = response.data.data?.item;
  if (!item) throw new Error('Invalid admin notification response');
  return normalizeNotification(item);
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
    return unwrapItem(response);
  },

  async listHeader() {
    const data = await adminNotificationService.list({ page: 1, limit: 5, source: 'received_by_me' });
    return {
      items: data.items.map(normalizeNotification),
      unreadCount: data.unreadCount,
    };
  },

  async markAllRead() {
    await api.patch('/admin/notifications/read-all');
    return true;
  },
};
