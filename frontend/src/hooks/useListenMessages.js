import { useEffect } from "react";
import { useSocketContext } from "../context/SocketContext";
import useConversation from "../zustand/useConversation";
import notificationSound from "../assets/sounds/notification.mp3";

const useListenMessages = () => {
  const { socket } = useSocketContext();
  const { selectedConversation, setMessages } = useConversation();

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      if (!newMessage) return;

      // 🔔 play sound
      try {
        new Audio(notificationSound).play().catch(() => {});
      } catch {}

      // ✅ ALWAYS add message
      setMessages((prev) => {
        if (!Array.isArray(prev)) return [newMessage];

        // avoid duplicates
        if (prev.some((m) => m._id === newMessage._id)) {
          return prev;
        }

        // only append if this conversation is open
        if (
          selectedConversation?._id === newMessage.conversationId
        ) {
          return [...prev, newMessage];
        }

        // ❗ store message silently
        return prev;
      });
    };

    socket.on("newMessage", handleNewMessage);

    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, selectedConversation, setMessages]);
};

export default useListenMessages;
