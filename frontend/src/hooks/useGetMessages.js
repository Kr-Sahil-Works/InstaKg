import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import useConversation from "../zustand/useConversation";

const useGetMessages = () => {
  const [loading, setLoading] = useState(false);
  const { selectedConversation, setMessages, messages } = useConversation();

  useEffect(() => {
    if (!selectedConversation?._id) return;

    const getMessages = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/messages/${selectedConversation._id}`
        );
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
      } catch {
        toast.error("Failed to load messages");
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    getMessages();
  }, [selectedConversation?._id, setMessages]);

  return { loading, messages };
};

export default useGetMessages;
