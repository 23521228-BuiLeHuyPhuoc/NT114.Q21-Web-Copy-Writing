const DEFAULT_MODEL = 'gemini-3.5-flash-lite';
const DEFAULT_TIMEOUT_MS = 12000;
const DEFAULT_MAX_TEXT_CHARS = 4000;

const VIETNAMESE_MARKS = /[\u00e0\u00e1\u1ea3\u00e3\u1ea1\u0103\u1eb1\u1eaf\u1eb3\u1eb5\u1eb7\u00e2\u1ea7\u1ea5\u1ea9\u1eab\u1ead\u00e8\u00e9\u1ebb\u1ebd\u1eb9\u00ea\u1ec1\u1ebf\u1ec3\u1ec5\u1ec7\u00ec\u00ed\u1ec9\u0129\u1ecb\u00f2\u00f3\u1ecf\u00f5\u1ecd\u00f4\u1ed3\u1ed1\u1ed5\u1ed7\u1ed9\u01a1\u1edd\u1edb\u1edf\u1ee1\u1ee3\u00f9\u00fa\u1ee7\u0169\u1ee5\u01b0\u1eeb\u1ee9\u1eed\u1eef\u1ef1\u1ef3\u00fd\u1ef7\u1ef9\u1ef5\u0111]/i;

const VIETNAMESE_WORDS = new Set([
  'ban', 'bang', 'cac', 'cach', 'cho', 'co', 'cong', 'cua', 'da', 'dang', 'de', 'den', 'duoc', 'giup',
  'hoc', 'khong', 'khi', 'la', 'mot', 'nguoi', 'nhieu', 'nhung', 'noi', 'phai', 'sinh', 'the', 'thay',
  'theo', 'thi', 'thong', 'tiep', 'trong', 'tu', 'va', 'van', 'voi', 'y',
]);

const ENGLISH_WORDS = new Set([
  'a', 'ability', 'and', 'are', 'as', 'be', 'can', 'for', 'from', 'how', 'if', 'in', 'information', 'is',
  'it', 'learn', 'may', 'not', 'of', 'on', 'only', 'or', 'should', 'students', 'that', 'the', 'their',
  'they', 'this', 'to', 'tool', 'use', 'with',
]);

function envBoolean(name, fallback) {
  const value = process.env[name];
  if (value === undefined || value === '') return fallback;
  return String(value).trim().toLowerCase() === 'true';
}

function normalizeLanguageText(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0111/g, 'd')
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function detectLanguage(text) {
  const value = String(text || '').trim();
  if (!value) return 'unknown';
  if (VIETNAMESE_MARKS.test(value)) return 'vi';

  const tokens = normalizeLanguageText(value).split(' ').filter(Boolean);
  const vietnameseScore = tokens.reduce((score, token) => score + (VIETNAMESE_WORDS.has(token) ? 1 : 0), 0);
  const englishScore = tokens.reduce((score, token) => score + (ENGLISH_WORDS.has(token) ? 1 : 0), 0);

  if (vietnameseScore >= 2 && vietnameseScore > englishScore) return 'vi';
  if (englishScore >= 2 && englishScore >= vietnameseScore) return 'en';
  return 'unknown';
}

function targetLanguageFor(sourceLanguage) {
  if (sourceLanguage === 'vi') return 'en';
  if (sourceLanguage === 'en') return 'vi';
  return 'none';
}

function languageName(language) {
  return language === 'vi' ? 'Vietnamese' : 'English';
}

function getApiKey() {
  return String(process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || '').trim();
}

function getModel() {
  return String(process.env.PLAGIARISM_TRANSLATION_MODEL || DEFAULT_MODEL).trim();
}

function getTimeoutMs(requested) {
  const configured = Number(process.env.PLAGIARISM_TRANSLATION_TIMEOUT_MS || DEFAULT_TIMEOUT_MS);
  const timeout = Number.isFinite(configured) ? Math.max(1000, configured) : DEFAULT_TIMEOUT_MS;
  if (!Number.isFinite(Number(requested))) return timeout;
  return Math.max(1000, Math.min(timeout, Number(requested)));
}

function getMaxTextChars() {
  const configured = Number(process.env.PLAGIARISM_TRANSLATION_MAX_TEXT_CHARS || DEFAULT_MAX_TEXT_CHARS);
  return Number.isFinite(configured) ? Math.max(500, configured) : DEFAULT_MAX_TEXT_CHARS;
}

function extractGeminiText(data) {
  return (data?.candidates?.[0]?.content?.parts || [])
    .map((part) => part.text || '')
    .filter(Boolean)
    .join('\n')
    .trim();
}

function cleanTranslation(value) {
  let text = String(value || '')
    .replace(/^```(?:text)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .replace(/^(?:translation|translated text|ban dich)\s*:\s*/i, '')
    .trim();

  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
    text = text.slice(1, -1).trim();
  }
  return text;
}

async function translateForSearch(text, options = {}) {
  const enabled = envBoolean('PLAGIARISM_BILINGUAL_SEARCH', true);
  const sourceLanguage = detectLanguage(text);
  const targetLanguage = targetLanguageFor(sourceLanguage);
  const model = getModel();
  const base = {
    enabled,
    sourceLanguage,
    targetLanguage,
    provider: 'gemini',
    model,
    translatedText: '',
    error: '',
  };

  if (!enabled) return { ...base, status: 'disabled' };
  if (targetLanguage === 'none') return { ...base, status: 'unsupported' };

  const apiKey = getApiKey();
  if (!apiKey) return { ...base, status: 'missing_api_key', error: 'Gemini API key is not configured' };

  const input = String(text || '').replace(/\s+/g, ' ').trim().slice(0, getMaxTextChars());
  if (!input) return { ...base, status: 'skipped' };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), getTimeoutMs(options.timeoutMs));
  const prompt = [
    `Translate the text from ${languageName(sourceLanguage)} to ${languageName(targetLanguage)} for web search.`,
    'Preserve names, numbers, technical terms, and meaning.',
    'Return only the translated text without labels, notes, quotes, or Markdown.',
    '',
    input,
  ].join('\n');

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0,
            maxOutputTokens: 1200,
          },
        }),
      },
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data?.error?.message || `Gemini translation returned HTTP ${response.status}`);
    }

    const translatedText = cleanTranslation(extractGeminiText(data));
    if (!translatedText) throw new Error('Gemini translation returned empty text');
    return { ...base, status: 'ok', translatedText };
  } catch (error) {
    const message = error?.name === 'AbortError'
      ? `Translation timed out after ${getTimeoutMs(options.timeoutMs)}ms`
      : error instanceof Error ? error.message : 'Translation failed';
    return { ...base, status: 'error', error: message };
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = {
  translateForSearch,
  __test: {
    cleanTranslation,
    detectLanguage,
    targetLanguageFor,
  },
};
