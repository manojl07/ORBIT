const asynHandler = require('../utils/asyncHandler')
const ApiResponse = require('../utils/ApiResponse')
const postService = require('../services/post.service')
const asyncHandler = require('../utils/asyncHandler')


const createPostController = asynHandler(async (req, res) => {
  const post = await postService.createPost({
    caption: req.body.caption,
    image: req.file,
    userId: req.user.id,
  })

  return res.status(201).json(new ApiResponse(201, "Post created successfully", post))
})

const deletePostController = asyncHandler(async (req, res) => {
  await postService.deletePost(req.params.id, req.user.id);

    console.log("DELETE POST REQUEST:", {postId: req.params.id, userId: req.user?.id,});

  return res.status(200).json(new ApiResponse(200, "Post deleted successfully"))
})

const getUserPostsController = asyncHandler(async (req, res) => {
  const result = await postService.getUserPosts({
    userId: req.params.userId,
    currentUserId: req.user.id,
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 12,
  })

  return res.status(200).json(new ApiResponse(200, "Posts fetched successfully", result))
})

const getFeedController = asynHandler(async (req, res) => {
  
  const result = await postService.getFeed({
    userId: req.user?.id,
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10
  })

  return res.status(200).json(new ApiResponse(200, "Feed fetched successfully", result))
})

const toggleLikeController = asyncHandler(async (req, res) => {
  const result = await postService.toggleLike(req.params.postId, req.user.id);

  return res.status(200).json(new ApiResponse(200, "Like updated", result))
})

module.exports = { createPostController, deletePostController, getUserPostsController, getFeedController, toggleLikeController }