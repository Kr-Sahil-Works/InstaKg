import { useContext, useRef, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import { FiEdit2, FiTrash2, FiX } from "react-icons/fi";

const EDIT_LIMIT = 10 * 60 * 1000;

export default function Message({ msg }) {
  const { authUser } = useContext(AuthContext);
  const mine = String(msg.senderId) === String(authUser?._id);

  const time = new Date(msg.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  /* ================= STATE ================= */
  const tapCount = useRef(0);
  const tapTimer = useRef(null);

  const [showMenu, setShowMenu] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);
  const [hearted, setHearted] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(msg.message);
  const [vanish, setVanish] = useState(false);

  const canEdit =
    mine &&
    Date.now() - new Date(msg.createdAt).getTime() <= EDIT_LIMIT;

  /* ================= TAP HANDLER ================= */
  const handleTap = () => {
    tapCount.current += 1;

    clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => {
      // ❤️ DOUBLE TAP (ALL MESSAGES)
      if (tapCount.current === 2) {
        setHearted((v) => !v);
      }

      // ⋮ TRIPLE TAP (ONLY YOUR MESSAGE)
      if (tapCount.current === 3 && mine) {
        setShowMenu(true);
        setMenuClosing(false);
      }

      tapCount.current = 0;
    }, 320);
  };

  /* ================= ACTIONS ================= */
  const closeMenu = () => {
    setMenuClosing(true);
    setTimeout(() => {
      setShowMenu(false);
      setMenuClosing(false);
    }, 180);
  };

  const deleteMsg = async () => {
    try {
      setVanish(true);
      setTimeout(async () => {
        await api.delete(`/messages/delete/${msg._id}`);
      }, 200);
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const saveEdit = async () => {
    if (!editText.trim()) return;
    await api.put(`/messages/edit/${msg._id}`, {
      message: editText.trim(),
    });
    setEditing(false);
    closeMenu();
  };

  return (
    <>
      <div
        className={`flex ${
          mine ? "justify-end" : "justify-start"
        } ${vanish ? "animate-vanish" : ""}`}
      >
        <div
          onPointerDown={handleTap}
          className={`
            relative max-w-[70%] px-3 py-2 text-sm
            rounded-lg select-none
            ${
              mine
                ? "msg-out rounded-br-none"
                : "msg-in rounded-bl-none"
            }
          `}
        >
          {/* ❤️ HEART (BOTTOM CENTER – INSTAGRAM STYLE) */}
          {hearted && (
            <div
              className="
                absolute -bottom-4 left-1/2
                -translate-x-1/2
                text-red-500 text-xl
                animate-pop z-30
              "
            >
              ❤️
            </div>
          )}

          {/* MESSAGE */}
          <p className="break-words leading-relaxed">
            {msg.message}
          </p>

          {/* META */}
          <div className="flex items-center gap-1 mt-1 text-[10px] opacity-80 justify-end">
            <span>{time}</span>
            {msg.edited && (
              <span className="italic text-gray-400">
                edited
              </span>
            )}
          </div>

          {/* TRIPLE TAP MENU */}
          {showMenu && mine && (
            <div
              className={`
                mt-2 flex gap-2 justify-end text-xs
                ${
                  menuClosing
                    ? "animate-slide-down"
                    : "animate-slide-up"
                }
              `}
            >
              {/* CLOSE */}
              <button
                onClick={closeMenu}
                className="p-1 rounded bg-black/10 hover:bg-black/20"
              >
                <FiX />
              </button>

              {/* LIKE */}
              <button
                onClick={() => setHearted((v) => !v)}
                className="px-2 py-1 rounded bg-pink-500/10 text-pink-500 hover:bg-pink-500/20"
              >
                ❤️
              </button>

              {/* EDIT */}
              {canEdit && (
                <button
                  onClick={() => setEditing(true)}
                  className="px-2 py-1 rounded bg-black/10 hover:bg-black/20"
                >
                  <FiEdit2 /> Edit
                </button>
              )}

              {/* DELETE */}
              <button
                onClick={deleteMsg}
                className="px-2 py-1 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20"
              >
                <FiTrash2 /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ================= EDIT MODAL ================= */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setEditing(false)}
          />
          <div className="relative w-[90%] max-w-sm rounded-xl bg-background p-4 shadow-xl animate-scale">
            <button
              onClick={() => setEditing(false)}
              className="absolute top-2 right-2 p-1 rounded hover:bg-black/10"
            >
              <FiX />
            </button>

            <h3 className="text-sm font-medium mb-2">
              Edit message
            </h3>

            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full rounded-lg p-2 bg-muted resize-none outline-none"
              rows={3}
              autoFocus
            />

            <div className="mt-3 flex justify-end gap-2">
              <button
                onClick={() => setEditing(false)}
                className="px-3 py-1 text-sm rounded bg-black/10 hover:bg-black/20"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="px-3 py-1 text-sm rounded bg-green-600 text-white hover:bg-green-500"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
