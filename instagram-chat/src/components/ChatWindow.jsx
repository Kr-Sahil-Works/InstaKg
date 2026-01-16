import { useEffect, useRef, useState, useContext } from "react";
import api from "../api/axios";
import Message from "./Message";
import MessageInput from "./MessageInput";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";

export default function ChatWindow({ user, socket }) {
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showJump, setShowJump] = useState(false);

  const listRef = useRef(null);
  const bottomRef = useRef(null);
  const seenSet = useRef(new Set());

  const { authUser } = useContext(AuthContext);

  /* ================= LOAD MESSAGES ================= */
  useEffect(() => {
    if (!user) return;

    api.get(`/messages/${user._id}`).then((res) => {
      setMessages(res.data || []);
      seenSet.current.clear();
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "auto" });
      }, 0);
    });
  }, [user]);

  /* ================= SOCKET ================= */
  useEffect(() => {
    if (!socket || !user) return;

    const onNewMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("newMessage", onNewMessage);
    socket.on("typing", () => setTyping(true));
    socket.on("stopTyping", () => setTyping(false));

    return () => {
      socket.off("newMessage", onNewMessage);
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, [socket, user]);

  return (
    <div className="flex flex-col h-full overflow-hidden min-h-0">
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto px-4 py-4 relative"
      >
        {messages.map((msg) => {
          const isMe = msg.senderId === authUser?._id;

          return (
            <motion.div
              key={msg._id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              className="relative"
            >
              {isMe && (
                <span className="
                  absolute -top-2 right-2
                  text-[10px] px-1.5 py-0.5
                  rounded-full bg-green-600 text-white
                ">
                  You
                </span>
              )}
              <Message msg={msg} />
            </motion.div>
          );
        })}

        {typing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-gray-400 px-2"
          >
            typing…
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="shrink-0">
        <MessageInput receiverId={user._id} socket={socket} />
      </div>
    </div>
  );
}
