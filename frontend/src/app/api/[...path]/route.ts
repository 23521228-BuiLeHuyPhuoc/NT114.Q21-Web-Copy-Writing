import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const API_PROXY_TARGET = String(
  process.env.COPYPRO_API_PROXY_TARGET
    || process.env.NEXT_PUBLIC_API_BASE_URL
    || '',
).trim().replace(/\/+$/, '');

const HOP_BY_HOP_HEADERS = [
  'connection',
  'content-encoding',
  'content-length',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
];

const FORWARDED_REQUEST_HEADERS = [
  'accept',
  'authorization',
  'content-type',
  'cookie',
  'if-match',
  'if-modified-since',
  'if-none-match',
  'range',
  'user-agent',
  'x-request-id',
];

function isLocalRequest(request: NextRequest) {
  return request.nextUrl.hostname === 'localhost'
    || request.nextUrl.hostname === '127.0.0.1';
}

function localizeAuthCookie(cookie: string) {
  return cookie
    .replace(/;\s*Secure/gi, '')
    .replace(/;\s*SameSite=None/gi, '; SameSite=Lax')
    .replace(/;\s*Domain=[^;]+/gi, '');
}

function getSetCookies(headers: Headers) {
  const headersWithCookies = headers as Headers & { getSetCookie?: () => string[] };
  const cookies = headersWithCookies.getSetCookie?.();
  if (cookies?.length) return cookies;

  const cookie = headers.get('set-cookie');
  return cookie ? [cookie] : [];
}

async function proxy(request: NextRequest, context: { params: { path: string[] } }) {
  if (!/^https?:\/\//i.test(API_PROXY_TARGET)) {
    return NextResponse.json(
      { success: false, message: 'API proxy target is not configured' },
      { status: 503 },
    );
  }

  const pathname = context.params.path.map(encodeURIComponent).join('/');
  const targetUrl = `${API_PROXY_TARGET}/${pathname}${request.nextUrl.search}`;
  const requestHeaders = new Headers();
  for (const header of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(header);
    if (value) requestHeaders.set(header, value);
  }
  requestHeaders.set('accept-encoding', 'identity');
  requestHeaders.set('x-forwarded-host', request.headers.get('host') || request.nextUrl.host);
  requestHeaders.set('x-forwarded-proto', request.nextUrl.protocol.replace(':', ''));

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';

  try {
    const upstream = await fetch(targetUrl, {
      method: request.method,
      headers: requestHeaders,
      body: hasBody ? await request.arrayBuffer() : undefined,
      cache: 'no-store',
      redirect: 'manual',
    });

    const responseHeaders = new Headers(upstream.headers);
    const setCookies = getSetCookies(upstream.headers);

    HOP_BY_HOP_HEADERS.forEach((header) => responseHeaders.delete(header));
    responseHeaders.delete('set-cookie');

    for (const cookie of setCookies) {
      responseHeaders.append(
        'set-cookie',
        isLocalRequest(request) ? localizeAuthCookie(cookie) : cookie,
      );
    }

    return new NextResponse(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    const cause = (error as { cause?: { code?: string; message?: string } }).cause;
    return NextResponse.json(
      {
        success: false,
        message: 'Không thể kết nối đến máy chủ API',
        ...(process.env.NODE_ENV === 'development' && {
          detail: [
            error instanceof Error ? error.message : String(error),
            cause?.code,
            cause?.message,
          ].filter(Boolean).join(': '),
        }),
      },
      { status: 502 },
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
