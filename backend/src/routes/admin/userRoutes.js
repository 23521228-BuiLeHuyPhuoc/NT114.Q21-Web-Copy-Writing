const express = require('express');

const userController = require('../../controllers/admin/userController');
const { protect } = require('../../middlewares/auth/authMiddleware');
const validate = require('../../middlewares/validation/validate');
const {
  createAdminUserSchema,
  paramsWithAccountType,
  updateAdminUserSchema,
} = require('../../validations/adminUserValidation');

const router = express.Router();

router.use(protect('admin'));

router.get('/', userController.listUsers);
router.get('/trash', userController.listTrash);
router.post('/', validate(createAdminUserSchema), userController.createUser);
router.patch('/:accountType/:id', validate({ params: paramsWithAccountType, body: updateAdminUserSchema }), userController.updateUser);
router.delete('/:accountType/:id', validate(paramsWithAccountType, 'params'), userController.softDelete);
router.patch('/:accountType/:id/restore', validate(paramsWithAccountType, 'params'), userController.restore);
router.delete('/:accountType/:id/permanent', validate(paramsWithAccountType, 'params'), userController.permanentDelete);

module.exports = router;
