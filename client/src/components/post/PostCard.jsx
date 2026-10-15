import { useRef, useState } from "react";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";

import PostActions from "./PostActions";
import CommentModal from "../comment/CommentModal";
import PostMenu from "./PostMenu";
import DeletePostDialog from "./DeletePostDialog";
import VerifiedBadge from "../ui/VerifiedBadge";

import { queryKeys } from "../../constants/queryKey";
import useProfileNavigation from "../../hooks/useProfileNavigation";
import useLikePost from "../../hooks/useLikePost";
import { useAuth } from "../../hooks/useAuth";
import FollowTextButton from "../social/FollowTextButton";

const PostCard = ({ post }) => {
  const { user: currentUser } = useAuth();
  const goToProfile = useProfileNavigation();

  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showHeart, setShowHeart] = useState(false);

  const lastTapRef = useRef(0);

  const {
    toggleLike,
    isPending: isLikePending,
  } = useLikePost({
    post,
    queryKey: queryKeys.feed,
  });

  const profileUserId =
    post?.user?._id ?? post?.user?.id;

  const currentUserId =
    currentUser?.id ?? currentUser?._id;

  const isOwnPost =
    String(currentUserId ?? "") ===
    String(profileUserId ?? "");

  const handleProfileClick = () => {
    if (!profileUserId) {
      console.error(
        "PostCard: profile user ID missing",
        post?.user
      );
      return;
    }

    goToProfile(profileUserId);
  };

  const handleDoubleTap = () => {
    const now = Date.now();

    if (now - lastTapRef.current < 300) {
      lastTapRef.current = 0;

      if (isLikePending) return;

      setShowHeart(true);
      toggleLike();
    } else {
      lastTapRef.current = now;
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800/70 bg-zinc-950">
      {/* HEADER */}
      <div className="flex items-center px-4 py-3">
        <button
          type="button"
          onClick={handleProfileClick}
          className="group flex min-w-0 items-center gap-3 text-left"
        >
          <img
            src={post.user?.profileImg}
            alt={post.user?.username || ""}
            className="h-8 w-8 shrink-0 rounded-full object-cover"
          />

          <span className="flex min-w-0 items-center gap-1.5">
            <span className="truncate text-sm font-semibold text-white">
              {post.user?.username}
            </span>

            {post.user?.isVerified && (
              <VerifiedBadge size={15} />
            )}
          </span>
        </button>

        {!isOwnPost && (
          <>
            <span className="mx-2 text-zinc-600">•</span>
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

      {/* IMAGE */}
      <div
        className="relative"
        onPointerUp={handleDoubleTap}
      >
        <img
          src={post.imageUrl}
          alt={post.caption || "Post"}
          draggable={false}
          className="aspect-[1.05/1] w-full select-none touch-manipulation bg-zinc-900 object-cover"
        />

        {showHeart && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1.25, 1],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 0.7,
              ease: "easeOut",
            }}
            onAnimationComplete={() => setShowHeart(false)}
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <Heart
              size={110}
              className="fill-red-500 text-red-500"
            />
          </motion.div>
        )}
      </div>

      {/* CONTENT */}
      <div className="px-4 py-3">
        <PostActions
          post={post}
          queryKey={queryKeys.feed}
          onCommentClick={() => setIsCommentOpen(true)}
        />

        {post.caption && (
          <p className="mt-3 text-sm text-zinc-300">
            <button
              type="button"
              onClick={handleProfileClick}
              className="mr-2 inline-flex items-center gap-1 font-semibold text-white transition hover:text-zinc-300"
            >
              {post.user?.username}

              {post.user?.isVerified && (
                <VerifiedBadge size={13} />
              )}
            </button>

            {post.caption}
          </p>
        )}

        {post.commentsCount > 0 && (
          <button
            type="button"
            onClick={() => setIsCommentOpen(true)}
            className="mt-2 text-sm text-zinc-500 transition hover:text-zinc-300"
          >
            View all {post.commentsCount} comments
          </button>
        )}

        <p className="mt-2 text-[10px] uppercase tracking-widest text-zinc-600">
          {new Date(post.createdAt).toLocaleDateString(
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
        onClose={() => setIsCommentOpen(false)}
        post={post}
      />
    </div>
  );
};

export default PostCard;
