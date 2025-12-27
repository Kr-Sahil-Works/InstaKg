import React from "react";

const Conversation = () => {
	return (
		<>
			<div className="flex gap-2 items-center hover:bg-sky-500 rounded p-2 py-1 cursor-pointer">
				
				<div className="avatar online">
					<div className="w-12 rounded-full ring-2 ring-green-400 ring-offset-2 ring-offset-black">
						<img src="/me.jpg" alt="avatar" />
					</div>
				</div>

				<div className="flex flex-col flex-1">
					<div className="flex gap-3 justify-between">
						<p className="font-bold text-gray-200">Sam billu</p>
						<span className="text-xl">🎃</span>
					</div>
				</div>
			</div>

			<div className="divider my-0 py-0 h-1 opacity-40" />
		</>
	);
};

export default Conversation;
