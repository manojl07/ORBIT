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
const toggleFollowController = asyncHandler(async(req, res) => {
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


module.exports = {getUserProfileController, toggleFollowController, searchUsersController}




















