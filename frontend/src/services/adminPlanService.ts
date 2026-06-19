import { api } from '@/lib/axios';

export interface AdminPlan {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  limits: {
    copyMonthly: number;
    apiCallsMonthly: number;
    fineTuneModels: number;
    plagiarismChecks: number;
    seats: number;
    historyDays: number;
  };
  features: string[];
  excludedFeatures: string[];
  allowedModels: string[];
  isPopular: boolean;
  popular: boolean;
  isActive: boolean;
  active: boolean;
  sortOrder: number;
  users: number;
  copyLimit: number;
  apiLimit: number;
  fineTune: number;
  plagiarismChecks: number;
  seats: number;
  historyDays: number;
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpsertAdminPlanPayload {
  name?: string;
  description?: string;
  price?: number;
  monthlyPrice?: number;
  yearlyPrice?: number;
  currency?: string;
  copyLimit?: number;
  apiLimit?: number;
  fineTune?: number;
  plagiarismChecks?: number;
  seats?: number;
  historyDays?: number;
  features?: string[];
  excludedFeatures?: string[];
  allowedModels?: string[];
  isPopular?: boolean;
  popular?: boolean;
  isActive?: boolean;
  active?: boolean;
}

interface PlanListResponse {
  data?: {
    items?: Partial<AdminPlan>[];
    plan?: Partial<AdminPlan>;
  };
}

function numberOrDefault(value: unknown, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function stringArrayOrDefault(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.map(item => String(item || '').trim()).filter(Boolean)));
}

function normalizePlan(item: Partial<AdminPlan>): AdminPlan {
  const limits: Partial<AdminPlan['limits']> = item.limits || {};
  const isActive = Boolean(item.isActive ?? item.active ?? true);
  const isPopular = Boolean(item.isPopular ?? item.popular ?? false);
  const monthlyPrice = numberOrDefault(item.monthlyPrice ?? item.price, 0);
  const copyLimit = numberOrDefault(item.copyLimit ?? limits.copyMonthly, 0);
  const apiLimit = numberOrDefault(item.apiLimit ?? limits.apiCallsMonthly, 0);
  const fineTune = numberOrDefault(item.fineTune ?? limits.fineTuneModels, 0);
  const plagiarismChecks = numberOrDefault(item.plagiarismChecks ?? limits.plagiarismChecks, 0);
  const seats = numberOrDefault(item.seats ?? limits.seats, 1);
  const historyDays = numberOrDefault(item.historyDays ?? limits.historyDays, 7);

  return {
    id: item.id || item._id || '',
    _id: item._id,
    name: item.name || '',
    slug: item.slug || '',
    description: item.description || '',
    price: numberOrDefault(item.price ?? monthlyPrice, 0),
    monthlyPrice,
    yearlyPrice: numberOrDefault(item.yearlyPrice, 0),
    currency: item.currency || 'VND',
    limits: {
      copyMonthly: copyLimit,
      apiCallsMonthly: apiLimit,
      fineTuneModels: fineTune,
      plagiarismChecks,
      seats,
      historyDays,
    },
    features: item.features || [],
    excludedFeatures: item.excludedFeatures || [],
    allowedModels: stringArrayOrDefault(item.allowedModels),
    isPopular,
    popular: isPopular,
    isActive,
    active: isActive,
    sortOrder: numberOrDefault(item.sortOrder, 0),
    users: numberOrDefault(item.users, 0),
    copyLimit,
    apiLimit,
    fineTune,
    plagiarismChecks,
    seats,
    historyDays,
    isDeleted: Boolean(item.isDeleted),
    deletedAt: item.deletedAt || null,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function unwrapItems(response: { data: PlanListResponse }) {
  return (response.data.data?.items || []).map(normalizePlan);
}

function unwrapPlan(response: { data: PlanListResponse }) {
  const plan = response.data.data?.plan;
  if (!plan) throw new Error('Invalid admin plan response');
  return normalizePlan(plan);
}

export const adminPlanService = {
  async list() {
    const response = await api.get<PlanListResponse>('/admin/plans');
    return unwrapItems(response);
  },

  async listTrash() {
    const response = await api.get<PlanListResponse>('/admin/plans/trash');
    return unwrapItems(response);
  },

  async create(payload: UpsertAdminPlanPayload) {
    const response = await api.post<PlanListResponse>('/admin/plans', payload);
    return unwrapPlan(response);
  },

  async update(id: string, payload: UpsertAdminPlanPayload) {
    const response = await api.patch<PlanListResponse>(`/admin/plans/${id}`, payload);
    return unwrapPlan(response);
  },

  async remove(id: string) {
    const response = await api.delete<PlanListResponse>(`/admin/plans/${id}`);
    return unwrapPlan(response);
  },

  async restore(id: string) {
    const response = await api.patch<PlanListResponse>(`/admin/plans/${id}/restore`);
    return unwrapPlan(response);
  },

  async permanentDelete(id: string) {
    await api.delete(`/admin/plans/${id}/permanent`);
  },
};
