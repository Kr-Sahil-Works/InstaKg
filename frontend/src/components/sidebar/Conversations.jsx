import React from "react";
import Conversation from "./Conversation.jsx";
import useGetConversations from "../../hooks/useGetConversation.js";
import { getRandomEmoji } from "../../utils/emoji.js";

const Conversations = () => {
  const { loading, conversations } = useGetConversations();

  const safeConversations = Array.isArray(conversations) ? conversations : [];

  return (
    <div className="py-2 flex flex-col overflow-auto">
      {safeConversations.map((conversation, idx) => (
        <Conversation
          key={conversation._id}
          conversation={conversation}
          emoji={getRandomEmoji()}
          lastIdx={idx === safeConversations.length - 1}
        />
      ))}

      {loading && (
        <span className="loading loading-infinity mx-auto"></span>
      )}
    </div>
  );
};

export default Conversations;
