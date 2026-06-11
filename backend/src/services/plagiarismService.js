const Content = require('../models/Content');
const PlagiarismReport = require('../models/PlagiarismReport');
const createError = require('../utils/createError');

const MODEL_USED = 'local-ngram-v1';
const MAX_DATABASE_SOURCES = 80;
const MAX_REPORT_SOURCES = 6;
const MAX_REPORT_MATCHES = 12;

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

function tokenize(text) {
  const normalized = normalizeText(text);
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

function scoreTexts(inputText, sourceText) {
  const inputTokens = tokenize(inputText);
  const sourceTokens = tokenize(sourceText);
  if (inputTokens.length < 3 || sourceTokens.length < 3) {
    return { score: 0, matchedWords: 0, totalWords: inputTokens.length };
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
  const ngramContainment = sharedNgrams / Math.max(1, Math.min(inputNgrams.size, sourceNgrams.size));
  const normalizedInput = normalizeText(inputText);
  const normalizedSource = normalizeText(sourceText);
  const exactContainment = normalizedInput.length >= 40 && normalizedSource.includes(normalizedInput)
    ? 1
    : normalizedSource.length >= 40 && normalizedInput.includes(normalizedSource)
      ? 0.92
      : 0;

  const score = Math.max(
    ngramContainment * 100,
    wordContainment * 62,
    jaccard * 78,
    exactContainment * 100,
  );

  return {
    score: clamp(Math.round(score)),
    matchedWords: sharedWords,
    totalWords: inputTokens.length,
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

function findSegmentMatches(inputText, candidate, threshold) {
  const inputSegments = splitSegments(inputText);
  const sourceSegments = splitSegments(candidate.text);
  const matches = [];

  inputSegments.forEach((inputSegment) => {
    let bestMatch = null;

    sourceSegments.forEach((sourceSegment) => {
      const scored = scoreTexts(inputSegment.text, sourceSegment.text);
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
  return {
    source: source.source || '',
    sourceTitle: source.sourceTitle || '',
    sourceUrl: source.sourceUrl || '',
    sourceType: source.sourceType || 'database',
    contentId: toId(source.contentId),
    similarity: Math.round(source.similarity || 0),
    snippet: source.snippet || '',
    matchedWords: source.matchedWords || 0,
    totalWords: source.totalWords || 0,
  };
}

function serializeReport(report) {
  return {
    id: report._id.toString(),
    _id: report._id.toString(),
    userId: toId(report.userId),
    contentId: toId(report.contentId),
    checkText: report.checkText,
    wordCount: report.wordCount || countWords(report.checkText),
    similarityScore: Math.round(report.similarityScore || 0),
    originalityScore: Math.round(report.originalityScore || 0),
    status: report.status,
    riskLevel: report.riskLevel,
    matches: (report.matches || []).map((match) => ({
      start: match.start || 0,
      end: match.end || 0,
      matchedText: match.matchedText || '',
      sourceText: match.sourceText || '',
      sourceUrl: match.sourceUrl || '',
      sourceTitle: match.sourceTitle || '',
      sourceType: match.sourceType || 'database',
      score: Math.round(match.score || 0),
    })),
    sources: (report.sources || []).map(serializeSource),
    modelUsed: report.modelUsed || MODEL_USED,
    threshold: report.threshold || 35,
    summary: report.summary || '',
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

async function checkPlagiarism(userId, payload) {
  const threshold = payload.threshold || 35;
  const { checkText, contentId } = await getCheckText(userId, payload);

  if (!checkText || countWords(checkText) < 5) {
    throw createError(400, 'Text must contain at least 5 words');
  }

  const databaseCandidates = await buildDatabaseCandidates(userId, contentId);
  const referenceCandidates = payload.includeReferences === false ? [] : REFERENCE_SOURCES;
  const candidates = [...databaseCandidates, ...referenceCandidates];

  const scoredSources = candidates
    .map((candidate) => {
      const textScore = scoreTexts(checkText, candidate.text);
      const matches = findSegmentMatches(checkText, candidate, threshold);
      const bestMatchScore = matches[0]?.score || 0;
      const similarity = Math.max(textScore.score, bestMatchScore);

      return {
        ...candidate,
        similarity,
        matchedWords: textScore.matchedWords,
        totalWords: textScore.totalWords,
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
