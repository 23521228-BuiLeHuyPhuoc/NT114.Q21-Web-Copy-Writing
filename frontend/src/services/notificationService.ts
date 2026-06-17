import {
  Bell,
  CheckCircle2,
  CreditCard,
  Sparkles,
  UserCircle,
  type LucideIcon,
} from 'lucide-react';
import { api } from '@/lib/axios';
import type { NotificationPreferences } from '@/types/auth';

export interface NotificationListParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

interface NotificationPreferencesResponse {
  data?: {
    preferences?: NotificationPreferences;
  };
}

const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  quotaLow: true,
};

function normalizePreferences(preferences?: Partial<NotificationPreferences>): NotificationPreferences {
  return {
    quotaLow: preferences?.quotaLow !== false,
  };
}

type BackendNotificationType = 'system' | 'billing' | 'ai' | 'account';
type UiNotificationType = 'success' | 'warning' | 'info' | 'error';

interface BackendNotification {
  id?: string;
  _id?: string;
  title?: string;
  message?: string;
  desc?: string;
  type?: BackendNotificationType;
  isRead?: boolean;
  read?: boolean;
  actionUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UiNotification {
  id: string;
  type: UiNotificationType;
  sourceType: BackendNotificationType;
  icon: LucideIcon;
  color: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
  actionUrl: string;
  createdAt?: string;
}

const TYPE_META: Record<BackendNotificationType, {
  uiType: UiNotificationType;
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

function normalizeNotification(item: BackendNotification): UiNotification {
  const sourceType = item.type || 'system';
  const meta = TYPE_META[sourceType] || TYPE_META.system;

  return {
    id: item.id || item._id || '',
    type: meta.uiType,
    sourceType,
    icon: item.isRead || item.read ? CheckCircle2 : meta.icon,
    color: meta.color,
    title: item.title || 'Thông báo',
    desc: item.message || item.desc || '',
    time: formatRelativeTime(item.createdAt),
    read: Boolean(item.isRead || item.read),
    actionUrl: item.actionUrl || '',
    createdAt: item.createdAt,
  };
}

function unwrapItem(response: { data: { data?: { item?: BackendNotification } } }) {
  const item = response.data.data?.item;
  if (!item) throw new Error('Invalid notification response');
  return normalizeNotification(item);
}

export const notificationService = {
  async getPreferences() {
    const response = await api.get<NotificationPreferencesResponse>('/notifications/preferences');
    return normalizePreferences(response.data.data?.preferences || DEFAULT_NOTIFICATION_PREFERENCES);
  },

  async updatePreferences(payload: NotificationPreferences) {
    const response = await api.patch<NotificationPreferencesResponse>('/notifications/preferences', payload);
    return normalizePreferences(response.data.data?.preferences || payload);
  },

  async list(params?: NotificationListParams) {
    const response = await api.get<{
      data?: {
        items?: BackendNotification[];
        unreadCount?: number;
      };
    }>('/notifications', { params });

    return (response.data.data?.items || []).map(normalizeNotification);
  },

  async listHeader() {
    return notificationService.list({ page: 1, limit: 5 });
  },

  async markRead(id: string) {
    const response = await api.patch<{ data?: { item?: BackendNotification } }>(`/notifications/${id}/read`);
    return unwrapItem(response);
  },

  async markAllRead() {
    await api.patch('/notifications/read-all');
    return true;
  },
};
