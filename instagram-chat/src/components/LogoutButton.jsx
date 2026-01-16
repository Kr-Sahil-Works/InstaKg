import { useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { SocketContext } from "../context/SocketContext";
import { useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function LogoutButton() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const { setAuthUser } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const navigate = useNavigate();

  const logout = async () => {
    setLoading(true);
    try {
      await api.post("/auth/logout");
    } catch {}

    socket?.disconnect();
    setAuthUser(null);
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* LOGOUT ICON / EXPAND */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          if (!expanded) setExpanded(true);
          else setOpen(true);
        }}
        className="
          flex items-center gap-2
          px-3 py-1 text-sm rounded
          bg-red-600 text-white
          transition-all
          hover:bg-red-500
          overflow-hidden
        "
      >
        <FiLogOut />
        <AnimatePresence>
          {expanded && (
            <motion.span
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="whitespace-nowrap"
            >
              Logout
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* MODAL */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setOpen(false);
              setExpanded(false);
            }}
          >
            {/* FULL BLUR BACKDROP */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

            {/* ALERT BOX */}
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 20, scale: 0.92, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 20, scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="relative w-80 rounded-xl overflow-hidden shadow-2xl"
            >
              {/* RED HEADER (ALERT STYLE) */}
              <div className="bg-red-600 text-white px-4 py-3 text-sm font-semibold">
                Logout
              </div>

              {/* BODY */}
              <div className="panel p-5">
                <p className="text-sm text-gray-400 mb-5">
                  Are you sure you want to logout?
                </p>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setOpen(false);
                      setExpanded(false);
                    }}
                    className="
                      px-3 py-1 rounded text-sm
                      bg-black/20
                      hover:bg-black/30
                      transition
                    "
                  >
                    Cancel
                  </button>

                  <button
                    onClick={logout}
                    disabled={loading}
                    className="
                      px-3 py-1 rounded text-sm
                      bg-red-600 text-white
                      hover:bg-red-500
                      active:scale-90
                      disabled:opacity-60
                      transition
                    "
                  >
                    {loading ? "Logging out..." : "Logout"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
