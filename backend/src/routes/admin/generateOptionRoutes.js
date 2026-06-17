const express = require('express');

const generateOptionController = require('../../controllers/admin/generateOptionController');
const { protect } = require('../../middlewares/auth/authMiddleware');
const validate = require('../../middlewares/validation/validate');
const {
  createGenerateOptionSchema,
  groupParam,
  paramsWithGroupAndId,
  updateGenerateOptionSchema,
} = require('../../validations/generateOptionValidation');

const router = express.Router();

router.use(protect('admin'));

router.get('/:group', validate(groupParam, 'params'), generateOptionController.listOptions);
router.get('/:group/trash', validate(groupParam, 'params'), generateOptionController.listTrash);
router.post('/:group', validate({ params: groupParam, body: createGenerateOptionSchema }), generateOptionController.createOption);
router.patch('/:group/:id', validate({ params: paramsWithGroupAndId, body: updateGenerateOptionSchema }), generateOptionController.updateOption);
router.delete('/:group/:id', validate(paramsWithGroupAndId, 'params'), generateOptionController.softDeleteOption);
router.patch('/:group/:id/restore', validate(paramsWithGroupAndId, 'params'), generateOptionController.restoreOption);
router.delete('/:group/:id/permanent', validate(paramsWithGroupAndId, 'params'), generateOptionController.permanentDeleteOption);

module.exports = router;
