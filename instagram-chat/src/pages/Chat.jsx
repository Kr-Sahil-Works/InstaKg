import { useState, useContext, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import ThemeToggle from "../components/ThemeToggle";
import LogoutButton from "../components/LogoutButton";
import Avatar from "../components/Avatar";
import { AuthContext } from "../context/AuthContext";
import { useSocket } from "../hooks/useSocket";
import { HiStatusOnline } from "react-icons/hi";
import api from "../api/axios";
import { formatLastSeen } from "../utils/formatLastSeen";

import { motion, AnimatePresence } from "framer-motion";
import { FiArrowLeft } from "react-icons/fi";

export default function Chat() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);

  const [viewportHeight, setViewportHeight] = useState(
    typeof window !== "undefined" ? window.innerHeight : 0
  );

  const { authUser, loading } = useContext(AuthContext);
  const { socket, onlineUsers = [] } = useSocket();

  const lastFetchedUser = useRef(null);

  if (loading || !authUser) return null;

  const isOnline =
    selectedUser && onlineUsers.includes(selectedUser._id);

  useEffect(() => {
    if (selectedUser) {
      setOpen(false);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (!selectedUser || isOnline) {
      setLastSeen(null);
      lastFetchedUser.current = null;
      return;
    }

    if (lastFetchedUser.current === selectedUser._id) return;

    lastFetchedUser.current = selectedUser._id;

    api
      .get(`/users/${selectedUser._id}/last-seen`)
      .then((res) => setLastSeen(res.data.lastSeen))
      .catch(() => {});
  }, [selectedUser, isOnline]);

  useEffect(() => {
    if (!window.visualViewport) return;

    const handleResize = () => {
      setViewportHeight(window.visualViewport.height);
    };

    window.visualViewport.addEventListener("resize", handleResize);
    return () =>
      window.visualViewport.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className="h-screen flex overflow-hidden"
      style={{ height: viewportHeight }}
    >
      <Sidebar
        setSelectedUser={setSelectedUser}
        onlineUsers={onlineUsers}
        open={open}
        setOpen={setOpen}
      />

      <section className="flex flex-col flex-1 overflow-hidden">
        {/* HEADER */}
        <div className="shrink-0 h-20 md:h-16 px-4 flex items-center justify-between panel border-b sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-3 text-lg hover:bg-black/20 rounded"
              onClick={() => setOpen(true)}
            >
              ☰
            </button>

            <AnimatePresence>
              {selectedUser && (
                <motion.button
                  key="back"
                  className="md:hidden p-2 rounded relative overflow-hidden back-btn"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  whileTap={{ scale: 0.88 }}
                  transition={{ duration: 0.18 }}
                  onClick={() => {
                    setSelectedUser(null);
                    setOpen(true);
                  }}
                >
                  <span className="ripple" />
                  <FiArrowLeft size={18} />
                </motion.button>
              )}
            </AnimatePresence>

            {selectedUser ? (
              <>
                <Avatar name={selectedUser.username} size={44} />
                <div>
                  <span className="font-medium text-base">
                    {selectedUser.username}
                  </span>
                  <div className="text-xs text-gray-400">
                    {isOnline ? "online" : formatLastSeen(lastSeen)}
                  </div>
                </div>
              </>
            ) : (
              <AnimatePresence>
  <motion.div
  key="me"
  className="
    relative
    flex items-center justify-center
    px-6 py-1.5
    rounded-full
    bg-pink-500/10
    backdrop-blur-md
    overflow-hidden
    min-w-40
    cursor-pointer
  "
>

    {/* USERNAME — SOLID PLATFORM */}
    <motion.span
      className="
        relative z-10
        text-[15px]
        font-semibold
        text-pink-100
        handwritten
      "
     animate={{
  y: [0, 0, 6, -2, 0],
  scale: [1, 1, 0.92, 1.04, 1],
}}

      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
        times: [0, 0.5, 0.6, 0.7, 1],
      }}
    >
      {authUser.username}
    </motion.span>

    {/* FLOATING LOVE HEARTS */}
    {["💖", "💗", "💞"].map((h, i) => (
      <motion.span
        key={i}
        className="absolute text-sm z-20"
        style={{
          left: `${38 + i * 12}%`,
          bottom: "52%",
        }}
        animate={{
          y: [0, -14, 0],
          rotate: [-4, 4, -4],
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          delay: i * 0.2,
          ease: "easeInOut",
        }}
      >
        {h}
      </motion.span>
    ))}

    {/* BIG ROMANTIC HEART — CRUSH */}
    <motion.span
      className="
        absolute
        text-5xl
        z-30
        drop-shadow-[0_0_18px_rgba(255,105,180,0.9)]
      "
      initial={{ y: -80, scale: 0 }}
      animate={{
        y: [-80, 0, 0, 40],
        scale: [0, 1.15, 1.35, 0],
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
        times: [0, 0.48, 0.6, 1],
      }}
    >
      ❤️
    </motion.span>
  </motion.div>
</AnimatePresence>

            )}
          </div>

          <div className="flex items-center gap-3">
            {selectedUser && isOnline && (
              <HiStatusOnline className="text-green-500" size={16} />
            )}

            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>

       <motion.div
  className="flex-1 overflow-hidden min-h-0"
  drag="x"
  dragElastic={0.15}
  dragConstraints={{ left: 0, right: 0 }}
  style={{ touchAction: "pan-y" }}
  onDragEnd={(e, info) => {
    if (info.offset.x > 120 && selectedUser) {
      setSelectedUser(null);
      setOpen(true);
    }
  }}
>

          <ChatWindow user={selectedUser} socket={socket} />
        </motion.div>
      </section>

    <style>
  {`
  .back-btn:active .ripple {
    animation: ripple 0.45s ease-out;
  }

  .ripple {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle, rgba(255,255,255,0.35) 10%, transparent 10%);
    transform: scale(0);
  }

  @keyframes ripple {
    to {
      transform: scale(2.5);
      opacity: 0;
    }
  }

  /* ================= MOBILE SCROLL LOCK FIX ================= */

  html, body {
    overflow-x: hidden !important;
    overscroll-behavior-x: none !important;
    width: 100%;
  }

  #root {
    overflow-x: hidden !important;
  }

  * {
    overscroll-behavior-x: none;
  }

  @supports (-webkit-touch-callout: none) {
    body {
      touch-action: pan-y;
    }
  }

  /* ================= KEYBOARD RESIZE FIX (ADD ONLY) ================= */

  html, body {
    height: 100%;
    position: fixed;
    inset: 0;
  }

  /* Use dynamic viewport height when keyboard opens */
  @supports (height: 100dvh) {
    .h-screen {
      height: 100dvh !important;
    }
  }

  /* Prevent vertical jump when keyboard toggles */
  body {
    overscroll-behavior-y: none;
  }
  `}
</style>


    </div>
  );
}
