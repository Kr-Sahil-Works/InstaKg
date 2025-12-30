import React, { useState } from "react";
import { BsSend } from "react-icons/bs";
import useSendMessage from "../../hooks/useSendMessage";

const MessageInput = () => {
	const [message, setMessage] = useState("");
	const { loading, sendMessage } = useSendMessage();

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!message.trim()) return;
		await sendMessage(message);
		setMessage("");
	};

	return (
		<form className="px-3 py-2" onSubmit={handleSubmit}>
			<div className="relative">
				<input
					type="text"
					placeholder="Message"
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					className="
						w-full px-3 py-2 pr-10 rounded-full text-sm
						bg-white/15 backdrop-blur-md
						border border-white/20
						text-white placeholder:text-white/50
						focus:outline-none focus:ring-1 focus:ring-sky-400
					"
				/>

				<button
					type="submit"
					disabled={loading}
					className="
						absolute right-1.5 top-1/2 -translate-y-1/2
						w-8 h-8 rounded-full
						flex items-center justify-center
						bg-white/20 backdrop-blur-md
						border border-white/30
						text-white
						transition-all duration-150
						hover:bg-white/30
						active:scale-90
						disabled:opacity-60
					"
				>
					{loading ? (
						<span
							className="
								w-4 h-4 rounded-full
								border-2 border-white/30 border-t-white
								animate-spin
								[animation-duration:0.35s]
							"
						/>
					) : (
						<BsSend
							className="
								text-xs
								transition-all duration-150
								group-active:translate-x-1 group-active:-translate-y-1
								group-active:rotate-12
							"
						/>
					)}
				</button>
			</div>
		</form>
	);
};

export default MessageInput;
