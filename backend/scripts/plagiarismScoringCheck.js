const assert = require('assert');
const { serializeReport, __test } = require('../src/services/plagiarismService');

const scoringOptions = { ignoreCommonPhrases: true };
const threshold = 35;
const specialCases = [];

function normalizeForAssert(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0111/g, 'd')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function assertContainsNormalized(text, expected, message) {
  assert(
    normalizeForAssert(text).includes(normalizeForAssert(expected)),
    message,
  );
}

function assertNotContainsNormalized(text, forbidden, message) {
  assert(
    !normalizeForAssert(text).includes(normalizeForAssert(forbidden)),
    message,
  );
}

function runSpecialCase(name, callback) {
  callback();
  specialCases.push(name);
}

function fakeReport(overrides = {}) {
  const checkText = overrides.checkText || '';
  return {
    _id: { toString: () => overrides.id || 'fake-report' },
    userId: null,
    contentId: null,
    checkText,
    wordCount: checkText.trim().split(/\s+/).filter(Boolean).length,
    similarityScore: 100,
    originalityScore: 0,
    status: 'completed',
    riskLevel: 'critical',
    matches: [],
    topicMatches: [],
    sources: [],
    modelUsed: 'local-ngram-v1',
    threshold,
    sensitivity: 'balanced',
    ignoreCommonPhrases: true,
    ignoredPhrases: [],
    sourceConfig: { database: false, references: true, web: false, uploads: false },
    analysis: {
      effectiveThreshold: threshold,
      candidateCount: 1,
      sourceCount: 1,
      matchCount: 1,
      topicMatchCount: 0,
      checkedSourceTypes: ['web'],
      unavailableSourceTypes: [],
      plagiarismScore: 100,
      topicSimilarityScore: 62,
      exactMatchScore: 100,
      phraseOverlapScore: 100,
      wordOverlapScore: 62,
      commonCrawl: { enabled: false, status: 'skipped' },
    },
    summary: 'Old high-risk summary should be rebuilt',
    createdAt: new Date(0),
    updatedAt: new Date(0),
    ...overrides,
  };
}

const selfWritten = '9Router giúp gom cấu hình AI coding tool về một endpoint nội bộ. Khi người dùng gửi request, gateway chọn provider phù hợp, áp chính sách khóa và ghi log để dễ kiểm soát chi phí.';
const sameTopicSource = '9Router là proxy AI cho các công cụ code, hỗ trợ route request sang nhiều provider như OpenAI, Codex hoặc OpenRouter. Người dùng có thể trỏ tool vào gateway để quản lý model, api key và subscription.';

const topicScore = __test.scoreTexts(selfWritten, sameTopicSource, scoringOptions);
const topicMatches = __test.findSegmentMatches(
  selfWritten,
  { text: sameTopicSource, sourceTitle: 'Same topic source', sourceType: 'web' },
  threshold,
  scoringOptions,
);

assert(topicScore.topicSimilarityScore >= topicScore.plagiarismScore, 'topic overlap should not become plagiarism score');
assert(topicScore.plagiarismScore < threshold, 'same-topic text should stay below plagiarism threshold');
assert.strictEqual(topicMatches.length, 0, 'same-topic text should not create highlighted plagiarism matches');

const keywordHeavyInput = 'alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu';
const keywordHeavySource = 'mu lambda kappa iota theta eta zeta epsilon delta gamma beta alpha';
const keywordScore = __test.scoreTexts(keywordHeavyInput, keywordHeavySource, scoringOptions);
const keywordMatches = __test.findSegmentMatches(
  keywordHeavyInput,
  { text: keywordHeavySource, sourceTitle: 'Keyword-heavy source', sourceType: 'web' },
  threshold,
  scoringOptions,
);
const keywordTopicMatches = __test.findTopicSegmentMatches(
  keywordHeavyInput,
  { text: keywordHeavySource, sourceTitle: 'Keyword-heavy source', sourceType: 'web' },
  threshold,
  scoringOptions,
);

assert(keywordScore.topicSimilarityScore >= 50, 'keyword-heavy text should exercise high word overlap');
assert(keywordScore.plagiarismScore < threshold, 'high word overlap without n-gram/exact should not be plagiarism');
assert.strictEqual(keywordMatches.length, 0, 'high word overlap alone should not create highlighted matches');
assert(keywordTopicMatches.length > 0, 'high word overlap should create topic-similarity matches');

const copied = '9Router hoạt động bằng cách trỏ tool vào gateway rồi route request sang provider phù hợp, giúp quản lý model, khóa truy cập và chi phí tập trung.';
const copiedSource = `Phần hướng dẫn ghi rằng ${copied} Nội dung này được dùng làm ví dụ kiểm tra copy nguyên văn.`;
const copiedScore = __test.scoreTexts(copied, copiedSource, scoringOptions);
const copiedMatches = __test.findSegmentMatches(
  copied,
  { text: copiedSource, sourceTitle: 'Copied source', sourceType: 'web' },
  threshold,
  scoringOptions,
);
const copiedMatchesAfterIgnoringMatchedText = __test.findSegmentMatches(
  copied,
  { text: copiedSource, sourceTitle: 'Copied source', sourceType: 'web' },
  threshold,
  { ...scoringOptions, ignoredPhrases: [copiedMatches[0]?.matchedText || copied] },
);

assert(copiedScore.plagiarismScore >= threshold, 'copied text should exceed plagiarism threshold');
assert(copiedMatches.length > 0, 'copied text should create highlighted plagiarism matches');
assert.strictEqual(
  copiedMatchesAfterIgnoringMatchedText.length,
  0,
  'pasting the detected matched text into ignored phrases should remove that plagiarism match on recheck',
);

const customPhraseInput = 'dai su van hoa doc dai su van hoa doc hoc sinh lop bon yeu thu vien xanh';
const customPhraseSource = 'dai su van hoa doc dai su van hoa doc phat dong phong trao thieu nhi doc sach';
const customPhraseBaseline = __test.scoreTexts(customPhraseInput, customPhraseSource, scoringOptions);
const customPhraseIgnored = __test.scoreTexts(customPhraseInput, customPhraseSource, {
  ...scoringOptions,
  ignoredPhrases: ['dai su van hoa doc'],
});
const customPhraseIgnoredWithCommonOff = __test.scoreTexts(customPhraseInput, customPhraseSource, {
  ignoreCommonPhrases: false,
  ignoredPhrases: ['dai su van hoa doc'],
});

assert(
  customPhraseIgnored.plagiarismScore < customPhraseBaseline.plagiarismScore,
  'custom ignored phrase should reduce plagiarism score for repeated allowed phrases',
);
assert(
  customPhraseIgnoredWithCommonOff.plagiarismScore < customPhraseBaseline.plagiarismScore,
  'custom ignored phrase should still work when built-in common phrase ignore is disabled',
);

const longIgnoredSegment = 'alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu nu xi omicron pi rho sigma tau upsilon phi chi psi omega repeated allowed campaign paragraph with enough words to exceed one hundred and twenty characters';
const longSegmentSource = `source intro ${longIgnoredSegment} source outro`;
const longSegmentBaseline = __test.scoreTexts(longIgnoredSegment, longSegmentSource, scoringOptions);
const longSegmentIgnored = __test.scoreTexts(longIgnoredSegment, longSegmentSource, {
  ...scoringOptions,
  ignoredPhrases: [longIgnoredSegment],
});

const punctuatedIgnoredSegment = 'mua sách hôm nay, nhận ưu đãi; giao hàng nhanh. đổi trả dễ dàng';
const punctuatedIgnoredSource = `nguồn ghi rõ ${punctuatedIgnoredSegment} trong phần mô tả chiến dịch`;
const punctuatedIgnoredScore = __test.scoreTexts(punctuatedIgnoredSegment, punctuatedIgnoredSource, {
  ...scoringOptions,
  ignoredPhrases: [punctuatedIgnoredSegment],
});
const punctuatedIgnoredMatches = __test.findSegmentMatches(
  punctuatedIgnoredSegment,
  { text: punctuatedIgnoredSource, sourceTitle: 'Punctuated ignored source', sourceType: 'web' },
  threshold,
  { ...scoringOptions, ignoredPhrases: [punctuatedIgnoredSegment] },
);

assert(longIgnoredSegment.length > 120, 'long ignored segment fixture should exceed the old limit');
assert(longSegmentBaseline.plagiarismScore >= threshold, 'long copied segment should exceed plagiarism threshold before ignoring');
assert.strictEqual(longSegmentIgnored.plagiarismScore, 0, 'long ignored segment should be removed from plagiarism scoring');
assert.strictEqual(
  punctuatedIgnoredScore.plagiarismScore,
  0,
  'ignored phrase with comma, semicolon, and period should stay one ignored segment',
);
assert.strictEqual(
  punctuatedIgnoredMatches.length,
  0,
  'ignored phrase with comma, semicolon, and period should not create segment matches',
);

const serializedFullIgnoredReport = serializeReport({
  _id: { toString: () => 'full-ignored-report' },
  userId: null,
  contentId: null,
  checkText: punctuatedIgnoredSegment,
  wordCount: 12,
  similarityScore: 100,
  originalityScore: 0,
  status: 'completed',
  riskLevel: 'critical',
  matches: [{
    start: 0,
    end: punctuatedIgnoredSegment.length,
    matchedText: punctuatedIgnoredSegment,
    sourceText: punctuatedIgnoredSource,
    sourceUrl: '',
    sourceTitle: 'Stored source before ignore filtering',
    sourceType: 'web',
    score: 100,
    exactMatchScore: 100,
    phraseOverlapScore: 100,
    wordOverlapScore: 62,
    scoreBasis: 'exact',
    matchedWords: 12,
    totalWords: 12,
    matchedPhrases: 8,
    totalPhrases: 8,
    phraseSize: 3,
  }],
  topicMatches: [],
  sources: [{
    source: 'stored-source',
    sourceTitle: 'Stored source before ignore filtering',
    sourceUrl: '',
    sourceType: 'web',
    similarity: 100,
    plagiarismScore: 100,
    topicSimilarityScore: 62,
    snippet: punctuatedIgnoredSource,
    sourceText: punctuatedIgnoredSource,
    matchedWords: 12,
    totalWords: 12,
    exactMatchScore: 100,
    phraseOverlapScore: 100,
    wordOverlapScore: 62,
    scoreBasis: 'exact',
    matchedPhrases: 8,
    totalPhrases: 8,
  }],
  modelUsed: 'local-ngram-v1',
  threshold,
  sensitivity: 'balanced',
  ignoreCommonPhrases: true,
  ignoredPhrases: [punctuatedIgnoredSegment],
  sourceConfig: { database: false, references: true, web: false, uploads: false },
  analysis: {
    effectiveThreshold: threshold,
    candidateCount: 1,
    sourceCount: 1,
    matchCount: 1,
    topicMatchCount: 0,
    checkedSourceTypes: ['web'],
    unavailableSourceTypes: [],
    plagiarismScore: 100,
    topicSimilarityScore: 62,
    exactMatchScore: 100,
    phraseOverlapScore: 100,
    wordOverlapScore: 62,
    commonCrawl: { enabled: false, status: 'skipped' },
  },
  summary: 'Old high-risk summary should be rebuilt',
  createdAt: new Date(0),
  updatedAt: new Date(0),
});

assert.strictEqual(serializedFullIgnoredReport.matches.length, 0, 'serialized old report should hide fully ignored matches');
assert.strictEqual(serializedFullIgnoredReport.sources.length, 0, 'serialized old report should hide sources after fully ignored matches disappear');
assert.strictEqual(serializedFullIgnoredReport.similarityScore, 0, 'serialized old report should recalculate plagiarism score to zero');
assert.strictEqual(serializedFullIgnoredReport.originalityScore, 100, 'serialized old report should recalculate originality to 100');
assert.strictEqual(serializedFullIgnoredReport.riskLevel, 'safe', 'serialized old report should downgrade risk to safe');
assert.strictEqual(
  serializedFullIgnoredReport.summary,
  'Không còn đoạn nào vượt ngưỡng sau khi áp dụng danh sách bỏ qua.',
  'serialized old report should rebuild the summary after ignored phrases are applied',
);

const vietnameseIgnoredPhrase = 'đại sứ văn hóa đọc';
const vietnameseMixedInput = 'Đại sứ văn hóa đọc giúp học sinh yêu thư viện xanh mỗi ngày.';
const vietnameseMixedSource = 'Đại sứ văn hóa đọc giúp học sinh yêu thư viện xanh mỗi ngày.';
const vietnameseMixedMatches = __test.findSegmentMatches(
  vietnameseMixedInput,
  { text: vietnameseMixedSource, sourceTitle: 'Vietnamese ignored display source', sourceType: 'web' },
  threshold,
  { ...scoringOptions, ignoredPhrases: [vietnameseIgnoredPhrase] },
);

assert(vietnameseMixedMatches.length > 0, 'remaining copied text should still create a match');
assert(
  !vietnameseMixedMatches[0].matchedText.toLowerCase().includes(vietnameseIgnoredPhrase),
  'matched text should not display the ignored Vietnamese phrase as plagiarism',
);
const filteredSourcePreview = __test.removeIgnoredPhrasesForDisplay(
  vietnameseMixedSource,
  { ...scoringOptions, ignoredPhrases: [vietnameseIgnoredPhrase] },
);
assert(
  !filteredSourcePreview.toLowerCase().includes(vietnameseIgnoredPhrase),
  'source preview should not display the ignored Vietnamese phrase as plagiarism',
);

runSpecialCase('strip ignores case, accents, punctuation, and spacing', () => {
  const text = 'Mo dau: ĐẠI-SỨ   VĂN, HÓA ĐỌC giúp học sinh đọc sách mỗi ngày.';
  const stripped = __test.stripIgnoredSegments(text, {
    ignoreCommonPhrases: false,
    ignoredPhrases: ['đại sứ văn hóa đọc'],
  });

  assertNotContainsNormalized(stripped, 'dai su van hoa doc', 'accented ignored phrase should be stripped');
  assertContainsNormalized(stripped, 'giup hoc sinh doc sach moi ngay', 'remaining text should stay after accented strip');
});

runSpecialCase('strip removes every repeated occurrence', () => {
  const text = 'alpha beta campaign\nALPHA    beta campaign\talpha, beta campaign kept words';
  const stripped = __test.stripIgnoredSegments(text, {
    ignoreCommonPhrases: false,
    ignoredPhrases: ['alpha beta campaign'],
  });

  assertNotContainsNormalized(stripped, 'alpha beta campaign', 'all repeated ignored phrases should be removed');
  assertContainsNormalized(stripped, 'kept words', 'non-ignored tail should remain');
});

runSpecialCase('preserveLength masks ignored ranges without moving offsets', () => {
  const text = 'before alpha beta gamma after';
  const masked = __test.stripIgnoredSegments(text, {
    ignoreCommonPhrases: false,
    ignoredPhrases: ['alpha beta gamma'],
    preserveLength: true,
  });

  assert.strictEqual(masked.length, text.length, 'masked text should keep original length');
  assert.strictEqual(masked.indexOf('after'), text.indexOf('after'), 'masked text should keep later offsets stable');
  assert.strictEqual(masked.slice(7, 23).trim(), '', 'ignored range should be replaced by spaces');
});

runSpecialCase('partial token sequence is not ignored', () => {
  const text = 'alpha beta gamma delta remains';
  const stripped = __test.stripIgnoredSegments(text, {
    ignoreCommonPhrases: false,
    ignoredPhrases: ['alpha beta gamma epsilon'],
  });

  assert.strictEqual(stripped, text, 'near-miss ignored phrase should not remove unrelated text');
});

runSpecialCase('custom ignored phrase still works when common phrase ignore is disabled', () => {
  const text = 'mua ngay custom allowed phrase should vanish';
  const stripped = __test.stripIgnoredSegments(text, {
    ignoreCommonPhrases: false,
    ignoredPhrases: ['custom allowed phrase should vanish'],
  });

  assertContainsNormalized(stripped, 'mua ngay', 'common CTA should remain when common ignore is disabled');
  assertNotContainsNormalized(stripped, 'custom allowed phrase should vanish', 'custom phrase should still be removed');
});

runSpecialCase('common phrase toggle only controls built-in phrases', () => {
  const text = 'mua ngay de nhan uu dai va doc noi dung rieng';
  const commonOn = __test.stripIgnoredSegments(text, { ignoreCommonPhrases: true, ignoredPhrases: [] });
  const commonOff = __test.stripIgnoredSegments(text, { ignoreCommonPhrases: false, ignoredPhrases: [] });

  assertNotContainsNormalized(commonOn, 'mua ngay', 'built-in CTA should be stripped when enabled');
  assertNotContainsNormalized(commonOn, 'uu dai', 'built-in offer phrase should be stripped when enabled');
  assertContainsNormalized(commonOff, 'mua ngay', 'built-in CTA should remain when disabled');
  assertContainsNormalized(commonOff, 'uu dai', 'built-in offer phrase should remain when disabled');
});

runSpecialCase('long custom phrase wins over shorter built-in overlap', () => {
  const text = 'mua sach hom nay nhan uu dai doc quyen cho thanh vien than thiet va noi dung con lai';
  const stripped = __test.stripIgnoredSegments(text, {
    ignoreCommonPhrases: true,
    ignoredPhrases: ['mua sach hom nay nhan uu dai doc quyen cho thanh vien than thiet'],
  });

  assertNotContainsNormalized(stripped, 'doc quyen cho thanh vien than thiet', 'long custom phrase should be removed as one segment');
  assertContainsNormalized(stripped, 'noi dung con lai', 'text outside the custom phrase should remain');
});

runSpecialCase('overlapping ignored ranges are merged', () => {
  const stripped = __test.stripIgnoredSegments('alpha beta gamma delta', {
    ignoreCommonPhrases: false,
    ignoredPhrases: ['alpha beta', 'beta gamma'],
  });

  assert.strictEqual(normalizeForAssert(stripped), 'delta', 'overlapping ignored phrases should merge into one removed range');
});

runSpecialCase('alphanumeric slash tokens match by token sequence', () => {
  const text = 'Goi A/B testing 24/7 giup doi marketing toi uu noi dung';
  const stripped = __test.stripIgnoredSegments(text, {
    ignoreCommonPhrases: false,
    ignoredPhrases: ['A B testing 24 7'],
  });

  assertNotContainsNormalized(stripped, 'a b testing 24 7', 'slash-separated ignored tokens should be stripped');
  assertContainsNormalized(stripped, 'giup doi marketing', 'remaining alphanumeric text should stay');
});

runSpecialCase('newline punctuation ignored item is treated as one segment', () => {
  const ignored = 'mua sach hom nay,\nnhan uu dai;\ngiao hang nhanh. doi tra de dang';
  const source = `nguon luu tru ${ignored.replace(/\s+/g, ' ')} trong mo ta chien dich`;
  const score = __test.scoreTexts(ignored, source, {
    ignoreCommonPhrases: false,
    ignoredPhrases: [ignored],
  });
  const matches = __test.findSegmentMatches(
    ignored,
    { text: source, sourceTitle: 'Newline punctuation source', sourceType: 'web' },
    threshold,
    { ignoreCommonPhrases: false, ignoredPhrases: [ignored] },
  );

  assert.strictEqual(score.plagiarismScore, 0, 'newline and punctuation ignored item should score zero');
  assert.strictEqual(matches.length, 0, 'newline and punctuation ignored item should not create matches');
});

runSpecialCase('web search text is built after ignored phrases are removed', () => {
  const checkText = 'unique campaign phrase should be ignored while remaining original product paragraph stays searchable';
  const webSearchText = __test.buildWebSearchText(checkText, {
    ignoreCommonPhrases: false,
    ignoredPhrases: ['unique campaign phrase should be ignored'],
  });

  assertNotContainsNormalized(webSearchText, 'unique campaign phrase should be ignored', 'web search text should not include ignored phrase');
  assertContainsNormalized(webSearchText, 'remaining original product paragraph stays searchable', 'web search text should keep non-ignored content');
});

runSpecialCase('match is dropped when ignored remainder has fewer than three words', () => {
  const text = 'allowed launch copy covers almost every token tail only';
  const matches = __test.findSegmentMatches(
    text,
    { text, sourceTitle: 'Short remainder source', sourceType: 'web' },
    threshold,
    {
      ignoreCommonPhrases: false,
      ignoredPhrases: ['allowed launch copy covers almost every token'],
    },
  );

  assert.strictEqual(matches.length, 0, 'match with fewer than three remaining words should be removed');
});

const partialIgnoredPhrase = 'allowed launch copy should disappear';
const partialCopiedText = `intro words ${partialIgnoredPhrase} copied technical paragraph stays exactly the same with enough remaining words for a strong match`;
const partialCopiedSource = `archive says ${partialCopiedText} footer note`;

runSpecialCase('partial ignored phrase disappears but remaining copied text still matches', () => {
  const matches = __test.findSegmentMatches(
    partialCopiedText,
    { text: partialCopiedSource, sourceTitle: 'Partial ignored source', sourceType: 'web' },
    threshold,
    { ignoreCommonPhrases: false, ignoredPhrases: [partialIgnoredPhrase] },
  );

  assert(matches.length > 0, 'remaining copied text should still create a match');
  assert(matches[0].score >= threshold, 'remaining copied text should still exceed threshold');
  assertNotContainsNormalized(matches[0].matchedText, partialIgnoredPhrase, 'partial ignored phrase should not appear in matched text');
  assertNotContainsNormalized(matches[0].sourceText, partialIgnoredPhrase, 'partial ignored phrase should not appear in source text');
});

runSpecialCase('serialized old partial report is rescored and keeps only filtered evidence', () => {
  const report = serializeReport(fakeReport({
    id: 'partial-ignored-report',
    checkText: partialCopiedText,
    ignoredPhrases: [partialIgnoredPhrase],
    ignoreCommonPhrases: false,
    matches: [{
      start: 0,
      end: partialCopiedText.length,
      matchedText: partialCopiedText,
      sourceText: partialCopiedSource,
      sourceUrl: '',
      sourceTitle: 'Stored partial source',
      sourceType: 'web',
      score: 100,
      exactMatchScore: 100,
      phraseOverlapScore: 100,
      wordOverlapScore: 62,
      scoreBasis: 'exact',
      matchedWords: 17,
      totalWords: 17,
      matchedPhrases: 13,
      totalPhrases: 13,
      phraseSize: 3,
    }],
    sources: [{
      source: 'stored-partial-source',
      sourceTitle: 'Stored partial source',
      sourceUrl: '',
      sourceType: 'web',
      similarity: 100,
      plagiarismScore: 100,
      topicSimilarityScore: 62,
      snippet: partialCopiedSource,
      sourceText: partialCopiedSource,
      matchedWords: 17,
      totalWords: 17,
      exactMatchScore: 100,
      phraseOverlapScore: 100,
      wordOverlapScore: 62,
      scoreBasis: 'exact',
      matchedPhrases: 13,
      totalPhrases: 13,
    }],
  }));

  assert(report.matches.length > 0, 'partial old report should keep remaining match evidence');
  assert(report.sources.length > 0, 'partial old report should keep remaining source evidence');
  assert(report.similarityScore >= threshold, 'partial old report should be rescored from filtered evidence');
  assertNotContainsNormalized(report.matches[0].matchedText, partialIgnoredPhrase, 'serialized match should not include ignored phrase');
  assertNotContainsNormalized(report.sources[0].sourceText, partialIgnoredPhrase, 'serialized source should not include ignored phrase');
});

const serializedLegacyEvidenceReport = serializeReport(fakeReport({
  id: 'legacy-evidence-report',
  checkText: copied,
  matches: copiedMatches,
  sources: [{
    source: 'legacy-source',
    sourceTitle: 'Legacy source with omitted candidateCount',
    sourceUrl: '',
    sourceType: 'web',
    similarity: copiedScore.score,
    plagiarismScore: copiedScore.plagiarismScore,
    topicSimilarityScore: copiedScore.topicSimilarityScore,
    snippet: copiedSource,
    sourceText: copiedSource,
    matchedWords: copiedScore.matchedWords,
    totalWords: copiedScore.totalWords,
    exactMatchScore: copiedScore.exactMatchScore,
    phraseOverlapScore: copiedScore.phraseOverlapScore,
    wordOverlapScore: copiedScore.wordOverlapScore,
    scoreBasis: copiedScore.scoreBasis,
    matchedPhrases: copiedScore.matchedPhrases,
    totalPhrases: copiedScore.totalPhrases,
  }],
  analysis: {
    effectiveThreshold: threshold,
    sourceCount: 0,
    matchCount: copiedMatches.length,
    topicMatchCount: 0,
    checkedSourceTypes: ['web'],
    unavailableSourceTypes: [],
    plagiarismScore: copiedScore.plagiarismScore,
    topicSimilarityScore: copiedScore.topicSimilarityScore,
    exactMatchScore: copiedScore.exactMatchScore,
    phraseOverlapScore: copiedScore.phraseOverlapScore,
    wordOverlapScore: copiedScore.wordOverlapScore,
    commonCrawl: { enabled: false, status: 'skipped' },
  },
}));

assert(serializedLegacyEvidenceReport.analysis.candidateCount > 0, 'legacy report with source evidence should infer compared source count');
assertNotContainsNormalized(
  serializedLegacyEvidenceReport.summary,
  'chua nap duoc nguon',
  'legacy report with source evidence should not be summarized as missing comparison data',
);
console.log(JSON.stringify({
  sameTopic: {
    plagiarismScore: topicScore.plagiarismScore,
    topicSimilarityScore: topicScore.topicSimilarityScore,
    matches: topicMatches.length,
  },
  keywordHeavy: {
    plagiarismScore: keywordScore.plagiarismScore,
    topicSimilarityScore: keywordScore.topicSimilarityScore,
    matches: keywordMatches.length,
    topicMatches: keywordTopicMatches.length,
  },
  copied: {
    plagiarismScore: copiedScore.plagiarismScore,
    topicSimilarityScore: copiedScore.topicSimilarityScore,
    matches: copiedMatches.length,
    matchesAfterIgnoringMatchedText: copiedMatchesAfterIgnoringMatchedText.length,
  },
  customIgnoredPhrase: {
    baselinePlagiarismScore: customPhraseBaseline.plagiarismScore,
    ignoredPlagiarismScore: customPhraseIgnored.plagiarismScore,
    ignoredWithCommonOffPlagiarismScore: customPhraseIgnoredWithCommonOff.plagiarismScore,
  },
  longIgnoredSegment: {
    length: longIgnoredSegment.length,
    baselinePlagiarismScore: longSegmentBaseline.plagiarismScore,
    ignoredPlagiarismScore: longSegmentIgnored.plagiarismScore,
  },
  punctuatedIgnoredSegment: {
    ignoredPlagiarismScore: punctuatedIgnoredScore.plagiarismScore,
    matches: punctuatedIgnoredMatches.length,
  },
  serializedFullIgnoredReport: {
    plagiarismScore: serializedFullIgnoredReport.similarityScore,
    originalityScore: serializedFullIgnoredReport.originalityScore,
    riskLevel: serializedFullIgnoredReport.riskLevel,
    matches: serializedFullIgnoredReport.matches.length,
    sources: serializedFullIgnoredReport.sources.length,
  },
  serializedLegacyEvidenceReport: {
    candidateCount: serializedLegacyEvidenceReport.analysis.candidateCount,
    summary: serializedLegacyEvidenceReport.summary,
  },
  vietnameseIgnoredDisplay: {
    matches: vietnameseMixedMatches.length,
    matchedText: vietnameseMixedMatches[0]?.matchedText || '',
    sourcePreview: filteredSourcePreview,
  },
  specialCases: {
    passed: specialCases.length,
    names: specialCases,
  },
}, null, 2));
