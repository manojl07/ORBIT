const express = require('express')
const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware')
const upload = require('../middlewares/upload.middleware')
const validate = require('../middlewares/validate.middleware')

const { createPostSchema } = require('../validators/post.validator')

const { createPostController, deletePostController, getUserPostsController, getFeedController, toggleLikeController } = require("../controllers/post.controller");
const { createCommentController, getCommentsController } = require('../controllers/comment.controller');

router.post('/',
  authMiddleware,
  upload.single('image'),
  validate(createPostSchema),
  createPostController
)

router.delete('/:id', authMiddleware, deletePostController);

router.get('/user/:userId', authMiddleware, getUserPostsController)

router.get('/feed', authMiddleware, getFeedController)

router.post('/:postId/like', authMiddleware, toggleLikeController)

router.post('/:postId/comments', authMiddleware, createCommentController);

router.get('/:postId/comments', getCommentsController);

module.exports = router;