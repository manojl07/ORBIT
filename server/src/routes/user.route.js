const express = require('express')
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware')

const {getUserProfileController, toggleFollowController, searchUsersController} = require('../controllers/user.controller')



router.get('/search', authMiddleware, searchUsersController);

router.get('/:userId', authMiddleware, getUserProfileController);

router.patch('/:userId/follow', authMiddleware, toggleFollowController)

module.exports = router;