import { api } from '@/lib/axios';

export type GenerateOptionGroup = 'industries' | 'copy-types' | 'tones';

export interface GenerateOption {
  id: string;
  _id?: string;
  group: 'industry' | 'copy_type' | 'tone';
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
  active: boolean;
  order: number;
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface GenerateOptionGroups {
  industries: GenerateOption[];
  copyTypes: GenerateOption[];
  tones: GenerateOption[];
}

export interface UpsertGenerateOptionPayload {
  name?: string;
  slug?: string;
  description?: string;
  icon?: string;
  color?: string;
  isActive?: boolean;
  order?: number;
}

interface BackendGenerateOption {
  id?: string;
  _id?: string;
  group?: GenerateOption['group'];
  name?: string;
  slug?: string;
  description?: string;
  icon?: string;
  color?: string;
  isActive?: boolean;
  active?: boolean;
  order?: number;
  isDeleted?: boolean;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface OptionListResponse {
  data?: {
    items?: BackendGenerateOption[];
    option?: BackendGenerateOption;
    industries?: BackendGenerateOption[];
    copyTypes?: BackendGenerateOption[];
    tones?: BackendGenerateOption[];
  };
}

function normalizeOption(item: BackendGenerateOption): GenerateOption {
  const isActive = Boolean(item.isActive ?? item.active ?? true);

  return {
    id: item.id || item._id || '',
    _id: item._id,
    group: item.group || 'industry',
    name: item.name || '',
    slug: item.slug || '',
    description: item.description || '',
    icon: item.icon || '',
    color: item.color || '',
    isActive,
    active: isActive,
    order: Number(item.order || 0),
    isDeleted: Boolean(item.isDeleted),
    deletedAt: item.deletedAt || null,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function unwrapItems(response: { data: OptionListResponse }) {
  return (response.data.data?.items || []).map(normalizeOption);
}

function unwrapOption(response: { data: OptionListResponse }) {
  const option = response.data.data?.option;
  if (!option) throw new Error('Invalid generate option response');
  return normalizeOption(option);
}

function unwrapGroups(response: { data: OptionListResponse }): GenerateOptionGroups {
  const data = response.data.data || {};
  return {
    industries: (data.industries || []).map(normalizeOption),
    copyTypes: (data.copyTypes || []).map(normalizeOption),
    tones: (data.tones || []).map(normalizeOption),
  };
}

export const generateOptionService = {
  async listActiveGroups() {
    const response = await api.get<OptionListResponse>('/generate-options');
    return unwrapGroups(response);
  },

  async listAdmin(group: GenerateOptionGroup) {
    const response = await api.get<OptionListResponse>(`/admin/generate-options/${group}`);
    return unwrapItems(response);
  },

  async listTrash(group: GenerateOptionGroup) {
    const response = await api.get<OptionListResponse>(`/admin/generate-options/${group}/trash`);
    return unwrapItems(response);
  },

  async create(group: GenerateOptionGroup, payload: UpsertGenerateOptionPayload) {
    const response = await api.post<OptionListResponse>(`/admin/generate-options/${group}`, payload);
    return unwrapOption(response);
  },

  async update(group: GenerateOptionGroup, id: string, payload: UpsertGenerateOptionPayload) {
    const response = await api.patch<OptionListResponse>(`/admin/generate-options/${group}/${id}`, payload);
    return unwrapOption(response);
  },

  async remove(group: GenerateOptionGroup, id: string) {
    const response = await api.delete<OptionListResponse>(`/admin/generate-options/${group}/${id}`);
    return unwrapOption(response);
  },

  async restore(group: GenerateOptionGroup, id: string) {
    const response = await api.patch<OptionListResponse>(`/admin/generate-options/${group}/${id}/restore`);
    return unwrapOption(response);
  },

  async permanentDelete(group: GenerateOptionGroup, id: string) {
    await api.delete(`/admin/generate-options/${group}/${id}/permanent`);
  },
};
