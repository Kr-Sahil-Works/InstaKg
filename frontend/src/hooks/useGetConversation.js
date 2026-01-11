import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const useGetConversations = () => {
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    let isMounted = true; // ✅ prevent state update after unmount

    const getConversations = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/users");
        const data = await res.json();

        if (!isMounted) return;

        if (data?.error) throw new Error(data.error);

        // ✅ ALWAYS ARRAY
        if (Array.isArray(data)) {
          setConversations(data);
        } else if (Array.isArray(data?.users)) {
          setConversations(data.users);
        } else {
          setConversations([]);
        }
      } catch (error) {
        if (isMounted) {
          toast.error(error.message || "Failed to load conversations");
          setConversations([]); // ✅ safe fallback
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    getConversations();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    loading,
    conversations: Array.isArray(conversations) ? conversations : [], // ✅ double safety
  };
};

export default useGetConversations;
