import {useInfiniteQuery} from '@tanstack/react-query'
import {getFeed} from '../api/post.api'
import { queryKeys } from '../constants/queryKey';

const PAGE_SIZE = 10;

const useInfiniteFeed = () => {
  return useInfiniteQuery({
    queryKey: queryKeys.feed,
    queryFn: ({pageParam = 1}) => getFeed({page: pageParam, limit: PAGE_SIZE}),
    initialPageParam: 1,

    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.data?.pagination;

      if(!pagination) return undefined;

      const {page, totalPages} = pagination

      return page < totalPages ? page + 1 : undefined;
    },

    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  })
}


export default useInfiniteFeed;