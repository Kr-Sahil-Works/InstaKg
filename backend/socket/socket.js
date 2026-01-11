import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();

/* ================= HTTP SERVER ================= */
const server = http.createServer(app);

/* ================= SOCKET.IO ================= */
const io = new Server(server, {
  path: "/socket.io",
  cors: {
    origin: [
      "http://localhost:5173",
      "https://musicconnect.onrender.com",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

/* ================= USER SOCKET MAP ================= */
const userSocketMap = {};

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

/* ================= SOCKET CONNECTION ================= */
io.on("connection", (socket) => {
  console.log("✅ user connected:", socket.id);

  const userId = socket.handshake.query.userId;

  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    for (const key in userSocketMap) {
      if (userSocketMap[key] === socket.id) {
        delete userSocketMap[key];
      }
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    console.log("❌ user disconnected:", socket.id);
  });
});

export { app, server, io };
