// import React from "react";
// import useConversations from "../../zustand/useConversation"
// import { useSocketContext } from "../../context/SocketContext";

// const Conversation = ({conversation,lastIdx,emoji}) => {
// 	const {selectedConversation,setSelectedConversation}= useConversations()

// 	const isSelected = selectedConversation?._id === conversation._id;
// 	const {onlineUsers} = useSocketContext();
// 	const isOnline = onlineUsers.includes(conversation._id)
// 	return (
// 		<>
// 			<div className={`flex gap-2 items-center hover:bg-sky-500 rounded p-2 py-1 cursor-pointer
// 				${isSelected ? "bg-sky-500": ""}
// 				`}
// 				onClick={()=> setSelectedConversation(conversation)}
// 				>
// {/* ------------------------------------------------------------------------------ */}
// 				{/* <div className={`avatar rounded-full ${isOnline ? "online ring-2 ring-green-400 ring-offset-2 ring-offset-black" : ""}`}>
// 				<div className="w-12 rounded-full">
// 				<img src={conversation.profilePic} alt=" ᵔ ᵕ ᵔ  " />
// 				</div>
// 				</div> */}
// {/* ------------------------------------------------------------------------------ */}
// {/* <div className="relative">
// 	<div className="avatar rounded-full">
// 		<div className="w-12 rounded-full">
// 			<img src={conversation.profilePic} alt="avatar" />
// 		</div>
// 	</div>

// 	<span
// 		className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-black
// 		${isOnline ? "bg-green-400 shadow-[0_0_6px_2px_rgba(74,222,128,0.8)]" : "bg-gray-400"}`}
// 	/>
// </div> */}

// {/* ------------------------------------------------------------------------------ */}

// {/* <div className="flex flex-col items-center gap-1">
// 	<div className="relative">
// 		{isOnline && (
// 			<span className="absolute inset-0 rounded-full bg-green-400 blur-md opacity-40 animate-pulse"></span>
// 		)}

// 		<div className="avatar rounded-full relative">
// 			<div className="w-12 rounded-full">
// 				<img src={conversation.profilePic} alt=" ᵔ ᵕ ᵔ  " />
// 			</div>
// 		</div>
// 	</div>

// 	<span
// 		className={`w-6 h-1 rounded-full
// 		${isOnline ? "bg-green-400" : "bg-gray-500 opacity-40"}`}
// 	/>
// </div> */}

// {/* ------------------------------------------------------------------------------ */}
// {/* <div className="flex flex-col items-center">
// 	<div className="avatar rounded-full">
// 		<div className="w-12 rounded-full">
// 			<img src={conversation.profilePic} alt=" ᵔ ᵕ ᵔ  " />
// 		</div>
// 	</div>

// 	<span
// 		className={`mt-1 w-6 h-0.75 rounded-full
// 		${isOnline
// 			? "bg-linear-to-r from-green-400 via-emerald-300 to-green-400 animate-pulse"
// 			: "bg-gray-500 opacity-40"}`}
// 	/>
// </div> */}



// {/* ------------------------------------------------------------------------------ */}
// <div className="relative flex items-center justify-center">
// 	{isOnline && (
// 		<div className="absolute w-14 h-14 rounded-full
// 			bg-linear-to-tr from-pink-500 via-red-500 to-yellow-400
// 			animate-spin-slow p-0.5">
// 		</div>
// 	)}

// 	<div className={`avatar rounded-full relative z-10
// 		${!isOnline ? "ring-2 ring-gray-500 opacity-50" : ""}`}>
// 		<div className="w-12 rounded-full">
// 			<img src={conversation.profilePic} alt=" ᵔ ᵕ ᵔ  " />
// 		</div>
// 	</div>
// </div>


// {/* ------------------------------------------------------------------------------ */}

// {/* <div className="relative flex items-center justify-center">
// 	{isOnline && (
// 		<div className="absolute w-14 h-14 rounded-full
// 			bg-gradient-to-tr from-pink-500 via-purple-500 to-yellow-400
// 			animate-story-ring p-[2px]" />
// 	)}

// 	<div className={`avatar rounded-full relative z-10
// 		${!isOnline ? "ring-2 ring-gray-600 opacity-50" : ""}`}>
// 		<div className="w-12 rounded-full">
// 			<img src={conversation.profilePic} alt=" ᵔ ᵕ ᵔ  " />
// 		</div>
// 	</div>
// </div> */}

// {/* ------------------------------------------------------------------------------ */}











// {/* code here --- */}

// 				<div className="flex flex-col flex-1">
// 					<div className="flex gap-3 justify-between">
// 						<p className="font-bold text-gray-200">{conversation.fullName}</p>
// 						<span className="text-xl">{emoji}</span>
// 					</div>
// 				</div>
// 			</div>

// 			{!lastIdx && <div className="divider my-0 py-0 h-1 opacity-40" />}
// 		</>
// 	);
// };

// export default Conversation;



import React from "react";
import useConversations from "../../zustand/useConversation";
import { useSocketContext } from "../../context/SocketContext";

const Conversation = ({ conversation, lastIdx, emoji }) => {
  const { selectedConversation, setSelectedConversation } =
    useConversations();

  const { onlineUsers } = useSocketContext();

  // ✅ ALWAYS ARRAY
  const safeOnlineUsers = Array.isArray(onlineUsers) ? onlineUsers : [];

  const isOnline = safeOnlineUsers.includes(conversation._id);
  const isSelected = selectedConversation?._id === conversation._id;

  return (
    <>
      <div
        className={`flex gap-2 items-center hover:bg-sky-500 rounded p-2 py-1 cursor-pointer
        ${isSelected ? "bg-sky-500" : ""}`}
        onClick={() => setSelectedConversation(conversation)}
      >
        <div className="relative flex items-center justify-center">
          {isOnline && (
            <div
              className="absolute w-14 h-14 rounded-full
              bg-linear-to-tr from-pink-500 via-red-500 to-yellow-400
              animate-spin-slow p-0.5"
            />
          )}

          <div
            className={`avatar rounded-full relative z-10
            ${!isOnline ? "ring-2 ring-gray-500 opacity-50" : ""}`}
          >
            <div className="w-12 rounded-full">
              <img src={conversation.profilePic} alt="avatar" />
            </div>
          </div>
        </div>

        <div className="flex flex-col flex-1">
          <div className="flex gap-3 justify-between">
            <p className="font-bold text-gray-200">
              {conversation.fullName}
            </p>
            <span className="text-xl">{emoji}</span>
          </div>
        </div>
      </div>

      {!lastIdx && (
        <div className="divider my-0 py-0 h-1 opacity-40" />
      )}
    </>
  );
};

export default Conversation;
