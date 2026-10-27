// Request validation helpers. Each "validate..." function returns an object:
//   { errors: [ 'message', ... ], data: { cleaned values } }
// If errors is not empty, the controller answers with 400.
const mongoose = require('mongoose');
const { PROJECT_STATUSES } = require('../models/Project');
const { SHOT_TYPES, SHOT_STATUSES } = require('../models/Shot');

// Express middleware: rejects URLs that contain an invalid MongoDB id.
function validateObjectId(...paramNames) {
  return (req, res, next) => {
    for (const name of paramNames) {
      if (!mongoose.isValidObjectId(req.params[name])) {
        return res.status(400).json({ message: `Invalid ${name}` });
      }
    }
    next();
  };
}

// Make sure a value is a plain string (stops objects such as {"$gt": ""} from sneaking in).
function asString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function validateRegister(body) {
  const errors = [];
  const username = asString(body.username);
  const email = asString(body.email).toLowerCase();
  const password = typeof body.password === 'string' ? body.password : '';

  if (username.length < 3 || username.length > 30) errors.push('Username must be 3-30 characters');
  if (!/^\S+@\S+\.\S+$/.test(email)) errors.push('Please enter a valid email address');
  if (password.length < 8) errors.push('Password must be at least 8 characters');
  else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    errors.push('Password must contain at least one letter and one number');
  }
  if (password.length > 72) errors.push('Password must be at most 72 characters');

  return { errors, data: { username, email, password } };
}

function validateLogin(body) {
  const errors = [];
  const email = asString(body.email).toLowerCase();
  const password = typeof body.password === 'string' ? body.password : '';
  if (!email) errors.push('Email is required');
  if (!password) errors.push('Password is required');
  return { errors, data: { email, password } };
}

function validateProject(body) {
  const errors = [];
  const title = asString(body.title);
  const description = asString(body.description);
  const location = asString(body.location);
  const status = body.status === undefined || body.status === '' ? 'Planning' : body.status;

  if (!title) errors.push('Project title is required');
  else if (title.length > 100) errors.push('Title must be at most 100 characters');
  if (description.length > 500) errors.push('Description must be at most 500 characters');
  if (location.length > 150) errors.push('Location must be at most 150 characters');
  if (!PROJECT_STATUSES.includes(status)) errors.push('Status must be Planning, In Production or Completed');

  let shootDate = null;
  if (body.shootDate !== undefined && body.shootDate !== null && body.shootDate !== '') {
    const parsed = new Date(body.shootDate);
    if (typeof body.shootDate !== 'string' || Number.isNaN(parsed.getTime())) {
      errors.push('Shoot date is not a valid date');
    } else {
      shootDate = parsed;
    }
  }

  return { errors, data: { title, description, status, shootDate, location } };
}

function validateShot(body) {
  const errors = [];
  const title = asString(body.title);
  const cameraAngle = asString(body.cameraAngle);
  const cameraMovement = asString(body.cameraMovement);
  const location = asString(body.location);
  const equipmentNotes = asString(body.equipmentNotes);
  const actionDescription = asString(body.actionDescription);
  const shotType = body.shotType === undefined || body.shotType === '' ? 'Wide' : body.shotType;
  const status = body.status === undefined || body.status === '' ? 'Planned' : body.status;

  const sceneNumber = Number(body.sceneNumber);
  const shotNumber = Number(body.shotNumber);
  const estimatedDuration =
    body.estimatedDuration === undefined || body.estimatedDuration === '' ? 0 : Number(body.estimatedDuration);

  if (!title) errors.push('Shot title is required');
  else if (title.length > 100) errors.push('Title must be at most 100 characters');
  if (!Number.isInteger(sceneNumber) || sceneNumber < 1 || sceneNumber > 9999) {
    errors.push('Scene number must be a whole number from 1 to 9999');
  }
  if (!Number.isInteger(shotNumber) || shotNumber < 1 || shotNumber > 9999) {
    errors.push('Shot number must be a whole number from 1 to 9999');
  }
  if (!Number.isFinite(estimatedDuration) || estimatedDuration < 0 || estimatedDuration > 36000) {
    errors.push('Duration must be between 0 and 36000 seconds');
  }
  if (!SHOT_TYPES.includes(shotType)) errors.push('Shot type must be Wide, Medium, Close-up or POV');
  if (!SHOT_STATUSES.includes(status)) errors.push('Status must be Planned, Ready or Completed');
  if (cameraAngle.length > 60) errors.push('Camera angle must be at most 60 characters');
  if (cameraMovement.length > 60) errors.push('Camera movement must be at most 60 characters');
  if (location.length > 150) errors.push('Location must be at most 150 characters');
  if (equipmentNotes.length > 500) errors.push('Equipment notes must be at most 500 characters');
  if (actionDescription.length > 500) errors.push('Action description must be at most 500 characters');

  return {
    errors,
    data: {
      title,
      sceneNumber,
      shotNumber,
      shotType,
      cameraAngle,
      cameraMovement,
      location,
      equipmentNotes,
      actionDescription,
      estimatedDuration,
      status,
    },
  };
}

function validateShotStatus(body) {
  const errors = [];
  if (!SHOT_STATUSES.includes(body.status)) errors.push('Status must be Planned, Ready or Completed');
  return { errors, data: { status: body.status } };
}

module.exports = {
  validateObjectId,
  validateRegister,
  validateLogin,
  validateProject,
  validateShot,
  validateShotStatus,
};
