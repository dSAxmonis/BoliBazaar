const express = require('express');
const Router = express.Router();
const { upload } = require('../utils/cloudinaryUpload');
const createRateLimiter = require('../middlewares/rateLimiter');
const { authMiddleware } = require('../middlewares/authMiddleware');

const { signup, login, logout, googleCallback, createPassword, verifyUser, verifyOtp, getMe } = require('../controllers/auth');
const passport = require('passport');

const signupLimiter = createRateLimiter({
  prefix: "signup",
  limit: 5,
  windowSeconds: 15 * 60
});

const loginLimiter = createRateLimiter({
  prefix: "login",
  limit: 5,
  windowSeconds: 15 * 60
});

const verifyOtpLimiter = createRateLimiter({
  prefix: "verify-otp",
  limit: 10,
  windowSeconds: 15 * 60
});

const createPasswordLimiter = createRateLimiter({
  prefix: "create-password",
  limit: 5,
  windowSeconds: 15 * 60
});

// routes
Router.post('/signup', signupLimiter, upload.single("image"), signup);
Router.get('/verify/:token', verifyUser);
Router.post('/login', loginLimiter, login);
Router.post('/verify-otp', verifyOtpLimiter, verifyOtp);
Router.post('/create-password', createPasswordLimiter, createPassword);
Router.post('/logout', logout);

// Google OAuth via Passport Strategy
Router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(500).json({
      success: false,
      message: "Google Authentication is not configured on the server."
    });
  }
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
});

Router.get('/google/callback', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(500).json({
      success: false,
      message: "Google Authentication is not configured on the server."
    });
  }
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_failed` })(req, res, next);
}, googleCallback);

Router.get('/me', authMiddleware, getMe);

module.exports = Router;