const Comment = require('../models/comment.model')
const Post = require('../models/post.model')
const ApiError = require('../utils/ApiError')


const createComment = async ({ postId, userId, content }) => {
  const post = await Post.findById(postId)

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const comment = await Comment.create({
    content,
    user: userId,
    post: postId,
  })

  post.commentsCount += 1;

  await post.save();

  await comment.populate("user", "username profileImg");

  return {
    id: comment.user._id,
    content: comment.content,
    user: {
      id: comment.user._id,
      username: comment.user.username,
      profileImg: comment.user.profileImg,
    },
    createdAt: comment.createdAt,
  }
}

const getComments = async (postId) => {
  const comments = await Comment.find({ post: postId }).populate("user", "username profileImg").sort({ createdAt: -1 });

  return comments.map((comment) => ({
    id: comment._id,
    content: comment.content,
    user: {
      id: comment.user._id,
      username: comment.user.username,
      profileImg: comment.user.profileImg,
    },
    createdAt: comment.createdAt,
  }));
};

const deleteComment = async ({ commentId, userId }) => {

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found")
  }

  if (comment.user.toString() !== userId) {
    throw new ApiError(403, "Unauthorized")
  }

  await Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -1 } })

  await Comment.findByIdAndDelete(commentId);

  return true;
}

module.exports = { createComment, getComments, deleteComment }