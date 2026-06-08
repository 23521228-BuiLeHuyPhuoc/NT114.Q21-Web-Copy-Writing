import { api } from '@/lib/axios';
import { MOCK_PAYMENTS, REVENUE_DATA } from '@/mocks/payments';

type PaymentItem = typeof MOCK_PAYMENTS[number];

interface PaymentListResponse {
  data?: {
    items?: PaymentItem[];
  };
}

interface RevenueResponse {
  data?: {
    items?: { month: string; revenue: number }[];
  };
}

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

export const paymentService = {
  list: async () => {
    try {
      const response = await api.get<PaymentListResponse>('/admin/payments');
      return response.data.data?.items ?? MOCK_PAYMENTS;
    } catch {
      await delay();
      return MOCK_PAYMENTS;
    }
  },
  getRevenue: async () => {
    try {
      const response = await api.get<RevenueResponse>('/admin/payments/revenue');
      return response.data.data?.items ?? REVENUE_DATA;
    } catch {
      await delay();
      return REVENUE_DATA;
    }
  },
};
