import { useContext, useRef, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import ForwardDialog from "./ForwardDialog";
import api from "../api/axios";
import { FiEdit2, FiTrash2, FiX, FiSend } from "react-icons/fi";

const EDIT_LIMIT = 10 * 60 * 1000;

// ✅ FIX: DEFINE ONCE
const REACTION_EMOJIS = ["❤️", "😂", "😮", "😢", "🔥", "👍"];

/* ================= EDIT DIALOG (INLINE – NOTHING MISSING) ================= */
function EditDialog({ editText, setEditText, onCancel, onSave }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      <div className="relative w-[90%] max-w-sm rounded-2xl bg-background p-4 shadow-2xl animate-scale">
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-black/10"
        >
          <FiX />
        </button>

        <h3 className="text-sm font-semibold mb-2">Edit message</h3>

        <textarea
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          rows={3}
          className="w-full resize-none rounded-xl bg-muted px-3 py-2 outline-none"
          autoFocus
        />

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-1.5 text-sm rounded-lg bg-black/10"
          >
            Cancel
          </button>

          <button
            onClick={onSave}
            className="px-4 py-1.5 text-sm rounded-lg bg-green-600 text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= MESSAGE ================= */
export default function Message({ msg }) {
  const { authUser } = useContext(AuthContext);
  const mine = String(msg.senderId) === String(authUser?._id);

  const time = new Date(msg.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const tapCount = useRef(0);
  const tapTimer = useRef(null);
  const boxRef = useRef(null);

  const [showMenu, setShowMenu] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(msg.message);
  const [localText, setLocalText] = useState(msg.message);
  const [vanish, setVanish] = useState(false);
  const [reactions, setReactions] = useState(msg.reactions || []);
  const [forwardOpen, setForwardOpen] = useState(false);

  useEffect(() => {
    setLocalText(msg.message);
    setEditText(msg.message);
    setReactions(msg.reactions || []);
  }, [msg.message, msg.reactions]);

  const canEdit =
    mine &&
    Date.now() - new Date(msg.createdAt).getTime() <= EDIT_LIMIT;

  /* ================= TAP HANDLER ================= */
  const handleTap = (e) => {
    e.stopPropagation();

    tapCount.current += 1;
    clearTimeout(tapTimer.current);

    tapTimer.current = setTimeout(() => {
      if (tapCount.current === 2) toggleReaction("❤️");
      if (tapCount.current === 3 && mine) {
        setShowMenu(true);
        setMenuClosing(false);
      }
      tapCount.current = 0;
    }, 300);
  };

  /* ================= OUTSIDE CLICK ================= */
  useEffect(() => {
    if (!showMenu) return;

    const close = (e) => {
      if (!boxRef.current?.contains(e.target)) closeMenu();
    };

    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [showMenu]);

  const closeMenu = () => {
    setMenuClosing(true);
    setTimeout(() => {
      setShowMenu(false);
      setMenuClosing(false);
    }, 160);
  };

  /* ================= API ================= */
  const toggleReaction = async (emoji) => {
    try {
      const res = await api.put(`/messages/react/${msg._id}`, { emoji });
      setReactions(res.data.reactions || []);
    } catch {}
  };

  const deleteMsg = async () => {
    setVanish(true);
    setTimeout(async () => {
      try {
        await api.delete(`/messages/delete/${msg._id}`);
      } catch {}
    }, 220);
  };

  const saveEdit = async () => {
    const text = editText.trim();
    if (!text) return;

    setLocalText(text);

    try {
      await api.put(`/messages/edit/${msg._id}`, { message: text });
    } catch {}

    setEditing(false);
    closeMenu();
  };

  /* ================= RENDER ================= */
  return (
    <>
      {showMenu && <div className="fixed inset-0 bg-black/25 z-40" />}

      <div
        className={`relative flex my-2 ${
          mine ? "justify-end" : "justify-start"
        } ${vanish ? "animate-vanish" : ""}`}
      >
        <div className="relative max-w-[70%]">
          <div
            ref={boxRef}
            onClick={handleTap}
            className={`relative px-3 py-2 text-sm rounded-lg z-50 select-none ${
              mine ? "msg-out rounded-br-none" : "msg-in rounded-bl-none"
            }`}
          >
            {msg.forwarded && (
              <p className="text-[10px] opacity-60 mb-1">Forwarded</p>
            )}

            <p className="break-words leading-relaxed">{localText}</p>

            <div className="flex items-center gap-1 mt-1 text-[10px] opacity-80 justify-end">
              <span>{time}</span>

              {msg.edited && (
                <span className="italic text-gray-400">edited</span>
              )}

              {/* ✅ BLUE TICKS RESTORED */}
              {mine && (
                <svg
                  viewBox="0 0 18 18"
                  className={`w-4 h-4 ${
                    msg.seen ? "text-sky-500" : "text-gray-400"
                  }`}
                  fill="currentColor"
                >
                  <path d="M6.5 12.5L2 8l1.4-1.4 3.1 3.1L13.6 2.6 15 4z" />
                  <path d="M11.5 12.5L7 8l1.4-1.4 3.1 3.1L18.6 2.6 20 4z" />
                </svg>
              )}
            </div>

            {showMenu && mine && (
              <>
                {/* EMOJI PICKER */}
                <div className="absolute -top-12 right-0 z-50 animate-pop bg-background rounded-full shadow px-2 py-1 flex gap-2">
                  {REACTION_EMOJIS.map((e) => (
                    <button
                      key={e}
                      onClick={() => toggleReaction(e)}
                      className="text-lg hover:scale-125 transition"
                    >
                      {e}
                    </button>
                  ))}
                </div>

                {/* MENU */}
                <div
                  className={`mt-2 flex gap-2 justify-end text-xs ${
                    menuClosing ? "animate-slide-down" : "animate-slide-up"
                  }`}
                >
                  <button onClick={closeMenu} className="p-1 rounded bg-black/10">
                    <FiX />
                  </button>

                  {canEdit && (
                    <button
                      onClick={() => setEditing(true)}
                      className="px-2 py-1 rounded bg-black/10"
                    >
                      <FiEdit2 /> Edit
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setForwardOpen(true);
                      closeMenu();
                    }}
                    className="px-2 py-1 rounded bg-blue-500/10 text-blue-500"
                  >
                    <FiSend /> Forward
                  </button>

                  <button
                    onClick={deleteMsg}
                    className="px-2 py-1 rounded bg-red-500/10 text-red-500"
                  >
                    <FiTrash2 /> Delete
                  </button>
                </div>
              </>
            )}
          </div>

          {reactions.length > 0 && (
            <div className="absolute -bottom-4 right-1 flex gap-1 text-sm z-[999] animate-pop">
              {reactions.map((r, i) => (
                <span key={i}>{r.emoji}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {editing && (
        <EditDialog
          editText={editText}
          setEditText={setEditText}
          onCancel={() => setEditing(false)}
          onSave={saveEdit}
        />
      )}

      {forwardOpen && (
        <ForwardDialog
          open={forwardOpen}
          messageId={msg._id}
          onClose={() => setForwardOpen(false)}
        />
      )}
    </>
  );
}
