import { useState, useRef, useEffect, useMemo } from "react";
import api from "../api/axios";
import {
  FiSend,
  FiSmile,
  FiSearch,
  FiX,
  FiEdit2,
  FiTrash2,
  FiPlus,
} from "react-icons/fi";
import { HiOutlinePaperClip } from "react-icons/hi";
import { EMOJIS, EMOJI_CATEGORIES } from "../constants/emojis.generated";

let typingTimer;
let longPressTimer;

export default function MessageInput({ receiverId, socket }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const [showEmoji, setShowEmoji] = useState(false);
  const [showClipboard, setShowClipboard] = useState(false);

  const [clipboard, setClipboard] = useState([]);
  const [newClip, setNewClip] = useState("");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");

  const [activeCategory, setActiveCategory] = useState("recent");
  const [search, setSearch] = useState("");

  const textareaRef = useRef(null);
  const emojiRef = useRef(null);
  const clipboardRef = useRef(null);

  /* ================= SEND ================= */
  const send = async (value) => {
    const msg = value.trim();
    if (!msg || sending) return;

    setSending(true);
    setText("");
    textareaRef.current?.focus();

    try {
      const res = await api.post(`/messages/${receiverId}`, {
        message: msg,
      });
      socket?.emit("newMessage", res.data);
      socket?.emit("stopTyping", receiverId);
    } finally {
      setTimeout(() => setSending(false), 150);
    }
  };

  /* ================= INPUT ================= */
  const handleChange = (e) => {
    setText(e.target.value);

    socket?.emit("typing", receiverId);
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
      socket?.emit("stopTyping", receiverId);
    }, 800);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(e.currentTarget.value);
    }
  };

  /* ================= LONG PRESS SAVE ================= */
  const startLongPress = () => {
    longPressTimer = setTimeout(async () => {
      if (!text.trim()) return;
      await api.post("/clipboard", { text });
      loadClipboard();
    }, 600);
  };

  const cancelLongPress = () => {
    clearTimeout(longPressTimer);
  };

  /* ================= EMOJI ================= */
  const insertEmoji = (emoji) => {
    const el = textareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;

    setText(text.slice(0, start) + emoji + text.slice(end));

    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = start + emoji.length;
      el.focus();
    });
  };

  /* ================= CLIPBOARD ================= */
  const loadClipboard = async () => {
    const res = await api.get("/clipboard");
    setClipboard(res.data);
  };

  const addClip = async () => {
    if (!newClip.trim()) return;
    await api.post("/clipboard", { text: newClip });
    setNewClip("");
    loadClipboard();
  };

  const updateClip = async (id) => {
    await api.put(`/clipboard/${id}`, { text: editText });
    setEditId(null);
    setEditText("");
    loadClipboard();
  };

  const deleteClip = async (id) => {
    await api.delete(`/clipboard/${id}`);
    loadClipboard();
  };

  const pasteClip = (value) => {
    setText(value);
    textareaRef.current?.focus();
    setShowClipboard(false);
  };

  useEffect(() => {
    if (showClipboard) loadClipboard();
  }, [showClipboard]);

  /* ================= CLOSE POPUPS ================= */
  useEffect(() => {
    const close = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target))
        setShowEmoji(false);
      if (
        clipboardRef.current &&
        !clipboardRef.current.contains(e.target)
      )
        setShowClipboard(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  /* ================= EMOJI FILTER ================= */
  const filteredEmojis = useMemo(() => {
    const q = search.toLowerCase();
    if (q)
      return Object.values(EMOJIS)
        .flat()
        .filter(
          ({ e, k }) => e.includes(q) || k.some((w) => w.includes(q))
        );
    if (activeCategory === "recent") return [];
    return EMOJIS[activeCategory] || [];
  }, [search, activeCategory]);

  return (
    <>
      {/* DIM BACKGROUND */}
      {showClipboard && (
        <div className="fixed inset-0 bg-black/40 z-40 animate-fade" />
      )}

      {/* EMOJI POPUP */}
      {showEmoji && (
        <div
          ref={emojiRef}
          className="absolute bottom-16 left-4 right-4 mx-auto max-w-sm
                     z-50 rounded-2xl bg-background shadow-2xl
                     overflow-hidden animate-scale"
        >
          <div className="flex items-center gap-2 px-3 py-2 border-b">
            <FiSearch className="opacity-60" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search emoji"
              className="w-full bg-transparent outline-none text-sm"
            />
          </div>

          <div className="flex justify-between px-2 py-2 border-b">
            {Object.entries(EMOJI_CATEGORIES).map(([key, icon]) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className="text-lg"
              >
                {icon}
              </button>
            ))}
          </div>

          <div className="h-60 overflow-y-auto py-2">
            <div className="grid grid-cols-8 gap-2 text-xl place-items-center">
              {filteredEmojis.map(({ e }) => (
                <button key={e} onClick={() => insertEmoji(e)}>
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* WHATSAPP STYLE CLIPBOARD */}
      {showClipboard && (
        <div
          ref={clipboardRef}
          className="fixed bottom-20 left-4 right-4 mx-auto max-w-sm
                     bg-background z-50 rounded-3xl shadow-xl
                     animate-slide-up"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <span className="text-sm font-medium">Clipboard</span>
            <button onClick={() => setShowClipboard(false)}>
              <FiX />
            </button>
          </div>

          <div className="px-4 py-3 flex gap-2">
            <input
              value={newClip}
              onChange={(e) => setNewClip(e.target.value)}
              placeholder="Save text"
              className="flex-1 bg-muted rounded-xl px-3 py-2 text-sm outline-none"
            />
            <button onClick={addClip}>
              <FiPlus />
            </button>
          </div>

          <div className="px-3 pb-3 space-y-2 max-h-64 overflow-y-auto">
            {clipboard.map((item) => (
              <div
                key={item._id}
                className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2"
              >
                {editId === item._id ? (
                  <input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-sm"
                  />
                ) : (
                  <button
                    onClick={() => pasteClip(item.text)}
                    className="flex-1 text-left text-sm"
                  >
                    {item.text}
                  </button>
                )}

                {editId === item._id ? (
                  <button onClick={() => updateClip(item._id)}>✔</button>
                ) : (
                  <button
                    onClick={() => {
                      setEditId(item._id);
                      setEditText(item.text);
                    }}
                  >
                    <FiEdit2 />
                  </button>
                )}

                <button onClick={() => deleteClip(item._id)}>
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* INPUT BAR — ONLY SPACING FIXED */}
      <div className="sticky bottom-0 w-full bg-background border-t px-3 py-2">
        <div className="flex items-end gap-3">

          {/* LEFT ICONS */}
          <div className="flex items-center gap-2">
            <button onClick={() => setShowEmoji((v) => !v)}>
              <FiSmile />
            </button>

            <button onClick={() => setShowClipboard(true)}>
              <HiOutlinePaperClip />
            </button>
          </div>

          {/* INPUT */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onPointerDown={startLongPress}
            onPointerUp={cancelLongPress}
            onPointerLeave={cancelLongPress}
            rows={1}
            placeholder="Type a message"
            className="flex-1 resize-none rounded-2xl px-4 py-2 bg-muted outline-none"
          />

          {/* DIVIDER */}
          <div className="w-px h-6 bg-border opacity-60" />

          {/* SEND */}
          <button onClick={() => send(text)}>
            <FiSend />
          </button>
        </div>
      </div>
    </>
  );
}
