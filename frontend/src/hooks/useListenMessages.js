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

      try {
        new Audio(notificationSound).play().catch(() => {});
      } catch {}

      setMessages((prev) => {
        if (
          selectedConversation?._id === newMessage.conversationId
        ) {
          return [...prev, newMessage];
        }
        return prev;
      });
    };

    socket.on("newMessage", handleNewMessage);

    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, setMessages]); // ❌ no selectedConversation here
};

export default useListenMessages;
