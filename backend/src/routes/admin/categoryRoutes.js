const express = require('express');

const categoryController = require('../../controllers/admin/categoryController');
const { protect } = require('../../middlewares/auth/authMiddleware');
const validate = require('../../middlewares/validation/validate');
const {
  createCategorySchema,
  paramsWithId,
  updateCategorySchema,
} = require('../../validations/categoryValidation');

const router = express.Router();

router.use(protect('admin'));

router.get('/', categoryController.listCategories);
router.get('/trash', categoryController.listTrash);
router.post('/', validate(createCategorySchema), categoryController.createCategory);
router.patch('/:id', validate({ params: paramsWithId, body: updateCategorySchema }), categoryController.updateCategory);
router.delete('/:id', validate(paramsWithId, 'params'), categoryController.softDeleteCategory);
router.patch('/:id/restore', validate(paramsWithId, 'params'), categoryController.restoreCategory);
router.delete('/:id/permanent', validate(paramsWithId, 'params'), categoryController.permanentDeleteCategory);

module.exports = router;
