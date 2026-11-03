
const formatMessageTime = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const MessageBubble = ({
  message,
  otherUser,
  onRetry,
  isSeen = false,
}) => {
  const senderId =
    typeof message.sender === "object"
      ? message.sender?._id
      : message.sender;

  const isReceived =
    String(senderId) === String(otherUser?._id);

  const isDeleted = Boolean(message.deletedAt);
  const isFailed = message.status === "failed";
  const isSending = message.status === "sending";

  // Seen is only displayed for persisted outgoing messages.
  const showSeen =
    !isReceived &&
    isSeen &&
    !isSending &&
    !isFailed &&
    !isDeleted;

  return (
    <div
      className={`flex w-full ${isReceived ? "justify-start" : "justify-end"
        }`}
    >
      <div
        className={`flex max-w-[85%] flex-col sm:max-w-[70%] ${isReceived ? "items-start" : "items-end"
          }`}
      >
        {/* MESSAGE BUBBLE */}
        <div
          className={`
            rounded-2xl px-4 py-2.5
            ${isReceived
              ? "rounded-bl-md border border-zinc-800 bg-zinc-900 text-zinc-100"
              : "rounded-br-md bg-white text-black"
            }
            ${isFailed ? "border border-red-500/50" : ""}
          `}
        >
          <p className="break-words whitespace-pre-wrap text-sm leading-5">
            {isDeleted
              ? "This message was deleted"
              : message.text}
          </p>

          {/* MESSAGE METADATA */}
          <div className="mt-1 flex items-center justify-end gap-2 text-[10px]">
            {isFailed ? (
              <>
                <span className="text-red-400">
                  Failed to send
                </span>

                <button
                  type="button"
                  onClick={() => onRetry?.(message)}
                  className="font-semibold text-red-400 underline hover:text-red-300"
                >
                  Retry
                </button>
              </>
            ) : (
              <>
                <span
                  className={
                    isReceived
                      ? "text-zinc-500"
                      : "text-zinc-500"
                  }
                >
                  {isSending
                    ? "Sending..."
                    : formatMessageTime(message.createdAt)}
                </span>

                {message.editedAt && !isDeleted && (
                  <span className="text-zinc-500">
                    Edited
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* READ RECEIPT */}
        {showSeen && (
          <span
            className="mt-1 px-1 text-[10px] font-medium text-zinc-400"
            aria-label="Seen"
          >
            Seen
          </span>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
