import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import FollowTextButton from "./FollowTextButton";

const UserRow = ({ user, onNavigate }) => {

  const handleProfileClick = () => {
    onNavigate?.();
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 hover:bg-zinc-900 transition rounded-lg">

      {/* Left */}
      <Link to={`/profile/${user.id}`} onClick={handleProfileClick} className="flex items-center gap-3 flex-1 min-w-0">

        <img src={user.profileImg} alt={user.username} className="w-12 h-12 rounded-full object-cover border-zinc-700" />

        <div className="min-w-0">
          <p className="text-white font-semibold truncate">{user.username}</p>

          {user.bio && (
            <p className="text-sm text-zinc-400 truncate">{user.bio}</p>
          )}
        </div>

      </Link>

      <FollowTextButton user={user} />

    </div>
  )
}

export default UserRow