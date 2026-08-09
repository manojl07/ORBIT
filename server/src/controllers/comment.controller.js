const commentService = require('../services/comment.service')
const asyncHandler = require('../utils/asyncHandler')
const ApiResponse = require('../utils/ApiResponse')


const createCommentController = asyncHandler(async (req, res) => {
  const result = await commentService.createComment({
    postId: req.params.postId,
    userId: req.user.id,
    content: req.body.content,
  })

  return res.status(201).json(new ApiResponse(201, "Comment created successfully", result))
})

const getCommentsController = asyncHandler(async (req, res) => {
  const result = await commentService.getComments(req.params.postId);

  return res.status(200).json(new ApiResponse(200, "Comments fetched successfully", result))
})

const deleteCommentController = asyncHandler(async (req, res) => {
  await commentService.deleteComment({
    commentId: req.params.commentId,
    userId: req.user.id
  })

  return res.status(200).json(new ApiResponse(200, "Comment deleted successfully"))
})




module.exports = { createCommentController, getCommentsController, deleteCommentController};
