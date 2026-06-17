const zlib = require('zlib');
const { promisify } = require('util');

const gunzip = promisify(zlib.gunzip);
const inflate = promisify(zlib.inflate);
const brotliDecompress = promisify(zlib.brotliDecompress);

const COLLINFO_URL = process.env.COMMON_CRAWL_COLLINFO_URL || 'https://index.commoncrawl.org/collinfo.json';
const DATA_BASE_URL = process.env.COMMON_CRAWL_DATA_BASE_URL || 'https://data.commoncrawl.org/';
const SERPAPI_SEARCH_URL = process.env.SERPAPI_SEARCH_URL || 'https://serpapi.com/search.json';
const SERPAPI_ENGINE = process.env.SERPAPI_ENGINE || 'google';
const SERPAPI_GOOGLE_DOMAIN = process.env.SERPAPI_GOOGLE_DOMAIN || 'google.com';
const SERPAPI_GL = process.env.SERPAPI_GL || 'vn';
const SERPAPI_HL = process.env.SERPAPI_HL || 'vi';
const SERPAPI_NUM_RESULTS = Number(process.env.SERPAPI_NUM_RESULTS || 10);
const SERPAPI_NO_CACHE = String(process.env.SERPAPI_NO_CACHE || '').toLowerCase() === 'true';
const REQUEST_TIMEOUT_MS = Number(process.env.COMMON_CRAWL_TIMEOUT_MS || 15000);
const TOTAL_BUDGET_MS = Number(process.env.COMMON_CRAWL_TOTAL_BUDGET_MS || 150000);
const MAX_INDEXES = Number(process.env.COMMON_CRAWL_MAX_INDEXES || 4);
const MAX_QUERY_PATTERNS = Number(process.env.COMMON_CRAWL_MAX_QUERY_PATTERNS || 32);
const MAX_RECORDS_PER_QUERY = Number(process.env.COMMON_CRAWL_MAX_RECORDS_PER_QUERY || 3);
const MAX_FETCHES = Number(process.env.COMMON_CRAWL_MAX_FETCHES || 8);
const MAX_SEARCH_QUERIES = Number(process.env.WEB_CRAWL_MAX_SEARCH_QUERIES || 6);
const MAX_DISCOVERED_URLS = Number(process.env.WEB_CRAWL_MAX_DISCOVERED_URLS || 5);
const MAX_SERPAPI_RESULTS = Number(process.env.SERPAPI_MAX_RESULTS || MAX_DISCOVERED_URLS);
const MAX_CDX_ATTEMPTS_PER_URL = Number(process.env.COMMON_CRAWL_MAX_CDX_ATTEMPTS_PER_URL || 2);
const MIN_RELIABLE_SNAPSHOTS = Number(process.env.COMMON_CRAWL_MIN_RELIABLE_SNAPSHOTS || 5);
const MAX_RECORD_BYTES = Number(process.env.COMMON_CRAWL_MAX_RECORD_BYTES || 1200000);
const MAX_LIVE_BYTES = Number(process.env.WEB_CRAWL_MAX_LIVE_BYTES || 1500000);
const MIN_TEXT_WORDS = Number(process.env.COMMON_CRAWL_MIN_TEXT_WORDS || 18);
const MAX_SOURCE_TITLE_LENGTH = 190;
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

function isOverBudget(startedAt, budgetMs) {
  return Date.now() - startedAt >= budgetMs;
}

function elapsedMs(startedAt) {
  return Math.max(0, Date.now() - startedAt);
}

function remainingBudgetMs(startedAt, budgetMs) {
  if (!startedAt || !budgetMs) return REQUEST_TIMEOUT_MS;
  return Math.max(0, budgetMs - elapsedMs(startedAt));
}

function requestTimeoutMs(startedAt, budgetMs) {
  return Math.min(REQUEST_TIMEOUT_MS, remainingBudgetMs(startedAt, budgetMs));
}

function markBudgetExhausted(stats, startedAt) {
  if (!stats) return;
  stats.budgetExhausted = true;
  stats.timedOut = true;
  stats.elapsedMs = elapsedMs(startedAt);
}

function canSpendBudget(startedAt, budgetMs, stats) {
  if (!startedAt || !budgetMs) return true;
  if (!isOverBudget(startedAt, budgetMs)) return true;
  markBudgetExhausted(stats, startedAt);
  return false;
}

function ensureFetch() {
  if (typeof fetch !== 'function') {
    throw new Error('Common Crawl integration requires Node.js 18+ fetch support');
  }
}

async function fetchWithTimeout(url, options = {}) {
  ensureFetch();
  const { timeoutMs = REQUEST_TIMEOUT_MS, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Math.max(1, timeoutMs));

  try {
    return await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
  } catch (error) {
    if (error && error.name === 'AbortError') {
      throw new Error(`Request timed out after ${Math.round(timeoutMs)}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchJson(url, options = {}) {
  const response = await fetchWithTimeout(url, {
    headers: { accept: 'application/json' },
    timeoutMs: options.timeoutMs,
  });
  if (!response.ok) throw new Error(`Common Crawl request failed: HTTP ${response.status}`);
  return response.json();
}

async function fetchText(url, options = {}) {
  const response = await fetchWithTimeout(url, {
    headers: { accept: 'application/json,text/plain,*/*' },
    timeoutMs: options.timeoutMs,
  });
  if (!response.ok) throw new Error(`Common Crawl index request failed: HTTP ${response.status}`);
  return response.text();
}

async function getCollections(options = {}) {
  const now = Date.now();
  if (collectionCache && now - collectionCache.createdAt < CACHE_TTL_MS) {
    return collectionCache.items;
  }

  const data = await fetchJson(COLLINFO_URL, options);
  const items = Array.isArray(data)
    ? data
      .filter((item) => item && item.id && item['cdx-api'])
      .slice(0, clampNumber(MAX_INDEXES, 1, 10))
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
    const hosts = host.startsWith('www.') ? [host, host.slice(4)] : [host, `www.${host}`];
    const paths = path ? [path, path.endsWith('/') ? path.slice(0, -1) : `${path}/`] : ['', '/'];

    return unique(hosts.flatMap((item) => paths.map((itemPath) => `${item}${itemPath}`)));
  } catch (error) {
    return [rawUrl];
  }
}

function buildQueryPatterns(text) {
  const urlPatterns = extractUrls(text).flatMap(toCdxUrlPattern);
  return unique(urlPatterns).slice(0, MAX_QUERY_PATTERNS);
}

function sentenceCandidates(text) {
  return String(text || '')
    .replace(/https?:\/\/[^\s"'<>]+/gi, ' ')
    .split(/[.!?;:\n]+/)
    .map((sentence) => sentence.replace(/\s+/g, ' ').trim())
    .filter((sentence) => countWords(sentence) >= 5);
}

function significantTokens(text) {
  return normalizeText(text)
    .split(' ')
    .map((token) => token.replace(/[^a-z0-9]/g, '').trim())
    .filter((token) => token.length >= 3 && !STOPWORDS.has(token) && !/^\d+$/.test(token));
}

function quotePhrase(sentence, minWords = 7, maxWords = 12) {
  const words = sentence.split(/\s+/).filter(Boolean);
  if (words.length < minWords) return '';
  return `"${words.slice(0, maxWords).join(' ')}"`;
}

function buildSearchQueries(text) {
  const sentences = sentenceCandidates(text);
  const queries = [];

  const scoredSentences = sentences
    .map((sentence, index) => {
      const tokens = significantTokens(sentence);
      return {
        sentence,
        score: tokens.length * 5 + new Set(tokens).size * 3 + Math.min(40, sentence.length / 8) - index,
      };
    })
    .sort((left, right) => right.score - left.score)
    .map((item) => item.sentence);

  unique([...sentences.slice(0, 2), ...scoredSentences.slice(0, 5)]).forEach((sentence) => {
    const phrase = quotePhrase(sentence);
    if (phrase) queries.push(phrase);
  });

  const tokens = significantTokens(text);
  [10, 8, 6, 4].forEach((size) => {
    if (tokens.length >= size) {
      queries.push(tokens.slice(0, size).join(' '));
      const middle = Math.max(0, Math.floor((tokens.length - size) / 2));
      if (middle > 0) queries.push(tokens.slice(middle, middle + size).join(' '));
      if (tokens.length > size) queries.push(tokens.slice(tokens.length - size).join(' '));
    }
  });

  const scoredWindows = [];
  [5, 4, 3].forEach((size) => {
    for (let index = 0; index <= tokens.length - size; index += 1) {
      const windowTokens = tokens.slice(index, index + size);
      const uniqueCount = new Set(windowTokens).size;
      if (uniqueCount < size) continue;
      scoredWindows.push({
        query: windowTokens.join(' '),
        score: windowTokens.join('').length + uniqueCount * 3,
      });
    }
  });

  scoredWindows
    .sort((left, right) => right.score - left.score)
    .slice(0, 10)
    .forEach((item) => queries.push(item.query));

  return unique(queries)
    .filter((query) => query.replace(/["\s]/g, '').length >= 10)
    .slice(0, MAX_SEARCH_QUERIES);
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

async function queryCollection(collection, pattern, options = {}) {
  if (!canSpendBudget(options.startedAt, options.budgetMs, options.stats)) return [];

  const endpoint = new URL(collection['cdx-api']);
  endpoint.searchParams.set('url', pattern);
  endpoint.searchParams.set('output', 'json');
  endpoint.searchParams.set('fl', 'url,timestamp,mime,mime-detected,status,digest,length,offset,filename,languages,encoding');
  endpoint.searchParams.append('filter', 'status:200');
  endpoint.searchParams.append('filter', 'mime:text/html');
  endpoint.searchParams.set('limit', String(clampNumber(MAX_RECORDS_PER_QUERY, 1, 10)));

  try {
    const timeoutMs = requestTimeoutMs(options.startedAt, options.budgetMs);
    if (timeoutMs <= 0) {
      markBudgetExhausted(options.stats, options.startedAt);
      return [];
    }
    const text = await fetchText(endpoint.toString(), { timeoutMs });
    return parseJsonLines(text).map((record) => ({ ...record, indexId: collection.id, pattern }));
  } catch (error) {
    if (options.stats) {
      options.stats.cdxErrorCount = (options.stats.cdxErrorCount || 0) + 1;
      options.stats.lastCdxError = error instanceof Error ? error.message : 'CDX lookup failed';
    }
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

async function fetchWarcHtml(record, options = {}) {
  if (!canSpendBudget(options.startedAt, options.budgetMs, options.stats)) return '';

  const offset = Number(record.offset);
  const length = Number(record.length);

  if (!Number.isFinite(offset) || !Number.isFinite(length) || length <= 0 || length > MAX_RECORD_BYTES) {
    return '';
  }

  const rangeEnd = offset + length - 1;
  const timeoutMs = requestTimeoutMs(options.startedAt, options.budgetMs);
  if (timeoutMs <= 0) {
    markBudgetExhausted(options.stats, options.startedAt);
    return '';
  }
  const response = await fetchWithTimeout(`${DATA_BASE_URL}${record.filename}`, {
    headers: { range: `bytes=${offset}-${rangeEnd}` },
    timeoutMs,
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
  const trimTitle = (value) => {
    const title = String(value || 'Common Crawl page').replace(/\s+/g, ' ').trim();
    if (title.length <= MAX_SOURCE_TITLE_LENGTH) return title;
    return `${title.slice(0, MAX_SOURCE_TITLE_LENGTH - 1).trim()}…`;
  };

  try {
    const parsed = new URL(rawUrl);
    const path = parsed.pathname && parsed.pathname !== '/' ? parsed.pathname : '';
    return trimTitle(`${parsed.hostname}${path}`);
  } catch (error) {
    return trimTitle(rawUrl || 'Common Crawl page');
  }
}

function normalizeResultUrl(href) {
  const raw = String(href || '').replace(/&amp;/g, '&');

  try {
    const parsed = new URL(raw, 'https://duckduckgo.com');
    const target = parsed.searchParams.get('uddg');
    if (target) {
      return decodeURIComponent(target);
    }
  } catch (error) {
    // Fall through.
  }

  return raw;
}

function isLikelyHttpUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (error) {
    return false;
  }
}

function canonicalUrlKey(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
    const path = parsed.pathname.replace(/\/$/, '') || '/';
    return `${host}${path}`;
  } catch (error) {
    return String(rawUrl || '').toLowerCase();
  }
}

function dedupeUrls(urls) {
  const seen = new Set();
  const deduped = [];

  urls.forEach((url) => {
    if (!isLikelyHttpUrl(url)) return;
    const key = canonicalUrlKey(url);
    if (seen.has(key)) return;
    seen.add(key);
    deduped.push(url);
  });

  return deduped;
}

function parseSearchResultUrls(html) {
  const urls = [];
  const pattern = /href="([^"]*uddg=[^"]+)"/gi;
  let match;

  while ((match = pattern.exec(String(html || ''))) !== null) {
    const url = normalizeResultUrl(match[1]);
    if (isLikelyHttpUrl(url)) {
      urls.push(url);
    }
  }

  return unique(urls);
}

function getSerpApiKey() {
  return process.env.SERPAPI_API_KEY || process.env.SERP_API_KEY || '';
}

function pushSerpApiResult(results, query, item = {}, group = 'organic') {
  const url = item.link || item.url || item.redirect_link;
  if (!isLikelyHttpUrl(url)) return;

  results.push({
    url,
    title: String(item.title || item.name || sourceTitleFromUrl(url)).trim(),
    snippet: String(item.snippet || item.description || '').replace(/\s+/g, ' ').trim(),
    position: Number(item.position || results.length + 1),
    query,
    group,
  });
}

function extractSerpApiResults(data, query) {
  const results = [];
  const groups = [
    ['organic_results', 'organic'],
    ['news_results', 'news'],
    ['top_stories', 'top_story'],
    ['inline_videos', 'video'],
  ];

  groups.forEach(([key, group]) => {
    const items = Array.isArray(data?.[key]) ? data[key] : [];
    items.forEach((item) => pushSerpApiResult(results, query, item, group));
  });

  if (data?.answer_box && typeof data.answer_box === 'object') {
    pushSerpApiResult(results, query, data.answer_box, 'answer_box');
  }

  return results;
}

function dedupeSerpApiResults(results) {
  const seen = new Set();
  const deduped = [];

  results.forEach((item) => {
    const key = canonicalUrlKey(item.url);
    if (seen.has(key)) return;
    seen.add(key);
    deduped.push(item);
  });

  return deduped;
}

async function searchSerpApiQuery(query, options = {}) {
  const apiKey = getSerpApiKey();
  if (!apiKey) throw new Error('SERPAPI_API_KEY is not configured');
  if (!canSpendBudget(options.startedAt, options.budgetMs, options.stats)) return [];

  const endpoint = new URL(SERPAPI_SEARCH_URL);
  endpoint.searchParams.set('engine', SERPAPI_ENGINE);
  endpoint.searchParams.set('q', query);
  endpoint.searchParams.set('api_key', apiKey);
  endpoint.searchParams.set('num', String(clampNumber(SERPAPI_NUM_RESULTS, 1, 20)));
  if (SERPAPI_NO_CACHE) endpoint.searchParams.set('no_cache', 'true');
  if (SERPAPI_ENGINE === 'google') {
    endpoint.searchParams.set('google_domain', SERPAPI_GOOGLE_DOMAIN);
    endpoint.searchParams.set('gl', SERPAPI_GL);
    endpoint.searchParams.set('hl', SERPAPI_HL);
  }

  const timeoutMs = requestTimeoutMs(options.startedAt, options.budgetMs);
  if (timeoutMs <= 0) {
    markBudgetExhausted(options.stats, options.startedAt);
    return [];
  }

  const response = await fetchWithTimeout(endpoint.toString(), {
    headers: { accept: 'application/json' },
    timeoutMs,
  });
  if (!response.ok) throw new Error(`SerpApi request failed: HTTP ${response.status}`);

  const data = await response.json();
  if (data?.error) throw new Error(`SerpApi request failed: ${data.error}`);
  return extractSerpApiResults(data, query);
}

async function searchCandidateUrls(text, options = {}) {
  const queries = buildSearchQueries(text);
  const results = [];
  const stats = {
    provider: 'serpapi',
    status: 'skipped',
    queryCount: 0,
    resultCount: 0,
    urlCount: 0,
    error: '',
  };

  if (!getSerpApiKey()) {
    stats.status = 'missing_api_key';
    stats.error = 'SERPAPI_API_KEY is not configured';
    return { queries, urls: [], results: [], ...stats };
  }

  for (const query of queries) {
    if (!canSpendBudget(options.startedAt, options.budgetMs, options.stats)) break;

    try {
      stats.queryCount += 1;
      results.push(...await searchSerpApiQuery(query, {
        startedAt: options.startedAt,
        budgetMs: options.budgetMs,
        stats: options.stats,
      }));
      if (dedupeSerpApiResults(results).length >= MAX_DISCOVERED_URLS) break;
    } catch (error) {
      stats.error = error instanceof Error ? error.message : 'SerpApi lookup failed';
      if (results.length > 0) break;
    }
  }

  const deduped = dedupeSerpApiResults(results).slice(0, clampNumber(MAX_SERPAPI_RESULTS, 1, MAX_DISCOVERED_URLS));
  stats.resultCount = results.length;
  stats.urlCount = deduped.length;
  if (deduped.length > 0) stats.status = 'ok';
  else if (stats.error) stats.status = 'error';
  else stats.status = 'empty';

  return {
    queries,
    urls: deduped.map((item) => item.url),
    results: deduped,
    ...stats,
  };
}

async function fetchLiveHtml(rawUrl, options = {}) {
  if (!canSpendBudget(options.startedAt, options.budgetMs, options.stats)) return '';

  const timeoutMs = requestTimeoutMs(options.startedAt, options.budgetMs);
  if (timeoutMs <= 0) {
    markBudgetExhausted(options.stats, options.startedAt);
    return '';
  }

  const response = await fetchWithTimeout(rawUrl, {
    headers: {
      'user-agent': 'Mozilla/5.0',
      accept: 'text/html,application/xhtml+xml',
    },
    timeoutMs,
  });

  if (!response.ok) throw new Error(`Live fetch failed: HTTP ${response.status}`);

  const contentType = String(response.headers.get('content-type') || '').toLowerCase();
  if (contentType && !contentType.includes('html') && !contentType.includes('text')) {
    throw new Error(`Unsupported content-type: ${contentType}`);
  }

  const text = await response.text();
  if (text.length > MAX_LIVE_BYTES) {
    return text.slice(0, MAX_LIVE_BYTES);
  }

  return text;
}

async function fetchLiveCandidateFromUrl(url, trace, stats, options = {}) {
  const liveHtml = await fetchLiveHtml(url, {
    startedAt: options.startedAt,
    budgetMs: options.budgetMs,
    stats,
  });
  if (!liveHtml) return [];

  const plainText = htmlToText(liveHtml);
  stats.fetchedCount += 1;
  stats.liveFetchCount += 1;
  trace.liveFetched = true;
  if (countWords(plainText) < MIN_TEXT_WORDS) return [];

  trace.mode = 'live';
  trace.candidates += 1;
  trace.error = '';
  return [{
    source: `live:${url}`,
    sourceTitle: sourceTitleFromUrl(url),
    sourceUrl: url,
    sourceType: 'web',
    contentId: null,
    text: plainText,
    sourceMode: 'live',
  }];
}

async function fetchCandidateTextsFromUrl(url, collections, stats, options = {}) {
  const allowLiveFallback = options.allowLiveFallback === true;
  const preferLiveFallback = options.preferLiveFallback === true;
  const maxCandidates = clampNumber(options.maxCandidates || MAX_FETCHES, 1, MAX_FETCHES);
  const patterns = toCdxUrlPattern(url);
  const collectedRecords = [];
  const candidates = [];
  const trace = {
    url,
    patterns,
    cdxRecords: 0,
    warcFetched: false,
    warcFetches: 0,
    liveFetched: false,
    candidates: 0,
    mode: 'none',
    error: '',
  };

  if (allowLiveFallback && preferLiveFallback) {
    try {
      const liveCandidates = await fetchLiveCandidateFromUrl(url, trace, stats, {
        startedAt: options.startedAt,
        budgetMs: options.budgetMs,
      });
      if (liveCandidates.length > 0) {
        stats.checkedUrls.push(trace);
        return liveCandidates.slice(0, maxCandidates);
      }
    } catch (error) {
      trace.error = error instanceof Error ? error.message : 'Live fetch failed';
    }
  }

  let cdxAttempts = 0;
  for (const collection of collections) {
    for (const pattern of patterns) {
      if (cdxAttempts >= MAX_CDX_ATTEMPTS_PER_URL) break;
      if (!canSpendBudget(options.startedAt, options.budgetMs, stats)) {
        trace.error = 'Common Crawl time budget exhausted';
        stats.checkedUrls.push(trace);
        return candidates;
      }
      cdxAttempts += 1;
      stats.queryCount += 1;
      const records = await queryCollection(collection, pattern, {
        startedAt: options.startedAt,
        budgetMs: options.budgetMs,
        stats,
      });
      if (records.length > 0) {
        collectedRecords.push(...records);
        break;
      }
    }

    if (cdxAttempts >= MAX_CDX_ATTEMPTS_PER_URL) break;
    if (collectedRecords.length >= maxCandidates * 2) break;
  }

  const records = dedupeRecords(collectedRecords).slice(0, maxCandidates);
  stats.recordCount += records.length;
  stats.cdxHitCount += records.length;
  trace.cdxRecords = records.length;

  for (const record of records) {
    if (candidates.length >= maxCandidates) break;
    if (!canSpendBudget(options.startedAt, options.budgetMs, stats)) {
      trace.error = 'Common Crawl time budget exhausted';
      break;
    }

    try {
      const html = await fetchWarcHtml(record, {
        startedAt: options.startedAt,
        budgetMs: options.budgetMs,
        stats,
      });
      if (!html) continue;
      const plainText = htmlToText(html);
      stats.fetchedCount += 1;
      stats.warcFetchCount += 1;
      trace.warcFetched = true;
      trace.warcFetches += 1;
      if (countWords(plainText) < MIN_TEXT_WORDS) continue;

      trace.mode = 'commoncrawl';
      trace.candidates += 1;
      candidates.push({
        source: `commoncrawl:${record.indexId}:${record.timestamp}:${record.url}`,
        sourceTitle: `${sourceTitleFromUrl(record.url)} (${record.indexId})`,
        sourceUrl: record.url,
        sourceType: 'web',
        contentId: null,
        text: plainText,
        sourceMode: 'commoncrawl',
        commonCrawl: {
          indexId: record.indexId,
          timestamp: record.timestamp,
          digest: record.digest,
          pattern: record.pattern,
        },
      });
    } catch (error) {
      trace.error = error instanceof Error ? error.message : 'WARC fetch failed';
    }
  }

  if (candidates.length > 0) {
    stats.checkedUrls.push(trace);
    return candidates;
  }

  if (!allowLiveFallback || preferLiveFallback) {
    stats.checkedUrls.push(trace);
    return candidates;
  }

  try {
    const liveCandidates = await fetchLiveCandidateFromUrl(url, trace, stats, {
      startedAt: options.startedAt,
      budgetMs: options.budgetMs,
    });
    stats.checkedUrls.push(trace);
    return liveCandidates;
  } catch (error) {
    trace.error = error instanceof Error ? error.message : 'Live fetch failed';
    stats.checkedUrls.push(trace);
    return candidates;
  }
}

function finalizeStats(stats, candidates, startedAt, allowLiveFallback) {
  stats.elapsedMs = elapsedMs(startedAt);
  stats.candidateCount = candidates.length;

  if (stats.candidateCount >= MIN_RELIABLE_SNAPSHOTS) stats.coverageLevel = 'good';
  else if (stats.candidateCount >= 3) stats.coverageLevel = 'medium';
  else if (stats.candidateCount > 0) stats.coverageLevel = 'low';
  else stats.coverageLevel = 'none';

  const modeSet = new Set(candidates.map((candidate) => candidate.sourceMode).filter(Boolean));
  if (modeSet.has('commoncrawl') && modeSet.has('live')) stats.sourceMode = 'mixed';
  else if (modeSet.has('commoncrawl')) stats.sourceMode = 'commoncrawl';
  else if (modeSet.has('live')) stats.sourceMode = 'live';
  else stats.sourceMode = 'none';

  stats.status = candidates.length > 0 ? 'ok' : stats.error && !allowLiveFallback ? 'error' : 'empty';
  return stats;
}

async function fetchCommonCrawlCandidates(text, options = {}) {
  const allowLiveFallback = options.allowLiveFallback === true;
  const preferLiveFallback = options.preferLiveFallback === true;
  const startedAt = Date.now();
  const budgetMs = clampNumber(options.budgetMs || TOTAL_BUDGET_MS, 5000, 180000);
  const maxSnapshots = clampNumber(MAX_FETCHES, 1, 20);
  const stats = {
    enabled: true,
    allowLiveFallback,
    preferLiveFallback,
    status: 'skipped',
    sourceMode: 'none',
    searchProvider: 'serpapi',
    serpApiStatus: 'skipped',
    serpApiQueryCount: 0,
    serpApiResultCount: 0,
    serpApiUrlCount: 0,
    serpApiError: '',
    serpApiResults: [],
    explicitUrls: [],
    indexes: [],
    queryCount: 0,
    recordCount: 0,
    cdxHitCount: 0,
    cdxErrorCount: 0,
    warcFetchCount: 0,
    liveFetchCount: 0,
    fetchedCount: 0,
    targetUrlCount: 0,
    checkedUrlCount: 0,
    skippedUrlCount: 0,
    candidateCount: 0,
    minimumRecommendedSnapshots: MIN_RELIABLE_SNAPSHOTS,
    coverageLevel: 'none',
    budgetMs,
    elapsedMs: 0,
    timedOut: false,
    budgetExhausted: false,
    maxSnapshots,
    maxUrlCandidates: MAX_DISCOVERED_URLS,
    patterns: [],
    searchQueries: [],
    discoveredUrls: [],
    checkedUrls: [],
    error: '',
    lastCdxError: '',
  };

  try {
    const explicitUrls = extractUrls(text);
    const discovered = await searchCandidateUrls(text, { startedAt, budgetMs, stats });
    const urls = dedupeUrls([...discovered.urls, ...explicitUrls]).slice(0, MAX_DISCOVERED_URLS);
    stats.serpApiStatus = discovered.status || 'empty';
    stats.serpApiQueryCount = discovered.queryCount || 0;
    stats.serpApiResultCount = discovered.resultCount || 0;
    stats.serpApiUrlCount = discovered.urlCount || 0;
    stats.serpApiError = discovered.error || '';
    stats.serpApiResults = discovered.results || [];
    stats.explicitUrls = explicitUrls;
    stats.searchQueries = discovered.queries;
    stats.discoveredUrls = discovered.urls;
    stats.targetUrlCount = urls.length;
    stats.patterns = unique([...discovered.queries, ...urls]).slice(0, MAX_QUERY_PATTERNS);
    if (discovered.error) stats.error = discovered.error;

    if (urls.length === 0) {
      stats.status = 'empty';
      finalizeStats(stats, [], startedAt, allowLiveFallback);
      return { candidates: [], stats };
    }

    let collections = [];
    try {
      if (canSpendBudget(startedAt, budgetMs, stats)) {
        collections = await getCollections({ timeoutMs: requestTimeoutMs(startedAt, budgetMs) });
      }
      stats.indexes = collections.map((collection) => collection.id);
    } catch (error) {
      stats.error = error instanceof Error ? error.message : 'Common Crawl index lookup failed';
    }

    const candidates = [];
    for (const url of urls) {
      if (candidates.length >= maxSnapshots) break;
      if (!canSpendBudget(startedAt, budgetMs, stats)) break;

      stats.checkedUrlCount += 1;
      const urlCandidates = await fetchCandidateTextsFromUrl(url, collections, stats, {
        allowLiveFallback,
        preferLiveFallback,
        startedAt,
        budgetMs,
        maxCandidates: maxSnapshots - candidates.length,
      });
      candidates.push(...urlCandidates);
    }

    stats.skippedUrlCount = Math.max(0, urls.length - stats.checkedUrlCount);
    finalizeStats(stats, candidates, startedAt, allowLiveFallback);
    return { candidates, stats };
  } catch (error) {
    stats.status = 'error';
    stats.error = error instanceof Error ? error.message : 'Common Crawl lookup failed';
    stats.elapsedMs = elapsedMs(startedAt);
    return { candidates: [], stats };
  }
}

module.exports = {
  fetchCommonCrawlCandidates,
};
