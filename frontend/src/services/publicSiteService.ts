import { api } from '@/lib/axios';

export interface PublicPageSeo {
  metaTitle: string;
  metaDescription: string;
}

export interface PublicBlogSection {
  heading: string;
  body: string[];
}

export interface PublicBlogPost {
  id: number | string;
  slug: string;
  cat: string;
  catLabel: string;
  title: string;
  excerpt: string;
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  img: string;
  featured?: boolean;
  published?: boolean;
  content: {
    lead: string;
    html?: string;
    sections: PublicBlogSection[];
  };
}

export interface PublicPageContent {
  [key: string]: unknown;
  posts?: PublicBlogPost[];
}

export interface PublicPageRecord {
  id: string;
  _id?: string;
  key: string;
  type: 'page' | 'blog' | 'settings';
  title: string;
  description: string;
  content: PublicPageContent;
  seo: PublicPageSeo;
  isPublished: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdatePublicPagePayload {
  type?: PublicPageRecord['type'];
  title?: string;
  description?: string;
  content?: PublicPageContent;
  seo?: Partial<PublicPageSeo>;
  isPublished?: boolean;
  sortOrder?: number;
}

interface PublicPageResponse {
  data?: {
    page?: Partial<PublicPageRecord> | null;
    items?: Partial<PublicPageRecord>[];
  };
}

function normalizeSeo(seo?: Partial<PublicPageSeo>): PublicPageSeo {
  return {
    metaTitle: seo?.metaTitle || '',
    metaDescription: seo?.metaDescription || '',
  };
}

function normalizePage(page?: Partial<PublicPageRecord> | null): PublicPageRecord | null {
  if (!page) return null;
  return {
    id: page.id || page._id || page.key || '',
    _id: page._id,
    key: page.key || '',
    type: page.type || 'page',
    title: page.title || '',
    description: page.description || '',
    content: page.content || {},
    seo: normalizeSeo(page.seo),
    isPublished: page.isPublished !== false,
    sortOrder: Number(page.sortOrder || 0),
    createdAt: page.createdAt,
    updatedAt: page.updatedAt,
  };
}

function unwrapPage(response: { data: PublicPageResponse }) {
  return normalizePage(response.data.data?.page);
}

export const publicSiteService = {
  async getPage(key: string) {
    const response = await api.get<PublicPageResponse>(`/public-site/pages/${key}`);
    return unwrapPage(response);
  },

  async getBlogPage() {
    const response = await api.get<PublicPageResponse>('/public-site/blog');
    return unwrapPage(response);
  },

  async listAdminPages() {
    const response = await api.get<PublicPageResponse>('/admin/public-site');
    return (response.data.data?.items || [])
      .map(normalizePage)
      .filter((page): page is PublicPageRecord => Boolean(page));
  },

  async getAdminPage(key: string) {
    const response = await api.get<PublicPageResponse>(`/admin/public-site/${key}`);
    return unwrapPage(response);
  },

  async updateAdminPage(key: string, payload: UpdatePublicPagePayload) {
    const response = await api.patch<PublicPageResponse>(`/admin/public-site/${key}`, payload);
    const page = unwrapPage(response);
    if (!page) throw new Error('Invalid public page response');
    return page;
  },
};
