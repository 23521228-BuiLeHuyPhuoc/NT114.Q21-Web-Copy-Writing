const { v2: cloudinary } = require('cloudinary');

const createError = require('../utils/createError');

function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET || process.env.API_SECRET_KEY;

  if (!cloudName || !apiKey || !apiSecret) {
    throw createError(500, 'Cloudinary is not configured');
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

function uploadBuffer(buffer, options) {
  configureCloudinary();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        return reject(createError(502, error.message || 'Could not upload image to Cloudinary'));
      }

      if (!result?.secure_url) {
        return reject(createError(502, 'Invalid Cloudinary upload response'));
      }

      return resolve(result);
    });

    stream.end(buffer);
  });
}

async function uploadUserAvatar(userId, file) {
  const folder = process.env.CLOUDINARY_AVATAR_FOLDER || 'copypro/avatars/users';
  const result = await uploadBuffer(file.buffer, {
    folder,
    public_id: `user_${userId}`,
    overwrite: true,
    invalidate: true,
    resource_type: 'image',
  });

  return {
    publicId: result.public_id,
    url: result.secure_url,
  };
}

async function uploadAdminAvatar(adminId, file) {
  const folder = process.env.CLOUDINARY_ADMIN_AVATAR_FOLDER || 'copypro/avatars/admins';
  const result = await uploadBuffer(file.buffer, {
    folder,
    public_id: `admin_${adminId}`,
    overwrite: true,
    invalidate: true,
    resource_type: 'image',
  });

  return {
    publicId: result.public_id,
    url: result.secure_url,
  };
}

async function uploadPublicSiteImage(adminId, file) {
  const folder = process.env.CLOUDINARY_PUBLIC_SITE_FOLDER || 'copypro/public-site';
  const timestamp = Date.now();
  const safeName = String(file.originalname || 'image')
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'image';

  const result = await uploadBuffer(file.buffer, {
    folder,
    public_id: `admin_${adminId}_${timestamp}_${safeName}`,
    overwrite: false,
    resource_type: 'image',
  });

  return {
    publicId: result.public_id,
    url: result.secure_url,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  };
}

module.exports = {
  uploadAdminAvatar,
  uploadPublicSiteImage,
  uploadUserAvatar,
};
