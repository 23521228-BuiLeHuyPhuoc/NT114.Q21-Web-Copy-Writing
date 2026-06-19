const auditLogService = require('../../services/auditLogService');
const publicSiteService = require('../../services/publicSiteService');
const asyncHandler = require('../../utils/asyncHandler');

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

module.exports = {
  listPages,
  getPage,
  updatePage,
};
