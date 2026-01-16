import { useEffect, useRef, useState, useContext } from "react";
import api from "../api/axios";
import Message from "./Message";
import MessageInput from "./MessageInput";
import { AuthContext } from "../context/AuthContext";

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

  /* ================= INITIAL AUTO SCROLL ================= */
  useEffect(() => {
    if (user && window.__CHAT_SCROLL_READY__ !== user._id) {
      window.__CHAT_SCROLL_READY__ = user._id;
      window.__ALLOW_AUTOSCROLL__ = true;
    }
  }, [user]);

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
  if (
    msg.senderId === user._id ||
    msg.receiverId === user._id
  ) {
    if (isAtBottom) {
      window.__ALLOW_AUTOSCROLL__ = true;
    } else {
      setShowJump(true);
      if (msg.senderId === user._id) {
        setUnreadCount((c) => c + 1);
      }
    }
    setMessages((prev) => [...prev, msg]);
  }
};

    socket.on("messageEdited", (updatedMsg) => {
  setMessages((prev) =>
    prev.map((m) =>
      m._id === updatedMsg._id
        ? { ...m, message: updatedMsg.message, edited: true }
        : m
    )
  );
});

    socket.on("newMessage", onNewMessage);
    socket.on("typing", () => setTyping(true));
    socket.on("stopTyping", () => setTyping(false));

    return () => {
      socket.off("newMessage", onNewMessage);
      socket.off("typing");
       socket.off("messageEdited");
      socket.off("stopTyping");
    };
  }, [socket, user, isAtBottom]);

  /* ================= MARK SEEN ================= */
  useEffect(() => {
    if (!user || !authUser) return;

    messages.forEach((m) => {
      if (
        !m.seen &&
        m.receiverId === authUser._id &&
        !seenSet.current.has(m._id)
      ) {
        seenSet.current.add(m._id);
        api.put(`/messages/seen/${m._id}`).catch(() => {});
      }
    });
  }, [messages, user, authUser]);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    if (window.__ALLOW_AUTOSCROLL__ === true) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      window.__ALLOW_AUTOSCROLL__ = false;
    }
  }, [messages, typing]);

  /* ================= SCROLL DETECTOR ================= */
  const handleScroll = () => {
    const el = listRef.current;
    if (!el) return;

    const threshold = 80;
    const atBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < threshold;

   setIsAtBottom(atBottom);
setShowJump(!atBottom);

if (atBottom) {
  setUnreadCount(0);
}

  };

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Select a chat
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden min-h-0">
      {/* MESSAGES */}
      <div
        ref={listRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto px-4 py-4 md:py-3 relative"
      >
        {messages.map((msg) => (
          <Message key={msg._id} msg={msg} />
        ))}

        {typing && (
          <div className="text-xs text-gray-400 px-2">
            typing…
          </div>
        )}

        <div ref={bottomRef} />

        {/* ⬇ JUMP TO BOTTOM */}
        {showJump && (
          <button
            onClick={() => {
              bottomRef.current?.scrollIntoView({ behavior: "smooth" });
              setUnreadCount(0);

            }}
            className="fixed bottom-24 right-6 px-3 py-1.5 rounded-full
                       bg-[#a4c910] text-white text-xs shadow-lg
                       animate-fade mr-48"
          >
            ⬇ {unreadCount > 0 ? `${unreadCount} new` : "Latest messages"}

          </button>
        )}
      </div>

      {/* INPUT */}
      <div className="shrink-0">
        <MessageInput receiverId={user._id} socket={socket} />
      </div>
    </div>
  );
}
