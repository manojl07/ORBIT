import React, { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";

import PostHeader from "./PostHeader";
import PostActions from "./PostActions";

import CommentList from "../comment/CommentList";
import CommentInput from "../comment/CommentInput";

const PostModal = ({ isOpen, onClose, post, }) => {

  const queryClient = useQueryClient();
  const { user } = useAuth();

  const userPosts = queryClient.getQueryData(["user-posts", user?.id])
  const feedPosts = queryClient.getQueryData(["feed"])
  const getPostId = (post) => post?._id ?? post?.id;

  const currentPost = post
    ? userPosts?.data?.posts?.find((p) => getPostId(p) === getPostId(post))
    || feedPosts?.data?.posts?.find((p) => getPostId(p) === getPostId(post))
    || post : null;


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
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !currentPost) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-0 min-[1000px]:p-6" onClick={onClose}>
      {/* =========================================
          MODAL
      ========================================== */}
      <div onClick={(e) => e.stopPropagation()} className="relative w-full h-dvh bg-zinc-950 overflow-hidden flex flex-col min-[1000px]:grid min-[1000px]:grid-cols-[1.6fr_1fr] min-[1000px]:w-full min-[1000px]:max-w-6xl min-[1000px]:h-[92vh] min-[1000px]:rounded-2xl min-[1000px]:border min-[1000px]:border-zinc-800">
        {/* =========================================
            CLOSE BUTTON
        ========================================== */}
        <button type="button" onClick={onClose} aria-label="Close post"
          className="absolute top-2 right-2 min-[500px]:top-3 min-[500px]:right-3 min-[1000px]:top-4 min-[1000px]:right-4 z-50 w-8 h-8 min-[500px]:w-9 min-[500px]:h-9 min-[1000px]:w-10 min-[1000px]:h-10 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-md text-white text-sm min-[500px]:text-base hover:bg-black/80 transition">✕</button>

        {/* =========================================
            IMAGE
            MOBILE:
            fixed height
            DESKTOP:
            fills left column
        ========================================== */}
        <div className="w-full h-[40dvh] min-[500px]:h-[42dvh] bg-black flex items-center justify-center overflow-hidden shrink-0 min-[1000px]:h-full min-[1000px]:shrink">

          <img src={currentPost.imageUrl} alt={currentPost.caption || "Post"} className="w-full h-full object-contain" />

        </div>


        {/* =========================================
            DETAILS
            MOBILE:
            remaining viewport height
            DESKTOP:
            full column height
        ========================================== */}
        <div className="min-h-0 flex-1 bg-zinc-950 flex flex-col overflow-hidden min-[1000px]:h-full">
          {/* =====================================
              HEADER
          ====================================== */}
          <div className="shrink-0">
            <PostHeader post={currentPost} />
          </div>

          {/* =====================================
              CAPTION
          ====================================== */}
          {currentPost.caption && (
            <div className="px-3 py-2 min-[500px]:px-4 min-[500px]:py-3 min-[1000px]:px-5 min-[1000px]:py-4 border-b border-zinc-800 shrink-0">

              <div className="flex gap-2 min-[500px]:gap-3">

                <img src={currentPost.user?.profileImg} alt={currentPost.user?.username || ""} className="w-7 h-7 min-[500px]:w-8 min-[500px]:h-8 rounded-full object-cover shrink-0" />

                <p className="text-xs leading-4 min-[500px]:text-sm min-[500px]:leading-5 text-zinc-300">

                  <span className="font-semibold text-white mr-1.5">{currentPost.user?.username}</span>
                  {currentPost.caption}
                </p>

              </div>

            </div>
          )}


          {/* =====================================
              COMMENTS

              ONLY THIS AREA SCROLLS
          ====================================== */}
          <div className="instagram-scroll flex-1 min-h-0 overflow-y-auto">
            <CommentList postId={currentPost._id} queryKey={["comments", currentPost._id,]} />
          </div>


          {/* =====================================
              ACTIONS
          ====================================== */}

          <div className="px-3 py-2 min-[500px]:px-4 min-[500px]:py-2.5 min-[1000px]:px-5 min-[1000px]:py-3 border-t border-zinc-800 shrink-0">
            <PostActions post={currentPost} queryKey={["user-posts", currentPost.user?._id || currentPost.user?.id,]} />
          </div>


          {/* =====================================
              META
          ====================================== */}
          <div className="px-3 py-2 min-[500px]:px-4 min-[500px]:py-2.5 min-[1000px]:px-5 min-[1000px]:py-3 shrink-0">
            <p className="text-xs min-[500px]:text-sm font-semibold text-white">
              {currentPost.likesCount}{" "}
              {currentPost.likesCount === 1
                ? "like"
                : "likes"}
            </p>

            <p className="mt-0.5 text-[9px] min-[500px]:text-[10px] uppercase tracking-wider text-zinc-600">
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


          {/* =====================================
              COMMENT INPUT
              ALWAYS VISIBLE
          ====================================== */}
          <div className="shrink-0 bg-zinc-950">
            <CommentInput postId={currentPost._id} queryKey={["comments", currentPost._id,]} />
          </div>

        </div>

      </div>

    </div>
  );
};

export default PostModal;