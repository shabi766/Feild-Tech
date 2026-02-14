import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import authRoute from "../Routes/auth.route.js";

dotenv.config();

// Minimal test app that mirrors the auth-service entrypoint behaviour
const createApp = () => {
  const app = express();

  const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
  const API_GATEWAY_URL = process.env.API_GATEWAY_URL || "http://localhost:8000";

  const corsOptions = {
    origin: [FRONTEND_URL, API_GATEWAY_URL, "http://localhost:3000", "http://127.0.0.1:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Set-Cookie"],
  };

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(cors(corsOptions));

  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "healthy",
      service: "auth-service",
    });
  });

  app.use("/api/v1/auth", authRoute);

  return app;
};

describe("Auth service basic endpoints", () => {
  const app = createApp();

  it("responds to /health with healthy status", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("healthy");
  });

  it("exposes /api/v1/auth/login endpoint", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({});
    // We only assert that the route exists and returns JSON, not the exact error
    expect(res.headers["content-type"]).toMatch(/application\/json/);
  });
});

