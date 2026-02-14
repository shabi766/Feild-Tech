import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import authRoute from "./Routes/auth.route.js";
import {
  createHelmetMiddleware,
  strictRateLimiter,
  apiRateLimiter
} from "../shared-middleware/security.js";
import { createLogger, requestLogger } from "../shared-middleware/logger.js";
import { createErrorHandler } from "../shared-middleware/errorHandler.js";
import { createHealthCheck } from "../shared-middleware/healthCheck.js";
import { createAuditLogger } from "../shared-middleware/auditLogger.js";
import mongoose from "mongoose";

dotenv.config();

const app = express();

// Initialize logger
const logger = createLogger('auth-service', process.env.LOG_LEVEL || 'info');

// Initialize audit logger
const auditLogger = createAuditLogger('auth-service', process.env.ADMIN_SERVICE_URL);

// Get ports and origins from environment variables or defaults
const AUTH_SERVICE_PORT = process.env.AUTH_SERVICE_PORT || 8001;
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

// Security Middleware
app.use(createHelmetMiddleware());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(corsOptions));

// Request logging
app.use(requestLogger(logger));

// Audit logging middleware
app.use(auditLogger.createMiddleware({
  excludePaths: ['/health', '/api/v1/auth/refresh-token'],
}));

// Health check endpoint
app.get("/health", createHealthCheck({
  serviceName: 'auth-service',
  database: mongoose.connection,
}));

// Connect to Database
connectDB()
  .then(() => logger.info('Database connected successfully'))
  .catch(err => {
    logger.error('Database connection failed', { error: err.message });
  });

// API Routes with rate limiting
// Strict rate limiting for sensitive auth endpoints
app.use("/api/v1/auth/login", strictRateLimiter);
app.use("/api/v1/auth/register", strictRateLimiter);
app.use("/api/v1/auth/forgot-password", strictRateLimiter);
app.use("/api/v1/auth/reset-password", strictRateLimiter);

// API rate limiting for other endpoints
app.use("/api/v1/auth", apiRateLimiter);
app.use("/api/v1/auth", authRoute);

// Global error handler (must be last)
app.use(createErrorHandler(logger));

// Start the Server
app.listen(AUTH_SERVICE_PORT, () => {
  logger.info(`Auth Service running at port ${AUTH_SERVICE_PORT}`);
});
