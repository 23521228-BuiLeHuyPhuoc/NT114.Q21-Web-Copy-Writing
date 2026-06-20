const contactSubmissionService = require('../../services/contactSubmissionService');
const asyncHandler = require('../../utils/asyncHandler');

const createSubmission = asyncHandler(async (req, res) => {
  const item = await contactSubmissionService.createSubmission(req.body, req);

  return res.status(201).json({
    success: true,
    message: 'Contact submission received',
    data: { item },
  });
});

module.exports = {
  createSubmission,
};
