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
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => {
            setOpen(false);
            setExpanded(false);
          }}
        >
          <div className="absolute inset-0 bg-black/60 animate-fade" />

          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-80 rounded-lg panel p-5"
          >
            <h2 className="text-base font-semibold mb-2">
              Logout
            </h2>

            <p className="text-sm text-gray-400 mb-5">
              Are you sure you want to logout?
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setOpen(false);
                  setExpanded(false);
                }}
                className="px-3 py-1 rounded text-sm bg-black/20 hover:bg-black/30"
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
                "
              >
                {loading ? "Logging out..." : "Logout"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
