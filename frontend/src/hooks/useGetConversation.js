import { useEffect, useState } from "react";
import { useSocketContext } from "../context/SocketContext";

const useGetConversation = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const { socket } = useSocketContext();

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        credentials: "include",
      });
      const data = await res.json();
      setConversations(Array.isArray(data) ? data : []);
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

    const handleConversationUpdate = ({
      conversationId,
      lastMessage,
    }) => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === conversationId
            ? { ...conv, lastMessage }
            : conv
        )
      );
    };

    socket.on("conversationUpdated", handleConversationUpdate);

    return () =>
      socket.off("conversationUpdated", handleConversationUpdate);
  }, [socket]);

  return { conversations, loading };
};

export default useGetConversation;
