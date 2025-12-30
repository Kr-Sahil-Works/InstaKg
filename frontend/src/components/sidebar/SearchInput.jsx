import React, { useState } from "react";
import { IoSearchSharp } from "react-icons/io5";
import useConversation from "../../zustand/useConversation";
import useGetConversation from "../../hooks/useGetConversation";
import toast from "react-hot-toast";

const SearchInput = () => {
	const [search, setSearch] = useState("");
	const { setSelectedConversation } = useConversation();
	const { conversations } = useGetConversation();

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!search) return;
		if (search.length < 3) return toast.error("Search at least 3 characters");

		const conversation = conversations.find((c) =>
			c.fullName.toLowerCase().includes(search.toLowerCase())
		);

		if (conversation) {
			setSelectedConversation(conversation);
			setSearch("");
		} else {
			toast("No such user found!", { icon: "🔎" });
		}
	};

	return (
		<form onSubmit={handleSubmit} className="flex items-center gap-2">
			<div className="relative flex-1">
				<input
					type="text"
					placeholder="Search…"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="
						w-full px-4 py-2 rounded-full
						bg-white/15 backdrop-blur-md
						border border-white/20
						text-white placeholder:text-white/60
						focus:outline-none focus:ring-2 focus:ring-sky-400
					"
				/>
			</div>

			<button
				type="submit"
				className="
					btn btn-circle
					bg-white/20 backdrop-blur-md
					border border-white/20
					text-white hover:bg-sky-500 transition
				"
			>
				<IoSearchSharp className="w-5 h-5" />
			</button>
		</form>
	);
};

export default SearchInput;
