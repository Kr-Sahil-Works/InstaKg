import React from 'react'
import Conversation from './Conversation.jsx'
import useGetConversations from '../../hooks/useGetConversation.js';
import {getRandomEmoji} from '../../utils/emoji.js';

const Conversations = () => {
  const { loading , conversations } = useGetConversations();
 
  
  return(
    <div className='py-2 flex flex-col overflow-auto'>
      {conversations.map((conversation,idx)=>(
        <Conversation
          key={conversation._id}
          conversation={conversation}
          emoji={getRandomEmoji()}
          lastIdx = {idx === conversations.length -1 }
        />
      ))}
       {loading ? <span className='loading loading-infinity mx-auto'></span> : null}
    </div>
  )
}
export default Conversations