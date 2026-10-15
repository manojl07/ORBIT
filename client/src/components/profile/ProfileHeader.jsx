import { useState } from "react";

import { MoreHorizontal, Pencil, Settings, Grid3X3, Bookmark, Repeat2, UserRound, } from "lucide-react";

import FollowersModal from "../social/FollowersModal";
import FollowingModal from "../social/FollowingModal";
import FollowButton from "../social/FollowButton";

const ProfileHeader = ({ user, isOwnProfile, onEditProfile, }) => {
  const [followersOpen, setFollowersOpen] = useState(false);

  const [followingOpen, setFollowingOpen] = useState(false);

  /* ========================================
     CLOSE SOCIAL MODALS
  ======================================== */

  const handleNavigate = () => {
    setFollowersOpen(false);
    setFollowingOpen(false);
  };

  return (
    <>
      <section className="w-full">
        <div className="mx-auto max-w-5xl px-3 py-10 sm:px-6 sm:pt-8 lg:px-8 lg:pt-10 lg:pb-25" >
          {/* ========================================
              PROFILE MAIN
          ======================================== */}

          <div className="flex flex-col gap-6 sm:gap-8" >
            {/* ======================================
                AVATAR + PROFILE INFO
            ====================================== */}

            <div className="flex items-start gap-5 sm:gap-8 lg:gap-12" >
              {/* ==================================
                  AVATAR
              ================================== */}

              <div className="relative shrink-0 w-24 h-24 sm:w-28 sm:h-28 lg:w-36 lg:h-36" >
                <div className="absolute inset-0 rounded-full bg-linear-to-tr from-zinc-700 via-zinc-500 to-zinc-800 p-[2px]" >
                  <img src={user.profileImg} alt={user.username} className="w-full h-full rounded-full border-4 border-black object-cover" />
                </div>
              </div>

              {/* ==================================
                  PROFILE INFORMATION
              ================================== */}

              <div className="min-w-0 flex-1 pt-1" >
                {/* USERNAME + MORE */}

                <div className="flex items-center justify-between gap-2" >
                  <h1 className="min-w-0 truncate text-xl font-semibold tracking-tight text-white sm:text-2xl lg:text-3xl" >
                    {user.username}
                  </h1>

                  <button type="button" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-900 hover:text-white" aria-label="More profile options" >
                    <MoreHorizontal size={20} />
                  </button>
                </div>

                {/* ==================================
                    STATS
                ================================== */}

                <div className="mt-4 flex items-center gap-4 sm:gap-6 lg:gap-8" >
                  <ProfileStat value={user.postsCount} label="posts" />

                  <button type="button" onClick={() => setFollowersOpen(true)}
                    className="transition hover:opacity-70" >
                    <ProfileStat value={user.followersCount} label="followers" />
                  </button>

                  <button type="button" onClick={() => setFollowingOpen(true)}
                    className="transition hover:opacity-70" >
                    <ProfileStat value={user.followingCount} label="following" />
                  </button>
                </div>

                {/* ==================================
                    BIO
                ================================== */}

                {user.bio && (
                  <p className="mt-4 max-w-xl text-sm leading-5 text-zinc-300 sm:text-base sm:leading-6" >{user.bio}</p>
                )}

                {/* ==================================
                    DESKTOP ACTIONS

                    On mobile these move below
                    the entire profile section.
                ================================== */}

                <div className="mt-5 hidden sm:flex items-center gap-2" >
                  <ProfileActions isOwnProfile={isOwnProfile} onEditProfile={onEditProfile} user={user} />
                </div>
              </div>
            </div>

            {/* ======================================
                MOBILE ACTIONS
                Full width Instagram-like buttons
            ====================================== */}

            <div className="grid grid-cols-[1fr_1fr_auto] gap-2 sm:hidden" >
              {isOwnProfile ? (
                <>
                  <button type="button" onClick={onEditProfile}
                    className="flex items-center justify-center gap-2 h-10 rounded-lg bg-zinc-800 text-sm font-semibold text-white transition hover:bg-zinc-700 active:scale-[0.98]" >
                    <Pencil size={16} />

                    <span>Edit profile</span>
                  </button>

                  <button type="button" className="flex items-center justify-center h-10 rounded-lg bg-zinc-800 text-sm font-semibold text-white transition hover:bg-zinc-700 active:scale-[0.98]" >
                    View archive
                  </button>

                  <button type="button" aria-label="Settings" className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-300 transition hover:bg-zinc-900" >
                    <Settings size={20} />
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center" >
                    <FollowButton user={user} />
                  </div>

                  <button type="button" className="flex items-center justify-center h-10 rounded-lg bg-zinc-800 text-sm font-semibold text-white transition hover:bg-zinc-700" >Message</button>
                </>
              )}
            </div>
          </div>


        </div>
      </section>

      {/* ========================================
          FOLLOWERS MODAL
      ======================================== */}

      <FollowersModal isOpen={followersOpen} onClose={() => setFollowersOpen(false)} onNavigate={handleNavigate} userId={user.id} />

      {/* ========================================
          FOLLOWING MODAL
      ======================================== */}

      <FollowingModal isOpen={followingOpen} onClose={() => setFollowingOpen(false)} onNavigate={handleNavigate} userId={user.id} />
    </>
  );
};

/* =============================================
   PROFILE STAT
============================================= */

const ProfileStat = ({value,label,}) => {
  return (
    <div className="flex items-center gap-1" >
      <span className="text-sm font-semibold text-white sm:text-base" >{value ?? 0}</span>

      <span className="text-sm text-zinc-400 sm:text-base" >{label}</span>
    </div>
  );
};

/* =============================================
   PROFILE ACTIONS
============================================= */

const ProfileActions = ({isOwnProfile,onEditProfile,user,}) => {
  if (isOwnProfile) {
    return (
      <>
        <button type="button" onClick={onEditProfile} className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700" >
          <Pencil size={16} />
          Edit profile
        </button>

        <button type="button" className="rounded-lg bg-zinc-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700" >
          View archive
        </button>

        <button type="button" aria-label="Settings" className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-300 transition hover:bg-zinc-900 hover:text-white" >
          <Settings size={20} />
        </button>
      </>
    );
  }

  return (
    <>
      <FollowButton user={user} />
      <button type="button" className="rounded-lg bg-zinc-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700" >Message</button>
    </>
  );
};

/* =============================================
   PROFILE TAB
============================================= */

const ProfileTab = ({icon,label,active = false,}) => {
  return (
    <button type="button" disabled={!active} aria-label={label} className={`relative flex h-12 items-center justify-center text-zinc-500 transition ${active? "text-white": "cursor-default"}`} >
      {icon}

      {active && (
        <span className="absolute bottom-0 left-1/2 h-px w-10 -translate-x-1/2 bg-white" />
      )}
    </button>
  );
};

export default ProfileHeader;