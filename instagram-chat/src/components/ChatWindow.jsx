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

  /* LOAD MESSAGES */
  useEffect(() => {
    if (!user) return;
    api.get(`/messages/${user._id}`).then(res => {
      setMessages(res.data || []);
    });
  }, [user]);

  /* SOCKET LISTENERS */
  useEffect(() => {
    if (!socket) return;

    const onNewMessage = msg => {
      if (
        msg.senderId === user?._id ||
        msg.receiverId === user?._id
      ) {
        setMessages(prev => [...prev, msg]);
      }
    };

    const onSeen = id => {
      setMessages(prev =>
        prev.map(m =>
          m._id === id ? { ...m, seen: true } : m
        )
      );
    };

    socket.on("newMessage", onNewMessage);
    socket.on("messageSeen", onSeen);
    socket.on("typing", () => setTyping(true));
    socket.on("stopTyping", () => setTyping(false));

    return () => {
      socket.off("newMessage", onNewMessage);
      socket.off("messageSeen", onSeen);
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, [socket, user]);

  /* MARK SEEN (SAFE) */
  useEffect(() => {
    if (!socket || !user) return;

    messages.forEach(m => {
      if (
        !m.seen &&
        m.receiverId === authUser._id
      ) {
        api.put(`/messages/seen/${m._id}`);
      }
    });
  }, [messages, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Select a chat
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
        {messages.map(msg => (
          <Message key={msg._id} msg={msg} />
        ))}

        {typing && (
          <div className="text-xs text-gray-400">
            typing…
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <MessageInput receiverId={user._id} socket={socket} />
    </div>
  );
}
