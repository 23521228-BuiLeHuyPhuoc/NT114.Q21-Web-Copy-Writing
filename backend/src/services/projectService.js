const Content = require('../models/Content');
const Project = require('../models/Project');
const createError = require('../utils/createError');

const PROJECT_COLORS = [
  'from-green-500 to-emerald-600',
  'from-green-500 to-teal-600',
  'from-teal-500 to-emerald-600',
  'from-orange-500 to-red-500',
  'from-teal-500 to-green-600',
  'from-pink-500 to-rose-600',
];

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toId(value) {
  return value ? value.toString() : null;
}

function normalizePage(query) {
  return Math.max(1, Number(query.page || 1));
}

function normalizeLimit(query) {
  return Math.min(50, Math.max(1, Number(query.limit || 10)));
}

function buildSearchFilter(search) {
  if (!search) return {};

  const regex = new RegExp(escapeRegExp(search), 'i');
  return {
    $or: [
      { name: regex },
      { description: regex },
    ],
  };
}

function serializeProject(project, contentCount = 0) {
  return {
    id: project._id.toString(),
    _id: project._id.toString(),
    userId: toId(project.userId),
    name: project.name,
    description: project.description || '',
    desc: project.description || '',
    isArchived: Boolean(project.isArchived),
    status: project.isArchived ? 'archived' : 'active',
    color: project.color || PROJECT_COLORS[0],
    contentCount,
    contents: contentCount,
    industry: 'General',
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

async function countContentsByProject(userId, projectIds) {
  if (projectIds.length === 0) return new Map();

  const rows = await Content.aggregate([
    {
      $match: {
        userId,
        isDeleted: { $ne: true },
        projectId: { $in: projectIds },
      },
    },
    {
      $group: {
        _id: '$projectId',
        count: { $sum: 1 },
      },
    },
  ]);

  return new Map(rows.map((row) => [row._id.toString(), row.count]));
}

async function listProjects(userId, query = {}) {
  const page = normalizePage(query);
  const limit = normalizeLimit(query);
  const filter = {
    userId,
    ...buildSearchFilter(query.search),
  };

  if (!query.includeArchived) {
    filter.isArchived = { $ne: true };
  }

  const [totalItems, projects] = await Promise.all([
    Project.countDocuments(filter),
    Project.find(filter)
      .sort({ updatedAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
  ]);

  const counts = await countContentsByProject(userId, projects.map((project) => project._id));

  return {
    items: projects.map((project) => serializeProject(project, counts.get(project._id.toString()) || 0)),
    pagination: {
      page,
      limit,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / limit)),
    },
  };
}

async function findProjectOrThrow(userId, id) {
  const project = await Project.findOne({
    _id: id,
    userId,
  });

  if (!project) {
    throw createError(404, 'Project not found');
  }

  return project;
}

async function getProject(userId, id) {
  const project = await findProjectOrThrow(userId, id);
  const contentCount = await Content.countDocuments({
    userId,
    projectId: project._id,
    isDeleted: { $ne: true },
  });

  return serializeProject(project, contentCount);
}

async function createProject(userId, payload) {
  const existingCount = await Project.countDocuments({ userId });
  const project = await Project.create({
    userId,
    name: payload.name,
    description: payload.description || '',
    color: payload.color || PROJECT_COLORS[existingCount % PROJECT_COLORS.length],
  });

  return serializeProject(project, 0);
}

async function updateProject(userId, id, payload) {
  const project = await findProjectOrThrow(userId, id);

  if (payload.name !== undefined) project.name = payload.name;
  if (payload.description !== undefined) project.description = payload.description;
  if (payload.isArchived !== undefined) project.isArchived = payload.isArchived;
  if (payload.color !== undefined) project.color = payload.color;

  await project.save();

  const contentCount = await Content.countDocuments({
    userId,
    projectId: project._id,
    isDeleted: { $ne: true },
  });

  return serializeProject(project, contentCount);
}

async function ensureProjectBelongsToUser(userId, projectId) {
  if (!projectId) return null;

  const project = await Project.findOne({
    _id: projectId,
    userId,
    isArchived: { $ne: true },
  });

  if (!project) {
    throw createError(404, 'Project not found');
  }

  return project;
}

module.exports = {
  serializeProject,
  listProjects,
  getProject,
  createProject,
  updateProject,
  ensureProjectBelongsToUser,
};
