const multer = require('multer');

const createError = require('../../utils/createError');
const { isSupportedFile } = require('../../services/plagiarismFileService');

const DEFAULT_MAX_PLAGIARISM_FILE_SIZE_MB = 128;
const MAX_PLAGIARISM_FILE_SIZE_BYTES = Math.max(
  10,
  Number(process.env.PLAGIARISM_MAX_FILE_MB || DEFAULT_MAX_PLAGIARISM_FILE_SIZE_MB),
) * 1024 * 1024;
const MAX_REFERENCE_FILES = 5;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_PLAGIARISM_FILE_SIZE_BYTES,
    files: MAX_REFERENCE_FILES + 1,
  },
  fileFilter(req, file, callback) {
    if (!isSupportedFile(file)) {
      return callback(createError(400, 'File must be TXT, MD, CSV, JSON, HTML, DOCX, or PDF'));
    }

    return callback(null, true);
  },
});

function handleUploadError(error, next) {
  if (!error) return next();

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return next(createError(413, `Each plagiarism file must be ${Math.round(MAX_PLAGIARISM_FILE_SIZE_BYTES / 1024 / 1024)}MB or smaller`));
    }

    if (error.code === 'LIMIT_FILE_COUNT') {
      return next(createError(400, `Upload at most ${MAX_REFERENCE_FILES} reference files and 1 check file`));
    }

    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(createError(400, 'Unexpected upload field'));
    }

    return next(createError(400, error.message));
  }

  return next(error);
}

function uploadPlagiarismTextFile(req, res, next) {
  upload.single('file')(req, res, (error) => handleUploadError(error, next));
}

function uploadPlagiarismCheckFiles(req, res, next) {
  upload.fields([
    { name: 'checkFile', maxCount: 1 },
    { name: 'referenceFiles', maxCount: MAX_REFERENCE_FILES },
  ])(req, res, (error) => handleUploadError(error, next));
}

module.exports = {
  DEFAULT_MAX_PLAGIARISM_FILE_SIZE_MB,
  MAX_REFERENCE_FILES,
  MAX_PLAGIARISM_FILE_SIZE_BYTES,
  uploadPlagiarismTextFile,
  uploadPlagiarismCheckFiles,
};
