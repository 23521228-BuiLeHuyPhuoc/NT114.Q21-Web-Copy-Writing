import { api } from '@/lib/axios';

export type PlagiarismRiskLevel = 'safe' | 'review' | 'high' | 'critical';
export type PlagiarismSourceType = 'database' | 'reference' | 'web';

export interface CheckPlagiarismPayload {
  text?: string;
  contentId?: string | null;
  threshold?: number;
  includeReferences?: boolean;
}

export interface PlagiarismHistoryParams {
  page?: number;
  limit?: number;
  riskLevel?: PlagiarismRiskLevel;
}

export interface PlagiarismSource {
  source: string;
  sourceTitle: string;
  sourceUrl: string;
  sourceType: PlagiarismSourceType;
  contentId: string | null;
  similarity: number;
  snippet: string;
  matchedWords: number;
  totalWords: number;
}

export interface PlagiarismMatch {
  start: number;
  end: number;
  matchedText: string;
  sourceText: string;
  sourceUrl: string;
  sourceTitle: string;
  sourceType: PlagiarismSourceType;
  score: number;
}

export interface PlagiarismReport {
  id: string;
  userId: string | null;
  contentId: string | null;
  checkText: string;
  wordCount: number;
  similarityScore: number;
  originalityScore: number;
  status: 'completed' | 'failed' | 'processing';
  riskLevel: PlagiarismRiskLevel;
  matches: PlagiarismMatch[];
  sources: PlagiarismSource[];
  modelUsed: string;
  threshold: number;
  summary: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlagiarismHistoryResult {
  items: PlagiarismReport[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

interface BackendPlagiarismSource {
  source?: string;
  sourceTitle?: string;
  sourceUrl?: string;
  sourceType?: PlagiarismSourceType;
  contentId?: string | null;
  similarity?: number;
  snippet?: string;
  matchedWords?: number;
  totalWords?: number;
}

interface BackendPlagiarismMatch {
  start?: number;
  end?: number;
  matchedText?: string;
  sourceText?: string;
  sourceUrl?: string;
  sourceTitle?: string;
  sourceType?: PlagiarismSourceType;
  score?: number;
}

interface BackendPlagiarismReport {
  id?: string;
  _id?: string;
  userId?: string | null;
  contentId?: string | null;
  checkText?: string;
  wordCount?: number;
  similarityScore?: number;
  originalityScore?: number;
  status?: 'completed' | 'failed' | 'processing';
  riskLevel?: PlagiarismRiskLevel;
  matches?: BackendPlagiarismMatch[];
  sources?: BackendPlagiarismSource[];
  modelUsed?: string;
  threshold?: number;
  summary?: string;
  createdAt?: string;
  updatedAt?: string;
}

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10,
  totalItems: 0,
  totalPages: 1,
};

function asNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeSource(source: BackendPlagiarismSource): PlagiarismSource {
  return {
    source: source.source || '',
    sourceTitle: source.sourceTitle || source.source || 'Nguồn tham chiếu',
    sourceUrl: source.sourceUrl || '',
    sourceType: source.sourceType || 'database',
    contentId: source.contentId || null,
    similarity: asNumber(source.similarity),
    snippet: source.snippet || '',
    matchedWords: asNumber(source.matchedWords),
    totalWords: asNumber(source.totalWords),
  };
}

function normalizeMatch(match: BackendPlagiarismMatch): PlagiarismMatch {
  return {
    start: asNumber(match.start),
    end: asNumber(match.end),
    matchedText: match.matchedText || '',
    sourceText: match.sourceText || '',
    sourceUrl: match.sourceUrl || '',
    sourceTitle: match.sourceTitle || 'Nguồn tham chiếu',
    sourceType: match.sourceType || 'database',
    score: asNumber(match.score),
  };
}

function normalizeReport(report: BackendPlagiarismReport): PlagiarismReport {
  return {
    id: report.id || report._id || '',
    userId: report.userId || null,
    contentId: report.contentId || null,
    checkText: report.checkText || '',
    wordCount: asNumber(report.wordCount),
    similarityScore: asNumber(report.similarityScore),
    originalityScore: asNumber(report.originalityScore, 100),
    status: report.status || 'completed',
    riskLevel: report.riskLevel || 'safe',
    matches: (report.matches || []).map(normalizeMatch),
    sources: (report.sources || []).map(normalizeSource),
    modelUsed: report.modelUsed || 'local-ngram-v1',
    threshold: asNumber(report.threshold, 35),
    summary: report.summary || '',
    createdAt: report.createdAt || '',
    updatedAt: report.updatedAt || '',
  };
}

function unwrapReport(response: { data: { data?: { report?: BackendPlagiarismReport } } }) {
  const report = response.data.data?.report;
  if (!report) throw new Error('Invalid plagiarism response');
  return normalizeReport(report);
}

export const plagiarismService = {
  async list(params?: PlagiarismHistoryParams): Promise<PlagiarismHistoryResult> {
    const response = await api.get<{
      data?: {
        items?: BackendPlagiarismReport[];
        pagination?: PlagiarismHistoryResult['pagination'];
      };
    }>('/plagiarism/history', { params });

    return {
      items: (response.data.data?.items || []).map(normalizeReport),
      pagination: response.data.data?.pagination || DEFAULT_PAGINATION,
    };
  },

  async check(payload: CheckPlagiarismPayload): Promise<PlagiarismReport> {
    const response = await api.post<{ data?: { report?: BackendPlagiarismReport } }>(
      '/plagiarism/check',
      payload,
      { timeout: 120000 },
    );

    return unwrapReport(response);
  },

  async get(id: string): Promise<PlagiarismReport> {
    const response = await api.get<{ data?: { report?: BackendPlagiarismReport } }>(`/plagiarism/${id}`);
    return unwrapReport(response);
  },
};
