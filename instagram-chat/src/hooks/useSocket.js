import { useContext, useEffect, useState } from "react";
import { SocketContext } from "../context/SocketContext";

export const useSocket = () => {
  const { socket } = useContext(SocketContext);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!socket) return;

    socket.on("getOnlineUsers", setOnlineUsers);
    return () => socket.off("getOnlineUsers");
  }, [socket]);

  return { socket, onlineUsers };
};
