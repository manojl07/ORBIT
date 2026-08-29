import { useQuery } from '@tanstack/react-query'
import { getFollowers } from '../api/user.api'


const useFollowers = (userId, enabled = true) => {
  return useQuery({
    queryKey: ["followers", userId],
    queryFn: () => getFollowers(userId),
    staleTime: 1000 * 60 * 5,
  })
}

export default useFollowers;


