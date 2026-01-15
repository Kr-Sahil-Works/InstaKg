import { useState, useContext, useEffect, useRef } from "react";
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

  const lastFetchedUser = useRef(null);

  if (loading || !authUser) return null;

  const isOnline =
    selectedUser && onlineUsers.includes(selectedUser._id);

  /* HIDE SIDEBAR ON MOBILE WHEN CHAT SELECTED */
  useEffect(() => {
    if (selectedUser) {
      setOpen(false);
    }
  }, [selectedUser]);

  /* LAST SEEN (SAFE + NO SPAM) */
  useEffect(() => {
    if (!selectedUser || isOnline) {
      setLastSeen(null);
      lastFetchedUser.current = null;
      return;
    }

    if (lastFetchedUser.current === selectedUser._id) return;

    lastFetchedUser.current = selectedUser._id;

    api
      .get(`/users/${selectedUser._id}/last-seen`)
      .then((res) => setLastSeen(res.data.lastSeen))
      .catch(() => {});
  }, [selectedUser, isOnline]);

  return (
    <div className="h-screen flex overflow-hidden">
      {/* SIDEBAR */}
      <Sidebar
        setSelectedUser={setSelectedUser}
        onlineUsers={onlineUsers}
        open={open}
        setOpen={setOpen}
      />

      {/* CHAT AREA */}
      <section className="flex flex-col flex-1 h-full">
        {/* HEADER */}
        <div className="shrink-0 h-20 md:h-16 px-4 flex items-center justify-between panel border-b">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-3 text-lg hover:bg-black/20 rounded"
              onClick={() => setOpen(true)}
            >
              ☰
            </button>

            {selectedUser ? (
              <>
                <Avatar name={selectedUser.username} size={44} />
                <div>
                  <span className="font-medium text-base">
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
              <span className="font-medium text-lg">
                Messages
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {selectedUser && isOnline && (
              <HiStatusOnline
                className="text-green-500"
                size={16}
              />
            )}

            <span className="hidden sm:block">
              {authUser.username}
            </span>

            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>

        {/* CHAT WINDOW */}
        <div className="flex-1 overflow-hidden">
          {selectedUser && (
            <ChatWindow
              user={selectedUser}
              socket={socket}
            />
          )}
        </div>
      </section>
    </div>
  );
}
