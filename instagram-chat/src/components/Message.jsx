import { useContext, useRef, useState, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
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
  useEffect(() => {
  setText(value);
}, [value]);


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
  const EDIT_DELETE_LIMIT = 10 * 60 * 1000; // 10 minutes

const canModify =
  mine &&
  Date.now() - new Date(msg.createdAt).getTime() <= EDIT_DELETE_LIMIT;


  const rootRef = useRef(null);
  const bubbleRef = useRef(null);
  const pressTimer = useRef(null);
  const longPressed = useRef(false);

  const [showMenu, setShowMenu] = useState(false);
  const [expanded, setExpanded] = useState(false);

   const [text, setText] = useState(msg.message);

  useEffect(() => {
  if (expanded) {
    requestAnimationFrame(() => {
      contentRef.current?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    });
  }
}, [expanded]);

  const contentRef = useRef(null);
const [hasOverflow, setHasOverflow] = useState(false);

  useEffect(() => {
  setExpanded(false);

  requestAnimationFrame(() => {
    const el = contentRef.current;
    if (!el) return;

    setHasOverflow(el.scrollHeight > el.clientHeight + 4);
  });
}, [msg._id, text]);


  useEffect(() => {
  document.body.style.overflow = showMenu ? "hidden" : "";
  return () => {
    document.body.style.overflow = "";
  };
}, [showMenu]);

  const [selected, setSelected] = useState(false);
  const [editing, setEditing] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

 
  const [reactions, setReactions] = useState(msg.reactions || []);
  const [forwardOpen, setForwardOpen] = useState(false);

  const [menuPos, setMenuPos] = useState(null);

  const [deleting, setDeleting] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

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
    
    const res = await api.put(`/messages/react/${msg._id}`, { emoji });
    setReactions(res.data.reactions || []);
  };

  /* ===== DELETE ===== */
  const handleDelete = async () => {
    setDeleting(true);
    setTimeout(() => setCollapsed(true), 350);

    setTimeout(async () => {
      await api.delete(`/messages/${msg._id}`);
      window.dispatchEvent(
        new CustomEvent("message-deselect", { detail: null })
      );
    }, 360);
  };

  /* ===== MENU POSITION (FIXED OVERLAY) ===== */
  useLayoutEffect(() => {
    if (!showMenu || !bubbleRef.current) return;

    const rect = bubbleRef.current.getBoundingClientRect();
    const isNearBottom = rect.bottom + 200 > window.innerHeight;


   setMenuPos({
  top: isNearBottom ? rect.top - 160 : rect.bottom + 8,
  left: mine ? rect.right - 160 : rect.left,

  emojiTop: isNearBottom ? rect.bottom + 8 : rect.top - 48,
  emojiLeft: mine ? rect.right - 180 : rect.left,
});

  }, [showMenu, mine]);

  return (
    <>
    {showMenu &&
  createPortal(
    <div
      className="fixed inset-0 z-99998 bg-black/30 backdrop-blur-sm"
      style={{ touchAction: "none" }}
      onClick={() => {
        setShowMenu(false);
        setSelected(false);
        setInfoOpen(false);
        window.__ACTIVE_MESSAGE__ = null;
      }}
    />,
    document.body
  )}


      {!collapsed && (
        <div
          ref={rootRef}
          onAnimationEnd={() => deleting && setCollapsed(true)}
          className={`flex my-1.5 ${mine ? "justify-end" : "justify-start"} ${
            deleting ? "animate-smoke-vanish" : ""
          }`}
        >
          <div
            ref={bubbleRef}
            className="relative max-w-[70%]"
            style={{
              marginBottom: reactions.length > 0 ? "16px" : undefined,
            }}
          >
          <div
  onMouseDown={startPress}
  onMouseUp={endPress}
  onTouchStart={startPress}
  onTouchEnd={endPress}
  onClick={handleClick}
  className={`
    relative px-3 py-2 rounded-2xl text-[13px]
    whitespace-pre-wrap wrap-break-word
    transition-[max-height] duration-300 ease-in-out
    ${mine ? "msg-out" : "msg-in"}
    ${
      selected
        ? "ring-2 ring-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.9)] relative z-100001"
        : ""
    }
  `}
>


             <div
  ref={contentRef}
  className={`
    whitespace-pre-wrap wrap-break-word
    transition-[max-height] duration-300 ease-in-out
    ${expanded ? "max-h-250" : "max-h-35"}
    overflow-hidden
  `}
>
  {text}
</div>

{hasOverflow && !expanded && (
  <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-linear-to-t from-black/40 to-transparent rounded-b-2xl" />
)}

              <div className="mt-1 flex flex-col items-end gap-1 text-[10px] opacity-70">
                <span>
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {msg.edited && (
  <span className="italic text-[10px] opacity-60">
    edited
  </span>
)}
{hasOverflow && (
  <button
    onClick={(e) => {
      e.stopPropagation();
      setExpanded((v) => !v);
    }}
    className="mt-1 text-xs font-medium text-blue-300 hover:underline"
  >
    {expanded ? "Collapse" : "Read more"}
  </button>
)}


                {mine && !msg.delivered && !msg.seen && (
                  <span className="tick-wrap">
                    <span className="tick tick-gray" />
                  </span>
                )}

                {mine && msg.delivered && !msg.seen && (
                  <span className="tick-wrap tick-animate">
                    <span className="tick tick-gray" />
                    <span className="tick tick-gray" />
                  </span>
                )}

                {mine && msg.seen && (
                  <span className="tick-wrap tick-animate">
                    <span className="tick tick-blue" />
                    <span className="tick tick-blue" />
                  </span>
                )}
              </div>
            </div>

            {reactions.length > 0 && (
  <div
    className={`absolute -bottom-3 right-1 ${
      selected ? "z-100001" : "z-10"
    } bg-background/80 backdrop-blur-md px-1 rounded-full text-sm shadow`}
  >
    {reactions.map((r, i) => (
      <span key={i}>{r.emoji}</span>
    ))}
  </div>
)}

          </div>
        </div>
      )}

      {menuPos &&
        showMenu &&
        createPortal(
          <>
            {/* EMOJI BAR */}
            <div
              className="fixed z-100000 bg-white/10 backdrop-blur-xl
                         border border-white/20
                         px-2 py-1 rounded-full
                         shadow-2xl flex gap-2 animate-scale"
              style={{
                top: menuPos.emojiTop,
                left: menuPos.emojiLeft,
              }}
            >
              {["❤️", "👍", "😂", "😮", "😢", "😡"].map((e) => (
                <button
                  key={e}
                  onClick={() => react(e)}
                  className="text-lg hover:scale-110 transition"
                >
                  {e}
                </button>
              ))}
            </div>

            {/* MENU */}
            <div
              className="fixed z-100000 mt-2 w-40 rounded-2xl
                         bg-white/10 backdrop-blur-xl
                         border border-white/20
                         shadow-2xl text-xs overflow-hidden"
              style={{
                top: menuPos.top,
                left: menuPos.left,
              }}
            >
              <button
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/10"
                onClick={() => {
                  setShowMenu(false);
                  setSelected(false);
                  setInfoOpen(false);
                  window.__ACTIVE_MESSAGE__ = null;
                }}
              >
                <FiX /> Close
              </button>

              {canModify && (
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/10"
                  onClick={() => {
                    setShowMenu(false);
                    setSelected(false);
                    window.__ACTIVE_MESSAGE__ = null;
                    setEditing(true);
                  }}
                >
                  <FiEdit2 /> Edit
                </button>
              )}

              <button
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/10"
                onClick={() => {
                  setShowMenu(false);
                  setSelected(false);
                  window.__ACTIVE_MESSAGE__ = null;
                  setInfoOpen((v) => !v);
                }}
              >
                <FiInfo /> Info
              </button>

              {canModify && (
                <button
                  className="w-full flex items-center gap-2 px-3 py-2
                             text-red-400 hover:bg-red-500/10"
                  onClick={() => {
                    setShowMenu(false);
                    setSelected(false);
                    window.__ACTIVE_MESSAGE__ = null;
                    handleDelete();
                  }}
                >
                  <FiTrash2 /> Delete
                </button>
              )}

              <button
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/10"
                onClick={() => {
                  setShowMenu(false);
                  setSelected(false);
                  window.__ACTIVE_MESSAGE__ = null;
                  setForwardOpen(true);
                }}
              >
                <FiSend /> Forward
              </button>
            </div>
          </>,
          document.body
        )}

      {/* ✅ ADDED — EDIT SAVE FIX */}
      {editing && (
        <EditDialog
          value={text}
          onCancel={() => setEditing(false)}
          onSave={async (t) => {
            await api.put(`/messages/edit/${msg._id}`, { message: t });


            setText(t);
            setEditing(false);
          }}
        />
      )}

      {/* ✅ ADDED — FORWARD DIALOG */}
      {forwardOpen && (
        <div className="fixed inset-0 z-100001 isolate">
          <ForwardDialog
            open={forwardOpen}
            message={msg}
            onClose={() => setForwardOpen(false)}
          />
        </div>
      )}

{infoOpen &&
  createPortal(
    <div className="fixed inset-0 z-99999 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setInfoOpen(false)}
      />

      <div className="relative bg-background rounded-xl p-4 text-xs shadow-xl space-y-1">
        <div>
          <b>Status:</b>{" "}
          {msg.seen
            ? "Seen"
            : msg.delivered
            ? "Delivered"
            : "Sent"}
        </div>

        {msg.seenAt && (
          <div>
            <b>Seen at:</b>{" "}
            {new Date(msg.seenAt).toLocaleString()}
          </div>
        )}

        <div>
          <b>Sent at:</b>{" "}
          {new Date(msg.createdAt).toLocaleString()}
        </div>

        {/* ✅ ADDED — EMOJI INFO */}
        {msg.reactions && msg.reactions.length > 0 && (
          <div className="pt-1">
            <b>Reactions:</b>
            <div className="mt-1 space-y-0.5">
              {msg.reactions.map((r, i) => (
                <div key={i}>
                  {r.emoji}{" "}
                  {String(r.userId) === String(authUser._id)
                    ? "me"
                    : "them"}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  )}


    </>
  );
}
