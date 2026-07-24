require('dotenv').config();

const assert = require('assert');
const mongoose = require('mongoose');

const PlagiarismReport = require('../src/models/PlagiarismReport');
const crossLanguageSearchService = require('../src/services/crossLanguageSearchService');
const embeddingService = require('../src/services/embeddingService');
const plagiarismService = require('../src/services/plagiarismService');

const vietnameseOriginal = 'Trí tuệ nhân tạo đang dần thay đổi cách sinh viên học tập và tiếp cận kiến thức. Thay vì chỉ tìm kiếm thông tin trong sách, người học có thể sử dụng các công cụ thông minh để giải thích khái niệm, tạo bài tập và nhận phản hồi nhanh chóng. Tuy nhiên, trí tuệ nhân tạo chỉ nên đóng vai trò hỗ trợ, không thể thay thế hoàn toàn tư duy độc lập. Nếu quá phụ thuộc vào công nghệ, sinh viên có thể mất khả năng phân tích, giải quyết vấn đề và tự xây dựng ý tưởng của riêng mình.';
const englishTranslation = 'Artificial intelligence is gradually changing how students learn and access knowledge. Instead of searching for information only in books, learners can use intelligent tools to explain concepts, generate exercises, and receive rapid feedback. However, artificial intelligence should serve only as a supporting tool and cannot completely replace independent thinking. If students become overly dependent on technology, they may lose their ability to analyze information, solve problems, and develop ideas of their own.';
const relatedButIndependentEnglish = 'Artificial intelligence allows retail companies to forecast inventory demand, automate customer support tickets, and optimize delivery routes. Managers use these systems to reduce operating costs and improve service response times, while employees monitor business performance through real-time dashboards.';
const unrelatedVietnamese = 'Du lịch miền núi vào mùa đông đòi hỏi người tham gia chuẩn bị quần áo giữ nhiệt, kiểm tra dự báo thời tiết và lựa chọn tuyến đường phù hợp. Các khu vực có tuyết thường hạn chế phương tiện vào ban đêm để bảo đảm an toàn. Du khách nên mang theo bản đồ, nước uống và thiết bị liên lạc khi di chuyển qua những khu vực ít dân cư.';
const padding = 'Nông nghiệp bền vững cần quản lý đất, nước, giống cây và chuỗi cung ứng theo điều kiện địa phương. Người sản xuất theo dõi thời tiết, sâu bệnh, chi phí vận chuyển và nhu cầu thị trường để điều chỉnh kế hoạch canh tác. ';
const longVietnameseSource = `${padding.repeat(20)} ${vietnameseOriginal} ${padding.repeat(20)}`;

async function validateWithoutSaving(data) {
  const document = new PlagiarismReport(data);
  await document.validate();
  return document;
}

async function checkAgainstUploadedSource(sourceText, sourceTitle, inputText = englishTranslation) {
  return plagiarismService.checkPlagiarism(new mongoose.Types.ObjectId(), {
    text: inputText,
    threshold: 35,
    sensitivity: 'balanced',
    ignoreCommonPhrases: false,
    sources: { database: false, references: false, web: false, uploads: true },
    uploadedSources: [{
      source: `integration:${sourceTitle}`,
      sourceTitle,
      text: sourceText,
    }],
  });
}

async function main() {
  const originalCreate = PlagiarismReport.create;
  PlagiarismReport.create = validateWithoutSaving;

  try {
    const embeddingResult = await embeddingService.embedTexts(
      [englishTranslation, vietnameseOriginal, unrelatedVietnamese, relatedButIndependentEnglish],
      { provider: 'gemini', allowLocalFallback: false },
    );
    const translatedCosine = embeddingService.cosineSimilarity(
      embeddingResult.vectors[0],
      embeddingResult.vectors[1],
    );
    const unrelatedCosine = embeddingService.cosineSimilarity(
      embeddingResult.vectors[0],
      embeddingResult.vectors[2],
    );
    const relatedTopicCosine = embeddingService.cosineSimilarity(
      embeddingResult.vectors[1],
      embeddingResult.vectors[3],
    );

    assert.strictEqual(embeddingResult.provider, 'gemini');
    assert.strictEqual(embeddingResult.status, 'ok');
    assert(translatedCosine >= 0.9, `translated cosine ${translatedCosine.toFixed(4)} should be at least 0.9`);
    assert(unrelatedCosine < 0.82, `unrelated cosine ${unrelatedCosine.toFixed(4)} should stay below 0.82`);
    assert(relatedTopicCosine < 0.82, `related-topic cosine ${relatedTopicCosine.toFixed(4)} should stay below 0.82`);

    const directReport = await checkAgainstUploadedSource(vietnameseOriginal, 'Vietnamese original');
    const longSourceReport = await checkAgainstUploadedSource(longVietnameseSource, 'Long Vietnamese source');
    const unrelatedReport = await checkAgainstUploadedSource(unrelatedVietnamese, 'Unrelated Vietnamese source');
    const relatedTopicReport = await checkAgainstUploadedSource(
      vietnameseOriginal,
      'Vietnamese AI education source',
      relatedButIndependentEnglish,
    );
    const englishToVietnamese = await crossLanguageSearchService.translateForSearch(englishTranslation);
    const vietnameseToEnglish = await crossLanguageSearchService.translateForSearch(vietnameseOriginal);

    assert(directReport.similarityScore >= 35, 'direct translated copy should be plagiarism');
    assert.strictEqual(directReport.matches[0]?.scoreBasis, 'embedding');
    assert.strictEqual(directReport.analysis.embedding.provider, 'gemini');

    assert(longSourceReport.similarityScore >= 35, 'translated copy inside a long source should be plagiarism');
    assert.strictEqual(longSourceReport.matches[0]?.scoreBasis, 'embedding');
    assert(
      longSourceReport.matches[0]?.sourceText.includes('Trí tuệ nhân tạo đang dần thay đổi'),
      'long-source evidence should show the matching Vietnamese chunk',
    );

    assert(unrelatedReport.similarityScore < 35, 'unrelated cross-language content should not be plagiarism');
    assert.strictEqual(unrelatedReport.matches.length, 0);

    assert(relatedTopicReport.similarityScore < 35, 'same broad AI topic should not become plagiarism');
    assert.strictEqual(relatedTopicReport.matches.length, 0);

    assert.strictEqual(englishToVietnamese.status, 'ok');
    assert.strictEqual(englishToVietnamese.sourceLanguage, 'en');
    assert.strictEqual(englishToVietnamese.targetLanguage, 'vi');
    assert(englishToVietnamese.translatedText.length > 40);

    assert.strictEqual(vietnameseToEnglish.status, 'ok');
    assert.strictEqual(vietnameseToEnglish.sourceLanguage, 'vi');
    assert.strictEqual(vietnameseToEnglish.targetLanguage, 'en');
    assert(vietnameseToEnglish.translatedText.length > 40);

    console.log(JSON.stringify({
      provider: embeddingResult.provider,
      model: embeddingResult.model,
      translatedCosine: Number(translatedCosine.toFixed(4)),
      unrelatedCosine: Number(unrelatedCosine.toFixed(4)),
      relatedTopicCosine: Number(relatedTopicCosine.toFixed(4)),
      directTranslatedCopy: {
        similarityScore: directReport.similarityScore,
        matches: directReport.matches.length,
        scoreBasis: directReport.matches[0]?.scoreBasis || 'none',
      },
      translatedCopyInsideLongSource: {
        similarityScore: longSourceReport.similarityScore,
        matches: longSourceReport.matches.length,
        scoreBasis: longSourceReport.matches[0]?.scoreBasis || 'none',
        evidenceContainsOriginal: longSourceReport.matches[0]?.sourceText.includes('Trí tuệ nhân tạo đang dần thay đổi') || false,
      },
      unrelatedCrossLanguageContent: {
        similarityScore: unrelatedReport.similarityScore,
        matches: unrelatedReport.matches.length,
      },
      relatedTopicCrossLanguageContent: {
        similarityScore: relatedTopicReport.similarityScore,
        matches: relatedTopicReport.matches.length,
      },
      translations: {
        englishToVietnamese: englishToVietnamese.status,
        vietnameseToEnglish: vietnameseToEnglish.status,
        model: englishToVietnamese.model,
      },
    }, null, 2));
  } finally {
    PlagiarismReport.create = originalCreate;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
