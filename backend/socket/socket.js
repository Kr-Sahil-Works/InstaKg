import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

const app = express();

/* ================= EXPRESS CORS ================= */
app.use(
  cors({
    origin: [
      "https://musicconnect.onrender.com",
      "http://localhost:3000",
    ],
    credentials: true,
  })
);

/* ================= HTTP SERVER ================= */
const server = http.createServer(app);

/* ================= SOCKET.IO ================= */
const io = new Server(server, {
  cors: {
    origin: [
      "https://musicconnect.onrender.com",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

/* ================= USER SOCKET MAP ================= */
const userSocketMap = {}; // userId -> socketId

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

/* ================= SOCKET CONNECTION ================= */
io.on("connection", (socket) => {
  console.log("✅ Socket connected:", socket.id);

  const userId = socket.handshake.query.userId;

  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  // 🔥 Emit online users list
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);

    if (userId) {
      delete userSocketMap[userId];
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, server, io };
