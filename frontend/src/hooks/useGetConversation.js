import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSocketContext } from "../context/SocketContext";

const useGetConversations = () => {
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const { socket } = useSocketContext();

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/users", {
        credentials: "include",
      });
      const data = await res.json();
      setConversations(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // 🔥 REALTIME SIDEBAR UPDATE
  useEffect(() => {
    if (!socket) return;

    const handleConversationUpdate = () => {
      fetchConversations();
    };

    socket.on("conversationUpdated", handleConversationUpdate);

    return () => {
      socket.off("conversationUpdated", handleConversationUpdate);
    };
  }, [socket]);

  return { loading, conversations };
};

export default useGetConversations;
