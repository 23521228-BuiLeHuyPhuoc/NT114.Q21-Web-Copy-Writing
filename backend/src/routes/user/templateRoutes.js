const express = require('express');

const templateController = require('../../controllers/user/templateController');
const { protect } = require('../../middlewares/auth/authMiddleware');
const validate = require('../../middlewares/validation/validate');
const {
  createTemplateSchema,
  listTemplatesSchema,
  paramsWithId,
} = require('../../validations/templateValidation');

const router = express.Router();

router.use(protect('user'));

router.get('/', validate(listTemplatesSchema, 'query'), templateController.listTemplates);
router.post('/', validate(createTemplateSchema), templateController.createTemplate);
router.get('/:id', validate(paramsWithId, 'params'), templateController.getTemplate);

module.exports = router;
