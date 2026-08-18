import React, { useState } from "react";
import {useMutation, useQueryClient,} from "@tanstack/react-query";

import {createComment,} from "../../api/comment.api";
import {useAuth,} from "../../hooks/useAuth";
import { queryKeys } from "../../constants/queryKey";


const CommentInput = ({postId, queryKey, onCommentCreated,}) => {

  const [content, setContent] = useState("");

  const { user } = useAuth();

  const queryClient = useQueryClient();


  const createMutation = useMutation({
    mutationFn: createComment,
    // ========================================
    // OPTIMISTIC CREATE
    // ========================================
    onMutate: async (newComment) => {
      // Stop any currently running comments request
      await queryClient.cancelQueries({queryKey,});

      // Save current cache for rollback
      const previousComments = queryClient.getQueryData(queryKey);

      // Update UI immediately
      queryClient.setQueryData(queryKey, (oldData) => {
          if (!oldData) return oldData;

          const optimisticComment = {
            id: `temp-${Date.now()}`,
            content: newComment.content,

            user: {
              id: user?.id,
              username: user?.username,
              profileImg: user?.profileImg,
            },

            createdAt: new Date(),
          };


          return {
            ...oldData,

            data: [
              optimisticComment,
              ...oldData.data,
            ],
          };
        }
      );

      return {
        previousComments,
      };
    },


    // ========================================
    // ROLLBACK
    // ========================================
    onError: (error, variables, context) => {

      if (context?.previousComments) {
        queryClient.setQueryData(queryKey, context.previousComments);
      }

    },

    // ========================================
    // SUCCESS
    // ========================================
    onSuccess: () => {
      setContent("");
      if (onCommentCreated) {
        onCommentCreated();
      }
    },

    // ========================================
    // SYNC BACKEND
    // ========================================
    onSettled: () => {
      // Refresh comments
      queryClient.invalidateQueries({queryKey,});
      // Refresh feed counts
      queryClient.invalidateQueries({queryKey: queryKeys.feed});
      // Refresh profile posts counts
      queryClient.invalidateQueries({queryKey: ["user-posts"],});
    },
  });

  // ========================================
  // SUBMIT
  // ========================================

  const handleSubmit = () => {
    const trimmedContent = content.trim();

    if (!trimmedContent) {
      return;
    }

    createMutation.mutate({ postId, content: trimmedContent, });
  };


  return (
    <div className="border-t border-zinc-800 p-4 flex gap-2 ">

      <input value={content} onChange={(e) => setContent(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSubmit();
          }
        }}
        placeholder="Add a comment..."

        className="flex-1 bg-zinc-800 text-white rounded-lg p-3 outline-none focus:ring-2 focus:ring-zinc-600 " />


      <button onClick={handleSubmit}
        disabled={createMutation.isPending || !content.trim()}
        className="bg-blue-600 hover:bg-blue-500 text-white  px-5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
        {createMutation.isPending
          ? "..."
          : "Post"}
      </button>

    </div>
  );
};


export default CommentInput;