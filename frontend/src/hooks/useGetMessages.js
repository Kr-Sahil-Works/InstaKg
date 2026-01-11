import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import useConversation from "../zustand/useConversation";

const useGetMessages = () => {
  const [loading, setLoading] = useState(false);
  const { selectedConversation, messages, setMessages } = useConversation();

  useEffect(() => {
    if (!selectedConversation?._id) {
      setMessages([]); // ✅ reset safely
      return;
    }

    const getMessages = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/messages/${selectedConversation._id}`
        );
        const data = await res.json();

        if (data?.error) throw new Error(data.error);

        setMessages(Array.isArray(data) ? data : []);
      } catch (error) {
        toast.error(error.message);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    getMessages();
  }, [selectedConversation?._id]);

  return {
    loading,
    messages: Array.isArray(messages) ? messages : [],
  };
};

export default useGetMessages;
