const CommentItem = ({
  comment,
  currentUserId,
  onDelete,
  deleting,
}) => {

  return (
    <div className="flex gap-3 mb-5">

      <img
        src={comment.user.profileImg}
        alt=""
        className="w-9 h-9 rounded-full object-cover"
      />

      <div className="flex-1">

        <p className="text-white font-semibold text-sm">
          {comment.user.username}
        </p>

        <p className="text-zinc-300 text-sm break-words">
          {comment.content}
        </p>

      </div>

      {comment.user.id === currentUserId && (
        <button
          onClick={() => onDelete(comment.id)}
          disabled={deleting}
          className="
            text-red-500
            text-xs
            hover:text-red-400
          "
        >
          Delete
        </button>
      )}

    </div>
  );
};

export default CommentItem;