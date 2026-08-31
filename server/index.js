require('dotenv').config();
require('./utils/auctionScheduler');
require('./config/cloudinary');
require('./config/passport');
const PORT = process.env.PORT || 4000;

const express = require('express');
const http = require('http');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./config/database');
const { connectRedis } = require('./config/redis');

const authRoutes = require('./routes/Auth');
const auctionRoutes = require('./routes/Auction');
const userRoutes = require('./routes/User');
const bidRoutes = require('./routes/Bid');

const { setupSocket } = require('./socket/socket');

const app = express();
const server = http.createServer(app);
const io = setupSocket(server);

app.use(cors({
    origin: [
        process.env.FRONTEND_URL || 'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'https://boli-bazaar-pearl.vercel.app',
        'https://bolibazaar.vercel.app',
        'https://bolibazaar-git-main.vercel.app' // Preview deployments
    ],
    credentials: true
}));

app.use((req, res, next) => {
    console.log(`[request] ${req.method} ${req.path} - Origin: ${req.headers.origin}`);
    next();
});

const passport = require('passport');

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Connect to MongoDB & Redis
connectDB();
connectRedis();

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
    // Start listening
    console.log(`Server running on port ${PORT}`);
});
