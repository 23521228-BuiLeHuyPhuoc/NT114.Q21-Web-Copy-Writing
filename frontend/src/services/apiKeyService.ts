import { api } from '@/lib/axios';

export interface ApiKeyItem {
  id: string;
  name: string;
  key: string;
  created: string;
  createdAt?: string;
  lastUsed: string | null;
  lastUsedAt?: string | null;
  calls: number;
  status: 'active' | 'revoked';
  permissions: string[];
}

export interface ApiKeyLogItem {
  id: string;
  endpoint: string;
  model: string;
  status: number;
  latency: string;
  time: string;
  tokens: number;
  industry: string;
}

export interface CreateApiKeyPayload {
  name: string;
  permissions: string[];
}

interface ListResponse<T> {
  data?: {
    items?: T[];
    item?: T;
  };
}

function formatDate(value?: string | null) {
  if (!value) return 'Chua dung';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function normalizeKey(item: Partial<ApiKeyItem>): ApiKeyItem {
  return {
    id: item.id || '',
    name: item.name || '',
    key: item.key || '',
    created: formatDate(item.createdAt || item.created),
    createdAt: item.createdAt,
    lastUsed: item.lastUsedAt || item.lastUsed ? formatDate(item.lastUsedAt || item.lastUsed) : 'Chua dung',
    lastUsedAt: item.lastUsedAt,
    calls: Number(item.calls || 0),
    status: item.status || 'active',
    permissions: item.permissions || [],
  };
}

function normalizeLog(item: Partial<ApiKeyLogItem>): ApiKeyLogItem {
  return {
    id: item.id || '',
    endpoint: item.endpoint || '-',
    model: item.model || '-',
    status: Number(item.status || 0),
    latency: item.latency || '-',
    time: formatDate(item.time),
    tokens: Number(item.tokens || 0),
    industry: item.industry || '-',
  };
}

function unwrapItem(response: { data: ListResponse<ApiKeyItem> }) {
  const item = response.data.data?.item;
  if (!item) throw new Error('Invalid API key response');
  return normalizeKey(item);
}

export const apiKeyService = {
  async listKeys() {
    const response = await api.get<ListResponse<ApiKeyItem>>('/api-keys');
    return (response.data.data?.items || []).map(normalizeKey);
  },

  async createKey(payload: CreateApiKeyPayload) {
    const response = await api.post<ListResponse<ApiKeyItem>>('/api-keys', payload);
    return unwrapItem(response);
  },

  async revokeKey(id: string) {
    const response = await api.delete<ListResponse<ApiKeyItem>>(`/api-keys/${id}`);
    return unwrapItem(response);
  },

  async listLogs() {
    const response = await api.get<ListResponse<ApiKeyLogItem>>('/api-keys/logs');
    return (response.data.data?.items || []).map(normalizeLog);
  },
};
