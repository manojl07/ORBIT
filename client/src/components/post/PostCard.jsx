import React, { useState } from "react";
import PostActions from "./PostActions";
import CommentModal from "../comment/CommentModal";
import { queryKeys } from "../../constants/queryKey";

const PostCard = ({ post }) => {

  const [isCommentOpen, setIsCommentOpen] = useState(false);

  return (
    <div className="
      bg-zinc-950
      border border-zinc-800/70
      rounded-2xl
      overflow-hidden
    ">

      {/* Header */}
      <div className="flex items-center px-4 py-3">

        <img
          src={post.user.profileImg}
          alt={post.user.username}
          className="w-9 h-9 rounded-full object-cover"
        />

        <p className="ml-3 text-sm font-semibold text-white">
          {post.user.username}
        </p>

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

        {/* Like + Comment */}
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

            <span className="font-semibold text-white mr-2">
              {post.user.username}
            </span>

            {post.caption}

          </p>
        )}


        {/* View comments */}
        {post.commentsCount > 0 && (
          <button
            onClick={() => setIsCommentOpen(true)}
            className="
              mt-2
              text-sm
              text-zinc-500
              hover:text-zinc-300
            "
          >
            View all {post.commentsCount} comments
          </button>
        )}


        {/* Date */}
        <p className="
          mt-2
          text-[10px]
          tracking-widest
          text-zinc-600
          uppercase
        ">
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


      {/* Comments Modal */}
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