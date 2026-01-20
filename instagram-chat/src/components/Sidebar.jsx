import { useEffect, useState } from "react";
import api from "../api/axios";
import { FiSearch } from "react-icons/fi";
import { HiOutlineHome } from "react-icons/hi";
import Avatar from "./Avatar";
import { motion, AnimatePresence } from "framer-motion";

export default function Sidebar({
  setSelectedUser,
  onlineUsers = [],
  open,
  setOpen,
}) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/users").then(res => setUsers(res.data || []));
  }, []);

  /* ✅ SORT USERS BY LATEST MESSAGE */
  const sortedUsers = [...users].sort((a, b) => {
    const aTime = new Date(a.lastMessageAt || 0).getTime();
    const bTime = new Date(b.lastMessageAt || 0).getTime();
    return bTime - aTime;
  });

  /* ✅ FILTER AFTER SORT */
  const filtered = sortedUsers.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

    <aside
  className={`
    fixed md:static z-50
    h-full w-72 flex flex-col
    bg-white/80 dark:bg-[rgba(30,34,37,0.75)]
    backdrop-blur-xl
    text-gray-900 dark:text-white
    border-r border-black/10 dark:border-white/10
    shadow-[0_0_40px_rgba(0,0,0,0.35)]
    transition-transform
    ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
  `}
>


       {/* TOP BAR */}
<div className="
  shrink-0 px-3 py-3
  flex gap-2 items-center
  backdrop-blur-md
  border-b 
  bg-white/70 dark:bg-[rgba(30,34,37,0.6)]
border-black/10 dark:border-white/10
">

         <motion.button
  whileTap={{ scale: 0.85 }}
  initial={{ opacity: 0, y: -6 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.2 }}
  onClick={() => {
    setSelectedUser(null);
    setOpen(false);
  }}
  className="p-2 rounded-full hover:bg-black/20"
>

            <HiOutlineHome size={20} />
          </motion.button>

          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search"
              className="
  w-full pl-9 pr-3 py-2
  rounded-full
  backdrop-blur-md
  text-sm 
  bg-black/5 dark:bg-white/10
text-gray-900 dark:text-white
placeholder:text-gray-500 dark:placeholder:text-white/40
  outline-none
"

            />
          </div>
        </div>

       {/* USERS */}
<div
  className="flex-1 overflow-y-auto pt-20 md:pt-0"
  style={{
    WebkitOverflowScrolling: "touch",
  }}
>
          <AnimatePresence>
            {filtered.map((user, index) => (
              <div key={user._id}>
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={
                    user.unreadCount > 0
                      ? { opacity: 1, y: 0, x: [0, -2, 2, -2, 2, 0] }
                      : { opacity: 1, y: 0 }
                  }
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                 onClick={() => {
  setSelectedUser(user);
  setOpen(false);

  requestAnimationFrame(() => {
    window.__ALLOW_AUTOSCROLL__ = true;
  });
}}

                  className="
  flex items-center gap-3
  px-4 py-3 mx-2 my-1
  rounded-xl
  cursor-pointer
  bg-white/0
  hover:bg-black/5 dark:hover:bg-white/10
  transition
"
                >
                  <Avatar name={user.username} />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {user.username}
                    </p>

                    {onlineUsers.includes(user._id) && (
                  <span className="flex items-center gap-1 text-xs text-green-400">
  <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
  online
</span>
                    )}
                  </div>

                  {user.unreadCount > 0 && (
                    <motion.span
                      key={user.unreadCount}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 22,
                      }}
                      className="min-w-4.5 h-4.5
                                 flex items-center justify-center
                                 text-[10px] font-semibold
                                 bg-[#25D366] text-black
                                 rounded-full"
                    >
                      {user.unreadCount}
                    </motion.span>
                  )}
                </motion.div>

                {index !== filtered.length - 1 && (
                  <div className="mx-6 border-b border-white/5" />
                )}
              </div>
            ))}
          </AnimatePresence>
        </div>
      </aside>
    </>
  );
}
