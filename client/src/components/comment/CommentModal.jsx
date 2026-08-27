import React, { useEffect } from "react";

import CommentList from "./CommentList";
import CommentInput from "./CommentInput";

const CommentModal = ({
  isOpen,
  onClose,
  post,
}) => {

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

  if (!isOpen || !post) {
    return null;
  }

  const postId =
    post._id ??
    post.id;

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose} >

      <div onClick={(event) => event.stopPropagation() }
        className="w-full max-w-lg max-h-[85dvh] flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden" >

        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 shrink-0" >
          <h2 className="text-white font-semibold">Comments</h2>

          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-white transition" > ✕ </button>
        </div>


        {/* COMMENT LIST */}

        <div
          className="
            flex-1
            min-h-0
            overflow-y-auto
          "
        >
          <CommentList
            postId={postId}
            queryKey={[
              "comments",
              postId,
            ]}
          />
        </div>


        {/* COMMENT INPUT */}

        <CommentInput
          postId={postId}
          queryKey={[
            "comments",
            postId,
          ]}
        />

      </div>

    </div>
  );
};

export default CommentModal;