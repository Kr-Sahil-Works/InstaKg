import { useEffect } from "react";
import { useSocketContext } from "../context/SocketContext";
import useConversation from "../zustand/useConversation";
import notificationSound from "../assets/sounds/notification.mp3";

const useListenMessages = () => {
  const { socket } = useSocketContext();
  const { selectedConversation, setMessages } = useConversation();

  useEffect(() => {
    if (!socket || !selectedConversation?._id) return;

    const handleNewMessage = (newMessage) => {
      if (!newMessage) return;

      // ✅ HARD FILTER by conversation
      if (newMessage.conversationId !== selectedConversation._id) return;

      try {
        const sound = new Audio(notificationSound);
        sound.play().catch(() => {});
      } catch {}

      setMessages((prev) =>
        Array.isArray(prev) ? [...prev, newMessage] : [newMessage]
      );
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, selectedConversation?._id, setMessages]);
};

export default useListenMessages;
