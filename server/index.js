import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import authRoutes from "./routes/AuthRoutes.js";
import { contactsRoutes } from "./routes/ContactRoutes.js";
import setupSocket from "./socket.js";

// loads environment variables from .env
dotenv.config();

// express instance
const app = express();

// parse incoming json paymoads
app.use(express.json());

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


// parsing incoming requests making them accessible via res.cookies
app.use(cookieParser());

// all authentication-related requests will be handles by authRoutes
app.use("/api/auth", authRoutes);
app.use("/api/contacts",contactsRoutes);

// server starting
const server = app.listen(port, () => {
  console.log(`Server is running at port ${port}`);
});

// app.use(setupSocket);
setupSocket(server);

// creating unique index at email field to ensure no two user have same email
mongoose
  .connect(DbUrl)
  .then(async () => {
    await mongoose.connection.db
      .collection("users")
      .createIndex({ email: 1 }, { unique: true });
    console.log("Unique index created on email field");
  })
  .then(() => {
    console.log("DB connection successful!");
  })
  .catch((err) => console.log(err.message));

