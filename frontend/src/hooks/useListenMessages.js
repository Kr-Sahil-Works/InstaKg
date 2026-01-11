import { useEffect } from "react";
import { useSocketContext } from "../context/SocketContext";
import useConversation from "../zustand/useConversation";
import notificationSound from "../assets/sounds/notification.mp3";

const useListenMessages = () => {
  const { socket } = useSocketContext();
  const { setMessages } = useConversation();

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      if (!newMessage) return;

      const safeMessage = {
        ...newMessage,
        shouldShake: true,
      };

      try {
        const sound = new Audio(notificationSound);
        sound.play().catch(() => {});
      } catch {}

      // ✅ HARD GUARANTEE ARRAY
      setMessages((prev) => {
        if (!Array.isArray(prev)) return [safeMessage];
        return [...prev, safeMessage];
      });
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, setMessages]);
};

export default useListenMessages;
