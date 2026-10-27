const mongoose = require('mongoose');

const PROJECT_STATUSES = ['Planning', 'In Production', 'Completed'];

const projectSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: [100, 'Title must be at most 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description must be at most 500 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: { values: PROJECT_STATUSES, message: 'Status must be Planning, In Production or Completed' },
      default: 'Planning',
    },
    shootDate: {
      type: Date,
      default: null,
    },
    location: {
      type: String,
      trim: true,
      maxlength: [150, 'Location must be at most 150 characters'],
      default: '',
    },
  },
  { timestamps: true }
);

// Speeds up "show my most recently updated projects".
projectSchema.index({ owner: 1, updatedAt: -1 });

module.exports = mongoose.model('Project', projectSchema);
module.exports.PROJECT_STATUSES = PROJECT_STATUSES;
