import useFollow from "../../hooks/useFollow";

const FollowTextButton = ({ user }) => {
  const {
    isFollowing,
    toggleFollow,
    isPending,
  } = useFollow(user);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        toggleFollow();
      }}
      disabled={isPending}
      className={`
        text-sm
        font-semibold
        transition
        disabled:opacity-60
        ${
          isFollowing
            ? "text-zinc-400 hover:text-red-500"
            : "text-blue-500 hover:text-blue-400"
        }
      `}
    >
      {isPending
        ? "..."
        : isFollowing
        ? "Following"
        : "Follow"}
    </button>
  );
};

export default FollowTextButton;