import { api } from '@/lib/axios';

export interface ProjectListParams {
  page?: number;
  limit?: number;
  search?: string;
  includeArchived?: boolean;
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateProjectPayload {
  name?: string;
  description?: string;
  isArchived?: boolean;
  color?: string;
}

interface BackendProject {
  id?: string;
  _id?: string;
  name?: string;
  description?: string;
  desc?: string;
  contentCount?: number;
  contents?: number;
  industry?: string;
  status?: string;
  isArchived?: boolean;
  color?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UiProject {
  id: string;
  name: string;
  desc: string;
  description: string;
  contents: number;
  contentCount: number;
  industry: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'archived' | 'completed';
  isArchived: boolean;
  color: string;
}

function formatDate(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function normalizeProject(item: BackendProject): UiProject {
  const description = item.description || item.desc || '';
  const isArchived = Boolean(item.isArchived || item.status === 'archived');
  const contentCount = item.contentCount ?? item.contents ?? 0;

  return {
    id: item.id || item._id || '',
    name: item.name || 'Untitled project',
    desc: description,
    description,
    contents: contentCount,
    contentCount,
    industry: item.industry || 'General',
    createdAt: formatDate(item.createdAt),
    updatedAt: formatDate(item.updatedAt),
    status: isArchived ? 'archived' : 'active',
    isArchived,
    color: item.color || 'from-green-500 to-emerald-600',
  };
}

function unwrapItem(response: { data: { data?: { item?: BackendProject } } }) {
  const item = response.data.data?.item;
  if (!item) throw new Error('Invalid project response');
  return normalizeProject(item);
}

export const projectService = {
  async list(params?: ProjectListParams) {
    const response = await api.get<{ data?: { items?: BackendProject[] } }>('/projects', { params });
    return (response.data.data?.items || []).map(normalizeProject);
  },

  async get(id: string) {
    const response = await api.get<{ data?: { item?: BackendProject } }>(`/projects/${id}`);
    return unwrapItem(response);
  },

  async create(payload: CreateProjectPayload) {
    const response = await api.post<{ data?: { item?: BackendProject } }>('/projects', payload);
    return unwrapItem(response);
  },

  async update(id: string, payload: UpdateProjectPayload) {
    const response = await api.patch<{ data?: { item?: BackendProject } }>(`/projects/${id}`, payload);
    return unwrapItem(response);
  },
};
