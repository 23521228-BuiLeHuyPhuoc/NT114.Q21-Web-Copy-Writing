import { api } from '@/lib/axios';

export type AuditLogLevel = 'info' | 'warning' | 'error';

export interface AuditLogItem {
  id: string;
  action: string;
  user: string;
  role: string;
  ip: string;
  details: string;
  level: AuditLogLevel;
  timestamp: string;
  createdAt?: string;
}

export interface AuditLogListParams {
  page?: number;
  limit?: number;
  search?: string;
  level?: 'all' | AuditLogLevel;
}

export interface AuditLogCreatePayload {
  action: string;
  targetType?: string;
  targetId?: string;
  level?: AuditLogLevel;
  metadata?: Record<string, unknown>;
}

interface BackendAuditLog {
  id?: string;
  action?: string;
  actorEmail?: string;
  actorRole?: string;
  user?: string;
  role?: string;
  ip?: string;
  details?: string;
  level?: AuditLogLevel;
  timestamp?: string;
  createdAt?: string;
}

interface ListResponse {
  data?: {
    items?: BackendAuditLog[];
  };
}

function formatDate(value?: string) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
}

function normalizeLog(item: BackendAuditLog): AuditLogItem {
  return {
    id: item.id || `${item.action}-${item.timestamp}`,
    action: item.action || 'system.event',
    user: item.user || item.actorEmail || 'system',
    role: item.role || item.actorRole || 'system',
    ip: item.ip || '-',
    details: item.details || item.action || 'System event',
    level: item.level || 'info',
    timestamp: formatDate(item.timestamp || item.createdAt),
    createdAt: item.createdAt || item.timestamp,
  };
}

export const auditLogService = {
  async list(params?: AuditLogListParams) {
    const response = await api.get<ListResponse>('/admin/audit-logs', { params: { limit: 100, ...params } });
    return (response.data.data?.items || []).map(normalizeLog);
  },

  async create(payload: AuditLogCreatePayload) {
    const response = await api.post('/admin/audit-logs', payload);
    return response.data.data?.item ? normalizeLog(response.data.data.item) : null;
  },
};
