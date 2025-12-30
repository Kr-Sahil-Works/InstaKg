import React from "react";

const MessageSkeleton = () => {
	return (
		<div className="flex flex-col gap-2 animate-pulse">
			{/* incoming */}
			<div className="flex items-center gap-2">
				<div className="skeleton w-7 h-7 rounded-full" />
				<div className="skeleton h-3 w-44 rounded-lg" />
			</div>

			{/* incoming short */}
			<div className="flex items-center gap-2 ml-9">
				<div className="skeleton h-3 w-28 rounded-lg" />
			</div>

			{/* outgoing */}
			<div className="flex items-center gap-2 justify-end">
				<div className="skeleton h-3 w-36 rounded-lg" />
				<div className="skeleton w-7 h-7 rounded-full" />
			</div>
		</div>
	);
};

export default MessageSkeleton;
