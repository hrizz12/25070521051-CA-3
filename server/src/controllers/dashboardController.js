const Project = require('../models/Project');
const Shot = require('../models/Shot');

// GET /api/dashboard
async function getDashboard(req, res, next) {
  try {
    const owner = req.user._id;

    const [totalProjects, totalShots, completedShots, recent] = await Promise.all([
      Project.countDocuments({ owner }),
      Shot.countDocuments({ owner }),
      Shot.countDocuments({ owner, status: 'Completed' }),
      Project.find({ owner }).sort({ updatedAt: -1 }).limit(5),
    ]);

    // Shot counts for the 5 recent projects
    const counts = await Shot.aggregate([
      { $match: { owner, project: { $in: recent.map((p) => p._id) } } },
      {
        $group: {
          _id: '$project',
          shotCount: { $sum: 1 },
          completedCount: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } },
        },
      },
    ]);
    const byProject = new Map(counts.map((c) => [String(c._id), c]));

    const recentProjects = recent.map((p) => {
      const c = byProject.get(String(p._id));
      return { ...p.toObject(), shotCount: c ? c.shotCount : 0, completedCount: c ? c.completedCount : 0 };
    });

    res.json({ stats: { totalProjects, totalShots, completedShots }, recentProjects });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboard };
