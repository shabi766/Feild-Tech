import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import reviewRoute from "./Routes/review.route.js";
import leaderboardRoute from "./Routes/leaderboard.route.js";
import testimonialRoute from "./Routes/testimonial.route.js";
import ratingRoute from "./Routes/rating.route.js";

dotenv.config();

const app = express();

// Get ports and origins from environment variables or defaults
const REVIEW_SERVICE_PORT = process.env.REVIEW_SERVICE_PORT || 8011;
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

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(corsOptions));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "review-service",
    timestamp: new Date().toISOString()
  });
});

// Connect to Database
connectDB().catch(err => {
  console.log('⚠️ Database connection failed, but server will continue running');
});

// API Routes
app.use("/api/v1/review", reviewRoute);
app.use("/api/v1/leaderboard", leaderboardRoute);
app.use("/api/v1/testimonials", testimonialRoute);
app.use("/api/v1/rating", ratingRoute);

// Start the Server
app.listen(REVIEW_SERVICE_PORT, () => {
  console.log(`⭐ Review Service running at port ${REVIEW_SERVICE_PORT}`);
});
