const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let ioInstance = null;
const connectedUsers = {};

const setupSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: [
                process.env.FRONTEND_URL || 'http://localhost:3000',
                'https://bolibazaar.vercel.app',
                'https://bolibazaar-git-main.vercel.app'
            ],
            credentials: true,
        },
    });

    ioInstance = io;

    io.use((socket, next) => {
        let token = socket.handshake.auth?.token || socket.handshake.query?.token;
        if (!token) {
            const cookieHeader = socket.handshake.headers.cookie;
            if (cookieHeader) {
                const cookies = cookieHeader.split(';');
                for (let cookie of cookies) {
                    const [name, value] = cookie.trim().split('=');
                    if (name === 'token') {
                        token = value;
                        break;
                    }
                }
            }
        }

        if (!token) {
            return next(new Error("Authentication error"));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded;
            next();
        } catch (error) {
            return next(new Error("Authentication error"));
        }
    });

    io.on("connection", (socket) => {
        const userId = socket.user.id;
        connectedUsers[userId] = socket.id;

        socket.on("disconnect", () => {
            delete connectedUsers[userId];
        });
    });

    return io;
};

const getIo = () => ioInstance;
const getConnectedUsers = () => connectedUsers;

module.exports = {
    setupSocket,
    getIo,
    getConnectedUsers
};
