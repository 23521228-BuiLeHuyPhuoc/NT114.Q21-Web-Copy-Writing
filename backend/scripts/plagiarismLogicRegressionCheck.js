const assert = require('assert');

const commonCrawlService = require('../src/services/commonCrawlService');
const crossLanguageSearchService = require('../src/services/crossLanguageSearchService');
const { serializeReport, __test } = require('../src/services/plagiarismService');

const DEFAULT_THRESHOLD = 35;
const cases = [];

function test(name, callback) {
  try {
    callback();
    cases.push({ name, status: 'passed' });
  } catch (error) {
    cases.push({ name, status: 'failed', error: error.message });
  }
}

function candidate(text, overrides = {}) {
  return {
    source: overrides.source || 'fixture-source',
    sourceTitle: overrides.sourceTitle || 'Fixture source',
    sourceUrl: overrides.sourceUrl || 'https://example.com/source',
    sourceType: overrides.sourceType || 'web',
    text,
  };
}

function fakeReport(overrides = {}) {
  const checkText = overrides.checkText || 'default plagiarism fixture with enough words for validation';
  return {
    _id: { toString: () => overrides.id || 'logic-regression-report' },
    userId: null,
    contentId: null,
    checkText,
    wordCount: checkText.trim().split(/\s+/).filter(Boolean).length,
    similarityScore: 0,
    originalityScore: 100,
    status: 'completed',
    riskLevel: 'safe',
    matches: [],
    topicMatches: [],
    sources: [],
    modelUsed: 'hybrid-ngram-embedding-v1',
    threshold: DEFAULT_THRESHOLD,
    sensitivity: 'balanced',
    ignoreCommonPhrases: false,
    ignoredPhrases: [],
    sourceConfig: { database: false, references: false, web: true, uploads: false },
    analysis: {
      effectiveThreshold: DEFAULT_THRESHOLD,
      candidateCount: 0,
      sourceCount: 0,
      matchCount: 0,
      topicMatchCount: 0,
      checkedSourceTypes: ['web'],
      unavailableSourceTypes: [],
      plagiarismScore: 0,
      topicSimilarityScore: 0,
      exactMatchScore: 0,
      phraseOverlapScore: 0,
      wordOverlapScore: 0,
      embeddingSimilarityScore: 0,
      embeddingPlagiarismScore: 0,
      embedding: {
        enabled: true,
        status: 'ok',
        provider: 'gemini',
        model: 'gemini-embedding-001',
        candidateCount: 0,
        comparedCount: 0,
        maxSimilarityScore: 0,
        maxPlagiarismScore: 0,
        minSimilarity: 82,
        error: '',
      },
      commonCrawl: { enabled: true, status: 'empty', candidateCount: 0 },
    },
    summary: '',
    createdAt: new Date(0),
    updatedAt: new Date(0),
    ...overrides,
  };
}

const vietnameseOriginal = 'Trí tuệ nhân tạo đang dần thay đổi cách sinh viên học tập và tiếp cận kiến thức. Thay vì chỉ tìm kiếm thông tin trong sách, người học có thể sử dụng các công cụ thông minh để giải thích khái niệm, tạo bài tập và nhận phản hồi nhanh chóng. Tuy nhiên, trí tuệ nhân tạo chỉ nên đóng vai trò hỗ trợ, không thể thay thế hoàn toàn tư duy độc lập.';
const englishTranslation = 'Artificial intelligence is gradually changing how students learn and access knowledge. Instead of searching for information only in books, learners can use intelligent tools to explain concepts, generate exercises, and receive rapid feedback. However, artificial intelligence should serve only as a supporting tool and cannot completely replace independent thinking.';

test('normalized exact copy ignores case and punctuation differences', () => {
  const input = 'Nội dung chất lượng giúp khách hàng hiểu rõ lợi ích sản phẩm và đưa ra quyết định phù hợp.';
  const source = 'Mở đầu khác. NỘI DUNG, CHẤT LƯỢNG giúp khách hàng hiểu rõ lợi ích sản phẩm và đưa ra quyết định phù hợp!';
  const score = __test.scoreTexts(input, source, { ignoreCommonPhrases: false });

  assert.strictEqual(score.exactMatchScore, 100);
  assert.strictEqual(score.plagiarismScore, 100);
  assert.strictEqual(score.scoreBasis, 'exact');
});

test('partial copied sentence creates one match with correct offsets', () => {
  const copied = 'Doanh nghiệp cần xây dựng thông điệp rõ ràng để khách hàng hiểu đúng giá trị của sản phẩm.';
  const input = `Phần mở đầu hoàn toàn độc lập và cung cấp bối cảnh mới. ${copied} Phần kết luận đưa ra một đề xuất khác cho chiến dịch.`;
  const source = `Đoạn giới thiệu của nguồn không liên quan. ${copied} Nội dung cuối nguồn nói về kế hoạch triển khai.`;
  const matches = __test.findSegmentMatches(input, candidate(source), DEFAULT_THRESHOLD, { ignoreCommonPhrases: false });

  assert.strictEqual(matches.length, 1);
  assert(matches[0].matchedText.includes('Doanh nghiệp cần xây dựng thông điệp rõ ràng'));
  assert.strictEqual(input.slice(matches[0].start, matches[0].end).trim(), matches[0].matchedText);
  assert.strictEqual(matches[0].score, 100);
});

test('phrase score near the boundary respects strict, balanced, and lenient thresholds', () => {
  const input = 'alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu';
  const source = 'alpha beta gamma delta epsilon zeta eta one two three four five';
  const score = __test.scoreTexts(input, source, { ignoreCommonPhrases: false });
  const sourceCandidate = candidate(source);
  const strictThreshold = __test.getEffectiveThreshold(35, 'strict');
  const balancedThreshold = __test.getEffectiveThreshold(35, 'balanced');
  const lenientThreshold = __test.getEffectiveThreshold(35, 'lenient');

  assert.strictEqual(score.phraseOverlapScore, 38);
  assert.strictEqual(score.plagiarismScore, 38);
  assert.strictEqual(strictThreshold, 25);
  assert.strictEqual(balancedThreshold, 35);
  assert.strictEqual(lenientThreshold, 45);
  assert.strictEqual(__test.findSegmentMatches(input, sourceCandidate, strictThreshold, { ignoreCommonPhrases: false }).length, 1);
  assert.strictEqual(__test.findSegmentMatches(input, sourceCandidate, balancedThreshold, { ignoreCommonPhrases: false }).length, 1);
  assert.strictEqual(__test.findSegmentMatches(input, sourceCandidate, lenientThreshold, { ignoreCommonPhrases: false }).length, 0);
});

test('same keywords in reverse order remain topic similarity, not plagiarism', () => {
  const input = 'alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu';
  const source = 'mu lambda kappa iota theta eta zeta epsilon delta gamma beta alpha';
  const score = __test.scoreTexts(input, source, { ignoreCommonPhrases: false });
  const plagiarismMatches = __test.findSegmentMatches(input, candidate(source), DEFAULT_THRESHOLD, { ignoreCommonPhrases: false });
  const topicMatches = __test.findTopicSegmentMatches(input, candidate(source), DEFAULT_THRESHOLD, { ignoreCommonPhrases: false });

  assert.strictEqual(score.plagiarismScore, 0);
  assert(score.topicSimilarityScore >= 70);
  assert.strictEqual(plagiarismMatches.length, 0);
  assert.strictEqual(topicMatches.length, 1);
});

test('same subject with different wording does not become plagiarism', () => {
  const input = 'Nền tảng trí tuệ nhân tạo hỗ trợ doanh nghiệp chăm sóc khách hàng và tự động hóa quy trình phản hồi.';
  const source = 'Công ty sử dụng phần mềm thông minh để vận hành dịch vụ người dùng, phân loại yêu cầu và giảm thời gian xử lý.';
  const score = __test.scoreTexts(input, source, { ignoreCommonPhrases: false });

  assert(score.plagiarismScore < DEFAULT_THRESHOLD);
  assert.strictEqual(__test.findSegmentMatches(input, candidate(source), DEFAULT_THRESHOLD, { ignoreCommonPhrases: false }).length, 0);
});

test('unrelated documents do not produce plagiarism or topic matches', () => {
  const input = 'Hệ thống phân tích dữ liệu bán hàng để dự báo nhu cầu và tối ưu tồn kho cho doanh nghiệp.';
  const source = 'Những ngọn núi phủ tuyết tạo nên cảnh quan yên tĩnh cho hành trình khám phá thiên nhiên mùa đông.';
  const score = __test.scoreTexts(input, source, { ignoreCommonPhrases: false });

  assert.strictEqual(score.plagiarismScore, 0);
  assert(score.topicSimilarityScore < DEFAULT_THRESHOLD);
  assert.strictEqual(__test.findSegmentMatches(input, candidate(source), DEFAULT_THRESHOLD, { ignoreCommonPhrases: false }).length, 0);
  assert.strictEqual(__test.findTopicSegmentMatches(input, candidate(source), DEFAULT_THRESHOLD, { ignoreCommonPhrases: false }).length, 0);
});

test('built-in CTA phrases can be fully excluded from scoring', () => {
  const text = 'mua ngay dat hang ngay xem chi tiet lien he ngay nhan tin tu van mien phi freeship uu dai khuyen mai giam gia so luong co han hang chinh hang chat luong cao doi tra de dang bao hanh chinh hang';
  const included = __test.scoreTexts(text, text, { ignoreCommonPhrases: false });
  const ignored = __test.scoreTexts(text, text, { ignoreCommonPhrases: true });

  assert.strictEqual(included.plagiarismScore, 100);
  assert.strictEqual(ignored.plagiarismScore, 0);
});

test('custom ignored paragraph removes an otherwise exact copy', () => {
  const text = 'Đại sứ văn hóa đọc giúp học sinh hình thành thói quen sử dụng thư viện xanh mỗi ngày.';
  const baseline = __test.scoreTexts(text, text, { ignoreCommonPhrases: false });
  const ignored = __test.scoreTexts(text, text, { ignoreCommonPhrases: false, ignoredPhrases: [text] });

  assert.strictEqual(baseline.plagiarismScore, 100);
  assert.strictEqual(ignored.plagiarismScore, 0);
});

test('multilingual Gemini cosine detects a translated copy without lexical overlap', () => {
  const score = __test.applyEmbeddingScore({
    exactMatchScore: 0,
    phraseOverlapScore: 0,
    wordOverlapScore: 0,
    plagiarismScore: 0,
    score: 0,
  }, 0.9241, 'gemini');

  assert.strictEqual(score.embeddingSimilarityScore, 92);
  assert.strictEqual(score.embeddingPlagiarismScore, 50);
  assert.strictEqual(score.plagiarismScore, 50);
  assert.strictEqual(score.scoreBasis, 'embedding');
  assert.strictEqual(__test.shouldUseDocumentLevelMatch(score, DEFAULT_THRESHOLD), true);
});

test('multilingual cosine below the configured minimum is not plagiarism', () => {
  const score = __test.applyEmbeddingScore({
    exactMatchScore: 0,
    phraseOverlapScore: 0,
    wordOverlapScore: 0,
    plagiarismScore: 0,
    score: 0,
  }, 0.814, 'gemini');

  assert.strictEqual(score.embeddingSimilarityScore, 81);
  assert.strictEqual(score.embeddingPlagiarismScore, 0);
  assert.strictEqual(score.plagiarismScore, 0);
  assert.strictEqual(__test.shouldUseDocumentLevelMatch(score, DEFAULT_THRESHOLD), false);
});

test('embedding minimum is only a signal gate, not an automatic plagiarism verdict', () => {
  const score = __test.applyEmbeddingScore({
    exactMatchScore: 0,
    phraseOverlapScore: 0,
    wordOverlapScore: 0,
    plagiarismScore: 0,
    score: 0,
  }, 0.824, 'gemini');

  assert.strictEqual(score.embeddingSimilarityScore, 82);
  assert.strictEqual(score.embeddingPlagiarismScore, 25);
  assert(score.plagiarismScore < DEFAULT_THRESHOLD);
  assert.strictEqual(__test.shouldUseDocumentLevelMatch(score, DEFAULT_THRESHOLD), false);
});

test('local feature fallback cannot claim cross-language plagiarism without lexical support', () => {
  const score = __test.applyEmbeddingScore({
    exactMatchScore: 0,
    phraseOverlapScore: 0,
    wordOverlapScore: 0,
    plagiarismScore: 0,
    score: 0,
  }, 0.9241, 'local');

  assert.strictEqual(score.embeddingSimilarityScore, 92);
  assert(score.embeddingPlagiarismScore < DEFAULT_THRESHOLD);
  assert.strictEqual(score.plagiarismScore, score.embeddingPlagiarismScore);
});

test('embedding evidence augments rather than erases lexical plagiarism evidence', () => {
  const lexical = __test.scoreTexts(
    'alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu',
    'alpha beta gamma delta epsilon zeta eta one two three four five',
    { ignoreCommonPhrases: false },
  );
  const combined = __test.applyEmbeddingScore(lexical, 0.9, 'gemini');

  assert(combined.plagiarismScore >= lexical.plagiarismScore);
  assert(combined.phraseOverlapScore === lexical.phraseOverlapScore);
});

test('embedding chunks cover a translated passage inside a long source', () => {
  const padding = 'Nông nghiệp bền vững cần quản lý đất nước giống cây và chuỗi cung ứng theo điều kiện địa phương. ';
  const marker = 'Trí tuệ nhân tạo thay đổi cách sinh viên học tập và tiếp cận kiến thức trong môi trường số.';
  const source = `${padding.repeat(35)} ${marker} ${padding.repeat(35)}`;
  const chunks = __test.buildEmbeddingChunks(source, 12);

  assert(chunks.length > 1);
  assert(chunks.length <= 12);
  assert(chunks.some((chunk) => chunk.includes(marker)));
});

test('embedding-only evidence survives report serialization', () => {
  const embeddingScore = __test.applyEmbeddingScore({
    exactMatchScore: 0,
    phraseOverlapScore: 0,
    wordOverlapScore: 0,
    plagiarismScore: 0,
    score: 0,
    matchedWords: 0,
    totalWords: englishTranslation.split(/\s+/).length,
    matchedPhrases: 0,
    totalPhrases: 0,
    phraseSize: 0,
  }, 0.9241, 'gemini');
  const report = serializeReport(fakeReport({
    checkText: englishTranslation,
    similarityScore: embeddingScore.plagiarismScore,
    originalityScore: 100 - embeddingScore.plagiarismScore,
    riskLevel: 'high',
    matches: [{
      start: 0,
      end: englishTranslation.length,
      matchedText: englishTranslation,
      sourceText: vietnameseOriginal,
      sourceUrl: 'https://example.com/vi-source',
      sourceTitle: 'Vietnamese source',
      sourceType: 'web',
      score: embeddingScore.plagiarismScore,
      ...embeddingScore,
    }],
    sources: [{
      source: 'vi-source',
      sourceTitle: 'Vietnamese source',
      sourceUrl: 'https://example.com/vi-source',
      sourceType: 'web',
      similarity: embeddingScore.score,
      plagiarismScore: embeddingScore.plagiarismScore,
      topicSimilarityScore: 0,
      sourceText: vietnameseOriginal,
      snippet: vietnameseOriginal,
      ...embeddingScore,
    }],
    analysis: {
      ...fakeReport().analysis,
      candidateCount: 1,
      sourceCount: 1,
      matchCount: 1,
      plagiarismScore: embeddingScore.plagiarismScore,
      embeddingSimilarityScore: embeddingScore.embeddingSimilarityScore,
      embeddingPlagiarismScore: embeddingScore.embeddingPlagiarismScore,
      embedding: {
        ...fakeReport().analysis.embedding,
        candidateCount: 1,
        comparedCount: 1,
        maxSimilarityScore: embeddingScore.embeddingSimilarityScore,
        maxPlagiarismScore: embeddingScore.embeddingPlagiarismScore,
      },
    },
  }));

  assert.strictEqual(report.similarityScore, 50);
  assert.strictEqual(report.originalityScore, 50);
  assert.strictEqual(report.riskLevel, 'high');
  assert.strictEqual(report.matches.length, 1);
  assert.strictEqual(report.matches[0].scoreBasis, 'embedding');
});

test('topic-only evidence keeps originality at 100 percent', () => {
  const input = 'alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu';
  const source = 'mu lambda kappa iota theta eta zeta epsilon delta gamma beta alpha';
  const lexical = __test.scoreTexts(input, source, { ignoreCommonPhrases: false });
  const topicMatch = __test.findTopicSegmentMatches(input, candidate(source), DEFAULT_THRESHOLD, { ignoreCommonPhrases: false })[0];
  const report = serializeReport(fakeReport({
    checkText: input,
    topicMatches: [topicMatch],
    sources: [{
      source: 'topic-source',
      sourceTitle: 'Topic source',
      sourceUrl: 'https://example.com/topic',
      sourceType: 'web',
      similarity: lexical.score,
      plagiarismScore: lexical.plagiarismScore,
      topicSimilarityScore: lexical.topicSimilarityScore,
      sourceText: source,
      snippet: source,
      ...lexical,
    }],
    analysis: {
      ...fakeReport().analysis,
      candidateCount: 1,
      sourceCount: 1,
      topicMatchCount: 1,
      topicSimilarityScore: lexical.topicSimilarityScore,
      wordOverlapScore: lexical.wordOverlapScore,
    },
  }));

  assert.strictEqual(report.similarityScore, 0);
  assert.strictEqual(report.originalityScore, 100);
  assert.strictEqual(report.matches.length, 0);
  assert.strictEqual(report.topicMatches.length, 1);
});

test('missing comparison sources never produce a false safe conclusion', () => {
  const report = serializeReport(fakeReport());
  assert(report.summary.includes('Chưa nạp được nguồn'));
});

test('Vietnamese and English retrieval language detection covers accented and plain text', () => {
  assert.strictEqual(crossLanguageSearchService.__test.detectLanguage(vietnameseOriginal), 'vi');
  assert.strictEqual(
    crossLanguageSearchService.__test.detectLanguage('tri tue nhan tao dang thay doi cach sinh vien hoc tap va tiep can kien thuc'),
    'vi',
  );
  assert.strictEqual(crossLanguageSearchService.__test.detectLanguage(englishTranslation), 'en');
  assert.strictEqual(crossLanguageSearchService.__test.detectLanguage('人工知能は学習方法を変えています'), 'unknown');
});

test('bilingual query plans always run original and translated languages in order', () => {
  const plans = commonCrawlService.__test.interleaveQueryPlans(
    ['english query one', 'english query two'],
    ['truy van tieng viet mot', 'truy van tieng viet hai'],
    'en',
    'vi',
  );

  assert.deepStrictEqual(
    plans.map((plan) => `${plan.language}:${plan.translated ? 'translated' : 'original'}`),
    ['en:original', 'vi:translated', 'en:original', 'vi:translated'],
  );
});

test('bilingual result balancing prevents one language from occupying every URL slot', () => {
  const results = commonCrawlService.__test.interleaveSearchResultGroups([
    [
      { url: 'https://en.example/1' },
      { url: 'https://en.example/2' },
      { url: 'https://en.example/3' },
    ],
    [
      { url: 'https://vi.example/1' },
      { url: 'https://en.example/1' },
      { url: 'https://vi.example/2' },
    ],
  ], 5);

  assert.deepStrictEqual(results.map((item) => item.url), [
    'https://en.example/1',
    'https://vi.example/1',
    'https://en.example/2',
    'https://en.example/3',
    'https://vi.example/2',
  ]);
});

test('translated search query generation keeps a distinctive phrase', () => {
  const queries = commonCrawlService.__test.buildSearchQueries(vietnameseOriginal);
  assert(queries.length > 0);
  assert(queries[0].toLowerCase().includes('trí tuệ nhân tạo'));
});

const failures = cases.filter((item) => item.status === 'failed');
console.log(JSON.stringify({
  passed: cases.length - failures.length,
  failed: failures.length,
  cases,
}, null, 2));

if (failures.length > 0) process.exitCode = 1;
