const express = require('express')
const router = express.Router();

const { registerController, loginController, refreshController, logoutController, logoutAllController, getMeController, updateProfileController } = require('../controllers/auth.controller')

const validate = require('../middlewares/validate.middleware')

const { registerSchema, loginSchema, refreshSchema, logoutSchema, updateProfileSchema } = require('../validators/auth.validator')

const upload = require('../middlewares/upload.middleware')

const authMiddleware = require('../middlewares/auth.middleware')


router.post('/register',
  upload.single("profileImg"),
  validate(registerSchema),
  registerController)

router.post('/login',
  validate(loginSchema),
  loginController)

router.get('/me', authMiddleware, getMeController)

router.post('/refresh', refreshController)

router.post('/logout', logoutController)

router.post('/logout-all', authMiddleware, logoutAllController)

router.patch('/profile', authMiddleware, upload.single("profileImg"), validate(updateProfileSchema), updateProfileController)

module.exports = router;