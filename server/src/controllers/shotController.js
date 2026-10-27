const Project = require('../models/Project');
const Shot = require('../models/Shot');
const { validateShot, validateShotStatus } = require('../middleware/validate');

// When a shot changes, the project counts as "recently updated" on the dashboard.
async function touchProject(projectId) {
  await Project.updateOne({ _id: projectId }, { $set: { updatedAt: new Date() } });
}

// GET /api/projects/:projectId/shots?status=...&sort=scene|shot&order=asc|desc
async function listShots(req, res, next) {
  try {
    const project = await Project.findOne({ _id: req.params.projectId, owner: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const filter = { project: project._id, owner: req.user._id };
    if (typeof req.query.status === 'string' && req.query.status) {
      filter.status = req.query.status;
    }

    const direction = req.query.order === 'desc' ? -1 : 1;
    const sort =
      req.query.sort === 'shot'
        ? { shotNumber: direction, sceneNumber: direction }
        : { sceneNumber: direction, shotNumber: direction };

    const shots = await Shot.find(filter).sort(sort);
    res.json({ shots });
  } catch (err) {
    next(err);
  }
}

// POST /api/projects/:projectId/shots
async function createShot(req, res, next) {
  try {
    const project = await Project.findOne({ _id: req.params.projectId, owner: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const { errors, data } = validateShot(req.body);
    if (errors.length > 0) return res.status(400).json({ message: errors[0], errors });

    const shot = await Shot.create({ ...data, owner: req.user._id, project: project._id });
    await touchProject(project._id);
    res.status(201).json({ message: 'Shot created', shot });
  } catch (err) {
    next(err);
  }
}

// GET /api/shots/:id
async function getShot(req, res, next) {
  try {
    const shot = await Shot.findOne({ _id: req.params.id, owner: req.user._id });
    if (!shot) return res.status(404).json({ message: 'Shot not found' });
    res.json({ shot });
  } catch (err) {
    next(err);
  }
}

// PUT /api/shots/:id   (the project of a shot can never be changed)
async function updateShot(req, res, next) {
  try {
    const { errors, data } = validateShot(req.body);
    if (errors.length > 0) return res.status(400).json({ message: errors[0], errors });

    const shot = await Shot.findOneAndUpdate({ _id: req.params.id, owner: req.user._id }, data, {
      new: true,
      runValidators: true,
    });
    if (!shot) return res.status(404).json({ message: 'Shot not found' });

    await touchProject(shot.project);
    res.json({ message: 'Shot updated', shot });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/shots/:id/status   body: { "status": "Completed" }
async function updateShotStatus(req, res, next) {
  try {
    const { errors, data } = validateShotStatus(req.body);
    if (errors.length > 0) return res.status(400).json({ message: errors[0], errors });

    const shot = await Shot.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { status: data.status },
      { new: true, runValidators: true }
    );
    if (!shot) return res.status(404).json({ message: 'Shot not found' });

    await touchProject(shot.project);
    res.json({ message: `Shot marked ${shot.status}`, shot });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/shots/:id
async function deleteShot(req, res, next) {
  try {
    const shot = await Shot.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!shot) return res.status(404).json({ message: 'Shot not found' });

    await touchProject(shot.project);
    res.json({ message: 'Shot deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listShots, createShot, getShot, updateShot, updateShotStatus, deleteShot };
