import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toggleLike } from "../api/post.api";
import { queryKeys } from "../constants/queryKey";

const getPostId = (post) => {
  return String(post?._id ?? post?.id ?? "");
};

const updateLikeInCache = (oldData, postId) => {
  if (!oldData?.pages) {
    return oldData;
  }

  return {
    ...oldData,

    pages: oldData.pages.map((page) => {
      if (!page?.data?.posts) {
        return page;
      }

      return {
        ...page,

        data: {
          ...page.data,

          posts: page.data.posts.map((post) => {
            if (getPostId(post) !== postId) {
              return post;
            }

            return {
              ...post,
              isLiked: !post.isLiked,
              likesCount: post.isLiked
                ? Math.max(0, post.likesCount - 1)
                : post.likesCount + 1,
            };
          }),
        },
      };
    }),
  };
};

const useLikePost = ({ post, queryKey }) => {
  const queryClient = useQueryClient();

  const postId = getPostId(post);

  const mutation = useMutation({

    mutationFn: () => {
      if (!postId) {
        throw new Error("Post ID is missing");
      }

      return toggleLike(postId);
    },

    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey,
      });

      const previousData =
        queryClient.getQueryData(queryKey);

      queryClient.setQueryData(
        queryKey,
        (oldData) => updateLikeInCache(oldData, postId)
      );

      return {
        previousData,
      };
    },

    onError: (error, _variables, context) => {
      if (context?.previousData !== undefined) {
        queryClient.setQueryData(
          queryKey,
          context.previousData
        );
      }

      console.error("Like toggle failed:", error);
    },

    onSuccess: (response) => {
      // Optimistic update is already visible.
      // No immediate feed refetch.
    },
  });

  return {
    toggleLike: mutation.mutate,
    isPending: mutation.isPending,
  };
};

export default useLikePost;