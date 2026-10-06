const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");

const validate = require("../middlewares/validate.middleware");

const {validateQuery,} = validate;

const {checkUsernameSchema,} = require("../validators/auth.validator");

const {usernameCheckLimiter,} = require("../middlewares/authRateLimit.middleware");

const {getUserProfileController,  checkUsernameController,  toggleFollowController,  searchUsersController,  getFollowersController,getFollowingController,} = require("../controllers/user.controller");

/* =====================================================
   SEARCH
===================================================== */
router.get("/search",authMiddleware,searchUsersController);

/* =====================================================
   USERNAME AVAILABILITY
===================================================== */
router.get("/check-username",authMiddleware,usernameCheckLimiter,validateQuery(checkUsernameSchema),checkUsernameController);

/* =====================================================
   FOLLOWERS
===================================================== */
router.get("/:userId/followers",authMiddleware,getFollowersController);

/* =====================================================
   FOLLOWING
===================================================== */
router.get("/:userId/following",authMiddleware,getFollowingController);

/* =====================================================
   PUBLIC PROFILE
===================================================== */
router.get("/:userId",  authMiddleware,getUserProfileController);

/* =====================================================
   FOLLOW / UNFOLLOW
===================================================== */
router.patch("/:userId/follow",authMiddleware,toggleFollowController);

module.exports = router;