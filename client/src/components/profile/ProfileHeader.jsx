import { useState } from "react";
import { Pencil } from "lucide-react";

import FollowersModal from "../social/FollowersModal";
import FollowingModal from "../social/FollowingModal";

import FollowButton from "../social/FollowButton";

const ProfileHeader = ({ user, isOwnProfile, onEditProfile, }) => {
  const [followersOpen, setFollowersOpen] = useState(false);
  const [followingOpen, setFollowingOpen] = useState(false);

  // Close both social modals before navigating
  const handleNavigate = () => {
    setFollowersOpen(false);
    setFollowingOpen(false);
  };

  return (
    <>
      <div className="flex flex-col items-center gap-5 py-10">

        {/* Avatar */}
        <img
          src={user.profileImg}
          alt={user.username}
          className="w-28 h-28 rounded-full object-cover border-4 border-zinc-800"
        />

        {/* Username */}
        <h1 className="text-3xl font-bold text-white">
          {user.username}
        </h1>

        {/* Action Button */}
        {isOwnProfile ? (
          <button
            onClick={onEditProfile}
            className="
              flex
              items-center
              gap-2
              rounded-lg
              bg-zinc-900
              px-5
              py-2.5
              text-white
              border
              border-zinc-700
              hover:bg-zinc-800
              transition
            "
          >
            <Pencil size={16} />

            Edit Profile
          </button>
        ) : (
          <FollowButton user={user} />
        )}

        {/* Stats */}
        <div className="flex gap-10">

          <div className="text-center">
            <p className="text-xl font-bold text-white">
              {user.postsCount}
            </p>

            <p className="text-zinc-400 text-sm">
              Posts
            </p>
          </div>

          <button
            onClick={() => setFollowersOpen(true)}
            className="text-center hover:opacity-80 transition"
          >
            <p className="text-xl font-bold text-white">
              {user.followersCount}
            </p>

            <p className="text-zinc-400 text-sm">
              Followers
            </p>
          </button>

          <button
            onClick={() => setFollowingOpen(true)}
            className="text-center hover:opacity-80 transition"
          >
            <p className="text-xl font-bold text-white">
              {user.followingCount}
            </p>

            <p className="text-zinc-400 text-sm">
              Following
            </p>
          </button>

        </div>

        {user.bio && (
          <p className="max-w-md text-center text-zinc-400 leading-7">
            {user.bio}
          </p>
        )}
      </div>

      <FollowersModal
        isOpen={followersOpen}
        onClose={() => setFollowersOpen(false)}
        onNavigate={handleNavigate}
        userId={user.id}
      />

      <FollowingModal
        isOpen={followingOpen}
        onClose={() => setFollowingOpen(false)}
        onNavigate={handleNavigate}
        userId={user.id}
      />
    </>
  );
};

export default ProfileHeader;