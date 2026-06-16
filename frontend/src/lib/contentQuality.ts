export type ContentQualityLength = 'short' | 'medium' | 'long';

export interface ContentQualityInput {
  text: string;
  prompt?: string;
  keywords?: string;
  type?: string;
  tone?: string;
  industry?: string;
  length?: ContentQualityLength;
}

const STOPWORDS = new Set([
  'ban', 'cac', 'cho', 'cua', 'duoc', 'hay', 'khi', 'khong', 'la', 'mot', 'nay', 'neu', 'nhung',
  'phai', 'the', 'thi', 'trong', 'voi', 'viet', 'dung', 'tao', 'phien', 'ban', 'noi', 'dung',
  'format', 'prompt', 'token', 'tokens', 'copy', 'ngon', 'ngu', 'tieng', 'viet', 'natural',
  'version', 'required', 'output', 'model', 'type', 'tone', 'industry', 'length', 'user', 'system',
  'chuyen', 'copywriting', 'nganh', 'nghe', 'loai', 'giong', 'van', 'bat', 'buoc', 'rieng', 'biet',
  'san', 'pham', 'dich', 'vu', 'chua', 'cung', 'cap', 'muc', 'tieu', 'khach', 'hang', 'tiem', 'nang',
  'thong', 'tin', 'bo', 'sung', 'gioi', 'han', 'toi', 'tokens', 'moi', 'nhan', 'dinh', 'dang',
]);

const FORMAT_GROUPS: Record<string, string[][]> = {
  headline: [['headline', 'tieu de'], ['subheadline', 'loi keu goi', 'cta', 'kham pha', 'mua ngay']],
  description: [['mo ta'], ['loi ich', 'benefit'], ['dac diem', 'feature'], ['loi keu goi', 'cta']],
  social: [['hook'], ['caption', 'noi dung'], ['hashtag'], ['loi keu goi', 'cta']],
  email: [['subject', 'chu de'], ['preview text'], ['loi chao'], ['noi dung chinh'], ['loi keu goi', 'cta']],
  cta: [['loi keu goi', 'cta'], ['microcopy', 'ngay', 'dang ky', 'mua', 'kham pha']],
  landing: [['hero headline'], ['subheadline'], ['loi ich'], ['bang chung', 'proof'], ['loi keu goi', 'cta']],
  seo: [['seo title', 'tieu de seo'], ['meta description'], ['slug'], ['heading', 'h2', 'h3']],
  review: [['quote', 'nhan xet'], ['nguoi danh gia'], ['boi canh'], ['ket qua'], ['khuyen nghi', 'loi keu goi']],
};

const EXPECTED_WORD_RANGES: Record<string, Record<ContentQualityLength, [number, number]>> = {
  headline: { short: [5, 25], medium: [15, 55], long: [45, 120] },
  description: { short: [40, 110], medium: [90, 230], long: [200, 430] },
  social: { short: [30, 90], medium: [80, 190], long: [150, 320] },
  email: { short: [60, 150], medium: [140, 320], long: [260, 560] },
  cta: { short: [2, 18], medium: [10, 45], long: [25, 90] },
  landing: { short: [90, 230], medium: [240, 560], long: [480, 1000] },
  seo: { short: [20, 90], medium: [60, 180], long: [130, 320] },
  review: { short: [30, 90], medium: [80, 190], long: [160, 340] },
  default: { short: [30, 100], medium: [90, 240], long: [220, 520] },
};

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function stripHtml(value: string) {
  return String(value || '')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function normalize(value: string) {
  return stripHtml(value)
    .toLowerCase()
    .replace(/[\u0111\u0110]/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9%$\s#-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function words(value: string) {
  return normalize(value)
    .split(/\s+/)
    .filter((word) => word.length >= 4 && !STOPWORDS.has(word));
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

function countWords(value: string) {
  const clean = stripHtml(value).trim();
  if (!clean) return 0;
  return clean.split(/\s+/).filter(Boolean).length;
}

function hasInvalidGeneratedText(text: string) {
  const clean = stripHtml(text).trim();
  const normalized = normalize(clean);
  if (!normalized) return true;
  if (/^(error|internal server error|please enter a question|invalid token|cannot|failed)\b/i.test(clean)) return true;
  if (/\b(undefined|null|nan)\b/i.test(clean)) return true;
  if (/[\uFFFD]{1,}|\?{4,}/.test(clean)) return true;
  return false;
}

function getBriefTerms(input: ContentQualityInput) {
  const explicitTerms = words(input.keywords || '');
  const promptTerms = words(input.prompt || '');
  const terms = unique([
    ...explicitTerms,
    ...promptTerms,
  ]).filter((term) => term.length >= 4);

  return terms.slice(0, explicitTerms.length > 0 ? 24 : 18);
}

function getExpectedRange(type?: string, length: ContentQualityLength = 'medium') {
  return (EXPECTED_WORD_RANGES[type || ''] || EXPECTED_WORD_RANGES.default)[length] || EXPECTED_WORD_RANGES.default.medium;
}

function scoreRelevance(text: string, input: ContentQualityInput) {
  const textNorm = normalize(text);
  const terms = getBriefTerms(input);

  if (terms.length === 0) return countWords(text) >= 10 ? 10 : 0;

  const matched = terms.filter((term) => textNorm.includes(term)).length;
  const coverage = matched / terms.length;
  return Math.round(clamp(coverage * 20, 0, 20));
}

function scoreFormat(text: string, type?: string) {
  const textNorm = normalize(text);
  const groups = FORMAT_GROUPS[type || ''] || [];

  if (groups.length === 0) {
    return /\n\s*\n/.test(stripHtml(text)) || /[-*]\s+/.test(text) ? 12 : 5;
  }

  const matched = groups.filter((group) => group.some((label) => textNorm.includes(label))).length;
  const structuralBonus = /\n\s*\n|[-*]\s+|:\s*/.test(stripHtml(text)) ? 2 : 0;
  const base = Math.round((matched / groups.length) * 18) + structuralBonus;
  const codeBlockPenalty = /```/.test(text) ? 4 : 0;
  return clamp(base - codeBlockPenalty, 0, 20);
}

function scoreActionability(text: string) {
  const textNorm = normalize(text);
  const actionPhrases = [
    'mua ngay', 'dang ky', 'lien he', 'nhan tin', 'dat lich', 'kham pha', 'xem ngay', 'bat dau',
    'tai ngay', 'goi ngay', 'nhan uu dai', 'cta', 'hom nay', 'ngay bay gio', 'dat hang',
  ];
  const benefitWords = ['loi ich', 'ket qua', 'giam', 'tang', 'tiet kiem', 'mien phi', 'uu dai', 'cam ket'];
  const actionMatches = actionPhrases.filter((phrase) => textNorm.includes(phrase)).length;
  const benefitMatches = benefitWords.filter((word) => textNorm.includes(word)).length;
  return clamp(actionMatches * 5 + benefitMatches * 2, 0, 15);
}

function scoreReadability(text: string) {
  const clean = stripHtml(text).trim();
  if (!clean) return 0;

  const totalWords = countWords(clean);
  if (totalWords < 3) return 1;

  const sentenceParts = clean.split(/[.!?\n]+/).map((part) => part.trim()).filter(Boolean);
  const averageSentenceWords = sentenceParts.length
    ? sentenceParts.reduce((sum, sentence) => sum + countWords(sentence), 0) / sentenceParts.length
    : countWords(clean);
  const letters = clean.match(/[A-Za-z\u00C0-\u1EF9]/g) || [];
  const diacritics = clean.match(/[\u00C0-\u1EF9]/g) || [];
  const diacriticRatio = letters.length ? diacritics.length / letters.length : 0;

  let score = 4;
  if (totalWords >= 10) score += 3;
  if (averageSentenceWords >= 4 && averageSentenceWords <= 28) score += 5;
  else if (averageSentenceWords <= 42) score += 3;
  if (/\n\s*\n|[-*]\s+|:\s*/.test(clean)) score += 3;
  if (diacriticRatio > 0.03) score += 3;
  if (/[\uFFFD]{1,}|\?{3,}|\bundefined\b|\bnull\b/i.test(clean)) score -= 5;
  if (/```|<script|<style/i.test(clean)) score -= 4;

  return clamp(score, 0, 18);
}

function scoreLength(text: string, type?: string, length?: ContentQualityLength) {
  const totalWords = countWords(text);
  if (!totalWords) return 0;

  const [min, max] = getExpectedRange(type, length || 'medium');
  if (totalWords >= min && totalWords <= max) return 15;

  if (totalWords < min) {
    return Math.round(clamp((totalWords / min) * 12, 0, 12));
  }

  return Math.round(clamp((max / totalWords) * 12, 0, 12));
}

function scoreSpecificity(text: string, input: ContentQualityInput) {
  const clean = stripHtml(text);
  const textNorm = normalize(clean);
  if (!textNorm) return 0;

  let score = 0;

  if (/[0-9]|%|k\b|trieu|ty|usd|vnd|free|mien phi/.test(textNorm)) score += 3;
  if (/[-*]\s+|\n\s*\d+[.)]/.test(clean)) score += 2;
  if (getBriefTerms(input).some((term) => textNorm.includes(term))) score += 3;

  const tokens = words(clean);
  const uniqueRatio = tokens.length ? unique(tokens).length / tokens.length : 0;
  if (uniqueRatio > 0.55 && tokens.length >= 8) score += 2;
  if (tokens.length >= 18) score += 2;
  if (/(rat tot|chat luong cao|gia ca hop ly|phu hop moi nhu cau|san pham tot)/i.test(textNorm)) score -= 3;

  return clamp(score, 0, 12);
}

export function scoreGeneratedContent(input: ContentQualityInput) {
  const text = input.text || '';
  if (hasInvalidGeneratedText(text)) return 0;

  const score = scoreRelevance(text, input)
    + scoreFormat(text, input.type)
    + scoreActionability(text)
    + scoreReadability(text)
    + scoreLength(text, input.type, input.length)
    + scoreSpecificity(text, input);

  return Math.round(clamp(score, 0, 100));
}
