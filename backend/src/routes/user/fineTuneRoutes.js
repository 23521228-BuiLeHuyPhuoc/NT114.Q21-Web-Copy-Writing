const express = require('express');

const fineTuneController = require('../../controllers/user/fineTuneController');
const { protect } = require('../../middlewares/auth/authMiddleware');
const validate = require('../../middlewares/validation/validate');
const {
  addExamplesSchema,
  archiveDatasetsBulkSchema,
  createDatasetSchema,
  createFineTuneJobSchema,
  listDatasetsSchema,
  listExamplesSchema,
  listFineTuneJobsSchema,
  listFineTunedModelsSchema,
  paramsWithId,
  setFineTunedModelActiveSchema,
  updateDatasetSchema,
} = require('../../validations/fineTuneValidation');

const router = express.Router();

router.use(protect('user'));

router.get('/providers', fineTuneController.listProviders);
router.get('/quotas', fineTuneController.getQuotas);

router.get('/models', validate(listFineTunedModelsSchema, 'query'), fineTuneController.listFineTunedModels);
router.patch(
  '/models/:id/active',
  validate({ params: paramsWithId, body: setFineTunedModelActiveSchema }),
  fineTuneController.setFineTunedModelActive,
);

router.get('/datasets', validate(listDatasetsSchema, 'query'), fineTuneController.listDatasets);
router.post('/datasets', validate(createDatasetSchema), fineTuneController.createDataset);
router.post(
  '/datasets/archive-bulk',
  validate({ body: archiveDatasetsBulkSchema }),
  fineTuneController.archiveDatasets,
);
router.get(
  '/datasets/:id',
  validate({ params: paramsWithId, query: listExamplesSchema }),
  fineTuneController.getDataset,
);
router.patch(
  '/datasets/:id',
  validate({ params: paramsWithId, body: updateDatasetSchema }),
  fineTuneController.updateDataset,
);
router.post(
  '/datasets/:id/examples',
  validate({ params: paramsWithId, body: addExamplesSchema }),
  fineTuneController.addExamples,
);
router.get(
  '/datasets/:id/examples',
  validate({ params: paramsWithId, query: listExamplesSchema }),
  fineTuneController.listExamples,
);
router.post('/datasets/:id/validate', validate(paramsWithId, 'params'), fineTuneController.validateDataset);
router.post('/datasets/:id/archive', validate(paramsWithId, 'params'), fineTuneController.archiveDataset);

router.get('/jobs', validate(listFineTuneJobsSchema, 'query'), fineTuneController.listFineTuneJobs);
router.post('/jobs', validate(createFineTuneJobSchema), fineTuneController.createFineTuneJob);
router.get('/jobs/:id', validate(paramsWithId, 'params'), fineTuneController.getFineTuneJob);
router.post('/jobs/:id/cancel', validate(paramsWithId, 'params'), fineTuneController.cancelFineTuneJob);
router.post('/jobs/:id/retry', validate(paramsWithId, 'params'), fineTuneController.retryFineTuneJob);
router.get('/jobs/:id/logs', validate(paramsWithId, 'params'), fineTuneController.listJobLogs);
router.get('/jobs/:id/metrics', validate(paramsWithId, 'params'), fineTuneController.listJobMetrics);
router.post('/jobs/:id/promote', validate(paramsWithId, 'params'), fineTuneController.promoteFineTuneJob);

module.exports = router;
