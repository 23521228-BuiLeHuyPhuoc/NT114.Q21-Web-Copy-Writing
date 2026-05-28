const projectService = require('../../services/projectService');
const asyncHandler = require('../../utils/asyncHandler');

const listProjects = asyncHandler(async (req, res) => {
  const data = await projectService.listProjects(req.user._id, req.query);

  return res.status(200).json({
    success: true,
    message: 'OK',
    data,
  });
});

const getProject = asyncHandler(async (req, res) => {
  const item = await projectService.getProject(req.user._id, req.params.id);

  return res.status(200).json({
    success: true,
    message: 'OK',
    data: { item },
  });
});

const createProject = asyncHandler(async (req, res) => {
  const item = await projectService.createProject(req.user._id, req.body);

  return res.status(201).json({
    success: true,
    message: 'Project created',
    data: { item },
  });
});

const updateProject = asyncHandler(async (req, res) => {
  const item = await projectService.updateProject(req.user._id, req.params.id, req.body);

  return res.status(200).json({
    success: true,
    message: 'Project updated',
    data: { item },
  });
});

module.exports = {
  listProjects,
  getProject,
  createProject,
  updateProject,
};
