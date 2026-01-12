import Conversation from "./Conversation";
import useGetConversations from "../../hooks/useGetConversation";
import { getRandomEmoji } from "../../utils/emoji";

const Conversations = () => {
  const { loading, conversations } = useGetConversations();

  return (
    <div className="py-2 flex flex-col overflow-auto">
      {conversations.map((conversation, idx) => (
        <Conversation
          key={conversation._id}
          conversation={conversation}
          emoji={getRandomEmoji()}
          lastIdx={idx === conversations.length - 1}
        />
      ))}

      {loading && (
        <span className="loading loading-infinity mx-auto"></span>
      )}
    </div>
  );
};

export default Conversations;
