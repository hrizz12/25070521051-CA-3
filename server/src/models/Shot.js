const mongoose = require('mongoose');

const SHOT_TYPES = ['Wide', 'Medium', 'Close-up', 'POV'];
const SHOT_STATUSES = ['Planned', 'Ready', 'Completed'];

const shotSchema = new mongoose.Schema(
  {
    // Every shot stores BOTH its owner and its project. Queries always check the owner.
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Shot title is required'],
      trim: true,
      maxlength: [100, 'Title must be at most 100 characters'],
    },
    sceneNumber: {
      type: Number,
      required: [true, 'Scene number is required'],
      min: [1, 'Scene number must be at least 1'],
      max: [9999, 'Scene number is too large'],
    },
    shotNumber: {
      type: Number,
      required: [true, 'Shot number is required'],
      min: [1, 'Shot number must be at least 1'],
      max: [9999, 'Shot number is too large'],
    },
    shotType: {
      type: String,
      enum: { values: SHOT_TYPES, message: 'Shot type must be Wide, Medium, Close-up or POV' },
      default: 'Wide',
    },
    cameraAngle: { type: String, trim: true, maxlength: 60, default: '' },
    cameraMovement: { type: String, trim: true, maxlength: 60, default: '' },
    location: { type: String, trim: true, maxlength: 150, default: '' },
    equipmentNotes: { type: String, trim: true, maxlength: 500, default: '' },
    actionDescription: { type: String, trim: true, maxlength: 500, default: '' },
    estimatedDuration: {
      type: Number,
      min: [0, 'Duration cannot be negative'],
      max: [36000, 'Duration is too large'],
      default: 0,
    },
    status: {
      type: String,
      enum: { values: SHOT_STATUSES, message: 'Status must be Planned, Ready or Completed' },
      default: 'Planned',
    },
  },
  { timestamps: true }
);

// Fast lookup + natural ordering of the shot list inside one project.
shotSchema.index({ project: 1, sceneNumber: 1, shotNumber: 1 });

module.exports = mongoose.model('Shot', shotSchema);
module.exports.SHOT_TYPES = SHOT_TYPES;
module.exports.SHOT_STATUSES = SHOT_STATUSES;
