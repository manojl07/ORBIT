import ButtonSpinner from "../ui/ButtonSpinner";
import useProfileNavigation from "../../hooks/useProfileNavigation";

// Convert a timestamp to a compact Instagram-style label.
const formatRelativeTime = (dateValue) => {
  if (!dateValue) return "";

  const timestamp = new Date(dateValue).getTime();

  if (Number.isNaN(timestamp)) return "";

  const elapsedSeconds = Math.max(
    0,
    Math.floor((Date.now() - timestamp) / 1000)
  );

  if (elapsedSeconds < 60) return "now";

  const minutes = Math.floor(elapsedSeconds / 60);
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;

  const years = Math.floor(days / 365);
  return `${years}y`;
};

const CommentItem = ({
  comment,
  currentUserId,
  onDelete,
  deleting = false,
  deleteDisabled = false,
}) => {
  const goToProfile = useProfileNavigation();

  const commentUserId =
    comment.user?._id ?? comment.user?.id;

  const isCommentOwner =
    Boolean(currentUserId && commentUserId) &&
    String(commentUserId) === String(currentUserId);

  const handleProfileClick = () => {
    if (!commentUserId) return;

    goToProfile(commentUserId);
  };

  const timestamp = formatRelativeTime(comment.createdAt);

  return (
    <article className="flex min-w-0 items-start gap-3 py-3">
      {/* AVATAR */}
      <button
        type="button"
        onClick={handleProfileClick}
        aria-label={`View ${comment.user?.username ?? "user"} profile`}
        className="h-8 w-8 shrink-0 overflow-hidden rounded-full"
      >
        <img
          src={comment.user?.profileImg}
          alt=""
          className="h-full w-full object-cover"
        />
      </button>

      {/* COMMENT CONTENT */}
      <div className="min-w-0 flex-1">
        <p className="break-words text-[13px] leading-[18px] text-zinc-300">
          <button
            type="button"
            onClick={handleProfileClick}
            className="mr-1 font-semibold text-white hover:text-zinc-300"
          >
            {comment.user?.username}
          </button>
          <span className="font-medium text-white">:</span>{" "}
          <span>{comment.content}</span>
        </p>

        {/* TIMESTAMP */}
        {timestamp && (
          <time
            dateTime={
              comment.createdAt
                ? new Date(comment.createdAt).toISOString()
                : undefined
            }
            className="mt-1 block text-[11px] text-zinc-500"
          >
            {timestamp}
          </time>
        )}
      </div>

      {/* DELETE ACTION — ONLY THIS COMMENT SHOWS LOADING */}
      {isCommentOwner && (
        <button
          type="button"
          onClick={() => onDelete(comment.id)}
          disabled={deleteDisabled}
          aria-label={
            deleting ? "Deleting comment" : "Delete comment"
          }
          className="flex shrink-0 items-center gap-1.5 pt-0.5 text-xs text-red-500 transition hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {deleting ? (
            <>
              <ButtonSpinner size={13} />
              <span>Deleting...</span>
            </>
          ) : (
            "Delete"
          )}
        </button>
      )}
    </article>
  );
};

export default CommentItem;