const Project = require('../models/Project');
const Shot = require('../models/Shot');
const { validateProject } = require('../middleware/validate');

// Turn a text like "a.b" into "a\.b" so users can't inject regex characters into search.
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Adds shotCount and completedCount to each project (one extra query for all projects).
async function withShotCounts(projects, ownerId) {
  const counts = await Shot.aggregate([
    { $match: { owner: ownerId, project: { $in: projects.map((p) => p._id) } } },
    {
      $group: {
        _id: '$project',
        shotCount: { $sum: 1 },
        completedCount: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } },
      },
    },
  ]);
  const byProject = new Map(counts.map((c) => [String(c._id), c]));
  return projects.map((p) => {
    const c = byProject.get(String(p._id));
    return { ...p.toObject(), shotCount: c ? c.shotCount : 0, completedCount: c ? c.completedCount : 0 };
  });
}

// GET /api/projects?search=...&status=...
async function listProjects(req, res, next) {
  try {
    const filter = { owner: req.user._id };

    if (typeof req.query.search === 'string' && req.query.search.trim()) {
      filter.title = { $regex: escapeRegex(req.query.search.trim()), $options: 'i' };
    }
    if (typeof req.query.status === 'string' && req.query.status) {
      filter.status = req.query.status;
    }

    const projects = await Project.find(filter).sort({ updatedAt: -1 });
    res.json({ projects: await withShotCounts(projects, req.user._id) });
  } catch (err) {
    next(err);
  }
}

// POST /api/projects
async function createProject(req, res, next) {
  try {
    const { errors, data } = validateProject(req.body);
    if (errors.length > 0) return res.status(400).json({ message: errors[0], errors });

    const project = await Project.create({ ...data, owner: req.user._id });
    res.status(201).json({ message: 'Project created', project });
  } catch (err) {
    next(err);
  }
}

// GET /api/projects/:id
async function getProject(req, res, next) {
  try {
    // Filtering by owner means another user's project simply "does not exist" for you.
    const project = await Project.findOne({ _id: req.params.id, owner: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const [withCounts] = await withShotCounts([project], req.user._id);
    res.json({ project: withCounts });
  } catch (err) {
    next(err);
  }
}

// PUT /api/projects/:id
async function updateProject(req, res, next) {
  try {
    const { errors, data } = validateProject(req.body);
    if (errors.length > 0) return res.status(400).json({ message: errors[0], errors });

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      data,
      { new: true, runValidators: true }
    );
    if (!project) return res.status(404).json({ message: 'Project not found' });

    res.json({ message: 'Project updated', project });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/projects/:id  (also deletes all shots of the project)
async function deleteProject(req, res, next) {
  try {
    const project = await Project.findOne({ _id: req.params.id, owner: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Delete the shots first so no orphaned shots are ever left behind.
    const shotResult = await Shot.deleteMany({ project: project._id, owner: req.user._id });
    await project.deleteOne();

    res.json({ message: 'Project deleted', deletedShots: shotResult.deletedCount });
  } catch (err) {
    next(err);
  }
}

module.exports = { listProjects, createProject, getProject, updateProject, deleteProject };
