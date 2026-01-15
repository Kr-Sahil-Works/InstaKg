import { useContext, useRef, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import ForwardDialog from "./ForwardDialog";
import api from "../api/axios";
import {
  FiEdit2,
  FiTrash2,
  FiX,
  FiSend,
  FiCornerUpLeft,
  FiInfo,
} from "react-icons/fi";

/* ================= EDIT DIALOG ================= */
function EditDialog({ value, onCancel, onSave }) {
  const [text, setText] = useState(value);

  return (
    <div className="fixed inset-0 z-9999 isolate">
      <div className="fixed inset-0 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onCancel}
        />
        <div className="relative w-[90%] max-w-sm rounded-2xl bg-background p-4 shadow-2xl">
          <button onClick={onCancel} className="absolute top-3 right-3">
            <FiX />
          </button>
          <h3 className="text-sm font-semibold mb-2">Edit message</h3>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-xl bg-muted px-3 py-2 outline-none"
            autoFocus
          />
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-1.5 rounded-lg bg-black/10"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(text)}
              className="px-4 py-1.5 rounded-lg bg-blue-600 text-white"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= MESSAGE ================= */
export default function Message({ msg }) {
  if (!msg) return null;

  const { authUser } = useContext(AuthContext);
  const mine = String(msg.senderId) === String(authUser?._id);

  const rootRef = useRef(null);
  const pressTimer = useRef(null);
  const longPressed = useRef(false);

  const [showMenu, setShowMenu] = useState(false);
  const [selected, setSelected] = useState(false);
  const [editing, setEditing] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  const [text, setText] = useState(msg.message);
  const [reactions, setReactions] = useState(msg.reactions || []);
  const [forwardOpen, setForwardOpen] = useState(false);

  /* ===== ADDED: DELETE STATE ===== */
  const [deleting, setDeleting] = useState(false);

  /* ===== ADDED: COLLAPSE AFTER DELETE ===== */
  const [collapsed, setCollapsed] = useState(false);

  /* ===== ADDED: ONE-TIME AUTOSCROLL FLAG ===== */
  useEffect(() => {
    if (window.__CHAT_OPENED__ !== true) {
      window.__CHAT_OPENED__ = true;
      window.__ALLOW_AUTOSCROLL__ = true;
    }
  }, []);

  /* ================= GLOBAL DESELECT ================= */
  useEffect(() => {
    const handleDeselect = (e) => {
      if (e.detail !== msg._id) {
        setSelected(false);
        setShowMenu(false);
        setInfoOpen(false);
      }
    };
    window.addEventListener("message-deselect", handleDeselect);
    return () =>
      window.removeEventListener("message-deselect", handleDeselect);
  }, [msg._id]);

  /* ===== LONG PRESS ===== */
  const startPress = () => {
    window.__ALLOW_AUTOSCROLL__ = false;
    longPressed.current = false;
    pressTimer.current = setTimeout(() => {
      longPressed.current = true;
      window.__ACTIVE_MESSAGE__ = msg._id;
      window.dispatchEvent(
        new CustomEvent("message-deselect", { detail: msg._id })
      );
      setSelected(true);
      setShowMenu(true);
    }, 450);
  };

  const endPress = () => clearTimeout(pressTimer.current);

  /* ===== ONE TAP ===== */
  const handleClick = (e) => {
    window.__ALLOW_AUTOSCROLL__ = false;
    e.stopPropagation();

    if (
      window.__ACTIVE_MESSAGE__ &&
      window.__ACTIVE_MESSAGE__ !== msg._id
    ) {
      window.__ACTIVE_MESSAGE__ = msg._id;
      window.dispatchEvent(
        new CustomEvent("message-deselect", { detail: msg._id })
      );
      setSelected(true);
      setShowMenu(true);
      return;
    }

    if (longPressed.current) return;
    react("❤️");
  };

  /* ===== REACT ===== */
  const react = async (emoji) => {
    window.__ALLOW_AUTOSCROLL__ = false;
    const res = await api.put(`/messages/react/${msg._id}`, { emoji });
    setReactions(res.data.reactions || []);
  };

  /* ===== ADDED: DELETE HANDLER ===== */
  const handleDelete = async () => {
    setDeleting(true);
    setTimeout(() => {
      setCollapsed(true); // remove gap immediately
    }, 350);

    setTimeout(async () => {
      await api.delete(`/messages/${msg._id}`);
      window.dispatchEvent(
        new CustomEvent("message-deselect", { detail: null })
      );
    }, 360);
  };

  return (
    <>
      {(showMenu || selected) && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30"
          onClick={() => {
            setShowMenu(false);
            setSelected(false);
            setInfoOpen(false);
            window.__ACTIVE_MESSAGE__ = null;
          }}
        />
      )}

      {!collapsed && (
        <div
          ref={rootRef}
          onAnimationEnd={() => {
            if (deleting) setCollapsed(true);
          }}
          className={`flex my-1.5 ${mine ? "justify-end" : "justify-start"} ${
            deleting ? "animate-smoke-vanish" : ""
          }`}
        >
          <div
            className="relative max-w-[70%] z-50"
            style={{
              marginBottom: reactions.length > 0 ? "16px" : undefined,
            }}
          >
            <div className="relative">
              <div
                onMouseDown={startPress}
                onMouseUp={endPress}
                onTouchStart={startPress}
                onTouchEnd={endPress}
                onClick={handleClick}
                className={`px-3 py-2 rounded-2xl text-[13px] line-clamp-12 ${
                  mine ? "msg-out" : "msg-in"
                } ${
                  selected
                    ? "ring-2 ring-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.9)]"
                    : ""
                }`}
              >
                {text}

                <div className="mt-1 flex items-center justify-end gap-1 text-[10px] opacity-70">
                  <span>
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>

                  {mine && msg.delivered && !msg.seen && (
                    <span className="text-gray-400">✔✔</span>
                  )}

                  {mine && msg.seen && (
                    <span className="text-blue-500">✔✔</span>
                  )}
                </div>
              </div>

              {reactions.length > 0 && (
                <div className="absolute -bottom-3 right-1 z-[100000] bg-background px-1 rounded-full text-sm shadow">
                  {reactions.map((r, i) => (
                    <span key={i}>{r.emoji}</span>
                  ))}
                </div>
              )}
            </div>

            {/* EMOJI BAR */}
            {showMenu && (
              <div
                className={`absolute -top-12 ${
                  mine ? "right-0" : "left-0"
                } z-[100000] bg-black/80 backdrop-blur px-2 py-1 rounded-full flex gap-2 animate-scale`}
              >
                {["❤️", "👍", "😂", "😮", "😢", "😡"].map((e) => (
                  <button key={e} onClick={() => react(e)} className="text-lg">
                    {e}
                  </button>
                ))}
              </div>
            )}

            {/* MENU */}
            {showMenu && (
              <div
                className={`absolute ${
                  mine ? "right-0" : "left-0"
                } mt-2 w-40 rounded-xl bg-background shadow-lg text-xs overflow-hidden z-[100000]`}
              >
                <button
                  className="w-full flex items-center gap-2 px-3 py-2"
                  onClick={() => {
                    setShowMenu(false);
                    setSelected(false);
                    window.__ACTIVE_MESSAGE__ = null;
                  }}
                >
                  <FiX /> Close
                </button>

                {mine && (
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2"
                    onClick={() => setEditing(true)}
                  >
                    <FiEdit2 /> Edit
                  </button>
                )}

                {/* ADDED BACK: INFO */}
                <button
                  className="w-full flex items-center gap-2 px-3 py-2"
                  onClick={() => setInfoOpen((v) => !v)}
                >
                  <FiInfo /> Info
                </button>

                {mine && (
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2 text-red-500"
                    onClick={handleDelete}
                  >
                    <FiTrash2 /> Delete
                  </button>
                )}

                <button
                  className="w-full flex items-center gap-2 px-3 py-2"
                  onClick={() => setForwardOpen(true)}
                >
                  <FiSend /> Forward
                </button>
              </div>
            )}

            {infoOpen && (
              <div className="absolute right-0 mt-2 p-3 rounded-lg bg-background text-xs shadow z-[100000]">
                Sent at {new Date(msg.createdAt).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      )}

      {editing && (
        <EditDialog
          value={text}
          onCancel={() => setEditing(false)}
          onSave={(t) => {}}
        />
      )}

      {forwardOpen && (
        <div className="fixed inset-0 z-9999 isolate">
          <ForwardDialog
            open={forwardOpen}
            message={msg}
            onClose={() => setForwardOpen(false)}
          />
        </div>
      )}
    </>
  );
}
