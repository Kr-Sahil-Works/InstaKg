import path from "path";
import express from "express";
import http from "http";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import userRoutes from "./routes/user.routes.js";

import connectToMongoDB from "./db/connectToMongoDB.js";
import { initSocket } from "./socket/socket.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const __dirname = path.resolve();
const PORT = process.env.PORT || 5000;

/* ========== CORE ========== */
app.use(express.json());
app.use(cookieParser());

/* ========== CORS (🔥 MUST BE FIRST) ========== */
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://musicconnect.onrender.com",
    ],
    credentials: true,
  })
);

/* ========== CSP (FIXED) ========== */
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "img-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self'",
      "connect-src 'self' http://localhost:5000 ws://localhost:5000 https://musicconnect.onrender.com",
      "font-src 'self' data:",
    ].join("; ")
  );
  next();
});

/* ========== ROUTES ========== */
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

/* ========== PROD FRONTEND ========== */
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "instagram-chat", "dist")));

  app.get("*", (req, res) => {
    if (req.path.startsWith("/socket.io")) return;
    res.sendFile(
      path.join(__dirname, "instagram-chat", "dist", "index.html")
    );
  });
}

/* ========== START ========== */
server.listen(PORT, async () => {
  await connectToMongoDB();
  initSocket(server);
  console.log(`🚀 Server running on port ${PORT}`);
});
