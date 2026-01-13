import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import companyRoute from "./Routes/company.route.js";
import companyRegistrationRoute from "./Routes/companyRegistration.route.js";
import companyUserRoute from "./Routes/companyUser.route.js";
import roleRoute from "./Routes/role.route.js";
import teamRoute from "./Routes/team.route.js";

dotenv.config();

const app = express();

const COMPANY_SERVICE_PORT = process.env.COMPANY_SERVICE_PORT || 8009;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || "http://localhost:8000";

const corsOptions = {
  origin: [FRONTEND_URL, API_GATEWAY_URL, "http://localhost:3000", "http://127.0.0.1:5173"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie']
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(corsOptions));

app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "healthy", 
    service: "company-service",
    timestamp: new Date().toISOString()
  });
});

connectDB().catch(err => {
    console.log('⚠️ Database connection failed, but server will continue running');
});

// API Routes
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/company-registration", companyRegistrationRoute);
app.use("/api/v1/company-user", companyUserRoute);
app.use("/api/v1/role", roleRoute);
app.use("/api/v1/team", teamRoute);

app.listen(COMPANY_SERVICE_PORT, () => {
  console.log(`🏢 Company Service running at port ${COMPANY_SERVICE_PORT}`);
});
