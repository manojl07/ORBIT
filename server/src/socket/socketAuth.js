const cookie = require("cookie");
const { verifyAccessToken } = require("../utils/jwt");
const User = require("../models/user.model");

const socketAuth = async (socket, next) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie;

    if (!cookieHeader) {
      console.error("[socketAuth] Cookie header missing");
      return next(new Error("Authentication required"));
    }

    const cookies = cookie.parse(cookieHeader);



    const accessToken = cookies.accessToken;

    if (!accessToken) {
      return next(new Error("Authentication required"));
    }

    let decoded;

    // 1. Verify the JWT.
    try {
      decoded = verifyAccessToken(accessToken);
    } catch (error) {
      return next(new Error("Authentication failed"));
    }

    // 2. Check the user ID claim.
    if (!decoded?.id) {
      return next(new Error("Authentication failed"));
    }

    // 3. Confirm that the user exists.
    const user = await User.findById(decoded.id)
      .select("_id username profileImg isVerified")
      .lean();

    if (!user) {
      return next(new Error("Authentication failed"));
    }

    // 4. Attach the authenticated identity.
    socket.user = {
      id: user._id.toString(),
      username: user.username,
      profileImg: user.profileImg,
      isVerified: user.isVerified,
    };

    return next();
  } catch (error) {

    return next(new Error("Authentication failed"));
  }
};

module.exports = socketAuth;