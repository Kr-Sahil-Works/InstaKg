import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuthContext } from "./AuthContext";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocketContext = () => {
  return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
  const { authUser } = useAuthContext();

  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    // 🔴 Logout → full cleanup
    if (!authUser) {
      if (socketRef.current) {
        socketRef.current.off(); // ✅ remove all listeners
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocket(null);
      setOnlineUsers([]);
      return;
    }

    // ✅ Create socket once per login
    if (!socketRef.current) {
      const newSocket = io("https://musicconnect.onrender.com", {
        transports: ["websocket", "polling"],
        withCredentials: true,
        query: { userId: authUser._id },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      // ✅ Online users listener (ONLY ONCE)
      newSocket.on("getOnlineUsers", (users) => {
        setOnlineUsers(Array.isArray(users) ? users : []);
      });
    }

    // ❗ Do NOT disconnect here
  }, [authUser]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
