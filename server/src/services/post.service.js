const mongoose = require("mongoose");
const Post = require("../models/post.model");
const User = require("../models/user.model");
const Like = require("../models/like.model");
const ApiError = require("../utils/ApiError");
const SavedPost = require("../models/savedPost.model");


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
  isSaved: post.isSaved ?? false,
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

const createPost = async ({ caption, image, userId, }) => {
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
  await SavedPost.deleteMany({ post: postId });

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

  const [posts, total, userLikes, savedEntries] =
    await Promise.all([
      Post.find({ user: userId })
        .populate("user", "username profileImg isVerified")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Post.countDocuments({ user: userId }),

      Like.find({ user: currentUserId })
        .select("post")
        .lean(),

      SavedPost.find({ user: currentUserId })
        .select("post")
        .lean(),
    ]);

  // Posts liked by the current viewer
  const likedPosts = new Set(
    userLikes.map((like) => String(like.post))
  );

  // Posts saved by the current viewer
  const savedPostIds = new Set(
    savedEntries.map((entry) => String(entry.post))
  );

  // Exclude posts whose author no longer exists
  const validPosts = posts.filter((post) => post.user);

  const formattedPosts = validPosts.map((post) => ({
    ...post,

    isLiked: likedPosts.has(String(post._id)),

    isSaved: savedPostIds.has(String(post._id)),

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

  const [posts, total, userLikes, savedEntries] =
    await Promise.all([
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

      SavedPost.find({ user: userId })
        .select("post")
        .lean(),
    ]);

  const likedPosts = new Set(
    userLikes.map((like) => String(like.post))
  );

  const savedPostIds = new Set(
    savedEntries.map((entry) => String(entry.post))
  );

  // Exclude orphaned posts
  const validPosts = posts.filter((post) => post.user);

  const formattedPosts = validPosts.map((post) => {
    const followers = Array.isArray(post.user.followers)
      ? post.user.followers
      : [];

    return {
      ...post,

      isLiked: likedPosts.has(String(post._id)),

      isSaved: savedPostIds.has(String(post._id)),

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


/* =====================================================
   SAVE POST
===================================================== */

const savePost = async ({ postId, userId }) => {
  if (!mongoose.isValidObjectId(postId)) {
    throw new ApiError(400, "Invalid post ID");
  }

  const postExists = await Post.exists({ _id: postId });

  if (!postExists) {
    throw new ApiError(404, "Post not found");
  }

  try {
    // Idempotent: saving an already-saved post is safe.
    await SavedPost.updateOne(
      { user: userId, post: postId },
      {
        $setOnInsert: {
          user: userId,
          post: postId,
        },
      },
      { upsert: true }
    );
  } catch (error) {
    // Another concurrent request may have inserted the
    // same relationship. The unique index protects it.
    if (error.code !== 11000) {
      throw error;
    }
  }

  return { isSaved: true };
};

/* =====================================================
   UNSAVE POST
===================================================== */

const unsavePost = async ({ postId, userId }) => {
  if (!mongoose.isValidObjectId(postId)) {
    throw new ApiError(400, "Invalid post ID");
  }

  await SavedPost.deleteOne({
    user: userId,
    post: postId,
  });

  // Idempotent: removing a missing save is also safe.
  return { isSaved: false };
};

/* =====================================================
   GET MY SAVED POSTS
===================================================== */

const getSavedPosts = async ({
  userId,
  page = 1,
  limit = 12,
}) => {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(
    30,
    Math.max(1, Number(limit) || 12)
  );
  const skip = (safePage - 1) * safeLimit;

  const [savedEntries, total] = await Promise.all([
    SavedPost.find({ user: userId })
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(safeLimit)
      .populate({
        path: "post",
        populate: {
          path: "user",
          select: "username profileImg isVerified",
        },
      })
      .lean(),

    SavedPost.countDocuments({ user: userId }),
  ]);

  // Posts may have been deleted outside the normal
  // delete service, so handle stale references safely.
  const validEntries = savedEntries.filter(
    (entry) => entry.post && entry.post.user
  );

  const posts = validEntries.map((entry) => ({
    ...entry.post,
    isLiked: false,
    isSaved: true,
  }));

  // Populate the viewer-specific like state.
  const likedEntries = await Like.find({
    user: userId,
    post: { $in: posts.map((post) => post._id) },
  })
    .select("post")
    .lean();

  const likedPostIds = new Set(
    likedEntries.map((entry) => String(entry.post))
  );

  const formattedPosts = posts.map((post) => ({
    ...post,
    isLiked: likedPostIds.has(String(post._id)),
  }));

  return {
    posts: formattedPosts.map(sanitizePost),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
    },
  };
};


module.exports = {
  createPost,
  deletePost,
  getUserPosts,
  getFeed,
  toggleLike,
  savePost,
  unsavePost,
  getSavedPosts
};
