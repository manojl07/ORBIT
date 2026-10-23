const User = require("../models/user.model");
const Post = require("../models/post.model");
const ApiError = require("../utils/ApiError");

/* =====================================================
   SANITIZE USER PROFILE
===================================================== */
const sanitizeUserProfile = (user, extras = {}) => ({
  id: user._id,
  username: user.username,
  bio: user.bio,
  profileImg: user.profileImg,
  isVerified: Boolean(user.isVerified),
  followersCount: user.followers.length,
  followingCount: user.following.length,
  ...extras,
});

/* =====================================================
   GET USER PROFILE
===================================================== */
const getUserProfile = async ({profileUserId,currentUserId,}) => {
  const [user, postsCount, currentUser] = await Promise.all([
    User.findById(profileUserId),
    Post.countDocuments({ user: profileUserId }),
    User.findById(currentUserId)
      .select("following")
      .lean(),
  ]);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // IDs of everyone the current user follows.
  const currentFollowingIds = new Set((currentUser?.following ?? []).map((id) => String(id))
  );

  // Find users who follow this profile AND are followed
  // by the currently logged-in user.
  const mutualIds = [
    ...new Set(
      user.followers
        .map((id) => String(id))
        .filter((id) => currentFollowingIds.has(id))
    ),
  ];

  // Only retrieve a small number of user previews.
  const mutualUsers = await User.find({
    _id: { $in: mutualIds },
  })
    .select("username profileImg")
    .limit(3)
    .lean();

  return sanitizeUserProfile(user, {
    postsCount,
    isOwnProfile:String(user._id) === String(currentUserId),
    isFollowing: user.followers.some((id) => String(id) === String(currentUserId)),

    // New data required by ProfileHeader.jsx.
    mutualFriends: {
      count: mutualIds.length,
      users: mutualUsers.map((friend) => ({
        id: String(friend._id),
        username: friend.username,
        profileImg: friend.profileImg,
      })),
    },
  });
};

/* =====================================================
   CHECK USERNAME
===================================================== */
const checkUsername = async ({ username, currentUserId, }) => {
  const normalizedUsername = username.trim().toLowerCase();

  const existingUser = await User.findOne({ username: normalizedUsername, }).select("_id").lean();

  const available = !existingUser || String(existingUser._id) === String(currentUserId);

  return { username: normalizedUsername, available, };
};

/* =====================================================
   FOLLOW / UNFOLLOW
===================================================== */
const toggleFollow = async ({ profileUserId, currentUserId, }) => {
  if (String(profileUserId) === String(currentUserId)) {
    throw new ApiError(400, "You cannot follow yourself.");
  }

  const [currentUser, targetUser,] = await Promise.all([
    User.findById(currentUserId),
    User.findById(profileUserId),
  ]);

  if (!currentUser) {
    throw new ApiError(404, "Current user not found");
  }

  if (!targetUser) {
    throw new ApiError(404, "User not found");
  }

  const alreadyFollowing = currentUser.following.some((id) => String(id) === String(profileUserId));

  if (alreadyFollowing) {
    currentUser.following.pull(profileUserId);
    targetUser.followers.pull(currentUserId);
  } else {
    currentUser.following.push(profileUserId);
    targetUser.followers.push(currentUserId);
  }

  await Promise.all([currentUser.save(), targetUser.save(),]);

  return {
    following: !alreadyFollowing,
    followersCount: targetUser.followers.length,
    followingCount: currentUser.following.length,
  };
};

/* =====================================================
   SEARCH USERS
===================================================== */
const searchUsers = async (query) => {
  const trimmedQuery = query?.trim();

  if (!trimmedQuery) {
    return [];
  }

  const users = await User.find({ username: { $regex: trimmedQuery, $options: "i", }, }).select("username profileImg")
    .sort({ username: 1, })
    .limit(10);

  return users.map((user) => ({
    id: user._id,
    username: user.username,
    profileImg: user.profileImg,
  })
  );
};

/* =====================================================
   FOLLOWERS
===================================================== */
const getFollowers = async ({ profileUserId, currentUserId, }) => {
  const user = await User.findById(profileUserId).populate("followers", "username profileImg followers");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user.followers.map((follower) => ({
    id: follower._id,
    username: follower.username,
    profileImg: follower.profileImg,
    isFollowing: follower.followers.some((id) => String(id) === String(currentUserId)),
  })
  );
};

/* =====================================================
   FOLLOWING
===================================================== */
const getFollowing = async ({ profileUserId, currentUserId, }) => {
  const user = await User.findById(profileUserId).populate("following", "username profileImg followers");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user.following.map((following) => ({
    id: following._id,
    username: following.username,
    profileImg: following.profileImg,
    isFollowing: following.followers.some((id) => String(id) === String(currentUserId)),
  })
  );
};

module.exports = { getUserProfile, checkUsername, toggleFollow, searchUsers, getFollowers, getFollowing, };