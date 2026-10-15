import { useInfiniteQuery } from "@tanstack/react-query";

import { getSavedPosts } from "../api/post.api";
import { queryKeys } from "../constants/queryKey";

const PAGE_SIZE = 12;

const useInfiniteSavedPosts = () => {
  return useInfiniteQuery({
    queryKey: queryKeys.savedPosts,

    queryFn: ({ pageParam = 1 }) =>
      getSavedPosts({
        page: pageParam,
        limit: PAGE_SIZE,
      }),

    initialPageParam: 1,

    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.data?.pagination;

      if (!pagination) {
        return undefined;
      }

      return pagination.page < pagination.totalPages
        ? pagination.page + 1
        : undefined;
    },

    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export default useInfiniteSavedPosts;