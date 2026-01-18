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


  return { socket, onlineUsers };
};
