import { useState, useRef } from "react";
import api from "../api/axios";
import { FiSend, FiSmile } from "react-icons/fi";
import { HiOutlinePaperClip } from "react-icons/hi";

export default function MessageInput({ receiverId, socket }) {
  const [text, setText] = useState("");
  const timerRef = useRef(null);
  const textareaRef = useRef(null);

  const send = async () => {
    if (!text.trim()) return;

    await api.post(`/messages/${receiverId}`, {
      message: text.trim(),
    });

    setText("");
    textareaRef.current?.focus();
  };

  const handleChange = (e) => {
    setText(e.target.value);

    socket.emit("typing", receiverId);

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      socket.emit("stopTyping", receiverId);
    }, 700);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="sticky bottom-0 w-full bg-background border-t border-black/10 px-3 py-2">
      <div className="flex items-end gap-2">
        {/* EMOJI */}
        <button
          type="button"
          className="p-2 rounded-full hover:bg-black/10"
        >
          <FiSmile size={20} />
        </button>

        {/* ATTACH */}
        <button
          type="button"
          className="p-2 rounded-full hover:bg-black/10"
        >
          <HiOutlinePaperClip size={20} />
        </button>

        {/* INPUT */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Type a message"
          className="
            flex-1 resize-none
            rounded-2xl
            px-4 py-2
            bg-muted
            outline-none
            max-h-32
            leading-relaxed
          "
        />

        {/* SEND */}
        <button
          onClick={send}
          disabled={!text.trim()}
          className="
            p-2 rounded-full
            bg-green-600 text-white
            hover:bg-green-500
            disabled:opacity-50
            transition-all
            active:scale-90
          "
        >
          <FiSend size={18} />
        </button>
      </div>

      {/* HINT */}
      <p className="mt-1 text-[10px] text-muted-foreground text-center">
        Enter to send • Shift + Enter for new line
      </p>
    </div>
  );
}
