const express = require("express")
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware')
const {deleteCommentController} = require('../controllers/comment.controller')


router.delete('/:commentId', authMiddleware, deleteCommentController)

module.exports = router;