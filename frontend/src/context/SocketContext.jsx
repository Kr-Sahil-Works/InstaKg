import { createContext, useContext, useEffect, useState } from "react";
import { useAuthContext } from "./AuthContext";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocketContext = () => {
  return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
  const { authUser } = useAuthContext();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!authUser) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      setOnlineUsers([]); // ✅ reset
      return;
    }

    const newSocket = io("https://musicconnect.onrender.com", {
      transports: ["polling", "websocket"], // ✅ Render-safe
      withCredentials: true,
      query: { userId: authUser._id },
    });

    setSocket(newSocket);

    newSocket.on("getOnlineUsers", (users) => {
      setOnlineUsers(Array.isArray(users) ? users : []); // ✅ GUARDED
    });

    return () => {
      newSocket.disconnect();
      setOnlineUsers([]);
    };
  }, [authUser]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers: Array.isArray(onlineUsers) ? onlineUsers : [], // ✅ double safety
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
