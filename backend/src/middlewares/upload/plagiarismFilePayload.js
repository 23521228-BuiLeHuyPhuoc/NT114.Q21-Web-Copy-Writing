const asyncHandler = require('../../utils/asyncHandler');
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

const preparePlagiarismFilePayload = asyncHandler(async (req, res, next) => {
  const payload = normalizeMultipartBody(req.body || {});
  const checkFile = getUploadedFiles(req.files, 'checkFile')[0];
  const referenceFiles = getUploadedFiles(req.files, 'referenceFiles');

  if (checkFile && !String(payload.text || '').trim()) {
    const extracted = await extractTextFromFile(checkFile);
    payload.text = extracted.text;
    payload.checkFileName = extracted.fileName;
  }

  if (referenceFiles.length > 0) {
    const extractedSources = await Promise.all(
      referenceFiles.map(async (file, index) => toUploadedSource(await extractTextFromFile(file), index)),
    );

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
