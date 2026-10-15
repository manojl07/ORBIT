
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const activityService = require("../services/activity.service");

/* =====================================================
   GET LIKED POSTS
===================================================== */

const getLikedPostsController = asyncHandler(
  async (req, res) => {
    const requestedPage = Number.parseInt(req.query.page, 10);
    const requestedLimit = Number.parseInt(req.query.limit, 10);

    const page =
      Number.isFinite(requestedPage) && requestedPage > 0
        ? requestedPage
        : 1;

    const limit =
      Number.isFinite(requestedLimit) && requestedLimit > 0
        ? Math.min(requestedLimit, 30)
        : 12;

    const result = await activityService.getLikedPosts({
      userId: req.user.id,
      page,
      limit,
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        "Liked posts fetched successfully",
        result
      )
    );
  }
);

/* =====================================================
   GET COMMENTED POSTS
===================================================== */

const getCommentedPostsController = asyncHandler(
  async (req, res) => {
    const requestedPage = Number.parseInt(req.query.page, 10);
    const requestedLimit = Number.parseInt(req.query.limit, 10);

    const page =
      Number.isFinite(requestedPage) && requestedPage > 0
        ? requestedPage
        : 1;

    const limit =
      Number.isFinite(requestedLimit) && requestedLimit > 0
        ? Math.min(requestedLimit, 30)
        : 12;

    const result = await activityService.getCommentedPosts({
      userId: req.user.id,
      page,
      limit,
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        "Commented posts fetched successfully",
        result
      )
    );
  }
);

module.exports = {
  getLikedPostsController,
  getCommentedPostsController,
};
