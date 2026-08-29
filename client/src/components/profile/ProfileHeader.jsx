import { useState } from "react";

import FollowersModal from "../social/FollowersModal";
import FollowingModal from "../social/FollowingModal";

const ProfileHeader = ({ user }) => {
  const [followersOpen, setFollowersOpen] = useState(false);
  const [followingOpen, setFollowingOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col items-center gap-4 py-8">

        <img
          src={user.profileImg}
          alt={user.username}
          className="w-24 h-24 rounded-full object-cover border-4 border-zinc-800"
        />

        <h1 className="text-2xl font-bold text-white">
          {user.username}
        </h1>

        <div className="flex gap-10 text-white">

          {/* Posts */}
          <div className="text-center">
            <strong className="block text-lg">
              {user.postsCount}
            </strong>

            <p className="text-zinc-400 text-sm">
              Posts
            </p>
          </div>

          {/* Followers */}
          <button
            onClick={() => setFollowersOpen(true)}
            className="text-center transition hover:opacity-80"
          >
            <strong className="block text-lg">
              {user.followersCount}
            </strong>

            <p className="text-zinc-400 text-sm">
              Followers
            </p>
          </button>

          {/* Following */}
          <button
            onClick={() => setFollowingOpen(true)}
            className="text-center transition hover:opacity-80"
          >
            <strong className="block text-lg">
              {user.followingCount}
            </strong>

            <p className="text-zinc-400 text-sm">
              Following
            </p>
          </button>

        </div>

        {user.bio && (
          <p className="text-zinc-400 text-center max-w-md">
            {user.bio}
          </p>
        )}
      </div>

      <FollowersModal
        isOpen={followersOpen}
        onClose={() => setFollowersOpen(false)}
        userId={user.id}
      />

      <FollowingModal
        isOpen={followingOpen}
        onClose={() => setFollowingOpen(false)}
        userId={user.id}
      />
    </>
  );
};

export default ProfileHeader;