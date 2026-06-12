const express = require('express');

const plagiarismController = require('../../controllers/user/plagiarismController');
const { protect } = require('../../middlewares/auth/authMiddleware');
const validate = require('../../middlewares/validation/validate');
const {
  checkPlagiarismSchema,
  debugCommonCrawlSchema,
  listReportsSchema,
  paramsWithId,
} = require('../../validations/plagiarismValidation');

const router = express.Router();

router.use(protect('user'));

router.get('/history', validate(listReportsSchema, 'query'), plagiarismController.listReports);
router.post('/debug/common-crawl', validate(debugCommonCrawlSchema), plagiarismController.debugCommonCrawl);
router.post('/debug/serpapi-common-crawl', validate(debugCommonCrawlSchema), plagiarismController.debugCommonCrawl);
router.post('/check', validate(checkPlagiarismSchema), plagiarismController.checkPlagiarism);
router.get('/:id', validate(paramsWithId, 'params'), plagiarismController.getReport);

module.exports = router;
