const express = require('express');
const {
  getShot,
  updateShot,
  updateShotStatus,
  deleteShot,
} = require('../controllers/shotController');
const { requireAuth } = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validate');

const router = express.Router();

router.use(requireAuth);

router.get('/:id', validateObjectId('id'), getShot);
router.put('/:id', validateObjectId('id'), updateShot);
router.patch('/:id/status', validateObjectId('id'), updateShotStatus);
router.delete('/:id', validateObjectId('id'), deleteShot);

module.exports = router;
