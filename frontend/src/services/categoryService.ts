import { api } from '@/lib/axios';

interface CategoryResponse {
  data?: {
    items?: BackendCategory[];
    category?: BackendCategory;
  };
}

interface BackendCategory {
  id?: string;
  _id?: string;
  name?: string;
  slug?: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
  active?: boolean;
  order?: number;
  templateCount?: number;
  templates?: number;
  usersCount?: number;
  users?: number;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  isActive: boolean;
  active: boolean;
  order: number;
  templateCount: number;
  templates: number;
  usersCount: number;
  users: number;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryPayload {
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
  order?: number;
}

export interface UpdateCategoryPayload {
  name?: string;
  slug?: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
  order?: number;
}

function normalizeCategory(item: BackendCategory): AdminCategory {
  const isActive = Boolean(item.isActive ?? item.active ?? true);
  const templateCount = Number(item.templateCount ?? item.templates ?? 0);
  const usersCount = Number(item.usersCount ?? item.users ?? 0);

  return {
    id: item.id || item._id || '',
    name: item.name || '',
    slug: item.slug || '',
    description: item.description || '',
    icon: item.icon || '🏷️',
    isActive,
    active: isActive,
    order: Number(item.order || 0),
    templateCount,
    templates: templateCount,
    usersCount,
    users: usersCount,
    deletedAt: item.deletedAt || null,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function unwrapItems(response: { data: CategoryResponse }) {
  return (response.data.data?.items || []).map(normalizeCategory);
}

function unwrapCategory(response: { data: CategoryResponse }) {
  const category = response.data.data?.category;
  if (!category) throw new Error('Invalid category response');
  return normalizeCategory(category);
}

export const categoryService = {
  async list() {
    const response = await api.get<CategoryResponse>('/admin/categories');
    return unwrapItems(response);
  },

  async listTrash() {
    const response = await api.get<CategoryResponse>('/admin/categories/trash');
    return unwrapItems(response);
  },

  async create(payload: CreateCategoryPayload) {
    const response = await api.post<CategoryResponse>('/admin/categories', payload);
    return unwrapCategory(response);
  },

  async update(id: string, payload: UpdateCategoryPayload) {
    const response = await api.patch<CategoryResponse>(`/admin/categories/${id}`, payload);
    return unwrapCategory(response);
  },

  async remove(id: string) {
    const response = await api.delete<CategoryResponse>(`/admin/categories/${id}`);
    return unwrapCategory(response);
  },

  async restore(id: string) {
    const response = await api.patch<CategoryResponse>(`/admin/categories/${id}/restore`);
    return unwrapCategory(response);
  },

  async permanentDelete(id: string) {
    await api.delete(`/admin/categories/${id}/permanent`);
  },
};
