
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { markConversationAsRead } from "../api/chat.api";
import { queryKeys } from "../constants/queryKey";
import { useAuth } from "./useAuth";

const getUserId = (user) =>
  String(user?.id || user?._id || "");

const useMarkConversationRead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const currentUserId = getUserId(user);

  return useMutation({
    mutationFn: markConversationAsRead,

    onMutate: async ({ conversationId, messageId }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.conversations,
      });

      const previousConversations =
        queryClient.getQueryData(queryKeys.conversations);

      queryClient.setQueryData(
        queryKeys.conversations,
        (old) => {
          if (!Array.isArray(old)) return old;

          return old.map((conversation) => {
            if (
              String(conversation._id) !==
              String(conversationId)
            ) {
              return conversation;
            }

            return {
              ...conversation,
              unreadCount: 0,

              participants: (conversation.participants || []).map(
                (participant) => {
                  const participantId =
                    participant.user?._id || participant.user;

                  if (String(participantId) !== currentUserId) {
                    return participant;
                  }

                  return {
                    ...participant,
                    lastReadMessage: messageId,
                    unreadCount: 0,
                  };
                }
              ),
            };
          });
        }
      );

      return { previousConversations };
    },

    onError: (_error, _variables, context) => {
      if (context?.previousConversations !== undefined) {
        queryClient.setQueryData(
          queryKeys.conversations,
          context.previousConversations
        );
      }

      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations,
      });
    },

    // Successful read updates are synchronized through
    // the conversation:read Socket.IO event.
    // No message-history refetch is necessary.
  });
};

export default useMarkConversationRead;
