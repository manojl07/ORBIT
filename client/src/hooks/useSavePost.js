import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import {
  savePost,
  unsavePost,
} from "../api/post.api";

const useSavePost = ({ post }) => {
  const queryClient = useQueryClient();

  const postId = post?.id ?? post?._id;

  const [isSaved, setIsSaved] = useState(
    Boolean(post?.isSaved)
  );

  // Sync with fresh post data when the server/cache updates.
  useEffect(() => {
    setIsSaved(Boolean(post?.isSaved));
  }, [postId, post?.isSaved]);

  const mutation = useMutation({
    mutationFn: ({ nextIsSaved }) => {
      if (!postId) {
        throw new Error("Post ID is missing");
      }

      return nextIsSaved
        ? savePost(postId)
        : unsavePost(postId);
    },

    onMutate: ({ nextIsSaved }) => {
      const previousIsSaved = isSaved;

      // Update the bookmark immediately.
      setIsSaved(nextIsSaved);

      return { previousIsSaved };
    },

    onSuccess: async (_response, variables) => {
      toast.success(
        variables.nextIsSaved
          ? "Post saved"
          : "Post removed from saved"
      );

      // Refresh all cached views containing this post.
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["feed"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["user-posts"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["saved-posts"],
        }),
      ]);
    },

    onError: (error, variables, context) => {
      // Restore the previous bookmark state on failure.
      setIsSaved(
        context?.previousIsSaved ?? !variables.nextIsSaved
      );

      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Couldn't update saved post"
      );
    },
  });

  const toggleSaved = () => {
    if (mutation.isPending) return;

    mutation.mutate({
      nextIsSaved: !isSaved,
    });
  };

  return {
    // Keep both names so existing components remain compatible.
    toggleSaved,
    toggleSave: toggleSaved,
    isPending: mutation.isPending,
    isSaved,
  };
};

export default useSavePost;