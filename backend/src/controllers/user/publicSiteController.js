const publicSiteService = require('../../services/publicSiteService');
const asyncHandler = require('../../utils/asyncHandler');

const getPage = asyncHandler(async (req, res) => {
  const page = await publicSiteService.getPublicPage(req.params.key);

  return res.status(200).json({
    success: true,
    message: 'OK',
    data: { page },
  });
});

const getBlog = asyncHandler(async (req, res) => {
  const page = await publicSiteService.getPublicPage('blog');

  return res.status(200).json({
    success: true,
    message: 'OK',
    data: { page },
  });
});

module.exports = {
  getPage,
  getBlog,
};
