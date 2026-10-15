
import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import toast from "react-hot-toast";

import {
  savePost,
  unsavePost,
} from "../api/post.api";

import { queryKeys } from "../constants/queryKey";

/* =====================================================
   UPDATE POST STATE INSIDE A CACHED RESPONSE
===================================================== */

const updatePostSavedState = (data, postId, isSaved) => {
  if (!data || typeof data !== "object") {
    return data;
  }

  // Infinite-query structure.
  if (Array.isArray(data.pages)) {
    return {
      ...data,
      pages: data.pages.map((page) =>
        updatePostSavedState(page, postId, isSaved)
      ),
    };
  }

  const updatePosts = (posts) =>
    posts.map((post) => {
      const id = post?._id ?? post?.id;

      return String(id) === String(postId)
        ? { ...post, isSaved }
        : post;
    });

  // API response: { data: { posts, pagination } }
  if (Array.isArray(data.data?.posts)) {
    return {
      ...data,
      data: {
        ...data.data,
        posts: updatePosts(data.data.posts),
      },
    };
  }

  // Direct response: { posts, pagination }
  if (Array.isArray(data.posts)) {
    return {
      ...data,
      posts: updatePosts(data.posts),
    };
  }

  return data;
};

/* =====================================================
   SAVE / UNSAVE HOOK
===================================================== */

const useSavePost = ({ post }) => {
  const queryClient = useQueryClient();

  const postId = post?._id ?? post?.id;

  const mutation = useMutation({
    mutationFn: ({ id, shouldSave }) =>
      shouldSave ? savePost(id) : unsavePost(id),

    onMutate: async ({ id, shouldSave }) => {
      await Promise.all([
        queryClient.cancelQueries({
          queryKey: queryKeys.feed,
        }),
        queryClient.cancelQueries({
          queryKey: ["user-posts"],
        }),
      ]);

      const snapshots = [
        ...queryClient.getQueriesData({
          queryKey: queryKeys.feed,
        }),
        ...queryClient.getQueriesData({
          queryKey: ["user-posts"],
        }),
      ];

      for (const [queryKey] of snapshots) {
        queryClient.setQueryData(queryKey, (oldData) =>
          updatePostSavedState(oldData, id, shouldSave)
        );
      }

      return { snapshots };
    },

    onSuccess: (_response, variables) => {
      toast.success(
        variables.shouldSave
          ? "Post saved"
          : "Removed from saved posts"
      );
    },

    onError: (error, _variables, context) => {
      // Restore the exact previous cache for each affected query.
      context?.snapshots?.forEach(([queryKey, oldData]) => {
        queryClient.setQueryData(queryKey, oldData);
      });

      toast.error(
        error?.response?.data?.message ||
          "Failed to update saved post"
      );
    },

    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.savedPosts,
      });
    },
  });

  const toggleSaved = () => {
    if (!postId || mutation.isPending) {
      return;
    }

    mutation.mutate({
      id: postId,
      shouldSave: !Boolean(post?.isSaved),
    });
  };

  return {
    toggleSaved,
    isPending: mutation.isPending,
    isSaved: Boolean(post?.isSaved),
  };
};

export default useSavePost;
