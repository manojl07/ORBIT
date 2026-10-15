
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
  followersCount: user.followers?.length ?? 0,
  followingCount: user.following?.length ?? 0,
  ...extras,
});

/* =====================================================
   GET PUBLIC PROFILE + MUTUAL CONNECTIONS
===================================================== */

const getUserProfile = async ({
  profileUserId,
  currentUserId,
}) => {
  const [profileUser, postsCount, currentUser] =
    await Promise.all([
      User.findById(profileUserId)
        .select(
          "username bio profileImg followers following isVerified"
        )
        .lean(),

      Post.countDocuments({
        user: profileUserId,
      }),

      currentUserId
        ? User.findById(currentUserId)
            .select("following")
            .lean()
        : null,
    ]);

  if (!profileUser) {
    throw new ApiError(404, "User not found");
  }

  const isOwnProfile =
    String(profileUser._id) === String(currentUserId);

  let mutualFriends = {
    count: 0,
    users: [],
  };

  if (!isOwnProfile && currentUser) {
    // Accounts the current viewer follows.
    const viewerFollowing = new Set(
      (currentUser.following ?? []).map(String)
    );

    // Accounts that follow the profile being viewed.
    const profileFollowers = profileUser.followers ?? [];

    // Their intersection is the mutual connection set.
    const mutualIds = profileFollowers
      .filter((id) => viewerFollowing.has(String(id)))
      .map(String);

    // Fetch only a few public previews for the UI.
    const previewIds = mutualIds.slice(0, 3);

    const mutualUsers = previewIds.length
      ? await User.find({
          _id: { $in: previewIds },
        })
          .select("username profileImg")
          .lean()
      : [];

    mutualFriends = {
      count: mutualIds.length,
      users: mutualUsers.map((mutualUser) => ({
        id: mutualUser._id,
        username: mutualUser.username,
        profileImg: mutualUser.profileImg,
      })),
    };
  }

  return sanitizeUserProfile(profileUser, {
    postsCount,
    isOwnProfile,
    isFollowing: (profileUser.followers ?? []).some(
      (id) => String(id) === String(currentUserId)
    ),
    mutualFriends,
  });
};

/* =====================================================
   CHECK USERNAME
===================================================== */

const checkUsername = async ({
  username,
  currentUserId,
}) => {
  const normalizedUsername =
    username.trim().toLowerCase();

  const existingUser = await User.findOne({
    username: normalizedUsername,
  })
    .select("_id")
    .lean();

  const available =
    !existingUser ||
    String(existingUser._id) === String(currentUserId);

  return {
    username: normalizedUsername,
    available,
  };
};

/* =====================================================
   FOLLOW / UNFOLLOW
===================================================== */

const toggleFollow = async ({
  profileUserId,
  currentUserId,
}) => {
  if (String(profileUserId) === String(currentUserId)) {
    throw new ApiError(400, "You cannot follow yourself.");
  }

  const [currentUser, targetUser] = await Promise.all([
    User.findById(currentUserId),
    User.findById(profileUserId),
  ]);

  if (!currentUser) {
    throw new ApiError(404, "Current user not found");
  }

  if (!targetUser) {
    throw new ApiError(404, "User not found");
  }

  const alreadyFollowing = currentUser.following.some(
    (id) => String(id) === String(profileUserId)
  );

  if (alreadyFollowing) {
    currentUser.following.pull(profileUserId);
    targetUser.followers.pull(currentUserId);
  } else {
    currentUser.following.push(profileUserId);
    targetUser.followers.push(currentUserId);
  }

  await Promise.all([
    currentUser.save(),
    targetUser.save(),
  ]);

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

  const users = await User.find({
    username: {
      $regex: trimmedQuery,
      $options: "i",
    },
  })
    .select("username profileImg isVerified")
    .sort({ username: 1 })
    .limit(10)
    .lean();

  return users.map((user) => ({
    id: user._id,
    username: user.username,
    profileImg: user.profileImg,
    isVerified: Boolean(user.isVerified),
  }));
};

/* =====================================================
   FOLLOWERS
===================================================== */

const getFollowers = async ({
  profileUserId,
  currentUserId,
}) => {
  const user = await User.findById(profileUserId)
    .populate(
      "followers",
      "username profileImg followers isVerified"
    );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user.followers
    .filter(Boolean)
    .map((follower) => ({
      id: follower._id,
      username: follower.username,
      profileImg: follower.profileImg,
      isVerified: Boolean(follower.isVerified),
      isFollowing: follower.followers.some(
        (id) => String(id) === String(currentUserId)
      ),
    }));
};

/* =====================================================
   FOLLOWING
===================================================== */

const getFollowing = async ({
  profileUserId,
  currentUserId,
}) => {
  const user = await User.findById(profileUserId)
    .populate(
      "following",
      "username profileImg followers isVerified"
    );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user.following
    .filter(Boolean)
    .map((following) => ({
      id: following._id,
      username: following.username,
      profileImg: following.profileImg,
      isVerified: Boolean(following.isVerified),
      isFollowing: following.followers.some(
        (id) => String(id) === String(currentUserId)
      ),
    }));
};

module.exports = {
  getUserProfile,
  checkUsername,
  toggleFollow,
  searchUsers,
  getFollowers,
  getFollowing,
};
