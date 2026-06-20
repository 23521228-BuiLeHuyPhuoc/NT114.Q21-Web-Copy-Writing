import { api } from '@/lib/axios';

export type ContactTopic = 'product' | 'support' | 'partner' | 'business' | 'billing' | 'other';
export type ContactStatus = 'new' | 'in_progress' | 'resolved' | 'spam' | 'archived';

export interface ContactSubmissionPayload {
  name: string;
  email: string;
  company?: string;
  topic: ContactTopic;
  message: string;
}

export interface ContactSubmission {
  id: string;
  _id?: string;
  name: string;
  email: string;
  company: string;
  topic: ContactTopic;
  message: string;
  status: ContactStatus;
  adminNote: string;
  handledBy?: {
    id: string;
    name: string;
    email: string;
    adminRole?: string;
  } | null;
  handledAt?: string | null;
  ip?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactSubmissionStats {
  total: number;
  new: number;
  inProgress: number;
  resolved: number;
  spam: number;
  archived: number;
}

export interface ContactSubmissionPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface ContactSubmissionListQuery {
  page?: number;
  limit?: number;
  status?: ContactStatus | 'all';
  topic?: ContactTopic | 'all';
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface ApiResponse<T> {
  data?: T;
}

function queryParams(query: ContactSubmissionListQuery = {}) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  });
  return params.toString();
}

export const contactSubmissionService = {
  async create(payload: ContactSubmissionPayload): Promise<ContactSubmission> {
    const response = await api.post<ApiResponse<{ item?: ContactSubmission }>>('/contact-submissions', payload);
    const item = response.data.data?.item;
    if (!item) throw new Error('Invalid contact submission response');
    return item;
  },

  async listAdmin(query: ContactSubmissionListQuery = {}): Promise<{
    items: ContactSubmission[];
    stats: ContactSubmissionStats;
    pagination: ContactSubmissionPagination;
  }> {
    const qs = queryParams(query);
    const response = await api.get<ApiResponse<{
      items?: ContactSubmission[];
      stats?: ContactSubmissionStats;
      pagination?: ContactSubmissionPagination;
    }>>(`/admin/contact-submissions${qs ? `?${qs}` : ''}`);
    return {
      items: response.data.data?.items || [],
      stats: response.data.data?.stats || { total: 0, new: 0, inProgress: 0, resolved: 0, spam: 0, archived: 0 },
      pagination: response.data.data?.pagination || { page: 1, limit: 20, totalItems: 0, totalPages: 1 },
    };
  },

  async updateAdmin(id: string, payload: { status?: ContactStatus; adminNote?: string }): Promise<ContactSubmission> {
    const response = await api.patch<ApiResponse<{ item?: ContactSubmission }>>(`/admin/contact-submissions/${id}`, payload);
    const item = response.data.data?.item;
    if (!item) throw new Error('Invalid contact submission response');
    return item;
  },

  async deleteAdmin(id: string): Promise<void> {
    await api.delete(`/admin/contact-submissions/${id}`);
  },
};
