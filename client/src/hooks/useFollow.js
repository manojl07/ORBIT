import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { toggleFollow } from "../api/user.api";

const useFollow = (user, profileUserId) => {
  const queryClient = useQueryClient();

  const targetUserId = user?._id ?? user?.id;

  const mutation = useMutation({
    mutationFn: () => {
      if (!targetUserId) {
        throw new Error("User ID is missing");
      }

      return toggleFollow(targetUserId);
    },

    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: ["user-profile", targetUserId],
      });

      queryClient.invalidateQueries({
        queryKey: ["followers", profileUserId],
      });

      queryClient.invalidateQueries({
        queryKey: ["following", profileUserId],
      });

      queryClient.invalidateQueries({
        queryKey: ["feed"],
      });

      queryClient.invalidateQueries({
        queryKey: ["user-posts"],
      });

      toast.success(response?.message || "Follow updated");
    },

    onError: (error) => {
      console.error("Follow toggle failed:", error);
      toast.error(error?.response?.data?.message || "Failed to update follow");
    },
  });

  return {
    toggleFollow: mutation.mutate,
    isPending: mutation.isPending,
    isFollowing: Boolean(user?.isFollowing),
  };
};

export default useFollow;