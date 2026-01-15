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

  io.use((socket, next) => {
    try {
      const cookies = socket.handshake.headers.cookie || "";
      const token = cookie.parse(cookies).jwt;
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

    socket.join(userId);

    await User.findByIdAndUpdate(userId, { lastSeen: null });

    if (!userSocketMap.has(userId)) {
      userSocketMap.set(userId, new Set());
    }
    userSocketMap.get(userId).add(socket.id);

    io.emit("getOnlineUsers", [...userSocketMap.keys()]);

    /* ✅ DELIVERED ACK */
    socket.on("messageDelivered", ({ messageId, senderId }) => {
      io.to(senderId.toString()).emit(
        "messageDelivered",
        messageId
      );
    });

    /* ✅ MESSAGE SEEN */
    socket.on("messageSeen", async (messageId) => {
      const msg = await Message.findByIdAndUpdate(
        messageId,
        { seen: true },
        { new: true }
      );
      if (!msg) return;

      io.to(msg.senderId.toString()).emit(
        "messageSeen",
        msg._id
      );
    });

    socket.on("typing", (receiverId) => {
      io.to(receiverId).emit("typing", userId);
    });

    socket.on("stopTyping", (receiverId) => {
      io.to(receiverId).emit("stopTyping", userId);
    });

    socket.on("disconnect", async () => {
      const sockets = userSocketMap.get(userId);
      sockets?.delete(socket.id);
      socket.leave(userId);

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

export const getReceiverSocketIds = (userId) => {
  return userSocketMap.get(userId) || new Set();
};

export { io };
