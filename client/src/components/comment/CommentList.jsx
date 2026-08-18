import React from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  deleteComment,
  getComments,
} from "../../api/comment.api";

import {
  useAuth,
} from "../../hooks/useAuth";

import Loader from "../ui/Loader";

import CommentItem from "./CommentItem";
import { queryKeys } from "../../constants/queryKey";

import SkeletonComments from "../UI/SkeletonComments";
import EmptyState from "../UI/EmptyState";


const CommentList = ({
  postId,
  queryKey,
}) => {

  const { user } = useAuth();

  const queryClient = useQueryClient();


  // ========================================
  // GET COMMENTS
  // ========================================

  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey,

    queryFn: () =>
      getComments(postId),

    enabled: !!postId,
  });


  // ========================================
  // DELETE COMMENT
  // ========================================

  const deleteMutation = useMutation({

    mutationFn: deleteComment,

    onSuccess: () => {

      // Refresh comments
      queryClient.invalidateQueries({
        queryKey,
      });


      // Refresh feed comment counts
      queryClient.invalidateQueries({
        queryKey: queryKeys.feed,
      });


      // Refresh profile comment counts
      queryClient.invalidateQueries({
        queryKey: ["user-posts"],
      });

    },

  });


  // ========================================
  // LOADING
  // ========================================

if (isLoading) {
  return <SkeletonComments />;
}


  // ========================================
  // ERROR
  // ========================================

  if (isError) {
    return (
      <p className="text-red-400 text-center py-6">
        Failed to load comments.
      </p>
    );
  }


  // ========================================
  // EMPTY
  // ========================================

if (!data?.data?.length) {
  return (
    <EmptyState
      icon="💬"
      title="No Comments Yet"
      description="Start the conversation."
    />
  );
}


  // ========================================
  // COMMENTS
  // ========================================

  return (
    <div className="p-4">

      {data.data.map((comment) => (

        <CommentItem
          key={comment.id}
          comment={comment}
          currentUserId={user?.id}
          deleting={deleteMutation.isPending}
          onDelete={(commentId) =>
            deleteMutation.mutate(commentId)
          }
        />

      ))}

    </div>
  );
};


export default CommentList;