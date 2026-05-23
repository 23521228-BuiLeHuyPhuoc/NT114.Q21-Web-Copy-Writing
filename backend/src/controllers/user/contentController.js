const contentService = require('../../services/contentService');
const asyncHandler = require('../../utils/asyncHandler');

const listContents = asyncHandler(async (req, res) => {
  const data = await contentService.listContents(req.user._id, req.query);

  return res.status(200).json({
    success: true,
    message: 'OK',
    data,
  });
});

const getContent = asyncHandler(async (req, res) => {
  const item = await contentService.getContent(req.user._id, req.params.id);

  return res.status(200).json({
    success: true,
    message: 'OK',
    data: { item },
  });
});

const createContent = asyncHandler(async (req, res) => {
  const item = await contentService.createContent(req.user._id, req.body);

  return res.status(201).json({
    success: true,
    message: 'Content created',
    data: { item },
  });
});

const updateContent = asyncHandler(async (req, res) => {
  const item = await contentService.updateContent(req.user._id, req.params.id, req.body);

  return res.status(200).json({
    success: true,
    message: 'Content updated',
    data: { item },
  });
});

const deleteContent = asyncHandler(async (req, res) => {
  const item = await contentService.softDeleteContent(req.user._id, req.params.id);

  return res.status(200).json({
    success: true,
    message: 'Content moved to trash',
    data: { item },
  });
});

const generateContent = asyncHandler(async (req, res) => {
  const data = await contentService.generateContent(req.user._id, req.body);

  return res.status(201).json({
    success: true,
    message: data.fallback ? 'Content generated with fallback' : 'Content generated',
    data,
  });
});

module.exports = {
  listContents,
  getContent,
  createContent,
  updateContent,
  deleteContent,
  generateContent,
};
