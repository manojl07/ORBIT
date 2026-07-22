const express = require('express')
const router = express.Router();

const { registerController, loginController, refreshController, logoutController, logoutAllController, getMeController } = require('../controllers/auth.controller')

const validate = require('../middlewares/validate.middleware')

const { registerSchema, loginSchema, refreshSchema, logoutSchema } = require('../validators/auth.validator')

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

router.get('/me', authMiddleware, (req, res) => {
  res.json({
    success: true, user: req.user
  })
})

module.exports = router;