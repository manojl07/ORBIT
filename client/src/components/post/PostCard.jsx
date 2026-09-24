import { useRef, useState } from "react";
import PostActions from "./PostActions";
import CommentModal from "../comment/CommentModal";

import { queryKeys } from "../../constants/queryKey";

import useProfileNavigation from "../../hooks/useProfileNavigation";

import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import FollowTextButton from "../social/FollowTextButton";

import PostMenu from "./PostMenu";
import DeletePostDialog from "./DeletePostDialog";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import useLikePost from "../../hooks/useLikePost";

const PostCard = ({ post }) => {

  const { user: currentUser } = useAuth();

  const goToProfile = useProfileNavigation();

  const [isCommentOpen, setIsCommentOpen] = useState(false);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [showHeart, setShowHeart] = useState(false)

  const lastTapRef = useRef(0)

  const { toggleLike, isPending: isLikePending } = useLikePost({ post, queryKey: queryKeys.feed })

  const profileUserId = post?.user?._id ?? post?.user?.id;

  const currentUserId = currentUser?.id ?? currentUser?._id;

  const isOwnPost = String(currentUserId ?? "") === String(profileUserId ?? "");

  const handleProfileClick = () => {
    if (!profileUserId) {
      console.error("PostCard: profile user ID missing", post?.user);
      return;
    }

    goToProfile(profileUserId);
  };

  const handleDoubleTap = (event) => {
    const now = Date.now();

    if (now - lastTapRef.current < 300) {
      lastTapRef.current = 0;

      if (isLikePending) return;

      setShowHeart(true);
      toggleLike();
    } else {
      lastTapRef.current = now;
    }
  }

  return (
    <div className="bg-zinc-950 border border-zinc-800/70 rounded-2xl overflow-hidden">


      {/* Header */}
      <div className="flex items-center px-4 py-3">

        {/* PROFILE NAVIGATION */}
        <div
          onClick={handleProfileClick}
          className="flex items-center gap-3 cursor-pointer group">
          <img src={post.user?.profileImg} alt={post.user?.username || ""} className="w-8 h-8 rounded-full object-cover shrink-0" />

          <h3 className="text-white text-sm font-semibold">{post.user?.username}</h3>
        </div>

        {/* FOLLOW BUTTON */}
        {!isOwnPost && (
          <>
            <span className="ml-2 mr-2 text-zinc-600">•</span>
            <FollowTextButton user={post.user} />
          </>
        )}
        <PostMenu
          post={post}
          onDeleteClick={() => setShowDeleteDialog(true)}
        />

        <DeletePostDialog
          isOpen={showDeleteDialog}
          post={post}
          onClose={() => setShowDeleteDialog(false)}
          onDeleted={() => setShowDeleteDialog(false)}
        />

      </div>

      {/* Image */}
      <div className="relative" onPointerUp={handleDoubleTap} >
        <img src={post.imageUrl} alt="Post" draggable={false} className="w-full aspect-[1.05/1] object-cover bg-zinc-900 touch-manipulation select-none" />

        {showHeart && (
          <motion.div initial={{scale: 0,opacity: 0,}} animate={{scale: [0, 1.25, 1],opacity: [0, 1, 0],}} transition={{duration: 0.7,ease: "easeOut",}}
            onAnimationComplete={() => setShowHeart(false)} className="absolute inset-0 flex items-center justify-center pointer-events-none" >
            <Heart size={110} className="fill-red-500 text-red-500" />
          </motion.div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 py-3">

        <PostActions
          post={post}
          queryKey={queryKeys.feed}
          onCommentClick={() =>
            setIsCommentOpen(true)
          }
        />

        {/* Caption */}
        {post.caption && (
          <p className="mt-3 text-sm text-zinc-300">

            <span
              onClick={handleProfileClick}
              className="
                font-semibold
                text-white
                mr-2
                cursor-pointer
                hover:text-zinc-300
                transition
              "
            >
              {post.user?.username}
            </span>

            {post.caption}

          </p>
        )}

        {/* View comments */}
        {post.commentsCount > 0 && (
          <button
            type="button"
            onClick={() =>
              setIsCommentOpen(true)
            }
            className="
              mt-2
              text-sm
              text-zinc-500
              hover:text-zinc-300
              transition
            "
          >
            View all{" "}
            {post.commentsCount} comments
          </button>
        )}

        {/* Date */}
        <p
          className="
            mt-2
            text-[10px]
            tracking-widest
            text-zinc-600
            uppercase
          "
        >
          {new Date(
            post.createdAt
          ).toLocaleDateString(
            "en-US",
            {
              month: "short",
              day: "numeric",
              year: "numeric",
            }
          )}
        </p>

      </div>

      <CommentModal
        isOpen={isCommentOpen}
        onClose={() =>
          setIsCommentOpen(false)
        }
        post={post}
      />

    </div>
  );
};

export default PostCard;