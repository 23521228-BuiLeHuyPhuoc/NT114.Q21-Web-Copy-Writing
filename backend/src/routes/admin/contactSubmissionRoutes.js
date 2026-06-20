const express = require('express');

const contactSubmissionController = require('../../controllers/admin/contactSubmissionController');
const { protect } = require('../../middlewares/auth/authMiddleware');
const validate = require('../../middlewares/validation/validate');
const {
  listContactSubmissionsSchema,
  paramsWithId,
  updateContactSubmissionSchema,
} = require('../../validations/contactSubmissionValidation');

const router = express.Router();

router.use(protect('admin'));

router.get('/', validate(listContactSubmissionsSchema, 'query'), contactSubmissionController.listSubmissions);
router.get('/:id', validate(paramsWithId, 'params'), contactSubmissionController.getSubmission);
router.patch('/:id', validate({ params: paramsWithId, body: updateContactSubmissionSchema }), contactSubmissionController.updateSubmission);
router.delete('/:id', validate(paramsWithId, 'params'), contactSubmissionController.deleteSubmission);

module.exports = router;
