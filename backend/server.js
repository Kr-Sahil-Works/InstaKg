import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import userRoutes from "./routes/user.routes.js";

import connectToMongoDB from "./db/connectToMongoDB.js";
import { app, server } from "./socket/socket.js";

dotenv.config();

const __dirname = path.resolve();
const PORT = process.env.PORT; // 🔴 DO NOT fallback on Render

/* ================= MIDDLEWARE ================= */
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "https://musicconnect.onrender.com",
    credentials: true,
  })
);

/* ================= ROUTES ================= */
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

/* ================= STATIC FRONTEND ================= */
app.use(express.static(path.join(__dirname, "frontend", "dist")));

/* 🚨 SPA FALLBACK — MUST IGNORE SOCKET.IO */
app.get("*", (req, res) => {
  if (req.path.startsWith("/socket.io")) return;
  res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});

/* ================= START SERVER ================= */
server.listen(PORT, () => {
  connectToMongoDB();
  console.log(`🚀 Server running on ${PORT}`);
});
