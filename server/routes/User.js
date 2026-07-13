const express = require('express');
const Router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');

const { topBuyers, topSellers, getUserProfile, getUserHistory, getUserWinnings, deleteUserAccount } = require('../controllers/user');

//routes

Router.get('/topBuyers', topBuyers);

Router.get('/topSellers', topSellers);

// Protected routes - require authentication
Router.get('/profile', authMiddleware, getUserProfile);
Router.get('/history', authMiddleware, getUserHistory);
Router.get('/winnings', authMiddleware, getUserWinnings);
Router.delete("/delete-account", authMiddleware, deleteUserAccount);

module.exports = Router;