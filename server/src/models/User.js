const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username must be at most 30 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true, // creates a unique index, so two users can never share an email
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    // We only ever store the bcrypt hash, never the real password.
    passwordHash: {
      type: String,
      required: true,
    },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

// Safe version of the user that can be sent to the browser (no passwordHash).
userSchema.methods.toPublic = function () {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
