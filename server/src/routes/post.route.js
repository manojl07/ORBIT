const express = require('express')
const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware')
const upload = require('../middlewares/upload.middleware')
const validate = require('../middlewares/validate.middleware')

const { createPostSchema } = require('../validators/post.validator')

const { createPostController, deletePostController, getUserPostsController } = require("../controllers/post.controller")

router.post('/',
  authMiddleware,
  upload.single('image'),
  validate(createPostSchema),
  createPostController
)

router.delete('/:id', authMiddleware, deletePostController);

router.get('/user/:userId', getUserPostsController)

module.exports = router;