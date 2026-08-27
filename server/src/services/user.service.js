const User = require('../models/user.model')
const Post = require('../models/post.model')
const ApiError = require('../utils/ApiError')


const sanitizeUserProfile = (user, extras= {}) =>({
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
const getUserProfile = async ({profileUserId, currentUserId}) => {
  const [user, postsCount] = await Promise.all([
    User.findById(profileUserId), 
    Post.countDocuments({user: profileUserId})
  ])

  if(!user) throw new ApiError(404, "User not found");

  return sanitizeUserProfile(user, {
    postsCount,
    isOwnProfile: user._id.toString() === currentUserId,
    isFollowing: user.followers.some((id) => id.toString() === currentUserId)
  })
}

/* ----------------------------------------
   FOLLOW / UNFOLLOW
-----------------------------------------*/
const toggleFollow = async ({profileUserId, currentUserId}) => {
  if(profileUserId === currentUserId) {
    throw new ApiError(400, "You cannot follow yourself.")
  }

  const [currentUser, targetUser] = await Promise.all([User.findById(currentUserId), User.findById(profileUserId)])

  if(!targetUser){
    throw new ApiError(404, "User not found");
  }

  const alreadyFollowing = currentUser.following.some((id) => id.toString() === profileUserId)

  if(alreadyFollowing){
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

module.exports = {getUserProfile, toggleFollow, searchUsers}