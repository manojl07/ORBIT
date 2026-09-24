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


const removePostFromCache = (oldData, postId) => {
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

          posts: page.data.posts.filter(
            (post) => getPostId(post) !== postId
          ),
        },
      };
    }),
  };
};


const useDeletePost = ({ post, onSuccess }) => {

  const queryClient = useQueryClient();

  const postId = getPostId(post);

  const userId = String(
    post?.user?._id ??
    post?.user?.id ??
    ""
  );

  const userPostsKey = userId
    ? queryKeys.userPosts(userId)
    : null;


  const mutation = useMutation({

    mutationFn: () => deletePost(postId),


    // ================================
    // BEFORE DELETE
    // ================================
    onMutate: async () => {

      const cancelPromises = [
        queryClient.cancelQueries({
          queryKey: queryKeys.feed,
        }),
      ];

      if (userPostsKey) {
        cancelPromises.push(
          queryClient.cancelQueries({
            queryKey: userPostsKey,
          })
        );
      }

      await Promise.all(cancelPromises);


      // Save current cache
      const previousFeed =
        queryClient.getQueryData(queryKeys.feed);

      const previousUserPosts =
        userPostsKey
          ? queryClient.getQueryData(userPostsKey)
          : undefined;


      // Remove immediately from feed
      queryClient.setQueryData(
        queryKeys.feed,
        (oldData) =>
          removePostFromCache(oldData, postId)
      );


      // Remove immediately from profile
      if (userPostsKey) {
        queryClient.setQueryData(
          userPostsKey,
          (oldData) =>
            removePostFromCache(oldData, postId)
        );
      }


      // Save backup for rollback
      return {
        previousFeed,
        previousUserPosts,
        userPostsKey,
      };
    },


    // ================================
    // DELETE FAILED
    // ================================
    onError: (error, _variables, context) => {

      if (!context) {
        return;
      }


      if (context.previousFeed !== undefined) {
        queryClient.setQueryData(
          queryKeys.feed,
          context.previousFeed
        );
      }


      if (
        context.userPostsKey &&
        context.previousUserPosts !== undefined
      ) {
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


    // ================================
    // DELETE SUCCESSFUL
    // ================================
    onSuccess: () => {

      toast.success(
        "Post deleted successfully"
      );

      onSuccess?.();
    },


    // ================================
    // ALWAYS SYNC WITH SERVER
    // ================================
    onSettled: () => {

      queryClient.invalidateQueries({
        queryKey: queryKeys.feed,
      });

      if (userPostsKey) {
        queryClient.invalidateQueries({
          queryKey: userPostsKey,
        });
      }
    },
  });


  return {
    deletePost: mutation.mutate,
    isDeleting: mutation.isPending,
  };
};


export default useDeletePost;