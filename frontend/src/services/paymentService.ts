import { api } from '@/lib/axios';

export type PaymentStatus = 'success' | 'pending' | 'failed' | 'refunded';

export interface PaymentItem {
  id: string;
  _id?: string;
  paymentId?: string;
  invoiceNo?: string;
  userId?: string | null;
  planId?: string | null;
  subscriptionId?: string | null;
  user: string;
  email: string;
  amount: number;
  currency: string;
  plan: string;
  method: string;
  methodCode?: string;
  provider?: string;
  status: PaymentStatus;
  date: string;
  invoiceDate?: string;
  paidAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface RevenuePoint {
  month: string;
  revenue: number;
}

export interface PaymentRevenueStats {
  monthlyRevenue: number;
  todayTransactions: number;
  successRate: number;
  totalTransactions: number;
}

export interface PaymentRevenueData {
  items: RevenuePoint[];
  stats: PaymentRevenueStats;
}

interface PaymentListResponse {
  data?: {
    items?: Partial<PaymentItem>[];
  };
}

interface RevenueResponse {
  data?: {
    items?: RevenuePoint[];
    stats?: Partial<PaymentRevenueStats>;
  };
}

function normalizePayment(item: Partial<PaymentItem>): PaymentItem {
  return {
    id: item.id || item.invoiceNo || item.paymentId || item._id || '',
    _id: item._id,
    paymentId: item.paymentId,
    invoiceNo: item.invoiceNo,
    userId: item.userId ?? null,
    planId: item.planId ?? null,
    subscriptionId: item.subscriptionId ?? null,
    user: item.user || 'Unknown customer',
    email: item.email || '',
    amount: Number(item.amount || 0),
    currency: item.currency || 'VND',
    plan: item.plan || 'Unknown plan',
    method: item.method || item.methodCode || '-',
    methodCode: item.methodCode,
    provider: item.provider,
    status: item.status || 'pending',
    date: item.date || '',
    invoiceDate: item.invoiceDate,
    paidAt: item.paidAt ?? null,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function normalizeRevenue(response: RevenueResponse): PaymentRevenueData {
  const stats = response.data?.stats || {};

  return {
    items: response.data?.items || [],
    stats: {
      monthlyRevenue: Number(stats.monthlyRevenue || 0),
      todayTransactions: Number(stats.todayTransactions || 0),
      successRate: Number(stats.successRate || 0),
      totalTransactions: Number(stats.totalTransactions || 0),
    },
  };
}

export const paymentService = {
  async list() {
    const response = await api.get<PaymentListResponse>('/admin/payments');
    return (response.data.data?.items || []).map(normalizePayment);
  },

  async getRevenue() {
    const response = await api.get<RevenueResponse>('/admin/payments/revenue');
    return normalizeRevenue(response.data);
  },
};
