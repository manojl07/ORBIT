const User = require('../models/user.model')
const Post = require('../models/post.model')
const ApiError = require('../utils/ApiError')


const sanitizeUserProfile = (user, extras = {}) => ({
  id: user._id,
  username: user.username,
  bio: user.bio,
  profileImg: user.profileImg,

  followersCount: user.followers.length,
  followingCount: user.following.length,

  ...extras,
})

/* ----------------------------------------
   GET PUBLIC PROFILE
-----------------------------------------*/
const getUserProfile = async ({ profileUserId, currentUserId }) => {
  const [user, postsCount] = await Promise.all([
    User.findById(profileUserId),
    Post.countDocuments({ user: profileUserId })
  ])

  if (!user) throw new ApiError(404, "User not found");

  return sanitizeUserProfile(user, {
    postsCount,
    isOwnProfile: user._id.toString() === currentUserId,
    isFollowing: user.followers.some((id) => id.toString() === currentUserId)
  })
}

/* ----------------------------------------
   FOLLOW / UNFOLLOW
-----------------------------------------*/
const toggleFollow = async ({ profileUserId, currentUserId }) => {
  if (String(profileUserId) === String(currentUserId)) {
    throw new ApiError(400, "You cannot follow yourself.")
  }

  const [currentUser, targetUser] = await Promise.all([User.findById(currentUserId), User.findById(profileUserId)])

  if (!currentUser) {
    throw new ApiError(404, "Current user not found");
  }

  if (!targetUser) {
    throw new ApiError(404, "User not found");
  }

  const alreadyFollowing = currentUser.following.some((id) => String(id) === String(profileUserId))

  if (alreadyFollowing) {
    currentUser.following.pull(profileUserId)
    targetUser.followers.pull(currentUserId)
  } else {
    currentUser.following.push(profileUserId);
    targetUser.followers.push(currentUserId);
  }

  await Promise.all([currentUser.save(), targetUser.save()])

  return {
    following: !alreadyFollowing,
    followersCount: targetUser.followers.length,
    followingCount: currentUser.following.length,
  }
}

/* ----------------------------------------
   SEARCH USERS
-----------------------------------------*/
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
    .select("username profileImg")
    .sort({ username: 1 })
    .limit(10);

  return users.map((user) => ({
    id: user._id,
    username: user.username,
    profileImg: user.profileImg,
  }));
};


/* ----------------------------------------
   FOLLOWERS
-----------------------------------------*/
const getFollowers = async ({ profileUserId, currentUserId }) => {
  const user = await User.findById(profileUserId).populate("followers", "username profileImg followers")

  if (!user) {
    throw new ApiError(404, "User not found")
  }

  return user.followers.map((follower) => ({ id: follower._id, username: follower.username, profileImg: follower.profileImg, isFollowing: follower.followers.some((id) => String(id) === String(currentUserId)) }))
}


/* ----------------------------------------
   FOLLOWING
-----------------------------------------*/
const getFollowing = async ({
  profileUserId,
  currentUserId,
}) => {

  console.log("========== GET FOLLOWING ==========");
  console.log("profileUserId:", profileUserId);
  console.log("currentUserId:", currentUserId);

  const user = await User.findById(profileUserId)
    .populate(
      "following",
      "username profileImg followers"
    );

  console.log("Found user:", user?._id);
  console.log("Username:", user?.username);
  console.log("Following IDs:", user?.following?.map(
    (u) => String(u._id)
  ));

  if (!user) {
    throw new ApiError(
      404,
      "User not found"
    );
  }

  return user.following.map((following) => ({
    id: following._id,
    username: following.username,
    profileImg: following.profileImg,

    isFollowing: following.followers.some(
      (id) =>
        String(id) ===
        String(currentUserId)
    ),
  }));
};


module.exports = { getUserProfile, toggleFollow, searchUsers, getFollowers, getFollowing }