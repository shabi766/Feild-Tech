import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import paymentRoute from "./Routes/payment.route.js";
import walletRoute from "./Routes/wallet.route.js";

dotenv.config();

const app = express();

// Get ports and origins from environment variables or defaults
const PAYMENT_SERVICE_PORT = process.env.PAYMENT_SERVICE_PORT || 8006;
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

// Stripe webhook endpoint (must be BEFORE express.json middleware for raw body)
app.post("/api/v1/payment/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const { stripeWebhook } = await import("./Controllers/payment.controller.js");
  return stripeWebhook(req, res);
});

// Middleware (after webhook route)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(corsOptions));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "healthy", 
    service: "payment-service",
    timestamp: new Date().toISOString()
  });
});

// Connect to Database
connectDB().catch(err => {
    console.log('⚠️ Database connection failed, but server will continue running');
});

// API Routes
app.use("/api/v1/payment", paymentRoute);
app.use("/api/v1/wallet", walletRoute);

// Start the Server
app.listen(PAYMENT_SERVICE_PORT, () => {
  console.log(`💳 Payment Service running at port ${PAYMENT_SERVICE_PORT}`);
});
