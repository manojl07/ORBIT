
const formatConversationTime = (date) => {
  if (!date) return "";

  const messageDate = new Date(date);

  if (Number.isNaN(messageDate.getTime())) return "";

  const now = new Date();

  const isToday =
    messageDate.toDateString() === now.toDateString();

  if (isToday) {
    return messageDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (messageDate.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return messageDate.toLocaleDateString([], {
    day: "numeric",
    month: "short",
  });
};

const ConversationItem = ({
  conversation,
  active,
  onClick,
}) => {
  const otherUser = conversation.otherUser;

  const unreadCount = conversation.unreadCount ?? 0;

  const lastMessage = conversation.lastMessage;

  const preview = lastMessage?.text || "Start a conversation";

  const time = formatConversationTime(
    conversation.lastMessageAt
  );

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex w-full items-center gap-3 px-4 py-3.5
        text-left transition-colors
        ${
          active
            ? "bg-zinc-900"
            : "hover:bg-zinc-900/60"
        }
      `}
    >
      {/* AVATAR */}
      <div className="relative shrink-0">
        <img
          src={otherUser?.profileImg}
          alt={otherUser?.username || "User"}
          className="h-12 w-12 rounded-full border border-zinc-800 bg-zinc-900 object-cover"
        />

        {otherUser?.isVerified && (
          <span className="absolute -right-0.5 -bottom-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-black bg-blue-500 text-[9px] font-bold text-white">
            ✓
          </span>
        )}
      </div>

      {/* MESSAGE DETAILS */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`truncate text-sm ${
              unreadCount > 0
                ? "font-bold text-white"
                : "font-semibold text-zinc-200"
            }`}
          >
            {otherUser?.username || "Unknown user"}
          </span>

          <span className="shrink-0 text-[10px] text-zinc-500">
            {time}
          </span>
        </div>

        <div className="mt-1">
          <p
            className={`truncate text-xs ${
              unreadCount > 0
                ? "font-medium text-zinc-200"
                : "text-zinc-500"
            }`}
          >
            {preview}
          </p>
        </div>
      </div>

      {/* UNREAD BADGE */}
      {unreadCount > 0 && (
        <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-white px-1.5 text-[10px] font-bold text-black">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
};

export default ConversationItem;
