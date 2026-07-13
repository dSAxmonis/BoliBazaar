require('dotenv').config();
require('./utils/auctionScheduler');
require('./config/cloudinary');
const PORT = process.env.PORT || 4000;

const express = require('express');
const http = require('http');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./config/database');

const authRoutes = require('./routes/Auth');
const auctionRoutes = require('./routes/Auction');
const userRoutes = require('./routes/User');
const bidRoutes = require('./routes/Bid');

const setupSocket = require('./socket/socket');

const app = express();
const server = http.createServer(app);
const io = setupSocket(server);

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
connectDB();

// Pass io instance to all routes
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/auction', auctionRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/bid', bidRoutes);

//default route
app.get('/', (req, res) => {
   return res.json({
    success:true,
    message:"Your server is up and running..."
   });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
