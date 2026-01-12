import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import useConversation from "../zustand/useConversation";

const useGetMessages = () => {
  const [loading, setLoading] = useState(false);
  const { selectedConversation, setMessages, messages } = useConversation();

  useEffect(() => {
    // 🔴 IMPORTANT: reset when no conversation
    if (!selectedConversation?._id) {
      setMessages([]);
      return;
    }

    const getMessages = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/messages/${selectedConversation._id}`,
          { credentials: "include" }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Failed to load messages");
        }

        // ✅ Replace messages ONCE per conversation
        setMessages(Array.isArray(data) ? data : []);
      } catch (error) {
        toast.error(error.message);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    getMessages();
  }, [selectedConversation?._id, setMessages]);

  return {
    loading,
    messages: Array.isArray(messages) ? messages : [],
  };
};

export default useGetMessages;
