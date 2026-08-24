const express = require('express');
const Router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const { upload } = require('../utils/cloudinaryUpload');

const { topBuyers, topSellers, getUserProfile, getUserHistory, getUserWinnings, deleteUserAccount, updateProfile, toggleWatchlist, getWatchlist } = require('../controllers/user');

//routes

Router.get('/topBuyers', topBuyers);

Router.get('/topSellers', topSellers);

// Protected routes - require authentication
Router.get('/profile', authMiddleware, getUserProfile);
Router.get('/history', authMiddleware, getUserHistory);
Router.get('/winnings', authMiddleware, getUserWinnings);
Router.patch('/update-profile', authMiddleware, upload.single('image'), updateProfile);
Router.delete("/delete-account", authMiddleware, deleteUserAccount);

Router.post('/watchlist', authMiddleware, toggleWatchlist);
Router.get('/watchlist', authMiddleware, getWatchlist);

module.exports = Router;