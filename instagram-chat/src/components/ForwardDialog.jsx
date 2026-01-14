import { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import Avatar from "./Avatar";
import { FiX, FiSend, FiSearch } from "react-icons/fi";
import { AuthContext } from "../context/AuthContext";

export default function ForwardDialog({
  open,
  messageId,
  originalSenderId,
  originalReceiverId,
  onClose,
}) {
  const { authUser } = useContext(AuthContext);

  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [sending, setSending] = useState(false);

  /* ================= LOAD USERS ================= */
  useEffect(() => {
    if (!open) return;

    api.get("/users").then((res) => {
      setUsers(res.data || []);
    });
  }, [open]);

  /* ================= TOGGLE USER ================= */
  const toggleUser = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  /* ================= SEND FORWARD ================= */
  const send = async () => {
    if (!selected.length || sending) return;

    try {
      setSending(true);

      await api.post(`/messages/forward/${messageId}`, {
        receivers: selected,
      });

      setSelected([]);
      onClose();
    } catch (err) {
      console.error(
        "FORWARD FAILED",
        err.response?.data || err
      );
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  /* ================= FILTER USERS ================= */
  const filtered = users
    .filter(
      (u) =>
        u._id !== authUser._id &&           // ❌ yourself
        u._id !== originalSenderId &&       // ❌ original sender
        u._id !== originalReceiverId        // ❌ original receiver
    )
    .filter((u) =>
      u.username
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  /* ================= UI ================= */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* DIALOG */}
      <div className="relative w-[95%] max-w-md h-[80vh] bg-background rounded-2xl shadow-2xl animate-scale flex flex-col">
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <button
            onClick={onClose}
            className="text-sm text-gray-500"
          >
            Cancel
          </button>

          <span className="font-semibold text-sm">
            Forward to
          </span>

          <button
            onClick={send}
            disabled={!selected.length || sending}
            className="text-sm text-green-600 disabled:opacity-40"
          >
            Send
          </button>
        </div>

        {/* SELECTED USERS */}
        {selected.length > 0 && (
          <div className="flex gap-3 px-4 py-3 overflow-x-auto border-b">
            {users
              .filter((u) => selected.includes(u._id))
              .map((u) => (
                <div
                  key={u._id}
                  className="flex flex-col items-center"
                >
                  <Avatar name={u.username} size={44} />
                  <span className="text-[10px] mt-1 max-w-12 truncate">
                    {u.username}
                  </span>
                </div>
              ))}
          </div>
        )}

        {/* SEARCH */}
        <div className="px-4 py-2">
          <div className="relative">
            <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search"
              className="w-full pl-9 pr-3 py-2 rounded-full bg-black/10 text-sm outline-none"
            />
          </div>
        </div>

        {/* USER LIST */}
        <div className="flex-1 overflow-y-auto">
          {filtered.map((user) => (
            <div
              key={user._id}
              onClick={() => toggleUser(user._id)}
              className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-black/5"
            >
              <Avatar name={user.username} size={40} />

              <div className="flex-1">
                <p className="text-sm">
                  {user.username}
                </p>
              </div>

              <input
                type="checkbox"
                checked={selected.includes(user._id)}
                readOnly
                className="accent-green-600"
              />
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="text-center text-xs text-gray-400 mt-6">
              No users found
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
