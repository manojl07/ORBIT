import React, { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient, } from "@tanstack/react-query";

import { createComment, getComments, } from "../../api/comment.api";

const CommentModal = ({ isOpen, onClose, post, }) => {

  const inputRef = useRef(null);
  const [content, setContent] = useState("");
  const queryClient = useQueryClient();

  const {data, isLoading,} = useQuery({
    queryKey: ["comments", post._id],

    queryFn: () =>
      getComments(post._id),

    enabled: !!post,
  });

  const createMutation = useMutation({
    mutationFn: createComment,
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({
        queryKey: ["comments", post._id],
      });

      queryClient.invalidateQueries({
        queryKey: ["feed"],
      });
    },
  });

  const handleSubmit = () => {
    if (!content.trim()) return;

    createMutation.mutate({
      postId: post._id,
      content: content.trim(),
    });
  };

  useEffect(() => {
    if(isOpen){
      inputRef.current?.focus();
    }
  }, [isOpen])

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
              <div key={comment.id} className="flex gap-3 mb-4">

                <img src={comment.user.profileImg} alt="" className="w-8 h-8 rounded-full object-cover" />

                <div>

                  <p className="text-white font-semibold">
                    {comment.user.username}
                  </p>
                  <p className="text-zinc-300">
                    {comment.content}
                  </p>

                </div>

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