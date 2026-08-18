import React from "react";
import { Heart, MessageCircle, } from "lucide-react";
import { useMutation, useQueryClient, } from "@tanstack/react-query";
import { toggleLike } from "../../api/post.api";
import { queryKeys } from "../../constants/queryKey";


const PostActions = ({ post, queryKey, onCommentClick, }) => {

  const queryClient = useQueryClient();

  const postId = post?._id ?? post?.id;

  const likeMutation = useMutation({
    mutationFn: () => toggleLike(postId),
    onMutate: async () => {

      /* 1. Stop an existing refetch */
      await queryClient.cancelQueries({ queryKey, });

      /* 2. Save current cache */
      const previousData = queryClient.getQueryData(queryKey);

      /* 3. Optimistically update cache */
      queryClient.setQueryData(queryKey, (oldData) => {
        if (!oldData) {
          return oldData;
        }

        /* Feed response shape:
        oldData
          ↓
        data
          ↓
        posts */
        if (!oldData.data?.posts) {
          return oldData;
        }


        return {
          ...oldData,
          data: {
            ...oldData.data,
            posts: oldData.data.posts.map((p) => {

              const currentId = p._id ?? p.id;
              /* Not our post */
              if (currentId !== postId) {
                return p;
              }
              /* Our post */
              return {
                ...p,
                isLiked: !p.isLiked,
                likesCount: p.isLiked
                  ? Math.max(0, p.likesCount - 1)
                  : p.likesCount + 1,
              };
            }
            ),
          },
        };
      }
      );


      /* 4. Give rollback data to onError */

      return { previousData, };
    },


    /* If API fails: restore old cache */

    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },

    /* After API finishes: sync with backend */
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey, });
      queryClient.invalidateQueries({ queryKey: queryKeys.feed })
      queryClient.invalidateQueries({ queryKey: ["user-posts"] })
    },
  });


  return (
    <div className="flex items-center gap-5 text-white">

      {/* LIKE */}
      <button
        onClick={() => likeMutation.mutate()}
        disabled={likeMutation.isPending}
        className="flex items-center gap-2 transition-transform active:scale-90">
        <Heart size={21} fill={post.isLiked ? "currentColor" : "none"}
          className={`transition-all duration-200 ${post.isLiked ? "text-red-500 scale-110" : "text-zinc-200"}`}
        />
        <span className="text-sm">{post.likesCount}</span>
      </button>


      {/* COMMENT */}
      <button
        onClick={onCommentClick}
        className="flex items-center gap-2 transition-transform active:scale-90">
        <MessageCircle size={21} className="text-zinc-200" />
        <span className="text-sm">{post.commentsCount}</span>
      </button>

    </div>
  );
};

export default PostActions;