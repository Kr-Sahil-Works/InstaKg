import { useEffect, useState } from "react";
import api from "../api/axios";
import { FiSearch } from "react-icons/fi";
import { HiOutlineHome } from "react-icons/hi";
import Avatar from "./Avatar";

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

  const filtered = users.filter(u =>
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
          panel border-r border-black/20
          transition-transform
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* TOP BAR (FIXED) */}
        <div className="shrink-0 px-3 py-3 border-b border-black/20 flex gap-2">
          <button
            onClick={() => {
              setSelectedUser(null);
              setOpen(false);
            }}
            className="p-2 rounded-full hover:bg-black/20"
          >
            <HiOutlineHome size={20} />
          </button>

          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search"
              className="w-full pl-9 pr-3 py-2 rounded-full bg-black/20 text-sm"
            />
          </div>
        </div>

        {/* USERS (SCROLL ONLY HERE) */}
        <div className="flex-1 overflow-y-auto">
          {filtered.map(user => (
            <div
              key={user._id}
              onClick={() => {
                setSelectedUser(user);
                setOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-black/10"
            >
              <Avatar name={user.username} />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {user.username}
                </p>
                {onlineUsers.includes(user._id) && (
                  <span className="text-xs text-green-400">
                    online
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
