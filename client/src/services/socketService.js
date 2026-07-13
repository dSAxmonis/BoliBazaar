import { io } from 'socket.io-client';

let socket = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

const socketUrl = import.meta.env.VITE_SOCKET_URL;

export const initializeSocket = () => {
    if (!socket) {
        //console.log('Initializing socket connection...');
        socket = io(socketUrl, {
            withCredentials: true,
            reconnection: true,
            reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
        });

        socket.on('connect', () => {
            //console.log('Socket connected successfully. Socket ID:', socket.id);
            reconnectAttempts = 0;
        });

        socket.on('connect_error', (error) => {
            //console.error('Socket connection error:', error);
            reconnectAttempts++;
            
            if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
                //console.error('Max reconnection attempts reached');
                disconnectSocket();
            }
        });

        socket.on('disconnect', (reason) => {
            //console.log('Socket disconnected:', reason);
            
            // Only attempt to reconnect if the disconnection wasn't intentional
            if (reason === 'io server disconnect') {
                // Server initiated disconnect, try to reconnect
                socket.connect();
            }
        });

        socket.on('reconnect', (attemptNumber) => {
            //console.log('Socket reconnected after', attemptNumber, 'attempts');
        });

        socket.on('reconnect_error', (error) => {
            //console.error('Socket reconnection error:', error);
        });

        socket.on('reconnect_failed', () => {
            //console.error('Socket reconnection failed after all attempts');
        });

        // Add a general event listener for debugging
        socket.onAny((eventName, ...args) => {
            //console.log('Received event:', eventName, 'with data:', args);
        });
    }
    return socket;
};

export const getSocket = () => {
    if (!socket) {
        //console.log('Socket not initialized, creating new connection...');
        return initializeSocket();
    }
    //console.log('Returning existing socket connection. Socket ID:', socket.id);
    return socket;
};  

export const disconnectSocket = () => {
    if (socket) {
        //console.log('Disconnecting socket...');
        socket.disconnect();
        socket = null;
        reconnectAttempts = 0;
    }
}; 