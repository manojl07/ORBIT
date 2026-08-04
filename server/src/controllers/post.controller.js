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

  return res.status(200).json(new ApiResponse(200, "Post deleted successfully"))
})

module.exports = { createPostController, deletePostController }