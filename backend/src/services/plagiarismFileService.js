const path = require('path');

const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');

const createError = require('../utils/createError');

const DEFAULT_MAX_EXTRACTED_TEXT_LENGTH = 100000000;
const MAX_EXTRACTED_TEXT_LENGTH = Math.max(
  60000,
  Number(process.env.PLAGIARISM_MAX_EXTRACTED_TEXT_CHARS || DEFAULT_MAX_EXTRACTED_TEXT_LENGTH),
);
const MAX_UPLOAD_SOURCE_TITLE_LENGTH = 200;

const TEXT_EXTENSIONS = new Set([
  '.txt',
  '.md',
  '.markdown',
  '.csv',
  '.tsv',
  '.json',
  '.html',
  '.htm',
  '.xml',
  '.rtf',
]);

const SUPPORTED_EXTENSIONS = new Set([
  ...TEXT_EXTENSIONS,
  '.docx',
  '.pdf',
]);

function countWords(text) {
  return String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function getFileExtension(file = {}) {
  return path.extname(file.originalname || '').toLowerCase();
}

function isSupportedFile(file = {}) {
  const extension = getFileExtension(file);
  return SUPPORTED_EXTENSIONS.has(extension) || String(file.mimetype || '').startsWith('text/');
}

function normalizeFileName(value, fallback = 'Uploaded file') {
  const baseName = path.basename(String(value || '').trim()) || fallback;
  return baseName.slice(0, MAX_UPLOAD_SOURCE_TITLE_LENGTH).trim() || fallback;
}

function normalizeExtractedText(value, maxLength = MAX_EXTRACTED_TEXT_LENGTH) {
  const text = String(value || '')
    .replace(/\u0000/g, '')
    .replace(/\r\n?/g, '\n')
    .replace(/[\t\f\v ]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim();
}

function decodeTextBuffer(buffer) {
  const utf8 = buffer.toString('utf8');
  const replacementCount = (utf8.match(/\uFFFD/g) || []).length;
  if (replacementCount <= Math.max(2, utf8.length * 0.01)) return utf8;
  return buffer.toString('latin1');
}

async function readFileText(file) {
  if (!file?.buffer) {
    throw createError(400, 'Please upload a file to extract text');
  }

  const extension = getFileExtension(file);

  if (extension === '.pdf') {
    const parsed = await pdfParse(file.buffer);
    return parsed.text || '';
  }

  if (extension === '.docx') {
    const parsed = await mammoth.extractRawText({ buffer: file.buffer });
    return parsed.value || '';
  }

  if (TEXT_EXTENSIONS.has(extension) || String(file.mimetype || '').startsWith('text/')) {
    return decodeTextBuffer(file.buffer);
  }

  throw createError(400, 'Unsupported file type. Please upload TXT, MD, CSV, JSON, HTML, DOCX, or PDF');
}

async function extractTextFromFile(file, options = {}) {
  if (!isSupportedFile(file)) {
    throw createError(400, 'Unsupported file type. Please upload TXT, MD, CSV, JSON, HTML, DOCX, or PDF');
  }

  const text = normalizeExtractedText(await readFileText(file), options.maxLength || MAX_EXTRACTED_TEXT_LENGTH);
  if (countWords(text) < 5) {
    throw createError(400, `Could not extract enough text from ${normalizeFileName(file.originalname)}`);
  }

  return {
    fileName: normalizeFileName(file.originalname),
    mimeType: file.mimetype || '',
    size: file.size || 0,
    extension: getFileExtension(file),
    text,
    wordCount: countWords(text),
  };
}

function toUploadedSource(extractedFile, index = 0) {
  const title = normalizeFileName(extractedFile.fileName, `Uploaded source ${index + 1}`);
  const cloudinary = extractedFile.cloudinary || {};

  return {
    source: `upload:${title}`,
    sourceTitle: title,
    sourceUrl: cloudinary.url || '',
    sourceType: 'uploads',
    text: extractedFile.text,
    mimeType: extractedFile.mimeType || '',
    size: cloudinary.bytes || extractedFile.size || 0,
  };
}

module.exports = {
  DEFAULT_MAX_EXTRACTED_TEXT_LENGTH,
  MAX_EXTRACTED_TEXT_LENGTH,
  SUPPORTED_EXTENSIONS,
  extractTextFromFile,
  isSupportedFile,
  toUploadedSource,
};
