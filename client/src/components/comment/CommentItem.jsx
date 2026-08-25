import ButtonSpinner from "../UI/ButtonSpinner";
import useProfileNavigation from "../../hooks/useProfileNavigation";

const CommentItem = ({
  comment,
  currentUserId,
  onDelete,
  deleting,
}) => {

  const goToProfile =
    useProfileNavigation();

  const commentUserId =
    comment.user?._id ??
    comment.user?.id;

  const handleProfileClick = () => {
    if (!commentUserId) {
      console.error(
        "CommentItem: profile user ID missing",
        comment.user
      );
      return;
    }

    goToProfile(commentUserId);
  };

  const isCommentOwner =
    String(commentUserId) ===
    String(currentUserId);

  return (
    <div className="flex items-start gap-3 py-3">

      {/* Avatar */}
      <img
        src={comment.user?.profileImg}
        alt={
          comment.user?.username ||
          ""
        }
        onClick={handleProfileClick}
        className="
          w-8
          h-8
          rounded-full
          object-cover
          cursor-pointer
          shrink-0
        "
      />

      {/* Content */}
      <div className="flex-1 min-w-0">

        {/* Username */}
        <p
          onClick={handleProfileClick}
          className="
            text-white
            font-semibold
            text-[13px]
            leading-4
            cursor-pointer
            hover:text-zinc-300
            transition
          "
        >
          {comment.user?.username}
        </p>

        {/* Comment */}
        <p
          className="
            text-zinc-300
            text-[13px]
            break-words
          "
        >
          {comment.content}
        </p>

      </div>

      {/* Delete */}
      {isCommentOwner && (
        <button
          type="button"
          onClick={() =>
            onDelete(comment.id)
          }
          disabled={deleting}
          className="
            flex
            items-center
            gap-2
            text-xs
            text-red-500
            hover:text-red-400
            disabled:opacity-50
            disabled:cursor-not-allowed
            transition
          "
        >
          {deleting ? (
            <>
              <ButtonSpinner size={14} />
              Deleting...
            </>
          ) : (
            "Delete"
          )}
        </button>
      )}

    </div>
  );
};

export default CommentItem;