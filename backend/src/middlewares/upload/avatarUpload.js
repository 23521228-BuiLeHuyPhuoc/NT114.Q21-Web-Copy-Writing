const multer = require('multer');

const createError = require('../../utils/createError');

const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_AVATAR_SIZE_BYTES,
    files: 1,
  },
  fileFilter(req, file, callback) {
    if (!ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
      return callback(createError(400, 'Avatar must be a JPG, PNG, WEBP, or GIF image'));
    }

    return callback(null, true);
  },
});

function uploadAvatar(req, res, next) {
  upload.single('avatar')(req, res, (error) => {
    if (!error) return next();

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return next(createError(413, 'Avatar image must be 2MB or smaller'));
      }

      return next(createError(400, error.message));
    }

    return next(error);
  });
}

module.exports = {
  uploadAvatar,
};
