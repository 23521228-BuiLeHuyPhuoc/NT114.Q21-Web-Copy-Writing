const express = require('express');

const templateController = require('../../controllers/admin/templateController');
const { protect } = require('../../middlewares/auth/authMiddleware');
const validate = require('../../middlewares/validation/validate');
const {
  createAdminTemplateSchema,
  listAdminTemplatesSchema,
  paramsWithId,
  updateAdminTemplateSchema,
} = require('../../validations/adminTemplateValidation');

const router = express.Router();

router.use(protect('admin'));

router.get('/', validate(listAdminTemplatesSchema, 'query'), templateController.listTemplates);
router.get('/trash', validate(listAdminTemplatesSchema, 'query'), templateController.listTrash);
router.post('/', validate(createAdminTemplateSchema), templateController.createTemplate);
router.patch('/:id', validate({ params: paramsWithId, body: updateAdminTemplateSchema }), templateController.updateTemplate);
router.delete('/:id', validate(paramsWithId, 'params'), templateController.archiveTemplate);
router.patch('/:id/restore', validate(paramsWithId, 'params'), templateController.restoreTemplate);
router.delete('/:id/permanent', validate(paramsWithId, 'params'), templateController.permanentDeleteTemplate);

module.exports = router;
