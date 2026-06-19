const asyncHandler = require('../../utils/asyncHandler');
const cloudinaryService = require('../../services/cloudinaryService');
const { extractTextFromFile, toUploadedSource } = require('../../services/plagiarismFileService');

function firstValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

function parseJsonField(value, fallback) {
  const raw = firstValue(value);
  if (raw === undefined || raw === null || raw === '') return fallback;
  if (typeof raw !== 'string') return raw;

  try {
    return JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
}

function parseBoolean(value) {
  const raw = firstValue(value);
  if (raw === true || raw === false) return raw;
  if (typeof raw !== 'string') return undefined;

  const normalized = raw.trim().toLowerCase();
  if (normalized === 'true') return true;
  if (normalized === 'false') return false;
  return undefined;
}

function parseNumber(value) {
  const raw = firstValue(value);
  if (raw === undefined || raw === null || raw === '') return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseIgnoredPhrases(value) {
  const parsed = parseJsonField(value, undefined);
  if (Array.isArray(parsed)) return parsed;

  const raw = firstValue(value);
  if (typeof raw !== 'string' || !raw.trim()) return [];
  return [raw];
}

function parseSources(body = {}) {
  const parsed = parseJsonField(body.sources, undefined);
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    return parsed;
  }

  const sources = {};
  ['database', 'references', 'web', 'uploads'].forEach((key) => {
    const direct = parseBoolean(body[key]);
    const dotted = parseBoolean(body[`sources.${key}`]);
    const bracketed = parseBoolean(body[`sources[${key}]`]);
    const value = direct ?? dotted ?? bracketed;
    if (value !== undefined) sources[key] = value;
  });

  return sources;
}

function normalizeMultipartBody(body = {}) {
  const payload = {
    text: firstValue(body.text),
    contentId: firstValue(body.contentId),
    sensitivity: firstValue(body.sensitivity),
    ignoredPhrases: parseIgnoredPhrases(body.ignoredPhrases),
    sources: parseSources(body),
  };

  const threshold = parseNumber(body.threshold);
  if (threshold !== undefined) payload.threshold = threshold;

  const includeReferences = parseBoolean(body.includeReferences);
  if (includeReferences !== undefined) payload.includeReferences = includeReferences;

  const ignoreCommonPhrases = parseBoolean(body.ignoreCommonPhrases);
  if (ignoreCommonPhrases !== undefined) payload.ignoreCommonPhrases = ignoreCommonPhrases;

  return payload;
}

function getUploadedFiles(files, field) {
  const value = files?.[field];
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

async function extractAndStoreFile(userId, file, index = 0) {
  const [extractedFile, cloudinaryFile] = await Promise.all([
    extractTextFromFile(file),
    cloudinaryService.uploadPlagiarismFile(userId, file, index),
  ]);

  return {
    ...extractedFile,
    cloudinary: cloudinaryFile,
  };
}

const preparePlagiarismFilePayload = asyncHandler(async (req, res, next) => {
  const payload = normalizeMultipartBody(req.body || {});
  const checkFile = getUploadedFiles(req.files, 'checkFile')[0];
  const referenceFiles = getUploadedFiles(req.files, 'referenceFiles');
  const originalText = String(payload.text || '').trim();
  let extractedCheckFile = null;

  if (checkFile) {
    extractedCheckFile = await extractAndStoreFile(req.user._id, checkFile, 0);

    if (!originalText) {
      payload.text = extractedCheckFile.text;
      payload.checkFileName = extractedCheckFile.fileName;
    }
  }

  const extractedSources = await Promise.all(
    referenceFiles.map(async (file, index) => toUploadedSource(await extractAndStoreFile(req.user._id, file, index + 1), index)),
  );

  if (extractedCheckFile && originalText && referenceFiles.length === 0) {
    extractedSources.unshift(toUploadedSource(extractedCheckFile, 0));
  }

  if (extractedSources.length > 0) {
    payload.uploadedSources = extractedSources;
    payload.sources = {
      ...payload.sources,
      uploads: true,
    };
  }

  req.body = payload;
  return next();
});

module.exports = {
  preparePlagiarismFilePayload,
};
