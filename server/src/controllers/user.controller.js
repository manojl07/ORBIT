const asyncHandler = require('../utils/asyncHandler')
const ApiResponse = require('../utils/ApiResponse')
const userService = require("../services/user.service");


/* -------------------------
   GET USER PROFILE
--------------------------*/
const getUserProfileController = asyncHandler(async (req, res) => {
  const result = await userService.getUserProfile({
    profileUserId: req.params.userId,
    currentUserId: req.user.id,
  })

  return res.status(200).json(new ApiResponse(200, "Profile fetched successfully", result))
})



/* -------------------------
   FOLLOW / UNFOLLOW
--------------------------*/
const toggleFollowController = asyncHandler(async (req, res) => {
  const result = await userService.toggleFollow({
    profileUserId: req.params.userId,
    currentUserId: req.user.id,
  })

  return res.status(200).json(new ApiResponse(200, result.following ? "User followed" : "User unfollowed", result))
})


/* -------------------------
   SEARCH USERS
--------------------------*/
const searchUsersController = asyncHandler(async (req, res) => {
  const users = await userService.searchUsers(req.query.q);

  return res.status(200).json(new ApiResponse(200, "User fetched successfully", users))
})


const getFollowersController = asyncHandler(async (req, res) => {
  const result = await userService.getFollowers({ profileUserId: req.params.userId, currentUserId: req.user.id })

  return res.status(200).json(new ApiResponse(200, "Followers fetched successfully", result))
})


const getFollowingController =
  asyncHandler(async (req, res) => {
    const result = await userService.getFollowing({ profileUserId: req.params.userId, currentUserId: req.user.id, });

    return res.status(200).json(
      new ApiResponse(200, "Following fetched successfully", result)
    );
  });


module.exports = { getUserProfileController, toggleFollowController, searchUsersController, getFollowersController, getFollowingController }




















