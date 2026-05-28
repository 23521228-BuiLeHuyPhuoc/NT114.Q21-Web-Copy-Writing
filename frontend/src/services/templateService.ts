import { api } from '@/lib/axios';

export interface TemplateListParams {
  category?: string;
  type?: string;
  search?: string;
}

interface BackendTemplateVariable {
  key?: string;
  label?: string;
  required?: boolean;
  defaultValue?: string;
}

interface BackendTemplate {
  id?: string;
  _id?: string;
  name?: string;
  slug?: string;
  description?: string;
  category?: string;
  type?: string;
  systemPrompt?: string;
  variables?: BackendTemplateVariable[];
  isSystem?: boolean;
  authorId?: string | null;
  status?: string;
  usageCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CopyTemplateVariable {
  key: string;
  label: string;
  required: boolean;
  defaultValue: string;
}

export interface CopyTemplate {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  type: string;
  systemPrompt: string;
  variables: CopyTemplateVariable[];
  isSystem: boolean;
  authorId: string | null;
  status: string;
  usageCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTemplatePayload {
  name: string;
  description?: string;
  category: string;
  type: string;
  systemPrompt: string;
  variables?: CopyTemplateVariable[];
}

function normalizeVariable(item: BackendTemplateVariable): CopyTemplateVariable {
  return {
    key: item.key || '',
    label: item.label || item.key || '',
    required: Boolean(item.required),
    defaultValue: item.defaultValue || '',
  };
}

function normalizeTemplate(item: BackendTemplate): CopyTemplate {
  return {
    id: item.id || item._id || '',
    name: item.name || 'Untitled template',
    slug: item.slug || '',
    description: item.description || '',
    category: item.category || 'general',
    type: item.type || 'headline',
    systemPrompt: item.systemPrompt || '',
    variables: (item.variables || []).map(normalizeVariable),
    isSystem: Boolean(item.isSystem),
    authorId: item.authorId || null,
    status: item.status || 'active',
    usageCount: item.usageCount || 0,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function unwrapItem(response: { data: { data?: { item?: BackendTemplate } } }) {
  const item = response.data.data?.item;
  if (!item) throw new Error('Invalid template response');
  return normalizeTemplate(item);
}

export const templateService = {
  async list(params?: TemplateListParams) {
    const response = await api.get<{ data?: { items?: BackendTemplate[] } }>('/templates', { params });
    return (response.data.data?.items || []).map(normalizeTemplate);
  },

  async get(id: string) {
    const response = await api.get<{ data?: { item?: BackendTemplate } }>(`/templates/${id}`);
    return unwrapItem(response);
  },

  async create(payload: CreateTemplatePayload) {
    const response = await api.post<{ data?: { item?: BackendTemplate } }>('/templates', payload);
    return unwrapItem(response);
  },
};
