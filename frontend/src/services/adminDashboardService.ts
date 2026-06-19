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

export interface AdminUsageTotals {
  count: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  quotaUnits: number;
  activeUsers: number;
  lastUsedAt?: string | null;
}

export interface AdminUsageModelStat {
  model: string;
  modelDisplayName?: string;
  count: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  quotaUnits: number;
  users: number;
  lastUsedAt?: string | null;
}

export interface AdminUsageUserStat {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  status?: string;
  count: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  quotaUnits: number;
  lastUsedAt?: string | null;
}

export interface AdminUsageTimeStat {
  key: string;
  label: string;
  date?: string;
  month?: string;
  year?: string;
  count: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  quotaUnits: number;
}

export interface AdminUsageReport {
  totals: AdminUsageTotals;
  byModel: AdminUsageModelStat[];
  byUser: AdminUsageUserStat[];
  byDay: AdminUsageTimeStat[];
  byMonth: AdminUsageTimeStat[];
  byYear: AdminUsageTimeStat[];
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
  usageReport: AdminUsageReport;
}

const EMPTY_USAGE_TOTALS: AdminUsageTotals = {
  count: 0,
  promptTokens: 0,
  completionTokens: 0,
  totalTokens: 0,
  quotaUnits: 0,
  activeUsers: 0,
  lastUsedAt: null,
};

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
  usageReport: {
    totals: EMPTY_USAGE_TOTALS,
    byModel: [],
    byUser: [],
    byDay: [],
    byMonth: [],
    byYear: [],
  },
};

interface DashboardResponse {
  data?: Partial<AdminDashboardData>;
}

function normalizeDashboard(data?: Partial<AdminDashboardData>): AdminDashboardData {
  const usageReport = data?.usageReport || EMPTY_DASHBOARD.usageReport;

  return {
    stats: { ...EMPTY_DASHBOARD.stats, ...(data?.stats || {}) },
    monthlyData: data?.monthlyData || [],
    contentTypeData: data?.contentTypeData || [],
    recentContents: (data?.recentContents || []).map((item) => ({
      ...item,
      modelDisplayName: formatContentModelDisplayName(item.modelDisplayName, item.modelUsed),
    })),
    usageReport: {
      totals: { ...EMPTY_USAGE_TOTALS, ...(usageReport.totals || {}) },
      byModel: (usageReport.byModel || []).map((item) => ({
        ...item,
        modelDisplayName: formatContentModelDisplayName(item.modelDisplayName, item.model),
      })),
      byUser: usageReport.byUser || [],
      byDay: usageReport.byDay || [],
      byMonth: usageReport.byMonth || [],
      byYear: usageReport.byYear || [],
    },
  };
}

export const adminDashboardService = {
  async getStats() {
    const response = await api.get<DashboardResponse>('/admin/stats');
    return normalizeDashboard(response.data.data);
  },
};
