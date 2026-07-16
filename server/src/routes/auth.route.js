const express = require('express')
const router = express.Router();

const { registerController, loginController } = require('../controllers/auth.controller')
const validate = require('../middlewares/validate.middleware')
const { registerSchema, loginSchema } = require('../validators/auth.validator')

const upload = require('../middlewares/upload.middleware')

router.post('/register',
  upload.single("profileImg"),
  validate(registerSchema),
  registerController)

router.post('/login',
  validate(loginSchema),
  loginController)

module.exports = router;