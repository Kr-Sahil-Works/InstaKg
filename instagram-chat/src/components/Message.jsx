import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Message({ msg }) {
  const { user } = useContext(AuthContext);
  const mine = msg.senderId === user?._id;

  const time = new Date(msg.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`
          relative max-w-[70%] px-3 py-2 text-sm rounded-lg
          animate-fade
          ${mine
            ? "msg-out rounded-br-none"
            : "msg-in rounded-bl-none"}
        `}
      >
        {msg.message}

        <div className="flex items-center gap-1 mt-1 text-[10px] opacity-70 justify-end">
          <span>{time}</span>
          {mine && <span>✓✓</span>}
        </div>
      </div>
    </div>
  );
}
