import { api } from '@/lib/axios';

export type AdminTemplateStatus = 'active' | 'inactive' | 'archived';

export interface AdminTemplateVariable {
  key: string;
  label: string;
  required: boolean;
  defaultValue: string;
}

export interface AdminTemplate {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  industry: string;
  type: string;
  systemPrompt: string;
  variables: AdminTemplateVariable[];
  isSystem: boolean;
  authorId: string | null;
  status: AdminTemplateStatus;
  active: boolean;
  usageCount: number;
  uses: number;
  rating: number;
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminTemplateListParams {
  search?: string;
  category?: string;
  type?: string;
  status?: 'all' | AdminTemplateStatus;
}

export interface UpsertAdminTemplatePayload {
  name?: string;
  slug?: string;
  description?: string;
  category?: string;
  type?: string;
  systemPrompt?: string;
  variables?: AdminTemplateVariable[];
  isSystem?: boolean;
  status?: AdminTemplateStatus;
}

interface TemplateListResponse {
  data?: {
    items?: Partial<AdminTemplate>[];
    template?: Partial<AdminTemplate>;
  };
}

function normalizeVariable(item: Partial<AdminTemplateVariable>): AdminTemplateVariable {
  return {
    key: item.key || '',
    label: item.label || item.key || '',
    required: Boolean(item.required),
    defaultValue: item.defaultValue || '',
  };
}

function normalizeTemplate(item: Partial<AdminTemplate>): AdminTemplate {
  const status = item.status || 'active';
  const usageCount = Number(item.usageCount ?? item.uses ?? 0);

  return {
    id: item.id || item._id || '',
    _id: item._id,
    name: item.name || 'Untitled template',
    slug: item.slug || '',
    description: item.description || '',
    category: item.category || item.industry || 'general',
    industry: item.industry || item.category || 'general',
    type: item.type || 'headline',
    systemPrompt: item.systemPrompt || '',
    variables: (item.variables || []).map(normalizeVariable),
    isSystem: Boolean(item.isSystem),
    authorId: item.authorId || null,
    status,
    active: item.active ?? status === 'active',
    usageCount,
    uses: usageCount,
    rating: Number(item.rating || 0),
    isDeleted: Boolean(item.isDeleted || status === 'archived'),
    deletedAt: item.deletedAt || null,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function unwrapItems(response: { data: TemplateListResponse }) {
  return (response.data.data?.items || []).map(normalizeTemplate);
}

function unwrapTemplate(response: { data: TemplateListResponse }) {
  const template = response.data.data?.template;
  if (!template) throw new Error('Invalid admin template response');
  return normalizeTemplate(template);
}

export const adminTemplateService = {
  async list(params?: AdminTemplateListParams) {
    const response = await api.get<TemplateListResponse>('/admin/templates', { params });
    return unwrapItems(response);
  },

  async listTrash(params?: AdminTemplateListParams) {
    const response = await api.get<TemplateListResponse>('/admin/templates/trash', { params });
    return unwrapItems(response);
  },

  async create(payload: UpsertAdminTemplatePayload) {
    const response = await api.post<TemplateListResponse>('/admin/templates', payload);
    return unwrapTemplate(response);
  },

  async update(id: string, payload: UpsertAdminTemplatePayload) {
    const response = await api.patch<TemplateListResponse>(`/admin/templates/${id}`, payload);
    return unwrapTemplate(response);
  },

  async remove(id: string) {
    const response = await api.delete<TemplateListResponse>(`/admin/templates/${id}`);
    return unwrapTemplate(response);
  },

  async restore(id: string) {
    const response = await api.patch<TemplateListResponse>(`/admin/templates/${id}/restore`);
    return unwrapTemplate(response);
  },

  async permanentDelete(id: string) {
    await api.delete(`/admin/templates/${id}/permanent`);
  },
};
