// src/socket.js
import { io } from "socket.io-client";

let socket = null;

const createSocket = () => {
    if (!socket) {
        socket = io("http://localhost:8000", { 
            withCredentials: true,
            transports: ["websocket", "polling"] 
        });
    }
    return socket;
};

const getSocket = () => {
    if (!socket) {
        return createSocket();
    }
    return socket;
};

const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export { createSocket, getSocket, disconnectSocket };
export default getSocket;