import React from "react";
import { Heart, MessageCircle, } from "lucide-react";
import { useMutation, useQueryClient, } from "@tanstack/react-query";
import { toggleLike } from "../../api/post.api";
import { queryKeys } from "../../constants/queryKey";

import { motion } from "framer-motion";


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
        className="flex items-center gap-2"
      >

        <motion.div
          animate={
            post.isLiked
              ? {
                scale: [1, 1.35, 0.95, 1],
                rotate: [0, -8, 8, 0],
              }
              : {
                scale: 1,
                rotate: 0,
              }
          }
          whileTap={{
            scale: 0.75,
          }}
          transition={{
            duration: 0.35,
          }}
        >
          <Heart
            size={24}
            className={
              post.isLiked
                ? "fill-red-500 text-red-500"
                : "text-white"
            }
          />
        </motion.div>

        <span className="text-white text-sm font-medium">
          {post.likesCount}
        </span>

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