import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { authUser } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!authUser) {
      socket?.disconnect();
      setSocket(null);
      return;
    }

    const s = io("http://localhost:5000", {
      withCredentials: true,

      // ✅ MOBILE REALTIME FIXES (MANDATORY)
      transports: ["websocket"],
      upgrade: false,

      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,

      timeout: 20000,
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [authUser]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
