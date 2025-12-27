import React from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import MessageContainer from "../../components/messages/MessageContainer";

const Home = () => {
	return (
		<div
			className="
        flex
        sm:h-112.5 md:h-137.5
        rounded-2xl
        overflow-hidden
        bg-white/10
        backdrop-blur-xl
        backdrop-saturate-150
        border border-white/20
        shadow-2xl
      "
		>
			<Sidebar />
			<MessageContainer />
		</div>
	);
};

export default Home;
