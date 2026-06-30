function cleanValue(value: string | undefined) {
  return String(value || '').trim();
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

function stripProtocol(value: string) {
  return value.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
}

function browserOrigin() {
  if (typeof window === 'undefined') return '';
  return window.location.origin;
}

export const PUBLIC_APP_URL = trimTrailingSlash(
  cleanValue(process.env.NEXT_PUBLIC_APP_URL)
    || cleanValue(process.env.NEXT_PUBLIC_SITE_URL)
    || browserOrigin(),
);

export const API_BASE_URL = trimTrailingSlash(
  cleanValue(process.env.NEXT_PUBLIC_API_BASE_URL) || '/api',
);

export const API_DOCS_BASE_URL = trimTrailingSlash(
  cleanValue(process.env.NEXT_PUBLIC_COPYPRO_API_BASE_URL)
    || cleanValue(process.env.NEXT_PUBLIC_API_DOCS_BASE_URL)
    || API_BASE_URL,
);

export const PUBLIC_SITE_HOST = stripProtocol(
  cleanValue(process.env.NEXT_PUBLIC_SITE_HOST) || PUBLIC_APP_URL || 'your-domain.example',
);

export const PUBLIC_SUPPORT_EMAIL = cleanValue(process.env.NEXT_PUBLIC_SUPPORT_EMAIL) || 'support@example.com';
export const PUBLIC_STATUS_PAGE_URL = trimTrailingSlash(cleanValue(process.env.NEXT_PUBLIC_STATUS_PAGE_URL));
export const PUBLIC_STATUS_PAGE_LABEL = PUBLIC_STATUS_PAGE_URL
  ? stripProtocol(PUBLIC_STATUS_PAGE_URL)
  : 'trang trạng thái hệ thống';

export const PUBLIC_OPENAI_BASE_URL = trimTrailingSlash(cleanValue(process.env.NEXT_PUBLIC_OPENAI_BASE_URL));
export const PUBLIC_FREEGPT4_BASE_URL = trimTrailingSlash(cleanValue(process.env.NEXT_PUBLIC_FREEGPT4_BASE_URL));
