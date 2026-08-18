import ButtonSpinner from "../UI/ButtonSpinner";

const CommentItem = ({
  comment,
  currentUserId,
  onDelete,
  deleting,
}) => {
  return (
    <div className="flex items-start gap-3 py-3">

      <img
        src={comment.user.profileImg}
        alt={comment.user.username}
        className="w-8 h-8 rounded-full object-cover shrink-0"
      />

      <div className="flex-1 min-w-0">

        <p className="text-white font-semibold text-[13px]">
          {comment.user.username}
        </p>

        <p className="text-zinc-300 text-[13px] wrap-break-word">
          {comment.content}
        </p>

      </div>

      {comment.user.id === currentUserId && (

        <button
          onClick={() => onDelete(comment.id)}
          disabled={deleting}
          className="flex items-center gap-2 text-xs text-red-500 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
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