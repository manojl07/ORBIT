const asynHandler = require('../utils/asyncHandler')
const ApiResponse = require('../utils/ApiResponse')
const postService = require('../services/post.service')


const createPostController = asynHandler(async (req, res) => {
  const post = await postService.createPost({
    caption: req.body.caption,
    image: req.file,
    userId: req.user.id,
  })

  return res.status(201).json(new ApiResponse(201, "Post created successfully", post))
})

module.exports = { createPostController }