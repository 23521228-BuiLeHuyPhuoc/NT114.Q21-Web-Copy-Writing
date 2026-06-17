import { api } from '@/lib/axios';
import { scoreGeneratedContent } from '@/lib/contentQuality';
import { formatContentModelDisplayName } from '@/lib/modelDisplayName';

export interface ContentListParams {
  page?: number;
  limit?: number;
  search?: string;
  projectId?: string;
  fetchAll?: boolean;
}

export interface GenerateContentPayload {
  prompt: string;
  type: string;
  industry?: string;
  tone: string;
  language: string;
  model: string;
  modelMode?: 'base' | 'fine-tuned';
  fineTunedModelId?: string;
  length?: 'short' | 'medium' | 'long';
  variations?: number;
  maxOutputTokens?: number;
  templateId?: string | null;
  projectId?: string | null;
}

export interface CreateContentPayload {
  title: string;
  prompt: string;
  outputText: string;
  type: string;
  tone?: string;
  language?: string;
  model?: string;
  modelUsed?: string;
  tags?: string[];
  projectId?: string | null;
  templateId?: string | null;
}

export interface UpdateContentPayload {
  title?: string;
  prompt?: string;
  outputText?: string;
  type?: string;
  tone?: string;
  language?: string;
  tags?: string[];
  isFavorite?: boolean;
  isProjectCompleted?: boolean;
  projectId?: string | null;
}

interface BackendContent {
  id?: string;
  _id?: string;
  title?: string;
  prompt?: string;
  outputText?: string;
  content?: string;
  type?: string;
  tone?: string;
  language?: string;
  modelUsed?: string;
  modelDisplayName?: string;
  model?: string;
  tags?: string[];
  isFavorite?: boolean;
  isProjectCompleted?: boolean;
  wordCount?: number;
  words?: number;
  isDeleted?: boolean;
  deletedAt?: string | null;
  projectId?: string | null;
  project?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface UsageLog {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  status?: string;
}

interface ListPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

interface ListResponse {
  data?: {
    items?: BackendContent[];
    pagination?: ListPagination;
  };
}

export interface ContentVersion {
  id: number;
  label: string;
  quality: number;
  selected: boolean;
}

export interface UiContent {
  id: string;
  title: string;
  type: string;
  industry: string;
  model: string;
  quality: number;
  words: number;
  tokens: number;
  latency: string;
  tone: string;
  createdAt: string;
  updatedAt: string;
  createdAtRaw?: string;
  updatedAtRaw?: string;
  status: 'published' | 'draft' | 'archived';
  project: string | null;
  content: string;
  prompt: string;
  tags: string[];
  isFavorite: boolean;
  isProjectCompleted: boolean;
  isDeleted: boolean;
  deletedAt: string | null;
  versions: ContentVersion[];
}

export interface GenerateContentResult {
  content: UiContent;
  usage: UsageLog | null;
  fallback: boolean;
}

const INDUSTRY_LABELS: Record<string, string> = {
  ecommerce: 'Thương mại điện tử',
  realestate: 'Bất động sản',
  technology: 'Công nghệ',
  fnb: 'Ẩm thực F&B',
  healthcare: 'Y tế & sức khỏe',
  education: 'Giáo dục',
  finance: 'Tài chính',
  fashion: 'Thời trang',
  business: 'Doanh nghiệp',
  travel: 'Du lịch',
};

const MAX_CONTENT_LIST_LIMIT = 100;

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function formatDate(value?: string) {
  if (!value) return '';
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

function formatIndustry(value?: string) {
  if (!value) return 'General';
  return INDUSTRY_LABELS[value] || value;
}

function normalizeContent(item: BackendContent): UiContent {
  const content = item.outputText || item.content || '';
  const id = item.id || item._id || '';
  const quality = scoreGeneratedContent({
    text: content,
    prompt: item.prompt,
    type: item.type,
    tone: item.tone,
    industry: item.tags?.[0],
  });

  return {
    id,
    title: item.title || 'Untitled content',
    type: item.type || 'content',
    industry: formatIndustry(item.tags?.[0]),
    model: formatContentModelDisplayName(item.modelDisplayName, item.modelUsed, item.model),
    quality,
    words: item.wordCount || item.words || countWords(content),
    tokens: 0,
    latency: '0s',
    tone: item.tone || '',
    createdAt: formatDate(item.createdAt),
    updatedAt: formatDate(item.updatedAt),
    createdAtRaw: item.createdAt,
    updatedAtRaw: item.updatedAt,
    status: 'published',
    project: item.project || item.projectId || null,
    content,
    prompt: item.prompt || '',
    tags: item.tags || [],
    isFavorite: Boolean(item.isFavorite),
    isProjectCompleted: Boolean(item.isProjectCompleted),
    isDeleted: Boolean(item.isDeleted),
    deletedAt: item.deletedAt ? formatDate(item.deletedAt) : null,
    versions: [{ id: 1, label: 'Phiên bản 1', quality, selected: true }],
  };
}

function unwrapItem(response: { data: { data?: { item?: BackendContent } } }) {
  const item = response.data.data?.item;
  if (!item) throw new Error('Invalid content response');
  return normalizeContent(item);
}

function getContentListLimit(limit?: number) {
  const value = Number(limit || MAX_CONTENT_LIST_LIMIT);
  if (!Number.isFinite(value)) return MAX_CONTENT_LIST_LIMIT;
  return Math.min(Math.max(Math.floor(value), 1), MAX_CONTENT_LIST_LIMIT);
}

async function fetchContentPage(path: string, params?: Omit<ContentListParams, 'fetchAll'>) {
  const response = await api.get<ListResponse>(path, { params });
  return response.data.data || {};
}

async function fetchAllContentPages(path: string, params?: ContentListParams) {
  const { fetchAll: _fetchAll, page: _page, limit, ...rest } = params || {};
  const pageSize = getContentListLimit(limit);
  const firstPage = await fetchContentPage(path, { ...rest, page: 1, limit: pageSize });
  const totalPages = firstPage.pagination?.totalPages || 1;
  const items = [...(firstPage.items || [])];

  if (totalPages <= 1) return items;

  const remainingPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) => (
      fetchContentPage(path, { ...rest, page: index + 2, limit: pageSize })
    )),
  );

  remainingPages.forEach((pageData) => {
    items.push(...(pageData.items || []));
  });

  return items;
}

export const contentService = {
  async list(params?: ContentListParams) {
    if (params?.fetchAll) {
      const items = await fetchAllContentPages('/contents', params);
      return items.map(normalizeContent);
    }

    const { fetchAll: _fetchAll, ...apiParams } = params || {};
    const data = await fetchContentPage('/contents', apiParams);
    return (data.items || []).map(normalizeContent);
  },

  async listTrash(params?: ContentListParams) {
    if (params?.fetchAll) {
      const items = await fetchAllContentPages('/contents/trash', params);
      return items.map(normalizeContent);
    }

    const { fetchAll: _fetchAll, ...apiParams } = params || {};
    const data = await fetchContentPage('/contents/trash', apiParams);
    return (data.items || []).map(normalizeContent);
  },

  async get(id: string) {
    const response = await api.get<{ data?: { item?: BackendContent } }>(`/contents/${id}`);
    return unwrapItem(response);
  },

  async create(payload: CreateContentPayload) {
    const response = await api.post<{ data?: { item?: BackendContent } }>('/contents', payload);
    return unwrapItem(response);
  },

  async update(id: string, payload: UpdateContentPayload) {
    const response = await api.patch<{ data?: { item?: BackendContent } }>(`/contents/${id}`, payload);
    return unwrapItem(response);
  },

  async remove(id: string) {
    const response = await api.delete<{ data?: { item?: BackendContent } }>(`/contents/${id}`);
    return unwrapItem(response);
  },

  async restore(id: string) {
    const response = await api.patch<{ data?: { item?: BackendContent } }>(`/contents/${id}/restore`);
    return unwrapItem(response);
  },

  async permanentDelete(id: string) {
    await api.delete(`/contents/${id}/permanent`);
  },

  async generate(payload: GenerateContentPayload): Promise<GenerateContentResult> {
    const response = await api.post<{
      data?: {
        item?: BackendContent;
        usage?: UsageLog;
        fallback?: boolean;
      };
    }>('/contents/generate', payload, { timeout: 120000 });

    const content = normalizeContent(response.data.data?.item || {});
    const usage = response.data.data?.usage || null;

    return {
      content: {
        ...content,
        tokens: usage?.totalTokens || 0,
      },
      usage,
      fallback: Boolean(response.data.data?.fallback),
    };
  },
};
