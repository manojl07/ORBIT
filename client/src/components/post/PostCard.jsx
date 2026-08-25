import React, { useState } from "react";

import PostActions from "./PostActions";
import CommentModal from "../comment/CommentModal";

import { queryKeys } from "../../constants/queryKey";

import useProfileNavigation from "../../hooks/useProfileNavigation";

const PostCard = ({ post }) => {

  const goToProfile =
    useProfileNavigation();

  const [isCommentOpen, setIsCommentOpen] =
    useState(false);

  const profileUserId =
    post?.user?._id ??
    post?.user?.id;

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

  return (
    <div
      className="
        bg-zinc-950
        border
        border-zinc-800/70
        rounded-2xl
        overflow-hidden
      "
    >

      {/* Header */}
      <div className="flex items-center px-4 py-3">

        <div
          onClick={handleProfileClick}
          className="
            flex
            items-center
            gap-3
            cursor-pointer
            group
          "
        >

          <img
            src={post.user?.profileImg}
            alt={
              post.user?.username ||
              ""
            }
            className="
              w-9
              h-9
              rounded-full
              object-cover
              shrink-0
            "
          />

          <p
            className="
              text-sm
              font-semibold
              text-white
              group-hover:text-zinc-300
              transition
            "
          >
            {post.user?.username}
          </p>

        </div>

      </div>

      {/* Image */}
      <img
        src={post.imageUrl}
        alt="Post"
        className="
          w-full
          aspect-[1.05/1]
          object-cover
          bg-zinc-900
        "
      />

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