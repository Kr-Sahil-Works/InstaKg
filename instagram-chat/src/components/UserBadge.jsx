import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function UserBadge() {
  const { user } = useContext(AuthContext);
  if (!user) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full glass animate-fade">
      <img
        src={user.profilePic}
        className="w-7 h-7 rounded-full"
        alt=""
      />
      <span className="text-sm font-medium">
        {user.username}
      </span>
    </div>
  );
}
