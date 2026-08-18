import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import toast from "react-hot-toast";

import { deletePost } from "../api/post.api";
import { queryKeys } from "../constants/queryKey";


const getPostId = (post) => {
  return String(post?._id ?? post?.id ?? "");
};


const removePostFromCache = (
  oldData,
  postId
) => {

  if (!oldData?.data?.posts) {
    return oldData;
  }

  const filteredPosts =
    oldData.data.posts.filter(
      (post) =>
        getPostId(post) !== postId
    );

  return {
    ...oldData,

    data: {
      ...oldData.data,

      posts: filteredPosts,

      ...(oldData.data.pagination && {
        pagination: {
          ...oldData.data.pagination,

          total: Math.max(
            0,
            (oldData.data.pagination.total ?? 1) - 1
          ),
        },
      }),
    },
  };
};


const useDeletePost = ({
  post,
  onSuccess,
}) => {

  const queryClient =
    useQueryClient();

  const postId =
    getPostId(post);

  const userId = String(
    post?.user?._id ??
    post?.user?.id ??
    ""
  );


  const mutation = useMutation({

    mutationFn: () =>
      deletePost(postId),


    // ==========================================
    // OPTIMISTIC DELETE
    // ==========================================

    onMutate: async () => {

      await Promise.all([
        queryClient.cancelQueries({
          queryKey: queryKeys.feed,
        }),

        queryClient.cancelQueries({
          queryKey: ["user-posts"],
        }),
      ]);


      // Save existing cache

      const previousFeed =
        queryClient.getQueryData([
          "feed",
        ]);


      const userPostsKey = [
        "user-posts",
        userId,
      ];


      const previousUserPosts =
        queryClient.getQueryData(
          userPostsKey
        );


      // Remove immediately from feed

      queryClient.setQueryData(
        queryKeys.feed,
        (oldData) =>
          removePostFromCache(
            oldData,
            postId
          )
      );


      // Remove immediately from profile

      if (userId) {

        queryClient.setQueryData(
          userPostsKey,
          (oldData) =>
            removePostFromCache(
              oldData,
              postId
            )
        );

      }


      return {
        previousFeed,
        previousUserPosts,
        userPostsKey,
      };
    },


    // ==========================================
    // ERROR → ROLLBACK
    // ==========================================

    onError: (
      error,
      variables,
      context
    ) => {

      if (!context) {
        return;
      }


      queryClient.setQueryData(
        queryKeys.feed,
        context.previousFeed
      );


      if (context.userPostsKey) {

        queryClient.setQueryData(
          context.userPostsKey,
          context.previousUserPosts
        );

      }


      toast.error(
        error?.response?.data?.message ||
        "Failed to delete post"
      );
    },


    // ==========================================
    // SUCCESS
    // ==========================================

    onSuccess: () => {

      toast.success(
        "Post deleted successfully"
      );

      onSuccess?.();
    },


    // ==========================================
    // SERVER SYNC
    // ==========================================

    onSettled: () => {

      queryClient.invalidateQueries({
        queryKey: queryKeys.feed,
      });

      queryClient.invalidateQueries({
        queryKey: ["user-posts"],
      });

    },

  });


  return {
    deletePost: mutation.mutate,
    isDeleting: mutation.isPending,
  };
};


export default useDeletePost;