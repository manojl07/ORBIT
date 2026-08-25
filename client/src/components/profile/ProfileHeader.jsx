import React from "react";
import { useAuth } from "../../hooks/useAuth";
import useFollow from "../../hooks/useFollow";

const ProfileHeader = ({
  user,
  onEditProfile,
}) => {

  const { user: currentUser } = useAuth();

  if (!user) {
    return null;
  }

  const isOwnProfile =
    String(currentUser?.id) === String(user.id);

  const followMutation = useFollow(user.id);

  return (
    <div className="flex flex-col items-center gap-5 py-10 px-4">

      {/* Avatar */}
      <img
        src={user.profileImg}
        alt={user.username}
        className="
          w-28
          h-28
          rounded-full
          object-cover
          border-4
          border-zinc-800
        "
      />

      {/* Username */}
      <h1 className="text-2xl font-bold text-white">
        {user.username}
      </h1>

      {/* Stats */}
      <div className="flex items-center gap-8 sm:gap-10 text-center">

        <div>
          <p className="text-white font-bold text-lg">
            {user.postsCount ?? 0}
          </p>
          <p className="text-zinc-400 text-sm">
            Posts
          </p>
        </div>

        <div>
          <p className="text-white font-bold text-lg">
            {user.followersCount ?? 0}
          </p>
          <p className="text-zinc-400 text-sm">
            Followers
          </p>
        </div>

        <div>
          <p className="text-white font-bold text-lg">
            {user.followingCount ?? 0}
          </p>
          <p className="text-zinc-400 text-sm">
            Following
          </p>
        </div>

      </div>

      {/* Bio */}
      <p className="max-w-md text-center text-zinc-300 leading-6">
        {user.bio || "No bio yet"}
      </p>

      {/* Action */}
      <div className="flex justify-center">

        {isOwnProfile ? (

          <button
            type="button"
            onClick={onEditProfile}
            className="
              px-8
              py-2.5
              rounded-lg
              bg-zinc-800
              hover:bg-zinc-700
              text-white
              font-medium
              transition
            "
          >
            Edit Profile
          </button>

        ) : (

          <button
            type="button"
            onClick={() => followMutation.mutate()}
            disabled={followMutation.isPending}
            className={`
              px-8
              py-2.5
              rounded-lg
              font-semibold
              transition

              ${user.isFollowing
                ? "bg-zinc-800 text-white hover:bg-zinc-700"
                : "bg-blue-600 text-white hover:bg-blue-500"
              }

              disabled:opacity-60
              disabled:cursor-not-allowed
            `}
          >
            {followMutation.isPending
              ? "Loading..."
              : user.isFollowing
                ? "Following"
                : "Follow"}
          </button>

        )}

      </div>

    </div>
  );
};

export default ProfileHeader;