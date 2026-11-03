import {
  useEffect,
  useMemo,
  useRef,
  useLayoutEffect,
  useCallback,
  useState,
} from "react";

import {
  ArrowLeft,
  MoreHorizontal,
  Phone,
  Video,
} from "lucide-react";

import { useQueryClient } from "@tanstack/react-query";

import useMessages from "../../hooks/useMessages";
import useSendMessage from "../../hooks/useSendMessage";
import { useAuth } from "../../hooks/useAuth";
import { useSocket } from "../../context/SocketContext";
import { queryKeys } from "../../constants/queryKey";

import MessageBubble from "./MessageBubble";
import MessageComposer from "./MessageComposer";

import useActiveConversationRead from "../../hooks/useActiveConversationRead";

const NEAR_BOTTOM_THRESHOLD = 120;

const ChatWindow = ({ conversation, onBack }) => {
  const otherUser = conversation.otherUser;

  const socket = useSocket();
  const queryClient = useQueryClient();

  const { user } = useAuth();

  const [typingUser, setTypingUser] = useState(null);
  const typingTimeoutRef = useRef(null);

  const handleTypingStart = useCallback(() => {
    console.log("[TYPING] Emitting typing:start", conversation._id);

    if (!socket.connected) {
      console.log("[TYPING] Socket disconnected");
      return;
    }

    socket.emit(
      "typing:start",
      { conversationId: conversation._id },
      (response) => {
        console.log("[TYPING] Start acknowledgement:", response);
      }
    );
  }, [socket, conversation._id]);

  const handleTypingStop = useCallback(() => {
    console.log("[TYPING] Emitting typing:stop", conversation._id);

    if (!socket.connected) return;

    socket.emit(
      "typing:stop",
      { conversationId: conversation._id },
      (response) => {
        console.log("[TYPING] Stop acknowledgement:", response);
      }
    );
  }, [socket, conversation._id]);

  useEffect(() => {
    const conversationId = String(conversation._id);
    const currentUserId = String(user?.id || user?._id);

    const clearTypingTimeout = () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    };

    console.log("[TYPING] Listener mounted:", { socketId: socket.id, connected: socket.connected, conversationId, currentUserId, });

    const handleTypingUpdate = (payload) => {
      if (String(payload?.conversationId) !== conversationId || String(payload?.userId) === currentUserId) {
        console.log("[TYPING] Event ignored by filter");
        return;
      }

      clearTypingTimeout();

      if (!payload?.isTyping) {
        setTypingUser(null);
        return;
      }

      setTypingUser(payload.username || otherUser?.username || "Someone");

      // Safety fallback if a stop event is missed.
      typingTimeoutRef.current = setTimeout(() => {
        setTypingUser(null);
      }, 6000);
    };

    const handleDisconnect = () => {
      console.log("[TYPING] Socket disconnected");
      clearTypingTimeout();
      setTypingUser(null);
    };

    socket.on("typing:update", handleTypingUpdate);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("typing:update", handleTypingUpdate);
      socket.off("disconnect", handleDisconnect);

      clearTypingTimeout();
      setTypingUser(null);
    };
  }, [socket, conversation._id, user, otherUser?.username]);

  // Scroll container and initial positioning.
  const messagesContainerRef = useRef(null);
  const didInitialScrollRef = useRef(false);

  // Tracks whether the user is already near the bottom.
  const isNearBottomRef = useRef(true);

  /*
   * ========================================
   * REGISTER ACTIVE CONVERSATION
   * ========================================
   */

  useEffect(() => {
    const activeConversationKey = ["activeConversationId"];
    const activeId = String(conversation._id);

    queryClient.setQueryData(
      activeConversationKey,
      activeId
    );

    return () => {
      const currentActiveId = queryClient.getQueryData(
        activeConversationKey
      );

      if (currentActiveId === activeId) {
        queryClient.setQueryData(
          activeConversationKey,
          null
        );
      }
    };
  }, [conversation._id, queryClient]);

  /*
   * ========================================
   * FETCH MESSAGES
   * ========================================
   */

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMessages(conversation._id);

  const sendMessage = useSendMessage(user);

  const messages = useMemo(() => {
    const allMessages =
      data?.pages?.flatMap(
        (page) => page?.messages ?? []
      ) ?? [];

    const uniqueMessages = Array.from(
      new Map(
        allMessages.map((message) => [
          message.clientMessageId || message._id,
          message,
        ])
      ).values()
    );

    return uniqueMessages.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime()
    );
  }, [data]);

  const lastMessage = messages[messages.length - 1];

  const latestMessage = lastMessage;

  /*
   * ========================================
   * AUTOMATIC READ RECEIPTS
   * ========================================
   */

  useActiveConversationRead({
    conversationId: conversation._id,
    messageId: latestMessage?._id,
    enabled: !isLoading && !isError,
  });

  /*
   * ========================================
   * READ RECEIPT — SEEN INDICATOR
   * ========================================
   */

  const otherParticipant = conversation.participants?.find(
    (participant) => {
      const participantId =
        participant.user?._id || participant.user;

      return String(participantId) === String(otherUser?._id);
    }
  );

  const readMarker =
    otherParticipant?.lastReadMessage?._id ||
    otherParticipant?.lastReadMessage ||
    null;

  const readMarkerIndex = messages.findIndex(
    (message) =>
      String(message._id) === String(readMarker)
  );

  let seenMessageId = null;

  if (readMarkerIndex !== -1) {
    for (let i = readMarkerIndex; i >= 0; i--) {
      const message = messages[i];

      const senderId =
        message.sender?._id || message.sender;

      if (
        String(senderId) ===
        String(user?.id || user?._id) &&
        message.status !== "failed" &&
        !String(message._id).startsWith("optimistic-")
      ) {
        seenMessageId = message._id;
        break;
      }
    }
  }

  /*
   * ========================================
   * CHAT SCROLL HANDLING
   * ========================================
   */

  // Track whether the user is near the bottom.
  const handleMessagesScroll = () => {
    const container = messagesContainerRef.current;

    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight -
      container.scrollTop -
      container.clientHeight;

    isNearBottomRef.current =
      distanceFromBottom <= NEAR_BOTTOM_THRESHOLD;
  };

  /*
   * Initial opening:
   * Jump directly to the latest message before paint.
   *
   * Subsequent messages:
   * Auto-scroll only if the user was already near
   * the bottom before the new message arrived.
   */
  useLayoutEffect(() => {
    if (isLoading || isError) return;

    const container = messagesContainerRef.current;

    if (!container) return;

    // First time opening this conversation.
    if (!didInitialScrollRef.current) {
      container.scrollTop = container.scrollHeight;

      didInitialScrollRef.current = true;
      isNearBottomRef.current = true;

      return;
    }

    // A new message arrived or was sent.
    // Don't interrupt users reading older messages.
    if (isNearBottomRef.current) {
      container.scrollTop = container.scrollHeight;
    }
  }, [isLoading, isError, lastMessage?._id]);

  /*
   * ========================================
   * JOIN CONVERSATION + LISTEN FOR MESSAGES
   * ========================================
   */

  useEffect(() => {
    const conversationId = conversation._id;

    const joinConversation = () => {
      socket.emit("conversation:join", {
        conversationId,
      });
    };

    const handleNewMessage = (payload) => {
      const incomingMessage = payload?.message ?? payload;

      if (
        !incomingMessage ||
        String(incomingMessage.conversation) !==
        String(conversationId)
      ) {
        return;
      }

      const messageKey = queryKeys.messages(conversationId);

      queryClient.setQueryData(messageKey, (old) => {
        if (!old?.pages?.length) return old;

        const alreadyExists = old.pages.some((page) =>
          page.messages?.some(
            (message) =>
              String(message._id) ===
              String(incomingMessage._id) ||
              (
                incomingMessage.clientMessageId &&
                message.clientMessageId ===
                incomingMessage.clientMessageId
              )
          )
        );

        if (alreadyExists) {
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              messages: (page.messages ?? []).map(
                (message) => {
                  const isMatch =
                    String(message._id) ===
                    String(incomingMessage._id) ||
                    (
                      incomingMessage.clientMessageId &&
                      message.clientMessageId ===
                      incomingMessage.clientMessageId
                    );

                  return isMatch
                    ? incomingMessage
                    : message;
                }
              ),
            })),
          };
        }

        const pages = [...old.pages];

        pages[0] = {
          ...pages[0],
          messages: [
            ...(pages[0].messages ?? []),
            incomingMessage,
          ],
        };

        return {
          ...old,
          pages,
        };
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations,
      });
    };

    socket.on("message:new", handleNewMessage);
    socket.on("connect", joinConversation);

    if (socket.connected) {
      joinConversation();
    }

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("connect", joinConversation);

      if (socket.connected) {
        socket.emit("conversation:leave", {
          conversationId,
        });
      }
    };
  }, [conversation._id, socket, queryClient]);

  /*
   * ========================================
   * SEND MESSAGE
   * ========================================
   */

  const handleSendMessage = (text) => {
    const clientMessageId = crypto.randomUUID();

    sendMessage.mutate({
      conversationId: conversation._id,
      clientMessageId,
      text,
    });
  };

  /*
   * ========================================
   * RETRY FAILED MESSAGE
   * ========================================
   */

  const handleRetryMessage = (message) => {
    sendMessage.mutate({
      conversationId: conversation._id,
      clientMessageId: message.clientMessageId,
      text: message.text,
    });
  };

  /*
   * ========================================
   * RENDER
   * ========================================
   */

  return (
    <div className="flex h-full min-w-0 flex-col bg-black">

      {/* CHAT HEADER */}
      <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-zinc-800 px-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to conversations"
            className="rounded-full p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white md:hidden"
          >
            <ArrowLeft size={21} />
          </button>

          <img
            src={otherUser?.profileImg}
            alt={otherUser?.username || "User"}
            className="h-10 w-10 shrink-0 rounded-full border border-zinc-800 object-cover"
          />

          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-white">
              {otherUser?.username || "Unknown user"}
            </h2>

            <div className="mt-0.5 h-4">
              {typingUser ? (
                <p className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <span>{typingUser} is typing</span>

                  <span className="flex items-center gap-0.5">
                    <span className="h-1 w-1 animate-bounce rounded-full bg-emerald-400 [animation-delay:-0.3s]" />
                    <span className="h-1 w-1 animate-bounce rounded-full bg-emerald-400 [animation-delay:-0.15s]" />
                    <span className="h-1 w-1 animate-bounce rounded-full bg-emerald-400" />
                  </span>
                </p>
              ) : (<p className="text-xs text-zinc-500">ORBIT conversation</p>)}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            aria-label="Voice call"
            disabled
            className="rounded-full p-2 text-zinc-500 opacity-50"
          >
            <Phone size={19} />
          </button>

          <button
            type="button"
            aria-label="Video call"
            disabled
            className="rounded-full p-2 text-zinc-500 opacity-50"
          >
            <Video size={20} />
          </button>

          <button
            type="button"
            aria-label="More options"
            className="rounded-full p-2 text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
          >
            <MoreHorizontal size={21} />
          </button>
        </div>
      </header>

      {/* MESSAGE HISTORY */}
      <div
        ref={messagesContainerRef}
        onScroll={handleMessagesScroll}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-5 sm:px-6"
      >
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />
          </div>
        ) : isError ? (
          <div className="flex flex-1 items-center justify-center text-sm text-zinc-500">
            Failed to load messages.
          </div>
        ) : (
          <>
            {hasNextPage && (
              <div className="mb-5 flex justify-center">
                <button
                  type="button"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="rounded-full border border-zinc-800 px-4 py-2 text-xs text-zinc-400 transition hover:bg-zinc-900 hover:text-white disabled:opacity-50"
                >
                  {isFetchingNextPage
                    ? "Loading..."
                    : "Load older messages"}
                </button>
              </div>
            )}

            {messages.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <img
                  src={otherUser?.profileImg}
                  alt=""
                  className="mb-4 h-14 w-14 rounded-full object-cover"
                />

                <h3 className="text-sm font-semibold text-white">
                  {otherUser?.username}
                </h3>

                <p className="mt-2 text-xs text-zinc-500">
                  This is the beginning of your conversation.
                </p>
              </div>
            ) : (
              <div className="mt-auto flex flex-col gap-3">
                {messages.map((message) => (
                  <MessageBubble
                    key={message.clientMessageId || message._id}
                    message={message}
                    otherUser={otherUser}
                    onRetry={handleRetryMessage}
                    isSeen={
                      String(message._id) ===
                      String(seenMessageId)
                    }
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* MESSAGE COMPOSER */}
      <div className="shrink-0 border-t border-zinc-800 p-3 sm:p-4">
        <MessageComposer
          onSend={handleSendMessage}
          onTypingStart={handleTypingStart}
          onTypingStop={handleTypingStop}
          isSending={sendMessage.isPending}
          disabled={
            isLoading ||
            isError ||
            !socket.connected
          }
        />

        {!socket.connected && (
          <p className="mt-2 text-center text-xs text-amber-500">
            Reconnecting to chat...
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
