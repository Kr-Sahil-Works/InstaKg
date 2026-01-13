import { useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { SocketContext } from "../context/SocketContext";
import { useNavigate } from "react-router-dom";

export default function LogoutButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { setAuthUser } = useContext(AuthContext); // ✅ FIX
  const { socket } = useContext(SocketContext);
  const navigate = useNavigate();

  const logout = async () => {
    setLoading(true);
    try {
      await api.post("/auth/logout");
    } catch {}

    socket?.disconnect();     // ✅ close socket
    setAuthUser(null);        // ✅ clear context
    navigate("/login", { replace: true }); // ✅ redirect
  };

  return (
    <>
      {/* LOGOUT BUTTON */}
      <button
        onClick={() => setOpen(true)}
        className="
          px-3 py-1 text-sm rounded
          bg-red-600 text-white
          transition-all duration-150
          hover:bg-red-500
          active:scale-90
        "
      >
        Logout
      </button>

      {/* MODAL */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setOpen(false)}
        >
          {/* BACKDROP */}
          <div className="absolute inset-0 bg-black/60 animate-fade" />

          {/* BOX */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="
              relative w-80 rounded-lg
              panel p-5
              animate-fade
            "
          >
            <h2 className="text-base font-semibold mb-2">
              Logout
            </h2>

            <p className="text-sm text-gray-400 mb-5">
              Are you sure you want to logout?
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
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
                  transition-all
                  hover:bg-red-500
                  active:scale-90
                  disabled:opacity-60
                "
              >
                {loading ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
