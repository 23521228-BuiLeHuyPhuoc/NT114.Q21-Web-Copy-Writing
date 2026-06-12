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

assert(copiedScore.plagiarismScore >= threshold, 'copied text should exceed plagiarism threshold');
assert(copiedMatches.length > 0, 'copied text should create highlighted plagiarism matches');

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
  },
}, null, 2));
