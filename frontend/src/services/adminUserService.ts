import { api } from '@/lib/axios';
import type { User, UserRole, UserStatus } from '@/types/auth';
import type { AdminRole, CustomerRole } from '@/lib/permissions';

export type AdminUserAccountType = 'user' | 'admin';

export interface AdminUser extends User {
  quotaResetAt?: string | null;
  deletedAt?: string | null;
}

export interface CreateAdminUserPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  status?: UserStatus;
  adminRole?: AdminRole;
  customerRole?: CustomerRole;
}

export interface UpdateAdminUserPayload {
  name?: string;
  email?: string;
  status?: UserStatus;
  adminRole?: AdminRole;
  customerRole?: CustomerRole;
}

interface ListResponse {
  data?: {
    items?: AdminUser[];
  };
}

function accountTypeFromRole(role: UserRole): AdminUserAccountType {
  return role === 'admin' ? 'admin' : 'user';
}

function unwrapItems(response: { data: ListResponse }) {
  return response.data.data?.items ?? [];
}

export const adminUserService = {
  accountTypeFromRole,

  async list() {
    const response = await api.get<ListResponse>('/admin/users');
    return unwrapItems(response);
  },

  async listTrash() {
    const response = await api.get<ListResponse>('/admin/users/trash');
    return unwrapItems(response);
  },

  async create(payload: CreateAdminUserPayload) {
    const response = await api.post('/admin/users', payload);
    return response.data.data?.user as AdminUser;
  },

  async update(accountType: AdminUserAccountType, id: string, payload: UpdateAdminUserPayload) {
    const response = await api.patch(`/admin/users/${accountType}/${id}`, payload);
    return response.data.data?.user as AdminUser;
  },

  async remove(accountType: AdminUserAccountType, id: string) {
    const response = await api.delete(`/admin/users/${accountType}/${id}`);
    return response.data.data?.user as AdminUser;
  },

  async restore(accountType: AdminUserAccountType, id: string) {
    const response = await api.patch(`/admin/users/${accountType}/${id}/restore`);
    return response.data.data?.user as AdminUser;
  },

  async permanentDelete(accountType: AdminUserAccountType, id: string) {
    await api.delete(`/admin/users/${accountType}/${id}/permanent`);
  },

  async permanentDeleteMany(items: Array<{ accountType: AdminUserAccountType; id: string }>) {
    const results = await Promise.allSettled(
      items.map(item => api.delete(`/admin/users/${item.accountType}/${item.id}/permanent`)),
    );
    const rejected = results.find(result => result.status === 'rejected');
    if (rejected?.status === 'rejected') throw rejected.reason;
  },
};
