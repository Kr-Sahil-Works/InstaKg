import React, { useEffect } from "react";
import useConversation from "../../zustand/useConversation";
import MessageInput from "./MessageInput";
import Messages from "./Messages";
import { TiMessages } from "react-icons/ti";
import { useAuthContext } from "../../context/AuthContext";

const MessageContainer = () => {
	const { selectedConversation, setSelectedConversation } = useConversation();

	useEffect(() => {
		return () => setSelectedConversation(null);
	}, [setSelectedConversation]);

	return (
		<div className="md:min-w-112.5 flex flex-col h-full">
			{!selectedConversation ? (
				<NoChatSelected />
			) : (
				<>
					{/* Glass Header */}
					<div
						className="
							px-4 py-2 mb-2
							bg-white/15 backdrop-blur-md
							border-b border-white/20
							text-white
						"
					>
						<span className="text-white/70">To:</span>{" "}
						<span className="font-semibold">
							{selectedConversation.fullName}
						</span>
					</div>

					<Messages />
					<MessageInput />
				</>
			)}
		</div>
	);
};

export default MessageContainer;

const NoChatSelected = () => {
	const { authUser } = useAuthContext();

	return (
		<div className="flex items-center justify-center w-full h-full">
			<div
				className="
					p-6 rounded-xl
					bg-white/10 backdrop-blur-lg
					border border-white/20
					text-center
					text-white
					font-semibold
					flex flex-col items-center gap-2
				"
			>
				<p>Welcome 👋 {authUser.fullName} ❄</p>
				<p className="text-white/70">
					Select a chat to start messaging
				</p>
				<TiMessages className="text-4xl md:text-6xl text-white/80" />
			</div>
		</div>
	);
};
