const express = require('express')
const router = express.Router();

const { registerController, loginController } = require('../controllers/auth.controller')
const validate = require('../middlewares/validate.middleware')
const { registerSchema, loginSchema } = require('../validators/auth.validator')



router.post('/register', validate(registerSchema), registerController)
router.post('/login', validate(loginSchema), loginController)

module.exports = router;