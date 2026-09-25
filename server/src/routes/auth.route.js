const express = require("express");

const router = express.Router();

const { registerController, loginController, getMeController, refreshController, logoutController, logoutAllController, updateProfileController, verifyEmailController, resendVerificationController, forgotPasswordController, resetPasswordController, googleAuthController, googleCallbackController, } = require("../controllers/auth.controller");

const validate = require("../middlewares/validate.middleware");

const upload = require("../middlewares/upload.middleware");

const authMiddleware = require("../middlewares/auth.middleware");

const { registerSchema, loginSchema, tokenSchema, resendVerificationSchema, forgotPasswordSchema, resetPasswordSchema, updateProfileSchema, } = require("../validators/auth.validator");

const { authLimiter, sensitiveAuthLimiter, } = require("../middlewares/authRateLimit.middleware");

/* =====================================================
   LOCAL AUTH
===================================================== */

router.post("/register", authLimiter, upload.single("profileImg"), validate(registerSchema), registerController);

router.post("/login", authLimiter, validate(loginSchema), loginController);

/* =====================================================
   GOOGLE
===================================================== */

router.get("/google", authLimiter, googleAuthController);

router.get("/google/callback", googleCallbackController);

/* =====================================================
   AUTH SESSION
===================================================== */

router.get("/me", authMiddleware, getMeController);

router.post("/refresh", authLimiter, refreshController);

router.post("/logout", logoutController);

router.post("/logout-all", authMiddleware, logoutAllController);

/* =====================================================
   EMAIL VERIFICATION
===================================================== */

router.post("/verify-email", sensitiveAuthLimiter, validate(tokenSchema), verifyEmailController);

router.post("/resend-verification", sensitiveAuthLimiter, validate(resendVerificationSchema), resendVerificationController);

/* =====================================================
   PASSWORD RECOVERY
===================================================== */

router.post("/forgot-password", sensitiveAuthLimiter, validate(forgotPasswordSchema), forgotPasswordController);

router.post("/reset-password", sensitiveAuthLimiter, validate(resetPasswordSchema), resetPasswordController);

/* =====================================================
   PROFILE
===================================================== */

router.patch("/profile", authMiddleware, upload.single("profileImg"), validate(updateProfileSchema), updateProfileController);

module.exports = router;