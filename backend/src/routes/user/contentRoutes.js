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
router.post('/generate', validate(generateContentSchema), contentController.generateContent);
router.post('/', validate(createContentSchema), contentController.createContent);
router.get('/:id', validate(paramsWithId, 'params'), contentController.getContent);
router.patch('/:id', validate({ params: paramsWithId, body: updateContentSchema }), contentController.updateContent);
router.delete('/:id', validate(paramsWithId, 'params'), contentController.deleteContent);

module.exports = router;
