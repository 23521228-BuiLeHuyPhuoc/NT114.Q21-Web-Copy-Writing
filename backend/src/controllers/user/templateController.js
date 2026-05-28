const templateService = require('../../services/templateService');
const asyncHandler = require('../../utils/asyncHandler');

const listTemplates = asyncHandler(async (req, res) => {
  const data = await templateService.listTemplates(req.user._id, req.query);

  return res.status(200).json({
    success: true,
    message: 'OK',
    data,
  });
});

const getTemplate = asyncHandler(async (req, res) => {
  const item = await templateService.getTemplate(req.user._id, req.params.id);

  return res.status(200).json({
    success: true,
    message: 'OK',
    data: { item },
  });
});

const createTemplate = asyncHandler(async (req, res) => {
  const item = await templateService.createTemplate(req.user._id, req.body);

  return res.status(201).json({
    success: true,
    message: 'Template created',
    data: { item },
  });
});

module.exports = {
  listTemplates,
  getTemplate,
  createTemplate,
};
