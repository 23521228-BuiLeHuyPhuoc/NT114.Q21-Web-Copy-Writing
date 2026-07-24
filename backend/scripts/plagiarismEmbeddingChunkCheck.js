const assert = require('assert');

const embeddingService = require('../src/services/embeddingService');
const plagiarismService = require('../src/services/plagiarismService');

const query = 'Artificial intelligence changes how students learn and access knowledge through digital tools.';
const translatedMarker = 'Trí tuệ nhân tạo thay đổi cách sinh viên học tập và tiếp cận kiến thức thông qua các công cụ số.';
const padding = 'Nông nghiệp bền vững cần quản lý đất nước giống cây thời tiết và chuỗi cung ứng theo điều kiện địa phương. ';
const longSource = `${padding.repeat(25)} ${translatedMarker} ${padding.repeat(25)}`;

function lexicalCandidate(sourceText) {
  return {
    candidate: {
      source: 'chunk-fixture',
      sourceTitle: 'Chunk fixture',
      sourceUrl: '',
      sourceType: 'uploads',
      text: sourceText,
    },
    isLargeSource: false,
    comparisonCandidateText: sourceText,
    textScore: plagiarismService.__test.scoreTexts(query, sourceText, { ignoreCommonPhrases: false }),
  };
}

async function testChunkFallbackFindsPassage() {
  const originalEmbedTexts = embeddingService.embedTexts;
  let calls = 0;

  embeddingService.embedTexts = async (texts, options = {}) => {
    calls += 1;
    assert.strictEqual(options.allowLocalFallback, false);

    if (calls === 1) {
      return {
        vectors: [[1, 0], [0, 1]],
        provider: 'gemini',
        model: 'fixture-model',
        status: 'ok',
        error: '',
      };
    }

    return {
      vectors: texts.map((text, index) => (
        index === 0 || text.includes(translatedMarker) ? [1, 0] : [0, 1]
      )),
      provider: 'gemini',
      model: 'fixture-model',
      status: 'ok',
      error: '',
    };
  };

  try {
    const result = await plagiarismService.__test.scoreCandidateEmbeddings(
      query,
      [lexicalCandidate(longSource)],
      35,
    );
    const score = result.scores.get(0);

    assert.strictEqual(calls, 2, 'no full-document signal should trigger one chunk pass');
    assert(score.plagiarismScore >= 35);
    assert.strictEqual(score.scoreBasis, 'embedding');
    assert(score.embeddingSourceText.includes(translatedMarker));
  } finally {
    embeddingService.embedTexts = originalEmbedTexts;
  }
}

async function testDocumentSignalSkipsChunkPass() {
  const originalEmbedTexts = embeddingService.embedTexts;
  let calls = 0;

  embeddingService.embedTexts = async (texts, options = {}) => {
    calls += 1;
    assert.strictEqual(options.allowLocalFallback, false);
    return {
      vectors: texts.map(() => [1, 0]),
      provider: 'gemini',
      model: 'fixture-model',
      status: 'ok',
      error: '',
    };
  };

  try {
    const result = await plagiarismService.__test.scoreCandidateEmbeddings(
      query,
      [lexicalCandidate(translatedMarker)],
      35,
    );
    assert.strictEqual(calls, 1, 'a strong full-document signal should avoid extra embedding requests');
    assert(result.scores.get(0).plagiarismScore >= 35);
  } finally {
    embeddingService.embedTexts = originalEmbedTexts;
  }
}

async function testProviderFailureDoesNotPretendLocalMultilingualSupport() {
  const originalEmbedTexts = embeddingService.embedTexts;

  embeddingService.embedTexts = async (texts, options = {}) => {
    assert.strictEqual(options.allowLocalFallback, false);
    throw new Error('remote embedding quota exhausted');
  };

  try {
    const result = await plagiarismService.__test.scoreCandidateEmbeddings(
      query,
      [lexicalCandidate(translatedMarker)],
      35,
    );
    assert.strictEqual(result.scores.size, 0);
    assert.strictEqual(result.stats.status, 'error');
    assert(result.stats.error.includes('quota exhausted'));
  } finally {
    embeddingService.embedTexts = originalEmbedTexts;
  }
}

async function main() {
  await testChunkFallbackFindsPassage();
  await testDocumentSignalSkipsChunkPass();
  await testProviderFailureDoesNotPretendLocalMultilingualSupport();

  console.log(JSON.stringify({
    passed: 3,
    cases: [
      'chunk pass finds translated passage in a long source',
      'document-level signal skips the chunk pass',
      'remote provider failure is reported instead of local multilingual fallback',
    ],
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
