import userProfileNavigation from "../../hooks/useProfileNavigation";
import { useAuth } from "../../hooks/useAuth";

import { X } from "lucide-react";
import PostMenu from "./PostMenu";

const PostHeader = ({ post, isOwner = false, onClose, onDeleteClick, }) => {

  const goToProfile = userProfileNavigation();

  // Prevent crash if this component is ever rendered
  // before a post is available.
  if (!post) {
    return null;
  }

  const username = post.user?.username ?? "Unknown user";
  const profileImg = post.user?.profileImg ?? "";

  return (
    <div className="relative z-50 flex items-center justify-between px-3 py-2 min-[500px]:px-4 min-[500px]:py-3 min-[1000px]:px-5 min-[1000px]:py-4 border-b border-zinc-800 bg-zinc-950">
      {/* USER */}
      <div onClick={() => { onClose?.(); goToProfile(post.user.id); }}
        className="flex items-center gap-2 min-[500px]:gap-3">
        {profileImg ? (
          <img src={profileImg} alt={username} className="w-8 h-8 min-[500px]:w-9 min-[500px]:h-9 min-[1000px]:w-10 min-[1000px]:h-10 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-8 h-8 min-[500px]:w-9 min-[500px]:h-9 min-[1000px]:w-10 min-[1000px]:h-10 rounded-full bg-zinc-700 shrink-0" />
        )}

        <p className="text-xs min-[500px]:text-sm min-[1000px]:text-base font-semibold text-white">{username}</p>
      </div>

      {/* RIGHT CONTROLS */}
      <div className="flex items-center gap-1">

        {/* THREE DOTS */}
        <PostMenu
          post={post}
          onDeleteClick={onDeleteClick}
        />

        {/* CLOSE */}
        <button type="button" onClick={onClose} className="flex items-center justify-center w-9 h-9 rounded-full  text-zinc-400 hover:text-white  hover:bg-zinc-800 transition"
          aria-label="Close post"><X size={21} /></button>

      </div>
    </div>
  );
};

export default PostHeader;