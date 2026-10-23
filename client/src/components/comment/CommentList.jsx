import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import toast from "react-hot-toast";

import {
  deleteComment,
  getComments,
} from "../../api/comment.api";

import { useAuth } from "../../hooks/useAuth";
import CommentItem from "./CommentItem";
import { queryKeys } from "../../constants/queryKey";

import SkeletonComments from "../ui/SkeletonComments";
import EmptyState from "../ui/EmptyState";

const CommentList = ({ postId, queryKey }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch comments for this post.
  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey,
    queryFn: () => getComments(postId),
    enabled: Boolean(postId),
  });

  // Delete a specific comment.
  const deleteMutation = useMutation({
    mutationFn: (commentId) => deleteComment(commentId),

    onSuccess: async () => {
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

      toast.success("Comment deleted");
    },

    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          "Failed to delete comment"
      );
    },
  });

  if (isLoading) {
    return <SkeletonComments />;
  }

  if (isError) {
    return (
      <p className="py-6 text-center text-sm text-red-400">
        Failed to load comments.
      </p>
    );
  }

  const comments = data?.data ?? [];

  if (comments.length === 0) {
    return (
      <EmptyState
        icon="💬"
        title="No Comments Yet"
        description="Start the conversation."
      />
    );
  }

  const handleDelete = (commentId) => {
    // Prevent another deletion while this one is pending.
    if (deleteMutation.isPending) return;

    deleteMutation.mutate(commentId);
  };

  return (
    <div className="px-4 py-2">
      {comments.map((comment) => {
        const isDeletingThisComment =
          deleteMutation.isPending &&
          String(deleteMutation.variables) ===
            String(comment.id);

        return (
          <CommentItem
            key={comment.id}
            comment={comment}
            currentUserId={user?.id ?? user?._id}
            deleting={isDeletingThisComment}
            deleteDisabled={deleteMutation.isPending}
            onDelete={handleDelete}
          />
        );
      })}
    </div>
  );
};

export default CommentList;