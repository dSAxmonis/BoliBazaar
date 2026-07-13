const express = require('express');
const Router = express.Router();
const { upload } = require('../utils/cloudinaryUpload');

const { signup, login, logout, googleLogin } = require('../controllers/auth');

//routes

Router.post('/signup', upload.single("image"), signup);

Router.post('/login', login);

Router.post('/logout', logout);

Router.post('/google-login', googleLogin);

module.exports = Router;