const express = require('express');

const contactSubmissionController = require('../../controllers/user/contactSubmissionController');
const validate = require('../../middlewares/validation/validate');
const { createContactSubmissionSchema } = require('../../validations/contactSubmissionValidation');

const router = express.Router();

router.post('/', validate(createContactSubmissionSchema), contactSubmissionController.createSubmission);

module.exports = router;
