import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

const app = express();

/* ✅ EXPRESS CORS (IMPORTANT) */
app.use(
  cors({
    origin: "https://musicconnect.onrender.com",
    credentials: true,
  })
);

/* ================= HTTP SERVER ================= */
const server = http.createServer(app);

/* ================= SOCKET.IO ================= */
const io = new Server(server, {
  // ❌ DO NOT set custom path
  cors: {
    origin: "https://musicconnect.onrender.com",
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
  console.log("✅ connected:", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    for (const key in userSocketMap) {
      if (userSocketMap[key] === socket.id) delete userSocketMap[key];
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, server, io };
