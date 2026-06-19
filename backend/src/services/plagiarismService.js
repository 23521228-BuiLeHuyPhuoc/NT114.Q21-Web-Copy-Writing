const Content = require('../models/Content');
const PlagiarismReport = require('../models/PlagiarismReport');
const commonCrawlService = require('./commonCrawlService');
const createError = require('../utils/createError');

const MODEL_USED = 'local-ngram-v1';
const MAX_DATABASE_SOURCES = 80;
const MAX_REPORT_SOURCES = 6;
const MAX_REPORT_MATCHES = 12;
const MAX_SOURCE_TITLE_LENGTH = 200;
const MAX_SOURCE_LENGTH = 500;
const MAX_SOURCE_URL_LENGTH = 500;
const MAX_SNIPPET_LENGTH = 600;
const MAX_SOURCE_TEXT_LENGTH = 30000;
const MAX_MATCH_TEXT_LENGTH = 2000;
const MAX_TOPIC_MATCHES = 12;
const MAX_IGNORED_PHRASES = 30;
const MAX_IGNORED_PHRASE_LENGTH = 10000;

const DEFAULT_SOURCE_CONFIG = {
  database: true,
  references: true,
  web: false,
  uploads: false,
};

const SENSITIVITY_THRESHOLD_OFFSET = {
  lenient: 10,
  balanced: 0,
  strict: -10,
};

const COMMON_PHRASES = [
  'mua ngay',
  'dat hang ngay',
  'xem chi tiet',
  'lien he ngay',
  'nhan tin',
  'tu van mien phi',
  'freeship',
  'mien phi van chuyen',
  'uu dai',
  'khuyen mai',
  'giam gia',
  'so luong co han',
  'hang chinh hang',
  'chat luong cao',
  'doi tra de dang',
  'bao hanh chinh hang',
  'phu hop voi nhu cau',
  'nhan uu dai',
  'nhan shop de hoi them',
  'truoc khi chon',
];

const REFERENCE_SOURCES = [
  {
    source: 'marketing-ai.vn/copy-templates',
    sourceTitle: 'Mẫu copy quảng cáo khuyến mãi',
    sourceUrl: 'https://marketing-ai.vn/copy-templates',
    sourceType: 'reference',
    text: 'Giảm sốc đến 70% toàn bộ sản phẩm. Hàng chính hãng 100%, freeship toàn quốc cho đơn từ 299K. Mua ngay hôm nay để nhận ưu đãi độc quyền.',
  },
  {
    source: 'shopviet.vn/deals/summer',
    sourceTitle: 'Chiến dịch ưu đãi mùa hè',
    sourceUrl: 'https://shopviet.vn/deals/summer',
    sourceType: 'reference',
    text: 'Freeship toàn quốc đơn từ 299K, đổi trả dễ dàng trong 7 ngày. Số lượng có hạn, đặt hàng ngay trước khi chương trình kết thúc.',
  },
  {
    source: 'example-blog.com/marketing-tips',
    sourceTitle: 'Gợi ý viết nội dung bán hàng',
    sourceUrl: 'https://example-blog.com/marketing-tips',
    sourceType: 'reference',
    text: 'Nội dung quảng cáo nên nêu rõ lợi ích chính, bằng chứng tin cậy và lời kêu gọi hành động cụ thể để tăng tỷ lệ chuyển đổi.',
  },
  {
    source: 'copypro.local/reference/ecommerce',
    sourceTitle: 'Câu mẫu thương mại điện tử',
    sourceUrl: '',
    sourceType: 'reference',
    text: 'Sản phẩm được thiết kế cho người bận rộn, giúp tiết kiệm thời gian mỗi ngày mà vẫn giữ chất lượng ổn định và trải nghiệm tiện lợi.',
  },
];

function findReferenceSource(source = {}) {
  const reference = REFERENCE_SOURCES.find((item) => (
    item.source === source.source
    || (source.sourceUrl && item.sourceUrl === source.sourceUrl)
  ));

  if (reference) return reference;

  if (source.sourceType === 'reference' && !source.sourceUrl && /\?/.test(source.sourceTitle || '')) {
    return REFERENCE_SOURCES.find((item) => item.source === 'copypro.local/reference/ecommerce');
  }

  return null;
}

function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, Number(value) || 0));
}

function countWords(text) {
  return String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function toId(value) {
  if (!value) return null;
  if (value._id) return value._id.toString();
  return value.toString();
}

function normalizeText(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function sanitizeIgnoredPhrases(values = []) {
  if (!Array.isArray(values)) return [];

  const seen = new Set();
  const phrases = [];

  values.forEach((value) => {
    if (phrases.length >= MAX_IGNORED_PHRASES) return;
    const phrase = String(value || '').replace(/\s+/g, ' ').trim().slice(0, MAX_IGNORED_PHRASE_LENGTH).trim();
    const key = normalizeText(phrase);
    if (phrase.length < 2 || !key || seen.has(key)) return;

    seen.add(key);
    phrases.push(phrase);
  });

  return phrases;
}

function getIgnoredPhraseEntries(customPhrases = [], includeCommonPhrases = true) {
  const seen = new Set();
  const entries = [];

  const addPhrase = (phrase, priority) => {
    const normalized = normalizeText(phrase);
    const tokens = normalized.split(' ').filter(Boolean);
    const key = tokens.join(' ');

    if (key.length < 2 || tokens.length === 0 || seen.has(key)) return;

    seen.add(key);
    entries.push({
      normalized: key,
      tokens,
      priority,
    });
  };

  sanitizeIgnoredPhrases(customPhrases).forEach((phrase) => addPhrase(phrase, 0));
  if (includeCommonPhrases) {
    COMMON_PHRASES.forEach((phrase) => addPhrase(phrase, 1));
  }

  return entries.sort((left, right) => (
    left.priority - right.priority
    || right.tokens.length - left.tokens.length
    || right.normalized.length - left.normalized.length
  ));
}

function normalizeForComparison(text, options = {}) {
  return normalizeText(stripIgnoredSegments(text, options));
}

function tokenize(text, options = {}) {
  const normalized = normalizeForComparison(text, options);
  if (!normalized) return [];
  return normalized.split(' ').filter((token) => token.length > 1);
}

function unique(values) {
  return Array.from(new Set(values));
}

function buildNgrams(tokens, size) {
  if (tokens.length < size) return new Set(tokens);

  const grams = [];
  for (let index = 0; index <= tokens.length - size; index += 1) {
    grams.push(tokens.slice(index, index + size).join(' '));
  }
  return new Set(grams);
}

function intersectionSize(left, right) {
  let count = 0;
  left.forEach((value) => {
    if (right.has(value)) count += 1;
  });
  return count;
}

function getScoreBasis(scores = {}) {
  const ordered = [
    { key: 'exact', value: Number(scores.exactMatchScore || 0) },
    { key: 'phrase', value: Number(scores.phraseOverlapScore || 0) },
    { key: 'word', value: Number(scores.wordOverlapScore || 0) },
  ];

  const best = ordered.reduce((current, item) => (item.value > current.value ? item : current), ordered[0]);
  return best.value > 0 ? best.key : 'none';
}

function getPlagiarismScore(scores = {}) {
  return clamp(Math.max(
    Number(scores.exactMatchScore || 0),
    Number(scores.phraseOverlapScore || 0),
  ));
}

function getTopicSimilarityScore(scores = {}) {
  return clamp(Number(scores.wordOverlapScore || 0));
}

function scoreTexts(inputText, sourceText, options = {}) {
  const inputTokens = tokenize(inputText, options);
  const sourceTokens = tokenize(sourceText, options);
  if (inputTokens.length < 3 || sourceTokens.length < 3) {
    return {
      score: 0,
      matchedWords: 0,
      totalWords: inputTokens.length,
      exactMatchScore: 0,
      phraseOverlapScore: 0,
      wordOverlapScore: 0,
      plagiarismScore: 0,
      topicSimilarityScore: 0,
      scoreBasis: 'none',
      matchedPhrases: 0,
      totalPhrases: 0,
      phraseSize: 0,
      sharedUniqueWords: 0,
      inputUniqueWords: inputTokens.length,
      sourceUniqueWords: sourceTokens.length,
    };
  }

  const inputWords = new Set(inputTokens);
  const sourceWords = new Set(sourceTokens);
  const sharedWords = intersectionSize(inputWords, sourceWords);
  const wordContainment = sharedWords / Math.max(1, Math.min(inputWords.size, sourceWords.size));
  const jaccard = sharedWords / Math.max(1, unique([...inputWords, ...sourceWords]).length);
  const gramSize = inputTokens.length < 12 || sourceTokens.length < 12 ? 3 : 5;
  const inputNgrams = buildNgrams(inputTokens, gramSize);
  const sourceNgrams = buildNgrams(sourceTokens, gramSize);
  const sharedNgrams = intersectionSize(inputNgrams, sourceNgrams);
  const totalPhrases = Math.max(1, Math.min(inputNgrams.size, sourceNgrams.size));
  const ngramContainment = sharedNgrams / totalPhrases;
  const normalizedInput = normalizeForComparison(inputText, options);
  const normalizedSource = normalizeForComparison(sourceText, options);
  const exactContainment = normalizedInput.length >= 40 && normalizedSource.includes(normalizedInput)
    ? 1
    : normalizedSource.length >= 40 && normalizedInput.includes(normalizedSource)
      ? 0.92
      : 0;
  const exactMatchScore = clamp(Math.round(exactContainment * 100));
  const phraseOverlapScore = clamp(Math.round(ngramContainment * 100));
  const wordOverlapScore = clamp(Math.round(Math.max(wordContainment * 62, jaccard * 78)));

  const score = Math.max(
    phraseOverlapScore,
    wordOverlapScore,
    exactMatchScore,
  );
  const plagiarismScore = getPlagiarismScore({ exactMatchScore, phraseOverlapScore });
  const topicSimilarityScore = getTopicSimilarityScore({ wordOverlapScore });

  return {
    score: clamp(Math.round(score)),
    plagiarismScore,
    topicSimilarityScore,
    matchedWords: sharedWords,
    totalWords: inputTokens.length,
    exactMatchScore,
    phraseOverlapScore,
    wordOverlapScore,
    scoreBasis: getScoreBasis({ exactMatchScore, phraseOverlapScore, wordOverlapScore }),
    matchedPhrases: sharedNgrams,
    totalPhrases,
    phraseSize: gramSize,
    sharedUniqueWords: sharedWords,
    inputUniqueWords: inputWords.size,
    sourceUniqueWords: sourceWords.size,
  };
}

function splitSegments(text) {
  const source = String(text || '');
  const regex = /[^.!?;:\n]+[.!?;:\n]*/g;
  const segments = [];
  let match;

  while ((match = regex.exec(source)) !== null) {
    const raw = match[0];
    const cleaned = raw.trim();
    if (countWords(cleaned) < 5) continue;
    const start = match.index + raw.indexOf(cleaned);
    segments.push({
      text: cleaned,
      start,
      end: start + cleaned.length,
    });
  }

  if (segments.length === 0 && countWords(source) >= 5) {
    return [{ text: source.trim(), start: 0, end: source.trim().length }];
  }

  return segments;
}

function snippet(text, maxLength = 220) {
  const compact = String(text || '').replace(/\s+/g, ' ').trim();
  if (compact.length <= maxLength) return compact;
  return `${compact.slice(0, maxLength - 1).trim()}…`;
}

function truncateText(value, maxLength) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  if (maxLength <= 1) return text.slice(0, maxLength);
  return `${text.slice(0, maxLength - 1).trim()}…`;
}

function schemaText(value, maxLength) {
  return truncateText(value, maxLength);
}

function tokenizeWithRanges(text) {
  const tokens = [];
  const regex = /[\p{L}\p{N}]+/gu;
  let match;

  while ((match = regex.exec(String(text || ''))) !== null) {
    const value = normalizeText(match[0]);
    if (!value) continue;
    tokens.push({
      value,
      start: match.index,
      end: match.index + match[0].length,
    });
  }

  return tokens;
}

function mergeRanges(ranges) {
  const sorted = ranges
    .filter((range) => range.end > range.start)
    .sort((left, right) => left.start - right.start || left.end - right.end);
  const merged = [];

  sorted.forEach((range) => {
    const last = merged[merged.length - 1];
    if (!last || range.start > last.end) {
      merged.push({ ...range });
      return;
    }
    last.end = Math.max(last.end, range.end);
  });

  return merged;
}

function findIgnoredRanges(text, options = {}) {
  const textTokens = tokenizeWithRanges(text);
  if (textTokens.length === 0) return [];

  const ranges = [];
  getIgnoredPhraseEntries(options.ignoredPhrases, options.ignoreCommonPhrases !== false).forEach((phrase) => {
    const phraseTokens = phrase.tokens;
    if (phraseTokens.length === 0 || phraseTokens.length > textTokens.length) return;

    for (let index = 0; index <= textTokens.length - phraseTokens.length; index += 1) {
      const matched = phraseTokens.every((token, tokenIndex) => textTokens[index + tokenIndex].value === token);
      if (!matched) continue;

      ranges.push({
        start: textTokens[index].start,
        end: textTokens[index + phraseTokens.length - 1].end,
      });
    }
  });

  return mergeRanges(ranges);
}

function maskRangesInText(text, ranges) {
  const source = String(text || '');
  if (ranges.length === 0) return source;

  let cursor = 0;
  let output = '';

  mergeRanges(ranges).forEach((range) => {
    output += source.slice(cursor, range.start);
    output += ' '.repeat(range.end - range.start);
    cursor = range.end;
  });
  output += source.slice(cursor);

  return output;
}

function removeRangesFromText(text, ranges) {
  const source = String(text || '');
  if (ranges.length === 0) return source;

  let cursor = 0;
  let output = '';

  mergeRanges(ranges).forEach((range) => {
    output += source.slice(cursor, range.start);
    output += ' ';
    cursor = range.end;
  });
  output += source.slice(cursor);

  return output
    .replace(/\s+([,.!?;:])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function removeIgnoredPhrasesForDisplay(text, options = {}) {
  return stripIgnoredSegments(text, options);
}

function stripIgnoredSegments(text, options = {}) {
  const ranges = findIgnoredRanges(text, options);
  if (options.preserveLength) return maskRangesInText(text, ranges);
  return removeRangesFromText(text, ranges);
}

function findSegmentMatches(inputText, candidate, threshold, options = {}) {
  const maskedInputText = stripIgnoredSegments(inputText, { ...options, preserveLength: true });
  const maskedSourceText = stripIgnoredSegments(candidate.text, { ...options, preserveLength: true });
  const inputSegments = splitSegments(maskedInputText);
  const sourceSegments = splitSegments(maskedSourceText);
  const matches = [];

  inputSegments.forEach((inputSegment) => {
    let bestMatch = null;

    sourceSegments.forEach((sourceSegment) => {
      const scored = scoreTexts(inputSegment.text, sourceSegment.text, options);
      if (
        !bestMatch
        || scored.plagiarismScore > bestMatch.plagiarismScore
        || (scored.plagiarismScore === bestMatch.plagiarismScore && scored.score > bestMatch.score)
      ) {
        bestMatch = { ...sourceSegment, ...scored };
      }
    });

    if (bestMatch && bestMatch.plagiarismScore >= threshold) {
      const matchedText = inputSegment.text.replace(/\s+/g, ' ').trim();
      const sourceText = bestMatch.text.replace(/\s+/g, ' ').trim();
      if (countWords(matchedText) < 3) return;

      matches.push({
        start: inputSegment.start,
        end: inputSegment.end,
        matchedText: schemaText(matchedText, MAX_MATCH_TEXT_LENGTH),
        sourceText: schemaText(sourceText, MAX_MATCH_TEXT_LENGTH),
        sourceUrl: schemaText(candidate.sourceUrl || '', MAX_SOURCE_URL_LENGTH),
        sourceTitle: schemaText(candidate.sourceTitle || candidate.source || '', MAX_SOURCE_TITLE_LENGTH),
        sourceType: candidate.sourceType,
        score: bestMatch.plagiarismScore,
        exactMatchScore: bestMatch.exactMatchScore,
        phraseOverlapScore: bestMatch.phraseOverlapScore,
        wordOverlapScore: bestMatch.wordOverlapScore,
        scoreBasis: getScoreBasis({
          exactMatchScore: bestMatch.exactMatchScore,
          phraseOverlapScore: bestMatch.phraseOverlapScore,
          wordOverlapScore: 0,
        }),
        matchedWords: bestMatch.matchedWords,
        totalWords: bestMatch.totalWords,
        matchedPhrases: bestMatch.matchedPhrases,
        totalPhrases: bestMatch.totalPhrases,
        phraseSize: bestMatch.phraseSize,
      });
    }
  });

  return matches.sort((left, right) => right.score - left.score).slice(0, 4);
}

function topicMatchThreshold(threshold) {
  return clamp(threshold, 20, 50);
}

function findTopicSegmentMatches(inputText, candidate, threshold, options = {}) {
  const maskedInputText = stripIgnoredSegments(inputText, { ...options, preserveLength: true });
  const maskedSourceText = stripIgnoredSegments(candidate.text, { ...options, preserveLength: true });
  const inputSegments = splitSegments(maskedInputText);
  const sourceSegments = splitSegments(maskedSourceText);
  const matches = [];
  const effectiveTopicThreshold = topicMatchThreshold(threshold);

  inputSegments.forEach((inputSegment) => {
    let bestMatch = null;

    sourceSegments.forEach((sourceSegment) => {
      const scored = scoreTexts(inputSegment.text, sourceSegment.text, options);
      if (
        !bestMatch
        || scored.wordOverlapScore > bestMatch.wordOverlapScore
        || (scored.wordOverlapScore === bestMatch.wordOverlapScore && scored.score > bestMatch.score)
      ) {
        bestMatch = { ...sourceSegment, ...scored };
      }
    });

    if (
      bestMatch
      && bestMatch.wordOverlapScore >= effectiveTopicThreshold
      && bestMatch.plagiarismScore < threshold
    ) {
      const matchedText = inputSegment.text.replace(/\s+/g, ' ').trim();
      const sourceText = bestMatch.text.replace(/\s+/g, ' ').trim();
      if (countWords(matchedText) < 3) return;

      matches.push({
        start: inputSegment.start,
        end: inputSegment.end,
        matchedText: schemaText(matchedText, MAX_MATCH_TEXT_LENGTH),
        sourceText: schemaText(sourceText, MAX_MATCH_TEXT_LENGTH),
        sourceUrl: schemaText(candidate.sourceUrl || '', MAX_SOURCE_URL_LENGTH),
        sourceTitle: schemaText(candidate.sourceTitle || candidate.source || '', MAX_SOURCE_TITLE_LENGTH),
        sourceType: candidate.sourceType,
        score: bestMatch.wordOverlapScore,
        exactMatchScore: bestMatch.exactMatchScore,
        phraseOverlapScore: bestMatch.phraseOverlapScore,
        wordOverlapScore: bestMatch.wordOverlapScore,
        scoreBasis: 'word',
        matchedWords: bestMatch.matchedWords,
        totalWords: bestMatch.totalWords,
        matchedPhrases: bestMatch.matchedPhrases,
        totalPhrases: bestMatch.totalPhrases,
        phraseSize: bestMatch.phraseSize,
      });
    }
  });

  return matches.sort((left, right) => right.score - left.score).slice(0, 4);
}

function getRiskLevel(similarityScore) {
  if (similarityScore >= 70) return 'critical';
  if (similarityScore >= 45) return 'high';
  if (similarityScore >= 20) return 'review';
  return 'safe';
}

function maxCount(values) {
  return Math.max(0, ...values.map((value) => Number(value || 0)).filter(Number.isFinite));
}

function getComparedSourceCount(analysis = {}, sources = [], matches = []) {
  return maxCount([
    analysis.candidateCount,
    analysis.sourceCount,
    Array.isArray(sources) ? sources.length : 0,
    Number(analysis.matchCount || 0) > 0 ? 1 : 0,
    Number(analysis.topicMatchCount || 0) > 0 ? 1 : 0,
    Array.isArray(matches) && matches.length > 0 ? 1 : 0,
  ]);
}

function buildSummary(similarityScore, sources, matches, analysis = {}) {
  const loadedSourceCount = getComparedSourceCount(analysis, sources, matches);
  const commonCrawl = analysis.commonCrawl || {};
  const topicSimilarityScore = Number(analysis.topicSimilarityScore || analysis.wordOverlapScore || 0);

  if (loadedSourceCount <= 0) {
    return 'Chưa nạp được nguồn để so khớp, nên chưa đủ dữ liệu để kết luận nội dung không đạo văn.';
  }

  if (analysis.hasIgnoredPhrases && similarityScore === 0 && matches.length === 0) {
    return 'Không còn đoạn nào vượt ngưỡng sau khi áp dụng danh sách bỏ qua.';
  }

  if (similarityScore < 20) {
    if (commonCrawl.enabled && commonCrawl.candidateCount === 0) {
      return 'Không phát hiện trùng trong các nguồn đã nạp, nhưng nguồn web chưa tải được nội dung để so khớp nên chưa đủ để kết luận toàn web.';
    }

    if (topicSimilarityScore >= 20) {
      return 'Không phát hiện đạo văn rõ; nội dung chỉ có tương đồng chủ đề/từ khóa với các nguồn đã nạp.';
    }

    return 'Nội dung có mức trùng lặp thấp so với dữ liệu đang kiểm tra.';
  }

  const sourceLabel = sources[0]?.sourceTitle || sources[0]?.source || 'nguồn tham chiếu';
  if (similarityScore >= 70) {
    return `Nội dung có khả năng trùng lặp cao với ${sourceLabel}. Cần viết lại các đoạn được đánh dấu trước khi xuất bản.`;
  }

  if (matches.length > 0) {
    return `Phát hiện ${matches.length} đoạn cần rà soát, nổi bật nhất từ ${sourceLabel}.`;
  }

  return `Phát hiện một số dấu hiệu tương đồng với ${sourceLabel}; nên chỉnh lại cách diễn đạt để tăng tính độc đáo.`;
}

function serializeSource(source, displayOptions = {}, comparisonCheckText = '') {
  const reference = findReferenceSource(source);
  const sourceText = removeIgnoredPhrasesForDisplay(reference?.text || source.sourceText || '', displayOptions);
  const sourceSnippet = removeIgnoredPhrasesForDisplay(reference ? snippet(reference.text) : source.snippet || '', displayOptions);
  const rescored = comparisonCheckText && countWords(sourceText) >= 3
    ? scoreTexts(comparisonCheckText, sourceText, displayOptions)
    : null;
  const exactMatchScore = Math.round(rescored?.exactMatchScore ?? source.exactMatchScore ?? 0);
  const phraseOverlapScore = Math.round(rescored?.phraseOverlapScore ?? source.phraseOverlapScore ?? 0);
  const wordOverlapScore = Math.round(rescored?.wordOverlapScore ?? source.wordOverlapScore ?? 0);

  return {
    source: schemaText(source.source || reference?.source || '', MAX_SOURCE_LENGTH),
    sourceTitle: schemaText(reference?.sourceTitle || source.sourceTitle || '', MAX_SOURCE_TITLE_LENGTH),
    sourceUrl: schemaText(source.sourceUrl || reference?.sourceUrl || '', MAX_SOURCE_URL_LENGTH),
    sourceType: source.sourceType || reference?.sourceType || 'database',
    contentId: toId(source.contentId),
    similarity: Math.round(rescored?.score ?? source.similarity ?? 0),
    plagiarismScore: Math.round(rescored?.plagiarismScore ?? source.plagiarismScore ?? 0),
    topicSimilarityScore: Math.round(rescored?.topicSimilarityScore ?? source.topicSimilarityScore ?? source.wordOverlapScore ?? 0),
    snippet: schemaText(sourceSnippet, MAX_SNIPPET_LENGTH),
    sourceText: schemaText(sourceText, MAX_SOURCE_TEXT_LENGTH),
    matchedWords: rescored?.matchedWords ?? source.matchedWords ?? 0,
    totalWords: rescored?.totalWords ?? source.totalWords ?? 0,
    exactMatchScore,
    phraseOverlapScore,
    wordOverlapScore,
    scoreBasis: getScoreBasis({ exactMatchScore, phraseOverlapScore, wordOverlapScore }),
    matchedPhrases: rescored?.matchedPhrases ?? source.matchedPhrases ?? 0,
    totalPhrases: rescored?.totalPhrases ?? source.totalPhrases ?? 0,
  };
}

function serializeMatch(match, displayOptions = {}, mode = 'plagiarism') {
  const reference = findReferenceSource(match);
  const matchedText = removeIgnoredPhrasesForDisplay(match.matchedText || '', displayOptions);
  const sourceText = removeIgnoredPhrasesForDisplay(match.sourceText || '', displayOptions);
  const rescored = countWords(matchedText) >= 3 && countWords(sourceText) >= 3
    ? scoreTexts(matchedText, sourceText, displayOptions)
    : null;
  const exactMatchScore = Math.round(rescored?.exactMatchScore ?? match.exactMatchScore ?? 0);
  const phraseOverlapScore = Math.round(rescored?.phraseOverlapScore ?? match.phraseOverlapScore ?? 0);
  const wordOverlapScore = Math.round(rescored?.wordOverlapScore ?? match.wordOverlapScore ?? 0);
  const score = mode === 'topic'
    ? wordOverlapScore
    : Math.round(rescored?.plagiarismScore ?? match.score ?? 0);
  const scoreBasis = mode === 'topic'
    ? 'word'
    : getScoreBasis({ exactMatchScore, phraseOverlapScore, wordOverlapScore: 0 });

  return {
    start: match.start || 0,
    end: match.end || 0,
    matchedText: schemaText(matchedText, MAX_MATCH_TEXT_LENGTH),
    sourceText: schemaText(sourceText, MAX_MATCH_TEXT_LENGTH),
    sourceUrl: schemaText(match.sourceUrl || reference?.sourceUrl || '', MAX_SOURCE_URL_LENGTH),
    sourceTitle: schemaText(reference?.sourceTitle || match.sourceTitle || '', MAX_SOURCE_TITLE_LENGTH),
    sourceType: match.sourceType || reference?.sourceType || 'database',
    score,
    exactMatchScore,
    phraseOverlapScore,
    wordOverlapScore,
    scoreBasis,
    matchedWords: rescored?.matchedWords ?? match.matchedWords ?? 0,
    totalWords: rescored?.totalWords ?? match.totalWords ?? 0,
    matchedPhrases: rescored?.matchedPhrases ?? match.matchedPhrases ?? 0,
    totalPhrases: rescored?.totalPhrases ?? match.totalPhrases ?? 0,
    phraseSize: rescored?.phraseSize ?? match.phraseSize ?? 0,
  };
}

function serializeReport(report) {
  const ignoredPhrases = sanitizeIgnoredPhrases(report.ignoredPhrases);
  const displayOptions = {
    ignoreCommonPhrases: report.ignoreCommonPhrases !== false,
    ignoredPhrases,
  };
  const rawAnalysis = report.analysis || {};
  const threshold = rawAnalysis.effectiveThreshold || getEffectiveThreshold(report.threshold || 35, report.sensitivity || 'balanced');
  const effectiveTopicThreshold = topicMatchThreshold(threshold);
  const comparisonCheckText = stripIgnoredSegments(report.checkText, displayOptions);
  const matches = (report.matches || [])
    .map((match) => serializeMatch(match, displayOptions, 'plagiarism'))
    .filter((match) => countWords(match.matchedText) >= 3 && match.score >= threshold);
  const topicMatches = (report.topicMatches || [])
    .map((match) => serializeMatch(match, displayOptions, 'topic'))
    .filter((match) => (
      countWords(match.matchedText) >= 3
      && match.score >= effectiveTopicThreshold
      && getPlagiarismScore(match) < threshold
    ));
  const sources = matches.length > 0 || topicMatches.length > 0
    ? (report.sources || []).map((source) => serializeSource(source, displayOptions, comparisonCheckText))
    : [];
  const similarityScore = matches.length > 0
    ? clamp(maxScore([...matches.map((match) => match.score), ...sources.map((source) => source.plagiarismScore)]))
    : 0;
  const originalityScore = clamp(100 - similarityScore);
  const topicSimilarityScore = maxScore([
    ...topicMatches.map((match) => match.score),
    ...sources.map((source) => source.topicSimilarityScore),
  ]);
  const candidateCount = getComparedSourceCount(rawAnalysis, report.sources || [], matches);
  const analysis = {
    ...rawAnalysis,
    candidateCount,
    matchCount: matches.length,
    topicMatchCount: topicMatches.length,
    sourceCount: sources.length,
    plagiarismScore: similarityScore,
    topicSimilarityScore,
    exactMatchScore: maxScore([...matches.map((match) => match.exactMatchScore), ...sources.map((source) => source.exactMatchScore)]),
    phraseOverlapScore: maxScore([...matches.map((match) => match.phraseOverlapScore), ...sources.map((source) => source.phraseOverlapScore)]),
    wordOverlapScore: maxScore([
      ...matches.map((match) => match.wordOverlapScore),
      ...topicMatches.map((match) => match.wordOverlapScore),
      ...sources.map((source) => source.wordOverlapScore),
    ]),
    hasIgnoredPhrases: ignoredPhrases.length > 0,
  };

  return {
    id: report._id.toString(),
    _id: report._id.toString(),
    userId: toId(report.userId),
    contentId: toId(report.contentId),
    checkText: report.checkText,
    wordCount: report.wordCount || countWords(report.checkText),
    similarityScore,
    originalityScore,
    status: report.status,
    riskLevel: getRiskLevel(similarityScore),
    matches,
    topicMatches,
    sources,
    modelUsed: report.modelUsed || MODEL_USED,
    threshold: report.threshold || 35,
    sensitivity: report.sensitivity || 'balanced',
    ignoreCommonPhrases: report.ignoreCommonPhrases !== false,
    ignoredPhrases,
    sourceConfig: report.sourceConfig || DEFAULT_SOURCE_CONFIG,
    analysis,
    summary: buildSummary(similarityScore, sources, matches, analysis),
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
  };
}

async function getCheckText(userId, payload) {
  if (!payload.contentId) {
    return { checkText: payload.text, contentId: null };
  }

  const content = await Content.findOne({
    _id: payload.contentId,
    userId,
    isDeleted: { $ne: true },
  });

  if (!content) throw createError(404, 'Content not found');

  return {
    checkText: payload.text || content.outputText,
    contentId: content._id,
  };
}

async function buildDatabaseCandidates(userId, excludedContentId) {
  const filter = {
    userId,
    isDeleted: { $ne: true },
    outputText: { $exists: true, $ne: '' },
  };

  if (excludedContentId) {
    filter._id = { $ne: excludedContentId };
  }

  const contents = await Content.find(filter)
    .select('_id title type outputText createdAt')
    .sort({ updatedAt: -1, createdAt: -1 })
    .limit(MAX_DATABASE_SOURCES);

  return contents.map((content) => ({
    source: content.title || `Content ${content._id.toString()}`,
    sourceTitle: content.title || 'Saved content',
    sourceUrl: '',
    sourceType: 'database',
    contentId: content._id,
    text: content.outputText || '',
  }));
}

function normalizeSourceConfig(payload = {}) {
  const incoming = payload.sources || {};
  const references = incoming.references ?? payload.includeReferences ?? DEFAULT_SOURCE_CONFIG.references;
  return {
    database: incoming.database ?? DEFAULT_SOURCE_CONFIG.database,
    references,
    web: incoming.web ?? DEFAULT_SOURCE_CONFIG.web,
    uploads: incoming.uploads ?? DEFAULT_SOURCE_CONFIG.uploads,
  };
}

function getEffectiveThreshold(threshold, sensitivity) {
  const offset = SENSITIVITY_THRESHOLD_OFFSET[sensitivity] ?? SENSITIVITY_THRESHOLD_OFFSET.balanced;
  return clamp(Number(threshold || 35) + offset, 10, 95);
}

function maxScore(values) {
  return Math.max(0, ...values.map((value) => Number(value || 0)).filter(Number.isFinite));
}

function emptyCommonCrawlResult({ enabled = false, allowLiveFallback = false, status = 'skipped' } = {}) {
  return {
    candidates: [],
    stats: {
      enabled,
      status,
      allowLiveFallback,
      searchProvider: enabled ? 'serpapi' : 'none',
      serpApiStatus: enabled ? 'skipped' : 'skipped',
    },
  };
}

function buildWebSearchText(checkText, options = {}) {
  return stripIgnoredSegments(checkText, options);
}

function buildAnalysis(scoredSources, candidates, matches, topicMatches, sourceConfig, effectiveThreshold, commonCrawlStats = {}) {
  const checkedSourceTypes = unique([
    ...candidates.map((candidate) => candidate.sourceType).filter(Boolean),
    sourceConfig.web ? 'web' : null,
  ].filter(Boolean));
  const unavailableSourceTypes = [];
  if (sourceConfig.uploads) unavailableSourceTypes.push('uploads');

  return {
    effectiveThreshold,
    candidateCount: candidates.length,
    sourceCount: scoredSources.length,
    matchCount: matches.length,
    topicMatchCount: topicMatches.length,
    checkedSourceTypes,
    unavailableSourceTypes,
    plagiarismScore: maxScore(scoredSources.map((source) => source.plagiarismScore)),
    topicSimilarityScore: maxScore(scoredSources.map((source) => source.topicSimilarityScore ?? source.wordOverlapScore)),
    exactMatchScore: maxScore(scoredSources.map((source) => source.exactMatchScore)),
    phraseOverlapScore: maxScore(scoredSources.map((source) => source.phraseOverlapScore)),
    wordOverlapScore: maxScore(scoredSources.map((source) => source.wordOverlapScore)),
    commonCrawl: {
      enabled: Boolean(commonCrawlStats.enabled),
      allowLiveFallback: Boolean(commonCrawlStats.allowLiveFallback),
      status: commonCrawlStats.status || (sourceConfig.web ? 'empty' : 'skipped'),
      sourceMode: commonCrawlStats.sourceMode || 'none',
      searchProvider: commonCrawlStats.searchProvider || (sourceConfig.web ? 'serpapi' : 'none'),
      serpApiStatus: commonCrawlStats.serpApiStatus || (sourceConfig.web ? 'empty' : 'skipped'),
      serpApiQueryCount: commonCrawlStats.serpApiQueryCount || 0,
      serpApiResultCount: commonCrawlStats.serpApiResultCount || 0,
      serpApiUrlCount: commonCrawlStats.serpApiUrlCount || 0,
      serpApiError: commonCrawlStats.serpApiError || '',
      serpApiResults: commonCrawlStats.serpApiResults || [],
      explicitUrls: commonCrawlStats.explicitUrls || [],
      indexes: commonCrawlStats.indexes || [],
      queryCount: commonCrawlStats.queryCount || 0,
      recordCount: commonCrawlStats.recordCount || 0,
      cdxHitCount: commonCrawlStats.cdxHitCount || 0,
      cdxErrorCount: commonCrawlStats.cdxErrorCount || 0,
      warcFetchCount: commonCrawlStats.warcFetchCount || 0,
      liveFetchCount: commonCrawlStats.liveFetchCount || 0,
      fetchedCount: commonCrawlStats.fetchedCount || 0,
      targetUrlCount: commonCrawlStats.targetUrlCount || 0,
      checkedUrlCount: commonCrawlStats.checkedUrlCount || 0,
      skippedUrlCount: commonCrawlStats.skippedUrlCount || 0,
      candidateCount: commonCrawlStats.candidateCount || 0,
      minimumRecommendedSnapshots: commonCrawlStats.minimumRecommendedSnapshots || 5,
      coverageLevel: commonCrawlStats.coverageLevel || 'none',
      budgetMs: commonCrawlStats.budgetMs || 0,
      elapsedMs: commonCrawlStats.elapsedMs || 0,
      timedOut: Boolean(commonCrawlStats.timedOut),
      budgetExhausted: Boolean(commonCrawlStats.budgetExhausted),
      maxSnapshots: commonCrawlStats.maxSnapshots || 0,
      maxUrlCandidates: commonCrawlStats.maxUrlCandidates || 0,
      patterns: commonCrawlStats.patterns || [],
      searchQueries: commonCrawlStats.searchQueries || [],
      discoveredUrls: commonCrawlStats.discoveredUrls || [],
      checkedUrls: commonCrawlStats.checkedUrls || [],
      error: commonCrawlStats.error || '',
      lastCdxError: commonCrawlStats.lastCdxError || '',
    },
  };
}

async function checkPlagiarism(userId, payload) {
  const sensitivity = payload.sensitivity || 'balanced';
  const sourceConfig = normalizeSourceConfig(payload);
  const threshold = payload.threshold || 35;
  const effectiveThreshold = getEffectiveThreshold(threshold, sensitivity);
  const ignoreCommonPhrases = payload.ignoreCommonPhrases !== false;
  const ignoredPhrases = sanitizeIgnoredPhrases(payload.ignoredPhrases);
  const scoringOptions = {
    ignoreCommonPhrases,
    ignoredPhrases,
  };
  const { checkText, contentId } = await getCheckText(userId, payload);

  if (!checkText || countWords(checkText) < 5) {
    throw createError(400, 'Text must contain at least 5 words');
  }

  const comparisonCheckText = stripIgnoredSegments(checkText, scoringOptions);
  const webSearchText = buildWebSearchText(checkText, scoringOptions);
  const shouldFetchWeb = sourceConfig.web && countWords(webSearchText) >= 5;

  const [databaseCandidates, commonCrawlResult] = await Promise.all([
    sourceConfig.database ? buildDatabaseCandidates(userId, contentId) : Promise.resolve([]),
    shouldFetchWeb
      ? commonCrawlService.fetchCommonCrawlCandidates(webSearchText, { allowLiveFallback: true, preferLiveFallback: true })
      : Promise.resolve(emptyCommonCrawlResult({
        enabled: sourceConfig.web,
        status: sourceConfig.web ? 'empty' : 'skipped',
        allowLiveFallback: sourceConfig.web,
      })),
  ]);
  const referenceCandidates = sourceConfig.references ? REFERENCE_SOURCES : [];
  const webCandidates = commonCrawlResult.candidates || [];
  const candidates = [...databaseCandidates, ...referenceCandidates, ...webCandidates];

  const scoredSources = candidates
    .map((candidate) => {
      const comparisonCandidateText = stripIgnoredSegments(candidate.text, scoringOptions);
      const textScore = scoreTexts(comparisonCheckText, comparisonCandidateText, scoringOptions);
      const matches = findSegmentMatches(checkText, candidate, effectiveThreshold, scoringOptions);
      const topicMatches = findTopicSegmentMatches(checkText, candidate, effectiveThreshold, scoringOptions);
      const bestSegment = matches[0] || {};
      const bestMatchScore = bestSegment.score || 0;
      const exactMatchScore = Math.max(textScore.exactMatchScore, bestSegment.exactMatchScore || 0);
      const phraseOverlapScore = Math.max(textScore.phraseOverlapScore, bestSegment.phraseOverlapScore || 0);
      const wordOverlapScore = Math.max(textScore.wordOverlapScore, bestSegment.wordOverlapScore || 0);
      const plagiarismScore = Math.max(textScore.plagiarismScore, bestMatchScore);
      const topicSimilarityScore = getTopicSimilarityScore({ wordOverlapScore });
      const similarity = Math.max(textScore.score, bestMatchScore);

      return {
        ...candidate,
        similarity,
        plagiarismScore,
        topicSimilarityScore,
        matchedWords: textScore.matchedWords,
        totalWords: textScore.totalWords,
        exactMatchScore,
        phraseOverlapScore,
        wordOverlapScore,
        scoreBasis: getScoreBasis({ exactMatchScore, phraseOverlapScore, wordOverlapScore }),
        matchedPhrases: textScore.matchedPhrases,
        totalPhrases: textScore.totalPhrases,
        comparisonText: comparisonCandidateText,
        snippet: snippet(comparisonCandidateText),
        matches,
        topicMatches,
      };
    })
    .filter((candidate) => candidate.similarity >= 5 || candidate.matches.length > 0 || candidate.topicMatches.length > 0)
    .sort((left, right) => right.similarity - left.similarity);

  const sources = scoredSources.slice(0, MAX_REPORT_SOURCES).map((candidate) => ({
    source: schemaText(candidate.source, MAX_SOURCE_LENGTH),
    sourceTitle: schemaText(candidate.sourceTitle, MAX_SOURCE_TITLE_LENGTH),
    sourceUrl: schemaText(candidate.sourceUrl, MAX_SOURCE_URL_LENGTH),
    sourceType: candidate.sourceType,
    contentId: candidate.contentId || null,
    similarity: candidate.similarity,
    plagiarismScore: candidate.plagiarismScore,
    topicSimilarityScore: candidate.topicSimilarityScore,
    snippet: schemaText(candidate.snippet, MAX_SNIPPET_LENGTH),
    sourceText: schemaText(candidate.comparisonText, MAX_SOURCE_TEXT_LENGTH),
    matchedWords: candidate.matchedWords,
    totalWords: candidate.totalWords,
    exactMatchScore: candidate.exactMatchScore,
    phraseOverlapScore: candidate.phraseOverlapScore,
    wordOverlapScore: candidate.wordOverlapScore,
    scoreBasis: candidate.scoreBasis,
    matchedPhrases: candidate.matchedPhrases,
    totalPhrases: candidate.totalPhrases,
  }));

  const matches = scoredSources
    .flatMap((candidate) => candidate.matches)
    .sort((left, right) => right.score - left.score)
    .slice(0, MAX_REPORT_MATCHES)
    .sort((left, right) => left.start - right.start);

  const topicMatches = scoredSources
    .flatMap((candidate) => candidate.topicMatches)
    .sort((left, right) => right.score - left.score)
    .slice(0, MAX_TOPIC_MATCHES)
    .sort((left, right) => left.start - right.start);

  const similarityScore = clamp(maxScore(scoredSources.map((source) => source.plagiarismScore)));
  const originalityScore = clamp(100 - similarityScore);
  const riskLevel = getRiskLevel(similarityScore);
  const analysis = buildAnalysis(
    scoredSources,
    candidates,
    matches,
    topicMatches,
    sourceConfig,
    effectiveThreshold,
    commonCrawlResult.stats,
  );
  analysis.hasIgnoredPhrases = ignoredPhrases.length > 0;
  const summary = buildSummary(similarityScore, sources, matches, analysis);

  const report = await PlagiarismReport.create({
    userId,
    contentId,
    checkText,
    similarityScore,
    originalityScore,
    status: 'completed',
    riskLevel,
    matches,
    topicMatches,
    sources,
    modelUsed: MODEL_USED,
    threshold,
    sensitivity,
    ignoreCommonPhrases: scoringOptions.ignoreCommonPhrases,
    ignoredPhrases,
    sourceConfig,
    analysis,
    summary,
  });

  return serializeReport(report);
}

async function debugCommonCrawl(payload) {
  const result = await commonCrawlService.fetchCommonCrawlCandidates(payload.text, {
    allowLiveFallback: payload.allowLiveFallback === true,
    budgetMs: payload.budgetMs,
  });

  return {
    stats: result.stats,
    candidates: (result.candidates || []).map((candidate) => ({
      source: candidate.source,
      sourceTitle: candidate.sourceTitle,
      sourceUrl: candidate.sourceUrl,
      sourceMode: candidate.sourceMode || 'none',
      wordCount: countWords(candidate.text),
      textPreview: snippet(candidate.text, 500),
      commonCrawl: candidate.commonCrawl || null,
    })),
  };
}

async function listReports(userId, query = {}) {
  const page = Math.max(1, Number(query.page || 1));
  const limit = Math.min(100, Math.max(1, Number(query.limit || 10)));
  const filter = { userId };

  if (query.riskLevel) {
    filter.riskLevel = query.riskLevel;
  }

  const [totalItems, reports] = await Promise.all([
    PlagiarismReport.countDocuments(filter),
    PlagiarismReport.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
  ]);

  return {
    items: reports.map(serializeReport),
    pagination: {
      page,
      limit,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / limit)),
    },
  };
}

async function getReport(userId, id) {
  const report = await PlagiarismReport.findOne({ _id: id, userId });
  if (!report) throw createError(404, 'Plagiarism report not found');
  return serializeReport(report);
}

module.exports = {
  MODEL_USED,
  serializeReport,
  checkPlagiarism,
  debugCommonCrawl,
  listReports,
  getReport,
  __test: {
    scoreTexts,
    findSegmentMatches,
    findTopicSegmentMatches,
    stripIgnoredSegments,
    buildWebSearchText,
    removeIgnoredPhrasesForDisplay,
    getPlagiarismScore,
    getTopicSimilarityScore,
  },
};
