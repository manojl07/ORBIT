import { useInfiniteQuery } from "@tanstack/react-query";

import { getMessages } from "../api/chat.api";
import { queryKeys } from "../constants/queryKey";

const PAGE_SIZE = 30;

const useMessages = (conversationId) => {
  return useInfiniteQuery({
    queryKey: queryKeys.messages(conversationId),

    queryFn: ({ pageParam }) =>
      getMessages({
        conversationId,
        cursor: pageParam,
        limit: PAGE_SIZE,
      }),

    enabled: Boolean(conversationId),

    initialPageParam: null,

    getNextPageParam: (lastPage) => {
      if (!lastPage?.pagination?.hasMore) {
        return undefined;
      }

      return lastPage.pagination.nextCursor;
    },

    staleTime: 30 * 1000,

    gcTime: 10 * 60 * 1000,

    refetchOnWindowFocus: false,
  });
};

export default useMessages;