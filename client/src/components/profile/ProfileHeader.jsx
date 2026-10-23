
import { Fragment, useState } from "react";
import {
  MoreHorizontal,
  Pencil,
  Settings,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Bookmark } from "lucide-react";

import FollowersModal from "../social/FollowersModal";
import FollowingModal from "../social/FollowingModal";
import FollowButton from "../social/FollowButton";
import VerifiedBadge from "../ui/VerifiedBadge";

const ProfileHeader = ({
  user,
  isOwnProfile,
  onEditProfile,
}) => {
  const [followersOpen, setFollowersOpen] = useState(false);
  const [followingOpen, setFollowingOpen] = useState(false);

  const handleNavigate = () => {
    setFollowersOpen(false);
    setFollowingOpen(false);
  };

  console.log("ProfileHeader verification:", {
    username: user?.username,
    isVerified: user?.isVerified,
  });

  const mutualFriends = user.mutualFriends;
  const mutualUsers = mutualFriends?.users ?? [];

  return (
    <>
      <section className="w-full">
        <div className="mx-auto max-w-5xl px-3 py-10 sm:px-6 sm:pt-8 lg:px-8 lg:pt-10 lg:pb-25">
          <div className="flex flex-col gap-6 sm:gap-8">
            {/* AVATAR + PROFILE INFORMATION */}
            <div className="flex items-start gap-5 sm:gap-8 lg:gap-12">
              <div className="relative h-24 w-24 shrink-0 sm:h-28 sm:w-28 lg:h-36 lg:w-36">
                <div className="absolute inset-0 rounded-full bg-linear-to-tr from-zinc-700 via-zinc-500 to-zinc-800 p-[2px]">
                  <img
                    src={user.profileImg}
                    alt={user.username}
                    className="h-full w-full rounded-full border-4 border-black object-cover"
                  />
                </div>
              </div>

              <div className="min-w-0 flex-1 pt-1">
                {/* USERNAME + VERIFICATION + MORE */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <h1 className="min-w-0 truncate text-xl font-semibold tracking-tight text-white sm:text-2xl lg:text-3xl">
                      {user.username}
                    </h1>

                    {user.isVerified && (
                      <VerifiedBadge size={20} />
                    )}
                  </div>

                  <button
                    type="button"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
                    aria-label="More profile options"
                  >
                    <MoreHorizontal size={20} />
                  </button>
                </div>

                {/* STATS */}
                <div className="mt-4 flex items-center gap-4 sm:gap-6 lg:gap-8">
                  <ProfileStat
                    value={user.postsCount}
                    label="posts"
                  />

                  <button
                    type="button"
                    onClick={() => setFollowersOpen(true)}
                    className="transition hover:opacity-70"
                  >
                    <ProfileStat
                      value={user.followersCount}
                      label="followers"
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => setFollowingOpen(true)}
                    className="transition hover:opacity-70"
                  >
                    <ProfileStat
                      value={user.followingCount}
                      label="following"
                    />
                  </button>
                </div>

                {/* BIO */}
                {user.bio && (
                  <p className="mt-4 max-w-xl whitespace-pre-wrap text-sm leading-5 text-zinc-300 sm:text-base sm:leading-6">
                    {user.bio}
                  </p>
                )}

                {/* MUTUAL CONNECTIONS */}
                {!isOwnProfile &&
                  mutualFriends?.count > 0 && (
                    <MutualFriends
                      mutualFriends={mutualFriends}
                    />
                  )}

                {/* DESKTOP ACTIONS */}
                <div className="mt-5 hidden items-center gap-3 sm:flex">
                  <ProfileActions
                    isOwnProfile={isOwnProfile}
                    onEditProfile={onEditProfile}
                    user={user}
                  />
                </div>
              </div>
            </div>

            {/* MOBILE ACTIONS */}
            <div className="grid grid-cols-[1fr_1fr_auto] gap-2 sm:hidden">
              {isOwnProfile ? (
                <>
                  <button
                    type="button"
                    onClick={onEditProfile}
                    className="flex h-10 items-center justify-center gap-2 rounded-lg bg-zinc-800 text-sm font-semibold text-white transition hover:bg-zinc-700 active:scale-[0.98]"
                  >
                    <Pencil size={16} />
                    <span>Edit profile</span>
                  </button>

                  <Link
                    to="/saved"
                    className="flex h-10 items-center justify-center gap-2 rounded-lg bg-zinc-800 px-3 text-sm font-semibold text-white transition hover:bg-zinc-700 active:scale-[0.98]"
                  >
                    <Bookmark size={16} />
                    <span>Saved</span>
                  </Link>

                  <button
                    type="button"
                    aria-label="Settings"
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-300 transition hover:bg-zinc-900"
                  >
                    <Settings size={20} />
                  </button>
                </>
              ) : (
                <>
                  <div className="flex min-w-0 items-center justify-center">
                    <FollowButton user={user} />
                  </div>

                  <button
                    type="button"
                    className="flex h-10 items-center justify-center rounded-lg bg-zinc-800 text-sm font-semibold text-white transition hover:bg-zinc-700"
                  >
                    Message
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

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

/* =============================================
   PROFILE STAT
============================================= */

const ProfileStat = ({ value, label }) => (
  <div className="flex items-center gap-1">
    <span className="text-sm font-semibold text-white sm:text-base">
      {value ?? 0}
    </span>

    <span className="text-sm text-zinc-400 sm:text-base">
      {label}
    </span>
  </div>
);

/* =============================================
   MUTUAL CONNECTIONS
============================================= */

const MutualFriends = ({ mutualFriends }) => {
  const users = mutualFriends?.users ?? [];
  const count = mutualFriends?.count ?? 0;

  if (!count || !users.length) {
    return null;
  }

  const displayedUsers = users.slice(0, 2);

  const remainingCount = Math.max(
    0,
    count - displayedUsers.length
  );

  return (
    <div
      className="mt-4 flex min-w-0 items-center gap-2"
      aria-label={`${count} mutual connections`}
    >
      {/* CLICKABLE, OVERLAPPING PROFILE PICTURES */}
      <div className="flex shrink-0 items-center pl-0.5">
        {users.slice(0, 3).map((friend, index) => (
          <Link
            key={friend.id}
            to={`/profile/${friend.id}`}
            aria-label={`View ${friend.username}'s profile`}
            title={friend.username}
            className={`relative block h-7 w-7 cursor-pointer rounded-full
              focus-visible:outline-2 focus-visible:outline-blue-500
              ${index > 0 ? "-ml-2" : ""}`}
          >
            <img
              src={friend.profileImg}
              alt={friend.username}
              className="h-full w-full rounded-full border-2 border-black object-cover transition-opacity hover:opacity-75"
            />
          </Link>
        ))}
      </div>

      {/* CLICKABLE USERNAMES */}
      <p className="min-w-0 text-xs leading-5 text-zinc-400 sm:text-sm">
        <span>Followed by </span>

        {displayedUsers.map((friend, index) => (
          <Fragment key={friend.id}>
            {index > 0 && " and "}

            <Link
              to={`/profile/${friend.id}`}
              title={`View ${friend.username}'s profile`}
              className="cursor-pointer font-semibold text-zinc-200 hover:text-white hover:underline"
            >
              {friend.username}
            </Link>
          </Fragment>
        ))}

        {remainingCount > 0 && (
          <span> + {remainingCount} more</span>
        )}
      </p>
    </div>
  );
};
/* =============================================
   PROFILE ACTIONS
============================================= */

const ProfileActions = ({
  isOwnProfile,
  onEditProfile,
  user,
}) => {
  if (isOwnProfile) {
    return (
      <>
        <button
          type="button"
          onClick={onEditProfile}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700"
        >
          <Pencil size={16} />
          Edit profile
        </button>

        <Link
          to="/saved"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700"
        >
          <Bookmark size={16} />
          view archive's
        </Link>

        <button
          type="button"
          aria-label="Settings"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
        >
          <Settings size={20} />
        </button>
      </>
    );
  }

  return (
    <>
      <FollowButton user={user} />

      <button
        type="button"
        className="rounded-lg bg-zinc-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700"
      >
        Message
      </button>
    </>
  );
};

export default ProfileHeader;
