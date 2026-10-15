
const Post = require("../models/post.model");
const User = require("../models/user.model");
const Like = require("../models/like.model");
const ApiError = require("../utils/ApiError");

const {
  uploadImage,
  deleteImage,
} = require("./image.service");

/* =====================================================
   SANITIZE POST
===================================================== */

const sanitizePost = (post) => ({
  id: post._id,
  _id: post._id,
  caption: post.caption,
  imageUrl: post.imageUrl,
  likesCount: post.likesCount,
  isLiked: post.isLiked ?? false,
  commentsCount: post.commentsCount,
  isEdited: post.isEdited,
  user: post.user
    ? {
        id: post.user._id,
        _id: post.user._id,
        username: post.user.username,
        profileImg: post.user.profileImg,
        isVerified: Boolean(post.user.isVerified),
        ...(typeof post.user.isFollowing === "boolean" && {
          isFollowing: post.user.isFollowing,
        }),
      }
    : null,
  createdAt: post.createdAt,
});

/* =====================================================
   CREATE POST
===================================================== */

const createPost = async ({
  caption,
  image,
  userId,
}) => {
  if (!image) {
    throw new ApiError(400, "Image is required");
  }

  const uploadedImage = await uploadImage(
    image,
    "/orbit/post-images"
  );

  const post = await Post.create({
    caption,
    imageUrl: uploadedImage.imageUrl,
    imageFileId: uploadedImage.imageFileId,
    user: userId,
  });

  return post;
};

/* =====================================================
   DELETE POST
===================================================== */

const deletePost = async (postId, userId) => {
  const post = await Post.findById(postId);

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  if (String(post.user) !== String(userId)) {
    throw new ApiError(403, "Unauthorized");
  }

  await Post.findByIdAndDelete(postId);

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

/* =====================================================
   GET USER POSTS
===================================================== */

const getUserPosts = async ({
  userId,
  currentUserId,
  page = 1,
  limit = 12,
}) => {
  const skip = (page - 1) * limit;

  const [posts, total, userLikes] = await Promise.all([
    Post.find({ user: userId })
      .populate(
        "user",
        "username profileImg isVerified"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Post.countDocuments({ user: userId }),

    Like.find({ user: currentUserId })
      .select("post")
      .lean(),
  ]);

  // Exclude posts whose referenced author no longer exists.
  const validPosts = posts.filter((post) => post.user);

  const likedPosts = new Set(
    userLikes.map((like) => String(like.post))
  );

  const formattedPosts = validPosts.map((post) => ({
    ...post,
    isLiked: likedPosts.has(String(post._id)),
    user: { ...post.user },
  }));

  return {
    posts: formattedPosts.map(sanitizePost),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/* =====================================================
   GET FEED
===================================================== */

const getFeed = async ({
  page = 1,
  limit = 10,
  userId,
}) => {
  const skip = (page - 1) * limit;

  const [posts, total, userLikes] = await Promise.all([
    Post.find()
      .populate(
        "user",
        "username profileImg followers isVerified"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Post.countDocuments(),

    Like.find({ user: userId })
      .select("post")
      .lean(),
  ]);

  const likedPosts = new Set(
    userLikes.map((like) => String(like.post))
  );

  // Never let an orphaned post crash the whole feed.
  const validPosts = posts.filter((post) => post.user);

  const formattedPosts = validPosts.map((post) => {
    const followers = Array.isArray(post.user.followers)
      ? post.user.followers
      : [];

    return {
      ...post,

      isLiked: likedPosts.has(String(post._id)),

      user: {
        ...post.user,

        isFollowing: followers.some(
          (id) => String(id) === String(userId)
        ),
      },
    };
  });

  return {
    posts: formattedPosts.map(sanitizePost),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/* =====================================================
   TOGGLE LIKE
===================================================== */

const toggleLike = async (postId, userId) => {
  const post = await Post.findById(postId);

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const existingLike = await Like.findOne({
    user: userId,
    post: postId,
  });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);

    post.likesCount = Math.max(
      0,
      post.likesCount - 1
    );

    await post.save();

    return {
      liked: false,
      likesCount: post.likesCount,
    };
  }

  await Like.create({
    user: userId,
    post: postId,
  });

  post.likesCount += 1;

  await post.save();

  return {
    liked: true,
    likesCount: post.likesCount,
  };
};

module.exports = {
  createPost,
  deletePost,
  getUserPosts,
  getFeed,
  toggleLike,
};
