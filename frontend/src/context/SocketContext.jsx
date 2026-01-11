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
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    // 🔴 If user logs out → clean up
    if (!authUser) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setOnlineUsers([]);
      return;
    }

    // 🔹 Create socket only once per login
    if (!socketRef.current) {
      socketRef.current = io("https://musicconnect.onrender.com", {
        transports: ["polling", "websocket"], // ✅ Render-safe
        withCredentials: true,
        query: { userId: authUser._id },
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      // 🔹 Online users listener
      socketRef.current.on("getOnlineUsers", (users) => {
        setOnlineUsers(Array.isArray(users) ? users : []);
      });
    }

    return () => {
      // ❗ Do NOT disconnect here (keeps realtime stable)
    };
  }, [authUser]);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        onlineUsers,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
