const Post = require("../models/post.model")
const ApiError = require("../utils/ApiError")

const { uploadImage, deleteImage } = require("./image.service")

const Like = require('../models/like.model')



const sanitizePost = (post) => ({
  id: post._id,
  _id: post._id,
  caption: post.caption,
  imageUrl: post.imageUrl,
  likesCount: post.likesCount,
  isLiked: post.isLiked ?? false,
  commentsCount: post.commentsCount,
  isEdited: post.isEdited,
  user: post.user,
  createdAt: post.createdAt,
});


const createPost = async ({ caption, image, userId }) => {
  if (!image) {
    throw new ApiError(400, "Image is required")
  }

  const uploadedImage = await uploadImage(image, "/orbit/post-images");

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

  // Ownership check
  if (String(post.user) !== String(userId)) {
    throw new ApiError(403, "Unauthorized");
  }

  // Delete MongoDB record first
  await Post.findByIdAndDelete(postId);

  // Image deletion is cleanup.
  // It should NOT prevent the post from being deleted.
  if (post.imageFileId) {
    try {
      await deleteImage(post.imageFileId);
    } catch (error) {
      console.error(
        "Failed to delete image from ImageKit:",
        error.message
      );
    }
  }

  return true;
};

const getUserPosts = async ({ userId, currentUserId, page = 1, limit = 12 }) => {
  const skip = (page - 1) * limit;

  const [posts, total, userLikes] = await Promise.all([
    Post.find({ user: userId })
      .populate("user", "username profileImg")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Post.countDocuments({ user: userId }),

    Like.find({ user: currentUserId }).select("post")
  ])

  const likedPosts = new Set(userLikes.map((like) => like.post.toString()))

  const formattedPosts = posts.map((post) => ({
    ...post,
    isLiked: likedPosts.has(post._id.toString()),
    user: {
      ...post.user,
    }
  }))

  return {
    posts: formattedPosts.map(sanitizePost),
    pagination: {
      page, limit, total, totalPages: Math.ceil(total / limit)
    }
  }
}

const getFeed = async ({ page = 1, limit = 10, userId }) => {
  const skip = (page - 1) * limit;

  const [posts, total, userLikes] = await Promise.all([
    Post.find()
      .populate(
        "user",
        "username profileImg followers"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Post.countDocuments(),


    Like.find({ user: userId }).select("post")
  ])

  const likedPosts = new Set(userLikes.map(like => like.post.toString()))

  const formattedPosts = posts.map((post) => ({
    ...post,

    isLiked: likedPosts.has(post._id.toString()),

    user: {
      ...post.user,

      isFollowing: post.user.followers.some(
        (id) => id.toString() === userId
      ),
    },
  }));

  return {
    posts: formattedPosts.map(sanitizePost),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
}

const toggleLike = async (postId, userId) => {

  const post = await Post.findById(postId);

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const existingLike = await Like.findOne({ user: userId, post: postId });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);

    post.likesCount -= 1;

    await post.save();

    return {
      liked: false,
      likesCount: post.likesCount,
    }
  }

  await Like.create({ user: userId, post: postId })

  post.likesCount += 1;

  await post.save();

  return {
    liked: true,
    likesCount: post.likesCount,
  }
}

module.exports = { createPost, deletePost, getUserPosts, getFeed, toggleLike }