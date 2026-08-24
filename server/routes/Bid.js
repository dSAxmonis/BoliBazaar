const express = require('express');
const Router = express.Router();

const { placeBid, editBid, deleteBid } = require('../controllers/bid');
const { authMiddleware } = require('../middlewares/authMiddleware');
const createRateLimiter = require('../middlewares/rateLimiter');

const bidLimiter = createRateLimiter({
  prefix: "bid",
  limit: 5,
  windowSeconds: 10
});

//routes

Router.post("/placeBid", authMiddleware, bidLimiter, placeBid);

Router.put("/editBid/:bidId", authMiddleware, editBid);

Router.delete("/deleteBid/:bidId", authMiddleware, deleteBid);

module.exports = Router;