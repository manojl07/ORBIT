import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { toggleFollow } from '../api/user.api'


const useFollow = (userId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => toggleFollow(userId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["user-profile", userId] })

      const previous = queryClient.getQueryData(["user-profile", userId])

      queryClient.setQueryData(["user-profile", userId], (old) => {
        if (!old) return old;

        const following = old.data.isFollowing;

        return {
          ...old,
          isFollowing: !following,
          followersCount: following ? old.data.followersCount - 1 : old.data.followersCount + 1,
        }
      })
    },

    onError: (_error,_variables,context) => {
      if(context?.previous){
        queryClient.setQueriesData(["user-profile", userId], context.previous)
      }
      toast.error("Something went wrong")
    },

    onSuccess: (Response) => {
      toast.success(Response.message);
    },

    onSettled: () => {
    queryClient.invalidateQueries({queryKey: ["user-profile", userId]})
    queryClient.invalidateQueries({queryKey: ["feed"]})
    queryClient.invalidateQueries({queryKey: ["user-posts"]})
    }
  })
}

export default useFollow