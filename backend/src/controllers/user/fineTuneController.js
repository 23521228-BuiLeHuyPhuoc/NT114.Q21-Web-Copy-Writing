const fineTuneService = require('../../services/fineTuneService');
const asyncHandler = require('../../utils/asyncHandler');

const listDatasets = asyncHandler(async (req, res) => {
  const data = await fineTuneService.listDatasets(req.user._id, req.query);

  return res.status(200).json({
    success: true,
    message: 'OK',
    data,
  });
});

const getDataset = asyncHandler(async (req, res) => {
  const data = await fineTuneService.getDataset(req.user._id, req.params.id, req.query);

  return res.status(200).json({
    success: true,
    message: 'OK',
    data,
  });
});

const createDataset = asyncHandler(async (req, res) => {
  const item = await fineTuneService.createDataset(req.user._id, req.body);

  return res.status(201).json({
    success: true,
    message: 'Fine-tune dataset created',
    data: { item },
  });
});

const updateDataset = asyncHandler(async (req, res) => {
  const item = await fineTuneService.updateDataset(req.user._id, req.params.id, req.body);

  return res.status(200).json({
    success: true,
    message: 'Fine-tune dataset updated',
    data: { item },
  });
});

const addExamples = asyncHandler(async (req, res) => {
  const data = await fineTuneService.addExamples(req.user._id, req.params.id, req.body);

  return res.status(201).json({
    success: true,
    message: 'Fine-tune examples added',
    data,
  });
});

const listExamples = asyncHandler(async (req, res) => {
  const data = await fineTuneService.listExamples(req.user._id, req.params.id, req.query);

  return res.status(200).json({
    success: true,
    message: 'OK',
    data,
  });
});

const validateDataset = asyncHandler(async (req, res) => {
  const item = await fineTuneService.validateDataset(req.user._id, req.params.id);

  return res.status(200).json({
    success: true,
    message: 'Fine-tune dataset validated',
    data: { item },
  });
});

const archiveDataset = asyncHandler(async (req, res) => {
  const item = await fineTuneService.archiveDataset(req.user._id, req.params.id);

  return res.status(200).json({
    success: true,
    message: 'Fine-tune dataset archived',
    data: { item },
  });
});

const archiveDatasets = asyncHandler(async (req, res) => {
  const data = await fineTuneService.archiveDatasets(req.user._id, req.body.ids);

  return res.status(200).json({
    success: true,
    message: 'Fine-tune datasets archived',
    data,
  });
});

const listFineTuneJobs = asyncHandler(async (req, res) => {
  const data = await fineTuneService.listFineTuneJobs(req.user._id, req.query);

  return res.status(200).json({
    success: true,
    message: 'OK',
    data,
  });
});

const getFineTuneJob = asyncHandler(async (req, res) => {
  const item = await fineTuneService.getFineTuneJob(req.user._id, req.params.id);

  return res.status(200).json({
    success: true,
    message: 'OK',
    data: { item },
  });
});

const createFineTuneJob = asyncHandler(async (req, res) => {
  const item = await fineTuneService.createFineTuneJob(req.user._id, req.body);

  return res.status(201).json({
    success: true,
    message: 'Fine-tune job created',
    data: { item },
  });
});

const cancelFineTuneJob = asyncHandler(async (req, res) => {
  const item = await fineTuneService.cancelFineTuneJob(req.user._id, req.params.id);

  return res.status(200).json({
    success: true,
    message: 'Fine-tune job cancelled',
    data: { item },
  });
});

const retryFineTuneJob = asyncHandler(async (req, res) => {
  const item = await fineTuneService.retryFineTuneJob(req.user._id, req.params.id);

  return res.status(201).json({
    success: true,
    message: 'Fine-tune job queued again',
    data: { item },
  });
});

const listJobLogs = asyncHandler(async (req, res) => {
  const data = await fineTuneService.listJobLogs(req.user._id, req.params.id);

  return res.status(200).json({
    success: true,
    message: 'OK',
    data,
  });
});

const listJobMetrics = asyncHandler(async (req, res) => {
  const data = await fineTuneService.listJobMetrics(req.user._id, req.params.id);

  return res.status(200).json({
    success: true,
    message: 'OK',
    data,
  });
});

const promoteFineTuneJob = asyncHandler(async (req, res) => {
  const item = await fineTuneService.promoteFineTuneJob(req.user._id, req.params.id);

  return res.status(201).json({
    success: true,
    message: 'Fine-tuned model promoted',
    data: { item },
  });
});

const listFineTunedModels = asyncHandler(async (req, res) => {
  const data = await fineTuneService.listFineTunedModels(req.user._id, req.query);

  return res.status(200).json({
    success: true,
    message: 'OK',
    data,
  });
});

const setFineTunedModelActive = asyncHandler(async (req, res) => {
  const item = await fineTuneService.setFineTunedModelActive(req.user._id, req.params.id, req.body);

  return res.status(200).json({
    success: true,
    message: 'Fine-tuned model updated',
    data: { item },
  });
});

const listProviders = asyncHandler(async (req, res) => {
  const data = fineTuneService.listProviders();

  return res.status(200).json({
    success: true,
    message: 'OK',
    data,
  });
});

const getQuotas = asyncHandler(async (req, res) => {
  const data = await fineTuneService.getQuotas(req.user._id);

  return res.status(200).json({
    success: true,
    message: 'OK',
    data,
  });
});

module.exports = {
  listDatasets,
  getDataset,
  createDataset,
  updateDataset,
  addExamples,
  listExamples,
  validateDataset,
  archiveDataset,
  archiveDatasets,
  listFineTuneJobs,
  getFineTuneJob,
  createFineTuneJob,
  cancelFineTuneJob,
  retryFineTuneJob,
  listJobLogs,
  listJobMetrics,
  promoteFineTuneJob,
  listFineTunedModels,
  setFineTunedModelActive,
  listProviders,
  getQuotas,
};
