const express = require('express');

const contentController = require('../../controllers/admin/contentController');
const { protect } = require('../../middlewares/auth/authMiddleware');
const validate = require('../../middlewares/validation/validate');
const {
  listAdminContentsSchema,
  paramsWithId,
  updateAdminContentSchema,
} = require('../../validations/adminContentValidation');

const router = express.Router();

router.use(protect('admin'));

router.get('/', validate(listAdminContentsSchema, 'query'), contentController.listContents);
router.get('/trash', validate(listAdminContentsSchema, 'query'), contentController.listTrash);
router.get('/:id', validate(paramsWithId, 'params'), contentController.getContent);
router.patch('/:id', validate({ params: paramsWithId, body: updateAdminContentSchema }), contentController.updateContent);
router.delete('/:id', validate(paramsWithId, 'params'), contentController.softDeleteContent);
router.patch('/:id/restore', validate(paramsWithId, 'params'), contentController.restoreContent);
router.delete('/:id/permanent', validate(paramsWithId, 'params'), contentController.permanentDeleteContent);

module.exports = router;
