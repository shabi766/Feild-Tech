import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import dashboardRoute from "./Routes/dashboard.route.js";
import systemSettingsRoute from "./Routes/systemSettings.route.js";
import auditRoute from "./Routes/audit.route.js";
import {
  createHelmetMiddleware,
  apiRateLimiter
} from "../shared-middleware/security.js";
import { createLogger, requestLogger } from "../shared-middleware/logger.js";
import { createErrorHandler } from "../shared-middleware/errorHandler.js";
import { createHealthCheck } from "../shared-middleware/healthCheck.js";
import mongoose from "mongoose";

dotenv.config();

const app = express();

// Initialize logger
const logger = createLogger('admin-service', process.env.LOG_LEVEL || 'info');

// Get ports and origins from environment variables or defaults
const ADMIN_SERVICE_PORT = process.env.ADMIN_SERVICE_PORT || 8009;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || "http://localhost:8000";

// CORS configuration - Admin service needs to accept requests from all microservices
const corsOptions = {
  origin: [
    FRONTEND_URL,
    API_GATEWAY_URL,
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    // Allow all microservices to send audit logs
    "http://localhost:8001", // auth-service
    "http://localhost:8002", // workorder-service
    "http://localhost:8003", // payment-service
    "http://localhost:8004", // company-service
    "http://localhost:8005", // client-service
    "http://localhost:8006", // review-service
    "http://localhost:8007", // notification-service
    "http://localhost:8008", // chat-service
    "http://localhost:8010", // application-service
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie']
};

// Security Middleware
app.use(createHelmetMiddleware());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(corsOptions));

// Request logging
app.use(requestLogger(logger));

// Health check endpoint
app.get("/health", createHealthCheck({
  serviceName: 'admin-service',
  database: mongoose.connection,
}));

// Connect to Database
connectDB()
  .then(() => logger.info('Database connected successfully'))
  .catch(err => {
    logger.error('Database connection failed', { error: err.message });
  });

// API Routes with rate limiting
app.use("/api/v1/admin/dashboard", apiRateLimiter);
app.use("/api/v1/admin/dashboard", dashboardRoute);

app.use("/api/v1/admin/system-settings", apiRateLimiter);
app.use("/api/v1/admin/system-settings", systemSettingsRoute);

// Audit route should NOT have rate limiting (receives logs from all services)
app.use("/api/v1/audit", auditRoute);

// Global error handler (must be last)
app.use(createErrorHandler(logger));

// Start the Server
app.listen(ADMIN_SERVICE_PORT, () => {
  logger.info(`Admin Service running at port ${ADMIN_SERVICE_PORT}`);
});
