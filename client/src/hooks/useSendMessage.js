
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useSocket } from "../context/SocketContext";
import { queryKeys } from "../constants/queryKey";

const upsertMessageInCache = (queryClient, conversationId, incomingMessage) => {
  const messageKey = queryKeys.messages(conversationId);

  queryClient.setQueryData(messageKey, (old) => {
    if (!old?.pages?.length) return old;

    const exists = old.pages.some((page) => page.messages?.some((message) => message._id === incomingMessage._id || (incomingMessage.clientMessageId && message.clientMessageId === incomingMessage.clientMessageId)));

    let replaced = false;

    const pages = old.pages.map((page) => ({
      ...page,
      messages: (page.messages ?? []).map((message) => {
        const isMatch = message._id === incomingMessage._id || (incomingMessage.clientMessageId && message.clientMessageId === incomingMessage.clientMessageId);
        if (!isMatch || replaced) return message;
        replaced = true;
        return incomingMessage;
      }),
    }));

    // A genuinely new message belongs in the newest page.
    if (!exists && !replaced) {
      pages[0] = {
        ...pages[0],
        messages: [...(pages[0].messages ?? []), incomingMessage,],
      };
    }

    return {
      ...old,
      pages,
    };
  });
};

const updateMessageStatus = (queryClient, conversationId, clientMessageId, status) => {
  queryClient.setQueryData(queryKeys.messages(conversationId), (old) => {
    if (!old?.pages?.length) return old;

    return {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        messages: (page.messages ?? []).map((message) => message.clientMessageId === clientMessageId ? { ...message, status } : message),
      })),
    };
  }
  );
};

const useSendMessage = (currentUser) => {
  const socket = useSocket();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, clientMessageId, text }) =>
      new Promise((resolve, reject) => {
        if (!socket.connected) {
          reject(new Error("Chat connection unavailable"));
          return;
        }

        socket.timeout(10000).emit("message:send", { conversationId, clientMessageId, text, }, (timeoutError, response) => {
          if (timeoutError) {
            reject(new Error("Message acknowledgement timed out"));
            return;
          }

          if (!response?.success) {
            const error = new Error(response?.message || "Message could not be sent");
            error.statusCode = response?.statusCode;
            error.code = response?.code;
            reject(error);
            return;
          }
          resolve(response.data);
        }
        );
      }),

    onMutate: async (variables) => {
      const { conversationId, clientMessageId, text, } = variables;
      const messageKey = queryKeys.messages(conversationId);
      await queryClient.cancelQueries({ queryKey: messageKey, });

      const previousMessages = queryClient.getQueryData(messageKey);

      const optimisticMessage = {
        _id: `optimistic-${clientMessageId}`,
        conversation: conversationId,
        sender: currentUser,
        clientMessageId,
        type: "text",
        text,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "sending",
      };
      upsertMessageInCache(queryClient, conversationId, optimisticMessage);
      return { previousMessages };
    },

    onSuccess: (result, variables) => {
      const { conversationId } = variables;

      if (result?.message) {
        upsertMessageInCache(queryClient, conversationId, result.message);
      }
    },

    onError: (error, variables) => {
      const status = error.statusCode === 403 ? "blocked" : "failed";
      updateMessageStatus(
        queryClient,
        variables.conversationId,
        variables.clientMessageId,
        status
      );
    },
  });
};

export default useSendMessage;
