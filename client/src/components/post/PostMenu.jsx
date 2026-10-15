import { useEffect, useRef, useState } from "react";
import {
  Bookmark,
  MoreHorizontal,
  Trash2,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import useSavePost from "../../hooks/useSavePost";

const PostMenu = ({ post, onDeleteClick }) => {
  const [showMenu, setShowMenu] = useState(false);

  const menuRef = useRef(null);
  const { user } = useAuth();

  const {
    toggleSaved,
    isPending: isSavePending,
    isSaved,
  } = useSavePost({ post });

  const ownerId = post?.user?._id ?? post?.user?.id;
  const currentUserId = user?.id ?? user?._id;

  const isOwner =
    Boolean(currentUserId) &&
    String(ownerId ?? "") === String(currentUserId);

  // Close the delete menu when clicking outside or pressing Escape.
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

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showMenu]);

  if (!post) return null;

  const handleSaveClick = (event) => {
    event.stopPropagation();
    toggleSaved();
  };

  const handleDeleteClick = (event) => {
    event.stopPropagation();
    setShowMenu(false);
    onDeleteClick?.();
  };

  return (
    <div className="relative ml-auto flex items-center gap-1">
      {/* DIRECT SAVE / UNSAVE BUTTON */}

      <button
        type="button"
        onClick={handleSaveClick}
        disabled={isSavePending}
        aria-label={
          isSaved ? "Remove post from saved" : "Save post"
        }
        aria-pressed={isSaved}
        title={
          isSaved ? "Remove from saved" : "Save post"
        }
        className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-800 hover:text-white disabled:cursor-wait disabled:opacity-50"
      >
        <Bookmark
          size={20}
          className={isSaved ? "fill-current text-white" : ""}
        />
      </button>

      {/* DELETE MENU — OWNER ONLY */}

      {isOwner && (
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setShowMenu((previous) => !previous);
            }}
            aria-label="Post options"
            aria-expanded={showMenu}
            className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
          >
            <MoreHorizontal size={21} />
          </button>

          {showMenu && (
            <div
              onClick={(event) => event.stopPropagation()}
              className="absolute right-0 top-10 z-[100] w-52 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl"
              role="menu"
            >
              <button
                type="button"
                role="menuitem"
                onClick={handleDeleteClick}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-red-500 transition hover:bg-zinc-800"
              >
                <Trash2 size={17} />
                <span>Delete post</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PostMenu;