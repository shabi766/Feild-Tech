import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import dashboardRoute from "./Routes/dashboard.route.js";
import systemSettingsRoute from "./Routes/systemSettings.route.js";
import auditRoute from "./Routes/audit.route.js";

dotenv.config();

const app = express();

// Get ports and origins from environment variables or defaults
const ADMIN_SERVICE_PORT = process.env.ADMIN_SERVICE_PORT || 8007;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || "http://localhost:8000";

// CORS configuration
const corsOptions = {
  origin: [FRONTEND_URL, API_GATEWAY_URL, "http://localhost:3000", "http://127.0.0.1:5173"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie']
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(corsOptions));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "healthy", 
    service: "admin-service",
    timestamp: new Date().toISOString()
  });
});

// Connect to Database
connectDB().catch(err => {
    console.log('⚠️ Database connection failed, but server will continue running');
});

// API Routes
app.use("/api/v1/admin/dashboard", dashboardRoute);
app.use("/api/v1/admin/system-settings", systemSettingsRoute);
app.use("/api/v1/admin/audit", auditRoute);

// Start the Server
app.listen(ADMIN_SERVICE_PORT, () => {
  console.log(`👨‍💼 Admin Service running at port ${ADMIN_SERVICE_PORT}`);
});
