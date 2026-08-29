import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

const UserRow = ({ user, actionLabel, onAction, isLoading = false, showAction = false }) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 hover:bg-zinc-900 transition rounded-lg">

      {/* Left */}
      <Link to={`/profile/${user.id}`} className="flex items-center gap-3 flex-1 min-w-0">

        <img src={user.profileImg} alt={user.username} className="w-12 h-12 rounded-full object-cover border-zinc-700" />

        <div className="min-w-0">
          <p className="text-white font-semibold truncate">{user.username}</p>

          {user.bio && (
            <p className="text-sm text-zinc-400 truncate">{user.bio}</p>
          )}
        </div>

      </Link>

      {/* Right */}
      {showAction && (
        <button onClick={() => onAction?.(user.id)} disabled={isLoading} className="min-w-[90px] flex items-center justify-center rounded-lg bg-blue-500 hover:bg-blue-50 px-4 py-2 text-sm font-semibold text-white transition" >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            actionLabel
          )}
        </button>
      )}

    </div>
  )
}

export default UserRow