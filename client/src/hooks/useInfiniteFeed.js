import {useInfiniteQuery} from '@tanstack/react-query'
import {getFeed} from '../api/post.api'

const PAGE_SIZE = 10;

const useInfiniteFeed = () => {
  return useInfiniteQuery({
    queryKey: ["feed"],
    queryFn: ({pageParam = 1}) => getFeed({page: pageParam, limit: PAGE_SIZE}),
    initialPageParam: 1,

    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.data?.pagination;

      if(!pagination) return undefined;

      const {page, totalPages} = pagination

      return page < totalPages ? page + 1 : undefined;
    },

    staleTime: 1000 * 60 * 5,
    getTime: 1000 * 60 * 39,
    refetchOnWindowFocus: false,
  })
}


export default useInfiniteFeed;