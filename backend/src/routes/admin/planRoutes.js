const express = require('express');

const planController = require('../../controllers/admin/planController');
const { protect } = require('../../middlewares/auth/authMiddleware');
const validate = require('../../middlewares/validation/validate');
const {
  createPlanSchema,
  paramsWithId,
  updatePlanSchema,
} = require('../../validations/billingValidation');

const router = express.Router();

router.use(protect('admin'));

router.get('/', planController.listPlans);
router.get('/trash', planController.listTrash);
router.post('/', validate(createPlanSchema), planController.createPlan);
router.patch('/:id', validate({ params: paramsWithId, body: updatePlanSchema }), planController.updatePlan);
router.delete('/:id', validate(paramsWithId, 'params'), planController.softDeletePlan);
router.patch('/:id/restore', validate(paramsWithId, 'params'), planController.restorePlan);
router.delete('/:id/permanent', validate(paramsWithId, 'params'), planController.permanentDeletePlan);

module.exports = router;
