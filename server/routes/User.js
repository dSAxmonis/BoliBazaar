const express = require('express');
const Router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const { upload } = require('../utils/cloudinaryUpload');

const { topBuyers, topSellers, getUserProfile, getUserHistory, getUserWinnings, deleteUserAccount, updateProfile } = require('../controllers/user');

//routes

Router.get('/topBuyers', topBuyers);

Router.get('/topSellers', topSellers);

// Protected routes - require authentication
Router.get('/profile', authMiddleware, getUserProfile);
Router.get('/history', authMiddleware, getUserHistory);
Router.get('/winnings', authMiddleware, getUserWinnings);
Router.patch('/update-profile', authMiddleware, upload.single('image'), updateProfile);
Router.delete("/delete-account", authMiddleware, deleteUserAccount);

module.exports = Router;