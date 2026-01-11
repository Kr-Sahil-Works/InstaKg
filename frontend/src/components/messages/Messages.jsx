import React, { useEffect, useRef } from "react";
import useGetMessages from "../../hooks/useGetMessages";
import MessageSkeleton from "../skeletons/MessageSkeleton";
import Message from "./Message";
import useListenMessages from "../../hooks/useListenMessages";

const Messages = () => {
  const { messages, loading } = useGetMessages();
  useListenMessages();

  const lastMessageRef = useRef(null);

  // ✅ GUARANTEE ARRAY
  const safeMessages = Array.isArray(messages) ? messages : [];

  useEffect(() => {
    setTimeout(() => {
      lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [safeMessages]);

  return (
    <div className="px-4 flex-1 overflow-auto">
      {!loading &&
        safeMessages.length > 0 &&
        safeMessages.map((message) => (
          <div key={message._id} ref={lastMessageRef}>
            <Message message={message} />
          </div>
        ))}

      {loading &&
        Array.from({ length: 3 }).map((_, idx) => (
          <MessageSkeleton key={idx} />
        ))}

      {!loading && safeMessages.length === 0 && (
        <p className="text-center">
          Send a message to start the conversation
        </p>
      )}
    </div>
  );
};

export default Messages;
