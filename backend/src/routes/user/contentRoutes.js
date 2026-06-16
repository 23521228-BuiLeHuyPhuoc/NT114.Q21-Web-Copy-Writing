const express = require('express');

const contentController = require('../../controllers/user/contentController');
const { protect } = require('../../middlewares/auth/authMiddleware');
const validate = require('../../middlewares/validation/validate');
const {
  createContentSchema,
  generateContentSchema,
  listContentsSchema,
  paramsWithId,
  updateContentSchema,
} = require('../../validations/contentValidation');

const router = express.Router();

router.use(protect('user'));

router.get('/', validate(listContentsSchema, 'query'), contentController.listContents);
router.get('/trash', validate(listContentsSchema, 'query'), contentController.listTrash);
router.post('/generate', validate(generateContentSchema), contentController.generateContent);
router.post('/', validate(createContentSchema), contentController.createContent);
router.get('/:id', validate(paramsWithId, 'params'), contentController.getContent);
router.patch('/:id', validate({ params: paramsWithId, body: updateContentSchema }), contentController.updateContent);
router.delete('/:id', validate(paramsWithId, 'params'), contentController.deleteContent);
router.patch('/:id/restore', validate(paramsWithId, 'params'), contentController.restoreContent);
router.delete('/:id/permanent', validate(paramsWithId, 'params'), contentController.permanentDeleteContent);

module.exports = router;
