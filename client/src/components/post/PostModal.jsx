import React, { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";

import PostHeader from "./PostHeader";
import PostActions from "./PostActions";
import CommentList from "../comment/CommentList";
import CommentInput from "../comment/CommentInput";
import DeletePostDialog from "./DeletePostDialog";

const PostModal = ({
  isOpen,
  onClose,
  post,
}) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [showDeleteDialog, setShowDeleteDialog] =
    useState(false);

  const userPosts = queryClient.getQueryData([
    "user-posts",
    user?.id,
  ]);

  const feedPosts = queryClient.getQueryData([
    "feed",
  ]);

  const getPostId = (value) =>
    value?._id ?? value?.id;

  const currentPost = post
    ? (
        userPosts?.data?.posts?.find(
          (p) =>
            String(getPostId(p)) ===
            String(getPostId(post))
        ) ||
        feedPosts?.data?.posts?.find(
          (p) =>
            String(getPostId(p)) ===
            String(getPostId(post))
        ) ||
        post
      )
    : null;

  const ownerId =
    currentPost?.user?._id ??
    currentPost?.user?.id;

  const currentUserId =
    user?.id ??
    user?._id;

  const isOwner =
    String(ownerId ?? "") ===
    String(currentUserId ?? "");

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [isOpen, onClose]);

  if (!isOpen || !currentPost) {
    return null;
  }

  return (
    <>
      <div
        className="
          fixed inset-0 z-150
          bg-black/90
          flex items-center justify-center
          p-0
          min-[1000px]:p-6
        "
        onClick={onClose}
      >
        <div
          onClick={(e) =>
            e.stopPropagation()
          }
          className="
            relative
            w-full
            h-dvh
            bg-zinc-950
            overflow-hidden
            flex flex-col

            min-[1000px]:grid
            min-[1000px]:grid-cols-[1.6fr_1fr]
            min-[1000px]:max-w-6xl
            min-[1000px]:h-[92vh]
            min-[1000px]:rounded-2xl
            min-[1000px]:border
            min-[1000px]:border-zinc-800
          "
        >

          {/* IMAGE */}
          <div
            className="
              w-full
              h-[40dvh]
              min-[500px]:h-[42dvh]
              bg-black
              flex
              items-center
              justify-center
              overflow-hidden
              shrink-0

              min-[1000px]:h-full
              min-[1000px]:shrink
            "
          >
            <img
              src={currentPost.imageUrl}
              alt={
                currentPost.caption ||
                "Post"
              }
              className="
                w-full
                h-full
                object-contain
              "
            />
          </div>

          {/* DETAILS */}
          <div
            className="
              min-h-0
              flex-1
              bg-zinc-950
              flex flex-col
              overflow-hidden

              min-[1000px]:h-full
            "
          >

            {/* HEADER */}
            <PostHeader
              post={currentPost}
              isOwner={isOwner}
              onClose={onClose}
              onDeleteClick={() =>
                setShowDeleteDialog(true)
              }
            />

            {/* CAPTION */}
            {currentPost.caption && (
              <div
                className="
                  px-3 py-2
                  min-[500px]:px-4
                  min-[500px]:py-3
                  min-[1000px]:px-5
                  min-[1000px]:py-4
                  border-b border-zinc-800
                  shrink-0
                "
              >
                <div
                  className="
                    flex
                    gap-2
                    min-[500px]:gap-3
                  "
                >
                  <img
                    src={
                      currentPost.user?.profileImg
                    }
                    alt={
                      currentPost.user?.username ||
                      ""
                    }
                    className="
                      w-7 h-7
                      min-[500px]:w-8
                      min-[500px]:h-8
                      rounded-full
                      object-cover
                      shrink-0
                    "
                  />

                  <p
                    className="
                      text-xs
                      leading-4
                      min-[500px]:text-sm
                      min-[500px]:leading-5
                      text-zinc-300
                    "
                  >
                    <span
                      className="
                        font-semibold
                        text-white
                        mr-1.5
                      "
                    >
                      {
                        currentPost.user?.username
                      }
                    </span>

                    {currentPost.caption}
                  </p>
                </div>
              </div>
            )}

            {/* COMMENTS */}
            <div
              className="
                flex-1
                min-h-0
                overflow-y-auto
                instagram-scroll
              "
            >
              <CommentList
                postId={currentPost._id}
                queryKey={[
                  "comments",
                  currentPost._id,
                ]}
              />
            </div>

            {/* ACTIONS */}
            <div
              className="
                px-3 py-2
                min-[500px]:px-4
                min-[500px]:py-2.5
                min-[1000px]:px-5
                min-[1000px]:py-3

                border-t
                border-zinc-800
                shrink-0
              "
            >
              <PostActions
                post={currentPost}
                queryKey={[
                  "user-posts",
                  currentPost.user?._id ??
                    currentPost.user?.id,
                ]}
              />
            </div>

            {/* META */}
            <div
              className="
                px-3 py-2
                min-[500px]:px-4
                min-[500px]:py-2.5
                min-[1000px]:px-5
                min-[1000px]:py-3
                shrink-0
              "
            >
              <p
                className="
                  text-xs
                  min-[500px]:text-sm
                  font-semibold
                  text-white
                "
              >
                {currentPost.likesCount}{" "}
                {currentPost.likesCount === 1
                  ? "like"
                  : "likes"}
              </p>

              <p
                className="
                  mt-0.5
                  text-[9px]
                  min-[500px]:text-[10px]
                  uppercase
                  tracking-wider
                  text-zinc-600
                "
              >
                {new Date(
                  currentPost.createdAt
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

            {/* INPUT */}
            <div
              className="
                shrink-0
                bg-zinc-950
              "
            >
              <CommentInput
                postId={currentPost._id}
                queryKey={[
                  "comments",
                  currentPost._id,
                ]}
              />
            </div>

          </div>
        </div>
      </div>

      {/* DELETE DIALOG */}
      <DeletePostDialog
        isOpen={showDeleteDialog}
        post={currentPost}
        onClose={() =>
          setShowDeleteDialog(false)
        }
        onDeleted={() => {
          setShowDeleteDialog(false);
          onClose();
        }}
      />
    </>
  );
};

export default PostModal;