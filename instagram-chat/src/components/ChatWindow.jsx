import { useEffect, useRef, useState, useContext } from "react";
import api from "../api/axios";
import Message from "./Message";
import MessageInput from "./MessageInput";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";

export default function ChatWindow({ user, socket }) {
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);

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

      {/* ================= EMPTY STATE ================= */}
      {!user && (
        <div
          className="relative flex-1 overflow-hidden"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const cx = rect.width / 2;
            const cy = rect.height / 2;

            const dx = (x - cx) / cx;
            const dy = (y - cy) / cy;

            e.currentTarget.style.setProperty("--dx", dx.toFixed(2));
            e.currentTarget.style.setProperty("--dy", dy.toFixed(2));
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.setProperty("--dx", 0);
            e.currentTarget.style.setProperty("--dy", 0);
          }}
        >
          {/* WALLPAPER */}
          <div className="absolute inset-0 bg-linear-to-b from-black/10 to-black/40" />

         {/* FLOATING HEART LINES — INVERSE BLUR */}
{Array.from({ length: 7 }).map((_, row) => (
  <motion.div
    key={row}
    className="absolute left-0 right-0 flex justify-evenly pointer-events-none"
    style={{
      top: `${(row / 4) * 80 + 10}%`,
      transform: `
        translate(
          calc(var(--dx,0) * ${(row + 1) * 4}px),
          calc(var(--dy,0) * ${(row + 1) * 4}px)
        )
      `,
      filter: `
        blur(
          calc(
            (1 - (abs(var(--dx,0)) + abs(var(--dy,0)))) * 6px
          )
        )
      `,
      transition: "transform 0.25s ease-out, filter 0.25s ease-out",
      opacity: 0.3,
    }}
    animate={{
      y: [0, -6, 0],
    }}
    transition={{
      duration: 2.2 + row * 0.25,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  >
    {Array.from({ length: 8 }).map((_, i) => (
      <span key={i} className="text-xl">
        💗
      </span>
    ))}
  </motion.div>
))}


          {/* BEAR */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transform: `
                translate(
                  calc(var(--dx,0) * 16px),
                  calc(var(--dy,0) * 16px)
                )
              `,
              transition: "transform 0.2s ease-out",
            }}
          >
            <img
              src="/bear.png"
              alt="Empty chat"
              className="
                w-72 sm:w-80 md:w-96
                opacity-90
                transition-all duration-300 ease-out
                blur-sm
                hover:blur-0
                hover:scale-105
              "
              style={{
                filter: `
                  blur(
                    calc(
                      (abs(var(--dx,0)) + abs(var(--dy,0))) * 4px
                    )
                  )
                `,
              }}
              draggable={false}
            />
          </div>

         {/* HINT */}
<motion.div
  className="absolute bottom-24 w-full text-center pointer-events-none"
  initial={{ opacity: 0 }}
  animate={{ opacity: [0.25, 0.9, 0.25] }}
  transition={{
    duration: 5,
    repeat: Infinity,
    ease: "easeInOut",
  }}
>
  <span
    className="
      inline-block
      text-sm font-medium
      bg-linear-to-r
      from-pink-400 via-purple-400 to-blue-400
      bg-clip-text text-transparent

      drop-shadow-[0_0_6px_rgba(168,85,247,0.35)]
      dark:drop-shadow-[0_0_8px_rgba(236,72,153,0.45)]
    "
  >
    Select a chat to start messaging
  </span>
</motion.div>

        </div>
      )}

      {/* ================= CHAT CONTENT ================= */}
      {user && (
        <>
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto px-4 py-4 relative"
          >
            {messages.map((msg) => (
              <motion.div
                key={msg._id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                className="relative"
              >
                <Message msg={msg} />
              </motion.div>
            ))}

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
        </>
      )}
    </div>
  );
}
