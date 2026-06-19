const auditLogService = require('../../services/auditLogService');
const cloudinaryService = require('../../services/cloudinaryService');
const publicSiteService = require('../../services/publicSiteService');
const asyncHandler = require('../../utils/asyncHandler');
const createError = require('../../utils/createError');

const listPages = asyncHandler(async (req, res) => {
  const items = await publicSiteService.listAdminPages();

  return res.status(200).json({
    success: true,
    message: 'OK',
    data: { items },
  });
});

const getPage = asyncHandler(async (req, res) => {
  const page = await publicSiteService.getAdminPage(req.params.key);

  return res.status(200).json({
    success: true,
    message: 'OK',
    data: { page },
  });
});

const updatePage = asyncHandler(async (req, res) => {
  const page = await publicSiteService.updatePage(req.params.key, req.body);

  await auditLogService.createAdminAuditLog(req, {
    action: 'admin.public_site.updated',
    targetType: 'public_page',
    targetId: page.key,
    metadata: {
      details: `Updated public site page ${page.key}`,
      key: page.key,
      type: page.type,
    },
  });

  return res.status(200).json({
    success: true,
    message: 'Public page updated',
    data: { page },
  });
});

const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw createError(400, 'Image file is required');

  const image = await cloudinaryService.uploadPublicSiteImage(req.user._id, req.file);

  await auditLogService.createAdminAuditLog(req, {
    action: 'admin.public_site.image_uploaded',
    targetType: 'public_site_image',
    targetId: image.publicId,
    metadata: {
      details: 'Uploaded public site image',
      publicId: image.publicId,
      url: image.url,
    },
  });

  return res.status(201).json({
    success: true,
    message: 'Image uploaded',
    data: { image },
  });
});

module.exports = {
  listPages,
  getPage,
  uploadImage,
  updatePage,
};
