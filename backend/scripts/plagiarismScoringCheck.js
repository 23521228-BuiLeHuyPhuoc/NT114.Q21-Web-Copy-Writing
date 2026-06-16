const assert = require('assert');
const { __test } = require('../src/services/plagiarismService');

const scoringOptions = { ignoreCommonPhrases: true };
const threshold = 35;

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

assert(longIgnoredSegment.length > 120, 'long ignored segment fixture should exceed the old limit');
assert(longSegmentBaseline.plagiarismScore >= threshold, 'long copied segment should exceed plagiarism threshold before ignoring');
assert.strictEqual(longSegmentIgnored.plagiarismScore, 0, 'long ignored segment should be removed from plagiarism scoring');

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
  vietnameseIgnoredDisplay: {
    matches: vietnameseMixedMatches.length,
    matchedText: vietnameseMixedMatches[0]?.matchedText || '',
    sourcePreview: filteredSourcePreview,
  },
}, null, 2));
