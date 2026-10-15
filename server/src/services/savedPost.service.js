const mongoose = require("mongoose");

const SavedPost = require("../models/savedPost.model");
const Post = require("../models/post.model");
const Like = require("../models/like.model");
const ApiError = require("../utils/ApiError");

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
    // Idempotent save: repeated requests don't create duplicates.
    await SavedPost.findOneAndUpdate(
      {
        user: userId,
        post: postId,
      },
      {
        $setOnInsert: {
          user: userId,
          post: postId,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );
  } catch (error) {
    // Two concurrent save requests can race against the unique index.
    // If the other request already created the record, the desired
    // state has still been achieved.
    if (error.code !== 11000) {
      throw error;
    }
  }

  return { saved: true };
};

/* =====================================================
   UNSAVE POST
===================================================== */

const unsavePost = async ({ postId, userId }) => {
  if (!mongoose.isValidObjectId(postId)) {
    throw new ApiError(400, "Invalid post ID");
  }

  // Delete only the relationship owned by this authenticated user.
  // Deleting a nonexistent relationship is intentionally harmless.
  await SavedPost.findOneAndDelete({
    user: userId,
    post: postId,
  });

  return { saved: false };
};

/* =====================================================
   GET CURRENT USER'S SAVED POSTS
===================================================== */

const getSavedPosts = async ({
  userId,
  page = 1,
  limit = 12,
}) => {
  const skip = (page - 1) * limit;

  const entries = await SavedPost.find({
    user: userId,
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate({
      path: "post",
      select:
        "caption imageUrl likesCount commentsCount isEdited user createdAt",
      populate: {
        path: "user",
        select: "username profileImg isVerified",
      },
    })
    .lean();

  // A post or its author might have been deleted outside the normal
  // post-deletion flow. Don't return broken post cards.
  const invalidEntries = entries.filter(
    (entry) => !entry.post || !entry.post.user
  );

  if (invalidEntries.length > 0) {
    await SavedPost.deleteMany({
      _id: {
        $in: invalidEntries.map((entry) => entry._id),
      },
    });
  }

  const validEntries = entries.filter(
    (entry) => entry.post && entry.post.user
  );

  const postIds = validEntries.map(
    (entry) => entry.post._id
  );

  const [total, userLikes] = await Promise.all([
    SavedPost.countDocuments({ user: userId }),

    postIds.length
      ? Like.find({
          user: userId,
          post: { $in: postIds },
        })
          .select("post")
          .lean()
      : [],
  ]);

  const likedPostIds = new Set(
    userLikes.map((like) => String(like.post))
  );

  const posts = validEntries.map((entry) => {
    const post = entry.post;
    const author = post.user;

    return {
      id: post._id,
      _id: post._id,
      caption: post.caption,
      imageUrl: post.imageUrl,
      likesCount: post.likesCount,
      commentsCount: post.commentsCount,
      isEdited: post.isEdited,
      createdAt: post.createdAt,
      isLiked: likedPostIds.has(String(post._id)),
      isSaved: true,
      savedAt: entry.createdAt,
      user: {
        id: author._id,
        _id: author._id,
        username: author.username,
        profileImg: author.profileImg,
        isVerified: Boolean(author.isVerified),
      },
    };
  });

  return {
    posts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

module.exports = {
  savePost,
  unsavePost,
  getSavedPosts,
};