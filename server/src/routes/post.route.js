const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");
const validate = require("../middlewares/validate.middleware");

const { createPostSchema } = require("../validators/post.validator");

const {
  createPostController,
  deletePostController,
  getUserPostsController,
  getFeedController,
  toggleLikeController,
} = require("../controllers/post.controller");

const {
  savePostController,
  unsavePostController,
  getSavedPostsController,
} = require("../controllers/savedPost.controller");

const {
  createCommentController,
  getCommentsController,
} = require("../controllers/comment.controller");

const {
  getLikedPostsController,
  getCommentedPostsController,
} = require("../controllers/activity.controller");

/* =====================================================
   SAVED POSTS
===================================================== */

router.get(
  "/saved",
  authMiddleware,
  getSavedPostsController
);

/* =====================================================
   CREATE / DELETE POSTS
===================================================== */

router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  validate(createPostSchema),
  createPostController
);

router.delete(
  "/:id",
  authMiddleware,
  deletePostController
);

/* =====================================================
   USER POSTS / FEED
===================================================== */

router.get(
  "/user/:userId",
  authMiddleware,
  getUserPostsController
);

router.get(
  "/feed",
  authMiddleware,
  getFeedController
);

/* =====================================================
   LIKE
===================================================== */

router.post(
  "/:postId/like",
  authMiddleware,
  toggleLikeController
);

/* =====================================================
   SAVE / UNSAVE
===================================================== */

router.put(
  "/:postId/save",
  authMiddleware,
  savePostController
);

router.delete(
  "/:postId/save",
  authMiddleware,
  unsavePostController
);

/* =====================================================
   COMMENTS
===================================================== */

router.post(
  "/:postId/comments",
  authMiddleware,
  createCommentController
);

router.get(
  "/:postId/comments",
  getCommentsController
);

/* =====================================================
   PRIVATE ACTIVITY COLLECTIONS
===================================================== */

router.get(
  "/liked",
  authMiddleware,
  getLikedPostsController
);

router.get(
  "/commented",
  authMiddleware,
  getCommentedPostsController
);

module.exports = router;