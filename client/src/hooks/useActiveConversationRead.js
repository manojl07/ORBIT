
import { useEffect, useRef, useState } from "react";

import useMarkConversationRead from "./useMarkConversationRead";

const isPersistedMessageId = (messageId) => {
  return (
    typeof messageId === "string" &&
    /^[a-f\d]{24}$/i.test(messageId)
  );
};

const useActiveConversationRead = ({
  conversationId,
  messageId,
  enabled = true,
}) => {
  const { mutate: markAsRead } = useMarkConversationRead();

  // Visibility only. Do not require browser focus.
  const [isVisible, setIsVisible] = useState(
    () =>
      typeof document !== "undefined" &&
      document.visibilityState === "visible"
  );

  const lastMarkedMessageRef = useRef(null);
  const inFlightMessageRef = useRef(null);

  // Track browser tab visibility.
  useEffect(() => {
    const updateVisibility = () => {
      setIsVisible(
        document.visibilityState === "visible"
      );
    };

    document.addEventListener(
      "visibilitychange",
      updateVisibility
    );

    updateVisibility();

    return () => {
      document.removeEventListener(
        "visibilitychange",
        updateVisibility
      );
    };
  }, []);

  // Reset tracking when switching conversations.
  useEffect(() => {
    lastMarkedMessageRef.current = null;
    inFlightMessageRef.current = null;
  }, [conversationId]);

  // Mark the latest persisted message as read.
  useEffect(() => {
    if (
      !enabled ||
      !isVisible ||
      !conversationId ||
      !isPersistedMessageId(messageId)
    ) {
      return;
    }

    const requestKey = `${conversationId}:${messageId}`;

    if (lastMarkedMessageRef.current === requestKey) {
      return;
    }

    if (inFlightMessageRef.current === requestKey) {
      return;
    }

    inFlightMessageRef.current = requestKey;

    markAsRead(
      {
        conversationId,
        messageId,
      },
      {
        onSuccess: () => {
          lastMarkedMessageRef.current = requestKey;

          console.log("📖 Message marked as read:", {
            conversationId,
            messageId,
          });
        },

        onError: (error) => {
          console.error(
            "❌ Failed to mark message as read:",
            error
          );
        },

        onSettled: () => {
          if (inFlightMessageRef.current === requestKey) {
            inFlightMessageRef.current = null;
          }
        },
      }
    );
  }, [
    conversationId,
    messageId,
    enabled,
    isVisible,
    markAsRead,
  ]);
};

export default useActiveConversationRead;
