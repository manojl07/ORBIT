const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");

const crypto = require("crypto");

const authService = require("../services/auth.service");

const { accessCookieOptions, refreshCookieOptions, } = require("../config/cookie.config");

const { getGoogleAuthUrl, exchangeGoogleCode, } = require("../config/google.config");




const setAuthCookies = (res, { accessToken, refreshToken, deviceId, }) => {

  res.cookie("accessToken", accessToken, accessCookieOptions);

  res.cookie("refreshToken", refreshToken, refreshCookieOptions);

  res.cookie("deviceId", deviceId, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 7 * 24 * 60 * 60 * 1000, });
};

const clearAuthCookies = (res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.clearCookie("deviceId");
};



/* =====================================================
   REGISTER
===================================================== */
const registerController = asyncHandler(async (req, res) => {
  const result = await authService.register({
    ...req.body,
    profileImg: req.file,
    deviceId: crypto.randomUUID(),
    userAgent: req.get("user-agent"),
    ipAddress: req.ip,
  });

  setAuthCookies(res, result);

  return res.status(201).json(new ApiResponse(201, "User registered successfully", { user: result.user, sessionId: result.sessionId, verificationEmailSent: result.verificationEmailSent, }));
});

/* =====================================================
   LOGIN
===================================================== */
const loginController = asyncHandler(async (req, res) => {
  const result = await authService.login({
    identifier: req.body.identifier,

    password: req.body.password,

    deviceId: crypto.randomUUID(),

    userAgent: req.get("user-agent"),

    ipAddress: req.ip,
  });

  setAuthCookies(res, result);

  return res.status(200).json(new ApiResponse(200, "Login successful", { user: result.user, sessionId: result.sessionId, }));
});

/* =====================================================
   GET ME
===================================================== */
const getMeController = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);

  return res.status(200).json(new ApiResponse(200, "User fetched successfully", user));
});

/* =====================================================
   REFRESH
===================================================== */
const refreshController = asyncHandler(async (req, res) => {
  const result = await authService.refresh({
    refreshToken: req.cookies.refreshToken,
    deviceId: req.cookies.deviceId,
    userAgent: req.get("user-agent"),
    ipAddress: req.ip,
  });

  res.cookie("accessToken", result.accessToken, accessCookieOptions);

  res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);

  return res.status(200).json(new ApiResponse(200, "Token refreshed", { sessionId: result.sessionId, }));
});

/* =====================================================
   LOGOUT
===================================================== */
const logoutController = asyncHandler(async (req, res) => {
  await authService.logout(req.cookies.refreshToken);

  clearAuthCookies(res);

  return res.status(200).json(new ApiResponse(200, "Logged out successfully"));
});

/* =====================================================
   LOGOUT ALL
===================================================== */
const logoutAllController = asyncHandler(async (req, res) => {
  await authService.logoutAll(req.user.id);

  clearAuthCookies(res);

  return res.status(200).json(new ApiResponse(200, "Logged out from all devices"));
});

/* =====================================================
   UPDATE PROFILE
===================================================== */
const updateProfileController = asyncHandler(async (req, res) => {
  const updatedUser = await authService.updateProfile({
    userId: req.user.id,
    bio: req.body.bio,
    profileImg: req.file,
  });

  return res.status(200).json(new ApiResponse(200, "Profile updated successfully", updatedUser));
});

/* =====================================================
   VERIFY EMAIL
===================================================== */
const verifyEmailController = asyncHandler(async (req, res) => {
  const user = await authService.verifyEmail(req.body.token);

  return res.status(200).json(new ApiResponse(200, "Email verified successfully", user));
});

/* =====================================================
   RESEND VERIFICATION
===================================================== */
const resendVerificationController = asyncHandler(async (req, res) => {
  const result = await authService.resendVerification(req.body.email);

  return res.status(200).json(new ApiResponse(200, result.message));
});

/* =====================================================
   FORGOT PASSWORD
===================================================== */
const forgotPasswordController = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body.email);

  return res.status(200).json(new ApiResponse(200, result.message));
});

/* =====================================================
   RESET PASSWORD
===================================================== */
const resetPasswordController = asyncHandler(async (req, res) => {
  await authService.resetPassword({ token: req.body.token, password: req.body.password, });

  clearAuthCookies(res);

  return res.status(200).json(new ApiResponse(200, "Password reset successfully"));
});

/* =====================================================
   GOOGLE START
===================================================== */
const googleAuthController = asyncHandler(async (req, res) => {
  const { OAuth2Client, } = require("google-auth-library");

  const state = crypto.randomBytes(32).toString("hex");

  const nonce = crypto.randomBytes(32).toString("hex");

  const tempClient = new OAuth2Client();

  const { codeVerifier, codeChallenge, } = await tempClient.generateCodeVerifierAsync();

  const authUrl = getGoogleAuthUrl({ state, codeChallenge, nonce, });

  const oauthCookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 10 * 60 * 1000, path: "/api/auth", };

  res.cookie("oauthState", state, oauthCookieOptions);

  res.cookie("oauthCodeVerifier", codeVerifier, oauthCookieOptions);

  res.cookie("oauthNonce", nonce, oauthCookieOptions);

  return res.redirect(authUrl);
});

/* =====================================================
   GOOGLE CALLBACK
===================================================== */
const googleCallbackController = asyncHandler(async (req, res) => {
  const clientUrl = (process.env.CLIENT_URL || "").replace(/\/$/, "");

  const { code, state, error, } = req.query;

  const oauthCookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/api/auth", };

  const cleanupOAuthCookies = () => {
    res.clearCookie("oauthState", oauthCookieOptions);

    res.clearCookie("oauthCodeVerifier", oauthCookieOptions);

    res.clearCookie("oauthNonce", oauthCookieOptions);
  };

  if (error) {
    cleanupOAuthCookies();

    return res.redirect(`${clientUrl}/login?oauth=cancelled`);
  }

  if (!code || !state || !req.cookies.oauthState) {
    cleanupOAuthCookies();

    return res.redirect(`${clientUrl}/login?oauth=invalid`);
  }

  const storedState = req.cookies.oauthState;

  if (storedState.length !== state.length) {
    cleanupOAuthCookies();

    return res.redirect(`${clientUrl}/login?oauth=invalid`);
  }

  const validState = crypto.timingSafeEqual(Buffer.from(storedState), Buffer.from(state));

  if (!validState) {
    cleanupOAuthCookies();

    return res.redirect(`${clientUrl}/login?oauth=invalid`);
  }

  try {
    const googleProfile = await exchangeGoogleCode({ code, codeVerifier: req.cookies.oauthCodeVerifier, });

    if (googleProfile.nonce !== req.cookies.oauthNonce) {
      throw new ApiError(401, "Invalid Google authentication response");
    }

    const result = await authService.loginWithGoogle({
      googleId: googleProfile.sub,
      email: googleProfile.email,
      emailVerified: googleProfile.email_verified === true,
      name: googleProfile.name,
      picture: googleProfile.picture,
      deviceId: crypto.randomUUID(),
      userAgent: req.get("user-agent"),
      ipAddress: req.ip,
    });

    setAuthCookies(res, result);

    cleanupOAuthCookies();

    return res.redirect(`${clientUrl}/`);
  } catch (oauthError) {
    cleanupOAuthCookies();

    console.error("Google OAuth failed:", oauthError);

    return res.redirect(`${clientUrl}/login?oauth=failed`);
  }
});

module.exports = { registerController, loginController, getMeController, refreshController, logoutController, logoutAllController, updateProfileController, verifyEmailController, resendVerificationController, forgotPasswordController, resetPasswordController, googleAuthController, googleCallbackController, };