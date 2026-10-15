const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const savedPostService = require("../services/savedPost.service");

/* =====================================================
   SAVE POST
===================================================== */

const savePostController = asyncHandler(async (req, res) => {
  const result = await savedPostService.savePost({
    postId: req.params.postId,
    userId: req.user.id,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Post saved successfully", result)
    );
});

/* =====================================================
   UNSAVE POST
===================================================== */

const unsavePostController = asyncHandler(async (req, res) => {
  const result = await savedPostService.unsavePost({
    postId: req.params.postId,
    userId: req.user.id,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Post removed from saved posts", result)
    );
});

/* =====================================================
   GET SAVED POSTS
===================================================== */

const getSavedPostsController = asyncHandler(
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

    const result = await savedPostService.getSavedPosts({
      userId: req.user.id,
      page,
      limit,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, "Saved posts fetched successfully", result)
      );
  }
);

module.exports = {
  savePostController,
  unsavePostController,
  getSavedPostsController,
};