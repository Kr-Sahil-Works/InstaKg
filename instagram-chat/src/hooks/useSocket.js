import { useContext, useEffect, useState } from "react";
import { SocketContext } from "../context/SocketContext";

export const useSocket = () => {
  const { socket } = useContext(SocketContext);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
  if (!socket) return;

  const handleConnect = () => {
    // force refresh online users + wake listeners
    socket.emit("getOnlineUsers");
  };

  socket.on("connect", handleConnect);

  return () => socket.off("connect", handleConnect);
}, [socket]);
useEffect(() => {
  if (!socket) return;

  // ✅ MOBILE HEARTBEAT — keep socket alive
  const interval = setInterval(() => {
    if (socket.connected) {
      socket.emit("ping");
    }
  }, 15000); // every 15s (mobile-safe)

  return () => clearInterval(interval);
}, [socket]);


  return { socket, onlineUsers };
};
