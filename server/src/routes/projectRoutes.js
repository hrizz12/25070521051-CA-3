const express = require('express');
const {
  listProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const { listShots, createShot } = require('../controllers/shotController');
const { requireAuth } = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validate');

const router = express.Router();

router.use(requireAuth); // every route below needs a signed-in user

router.get('/', listProjects);
router.post('/', createProject);
router.get('/:id', validateObjectId('id'), getProject);
router.put('/:id', validateObjectId('id'), updateProject);
router.delete('/:id', validateObjectId('id'), deleteProject);

// Shots that belong to one project
router.get('/:projectId/shots', validateObjectId('projectId'), listShots);
router.post('/:projectId/shots', validateObjectId('projectId'), createShot);

module.exports = router;
