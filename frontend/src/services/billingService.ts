import { api } from '@/lib/axios';

export interface BillingPlan {
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
  isActive: boolean;
}

export interface MyBilling {
  currentPlan?: {
    name?: string;
    slug?: string;
    price?: number;
    renewDate?: string;
    copyUsed?: number;
    copyLimit?: number;
    apiCalls?: number;
    apiLimit?: number;
  };
  plan: BillingPlan | null;
}

interface BillingResponse<T> {
  data?: T;
}

function numberOrDefault(value: unknown, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function stringArrayOrDefault(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.map(item => String(item || '').trim()).filter(Boolean)));
}

function normalizePlan(item: Partial<BillingPlan> | null | undefined): BillingPlan | null {
  if (!item) return null;
  const limits = (item.limits || {}) as Partial<BillingPlan['limits']>;

  return {
    id: item.id || item._id || '',
    _id: item._id,
    name: item.name || '',
    slug: item.slug || '',
    description: item.description || '',
    price: numberOrDefault(item.price ?? item.monthlyPrice, 0),
    monthlyPrice: numberOrDefault(item.monthlyPrice ?? item.price, 0),
    yearlyPrice: numberOrDefault(item.yearlyPrice, 0),
    currency: item.currency || 'VND',
    limits: {
      copyMonthly: numberOrDefault(limits.copyMonthly, 0),
      apiCallsMonthly: numberOrDefault(limits.apiCallsMonthly, 0),
      fineTuneModels: numberOrDefault(limits.fineTuneModels, 0),
      plagiarismChecks: numberOrDefault(limits.plagiarismChecks, 0),
      seats: numberOrDefault(limits.seats, 1),
      historyDays: numberOrDefault(limits.historyDays, 7),
    },
    features: item.features || [],
    excludedFeatures: item.excludedFeatures || [],
    allowedModels: stringArrayOrDefault(item.allowedModels),
    isPopular: Boolean(item.isPopular),
    isActive: Boolean(item.isActive ?? true),
  };
}

export const billingService = {
  async listPlans(): Promise<BillingPlan[]> {
    const response = await api.get<BillingResponse<{ items?: BillingPlan[] }>>('/billing/plans');
    return (response.data.data?.items || [])
      .map(item => normalizePlan(item))
      .filter((plan): plan is BillingPlan => Boolean(plan));
  },

  async me(): Promise<MyBilling> {
    const response = await api.get<BillingResponse<MyBilling>>('/billing/me');
    const data = response.data.data;

    return {
      currentPlan: data?.currentPlan,
      plan: normalizePlan(data?.plan),
    };
  },
};
