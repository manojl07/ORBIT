import { useQuery } from "@tanstack/react-query";
import { getFollowing } from "../api/user.api";


const useFollowing = (userId, enabled=true) => {
  return useQuery({
    queryKey: ["following", userId],
    queryFn: () => getFollowing(userId),
    enabled: enabled && !!userId,
    staleTime: 1000 * 60 * 5,
  })
}

export default useFollowing;