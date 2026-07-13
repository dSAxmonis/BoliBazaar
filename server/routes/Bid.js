const express = require('express');
const Router = express.Router();

const { placeBid, editBid, deleteBid } = require('../controllers/bid');

const { authMiddleware } = require('../middlewares/authMiddleware');

//routes

Router.post("/placeBid", authMiddleware, placeBid);

Router.put("/editBid/:bidId", authMiddleware, editBid);

Router.delete("/deleteBid/:bidId", authMiddleware, deleteBid);

module.exports = Router;