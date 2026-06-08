const adminContentService = require('../../services/adminContentService');
const asyncHandler = require('../../utils/asyncHandler');

const listContents = asyncHandler(async (req, res) => {
  const data = await adminContentService.listContents(req.query);

  return res.status(200).json({
    success: true,
    message: 'OK',
    data,
  });
});

const listTrash = asyncHandler(async (req, res) => {
  const data = await adminContentService.listContents({ ...req.query, deleted: true });

  return res.status(200).json({
    success: true,
    message: 'OK',
    data,
  });
});

const getContent = asyncHandler(async (req, res) => {
  const item = await adminContentService.getContent(req.params.id);

  return res.status(200).json({
    success: true,
    message: 'OK',
    data: { item },
  });
});

const updateContent = asyncHandler(async (req, res) => {
  const item = await adminContentService.updateContent(req.params.id, req.body, req);

  return res.status(200).json({
    success: true,
    message: 'Content updated',
    data: { item },
  });
});

const softDeleteContent = asyncHandler(async (req, res) => {
  const item = await adminContentService.softDeleteContent(req.params.id, req);

  return res.status(200).json({
    success: true,
    message: 'Content moved to trash',
    data: { item },
  });
});

const restoreContent = asyncHandler(async (req, res) => {
  const item = await adminContentService.restoreContent(req.params.id, req);

  return res.status(200).json({
    success: true,
    message: 'Content restored',
    data: { item },
  });
});

const permanentDeleteContent = asyncHandler(async (req, res) => {
  await adminContentService.permanentDeleteContent(req.params.id, req);

  return res.status(200).json({
    success: true,
    message: 'Content permanently deleted',
  });
});

module.exports = {
  listContents,
  listTrash,
  getContent,
  updateContent,
  softDeleteContent,
  restoreContent,
  permanentDeleteContent,
};
