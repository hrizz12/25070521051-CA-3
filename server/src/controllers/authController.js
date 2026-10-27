const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { validateRegister, validateLogin } = require('../middleware/validate');
const { setAuthCookie, clearAuthCookie } = require('../utils/token');

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { errors, data } = validateRegister(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0], errors });
    }

    const existing = await User.findOne({ email: data.email });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    // 10 = how many times bcrypt scrambles the password ("salt rounds")
    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await User.create({ username: data.username, email: data.email, passwordHash });

    setAuthCookie(res, user._id);
    res.status(201).json({ message: 'Account created', user: user.toPublic() });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { errors, data } = validateLogin(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0], errors });
    }

    const user = await User.findOne({ email: data.email });
    const passwordOk = user ? await bcrypt.compare(data.password, user.passwordHash) : false;

    // Same message for "no such user" and "wrong password" so attackers learn nothing.
    if (!passwordOk) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    setAuthCookie(res, user._id);
    res.json({ message: 'Signed in', user: user.toPublic() });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/logout
function logout(req, res) {
  clearAuthCookie(res);
  res.json({ message: 'Signed out' });
}

// GET /api/auth/me  (requires login)
function me(req, res) {
  res.json({ user: req.user.toPublic() });
}

module.exports = { register, login, logout, me };
