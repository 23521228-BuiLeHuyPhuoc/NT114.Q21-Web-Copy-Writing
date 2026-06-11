const plagiarismService = require('../../services/plagiarismService');
const asyncHandler = require('../../utils/asyncHandler');

const checkPlagiarism = asyncHandler(async (req, res) => {
  const report = await plagiarismService.checkPlagiarism(req.user._id, req.body);

  return res.status(201).json({
    success: true,
    message: 'Plagiarism check completed',
    data: { report },
  });
});

const listReports = asyncHandler(async (req, res) => {
  const data = await plagiarismService.listReports(req.user._id, req.query);

  return res.status(200).json({
    success: true,
    message: 'OK',
    data,
  });
});

const getReport = asyncHandler(async (req, res) => {
  const report = await plagiarismService.getReport(req.user._id, req.params.id);

  return res.status(200).json({
    success: true,
    message: 'OK',
    data: { report },
  });
});

module.exports = {
  checkPlagiarism,
  listReports,
  getReport,
};
