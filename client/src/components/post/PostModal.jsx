import React, { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";

import PostHeader from "./PostHeader";
import PostActions from "./PostActions";
import CommentList from "../comment/CommentList";
import CommentInput from "../comment/CommentInput";
import DeletePostDialog from "./DeletePostDialog";

/* =====================================================
   GET POSTS FROM NORMAL OR INFINITE QUERY DATA
===================================================== */

const getPostsFromQueryData = (queryData) => {
  if (Array.isArray(queryData?.pages)) {
    return queryData.pages.flatMap(
      (page) => page?.data?.posts ?? []
    );
  }

  return queryData?.data?.posts ?? queryData?.posts ?? [];
};

/* =====================================================
   POST MODAL
===================================================== */

const PostModal = ({ isOpen, onClose, post }) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [showDeleteDialog, setShowDeleteDialog] =
    useState(false);

  const getPostId = (value) => value?._id ?? value?.id;

  const selectedPostId = getPostId(post);

  const currentUserId = user?.id ?? user?._id;

  /*
   * Search every cached query matching a key.
   * Infinite queries store posts inside data.pages,
   * not directly inside data.posts.
   */
  const findCachedPost = (queryKey) => {
    if (!selectedPostId) return null;

    const cachedQueries = queryClient.getQueriesData({
      queryKey,
    });

    for (const [, queryData] of cachedQueries) {
      const matchingPost = getPostsFromQueryData(
        queryData
      ).find(
        (cachedPost) =>
          String(getPostId(cachedPost)) ===
          String(selectedPostId)
      );

      if (matchingPost) {
        return matchingPost;
      }
    }

    return null;
  };

  /*
   * Prefer the latest cached version of the selected post.
   * Saved posts are checked first because this modal can
   * be opened from the Saved Posts page.
   */
  const cachedPost =
    findCachedPost(["saved-posts"]) ||
    findCachedPost(["feed"]) ||
    findCachedPost(["user-posts"]);

  const currentPost = post
    ? { ...post, ...(cachedPost ?? {}) }
    : null;

  const ownerId =
    currentPost?.user?._id ?? currentPost?.user?.id;

  const isOwner =
    Boolean(currentUserId) &&
    String(ownerId ?? "") === String(currentUserId);

  /* =====================================================
     LOCK BODY SCROLL AND HANDLE ESCAPE
  ===================================================== */

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [isOpen, onClose]);

  // Reset the delete confirmation when the modal closes.
  useEffect(() => {
    if (!isOpen) {
      setShowDeleteDialog(false);
    }
  }, [isOpen]);

  if (!isOpen || !currentPost) {
    return null;
  }

  const postId = getPostId(currentPost);

  const profileUserId =
    currentPost.user?._id ?? currentPost.user?.id;

  return (
    <>
      {/* MODAL BACKDROP */}

      <div
        className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 p-0 min-[1000px]:p-6"
        onClick={onClose}
      >
        {/* MODAL CONTENT */}

        <div
          onClick={(event) => event.stopPropagation()}
          className="relative flex h-dvh w-full flex-col overflow-hidden bg-zinc-950 min-[1000px]:grid min-[1000px]:h-[92vh] min-[1000px]:max-w-6xl min-[1000px]:grid-cols-[1.6fr_1fr] min-[1000px]:rounded-2xl min-[1000px]:border min-[1000px]:border-zinc-800"
          role="dialog"
          aria-modal="true"
          aria-label="Post details"
        >
          {/* IMAGE */}

          <div className="flex h-[40dvh] w-full shrink-0 items-center justify-center overflow-hidden bg-black min-[500px]:h-[42dvh] min-[1000px]:h-full min-[1000px]:shrink">
            <img
              src={currentPost.imageUrl}
              alt={currentPost.caption || "Post"}
              className="h-full w-full object-contain"
            />
          </div>

          {/* DETAILS */}

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-zinc-950 min-[1000px]:h-full">
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
              <div className="shrink-0 border-b border-zinc-800 px-3 py-2 min-[500px]:px-4 min-[500px]:py-3 min-[1000px]:px-5 min-[1000px]:py-4">
                <div className="flex gap-2 min-[500px]:gap-3">
                  {currentPost.user?.profileImg && (
                    <img
                      src={currentPost.user.profileImg}
                      alt={
                        currentPost.user?.username || ""
                      }
                      className="h-7 w-7 shrink-0 rounded-full object-cover min-[500px]:h-8 min-[500px]:w-8"
                    />
                  )}

                  <p className="text-xs leading-4 text-zinc-300 min-[500px]:text-sm min-[500px]:leading-5">
                    <span className="mr-1.5 font-semibold text-white">
                      {currentPost.user?.username}
                    </span>

                    {currentPost.caption}
                  </p>
                </div>
              </div>
            )}

            {/* COMMENTS */}

            <div className="instagram-scroll min-h-0 flex-1 overflow-y-auto">
              <CommentList
                postId={postId}
                queryKey={["comments", postId]}
              />
            </div>

            {/* LIKE ACTIONS */}

            <div className="shrink-0 border-t border-zinc-800 px-3 py-2 min-[500px]:px-4 min-[500px]:py-2.5 min-[1000px]:px-5 min-[1000px]:py-3">
              <PostActions
                post={currentPost}
                queryKey={[
                  "user-posts",
                  profileUserId,
                ]}
              />
            </div>

            {/* POST METADATA */}

            <div className="shrink-0 px-3 py-2 min-[500px]:px-4 min-[500px]:py-2.5 min-[1000px]:px-5 min-[1000px]:py-3">
              <p className="text-xs font-semibold text-white min-[500px]:text-sm">
                {currentPost.likesCount ?? 0}{" "}
                {currentPost.likesCount === 1
                  ? "like"
                  : "likes"}
              </p>

              {currentPost.createdAt && (
                <p className="mt-0.5 text-[9px] uppercase tracking-wider text-zinc-600 min-[500px]:text-[10px]">
                  {new Date(
                    currentPost.createdAt
                  ).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>

            {/* COMMENT INPUT */}

            <div className="shrink-0 bg-zinc-950">
              <CommentInput
                postId={postId}
                queryKey={["comments", postId]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* DELETE CONFIRMATION */}

      <DeletePostDialog
        isOpen={showDeleteDialog}
        post={currentPost}
        onClose={() => setShowDeleteDialog(false)}
        onDeleted={() => {
          setShowDeleteDialog(false);
          onClose();
        }}
      />
    </>
  );
};

export default PostModal;