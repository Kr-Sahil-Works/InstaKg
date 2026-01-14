import { useState, useRef, useEffect, useMemo } from "react";
import api from "../api/axios";
import { FiSend, FiSmile, FiSearch } from "react-icons/fi";
import { HiOutlinePaperClip } from "react-icons/hi";
import { EMOJIS, EMOJI_CATEGORIES } from "../constants/emojis.generated";

/* ================= RECENT EMOJIS (USAGE BASED) ================= */
const getEmojiUsage = () =>
  JSON.parse(localStorage.getItem("emojiUsage") || "{}");

const saveRecentEmoji = (emoji) => {
  const usage = getEmojiUsage();
  usage[emoji] = (usage[emoji] || 0) + 1;
  localStorage.setItem("emojiUsage", JSON.stringify(usage));
};

const getSortedRecent = () =>
  Object.entries(getEmojiUsage())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 32)
    .map(([e]) => ({ e, k: [] }));

export default function MessageInput({ receiverId, socket }) {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [activeCategory, setActiveCategory] = useState("recent");
  const [search, setSearch] = useState("");

  const textareaRef = useRef(null);
  const emojiRef = useRef(null);

  /* ================= SEND ================= */
  const send = async (value) => {
    const msg = value.trim();
    if (!msg) return;

    try {
      await api.post(`/messages/${receiverId}`, { message: msg });
      setText("");
      textareaRef.current?.focus();
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= INPUT ================= */
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(e.currentTarget.value);
    }
  };

  /* ================= EMOJI INSERT ================= */
  const insertEmoji = (emoji) => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;

    setText(text.slice(0, start) + emoji + text.slice(end));
    saveRecentEmoji(emoji);

    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = start + emoji.length;
      el.focus();
    });
  };

  /* ================= CLOSE ON OUTSIDE ================= */
  useEffect(() => {
    if (!showEmoji) return;

    const close = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmoji(false);
      }
    };

    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [showEmoji]);

  /* ================= EMOJI FILTER (FINAL, CORRECT) ================= */
  const filteredEmojis = useMemo(() => {
    const q = search.trim().toLowerCase();

    // 🌍 GLOBAL SEARCH (ALL CATEGORIES)
    if (q) {
      return Object.values(EMOJIS)
        .flat()
        .filter(({ e, k }) =>
          e.includes(q) || k.some(word => word.includes(q))
        );
    }

    // 📊 MOST USED
    if (activeCategory === "recent") {
      return getSortedRecent();
    }

    // 📁 NORMAL CATEGORY
    return EMOJIS[activeCategory] || [];
  }, [search, activeCategory]);

  return (
    <>
      {/* EMOJI PICKER */}
      {showEmoji && (
        <div
          ref={emojiRef}
          className="absolute bottom-20 left-4 right-4 mx-auto max-w-sm z-50 rounded-2xl bg-background shadow-2xl overflow-hidden"
        >
          {/* SEARCH */}
          <div className="flex items-center gap-2 px-3 py-2 border-b">
            <FiSearch className="opacity-60" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="w-full bg-transparent outline-none text-sm"
            />
          </div>

          {/* CATEGORY ICON ROW */}
          <div className="flex justify-between px-2 py-2 border-b">
            {Object.entries(EMOJI_CATEGORIES).map(([key, icon]) => (
              <button
                key={key}
                onClick={() => {
                  setActiveCategory(key);
                  setSearch("");
                }}
                className={`text-lg px-2 transition ${
                  activeCategory === key
                    ? "opacity-100"
                    : "opacity-50 hover:opacity-80"
                }`}
              >
                {icon}
              </button>
            ))}
          </div>

          {/* EMOJI GRID */}
          <div className="h-65 overflow-y-auto py-2">
            <div className="grid grid-cols-8 gap-2 text-xl place-items-center">
              {filteredEmojis.length ? (
                filteredEmojis.slice(0, 512).map(({ e }) => (
                  <button
                    key={e}
                    onClick={() => insertEmoji(e)}
                    className="hover:scale-125 transition"
                  >
                    {e}
                  </button>
                ))
              ) : (
                <p className="col-span-8 text-xs opacity-60 py-6 text-center">
                  No emojis found
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* INPUT BAR */}
      <div className="sticky bottom-0 w-full bg-background border-t px-3 py-2">
        <div className="flex items-end gap-2">
          <button
            onClick={() => setShowEmoji(v => !v)}
            className="p-2 rounded-full hover:bg-black/10"
          >
            <FiSmile size={20} />
          </button>

          <button className="p-2 rounded-full hover:bg-black/10">
            <HiOutlinePaperClip size={20} />
          </button>

          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Type a message"
            className="flex-1 resize-none rounded-2xl px-4 py-2 bg-muted outline-none max-h-32"
          />

          <button
            onClick={() => send(text)}
            disabled={!text.trim()}
            className="p-2 rounded-full bg-green-600 text-white disabled:opacity-50"
          >
            <FiSend size={18} />
          </button>
        </div>
      </div>
    </>
  );
}
