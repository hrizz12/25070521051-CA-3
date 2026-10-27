const express = require('express');
const rateLimit = require('express-rate-limit');
const { register, login, logout, me } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Slows down password-guessing: max 50 register/login attempts per 15 minutes per IP.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again in a few minutes.' },
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.get('/me', requireAuth, me);

module.exports = router;
