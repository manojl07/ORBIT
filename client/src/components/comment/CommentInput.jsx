import React, { useRef, useState } from "react";
import { useMutation, useQueryClient, } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { createComment, } from "../../api/comment.api";
import { useAuth, } from "../../hooks/useAuth";
import { queryKeys } from "../../constants/queryKey";

import ButtonSpinner from "../ui/ButtonSpinner";


const CommentInput = ({ postId, queryKey, onCommentCreated, }) => {

  const [content, setContent] = useState("");

  const { user } = useAuth();

  const queryClient = useQueryClient();

  const submitLockRef = useRef(false);



  const createMutation = useMutation({
    mutationFn: createComment,

    // Add a temporary comment immediately.
    onMutate: async (newComment) => {
      await queryClient.cancelQueries({ queryKey });

      const previousComments =
        queryClient.getQueryData(queryKey);

      const tempId =
        `temp - ${Date.now()} -${Math.random()} `;

      const optimisticComment = {
        id: tempId,
        content: newComment.content,
        user: {
          id: user?.id ?? user?._id,
          username: user?.username,
          profileImg: user?.profileImg,
        },
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData(queryKey, (oldData) => {
        if (!Array.isArray(oldData?.data)) {
          return oldData;
        }

        return {
          ...oldData,
          data: [optimisticComment, ...oldData.data],
        };
      });

      return { previousComments, tempId };
    },

    // Replace the temporary entry with the persisted comment.
    onSuccess: (response, _variables, context) => {
      setContent("");

      const createdComment = response?.data;

      queryClient.setQueryData(queryKey, (oldData) => {
        if (!Array.isArray(oldData?.data)) {
          return oldData;
        }

        const withoutTemporaryComment =
          oldData.data.filter(
            (comment) =>
              String(comment.id) !== String(context?.tempId)
          );

        // Avoid adding the same server comment twice.
        if (
          !createdComment?.id ||
          withoutTemporaryComment.some(
            (comment) =>
              String(comment.id) === String(createdComment.id)
          )
        ) {
          return {
            ...oldData,
            data: withoutTemporaryComment,
          };
        }

        return {
          ...oldData,
          data: [
            createdComment,
            ...withoutTemporaryComment,
          ],
        };
      });

      onCommentCreated?.();
    },

    // Restore the cache if creation fails.
    onError: (error, _variables, context) => {
      if (context?.previousComments !== undefined) {
        queryClient.setQueryData(
          queryKey,
          context.previousComments
        );
      }

      toast.error(
        error?.response?.data?.message ||
        "Failed to post comment"
      );
    },

    // Reconcile the comments and post counters with the backend.
 onSettled: async () => {
  try {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.feed,
      }),
      queryClient.invalidateQueries({
        queryKey: ["user-posts"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["commented-posts"],
      }),
    ]);
  } finally {
    submitLockRef.current = false;
  }
},
  });
  // ========================================
  // SUBMIT
  // ========================================

const handleSubmit = () => {
  const trimmedContent = content.trim();

  if (
    !trimmedContent ||
    submitLockRef.current ||
    createMutation.isPending
  ) {
    return;
  }

  // Synchronous lock: blocks repeated events before re-render.
  submitLockRef.current = true;

  createMutation.mutate({
    postId,
    content: trimmedContent,
  });
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