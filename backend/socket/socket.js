import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

const app = express();

/* ================= CORS (EXPRESS) ================= */
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://musicconnect.onrender.com"
  ],
  methods: ["GET", "POST"],
  credentials: true,
}));

app.use(express.json());

/* ================= HTTP SERVER ================= */
const server = http.createServer(app);

/* ================= SOCKET.IO ================= */
const io = new Server(server, {
  path: "/socket.io",
  cors: {
    origin: [
      "https://musicconnect.onrender.com"
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

  const userId = socket.handshake.query.userId?.toString();

  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    Object.keys(userSocketMap).forEach((key) => {
      if (userSocketMap[key] === socket.id) {
        delete userSocketMap[key];
      }
    });

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    console.log("❌ user disconnected:", socket.id);
  });
});

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export { app, server, io };
