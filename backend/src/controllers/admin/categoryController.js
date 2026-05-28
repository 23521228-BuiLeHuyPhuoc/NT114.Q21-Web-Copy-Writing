const categoryService = require('../../services/categoryService');
const asyncHandler = require('../../utils/asyncHandler');

const listCategories = asyncHandler(async (req, res) => {
  const items = await categoryService.listCategories();

  return res.status(200).json({
    success: true,
    message: 'OK',
    data: { items },
  });
});

const listTrash = asyncHandler(async (req, res) => {
  const items = await categoryService.listCategories({ deleted: true });

  return res.status(200).json({
    success: true,
    message: 'OK',
    data: { items },
  });
});

const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body);

  return res.status(201).json({
    success: true,
    message: 'Category created',
    data: { category },
  });
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.body);

  return res.status(200).json({
    success: true,
    message: 'Category updated',
    data: { category },
  });
});

const softDeleteCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.softDeleteCategory(req.params.id);

  return res.status(200).json({
    success: true,
    message: 'Category moved to trash',
    data: { category },
  });
});

const restoreCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.restoreCategory(req.params.id);

  return res.status(200).json({
    success: true,
    message: 'Category restored',
    data: { category },
  });
});

const permanentDeleteCategory = asyncHandler(async (req, res) => {
  await categoryService.permanentDeleteCategory(req.params.id);

  return res.status(200).json({
    success: true,
    message: 'Category permanently deleted',
  });
});

module.exports = {
  listCategories,
  listTrash,
  createCategory,
  updateCategory,
  softDeleteCategory,
  restoreCategory,
  permanentDeleteCategory,
};
