/**
 * Socket.io Handlers for Chat Service
 * Handles real-time communication, user status, and audio calls
 */

import jwt from "jsonwebtoken";
import { AuthServiceClient } from "../Services/auth-client.service.js";

// Track online users
const onlineUsers = new Map();

/**
 * Setup Socket.io event handlers
 * @param {Server} io - Socket.io server instance
 */
export const setupSocketHandlers = (io) => {
    io.on("connection", (socket) => {
        console.log(`🔗 User connected: ${socket.id}`);

        // Authenticate socket connection
        socket.on("authenticate", async (token) => {
            try {
                const decoded = jwt.verify(token, process.env.SECRET_KEY);
                socket.userId = decoded.userId;
                socket.join(decoded.userId);
                onlineUsers.set(socket.id, decoded.userId);

                // Update user status via Auth Service (or direct DB during migration)
                // TODO: Add updateUserStatus endpoint to Auth Service
                console.log(`✅ User ${decoded.userId} authenticated and joined room`);

                io.emit("update_status", { userId: decoded.userId, status: "online" });
            } catch (error) {
                console.error("Socket authentication error:", error);
                socket.disconnect();
            }
        });

        // Join room (for backward compatibility)
        socket.on("joinRoom", async (userId) => {
            socket.join(userId);
            onlineUsers.set(socket.id, userId);

            // Update user status
            // TODO: Call Auth Service to update status
            console.log(`✅ User ${userId} joined room`);

            io.emit("update_status", { userId, status: "online" });
        });

        // Set user away status
        socket.on("setAway", async (userId) => {
            // Update user status
            // TODO: Call Auth Service to update status
            io.emit("update_status", { userId, status: "away" });
            console.log(`⚠️ User ${userId} is away`);
        });

        // Join chat room
        socket.on("join_chat", (chatId) => {
            socket.join(chatId);
            console.log(`💬 Socket ${socket.id} joined chat ${chatId}`);
        });

        // Leave chat room
        socket.on("leave_chat", (chatId) => {
            socket.leave(chatId);
            console.log(`💬 Socket ${socket.id} left chat ${chatId}`);
        });

        // Audio Call Events
        socket.on("audio_call_request", (data) => {
            const { recipientId, caller, recipient } = data;
            console.log(`📞 Audio call request from ${caller?.fullname || caller?._id} to ${recipient?.fullname || recipientId}`);
            
            // Emit to the recipient
            socket.to(recipientId).emit("audio_call_request", {
                caller,
                recipient,
                recipientId
            });
        });

        socket.on("audio_call_accepted", (data) => {
            const { callerId } = data;
            console.log(`✅ Audio call accepted`);
            
            // Emit to the caller
            socket.to(callerId).emit("audio_call_accepted", {
                caller: { _id: callerId }
            });
        });

        socket.on("audio_call_rejected", (data) => {
            const { callerId } = data;
            console.log(`❌ Audio call rejected`);
            
            // Emit to the caller
            socket.to(callerId).emit("audio_call_rejected", {
                caller: { _id: callerId }
            });
        });

        socket.on("audio_call_ended", (data) => {
            const { recipientId } = data;
            console.log(`📞 Audio call ended`);
            
            // Emit to the recipient
            socket.to(recipientId).emit("audio_call_ended", {
                recipientId
            });
        });

        socket.on("audio_call_offer", (data) => {
            const { offer, recipientId } = data;
            console.log(`📤 Audio call offer sent to ${recipientId}`);
            
            // Emit to the recipient
            socket.to(recipientId).emit("audio_call_offer", {
                offer,
                callerId: socket.id
            });
        });

        socket.on("audio_call_answer", (data) => {
            const { answer, recipientId } = data;
            console.log(`📤 Audio call answer sent to ${recipientId}`);
            
            // Emit to the recipient
            socket.to(recipientId).emit("audio_call_answer", {
                answer,
                callerId: socket.id
            });
        });

        socket.on("audio_call_ice_candidate", (data) => {
            const { candidate, recipientId } = data;
            console.log(`🧊 ICE candidate sent to ${recipientId}`);
            
            // Emit to the recipient
            socket.to(recipientId).emit("audio_call_ice_candidate", {
                candidate,
                callerId: socket.id
            });
        });

        // Handle disconnect
        socket.on("disconnect", async () => {
            const userId = onlineUsers.get(socket.id);
            if (userId) {
                onlineUsers.delete(socket.id);

                // Update user status
                // TODO: Call Auth Service to update status
                io.emit("update_status", { userId, status: "offline", lastSeen: new Date() });

                console.log(`❌ User ${userId} disconnected`);
            }
        });
    });
};
