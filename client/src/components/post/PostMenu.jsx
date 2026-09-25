import React, { useEffect, useRef, useState } from "react";
import {
  MoreHorizontal,
  Trash2,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";

const PostMenu = ({ post, onDeleteClick }) => {

  const [showMenu, setShowMenu] = useState(false);

  const menuRef = useRef(null);

  const { user } = useAuth();

  const ownerId =
    post?.user?._id ?? post?.user?.id;

  const currentUserId =
    user?.id ?? user?._id;

  const isOwner =
    String(ownerId ?? "") ===
    String(currentUserId ?? "");

  /* ========================================
     CLOSE MENU WHEN CLICKING OUTSIDE
  ======================================== */

  useEffect(() => {

    if (!showMenu) return;

    const handleOutsideClick = (event) => {

      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setShowMenu(false);
      }

    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {

      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

    };

  }, [showMenu]);


  if (!post || !isOwner) {
    return null;
  }


  const handleDeleteClick = () => {

    setShowMenu(false);

    onDeleteClick?.();

  };


  return (

    <div
      ref={menuRef}
      className="relative ml-auto"
    >

      {/* THREE DOT BUTTON */}

      <button
        type="button"
        onClick={(e) => {

          e.stopPropagation();

          setShowMenu(
            (prev) => !prev
          );

        }}
        className="
          flex
          items-center
          justify-center
          w-9
          h-9
          rounded-full
          text-zinc-400
          hover:text-white
          hover:bg-zinc-800
          transition
        "
        aria-label="Post options"
      >
        <MoreHorizontal size={21} />
      </button>


      {/* MENU */}

      {showMenu && (

        <div
          className="
            absolute
            right-0
            top-10
            z-100
            w-44
            rounded-xl
            bg-zinc-900
            border
            border-zinc-800
            shadow-2xl
            overflow-hidden
          "
        >

          <button
            type="button"
            onClick={handleDeleteClick}
            className="
              w-full
              flex
              items-center
              gap-3
              px-4
              py-3
              text-left
              text-sm
              font-medium
              text-red-500
              hover:bg-zinc-800
              transition
            "
          >
            <Trash2 size={17} />

            <span>
              Delete Post
            </span>

          </button>

        </div>

      )}

    </div>
  );
};

export default PostMenu;