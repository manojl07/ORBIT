const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");

const authMiddleware = asyncHandler(async (req, res, next) => {
  let token = null;

  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token && req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access token missing",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded;
  } catch (error) {
    // Expired, malformed, or not-yet-valid access tokens
    // must produce 401 so the client can try refreshing.
    if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError" || error.name === "NotBeforeError") {
      return res.status(401).json({
        success: false,
        message: "Access token is invalid or expired",
      });
    }

    throw error;
  }

  return next();
});

module.exports = authMiddleware;