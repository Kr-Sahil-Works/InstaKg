import { useEffect, useRef, useState, useContext } from "react";
import api from "../api/axios";
import Message from "./Message";
import MessageInput from "./MessageInput";
import { AuthContext } from "../context/AuthContext";

export default function ChatWindow({ user, socket }) {
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const { authUser } = useContext(AuthContext);

  /* ================= LOAD MESSAGES ================= */
  useEffect(() => {
    if (!user) return;

    api.get(`/messages/${user._id}`).then((res) => {
      setMessages(res.data || []);
    });
  }, [user]);

  /* ================= SOCKET EVENTS ================= */
  useEffect(() => {
    if (!socket || !user) return;

    const onNewMessage = (msg) => {
      if (
        msg.senderId === user._id ||
        msg.receiverId === user._id
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    const onEdited = (updated) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === updated._id ? updated : m
        )
      );
    };

    const onDeleted = (id) => {
      setMessages((prev) =>
        prev.filter((m) => m._id !== id)
      );
    };

    const onSeen = (id) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === id ? { ...m, seen: true } : m
        )
      );
    };

    const onReaction = (updated) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === updated._id ? updated : m
        )
      );
    };

    socket.on("newMessage", onNewMessage);
    socket.on("messageEdited", onEdited);
    socket.on("messageDeleted", onDeleted);
    socket.on("messageSeen", onSeen);
    socket.on("reactionUpdated", onReaction);
    socket.on("typing", () => setTyping(true));
    socket.on("stopTyping", () => setTyping(false));

    return () => {
      socket.off("newMessage", onNewMessage);
      socket.off("messageEdited", onEdited);
      socket.off("messageDeleted", onDeleted);
      socket.off("messageSeen", onSeen);
      socket.off("reactionUpdated", onReaction);
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, [socket, user]);

  /* ================= MARK SEEN ================= */
  useEffect(() => {
    if (!user || !authUser) return;

    messages.forEach((m) => {
      if (
        !m.seen &&
        m.receiverId === authUser._id
      ) {
        api.put(`/messages/seen/${m._id}`);
      }
    });
  }, [messages, user, authUser]);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, typing]);

  /* ================= EMPTY ================= */
  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Select a chat
      </div>
    );
  }

  /* ================= RENDER ================= */
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {messages.map((msg) => (
          <Message key={msg._id} msg={msg} />
        ))}

        {typing && (
          <div className="text-xs text-gray-400 px-2">
            typing…
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="shrink-0">
        <MessageInput
          receiverId={user._id}
          socket={socket}
        />
      </div>
    </div>
  );
}
