import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import walletRoute from "./Routes/wallet.route.js";
import { stripeWebhook } from "./Controllers/wallet.controller.js";
import connectDB from "./utils/db.js";
import { User } from "./Models/user.model.js";
import userRoute from "./Routes/user.route.js";
import companyRoute from "./Routes/company.route.js";
import workorderRoute from "./Routes/workorder.route.js";
import applicationRoute from "./Routes/application.route.js";
import clientRoute from "./Routes/client.route.js";
import projectRoute from "./Routes/project.route.js";
import technicianRoute from "./Routes/technician.route.js";
import searchRoute from "./Routes/search.route.js";
import dashboardRoute from "./Routes/dashboard.route.js";
import notificationRoute from "./Routes/notification.route.js";
import chatRoute from "./Routes/chat.route.js";
import administratorRoute from "./Routes/administrator.route.js";
import auditRoute from "./Routes/audit.route.js";
import { auditMiddleware } from "./middleware/auditMiddleware.js";

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
app.post("/api/v1/wallet/webhook", express.raw({ type: "application/json" }), stripeWebhook);
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(corsOptions));

// Apply audit middleware to all routes
app.use(auditMiddleware);

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

// API Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/workorder", workorderRoute);
app.use("/api/v1/application", applicationRoute);
app.use("/api/v1/client", clientRoute);
app.use("/api/v1/project", projectRoute);
app.use("/api/v1/technician", technicianRoute);
app.use("/api/v1/search", searchRoute);
app.use("/api/v1/administration", administratorRoute);
app.use("/api/v1/audit", auditRoute);
app.use("/api/v1/dashboard", dashboardRoute);
app.use("/api/v1/notification", notificationRoute);
app.use("/api/v1/chat", chatRoute);
app.use("/api/v1/wallet", walletRoute);

// Export io for use in controllers
export { io };

// Start the Server
server.listen(BACKEND_PORT, () => {
  console.log(`🚀 Server running at port ${BACKEND_PORT}`);
});