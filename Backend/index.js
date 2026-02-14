import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./utils/db.js";
import { User } from "./services/auth-service/Models/user.model.js";
import { auditMiddleware } from "./middleware/auditMiddleware.js";

/**
 * NOTE: This process now acts as the real‑time / Socket.io gateway only.
 *
 * All HTTP REST APIs are served by the dedicated microservices under
 * `Backend/services/*` (auth, workorder, application, company, client, etc.)
 * and are consumed via their own ports as configured in
 * `Frontend/src/config/services.js` and `environment.js`.
 *
 * The legacy monolith HTTP routes that used to live in this file have been
 * removed/commented out to avoid confusion. When adding new HTTP APIs,
 * prefer creating or extending a microservice rather than mounting routes
 * here.
 */

dotenv.config();

const app = express();
const server = http.createServer(app);

// Get ports and origins from environment variables or defaults
const BACKEND_PORT = process.env.BACKEND_PORT || 8000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// CORS configuration
const corsOptions = {
  origin: [FRONTEND_URL, "http://localhost:3000", "http://127.0.0.1:5173"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie']
};

// Initialize Socket.io with CORS settings
const io = new Server(server, {
  cors: {
    origin: corsOptions.origin,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Track online users in a Map
const onlineUsers = new Map();

// Stripe webhook must be registered BEFORE express.json
// app.post("/api/v1/wallet/webhook", express.raw({ type: "application/json" }), stripeWebhook);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(corsOptions));

// Apply audit middleware to all routes (primarily for any health / status endpoints)
// There are currently no REST routes mounted on this gateway; HTTP APIs live
// in the individual microservices. This middleware remains ready for any
// lightweight endpoints we may add in future.
// app.use(auditMiddleware);

// Connect to Database
connectDB().catch(err => {
  console.log('⚠️ Database connection failed, but server will continue running');
});

// Handle Socket.io Connections
io.on("connection", (socket) => {
  console.log(`🔗 User connected: ${socket.id}`);

  socket.on("joinRoom", async (userId) => {
    socket.join(userId);
    onlineUsers.set(socket.id, userId);

    try {
      await User.findByIdAndUpdate(userId, { status: "online", lastSeen: new Date() });
    } catch (error) {
      console.log('⚠️ Could not update user status in database:', error.message);
    }

    io.emit("update_status", { userId, status: "online" });

    console.log(`✅ User ${userId} is now online`);
  });

  socket.on("setAway", async (userId) => {
    try {
      await User.findByIdAndUpdate(userId, { status: "away" });
    } catch (error) {
      console.log('⚠️ Could not update user status in database:', error.message);
    }

    io.emit("update_status", { userId, status: "away" });

    console.log(`⚠️ User ${userId} is away`);
  });

  // Audio Call Events
  socket.on("audio_call_request", (data) => {
    const { recipientId, caller, recipient } = data;
    console.log(`📞 Audio call request from ${caller.fullname} to ${recipient.fullname}`);

    // Emit to the recipient
    socket.to(recipientId).emit("audio_call_request", {
      caller,
      recipient,
      recipientId
    });
  });

  socket.on("audio_call_accepted", (data) => {
    const { callerId } = data;
    console.log(`✅ Audio call accepted by ${callerId}`);

    // Emit to the caller
    socket.to(callerId).emit("audio_call_accepted", {
      caller: { _id: callerId }
    });
  });

  socket.on("audio_call_rejected", (data) => {
    const { callerId } = data;
    console.log(`❌ Audio call rejected by ${callerId}`);

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



  socket.on("disconnect", async () => {
    const userId = onlineUsers.get(socket.id);
    if (userId) {
      onlineUsers.delete(socket.id);

      try {
        await User.findByIdAndUpdate(userId, { status: "offline", lastSeen: new Date() });
      } catch (error) {
        console.log('⚠️ Could not update user status in database:', error.message);
      }

      io.emit("update_status", { userId, status: "offline", lastSeen: new Date() });

      console.log(`❌ User ${userId} disconnected`);
    }
  });
});

// Make io accessible in routes
app.set("io", io);

// Export io for use in controllers
export { io };

// Start the Server
server.listen(BACKEND_PORT, () => {
  console.log(`🚀 Server running at port ${BACKEND_PORT}`);
});