import { api } from '@/lib/axios';
import { formatContentModelDisplayName } from '@/lib/modelDisplayName';

export interface AdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  lockedUsers: number;
  totalContents: number;
  deletedContents: number;
  totalUsage: number;
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  auditEventsToday: number;
  warningsToday: number;
  errorsToday: number;
}

export interface AdminMonthlyStat {
  name: string;
  month: string;
  users: number;
  copies: number;
}

export interface AdminContentTypeStat {
  name: string;
  value: number;
}

export interface AdminRecentContent {
  id: string;
  title: string;
  type: string;
  modelUsed: string;
  modelDisplayName?: string;
  wordCount: number;
  createdAt?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface AdminDashboardData {
  stats: AdminDashboardStats;
  monthlyData: AdminMonthlyStat[];
  contentTypeData: AdminContentTypeStat[];
  recentContents: AdminRecentContent[];
}

const EMPTY_DASHBOARD: AdminDashboardData = {
  stats: {
    totalUsers: 0,
    activeUsers: 0,
    lockedUsers: 0,
    totalContents: 0,
    deletedContents: 0,
    totalUsage: 0,
    totalTokens: 0,
    promptTokens: 0,
    completionTokens: 0,
    auditEventsToday: 0,
    warningsToday: 0,
    errorsToday: 0,
  },
  monthlyData: [],
  contentTypeData: [],
  recentContents: [],
};

interface DashboardResponse {
  data?: Partial<AdminDashboardData>;
}

function normalizeDashboard(data?: Partial<AdminDashboardData>): AdminDashboardData {
  return {
    stats: { ...EMPTY_DASHBOARD.stats, ...(data?.stats || {}) },
    monthlyData: data?.monthlyData || [],
    contentTypeData: data?.contentTypeData || [],
    recentContents: (data?.recentContents || []).map((item) => ({
      ...item,
      modelDisplayName: formatContentModelDisplayName(item.modelDisplayName, item.modelUsed),
    })),
  };
}

export const adminDashboardService = {
  async getStats() {
    const response = await api.get<DashboardResponse>('/admin/stats');
    return normalizeDashboard(response.data.data);
  },
};
