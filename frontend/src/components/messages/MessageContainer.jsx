import React from 'react'
import { TiMessages } from "react-icons/ti";
import MessageInput from "./MessageInput";
import Messages from "./Messages";


const MessageContainer = () => {
    const noChatSelected = false;
	return (
		<div className='md:min-w-112.5 flex flex-col'>
			{noChatSelected ? <NoChatSelected/> : (
                <>
				{/* Header */}
				<div className="px-4 py-2 mb-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg">
                <span className="text-gray-300">To:</span> <span className="text-white font-bold">Friends</span></div>


				<Messages />
				<MessageInput />
			</>
            )}
		</div>
	);
};
export default MessageContainer;

const NoChatSelected = () => {
    return(
        <div className='flex items-center justify-center w-full h-full'>
            <div className='px-4 text-center sm:text-lg md:text-xl text-gray-200 font-semibold flex flex-col items-center gap-2'>
                <p>Welcome Hero </p>
                <p>Select a chat to start messaging</p>
                <TiMessages className="text-3xl md:text-5xl text-center"/>
            </div>

        </div>
    )
}