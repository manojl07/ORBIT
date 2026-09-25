const crypto = require("crypto");

const User = require("../models/user.model");
const Session = require("../models/session.model");
const Post = require("../models/post.model");
const AuthToken = require("../models/authToken.model");

const ApiError = require("../utils/ApiError");

const { createTokens, } = require("./token.service");

const { uploadImage, deleteImage, } = require("./image.service");

const { verifyRefreshToken, } = require("../utils/jwt");

const { generateOneTimeToken, hashOneTimeToken, } = require("../utils/oneTimeToken");

const { sendVerificationEmail, sendPasswordResetEmail, } = require("./email.service");

/* =====================================================
   USER SANITIZER
===================================================== */

const sanitizeUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  bio: user.bio,
  profileImg: user.profileImg,
  followersCount: user.followers.length,
  followingCount: user.following.length,
  isVerified: user.isVerified,
  createdAt: user.createdAt,
});

/* =====================================================
   HASH REFRESH TOKEN
===================================================== */

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

/* =====================================================
   FIND LOCAL USER
===================================================== */

const findUser = async (identifier) => {
  const normalized = identifier.trim().toLowerCase();

  const user = await User.findOne({
    $or: [{ email: normalized }, { username: normalized },],
  }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  return user;
};

/* =====================================================
   SESSION
===================================================== */

const createSession = async ({ user, refreshToken, deviceId, userAgent, ipAddress, }) => {
  const tokenHash = hashToken(refreshToken);

  return Session.create({ user: user._id, tokenHash, deviceId, userAgent, ipAddress, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), });
};

/* =====================================================
   CREATE ONE-TIME TOKEN
===================================================== */

const createAuthToken = async ({ userId, type, expiresIn, }) => {
  await AuthToken.deleteMany({ user: userId, type, });

  const rawToken = generateOneTimeToken();

  const tokenHash = hashOneTimeToken(rawToken);

  await AuthToken.create({ user: userId, tokenHash, type, expiresAt: new Date(Date.now() + expiresIn), });

  return rawToken;
};

/* =====================================================
   REGISTER
===================================================== */

const register = async ({ username, email, password, bio, deviceId, userAgent, ipAddress, profileImg, }) => {
  username = username.trim().toLowerCase();

  email = email.trim().toLowerCase();

  const existing = await User.findOne({ $or: [{ email }, { username },], });

  if (existing) {
    throw new ApiError(409, "User already exists");
  }

  const uploadedImage = profileImg ? await uploadImage(profileImg) : null;

  const userData = { username, email, password, bio, };

  if (uploadedImage) {
    userData.profileImg = uploadedImage.imageUrl;

    userData.profileImgFileId = uploadedImage.imageFileId ?? uploadedImage.fileId ?? null;
  }

  const user = await User.create(userData);

  const verificationToken = await createAuthToken({ userId: user._id, type: "emailVerification", expiresIn: 24 * 60 * 60 * 1000, });

  let verificationEmailSent = true;

  try {
    await sendVerificationEmail({
      email: user.email, username: user.username, token: verificationToken,
    });
  } catch (error) {
    verificationEmailSent = false;

    console.error("Verification email failed:", error);
  }

  const { accessToken, refreshToken, } = createTokens(user);

  const session = await createSession({ user, refreshToken, deviceId, userAgent, ipAddress, });

  const postsCount = await Post.countDocuments({ user: user._id, });

  return {
    user: {
      ...sanitizeUser(user),
      postsCount,
    },
    accessToken,
    refreshToken,
    sessionId: session._id,
    deviceId,
    verificationEmailSent,
  };
};

/* =====================================================
   LOGIN
===================================================== */

const login = async ({ identifier, password, deviceId, userAgent, ipAddress, }) => {
  const user = await findUser(identifier);

  const matched = await user.comparePassword(password);

  if (!matched) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken, } = createTokens(user);

  const session = await createSession({ user, refreshToken, deviceId, userAgent, ipAddress, });

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
    sessionId: session._id,
    deviceId,
  };
};

/* =====================================================
   GOOGLE LOGIN
===================================================== */

const generateGoogleUsername = async (name, email) => {
  const emailPrefix = email.split("@")[0];

  let base = (name || emailPrefix).toLowerCase().replace(/[^a-z0-9._]/g, "").slice(0, 24);

  if (base.length < 3) {
    base = "user";
  }

  let username = base;

  let counter = 0;

  while (
    await User.exists({
      username,
    })
  ) {
    counter += 1;

    const suffix = `_${counter}`;

    username = `${base.slice(0, 30 - suffix.length)}${suffix}`;

    if (counter >= 1000) {
      username = `${base.slice(0, 20)}_${crypto.randomBytes(4).toString("hex").slice(0, 8)}`;
      break;
    }
  }

  return username;
};

const loginWithGoogle = async ({ googleId, email, emailVerified, name, picture, deviceId, userAgent, ipAddress, }) => {
  if (!googleId || !email || !emailVerified) {
    throw new ApiError(401, "Google account could not be verified");
  }

  email = email.trim().toLowerCase();

  let user = await User.findOne({ googleId, });

  if (!user) {
    user = await User.findOne({ email, });
  }

  if (user) {
    user.googleId = googleId;

    user.isVerified = true;

    user.emailVerifiedAt = user.emailVerifiedAt || new Date();

    if (picture && !user.profileImg) {
      user.profileImg = picture;
    }

    await user.save();
  } else {
    const username = await generateGoogleUsername(name, email);

    user = await User.create({ username, email, googleId, profileImg: picture || undefined, isVerified: true, emailVerifiedAt: new Date(), });
  }

  const { accessToken, refreshToken, } = createTokens(user);

  const session = await createSession({ user, refreshToken, deviceId, userAgent, ipAddress, });

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
    sessionId: session._id,
    deviceId,
  };
};

/* =====================================================
   GET ME
===================================================== */

const getMe = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const postsCount = await Post.countDocuments({ user: userId, });

  return {
    ...sanitizeUser(user),
    postsCount,
  };
};

/* =====================================================
   REFRESH
===================================================== */

const refresh = async ({ refreshToken, deviceId, userAgent, ipAddress, }) => {
  if (!refreshToken) {
    throw new ApiError(401, "Refresh token missing");
  }

  const decoded = verifyRefreshToken(refreshToken);

  const tokenHash = hashToken(refreshToken);

  const session = await Session.findOne({ tokenHash, deviceId, });

  if (!session) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const { accessToken, refreshToken: newRefreshToken, } = createTokens(user);

  await Session.findByIdAndDelete(session._id);

  const newSession = await createSession({ user, refreshToken: newRefreshToken, deviceId, userAgent, ipAddress, });

  return {
    accessToken,
    refreshToken: newRefreshToken,
    sessionId: newSession._id,
  };
};

/* =====================================================
   LOGOUT
===================================================== */

const logout = async (refreshToken) => {
  if (!refreshToken) {
    return true;
  }

  const tokenHash = hashToken(refreshToken);

  await Session.findOneAndDelete({ tokenHash, });

  return true;
};

const logoutAll = async (userId) => {
  await Session.deleteMany({ user: userId, });

  return true;
};

/* =====================================================
   VERIFY EMAIL
===================================================== */

const verifyEmail = async (rawToken) => {
  const tokenHash = hashOneTimeToken(rawToken);

  const authToken = await AuthToken.findOne({ tokenHash, type: "emailVerification", expiresAt: { $gt: new Date(), }, });

  if (!authToken) {
    throw new ApiError(400, "Invalid or expired verification link", "INVALID_VERIFICATION_TOKEN");
  }

  const user = await User.findById(authToken.user);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.isVerified = true;

  user.emailVerifiedAt = new Date();

  await user.save();

  await AuthToken.findByIdAndDelete(authToken._id);

  return sanitizeUser(user);
};

/* =====================================================
   RESEND VERIFICATION
===================================================== */

const resendVerification = async (email) => {

  const normalized = email.trim().toLowerCase();

  const genericResponse = "If the account exists, a verification email has been sent.";

  const user = await User.findOne({ email: normalized, });

  if (!user) {
    return {
      message: genericResponse,
    };
  }

  if (user.isVerified) {
    return {
      message: genericResponse,
    };
  }

  const token = await createAuthToken({ userId: user._id, type: "emailVerification", expiresIn: 24 * 60 * 60 * 1000, });

  await sendVerificationEmail({ email: user.email, username: user.username, token, });

  return {
    message: genericResponse,
  };
};

/* =====================================================
   FORGOT PASSWORD
===================================================== */

const forgotPassword = async (email) => {
  const normalized = email.trim().toLowerCase();

  const genericResponse = "If an account exists with that email, a password reset link has been sent.";

  const user = await User.findOne({ email: normalized, });

  if (!user) {
    return {
      message: genericResponse,
    };
  }

  const token = await createAuthToken({ userId: user._id, type: "passwordReset", expiresIn: 15 * 60 * 1000, });

  await sendPasswordResetEmail({ email: user.email, username: user.username, token, });

  return {
    message: genericResponse,
  };
};

/* =====================================================
   RESET PASSWORD
===================================================== */

const resetPassword = async ({ token, password, }) => {
  const tokenHash = hashOneTimeToken(token);

  const authToken = await AuthToken.findOne({ tokenHash, type: "passwordReset", expiresAt: { $gt: new Date(), }, });

  if (!authToken) {
    throw new ApiError(400, "Invalid or expired reset link", "INVALID_RESET_TOKEN");
  }

  const user = await User.findById(authToken.user).select("+password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.password = password;

  user.isVerified = true;

  user.emailVerifiedAt = user.emailVerifiedAt || new Date();

  await user.save();

  // Kill all existing sessions.
  await Session.deleteMany({ user: user._id, });

  // Consume reset/verification tokens.
  await AuthToken.deleteMany({ user: user._id, });

  return true;
};

/* =====================================================
   UPDATE PROFILE
===================================================== */

const updateProfile = async ({ userId, bio, profileImg, }) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (bio !== undefined) {
    user.bio = bio;
  }

  if (profileImg) {
    if (user.profileImgFileId) {
      await deleteImage(user.profileImgFileId);
    }

    const uploaded = await uploadImage(profileImg, "/orbit/profile-images");

    user.profileImg = uploaded.imageUrl;

    user.profileImgFileId = uploaded.imageFileId ?? uploaded.fileId ?? null;
  }

  await user.save();

  const postsCount =await Post.countDocuments({user: user._id,});

  return {
    ...sanitizeUser(user),

    postsCount,
  };
};

module.exports = {register,  login,loginWithGoogle,getMe,refresh,  logout,  logoutAll,updateProfile,verifyEmail,resendVerification,forgotPassword,resetPassword,};