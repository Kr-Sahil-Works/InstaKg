import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";

let io;

// userId => Set(socketId)
const userSocketMap = new Map();

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "https://musicconnect.onrender.com",
      ],
      credentials: true,
    },
  });

  /* 🔐 AUTH VIA COOKIE */
  io.use((socket, next) => {
    try {
      const cookies = socket.handshake.headers.cookie;
      const token = cookie.parse(cookies || "").jwt;
      if (!token) return next(new Error("Unauthorized"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.userId;

    /* ✅ USER ONLINE */
    await User.findByIdAndUpdate(userId, { lastSeen: null });

    if (!userSocketMap.has(userId)) {
      userSocketMap.set(userId, new Set());
    }
    userSocketMap.get(userId).add(socket.id);

    io.emit("getOnlineUsers", [...userSocketMap.keys()]);

    /* ✅ MESSAGE SEEN */
    socket.on("messageSeen", async (messageId) => {
      const msg = await Message.findByIdAndUpdate(
        messageId,
        { seen: true },
        { new: true }
      );

      if (!msg) return;

      getReceiverSocketIds(msg.senderId.toString()).forEach((sid) =>
        io.to(sid).emit("messageSeen", msg._id)
      );
    });

    /* ✍️ TYPING */
    socket.on("typing", (receiverId) => {
      getReceiverSocketIds(receiverId).forEach((sid) =>
        io.to(sid).emit("typing", userId)
      );
    });

    socket.on("stopTyping", (receiverId) => {
      getReceiverSocketIds(receiverId).forEach((sid) =>
        io.to(sid).emit("stopTyping", userId)
      );
    });

    /* 🔌 DISCONNECT */
    socket.on("disconnect", async () => {
      const sockets = userSocketMap.get(userId);
      sockets?.delete(socket.id);

      if (!sockets || sockets.size === 0) {
        userSocketMap.delete(userId);

        await User.findByIdAndUpdate(userId, {
          lastSeen: new Date(),
        });

        io.emit("getOnlineUsers", [...userSocketMap.keys()]);
      }
    });
  });
};

/* ✅ THIS EXPORT WAS MISSING */
export const getReceiverSocketIds = (userId) => {
  return userSocketMap.get(userId) || new Set();
};

export { io };
