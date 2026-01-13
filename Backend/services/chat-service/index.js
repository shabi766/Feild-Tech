import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./utils/db.js";
import chatRoute from "./Routes/chat.route.js";
import { setupSocketHandlers } from "./socket/socketHandlers.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Get ports and origins from environment variables or defaults
const CHAT_SERVICE_PORT = process.env.CHAT_SERVICE_PORT || 8005;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || "http://localhost:8000";

// CORS configuration
const corsOptions = {
  origin: [FRONTEND_URL, API_GATEWAY_URL, "http://localhost:3000", "http://127.0.0.1:5173"],
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

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(corsOptions));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "healthy", 
    service: "chat-service",
    timestamp: new Date().toISOString()
  });
});

// Connect to Database
connectDB().catch(err => {
    console.log('⚠️ Database connection failed, but server will continue running');
});

// Setup Socket.io handlers
setupSocketHandlers(io);

// Make io accessible in routes
app.set("io", io);

// API Routes
app.use("/api/v1/chat", chatRoute);

// Start the Server
server.listen(CHAT_SERVICE_PORT, () => {
  console.log(`💬 Chat Service running at port ${CHAT_SERVICE_PORT}`);
});
