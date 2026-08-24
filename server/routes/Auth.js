const express = require('express');
const Router = express.Router();
const { upload } = require('../utils/cloudinaryUpload');
const createRateLimiter = require('../middlewares/rateLimiter');

const { signup, login, logout, googleLogin, verifyUser, verifyOtp } = require('../controllers/auth');

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

// routes
Router.post('/signup', signupLimiter, upload.single("image"), signup);
Router.get('/verify/:token', verifyUser);
Router.post('/login', loginLimiter, login);
Router.post('/verify-otp', verifyOtp);
Router.post('/logout', logout);
Router.post('/google-login', googleLogin);

module.exports = Router;