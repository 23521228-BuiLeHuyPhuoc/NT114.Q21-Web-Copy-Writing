const zlib = require('zlib');
const { promisify } = require('util');

const gunzip = promisify(zlib.gunzip);
const inflate = promisify(zlib.inflate);
const brotliDecompress = promisify(zlib.brotliDecompress);

const COLLINFO_URL = process.env.COMMON_CRAWL_COLLINFO_URL || 'https://index.commoncrawl.org/collinfo.json';
const DATA_BASE_URL = process.env.COMMON_CRAWL_DATA_BASE_URL || 'https://data.commoncrawl.org/';
const REQUEST_TIMEOUT_MS = Number(process.env.COMMON_CRAWL_TIMEOUT_MS || 9000);
const MAX_INDEXES = Number(process.env.COMMON_CRAWL_MAX_INDEXES || 2);
const MAX_QUERY_PATTERNS = Number(process.env.COMMON_CRAWL_MAX_QUERY_PATTERNS || 5);
const MAX_RECORDS_PER_QUERY = Number(process.env.COMMON_CRAWL_MAX_RECORDS_PER_QUERY || 3);
const MAX_FETCHES = Number(process.env.COMMON_CRAWL_MAX_FETCHES || 6);
const MAX_RECORD_BYTES = Number(process.env.COMMON_CRAWL_MAX_RECORD_BYTES || 1200000);
const MIN_TEXT_WORDS = Number(process.env.COMMON_CRAWL_MIN_TEXT_WORDS || 18);
const CACHE_TTL_MS = 30 * 60 * 1000;

const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'this', 'that', 'your', 'you', 'are', 'was', 'were', 'will', 'have', 'has',
  'mot', 'cac', 'cua', 'cho', 'voi', 'trong', 'ngoai', 'khi', 'thi', 'la', 'va', 'hoac', 'neu', 'nhung', 'de', 'duoc',
  'khong', 'nhieu', 'nguoi', 'san', 'pham', 'noi', 'dung', 'mua', 'ngay', 'xem', 'chi', 'tiet', 'lien', 'he', 'tu', 'van',
]);

let collectionCache = null;

function clampNumber(value, min, max) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return min;
  return Math.min(max, Math.max(min, parsed));
}

function ensureFetch() {
  if (typeof fetch !== 'function') {
    throw new Error('Common Crawl integration requires Node.js 18+ fetch support');
  }
}

async function fetchWithTimeout(url, options = {}) {
  ensureFetch();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchJson(url) {
  const response = await fetchWithTimeout(url, {
    headers: { accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`Common Crawl request failed: HTTP ${response.status}`);
  return response.json();
}

async function fetchText(url) {
  const response = await fetchWithTimeout(url, {
    headers: { accept: 'application/json,text/plain,*/*' },
  });
  if (!response.ok) throw new Error(`Common Crawl index request failed: HTTP ${response.status}`);
  return response.text();
}

async function getCollections() {
  const now = Date.now();
  if (collectionCache && now - collectionCache.createdAt < CACHE_TTL_MS) {
    return collectionCache.items;
  }

  const data = await fetchJson(COLLINFO_URL);
  const items = Array.isArray(data)
    ? data
      .filter((item) => item && item.id && item['cdx-api'])
      .slice(0, clampNumber(MAX_INDEXES, 1, 5))
    : [];

  collectionCache = { createdAt: now, items };
  return items;
}

function normalizeText(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s:/._-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugifyTokens(tokens) {
  return tokens
    .map((token) => token.replace(/[^a-z0-9]/g, ''))
    .filter(Boolean)
    .join('-');
}

function countWords(text) {
  return String(text || '').trim().split(/\s+/).filter(Boolean).length;
}

function unique(values) {
  return Array.from(new Set(values));
}

function extractUrls(text) {
  const matches = String(text || '').match(/https?:\/\/[^\s"'<>]+/gi) || [];
  return unique(matches.map((value) => value.replace(/[),.;]+$/g, ''))).slice(0, MAX_QUERY_PATTERNS);
}

function toCdxUrlPattern(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    const path = parsed.pathname && parsed.pathname !== '/' ? parsed.pathname : '';
    const host = parsed.hostname.toLowerCase();
    const patterns = [
      `${host}${path}`,
    ];

    if (host.startsWith('www.')) {
      patterns.push(`${host.slice(4)}${path}`);
    }

    return patterns;
  } catch (error) {
    return [rawUrl];
  }
}

function buildKeywordPatterns(text) {
  const tokens = normalizeText(text)
    .split(' ')
    .map((token) => token.trim())
    .filter((token) => token.length >= 3 && !STOPWORDS.has(token) && !/^\d+$/.test(token));

  const scored = [];
  [6, 5, 4, 3].forEach((size) => {
    for (let index = 0; index <= tokens.length - size; index += 1) {
      const windowTokens = tokens.slice(index, index + size);
      const uniqueCount = new Set(windowTokens).size;
      if (uniqueCount < Math.min(3, size)) continue;

      const slug = slugifyTokens(windowTokens);
      if (slug.length < 14) continue;

      scored.push({
        pattern: `*${slug}*`,
        score: slug.length + uniqueCount * 4 + size,
      });
    }
  });

  return unique(
    scored
      .sort((left, right) => right.score - left.score)
      .map((item) => item.pattern),
  ).slice(0, MAX_QUERY_PATTERNS);
}

function buildQueryPatterns(text) {
  const urlPatterns = extractUrls(text).flatMap(toCdxUrlPattern);
  const keywordPatterns = buildKeywordPatterns(text);
  return unique([...urlPatterns, ...keywordPatterns]).slice(0, MAX_QUERY_PATTERNS);
}

function parseJsonLines(text) {
  return String(text || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch (error) {
        return null;
      }
    })
    .filter(Boolean);
}

async function queryCollection(collection, pattern) {
  const endpoint = new URL(collection['cdx-api']);
  endpoint.searchParams.set('url', pattern);
  endpoint.searchParams.set('output', 'json');
  endpoint.searchParams.set('fl', 'url,timestamp,mime,mime-detected,status,digest,length,offset,filename,languages,encoding');
  endpoint.searchParams.append('filter', 'status:200');
  endpoint.searchParams.append('filter', 'mime:text/html');
  endpoint.searchParams.set('limit', String(clampNumber(MAX_RECORDS_PER_QUERY, 1, 10)));

  try {
    const text = await fetchText(endpoint.toString());
    return parseJsonLines(text).map((record) => ({ ...record, indexId: collection.id, pattern }));
  } catch (error) {
    return [];
  }
}

function dedupeRecords(records) {
  const seen = new Set();
  const deduped = [];

  records.forEach((record) => {
    const key = record.digest || `${record.url}:${record.timestamp}`;
    if (!record.url || !record.filename || seen.has(key)) return;
    seen.add(key);
    deduped.push(record);
  });

  return deduped;
}

function findHeaderBoundary(buffer) {
  const crlf = buffer.indexOf('\r\n\r\n');
  if (crlf >= 0) return { index: crlf, length: 4 };
  const lf = buffer.indexOf('\n\n');
  if (lf >= 0) return { index: lf, length: 2 };
  return null;
}

function splitHeaderBody(buffer) {
  const boundary = findHeaderBoundary(buffer);
  if (!boundary) return { header: '', body: buffer };
  return {
    header: buffer.slice(0, boundary.index).toString('latin1'),
    body: buffer.slice(boundary.index + boundary.length),
  };
}

function parseHeaders(headerText) {
  const headers = {};
  String(headerText || '').split(/\r?\n/).forEach((line) => {
    const index = line.indexOf(':');
    if (index <= 0) return;
    headers[line.slice(0, index).trim().toLowerCase()] = line.slice(index + 1).trim();
  });
  return headers;
}

async function decodeHttpBody(httpHeader, body) {
  const headers = parseHeaders(httpHeader);
  const encoding = String(headers['content-encoding'] || '').toLowerCase();
  let decoded = body;

  try {
    if (encoding.includes('gzip')) decoded = await gunzip(body);
    else if (encoding.includes('deflate')) decoded = await inflate(body);
    else if (encoding.includes('br')) decoded = await brotliDecompress(body);
  } catch (error) {
    decoded = body;
  }

  const contentType = String(headers['content-type'] || '');
  const charsetMatch = contentType.match(/charset=([^;]+)/i);
  const charset = charsetMatch ? charsetMatch[1].trim().toLowerCase() : 'utf-8';
  const supportedEncoding = charset.includes('8859') || charset.includes('latin') ? 'latin1' : 'utf8';
  return decoded.toString(supportedEncoding);
}

async function fetchWarcHtml(record) {
  const offset = Number(record.offset);
  const length = Number(record.length);

  if (!Number.isFinite(offset) || !Number.isFinite(length) || length <= 0 || length > MAX_RECORD_BYTES) {
    return '';
  }

  const rangeEnd = offset + length - 1;
  const response = await fetchWithTimeout(`${DATA_BASE_URL}${record.filename}`, {
    headers: { range: `bytes=${offset}-${rangeEnd}` },
    timeoutMs: REQUEST_TIMEOUT_MS,
  });
  if (!response.ok && response.status !== 206) throw new Error(`Common Crawl WARC request failed: HTTP ${response.status}`);

  const compressed = Buffer.from(await response.arrayBuffer());
  const warc = await gunzip(compressed);
  const warcParts = splitHeaderBody(warc);
  const httpParts = splitHeaderBody(warcParts.body);
  return decodeHttpBody(httpParts.header, httpParts.body);
}

function decodeHtmlEntities(text) {
  return String(text || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

function htmlToText(html) {
  return decodeHtmlEntities(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function sourceTitleFromUrl(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    const path = parsed.pathname && parsed.pathname !== '/' ? parsed.pathname : '';
    return `${parsed.hostname}${path}`;
  } catch (error) {
    return rawUrl || 'Common Crawl page';
  }
}

async function fetchCommonCrawlCandidates(text) {
  const stats = {
    enabled: true,
    status: 'skipped',
    indexes: [],
    queryCount: 0,
    recordCount: 0,
    fetchedCount: 0,
    candidateCount: 0,
    patterns: [],
    error: '',
  };

  try {
    const patterns = buildQueryPatterns(text);
    stats.patterns = patterns;
    if (patterns.length === 0) {
      stats.status = 'empty';
      return { candidates: [], stats };
    }

    const collections = await getCollections();
    stats.indexes = collections.map((collection) => collection.id);
    if (collections.length === 0) {
      stats.status = 'empty';
      return { candidates: [], stats };
    }

    const queryJobs = [];
    collections.forEach((collection) => {
      patterns.forEach((pattern) => {
        queryJobs.push(queryCollection(collection, pattern));
      });
    });

    stats.queryCount = queryJobs.length;
    const queried = await Promise.all(queryJobs);
    const records = dedupeRecords(queried.flat()).slice(0, clampNumber(MAX_FETCHES, 1, 20));
    stats.recordCount = records.length;

    const candidates = [];
    for (const record of records) {
      try {
        const html = await fetchWarcHtml(record);
        const plainText = htmlToText(html);
        stats.fetchedCount += 1;
        if (countWords(plainText) < MIN_TEXT_WORDS) continue;

        candidates.push({
          source: `commoncrawl:${record.url}`,
          sourceTitle: sourceTitleFromUrl(record.url),
          sourceUrl: record.url,
          sourceType: 'web',
          contentId: null,
          text: plainText,
          commonCrawl: {
            indexId: record.indexId,
            timestamp: record.timestamp,
            digest: record.digest,
            pattern: record.pattern,
          },
        });
      } catch (error) {
        // Skip individual WARC records; the remaining records can still be useful.
      }
    }

    stats.candidateCount = candidates.length;
    stats.status = candidates.length > 0 ? 'ok' : 'empty';
    return { candidates, stats };
  } catch (error) {
    stats.status = 'error';
    stats.error = error instanceof Error ? error.message : 'Common Crawl lookup failed';
    return { candidates: [], stats };
  }
}

module.exports = {
  fetchCommonCrawlCandidates,
};
