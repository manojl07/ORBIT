const Post = require("../models/post.model")
const ApiError = require("../utils/ApiError")

const { uploadImage, deleteImage } = require("./image.service")


const createPost = async ({ caption, image, userId }) => {
  if (!image) {
    throw new ApiError(400, "Image is required")
  }

  const uploadedImage = await uploadImage(image, "/orbit/post-images");

  console.log(uploadedImage);

  const post = await Post.create({
    caption,
    imageUrl: uploadedImage.imageUrl,
    imageFileId: uploadedImage.imageFileId,
    user: userId,
  })

  return post;
}

const deletePost = async (postId, userId) => {
  const post = await Post.findById(postId);

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  if (post.user.toString() !== userId) {
    throw new ApiError(403, "Unauthorized");
  }

  await deleteImage(post.imageFileId);

  await Post.findByIdAndDelete(postId);

  return true;
}

const getUserPosts = async ({ userId, page = 1, limit = 12 }) => {
  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
     Post.find({ user: userId })
     .select("-__v -imageFileId")
     .sort({ createAt: -1 })
     .skip(skip)
     .limit(limit),

    Post.countDocuments({ user: userId })
  ])

  return {
    posts,
    pagination: {
      page, limit, total, totalPages: Math.ceil(total/limit)
    }
  }
}

module.exports = { createPost, deletePost, getUserPosts }