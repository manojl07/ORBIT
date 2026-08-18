import React from "react";

import useDeletePost
  from "../../hooks/useDeletePost";


const DeletePostDialog = ({
  isOpen,
  onClose,
  post,
  onDeleted,
}) => {

  const {
    deletePost,
    isDeleting,
  } = useDeletePost({
    post,
    onSuccess: onDeleted,
  });


  if (!isOpen || !post) {
    return null;
  }


  return (
    <div
      className="
        fixed
        inset-0

        z-[100]

        bg-black/70
        backdrop-blur-sm

        flex
        items-center
        justify-center

        p-4
      "
      onClick={onClose}
    >

      <div
        className="
          w-full
          max-w-sm

          rounded-2xl

          bg-zinc-900

          border
          border-zinc-800

          shadow-2xl

          overflow-hidden
        "
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        {/* CONTENT */}

        <div className="p-6">

          <h2
            className="
              text-white
              text-lg
              font-semibold
            "
          >
            Delete Post
          </h2>

          <p
            className="
              text-zinc-400
              text-sm
              mt-2
              leading-5
            "
          >
            Are you sure you want to permanently
            delete this post?
          </p>

        </div>


        {/* ACTIONS */}

        <div
          className="
            border-t
            border-zinc-800
          "
        >

          <button
            type="button"
            disabled={isDeleting}
            onClick={deletePost}
            className="
              w-full
              py-4

              text-red-500
              font-semibold
              text-sm

              hover:bg-zinc-800

              transition

              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            {isDeleting
              ? "Deleting..."
              : "Delete"}
          </button>


          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="
              w-full
              py-4

              text-white
              text-sm

              border-t
              border-zinc-800

              hover:bg-zinc-800

              transition

              disabled:opacity-50
            "
          >
            Cancel
          </button>

        </div>

      </div>

    </div>
  );
};


export default DeletePostDialog;