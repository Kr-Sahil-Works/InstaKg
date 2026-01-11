import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
	path: "/socket.io",
	cors: {
		origin: [
			"http://localhost:5173",
			"https://chat-app-yt.onrender.com",
		],
		credentials: true,
	},
});


const userSocketMap = {}; // { userId: socketId }

export const getReceiverSocketId = (receiverId) => {
	return userSocketMap[receiverId];
};

io.on("connection", (socket) => {
	console.log("✅ user connected:", socket.id);

	const userId = socket.handshake.query.userId?.toString();

	if (userId && userId !== "undefined") {
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
});

});

export { app, server, io };
