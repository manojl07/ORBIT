import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { toggleFollow } from "../api/user.api";

const useFollow = (user) => {
  const queryClient = useQueryClient();

  const userId = user?._id ?? user?.id;

  const mutation = useMutation({
    mutationFn: () => {
      if (!userId) {
        throw new Error("User ID is missing");
      }

      return toggleFollow(userId);
    },

    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: ["user-profile", userId],
      });

      queryClient.invalidateQueries({
        queryKey: ["followers", userId],
      });

      queryClient.invalidateQueries({
        queryKey: ["following", userId],
      });

      queryClient.invalidateQueries({
        queryKey: ["feed"],
      });

      queryClient.invalidateQueries({
        queryKey: ["user-posts"],
      });

      toast.success(
        response?.message ||
          "Follow updated"
      );
    },

    onError: (error) => {
      console.error(
        "Follow toggle failed:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to update follow"
      );
    },
  });

  return {
    toggleFollow: mutation.mutate,
    isPending: mutation.isPending,
    isFollowing: Boolean(user?.isFollowing),
  };
};

export default useFollow;