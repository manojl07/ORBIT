import React, { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient, } from "@tanstack/react-query";
import { createComment, deleteComment, getComments, } from "../../api/comment.api";
import { useAuth } from '../../hooks/useAuth'



const CommentModal = ({ isOpen, onClose, post, }) => {

  const { user } = useAuth();

  const inputRef = useRef(null);
  const [content, setContent] = useState("");
  const queryClient = useQueryClient();

  /*
 ========================================
 GET COMMENTS
 ========================================
 */

  const { data, isLoading, isError } = useQuery({
    queryKey: ["comments", post?._id],

    queryFn: () => getComments(post._id),

    enabled: isOpen && !!post?._id,
  });

  /*
========================================
CREATE COMMENT
========================================
*/

  const createMutation = useMutation({
    mutationFn: createComment,

    // Optimistic update
    onMutate: async (newComment) => {
      await queryClient.cancelQueries({
        queryKey: ["comments", post._id]
      })

      // Take snapshot BEFORE changing cache
      const previousComments = queryClient.getQueryData(["comments", post._id])

      // Immediately add comment to UI
      queryClient.setQueryData(["comments", post._id], (oldData) => {
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
          ]
        }
      })

      return { previousComments }
    },

    // If API fails restore previous comments
    onError: (err, variable, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(["comments", post._id], context.previousComments);
      }
    },

    // API finished successfully or unsuccessfully
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments", post._id]
      })

      queryClient.invalidateQueries({
        queryKey: ["feed"],
      })
    },

    // Only UI-specific success work here
    onSuccess: () => {
      setContent("");
    },
  });


  /*
========================================
DELETE COMMENT
========================================
*/
  const deleteMutation = useMutation({
    mutationFn: deleteComment,

    // Optimistic delete
    onMutate: async (commentId) => {
      await queryClient.cancelQueries({
        queryKey: ["comments", post._id],
      })

      // Save current comments
      const previousComments = queryClient.getQueryData(["comments", post._id])

      // Remove comment immediately
      queryClient.setQueryData(["comments", post._id], (oldData) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          data: oldData.data.filter((comment) => comment.id !== commentId)
        }
      })

      return { previousComments }
    },

    // DELETE API failed Restore comment
    onError: (error, commentId, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(["comments", post._id], context.previousComments)
        console.error("Delete comment failed:", error);
      }
    },

    // Sync with backend
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", post._id] })
      queryClient.invalidateQueries({ queryKey: ["feed"] })
    }
  })

  /*
========================================
SUBMIT COMMENT
========================================
*/
  const handleSubmit = () => {
    const trimmedContent = content.trim();

    if (!trimmedContent) return;

    createMutation.mutate({
      postId: post._id,
      content: trimmedContent,
    })
  }

  /*
========================================
DELETE COMMENT
========================================
*/

  const handleDelete = (commentId) => {
    deleteMutation.mutate(commentId);
  }

  /*
========================================
AUTO FOCUS
========================================
*/
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen])

  /*
========================================
MODAL CLOSED
========================================
*/
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex justify-center items-center">

      <div className="bg-zinc-900 w-full max-w-lg rounded-lg p-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">

          <h2 className="text-white text-xl font-bold">
            Comments
          </h2>

          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white text-xl"
          >
            ✕
          </button>

        </div>


        {/* Comments */}
        <div className="max-h-80 overflow-y-auto">

          {isLoading ? (

            <p className="text-zinc-400">
              Loading comments...
            </p>

          ) : data?.data?.length === 0 ? (
            <p className="text-zinc-400">
              No comments yet.
            </p>
          ) : (
            data?.data?.map((comment) => (
              <div key={comment.id} className="gropu flex items-start gap-3 mb-4">

                <img src={comment.user.profileImg} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />

                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold">
                    {comment.user.username}
                  </p>
                  <p className="text-zinc-300 wrap-break-word">
                    {comment.content}
                  </p>

                </div>


                {comment.user.id === user.id && (
                  <button
                    type="button"
                    onClick={() => handleDelete(comment.id)}
                    disabled={deleteMutation.isPending}
                    className="text-xs  text-zinc-500 hover:text-red-500 transition-colors duration-200 group-hover:opacity-100 disabled:opacity-50"
                    title="Delete comment" >
                    {deleteMutation.isPending ? 'Deleting...' : "Delete"}
                  </button>
                )}
              </div>

            ))

          )}

        </div>


        {/* Add comment */}
        <div className="mt-4 flex gap-2">

          <input
            ref={inputRef}
            value={content}
            onChange={(e) =>
              setContent(e.target.value)
            }
            placeholder="Add comment..."
            className="flex-1 bg-zinc-800 text-white p-2 rounded"
          />

          <button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="bg-blue-600 text-white px-4 rounded disabled:opacity-50"
          >
            {createMutation.isPending
              ? "Posting..."
              : "Post"}
          </button>

        </div>

      </div>

    </div>
  );
};

export default CommentModal;