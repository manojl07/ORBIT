import React, { useState } from "react";
import {useMutation, useQueryClient,} from "@tanstack/react-query";

import {createComment,} from "../../api/comment.api";
import {useAuth,} from "../../hooks/useAuth";
import { queryKeys } from "../../constants/queryKey";

import ButtonSpinner from "../ui/ButtonSpinner";


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
<div className="p-4 flex gap-2">

  <input
    type="text"
    value={content}
    disabled={createMutation.isPending}
    onChange={(e) => setContent(e.target.value)}
    placeholder="Add a comment..."
    className="flex-1 bg-zinc-800 text-white rounded-lg p-3 outline-none disabled:opacity-60"
    onKeyDown={(e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    }}
  />

  <button
    onClick={handleSubmit}
    disabled={
      createMutation.isPending ||
      !content.trim()
    }
    className="min-w-27.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg px-4 text-white flex items-center justify-center gap-2 transition"
  >
    {createMutation.isPending ? (
      <>
        <ButtonSpinner size={16} />
        Posting...
      </>
    ) : (
      "Post"
    )}
  </button>

</div>
  );
};


export default CommentInput;