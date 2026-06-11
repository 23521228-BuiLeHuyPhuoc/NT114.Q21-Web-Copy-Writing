const Content = require('../models/Content');
const PlagiarismReport = require('../models/PlagiarismReport');
const commonCrawlService = require('./commonCrawlService');
const createError = require('../utils/createError');

const MODEL_USED = 'local-ngram-v1';
const MAX_DATABASE_SOURCES = 80;
const MAX_REPORT_SOURCES = 6;
const MAX_REPORT_MATCHES = 12;

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

function removeCommonPhrases(normalizedText) {
  let cleaned = ` ${normalizedText} `;
  COMMON_PHRASES.forEach((phrase) => {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    cleaned = cleaned.replace(new RegExp(`\\s${escaped}\\s`, 'g'), ' ');
  });
  return cleaned.replace(/\s+/g, ' ').trim();
}

function normalizeForComparison(text, options = {}) {
  const normalized = normalizeText(text);
  return options.ignoreCommonPhrases === false ? normalized : removeCommonPhrases(normalized);
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

  return {
    score: clamp(Math.round(score)),
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

function findSegmentMatches(inputText, candidate, threshold, options = {}) {
  const inputSegments = splitSegments(inputText);
  const sourceSegments = splitSegments(candidate.text);
  const matches = [];

  inputSegments.forEach((inputSegment) => {
    let bestMatch = null;

    sourceSegments.forEach((sourceSegment) => {
      const scored = scoreTexts(inputSegment.text, sourceSegment.text, options);
      if (!bestMatch || scored.score > bestMatch.score) {
        bestMatch = { ...sourceSegment, ...scored };
      }
    });

    if (bestMatch && bestMatch.score >= threshold) {
      matches.push({
        start: inputSegment.start,
        end: inputSegment.end,
        matchedText: inputSegment.text,
        sourceText: bestMatch.text,
        sourceUrl: candidate.sourceUrl || '',
        sourceTitle: candidate.sourceTitle || candidate.source || '',
        sourceType: candidate.sourceType,
        score: bestMatch.score,
        exactMatchScore: bestMatch.exactMatchScore,
        phraseOverlapScore: bestMatch.phraseOverlapScore,
        wordOverlapScore: bestMatch.wordOverlapScore,
        scoreBasis: bestMatch.scoreBasis,
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

function buildSummary(similarityScore, sources, matches) {
  if (similarityScore < 20) {
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

function serializeSource(source) {
  const reference = findReferenceSource(source);
  return {
    source: source.source || reference?.source || '',
    sourceTitle: reference?.sourceTitle || source.sourceTitle || '',
    sourceUrl: source.sourceUrl || reference?.sourceUrl || '',
    sourceType: source.sourceType || reference?.sourceType || 'database',
    contentId: toId(source.contentId),
    similarity: Math.round(source.similarity || 0),
    snippet: reference ? snippet(reference.text) : source.snippet || '',
    matchedWords: source.matchedWords || 0,
    totalWords: source.totalWords || 0,
    exactMatchScore: Math.round(source.exactMatchScore || 0),
    phraseOverlapScore: Math.round(source.phraseOverlapScore || 0),
    wordOverlapScore: Math.round(source.wordOverlapScore || 0),
    scoreBasis: source.scoreBasis || getScoreBasis(source),
    matchedPhrases: source.matchedPhrases || 0,
    totalPhrases: source.totalPhrases || 0,
  };
}

function serializeMatch(match) {
  const reference = findReferenceSource(match);
  return {
    start: match.start || 0,
    end: match.end || 0,
    matchedText: match.matchedText || '',
    sourceText: match.sourceText || '',
    sourceUrl: match.sourceUrl || reference?.sourceUrl || '',
    sourceTitle: reference?.sourceTitle || match.sourceTitle || '',
    sourceType: match.sourceType || reference?.sourceType || 'database',
    score: Math.round(match.score || 0),
    exactMatchScore: Math.round(match.exactMatchScore || 0),
    phraseOverlapScore: Math.round(match.phraseOverlapScore || 0),
    wordOverlapScore: Math.round(match.wordOverlapScore || 0),
    scoreBasis: match.scoreBasis || getScoreBasis(match),
    matchedWords: match.matchedWords || 0,
    totalWords: match.totalWords || 0,
    matchedPhrases: match.matchedPhrases || 0,
    totalPhrases: match.totalPhrases || 0,
    phraseSize: match.phraseSize || 0,
  };
}

function serializeReport(report) {
  const similarityScore = Math.round(report.similarityScore || 0);
  const originalityScore = Math.round(report.originalityScore || 0);
  const matches = (report.matches || []).map(serializeMatch);
  const sources = (report.sources || []).map(serializeSource);

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
    riskLevel: report.riskLevel,
    matches,
    sources,
    modelUsed: report.modelUsed || MODEL_USED,
    threshold: report.threshold || 35,
    sensitivity: report.sensitivity || 'balanced',
    ignoreCommonPhrases: report.ignoreCommonPhrases !== false,
    sourceConfig: report.sourceConfig || DEFAULT_SOURCE_CONFIG,
    analysis: report.analysis || {},
    summary: buildSummary(similarityScore, sources, matches),
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

function buildAnalysis(scoredSources, candidates, matches, sourceConfig, effectiveThreshold, commonCrawlStats = {}) {
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
    checkedSourceTypes,
    unavailableSourceTypes,
    exactMatchScore: maxScore(scoredSources.map((source) => source.exactMatchScore)),
    phraseOverlapScore: maxScore(scoredSources.map((source) => source.phraseOverlapScore)),
    wordOverlapScore: maxScore(scoredSources.map((source) => source.wordOverlapScore)),
    commonCrawl: {
      enabled: Boolean(commonCrawlStats.enabled),
      status: commonCrawlStats.status || (sourceConfig.web ? 'empty' : 'skipped'),
      indexes: commonCrawlStats.indexes || [],
      queryCount: commonCrawlStats.queryCount || 0,
      recordCount: commonCrawlStats.recordCount || 0,
      fetchedCount: commonCrawlStats.fetchedCount || 0,
      candidateCount: commonCrawlStats.candidateCount || 0,
      patterns: commonCrawlStats.patterns || [],
      error: commonCrawlStats.error || '',
    },
  };
}

async function checkPlagiarism(userId, payload) {
  const sensitivity = payload.sensitivity || 'balanced';
  const sourceConfig = normalizeSourceConfig(payload);
  const threshold = payload.threshold || 35;
  const effectiveThreshold = getEffectiveThreshold(threshold, sensitivity);
  const scoringOptions = {
    ignoreCommonPhrases: payload.ignoreCommonPhrases !== false,
  };
  const { checkText, contentId } = await getCheckText(userId, payload);

  if (!checkText || countWords(checkText) < 5) {
    throw createError(400, 'Text must contain at least 5 words');
  }

  const [databaseCandidates, commonCrawlResult] = await Promise.all([
    sourceConfig.database ? buildDatabaseCandidates(userId, contentId) : Promise.resolve([]),
    sourceConfig.web
      ? commonCrawlService.fetchCommonCrawlCandidates(checkText)
      : Promise.resolve({ candidates: [], stats: { enabled: false, status: 'skipped' } }),
  ]);
  const referenceCandidates = sourceConfig.references ? REFERENCE_SOURCES : [];
  const webCandidates = commonCrawlResult.candidates || [];
  const candidates = [...databaseCandidates, ...referenceCandidates, ...webCandidates];

  const scoredSources = candidates
    .map((candidate) => {
      const textScore = scoreTexts(checkText, candidate.text, scoringOptions);
      const matches = findSegmentMatches(checkText, candidate, effectiveThreshold, scoringOptions);
      const bestSegment = matches[0] || {};
      const bestMatchScore = bestSegment.score || 0;
      const exactMatchScore = Math.max(textScore.exactMatchScore, bestSegment.exactMatchScore || 0);
      const phraseOverlapScore = Math.max(textScore.phraseOverlapScore, bestSegment.phraseOverlapScore || 0);
      const wordOverlapScore = Math.max(textScore.wordOverlapScore, bestSegment.wordOverlapScore || 0);
      const similarity = Math.max(textScore.score, bestMatchScore);

      return {
        ...candidate,
        similarity,
        matchedWords: textScore.matchedWords,
        totalWords: textScore.totalWords,
        exactMatchScore,
        phraseOverlapScore,
        wordOverlapScore,
        scoreBasis: getScoreBasis({ exactMatchScore, phraseOverlapScore, wordOverlapScore }),
        matchedPhrases: textScore.matchedPhrases,
        totalPhrases: textScore.totalPhrases,
        snippet: snippet(candidate.text),
        matches,
      };
    })
    .filter((candidate) => candidate.similarity >= 5 || candidate.matches.length > 0)
    .sort((left, right) => right.similarity - left.similarity);

  const sources = scoredSources.slice(0, MAX_REPORT_SOURCES).map((candidate) => ({
    source: candidate.source,
    sourceTitle: candidate.sourceTitle,
    sourceUrl: candidate.sourceUrl,
    sourceType: candidate.sourceType,
    contentId: candidate.contentId || null,
    similarity: candidate.similarity,
    snippet: candidate.snippet,
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

  const similarityScore = clamp(scoredSources[0]?.similarity || 0);
  const originalityScore = clamp(100 - similarityScore);
  const riskLevel = getRiskLevel(similarityScore);
  const summary = buildSummary(similarityScore, sources, matches);
  const analysis = buildAnalysis(
    scoredSources,
    candidates,
    matches,
    sourceConfig,
    effectiveThreshold,
    commonCrawlResult.stats,
  );

  const report = await PlagiarismReport.create({
    userId,
    contentId,
    checkText,
    similarityScore,
    originalityScore,
    status: 'completed',
    riskLevel,
    matches,
    sources,
    modelUsed: MODEL_USED,
    threshold,
    sensitivity,
    ignoreCommonPhrases: scoringOptions.ignoreCommonPhrases,
    sourceConfig,
    analysis,
    summary,
  });

  return serializeReport(report);
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
  listReports,
  getReport,
};
