import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/AuthRoutes.js";
import { contactsRoutes } from "./routes/ContactRoutes.js";
import setupSocket from "./socket.js";
import messagesRoutes from "./routes/MessagesRoute.js";
import channelRoutes from "./routes/ChannelRoutes.js";

// loads environment variables from .env
dotenv.config();

// Validate required environment variables at startup
const requiredEnvVars = ["PORT", "JWT_KEY", "ORIGIN", "DB_URL"];
requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing required environment variable: ${key}`);
    process.exit(1);
  }
});

// express instance
const app = express();

// Body parser with size limits
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Port at which server runs
const port = process.env.PORT || 3001;

// DB URL for connection
const DbUrl = process.env.DB_URL;

// CORS(Cross origin resource sharing) middleware
// allow requests from a specific origin (set in the .env file) and to specify which HTTP methods are permitted.
app.use(
  cors({
    origin: [process.env.ORIGIN],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    // indicates cookies and http auth allowed in cross-origin requests
    credentials: true,
  })
);

// app.use("/uploads/profiles",express.static("uploads/profiles"))

app.use('/uploads/profiles', express.static('uploads/profiles'));
app.use("/uploads/files",express.static("uploads/files"));

// parsing incoming requests making them accessible via res.cookies
app.use(cookieParser());

// Rate limiters for brute-force protection
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { error: "Too many authentication attempts, please try again later." },
});

const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: { error: "Too many search requests, please slow down." },
});

// Rate limited route mounts
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/signup", authLimiter);
app.use("/api/contacts/search", searchLimiter);

// all authentication-related requests will be handles by authRoutes
app.use("/api/auth", authRoutes);
app.use("/api/contacts",contactsRoutes);
app.use("/api/messages",messagesRoutes);
app.use("/api/channels",channelRoutes);

// 404 handler (after all defined routes)
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Centralized global error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || "Internal server error",
  });
});
// server starting
const server = app.listen(port, () => {
  console.log(`Server is running at port ${port}`);
});

// app.use(setupSocket);
setupSocket(server);

// Database connection
mongoose
  .connect(DbUrl)
  .then(() => {
    console.log("DB connection successful!");
  })
  .catch((err) => console.log(err.message));

