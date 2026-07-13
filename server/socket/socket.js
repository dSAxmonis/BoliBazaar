const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const Notification = require('../models/Notifications');

const setupSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL,
            credentials: true,
        },
    });

    const connectedUsers = {};

    io.use((socket, next) => {
        const token = socket.handshake.headers.cookie?.split("token=")[1];
        if (!token) {
            return next(new Error("Authentication error"));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded;
            next();
        } catch (error) {
            //console.log("ERROR IN SOCKET AUTHENTICATION: ", error);
            return next(new Error("Authentication error"));
        }
    });

    io.on("connection", (socket) => {
        const userId = socket.user.id; // or email
        //console.log("User connected:", socket.user.email);
        connectedUsers[userId] = socket.id;

        socket.on("disconnect", () => {
            //console.log(`User ${socket.user.email} disconnected`);
            delete connectedUsers[userId];
        });

        socket.on("newBid", async ({ productId, bidAmount, bidderEmail, productCreatorId }) => {
            const message = `New bid of ₹${bidAmount} placed by ${bidderEmail}`;
            const creatorSocketId = connectedUsers[productCreatorId];

            await Notification.create({
                userId: productCreatorId,
                message
            });

            if (creatorSocketId) {
                io.to(creatorSocketId).emit("bidNotification", {
                    bidAmount,
                    bidderEmail,
                    timestamp: new Date(),
                    message: `New bid of ₹${bidAmount} placed by ${bidderEmail}`
                });
                //console.log(`Notification sent to product creator ${productCreatorId}`);
            } else {
                //console.log(`Creator ${productCreatorId} not connected`);
            }
        });
    });

    return io;
};

module.exports = setupSocket;
