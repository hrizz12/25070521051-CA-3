// Helpers for creating the login token (JWT) and the cookie that carries it.
const jwt = require('jsonwebtoken');

const COOKIE_NAME = 'shotlist_token';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function createToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// One place that decides how the cookie behaves. Used for login AND logout,
// because the browser only removes a cookie if the options match.
function cookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true, // JavaScript in the browser cannot read this cookie (protects against XSS)
    secure: isProduction, // only sent over HTTPS in production (localhost uses plain HTTP)
    sameSite: 'lax', // blocks the cookie on cross-site POST requests (protects against CSRF)
    path: '/',
  };
}

function setAuthCookie(res, userId) {
  const token = createToken(userId);
  res.cookie(COOKIE_NAME, token, { ...cookieOptions(), maxAge: SEVEN_DAYS_MS });
}

function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, cookieOptions());
}

module.exports = { COOKIE_NAME, setAuthCookie, clearAuthCookie };
