import { useState, useContext, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import ThemeToggle from "../components/ThemeToggle";
import LogoutButton from "../components/LogoutButton";
import Avatar from "../components/Avatar";
import { AuthContext } from "../context/AuthContext";
import { useSocket } from "../hooks/useSocket";
import { HiStatusOnline } from "react-icons/hi";
import api from "../api/axios";
import { formatLastSeen } from "../utils/formatLastSeen";

export default function Chat() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);

  const { authUser, loading } = useContext(AuthContext);
  const { socket, onlineUsers = [] } = useSocket();

  if (loading || !authUser) return null;

  const isOnline =
    selectedUser && onlineUsers.includes(selectedUser._id);

  // ✅ FETCH LAST SEEN WHEN OFFLINE
  useEffect(() => {
    if (!selectedUser || isOnline) {
      setLastSeen(null);
      return;
    }

    api
      .get(`/users/${selectedUser._id}/last-seen`)
      .then((res) => setLastSeen(res.data.lastSeen));
  }, [selectedUser, isOnline]);

  return (
    <div className="h-screen flex">
      <Sidebar
        setSelectedUser={setSelectedUser}
        onlineUsers={onlineUsers}
        open={open}
        setOpen={setOpen}
      />

      <div className="flex flex-col flex-1">
        {/* HEADER */}
        <div className="h-16 px-4 flex items-center justify-between panel border-b">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 hover:bg-black/20 rounded"
              onClick={() => setOpen(true)}
            >
              ☰
            </button>

            {selectedUser ? (
              <>
                <Avatar name={selectedUser.username} size={40} />
                <div>
                  <span className="font-medium text-sm">
                    {selectedUser.username}
                  </span>
                  <div className="text-xs text-gray-400">
                    {isOnline
                      ? "online"
                      : formatLastSeen(lastSeen)}
                  </div>
                </div>
              </>
            ) : (
              <span className="font-medium">Messages</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <HiStatusOnline className="text-green-500" size={16} />
            <span>{authUser.username}</span>
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>

        <ChatWindow user={selectedUser} socket={socket} />
      </div>
    </div>
  );
}
