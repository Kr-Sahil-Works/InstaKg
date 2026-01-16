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

// ➕ ADD
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowLeft } from "react-icons/fi";

export default function Chat() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);

  // ➕ ADD — keyboard-aware height
  const [viewportHeight, setViewportHeight] = useState(
    typeof window !== "undefined" ? window.innerHeight : 0
  );

  const { authUser, loading } = useContext(AuthContext);
  const { socket, onlineUsers = [] } = useSocket();

  const lastFetchedUser = useRef(null);

  if (loading || !authUser) return null;

  const isOnline =
    selectedUser && onlineUsers.includes(selectedUser._id);

  /* HIDE SIDEBAR ON MOBILE WHEN CHAT SELECTED */
  useEffect(() => {
    if (selectedUser) {
      setOpen(false);
    }
  }, [selectedUser]);

  /* LAST SEEN (SAFE + NO SPAM) */
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

  /* ➕ ADD — VISUAL VIEWPORT (KEYBOARD DETECTION) */
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
      // ➕ ADD — real mobile keyboard handling
      style={{
        height: viewportHeight,
      }}
    >
      {/* SIDEBAR */}
      <Sidebar
        setSelectedUser={setSelectedUser}
        onlineUsers={onlineUsers}
        open={open}
        setOpen={setOpen}
      />

      {/* CHAT AREA */}
      <section className="flex flex-col flex-1 overflow-hidden">
        {/* HEADER (FIXED) */}
        <div className="shrink-0 h-20 md:h-16 px-4 flex items-center justify-between panel border-b sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-3 text-lg hover:bg-black/20 rounded"
              onClick={() => setOpen(true)}
            >
              ☰
            </button>

            {/* BACK BUTTON */}
            <AnimatePresence>
              {selectedUser && (
                <motion.button
                  key="back"
                  className="md:hidden p-2 rounded relative overflow-hidden back-btn"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  whileTap={{ scale: 0.88 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
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
                    {isOnline
                      ? "online"
                      : formatLastSeen(lastSeen)}
                  </div>
                </div>
              </>
            ) : (
              <span className="font-medium text-lg">
                Messages
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {selectedUser && isOnline && (
              <HiStatusOnline
                className="text-green-500"
                size={16}
              />
            )}

            <span className="hidden sm:block">
              {authUser.username}
            </span>

            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>

        {/* CHAT WINDOW — RESIZES WITH KEYBOARD */}
        <motion.div
          className="flex-1 overflow-hidden min-h-0"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={(e, info) => {
            if (info.offset.x > 120 && selectedUser) {
              setSelectedUser(null);
              setOpen(true);
            }
          }}
        >
          {selectedUser && (
            <ChatWindow
              user={selectedUser}
              socket={socket}
            />
          )}
        </motion.div>
      </section>

      {/* RIPPLE STYLE (UNCHANGED) */}
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
          pointer-events: none;
        }

        @keyframes ripple {
          from {
            transform: scale(0);
            opacity: 0.6;
          }
          to {
            transform: scale(2.5);
            opacity: 0;
          }
        }
        `}
      </style>
    </div>
  );
}
