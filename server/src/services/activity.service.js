
const mongoose = require("mongoose");

const SavedPost = require("../models/savedPost.model");
const Like = require("../models/like.model");
const Comment = require("../models/comment.model");
const Post = require("../models/post.model");
const User = require("../models/user.model");

/* =====================================================
   SHARED POST RESPONSE
===================================================== */

const formatActivityPost = ({
  post,
  isLiked,
  isSaved,
  activity = {},
}) => ({
  id: post._id,
  _id: post._id,
  caption: post.caption,
  imageUrl: post.imageUrl,
  likesCount: post.likesCount ?? 0,
  commentsCount: post.commentsCount ?? 0,
  isEdited: Boolean(post.isEdited),
  createdAt: post.createdAt,
  isLiked,
  isSaved,
  ...activity,
  user: {
    id: post.user._id,
    _id: post.user._id,
    username: post.user.username,
    profileImg: post.user.profileImg,
    isVerified: Boolean(post.user.isVerified),
  },
});

/* =====================================================
   PAGINATION RESPONSE
===================================================== */

const createPagination = ({ page, limit, total }) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});

/* =====================================================
   SHARED ACTIVITY FLAGS
===================================================== */

const getPostFlags = async ({ userId, postIds }) => {
  if (!postIds.length) {
    return {
      likedIds: new Set(),
      savedIds: new Set(),
    };
  }

  const [likes, saves] = await Promise.all([
    Like.find({
      user: userId,
      post: { $in: postIds },
    })
      .select("post")
      .lean(),

    SavedPost.find({
      user: userId,
      post: { $in: postIds },
    })
      .select("post")
      .lean(),
  ]);

  return {
    likedIds: new Set(
      likes.map((like) => String(like.post))
    ),

    savedIds: new Set(
      saves.map((save) => String(save.post))
    ),
  };
};

/* =====================================================
   LIKED POSTS
===================================================== */

const getLikedPosts = async ({
  userId,
  page = 1,
  limit = 12,
}) => {
  const skip = (page - 1) * limit;

  const [likes, total] = await Promise.all([
    Like.find({ user: userId })
      .sort({ createdAt: -1, _id: -1 })
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
      .lean(),

    Like.countDocuments({ user: userId }),
  ]);

  const validLikes = likes.filter(
    (like) => like.post && like.post.user
  );

  const postIds = validLikes.map(
    (like) => like.post._id
  );

  const { savedIds } = await getPostFlags({
    userId,
    postIds,
  });

  const posts = validLikes.map((like) =>
    formatActivityPost({
      post: like.post,
      isLiked: true,
      isSaved: savedIds.has(String(like.post._id)),
      activity: {
        likedAt: like.createdAt,
      },
    })
  );

  return {
    posts,
    pagination: createPagination({
      page,
      limit,
      total,
    }),
  };
};

/* =====================================================
   COMMENTED POSTS
   One result per post, using the latest comment.
===================================================== */

const getCommentedPosts = async ({
  userId,
  page = 1,
  limit = 12,
}) => {
  const skip = (page - 1) * limit;

  const objectUserId = new mongoose.Types.ObjectId(
    String(userId)
  );

  const pipeline = [
    {
      $match: {
        user: objectUserId,
      },
    },

    // The first comment in each group will be the newest.
    {
      $sort: {
        createdAt: -1,
        _id: -1,
      },
    },

    {
      $group: {
        _id: "$post",
        latestComment: { $first: "$content" },
        commentedAt: { $first: "$createdAt" },
      },
    },

    // Exclude posts that no longer exist.
    {
      $lookup: {
        from: Post.collection.name,
        localField: "_id",
        foreignField: "_id",
        as: "post",
      },
    },

    { $unwind: "$post" },

    // Fetch only public author fields.
    {
      $lookup: {
        from: User.collection.name,
        let: { authorId: "$post.user" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$authorId"] },
            },
          },
          {
            $project: {
              username: 1,
              profileImg: 1,
              isVerified: 1,
            },
          },
        ],
        as: "author",
      },
    },

    { $unwind: "$author" },

    { $sort: { commentedAt: -1, _id: -1 } },

    {
      $facet: {
        metadata: [{ $count: "total" }],

        items: [
          { $skip: skip },
          { $limit: limit },
        ],
      },
    },
  ];

  const [result] = await Comment.aggregate(pipeline);

  const items = result?.items ?? [];
  const total = result?.metadata?.[0]?.total ?? 0;

  const postIds = items.map((item) => item.post._id);

  const { likedIds, savedIds } = await getPostFlags({
    userId,
    postIds,
  });

  const posts = items.map((item) =>
    formatActivityPost({
      post: {
        ...item.post,
        user: item.author,
      },

      isLiked: likedIds.has(String(item.post._id)),
      isSaved: savedIds.has(String(item.post._id)),

      activity: {
        latestComment: item.latestComment,
        commentedAt: item.commentedAt,
      },
    })
  );

  return {
    posts,
    pagination: createPagination({
      page,
      limit,
      total,
    }),
  };
};

module.exports = {
  getLikedPosts,
  getCommentedPosts,
};
