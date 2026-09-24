import { useInfiniteQuery } from "@tanstack/react-query";
import { getUserPosts } from "../api/post.api";

const PAGE_SIZE = 12;

const useInfiniteUserPosts =  (userId) => {
  return useInfiniteQuery({
    queryKey: ["user-posts", userId],
    queryFn: ({pageParam = 1}) => getUserPosts({userId, page: pageParam, limit: PAGE_SIZE}),
    initialPageParam: 1,

    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.data?.pagination;
      if(!pagination) return undefined;
      const {page, totalPages} = pagination;
      return page < totalPages ? page + 1 : undefined;
    },

    enabled: !!userId,

    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  })
}

export default useInfiniteUserPosts;