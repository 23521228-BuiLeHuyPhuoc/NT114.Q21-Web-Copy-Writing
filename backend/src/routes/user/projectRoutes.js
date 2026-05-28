const express = require('express');

const projectController = require('../../controllers/user/projectController');
const { protect } = require('../../middlewares/auth/authMiddleware');
const validate = require('../../middlewares/validation/validate');
const {
  createProjectSchema,
  listProjectsSchema,
  paramsWithId,
  updateProjectSchema,
} = require('../../validations/projectValidation');

const router = express.Router();

router.use(protect('user'));

router.get('/', validate(listProjectsSchema, 'query'), projectController.listProjects);
router.post('/', validate(createProjectSchema), projectController.createProject);
router.get('/:id', validate(paramsWithId, 'params'), projectController.getProject);
router.patch('/:id', validate({ params: paramsWithId, body: updateProjectSchema }), projectController.updateProject);

module.exports = router;
