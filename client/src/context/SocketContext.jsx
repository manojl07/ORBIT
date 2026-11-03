
import {
  createContext,
  useContext,
  useEffect,
} from "react";

import { useQueryClient } from "@tanstack/react-query";

import { socket } from "../socket/socket";
import { useAuth } from "../hooks/useAuth";
import { queryKeys } from "../constants/queryKey";

const SocketContext = createContext(null);

const getUserId = (user) =>
  String(user?.id || user?._id || "");

const getMessageSenderId = (message) =>
  String(message?.sender?._id || message?.sender || "");

const updateConversationPreview = (
  queryClient,
  conversationId,
  message,
  incrementUnread = false
) => {
  queryClient.setQueryData(
    queryKeys.conversations,
    (old) => {
      if (!Array.isArray(old)) return old;

      const updated = old.map((conversation) => {
        if (String(conversation._id) !== String(conversationId)) {
          return conversation;
        }

        return {
          ...conversation,
          lastMessage: {
            messageId: message._id,
            sender: getMessageSenderId(message),
            text: message.text,
            createdAt: message.createdAt,
          },
          lastMessageAt: message.createdAt,
          unreadCount: incrementUnread
            ? (conversation.unreadCount || 0) + 1
            : conversation.unreadCount,
        };
      });

      return updated.sort(
        (a, b) =>
          new Date(b.lastMessageAt || b.updatedAt).getTime() -
          new Date(a.lastMessageAt || a.updatedAt).getTime()
      );
    }
  );
};

const addMessageToCache = (
  queryClient,
  conversationId,
  message
) => {
  queryClient.setQueryData(
    queryKeys.messages(conversationId),
    (old) => {
      if (!old?.pages?.length) return old;

      const alreadyExists = old.pages.some((page) =>
        (page.messages || []).some((item) => {
          const sameId =
            String(item._id) === String(message._id);

          const sameClientId =
            message.clientMessageId &&
            item.clientMessageId === message.clientMessageId;

          return sameId || sameClientId;
        })
      );

      if (alreadyExists) {
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            messages: (page.messages || []).map((item) => {
              const sameId =
                String(item._id) === String(message._id);

              const sameClientId =
                message.clientMessageId &&
                item.clientMessageId === message.clientMessageId;

              return sameId || sameClientId ? message : item;
            }),
          })),
        };
      }

      const pages = [...old.pages];

      pages[0] = {
        ...pages[0],
        messages: [
          ...(pages[0].messages || []),
          message,
        ],
      };

      return {
        ...old,
        pages,
      };
    }
  );
};

const updateParticipantReadMarker = (
  queryClient,
  conversationId,
  readerId,
  messageId,
  currentUserId
) => {
  queryClient.setQueryData(
    queryKeys.conversations,
    (old) => {
      if (!Array.isArray(old)) return old;

      return old.map((conversation) => {
        if (String(conversation._id) !== String(conversationId)) {
          return conversation;
        }

        return {
          ...conversation,

          participants: (conversation.participants || []).map(
            (participant) => {
              const participantId =
                participant.user?._id || participant.user;

              if (String(participantId) !== String(readerId)) {
                return participant;
              }

              return {
                ...participant,
                lastReadMessage: messageId,
                unreadCount: String(readerId) === currentUserId
                  ? 0
                  : participant.unreadCount,
              };
            }
          ),

          // The conversation-level unreadCount belongs
          // to the currently authenticated user.
          unreadCount:
            String(readerId) === currentUserId
              ? 0
              : conversation.unreadCount,
        };
      });
    }
  );
};

export const SocketProvider = ({ children }) => {
  const { user, isAuthLoading } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isAuthLoading) return;

    if (!user) {
      if (socket.connected) {
        socket.disconnect();
      }
      return;
    }

    const currentUserId = getUserId(user);

    const handleConnect = () => {
      console.log("🔌 ORBIT Socket connected:", socket.id);
    };

    const handleReady = (payload) => {
      console.log("✅ ORBIT Socket authenticated:", payload);
    };

    const handleConnectError = (error) => {
      console.error(
        "❌ ORBIT Socket connection error:",
        error.message
      );
    };

    const handleDisconnect = (reason) => {
      console.log("🔌 ORBIT Socket disconnected:", reason);
    };

    const handleNewMessage = ({ message } = {}) => {
      if (!message) return;

      const conversationId = String(message.conversation);

      addMessageToCache(
        queryClient,
        conversationId,
        message
      );

      updateConversationPreview(
        queryClient,
        conversationId,
        message,
        false
      );
    };

    const handleConversationUpdated = ({
      conversationId,
      message,
    } = {}) => {
      if (!conversationId || !message) return;

      const isIncoming =
        getMessageSenderId(message) !== currentUserId;

      const activeConversationId = queryClient.getQueryData([
        "activeConversationId",
      ]);

      const isCurrentlyViewing =
        String(activeConversationId) === String(conversationId) &&
        document.visibilityState === "visible";

      // Don't show unread count when the user is
      // actively viewing this conversation.
      const shouldIncrementUnread =
        isIncoming && !isCurrentlyViewing;

      updateConversationPreview(
        queryClient,
        conversationId,
        message,
        shouldIncrementUnread
      );

      addMessageToCache(
        queryClient,
        String(conversationId),
        message
      );
    };

    /*
     * A participant marked messages as read.
     *
     * Update that participant's marker for both users.
     * Only clear the local unread count when the reader
     * is the currently authenticated user.
     */
    const handleConversationRead = ({
      conversationId,
      userId,
      messageId,
    } = {}) => {
      console.log("📖 conversation:read received:", { conversationId, userId, messageId, currentUserId, });


      if (!conversationId || !userId || !messageId) return;

      updateParticipantReadMarker(queryClient, conversationId, userId, messageId, currentUserId);
    };

    socket.on("connect", handleConnect);
    socket.on("socket:ready", handleReady);
    socket.on("connect_error", handleConnectError);
    socket.on("disconnect", handleDisconnect);

    socket.on("message:new", handleNewMessage);
    socket.on("conversation:updated", handleConversationUpdated);
    socket.on("conversation:read", handleConversationRead);

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("socket:ready", handleReady);
      socket.off("connect_error", handleConnectError);
      socket.off("disconnect", handleDisconnect);

      socket.off("message:new", handleNewMessage);
      socket.off("conversation:updated", handleConversationUpdated);
      socket.off("conversation:read", handleConversationRead);
    };
  }, [user, isAuthLoading, queryClient]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const socketInstance = useContext(SocketContext);

  if (!socketInstance) {
    throw new Error("useSocket must be used inside SocketProvider");
  }

  return socketInstance;
};

export default SocketContext;
