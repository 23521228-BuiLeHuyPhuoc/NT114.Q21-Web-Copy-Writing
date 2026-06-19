const multer = require('multer');

const createError = require('../../utils/createError');

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_IMAGE_SIZE_BYTES,
    files: 1,
  },
  fileFilter(req, file, callback) {
    if (!ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
      return callback(createError(400, 'Image must be a JPG, PNG, WEBP, or GIF file'));
    }

    return callback(null, true);
  },
});

function uploadImage(req, res, next) {
  upload.single('image')(req, res, (error) => {
    if (!error) return next();

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return next(createError(413, 'Image must be 5MB or smaller'));
      }

      return next(createError(400, error.message));
    }

    return next(error);
  });
}

module.exports = {
  uploadImage,
};
