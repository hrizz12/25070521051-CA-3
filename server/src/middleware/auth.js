// Protects private routes. If the request has no valid login cookie, it stops with 401.
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { COOKIE_NAME } = require('../utils/token');

async function requireAuth(req, res, next) {
  try {
    const token = req.cookies[COOKIE_NAME];
    if (!token) {
      return res.status(401).json({ message: 'Not signed in' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET); // throws if invalid or expired
    const user = await User.findById(payload.id);
    if (!user) {
      return res.status(401).json({ message: 'Account no longer exists' });
    }

    req.user = user; // controllers use req.user._id to filter data by owner
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Session expired. Please sign in again.' });
  }
}

module.exports = { requireAuth };
