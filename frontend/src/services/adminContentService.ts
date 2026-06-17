import { api } from '@/lib/axios';
import { formatContentModelDisplayName } from '@/lib/modelDisplayName';

export interface AdminContentUser {
  id: string;
  name: string;
  email: string;
  status?: string;
  avatar?: string;
}

export interface BackendAdminContent {
  id?: string;
  _id?: string;
  userId?: string;
  user?: AdminContentUser | null;
  projectId?: string | null;
  templateId?: string | null;
  title?: string;
  prompt?: string;
  outputText?: string;
  type?: string;
  tone?: string;
  language?: string;
  modelUsed?: string;
  modelDisplayName?: string;
  tags?: string[];
  isFavorite?: boolean;
  wordCount?: number;
  isDeleted?: boolean;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminContentItem {
  id: string;
  title: string;
  user: string;
  email: string;
  type: string;
  model: string;
  words: number;
  date: string;
  status: 'active' | 'hidden';
  body: string;
  prompt: string;
  tags: string[];
  isFavorite: boolean;
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminContentListParams {
  page?: number;
  limit?: number;
  search?: string;
  userId?: string;
}

export interface UpdateAdminContentPayload {
  title?: string;
  type?: string;
  tags?: string[];
  isFavorite?: boolean;
}

interface ListResponse {
  data?: {
    items?: BackendAdminContent[];
    pagination?: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
    };
  };
}

interface ItemResponse {
  data?: {
    item?: BackendAdminContent;
  };
}

const MAX_ADMIN_CONTENT_LIST_LIMIT = 100;

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function formatDate(value?: string | null) {
  if (!value) return '-';
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

function normalizeContent(item: BackendAdminContent): AdminContentItem {
  const body = item.outputText || '';
  const user = item.user;

  return {
    id: item.id || item._id || '',
    title: item.title || 'Untitled content',
    user: user?.name || 'Người dùng đã xóa',
    email: user?.email || '-',
    type: item.type || 'content',
    model: formatContentModelDisplayName(item.modelDisplayName, item.modelUsed),
    words: item.wordCount || countWords(body),
    date: formatDate(item.createdAt),
    status: item.isDeleted ? 'hidden' : 'active',
    body,
    prompt: item.prompt || '',
    tags: item.tags || [],
    isFavorite: Boolean(item.isFavorite),
    isDeleted: Boolean(item.isDeleted),
    deletedAt: item.deletedAt || null,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function unwrapItem(response: { data: ItemResponse }) {
  const item = response.data.data?.item;
  if (!item) throw new Error('Invalid admin content response');
  return normalizeContent(item);
}

function getAdminContentListLimit(limit?: number) {
  const value = Number(limit || MAX_ADMIN_CONTENT_LIST_LIMIT);
  if (!Number.isFinite(value)) return MAX_ADMIN_CONTENT_LIST_LIMIT;
  return Math.min(Math.max(Math.floor(value), 1), MAX_ADMIN_CONTENT_LIST_LIMIT);
}

async function fetchAdminContentPage(path: string, params?: AdminContentListParams) {
  const response = await api.get<ListResponse>(path, { params });
  return response.data.data || {};
}

async function fetchAllAdminContentPages(path: string, params?: AdminContentListParams) {
  const { page: _page, limit, ...rest } = params || {};
  const pageSize = getAdminContentListLimit(limit);
  const firstPage = await fetchAdminContentPage(path, { ...rest, page: 1, limit: pageSize });
  const totalPages = firstPage.pagination?.totalPages || 1;
  const items = [...(firstPage.items || [])];

  if (totalPages <= 1) return items;

  const remainingPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) => (
      fetchAdminContentPage(path, { ...rest, page: index + 2, limit: pageSize })
    )),
  );

  remainingPages.forEach((pageData) => {
    items.push(...(pageData.items || []));
  });

  return items;
}

export const adminContentService = {
  async list(params?: AdminContentListParams) {
    const items = await fetchAllAdminContentPages('/admin/contents', params);
    return items.map(normalizeContent);
  },

  async listTrash(params?: AdminContentListParams) {
    const items = await fetchAllAdminContentPages('/admin/contents/trash', params);
    return items.map(normalizeContent);
  },

  async update(id: string, payload: UpdateAdminContentPayload) {
    const response = await api.patch<ItemResponse>(`/admin/contents/${id}`, payload);
    return unwrapItem(response);
  },

  async remove(id: string) {
    const response = await api.delete<ItemResponse>(`/admin/contents/${id}`);
    return unwrapItem(response);
  },

  async restore(id: string) {
    const response = await api.patch<ItemResponse>(`/admin/contents/${id}/restore`);
    return unwrapItem(response);
  },

  async permanentDelete(id: string) {
    await api.delete(`/admin/contents/${id}/permanent`);
  },
};
