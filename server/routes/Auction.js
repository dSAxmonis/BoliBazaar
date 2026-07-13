const express = require('express');
const Router = express.Router();
const { upload } = require('../utils/cloudinaryUpload');

const { authMiddleware } = require('../middlewares/authMiddleware');

//controllers
const { createCategory, fetchAllCategory, fetchAllCategoryPosts } = require('../controllers/category');
const { createAuction, fetchAllUserAuctions, deleteAuction, fetchAuctions, fetchSpecificAuction, fetchFeaturedAuctions, editAuction } = require('../controllers/auction');
const { getNotifications, markNotificationRead, clearNotification } = require('../controllers/notification');

//routes for category
Router.post('/createCategory', authMiddleware, createCategory);

Router.get('/getAllCategories', fetchAllCategory);

Router.get('/getAllCategoryPosts', fetchAllCategoryPosts);

//routes for auction
Router.post('/createAuction', authMiddleware, upload.single('image'), createAuction);

Router.get('/getAuctions', authMiddleware, fetchAllUserAuctions);

Router.delete("/deleteAuction/:auctionId", authMiddleware, deleteAuction);

Router.get('/fetchAllAuctions', fetchAuctions);

Router.get('/fetchSpecificAuction', fetchSpecificAuction);

// Featured auctions for homepage
Router.get('/featured', fetchFeaturedAuctions);

// Edit auction
Router.patch('/editAuction/:auctionId', authMiddleware, upload.single('image'), editAuction);

//notifications route
Router.get('/notifications', authMiddleware, getNotifications);

Router.patch('/notifications/mark-read', authMiddleware, markNotificationRead);

Router.delete('/notifications/clear', authMiddleware, clearNotification);

module.exports = Router;